package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	types "fluxion-shared/types"

	"github.com/gin-gonic/gin"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

func GeneratePipelineConfig(c *gin.Context) {
	var req types.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid request payload: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request payload" + err.Error()})
		return
	}
	log.Printf("Received generate request: prompt=%q, context=%+v", req.Prompt, req.ProjectContext)
	result, err := sendGenerateRequest(req.Prompt, req.ProjectContext)
	if err != nil {
		log.Printf("Failed to generate pipeline config: %v", err)
		c.JSON(500, gin.H{"error": "Failed to generate pipeline config: " + err.Error()})
		return
	}
	log.Printf("Successfully generated pipeline config for prompt=%q", req.Prompt)
	c.JSON(200, result)
}

func sendGenerateRequest(prompt string, projectContext types.ProjectContext) (types.GenerateResult, error) {
	openAiApiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(openAiApiKey),
	)

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:   "generate_result",
		Schema: GenerateSchema,
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
			Model: openai.ChatModelGPT4o,
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(GenerateSystemPrompt),
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
		return types.GenerateResult{}, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Parse the response
	var result types.GenerateResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return types.GenerateResult{}, fmt.Errorf("failed to parse OpenAI response: %w\nRaw content: %s",
			err, resp.Choices[0].Message.Content)
	}

	return result, nil

}
