package cmd

import (
	"fmt"
	"os"
)

func loadFile(file string) (string, error) {
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
