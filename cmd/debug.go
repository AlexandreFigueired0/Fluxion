package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/spf13/cobra"
)

var debugCommand = &cobra.Command{
	Use:   "debug",
	Short: "Debug your pipeline configuration",
	Long:  "Debug your pipeline configuration using AI-powered analysis",
	Run:   debugPipeline,
}

func init() {
	rootCmd.AddCommand(debugCommand)
	debugCommand.Flags().StringP("file", "f", "", "Path to your pipeline configuration file")
	debugCommand.Flags().StringP("logs", "l", "", "Path to your pipeline execution logs, with errors to assess in debugging")
	debugCommand.Flags().StringP("api-key", "k", "", "Your Fluxion key")

	debugCommand.MarkFlagRequired("file")
	debugCommand.MarkFlagRequired("logs")
}

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	logs, _ := cmd.Flags().GetString("logs")
	apiKey, _ := cmd.Flags().GetString("api-key")
	// verbose, _ := cmd.Flags().GetBool("verbose")
	// model, _ := cmd.Flags().GetString("model")

	// If no API key provided via flag, check environment variable
	if apiKey == "" {
		apiKey = os.Getenv("FLUXION_KEY")
	}

	if apiKey == "" {
		cmd.PrintErrln("Error: Fluxion key is required. Set it via --api-key flag or FLUXION_KEY environment variable.")
		return
	}

	pipelineConfig, err := loadFile(file)
	if err != nil {
		cmd.PrintErrln("Error loading pipeline configuration:", err)
		return
	}

	// Load the pipeline execution logs
	var errorLogs string
	if logs != "" {
		errorLogs, err = loadFile(logs)
		if err != nil {
			cmd.PrintErrln("Error loading pipeline execution logs:", err)
			return
		}
	}

	// Debug the pipeline configuration using AI
	analysis, err := analyzePipelineWithOpenAI(pipelineConfig, errorLogs)
	if err != nil {
		cmd.PrintErrln("Error analyzing pipeline configuration:", err)
		return
	}

	// Output the analysis results
	cmd.Println("\n🔍 Pipeline Analysis:")
	cmd.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	cmd.Printf("\n📌 Root Cause:\n%s\n\n", analysis.RootCause)
	cmd.Printf("🔧 Fix:\n%s\n\n", analysis.Fix)
	cmd.Printf("💡 Explanation:\n%s\n", analysis.Explanation)
	cmd.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

type DebugResult struct {
	RootCause   string `json:"root_cause"`
	Fix         string `json:"fix"`
	Explanation string `json:"explanation"`
}

func analyzePipelineWithOpenAI(pipelineConfig string, errorLogs string) (DebugResult, error) {
	if pipelineConfig == "" {
		return DebugResult{}, fmt.Errorf("pipeline configuration is empty")
	}

	var userPrompt string = fmt.Sprintf(`Debug this failed GitHub Actions workflow.
Workflow YAML:
%s

Error Logs:
%s

Provide the root cause, exact fix, and brief explanation.`, pipelineConfig, errorLogs)

	openAiApiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(openAiApiKey),
	)

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:   "debug_result",
		Schema: debugSchema,
		Strict: openai.Bool(true),
	}

	resp, err := client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: openai.ChatModelGPT4o,
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(debugSystemPrompt),
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
		return DebugResult{}, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Parse the response
	var result DebugResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return DebugResult{}, fmt.Errorf("failed to parse response: %w", err)
	}

	return result, nil
}
