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

func writeFile(filePath string, content string) error {
	// Write content to file
	err := os.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}
	return nil
}
