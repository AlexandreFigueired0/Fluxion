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
	debugCommand.Flags().StringP("file", "f", "", "Path to your pipeline configuration file")
	debugCommand.Flags().StringP("logs", "l", "", "Path to your pipeline execution logs, with errors to assess in debugging")
	debugCommand.Flags().String("api-key", "k", "OpenAI API key (or set OPENAI_API_KEY environment variable)")
	// debugCommand.Flags().BoolP("verbose", "v", false, "Enable verbose output")
	// debugCommand.Flags().String("model", "gpt-4", "OpenAI model to use for debugging")

	debugCommand.MarkFlagRequired("file")
	debugCommand.MarkFlagRequired("logs")
}

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	logs, _ := cmd.Flags().GetString("logs")
	// apiKey, _ := cmd.Flags().GetString("api-key")
	// verbose, _ := cmd.Flags().GetBool("verbose")
	// model, _ := cmd.Flags().GetString("model")

	// Load the pipeline configuration
	pipelineConfig, err := loadPipelineConfig(file)
	if err != nil {
		cmd.PrintErrln("Error loading pipeline configuration:", err)
		return
	}

	// Load the pipeline execution logs
	if logs != "" {
		_, err := loadPipelineConfig(logs)
		if err != nil {
			cmd.PrintErrln("Error loading pipeline execution logs:", err)
			return
		}
	}

	// Load the pipeline execution logs if provided

	// Debug the pipeline configuration using AI
	analysis, err := analyzePipelineWithOpenAI(pipelineConfig)
	if err != nil {
		cmd.PrintErrln("Error analyzing pipeline configuration:", err)
		return
	}

	// Output the analysis results
	cmd.Println("Pipeline Analysis:")
	cmd.Println(analysis)
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

func analyzePipelineWithOpenAI(pipelineConfig string) (string, error) {
	if pipelineConfig == "" {
		return "", fmt.Errorf("pipeline configuration is empty")
	}

	prompt := fmt.Sprintf(`You are an expert DevOps engineer. Analyze the following pipeline configuration strictly for issues that could cause failures
Pipeline Configuration:
%s
Please provide a structured analysis with clear recommendations and explanations.`, pipelineConfig)

	return prompt, nil
}
