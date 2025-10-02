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

	cmd.Println(prompt)

	outputPath, _ := filepath.Abs(outputPath)
	cmd.Printf("Generating CI/CD pipeline/workflow configuration at %s\n", outputPath)
	cmd.Printf("In development...\n")

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
				Description("e.g., 'GitHub Actions for a Go API with tests and Docker deployment'").
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
