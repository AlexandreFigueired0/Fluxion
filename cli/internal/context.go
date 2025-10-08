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

	runDetectors(workingDir, &ctx)

	subdirs, err := os.ReadDir(workingDir)
	if err != nil {
		return ctx, err
	}

	for _, entry := range subdirs {
		if entry.IsDir() && !strings.HasPrefix(entry.Name(), ".") {
			subdirPath := filepath.Join(workingDir, entry.Name())
			runDetectors(subdirPath, &ctx)
		}
	}

	// Check for Docker files in all locations
	dockerFiles := []string{"Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerfile"}
	filepath.Walk(workingDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		for _, df := range dockerFiles {
			if !info.IsDir() && strings.Contains(info.Name(), df) {
				relPath, _ := filepath.Rel(workingDir, path)
				ctx.DockerFiles = append(ctx.DockerFiles, relPath)
			}
		}
		return nil
	})

	// Check for existing CI/CD
	ciPath := filepath.Join(workingDir, ".github", "workflows")
	if entries, err := os.ReadDir(ciPath); err == nil {
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

func runDetectors(workingDir string, ctx *types.ProjectContext) {
	// Run all language detectors
	for _, detector := range languageDetectors {
		if langCtx, err := detector.Detect(workingDir); err == nil && langCtx != nil {
			ctx.Languages = append(ctx.Languages, langCtx.Language)
			ctx.HasTests = ctx.HasTests || langCtx.HasTests
		}
	}
}

func detectProjectStructure(workingDir string) string {
	structures := []string{}

	// Gather top-level directories
	entries, err := os.ReadDir(workingDir)
	if err != nil {
		return "unknown"
	}

	for _, entry := range entries {
		if entry.IsDir() && !strings.HasPrefix(entry.Name(), ".") {
			structures = append(structures, entry.Name()+"/")
		}
	}

	// Simple heuristics to determine structure
	if len(structures) == 0 {
		return "flat"
	}

	return strings.Join(structures, " ")
}
