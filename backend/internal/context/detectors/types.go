package detectors

// LanguageDetector is the interface that all language detectors must implement
type LanguageDetector interface {
	Name() string
	Detect(files []GitHubFileContent) *LanguageContext
}

// GitHubFileContent represents a file fetched from GitHub API
type GitHubFileContent struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	Type        string `json:"type"` // "file" or "dir"
	Size        int    `json:"size"`
	Content     string `json:"content"` // Base64 encoded
	Encoding    string `json:"encoding"`
	DownloadURL string `json:"download_url"`
}

// LanguageContext contains language-specific detection results
type LanguageContext struct {
	Language       string
	Dependencies   []string
	BuildCommand   string
	TestCommand    string
	PackageManager string
	HasTests       bool
}
