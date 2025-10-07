package shared

// ProjectContext contains detected information about the project
type ProjectContext struct {
	Languages      []string // e.g., ["Go", "JavaScript"]
	PrimaryLang    string   // Most likely primary language
	Dependencies   []string // Key dependencies detected
	HasTests       bool     // Whether test files were found
	BuildCommand   string   // Suggested build command
	TestCommand    string   // Suggested test command
	PackageManager string   // e.g., "go mod", "npm", "pip"
	Structure      string   // Project structure description
	DockerFiles    []string // Dockerfile, docker-compose.yml
	HasCI          bool     // Has existing CI/CD workflows
	ExistingCI     []string // Existing workflow files
}

type GenerateResult struct {
	PipelineConfig      string   `json:"pipeline_config"`
	PipelineDescription string   `json:"pipeline_description"`
	Assumptions         []string `json:"assumptions"`
	Requirements        []string `json:"requirements"`
	NextSteps           []string `json:"next_steps"`
}

type DebugResult struct {
	RootCause   string `json:"root_cause"`
	Fix         string `json:"fix"`
	Explanation string `json:"explanation"`
}
