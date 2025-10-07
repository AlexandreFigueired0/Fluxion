package internal

import (
	"context"
	"encoding/json"
	types "fluxion-shared/types"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

func DebugPipelineConfig(c *gin.Context) {
	var req types.DebugRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid request payload: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}
	log.Printf("Received debug request: pipelineConfig=%q, errorLogs=%q, context=%+v", req.PipelineConfig, req.ErrorLogs, req.ProjectContext)
	result, err := analyzePipelineWithOpenAI(req.PipelineConfig, req.ErrorLogs, req.ProjectContext)
	if err != nil {
		log.Printf("Failed to debug pipeline config: %v", err)
		c.JSON(500, gin.H{"error": "Failed to debug pipeline config: " + err.Error()})
		return
	}
	log.Printf("Successfully analyzed pipeline config for pipelineConfig=%q", req.PipelineConfig)
	c.JSON(200, result)
}

func analyzePipelineWithOpenAI(pipelineConfig string, errorLogs string, projectContext types.ProjectContext) (types.DebugResult, error) {
	if pipelineConfig == "" {
		return types.DebugResult{}, fmt.Errorf("pipeline configuration is empty")
	}

	// Build user prompt with optional project context
	var userPrompt string
	if projectContext.PrimaryLang != "" {
		userPrompt = fmt.Sprintf(`Debug this failed GitHub Actions workflow.

Workflow YAML:
%s

Error Logs:
%s

PROJECT CONTEXT:
%s

Provide the root cause, exact fix, and brief explanation. Consider the project type and tech stack in your analysis.`,
			pipelineConfig, errorLogs, projectContext.FormatContext())
	} else {
		userPrompt = fmt.Sprintf(`Debug this failed GitHub Actions workflow.
Workflow YAML:
%s

Error Logs:
%s

Provide the root cause, exact fix, and brief explanation.`, pipelineConfig, errorLogs)
	}

	openAiApiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(openAiApiKey),
	)

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:   "debug_result",
		Schema: DebugSchema,
		Strict: openai.Bool(true),
	}

	resp, err := client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: openai.ChatModelGPT4o,
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(DebugSystemPrompt),
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
		return types.DebugResult{}, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Parse the response
	var result types.DebugResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return types.DebugResult{}, fmt.Errorf("failed to parse response: %w", err)
	}

	return result, nil
}
