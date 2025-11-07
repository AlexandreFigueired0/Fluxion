package types

import "encoding/json"

type GenerateResult struct {
	PipelineConfig      string          `json:"pipeline_config"`
	PipelineJSON        json.RawMessage `json:"pipeline_json"`
	PipelineDescription string          `json:"pipeline_description"`
	Assumptions         []string        `json:"assumptions"`
	Requirements        []string        `json:"requirements"`
	NextSteps           []string        `json:"next_steps"`
}

type GenerateRequest struct {
	Prompt         string         `json:"prompt"`
	ProjectContext ProjectContext `json:"project_context"`
}
