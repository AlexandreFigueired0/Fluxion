package cmd

import (
	"bytes"
	"encoding/json"
	types "fluxion-shared/types"
	"fluxion/internal"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

const generateEndpoint = "http://localhost:8080/generate"

var (
	outputPath string
	promptPath string
	apiKey     string
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
	generateCmd.Flags().StringVarP(&apiKey, "api-key", "k", "", "Your Fluxion key (can also be set via FLUXION_KEY env var)")
}

func generateConfiguration(cmd *cobra.Command, args []string) {
	var prompt string
	var err error

	// Get API key from flag or environment
	if apiKey == "" {
		apiKey = os.Getenv("FLUXION_KEY")
	}
	if apiKey == "" {
		cmd.PrintErrln("Error: Fluxion key is required. Set it via --api-key flag or FLUXION_KEY environment variable.")
		return
	}
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

	generatedConfig, err := sendGenerateRequest(prompt, projectContext, apiKey)
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

func sendGenerateRequest(prompt string, projectContext types.ProjectContext, apiKey string) (types.GenerateResult, error) {
	// Prepare request payload
	payload := types.GenerateRequest{
		Prompt:         prompt,
		ProjectContext: projectContext,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return types.GenerateResult{}, fmt.Errorf("failed to marshal request payload: %w", err)
	}

	spinner := internal.NewSpinner("Generating pipeline...")
	spinner.Start()
	defer spinner.Stop()

	// Create request with Authorization header
	req, err := http.NewRequest("POST", generateEndpoint, bytes.NewBuffer(body))
	if err != nil {
		return types.GenerateResult{}, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return types.GenerateResult{}, fmt.Errorf("failed to send request to backend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return types.GenerateResult{}, fmt.Errorf("backend returned status: %s", resp.Status)
	}

	var result types.GenerateResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return types.GenerateResult{}, fmt.Errorf("failed to decode backend response: %w", err)
	}

	return result, nil
}
