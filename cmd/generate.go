package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"fluxion/internal"

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
		values, err := internal.RunTextInteractiveMode([]internal.TextInteractive{
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
		prompt, err = internal.LoadFile(promptPath)
		if err != nil {
			cmd.PrintErrln("❌ Error loading prompt file:", err)
			return
		}
	}

	outputPath, _ := filepath.Abs(outputPath)

	// Detect project context
	workingDir, err := os.Getwd()
	if err != nil {
		workingDir = "."
	}
	projectContext, err := internal.DetectProjectContext(workingDir)
	if err != nil {
		// Non-fatal: continue without context
		cmd.PrintErrln("⚠️  Warning: Could not detect project context:", err)
	}

	// Show detected context to user
	if projectContext.PrimaryLang != "" {
		cmd.Println("\n🔍 Detected Project Context:")
		cmd.Println("───────────────────────────────────────────────────────────────")
		cmd.Println(projectContext.FormatContext())
		cmd.Println("───────────────────────────────────────────────────────────────")
		cmd.Println()
	}

	generatedConfig, err := generatePipelineConfig(prompt, projectContext)
	if err != nil {
		cmd.PrintErrln("❌ Error generating pipeline configuration:", err)
		return
	}

	// Write the generated configuration to the specified output file
	err = internal.WriteFile(outputPath, generatedConfig.PipelineConfig)
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

func generatePipelineConfig(prompt string, projectContext internal.ProjectContext) (GenerateResult, error) {
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
%s

Generate a workflow that is specifically tailored to this project type, uses the correct build/test commands, and follows best practices.`,
			prompt, projectContext.FormatContext())
	} else {
		// Fallback to simple prompt if no context detected
		userPrompt = "Create a GitHub Actions workflow based on the following prompt:\n" + prompt
	}

	resp, err := client.Chat.Completions.New(
		context.Background(),
		openai.ChatCompletionNewParams{
			Model: openai.ChatModelGPT4o,
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
