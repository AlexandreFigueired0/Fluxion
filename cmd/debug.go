package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
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
// 	debugCommand.Flags().BoolP("verbose", "v", false, "Enable verbose output")
// 	debugCommand.Flags().String("model", "gpt-4", "OpenAI model to use for debugging")
// }

func debugPipeline(cmd *cobra.Command, args []string) {
	file, _ := cmd.Flags().GetString("file")
	apiKey, _ := cmd.Flags().GetString("api-key")
}