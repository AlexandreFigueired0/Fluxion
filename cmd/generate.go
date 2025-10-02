package cmd

import (
	"path/filepath"

	"github.com/charmbracelet/huh"
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
	if shouldUseInteractiveMode() {
		prompt, err = runInteractiveMode()

		if err != nil {
			cmd.PrintErrln("Error during interactive prompt:", err)
			return
		}
	}

	if prompt == "" {
		prompt, err = loadFile(promptPath)
		if err != nil {
			cmd.PrintErrln("Error loading prompt file:", err)
			return
		}
	}

	outputPath, _ := filepath.Abs(outputPath)

	generatedConfig, err := generatePipelineConfig(prompt)
	if err != nil {
		cmd.PrintErrln("Error generating pipeline configuration:", err)
		return
	}

	// Write the generated configuration to the specified output file

	err = writeFile(outputPath, generatedConfig)
	if err != nil {
		cmd.PrintErrln("Error writing generated configuration to file:", err)
		return
	}
}

func generatePipelineConfig(prompt string) (string, error) {

}

func shouldUseInteractiveMode() bool {
	return promptPath == ""
}

func runInteractiveMode() (string, error) {
	var prompt string
	form := huh.NewForm(
		huh.NewGroup(
			huh.NewText().
				Title("Describe your CI/CD pipeline").
				Placeholder("Enter your pipeline description...").
				CharLimit(500).
				Value(&prompt),
		),
	)

	err := form.Run()

	if err != nil {
		return "", err
	}
	return prompt, nil
}
