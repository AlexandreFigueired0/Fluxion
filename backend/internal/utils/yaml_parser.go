package utils

import (
	"encoding/json"
	"fmt"

	"github.com/goccy/go-yaml"
)

// ParseYAMLToPipelineJSON converts a GitHub Actions YAML string to JSON
func ParseYAMLToPipelineJSON(yamlStr string) (json.RawMessage, error) {
	// Parse YAML string
	var parsed map[string]interface{}
	if err := yaml.Unmarshal([]byte(yamlStr), &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse YAML: %w", err)
	}

	if parsed == nil {
		return nil, fmt.Errorf("invalid YAML: empty document")
	}

	// Convert to JSON
	jsonBytes, err := json.Marshal(parsed)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal to JSON: %w", err)
	}

	return json.RawMessage(jsonBytes), nil
}
