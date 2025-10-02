package cmd

var debugSchema = map[string]interface{}{
	"type": "object",
	"properties": map[string]interface{}{
		"root_cause": map[string]interface{}{
			"type":        "string",
			"description": "Brief explanation of what caused the failure",
		},
		"fix": map[string]interface{}{
			"type":        "string",
			"description": "Exact code change or command needed to fix it",
		},
		"explanation": map[string]interface{}{
			"type":        "string",
			"description": "Why this fix works (1-2 sentences max)",
		},
	},
	"required":             []string{"root_cause", "fix", "explanation"},
	"additionalProperties": false,
}

var generateSchema = map[string]interface{}{
	"type": "object",
	"properties": map[string]interface{}{
		"pipeline_config": map[string]interface{}{
			"type":        "string",
			"description": "The complete GitHub Actions workflow YAML configuration",
		},
		"pipeline_description": map[string]interface{}{
			"type":        "string",
			"description": "A brief description of the generated pipeline",
		},
		"assumptions": map[string]interface{}{
			"type":        "array",
			"items":       map[string]interface{}{"type": "string"},
			"description": "Any assumptions made while generating the pipeline",
		},
		"requirements": map[string]interface{}{
			"type":        "array",
			"items":       map[string]interface{}{"type": "string"},
			"description": "Key requirements that the pipeline fulfills",
		},
		"next_steps": map[string]interface{}{
			"type":        "array",
			"items":       map[string]interface{}{"type": "string"},
			"description": "Recommended next steps after generating the pipeline",
		},
	},
	"required":             []string{"pipeline_config", "pipeline_description", "assumptions", "requirements", "next_steps"},
	"additionalProperties": false,
}
