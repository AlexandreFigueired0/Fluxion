package internal

import (
	"context"
	"encoding/json"
	shared "fluxion-shared"
	"fmt"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

func analyzePipelineWithOpenAI(pipelineConfig string, errorLogs string, projectContext shared.ProjectContext) (shared.DebugResult, error) {
	if pipelineConfig == "" {
		return shared.DebugResult{}, fmt.Errorf("pipeline configuration is empty")
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
		return shared.DebugResult{}, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Parse the response
	var result shared.DebugResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return shared.DebugResult{}, fmt.Errorf("failed to parse response: %w", err)
	}

	return result, nil
}
