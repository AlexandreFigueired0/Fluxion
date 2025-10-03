package cmd

import (
	"fmt"
	"os"

	"github.com/charmbracelet/huh"
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

type TextInteractive struct {
	Title       string
	Description string
	Placeholder string
}

func runTextInteractiveMode(fields []TextInteractive) ([]string, error) {
	var values []string
	for _, field := range fields {
		var value string
		form := huh.NewForm(
			huh.NewGroup(
				huh.NewText().
					Title(field.Title).
					Description(field.Description).
					Placeholder(field.Placeholder).
					Validate(func(input string) error {
						if input == "" {
							return fmt.Errorf("input cannot be empty")
						}
						return nil
					}).
					Value(&value),
			),
		)

		err := form.Run()
		if err != nil {
			return nil, err
		}
		values = append(values, value)
	}
	return values, nil
}
