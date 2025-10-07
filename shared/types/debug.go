package types

type DebugResult struct {
	RootCause   string `json:"root_cause"`
	Fix         string `json:"fix"`
	Explanation string `json:"explanation"`
}

type DebugRequest struct {
	PipelineConfig string         `json:"pipeline_config"`
	ErrorLogs      string         `json:"error_logs"`
	ProjectContext ProjectContext `json:"project_context"`
}
