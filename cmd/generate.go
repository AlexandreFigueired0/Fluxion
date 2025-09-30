package cmd

import (
	"path/filepath"

	"github.com/spf13/cobra"
)

var generateCmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate CI/CD pipeline/workflow configuration",
	Long:  `Generate CI/CD pipeline/workflow configuration based on user specifications.`,
	Run:   generateConfiguration,
}

func init() {
	rootCmd.AddCommand(generateCmd)

	generateCmd.Flags().StringP("output", "o", "pipeline.yml", "Output file for the generated configuration")
}

func generateConfiguration(cmd *cobra.Command, args []string) {
	output, _ := cmd.Flags().GetString("output")

	outputPath, _ := filepath.Abs(output)
	// Here you would add the logic to generate the configuration
	// For demonstration, we just print the output path
	cmd.Printf("Generating CI/CD pipeline/workflow configuration at %s\n", outputPath)

}
