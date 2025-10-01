package cmd

import (
	"fmt"
	"os"

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
	debugCommand.Flags().StringP("file", "f", "pipeline.yaml", "Path to your pipeline configuration file")
	debugCommand.Flags().String("api-key", "", "OpenAI API key (or set OPENAI_API_KEY environment variable)")
	// debugCommand.Flags().BoolP("verbose", "v", false, "Enable verbose output")
	// debugCommand.Flags().String("model", "gpt-4", "OpenAI model to use for debugging")
}

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	// apiKey, _ := cmd.Flags().GetString("api-key")
	// verbose, _ := cmd.Flags().GetBool("verbose")
	// model, _ := cmd.Flags().GetString("model")

	// Load and validate the pipeline configuration
	pipelineConfig, err := loadPipelineConfig(file)
	if err != nil {
		cmd.PrintErrln("Error loading pipeline configuration:", err)
		return
	}

	fmt.Println(pipelineConfig)
}

func loadPipelineConfig(file string) (string, error) {
	if file == "" {
		return "", fmt.Errorf("file path cannot be empty")
	}

	// Read file
	data, err := os.ReadFile(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	return string(data), nil
}
