package internal

import (
	"fluxion/internal/detectors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ProjectContext contains detected information about the project
type ProjectContext struct {
	Languages      []string // e.g., ["Go", "JavaScript"]
	PrimaryLang    string   // Most likely primary language
	Framework      string   // e.g., "Cobra CLI", "Express", "Flask"
	Dependencies   []string // Key dependencies detected
	HasTests       bool     // Whether test files were found
	BuildCommand   string   // Suggested build command
	TestCommand    string   // Suggested test command
	PackageManager string   // e.g., "go mod", "npm", "pip"
	Structure      string   // Project structure description
	DockerFiles    []string // Dockerfile, docker-compose.yml
	ConfigFiles    []string // Detected config files
	HasCI          bool     // Has existing CI/CD workflows
	ExistingCI     []string // Existing workflow files
}

var languageDetectors = []detectors.LanguageDetector{
	&detectors.GoDetector{},     // Detects Go projects (checks for go.mod)
	&detectors.NodeDetector{},   // Detects Node.js projects (checks for package.json)
	&detectors.PythonDetector{}, // Detects Python projects (checks for requirements.txt, etc.)
}

// DetectProjectContext scans the working directory to understand the project
func DetectProjectContext(workingDir string) (ProjectContext, error) {
	ctx := ProjectContext{
		Languages:    make([]string, 0),
		Dependencies: make([]string, 0),
		DockerFiles:  make([]string, 0),
		ConfigFiles:  make([]string, 0),
		ExistingCI:   make([]string, 0),
	}

	// Run all language detectors
	for _, detector := range languageDetectors {
		if langCtx, err := detector.Detect(workingDir); err == nil && langCtx != nil {
			ctx.Languages = append(ctx.Languages, langCtx.Language)

			// First detected language becomes primary
			if ctx.PrimaryLang == "" {
				ctx.PrimaryLang = langCtx.Language
				ctx.Framework = langCtx.Framework
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
		"cmd":      "cmd/ pattern",
		"src":      "src/ pattern",
		"internal": "internal/ packages",
		"pkg":      "pkg/ pattern",
		"api":      "API project",
		"web":      "web application",
		"services": "microservices",
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

// FormatContext formats the project context into a human-readable string for prompts
func (ctx *ProjectContext) FormatContext() string {
	var parts []string

	if ctx.PrimaryLang != "" {
		parts = append(parts, fmt.Sprintf("- Primary Language: %s", ctx.PrimaryLang))
	}

	if len(ctx.Languages) > 1 {
		parts = append(parts, fmt.Sprintf("- Languages: %s", strings.Join(ctx.Languages, ", ")))
	}

	if ctx.PackageManager != "" {
		parts = append(parts, fmt.Sprintf("- Package Manager: %s", ctx.PackageManager))
	}

	if ctx.BuildCommand != "" {
		parts = append(parts, fmt.Sprintf("- Build Command: %s", ctx.BuildCommand))
	}

	if ctx.TestCommand != "" {
		parts = append(parts, fmt.Sprintf("- Test Command: %s", ctx.TestCommand))
	}

	if len(ctx.Dependencies) > 0 {
		deps := ctx.Dependencies
		displayDeps := deps

		if len(deps) > 20 {
			// Filter to most likely important dependencies
			important := filterImportantDependencies(deps)

			// If filtering got us under 30, use filtered list
			// Otherwise take first 20 + note there are more
			if len(important) <= 30 {
				displayDeps = important
				parts = append(parts, fmt.Sprintf("- Key Dependencies (%d total): %s", len(deps), strings.Join(displayDeps, ", ")))
			} else {
				displayDeps = deps[:20]
				parts = append(parts, fmt.Sprintf("- Dependencies (showing 20 of %d): %s", len(deps), strings.Join(displayDeps, ", ")))
			}
		} else {
			// Small project, send everything
			parts = append(parts, fmt.Sprintf("- Dependencies: %s", strings.Join(displayDeps, ", ")))
		}
	}

	parts = append(parts, fmt.Sprintf("- Has Tests: %v", ctx.HasTests))

	if ctx.Structure != "" {
		parts = append(parts, fmt.Sprintf("- Project Structure: %s", ctx.Structure))
	}

	if len(ctx.DockerFiles) > 0 {
		parts = append(parts, fmt.Sprintf("- Docker: %s", strings.Join(ctx.DockerFiles, ", ")))
	}

	if ctx.HasCI {
		parts = append(parts, fmt.Sprintf("- Existing CI/CD: %s", strings.Join(ctx.ExistingCI, ", ")))
	}

	return strings.Join(parts, "\n")
}

// filterImportantDependencies identifies likely important dependencies
// Important deps are typically: frameworks, main libraries, not test/build tools
func filterImportantDependencies(deps []string) []string {
	important := make([]string, 0)

	// Signals that a dependency is likely important
	importantSignals := []string{
		"framework", "server", "client", "api", "web", "http", "grpc",
		"database", "db", "sql", "mongo", "redis", "postgres",
		"auth", "jwt", "oauth", "security",
		"cli", "cobra", "command",
		"router", "mux", "gin", "echo", "fiber", "express", "nest",
		"react", "vue", "angular", "next", "nuxt", "svelte",
		"django", "flask", "fastapi", "rails", "spring",
	}

	// Signals that a dependency is likely NOT important (test/build tools)
	unimportantSignals := []string{
		"test", "mock", "stub", "assert", "chai", "jest", "mocha",
		"lint", "prettier", "eslint", "format",
		"dev", "webpack", "babel", "rollup", "esbuild",
		"types", "@types", "typescript",
	}

	for _, dep := range deps {
		depLower := strings.ToLower(dep)

		// Check if it has unimportant signals
		isUnimportant := false
		for _, signal := range unimportantSignals {
			if strings.Contains(depLower, signal) {
				isUnimportant = true
				break
			}
		}

		if isUnimportant {
			continue // Skip this dependency
		}

		// Check if it has important signals OR is near the top
		// (first 10 deps are usually the most important direct ones)
		hasImportantSignal := false
		for _, signal := range importantSignals {
			if strings.Contains(depLower, signal) {
				hasImportantSignal = true
				break
			}
		}

		if hasImportantSignal || len(important) < 10 {
			important = append(important, dep)
		}
	}

	return important
}
