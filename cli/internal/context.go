package internal

import (
	types "fluxion-shared/types"
	"fluxion/internal/detectors"
	"os"
	"path/filepath"
	"strings"
)

var languageDetectors = []detectors.LanguageDetector{
	&detectors.GoDetector{},     // Detects Go projects (checks for go.mod)
	&detectors.NodeDetector{},   // Detects Node.js projects (checks for package.json)
	&detectors.PythonDetector{}, // Detects Python projects (checks for requirements.txt, etc.)
}

// DetectProjectContext scans the working directory to understand the project
func DetectProjectContext(workingDir string) (types.ProjectContext, error) {
	ctx := types.ProjectContext{
		Languages:    make([]string, 0),
		Dependencies: make([]string, 0),
		DockerFiles:  make([]string, 0),
		ExistingCI:   make([]string, 0),
	}

	// Run all language detectors
	for _, detector := range languageDetectors {
		if langCtx, err := detector.Detect(workingDir); err == nil && langCtx != nil {
			ctx.Languages = append(ctx.Languages, langCtx.Language)

			// First detected language becomes primary
			if ctx.PrimaryLang == "" {
				ctx.PrimaryLang = langCtx.Language
				ctx.Dependencies = langCtx.Dependencies
				ctx.BuildCommand = langCtx.BuildCommand
				ctx.TestCommand = langCtx.TestCommand
				ctx.PackageManager = langCtx.PackageManager
				ctx.HasTests = langCtx.HasTests
			} else {
				// Merge additional language info
				ctx.HasTests = ctx.HasTests || langCtx.HasTests
			}
		}
	}

	// Check for Docker
	dockerFiles := []string{"Dockerfile", "docker-compose.yml", "docker-compose.yaml"}
	for _, df := range dockerFiles {
		if _, err := os.Stat(filepath.Join(workingDir, df)); err == nil {
			ctx.DockerFiles = append(ctx.DockerFiles, df)
		}
	}

	// Check for existing CI/CD
	ciPath := filepath.Join(workingDir, ".github", "workflows")
	if entries, err := os.ReadDir(ciPath); err == nil {
		ctx.HasCI = true
		for _, entry := range entries {
			if !entry.IsDir() && (strings.HasSuffix(entry.Name(), ".yml") || strings.HasSuffix(entry.Name(), ".yaml")) {
				ctx.ExistingCI = append(ctx.ExistingCI, entry.Name())
			}
		}
	}

	// Detect project structure
	ctx.Structure = detectProjectStructure(workingDir)

	return ctx, nil
}

// =============================================================================
// Helper Functions
// =============================================================================

func detectProjectStructure(workingDir string) string {
	structures := []string{}

	// Check common structure patterns
	patterns := map[string]string{
		"cmd":      "cmd/",
		"internal": "internal/",
		"pkg":      "pkg/",
		"api":      "api/",
		"web":      "web/",
		"services": "services/",
		"apps":     "apps/",
		"packages": "packages/",
	}

	for dir, description := range patterns {
		if _, err := os.Stat(filepath.Join(workingDir, dir)); err == nil {
			structures = append(structures, description)
		}
	}

	if len(structures) > 0 {
		return strings.Join(structures, ", ")
	}

	return "flat structure"
}
