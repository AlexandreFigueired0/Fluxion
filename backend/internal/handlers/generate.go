package handlers

import (
	"context"
	"encoding/json"
	"fluxion-be/internal"
	db "fluxion-be/internal/db"
	"fluxion-be/internal/utils"
	"fmt"
	"log"
	"net/http"
	"os"

	types "fluxion-shared/types"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	supa "github.com/supabase-community/supabase-go"
)

const (
	inputRate  = 1.25 // $1.25 per 1M tokens
	outputRate = 10.0 // $10.00 per 1M tokens
)

type GenerateHandler struct {
	DB *supa.Client
}

func (h *GenerateHandler) GeneratePipelineConfig(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	userID := fmt.Sprintf("%v", userClaims["id"])

	user, err := db.GetUserByID(userID, h.DB)
	if err != nil {
		log.Printf("Failed to load user %s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}

	if user.Credits <= 0 {
		log.Printf("User %s attempted generate without credits", userID)
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "insufficient credits"})
		return
	}

	var req types.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid request payload: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request payload" + err.Error()})
		return
	}
	log.Printf("Received generate request: user_id=%s, prompt=%q, context=%+v", userID, req.Prompt, req.ProjectContext)
	result, cost, err := sendGenerateRequest(req.Prompt, req.ProjectContext)
	if err != nil {
		log.Printf("Failed to generate pipeline config: %v", err)
		c.JSON(500, gin.H{"error": "Failed to generate pipeline config: " + err.Error()})
		return
	}

	if _, err := db.UpdateUserCredits(user.ID, user.Credits-cost, h.DB); err != nil {
		log.Printf("Failed to deduct credits for user %s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user credits"})
		return
	}

	// Parse the generated YAML to Pipeline JSON
	if result.PipelineConfig != "" {
		pipelineJSON, err := utils.ParseYAMLToPipelineJSON(result.PipelineConfig)
		if err != nil {
			log.Printf("Warning: Failed to parse generated YAML to pipeline JSON: %v", err)
			// Don't fail - still return the result with YAML even if parsing failed
		} else {
			result.PipelineJSON = pipelineJSON
		}
	}

	log.Printf("Successfully generated pipeline config for prompt=%q", req.Prompt)
	c.JSON(200, result)
}

func sendGenerateRequest(prompt string, projectContext types.ProjectContext) (types.GenerateResult, float64, error) {
	openAiApiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(openAiApiKey),
	)

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:   "generate_result",
		Schema: internal.GenerateSchema,
		Strict: openai.Bool(true),
	}

	// Build enhanced user prompt with project context
	var userPrompt string
	if projectContext.PrimaryLang != "" {
		userPrompt = fmt.Sprintf(`Create a GitHub Actions workflow for this project.

USER REQUEST:
%s

PROJECT CONTEXT:
Primary Language: %s
Dependencies: %v
Build Command: %s
Test Command: %s
Package Manager: %s
Structure: %s
DockerFiles: %v
ExistingCI: %v

Generate a workflow that is specifically tailored to this project type, uses the correct build/test commands, and follows best practices.`,
			prompt, projectContext.PrimaryLang, projectContext.Dependencies, projectContext.BuildCommand, projectContext.TestCommand, projectContext.PackageManager, projectContext.Structure, projectContext.DockerFiles, projectContext.ExistingCI)
	} else {
		// Fallback to simple prompt if no context detected
		userPrompt = "Create a GitHub Actions workflow based on the following prompt:\n" + prompt
	}

	resp, err := client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: "gpt-5",
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(internal.GenerateSystemPrompt),
				openai.UserMessage(userPrompt),
			},
			ResponseFormat: openai.ChatCompletionNewParamsResponseFormatUnion{
				OfJSONSchema: &openai.ResponseFormatJSONSchemaParam{
					JSONSchema: schemaParam,
				},
			},
		},
	)

	if err != nil {
		return types.GenerateResult{}, 0, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Calculate the cost
	usage := resp.Usage
	inputTokens := usage.PromptTokens
	outputTokens := usage.CompletionTokens
	cost := EstimateCost(inputTokens, outputTokens,
		inputRate, outputRate)

	// Parse the response
	var result types.GenerateResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return types.GenerateResult{}, 0, fmt.Errorf("failed to parse OpenAI response: %w\nRaw content: %s",
			err, resp.Choices[0].Message.Content)
	}

	return result, cost, nil

}

func EstimateCost(inputTokens, outputTokens int64, inputRate, outputRate float64) float64 {
	return (float64(inputTokens)/1000_000.0)*inputRate +
		(float64(outputTokens)/1000_000.0)*outputRate
}
