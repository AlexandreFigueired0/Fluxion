package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "fluxion",
	Short: "Fluxion is CLI application  that generates, debugs, optimizes, and secures CI/CD pipelines/workflows.",
	Long:  `Fluxion is CLI application  that generates, debugs, optimizes, and secures CI/CD pipelines/workflows.`,
}

func init() {
	// Hide completion command from help but keep functionality
	rootCmd.CompletionOptions.HiddenDefaultCmd = true
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
