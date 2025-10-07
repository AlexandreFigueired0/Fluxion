package types

type GenerateResult struct {
	PipelineConfig      string   `json:"pipeline_config"`
	PipelineDescription string   `json:"pipeline_description"`
	Assumptions         []string `json:"assumptions"`
	Requirements        []string `json:"requirements"`
	NextSteps           []string `json:"next_steps"`
}
