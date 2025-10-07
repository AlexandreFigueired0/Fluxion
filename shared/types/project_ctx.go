package types

import (
	"fmt"
	"strings"
)

// ProjectContext contains detected information about the project
type ProjectContext struct {
	Languages      []string `json:"languages"`       // e.g., ["Go", "JavaScript"]
	PrimaryLang    string   `json:"primary_lang"`    // Most likely primary language
	Dependencies   []string `json:"dependencies"`    // Key dependencies detected
	HasTests       bool     `json:"has_tests"`       // Whether test files were found
	BuildCommand   string   `json:"build_command"`   // Suggested build command
	TestCommand    string   `json:"test_command"`    // Suggested test command
	PackageManager string   `json:"package_manager"` // e.g., "go mod", "npm", "pip"
	Structure      string   `json:"structure"`       // Project structure description
	DockerFiles    []string `json:"docker_files"`    // Dockerfile, docker-compose.yml
	HasCI          bool     `json:"has_ci"`          // Has existing CI/CD workflows
	ExistingCI     []string `json:"existing_ci"`     // Existing workflow files
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
