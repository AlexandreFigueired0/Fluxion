package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/spf13/cobra"
)

var (
	outputPath string
	promptPath string
)

var generateCmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate CI/CD pipeline/workflow configuration",
	Long:  `Generate CI/CD pipeline/workflow configuration based on user specifications.`,
	Run:   generateConfiguration,
}

func init() {
	rootCmd.AddCommand(generateCmd)

	generateCmd.Flags().StringVarP(&outputPath, "output", "o", "./generated_pipeline.yml", "Output path for the generated configuration file")
	generateCmd.Flags().StringVarP(&promptPath, "prompt_file", "p", "", "Path to a file containing the pipeline description prompt")
}

func generateConfiguration(cmd *cobra.Command, args []string) {
	var prompt string
	var err error
	if promptPath == "" {
		values, err := runTextInteractiveMode([]TextInteractive{
			{
				Title:       "Pipeline Description",
				Description: "Describe the CI/CD pipeline you want to create.",
				Placeholder: "e.g., Build and test a Go application on every push...",
			},
		})

		if err != nil {
			cmd.PrintErrln("❌ Error during interactive prompt:", err)
			return
		}
		prompt = values[0]
	} else {
		// Load prompt from file
		prompt, err = loadFile(promptPath)
		if err != nil {
			cmd.PrintErrln("❌ Error loading prompt file:", err)
			return
		}
	}

	outputPath, _ := filepath.Abs(outputPath)

	generatedConfig, err := generatePipelineConfig(prompt)
	if err != nil {
		cmd.PrintErrln("❌ Error generating pipeline configuration:", err)
		return
	}

	// Write the generated configuration to the specified output file
	err = writeFile(outputPath, generatedConfig.PipelineConfig)
	if err != nil {
		cmd.PrintErrln("❌ Error writing generated configuration to file:", err)
		return
	}

	// Display summary to user with embellished formatting
	cmd.Println("\n" + "═══════════════════════════════════════════════════════════════")
	cmd.Println("✨ Pipeline Generation Complete!")
	cmd.Println("═══════════════════════════════════════════════════════════════")
	cmd.Println()

	cmd.Println("📋 Pipeline Description:")
	cmd.Println("   " + generatedConfig.PipelineDescription)
	cmd.Println()

	if len(generatedConfig.Assumptions) > 0 {
		cmd.Println("💭 Assumptions:")
		for i, assumption := range generatedConfig.Assumptions {
			cmd.Printf("   %d. %s\n", i+1, assumption)
		}
		cmd.Println()
	}

	if len(generatedConfig.Requirements) > 0 {
		cmd.Println("📦 Requirements:")
		for i, requirement := range generatedConfig.Requirements {
			cmd.Printf("   %d. %s\n", i+1, requirement)
		}
		cmd.Println()
	}

	if len(generatedConfig.NextSteps) > 0 {
		cmd.Println("🚀 Next Steps:")
		for i, step := range generatedConfig.NextSteps {
			cmd.Printf("   %d. %s\n", i+1, step)
		}
		cmd.Println()
	}

	cmd.Println("───────────────────────────────────────────────────────────────")
	cmd.Printf("✅ Configuration saved to: %s\n", outputPath)
	cmd.Println("───────────────────────────────────────────────────────────────")
	cmd.Println()

}

type GenerateResult struct {
	PipelineConfig      string   `json:"pipeline_config"`
	PipelineDescription string   `json:"pipeline_description"`
	Assumptions         []string `json:"assumptions"`
	Requirements        []string `json:"requirements"`
	NextSteps           []string `json:"next_steps"`
}

func generatePipelineConfig(prompt string) (GenerateResult, error) {
	openAiApiKey := os.Getenv("OPENAI_API_KEY")
	client := openai.NewClient(
		option.WithAPIKey(openAiApiKey),
	)

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:   "generate_result",
		Schema: generateSchema,
		Strict: openai.Bool(true),
	}

	userPrompt := "Create a GitHub Actions workflow based on the following prompt:\n" + prompt

	resp, err := client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: openai.ChatModelGPT4o,
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(generateSystemPrompt),
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
		return GenerateResult{}, fmt.Errorf("OpenAI API error: %w", err)
	}

	// Parse the response
	var result GenerateResult
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		return GenerateResult{}, fmt.Errorf("failed to parse OpenAI response: %w\nRaw content: %s",
			err, resp.Choices[0].Message.Content)
	}

	return result, nil

}
