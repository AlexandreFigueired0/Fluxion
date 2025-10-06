package detectors

// LanguageDetector is the interface that all language detectors must implement
type LanguageDetector interface {
	Name() string
	Detect(workingDir string) (*LanguageContext, error)
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
