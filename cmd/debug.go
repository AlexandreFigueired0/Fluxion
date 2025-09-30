package cmd

import (
	"github.com/spf13/cobra"
)

var debugCommand = &cobra.Command{
	Use:   "debug",
	Short: "Debug your pipeline configuration",
	Long:  "Debug your pipeline configuration",
	Run:   debugPipeline,
}

func init() {
	rootCmd.AddCommand(debugCommand)
	debugCommand.Flags().StringP("file", "f", "pipeline.yaml", "Path to your pipeline configuration file")
}

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	cmd.Printf("Debugging pipeline configuration from %s\n", file)
	cmd.Printf("In development...\n")
}
