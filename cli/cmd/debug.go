package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	types "fluxion-shared/types"
	"fluxion/internal"

	"github.com/spf13/cobra"
)

const debugEndpoint = "http://localhost:8080/api/debug"

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
	debugCommand.Flags().StringP("api-key", "k", "", "Your Fluxion key (can also be set via FLUXION_KEY env var)")

}

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	logs, _ := cmd.Flags().GetString("logs")
	apiKey, _ := cmd.Flags().GetString("api-key")

	// If no API key provided via flag, check environment variable
	if apiKey == "" {
		apiKey = os.Getenv("FLUXION_KEY")
	}

	if apiKey == "" {
		cmd.PrintErrln("Error: Fluxion key is required. Set it via --api-key flag or FLUXION_KEY environment variable.")
		return
	}

	if file == "" || logs == "" {
		values, err := internal.RunTextInteractiveMode([]internal.TextInteractive{
			{
				Title:       "Pipeline Configuration File",
				Description: "Enter the path to your pipeline configuration file.",
				Placeholder: "./.github/workflows/ci.yml",
			},
			{
				Title:       "Pipeline Execution Logs",
				Description: "Enter the path to your pipeline execution logs containing errors.",
				Placeholder: "./logs.txt",
			},
		})

		if err != nil {
			cmd.PrintErrln("❌ Error during interactive prompt:", err)
			return
		}

		if file == "" {
			file = values[0]
		}
		if logs == "" {
			logs = values[1]
		}
	}

	pipelineConfig, err := internal.LoadFile(file)
	if err != nil {
		cmd.PrintErrln("Error loading pipeline configuration:", err)
		return
	}

	// Load the pipeline execution logs
	errorLogs, err := internal.LoadFile(logs)
	if err != nil {
		cmd.PrintErrln("❌ Error loading pipeline execution logs:", err)
		return
	}

	// Detect project context (helpful for better debugging)
	workingDir, err := os.Getwd()
	if err != nil {
		workingDir = "."
	}
	projectContext, err := internal.DetectProjectContext(workingDir)
	if err != nil {
		// Non-fatal: continue without context
		projectContext = types.ProjectContext{} // Empty context
	}

	// Debug the pipeline configuration using AI
	analysis, err := sendDebugRequest(pipelineConfig, errorLogs, projectContext, apiKey)
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

func sendDebugRequest(pipelineConfig string, errorLogs string, projectContext types.ProjectContext, apiKey string) (types.DebugResult, error) {
	// Create the request payload
	payload := types.DebugRequest{
		PipelineConfig: pipelineConfig,
		ErrorLogs:      errorLogs,
		ProjectContext: projectContext,
	}
	// Prepare JSON body
	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return types.DebugResult{}, fmt.Errorf("failed to marshal JSON: %w", err)
	}

	spinner := internal.NewSpinner("Analyzing pipeline...")
	spinner.Start()
	defer spinner.Stop()

	// Create request with Authorization header
	req, err := http.NewRequest("POST", debugEndpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return types.DebugResult{}, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return types.DebugResult{}, fmt.Errorf("failed to send request to backend: %w", err)
	}
	defer response.Body.Close()

	// Check for non-200 status codes
	if response.StatusCode != http.StatusOK {
		return types.DebugResult{}, fmt.Errorf("backend returned status code %d", response.StatusCode)
	}

	// Decode the JSON response
	var result types.DebugResult
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return types.DebugResult{}, fmt.Errorf("failed to decode JSON response: %w", err)
	}

	return result, nil
}
