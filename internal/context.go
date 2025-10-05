package internal

import (
	"bufio"
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

type LanguageDetector interface {
	Name() string
	Detect(workingDir string) (*LanguageContext, error)
}

// LanguageContext contains language-specific detection results
type LanguageContext struct {
	Language       string
	Framework      string
	Dependencies   []string
	BuildCommand   string
	TestCommand    string
	PackageManager string
	HasTests       bool
}

var languageDetectors = []LanguageDetector{
	&GoDetector{},     // Detects Go projects (checks for go.mod)
	&NodeDetector{},   // Detects Node.js projects (checks for package.json)
	&PythonDetector{}, // Detects Python projects (checks for requirements.txt, etc.)
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
// Go Language Detector
// =============================================================================

type GoDetector struct{}

func (d *GoDetector) Name() string {
	return "Go"
}

func (d *GoDetector) Detect(workingDir string) (*LanguageContext, error) {
	goModPath := filepath.Join(workingDir, "go.mod")
	if _, err := os.Stat(goModPath); err != nil {
		return nil, err
	}

	ctx := &LanguageContext{
		Language:       "Go",
		BuildCommand:   "go build",
		TestCommand:    "go test ./...",
		PackageManager: "go mod",
		Dependencies:   make([]string, 0),
	}

	// Parse go.mod for dependencies
	file, err := os.Open(goModPath)
	if err != nil {
		return ctx, nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	inRequire := false

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if strings.HasPrefix(line, "require") {
			inRequire = true
			if strings.Contains(line, "(") {
				continue
			}
		}

		if inRequire {
			if strings.Contains(line, ")") {
				inRequire = false
				continue
			}

			parts := strings.Fields(line)
			if len(parts) >= 1 && !strings.HasPrefix(parts[0], "//") {
				dep := parts[0]
				// Collect ALL dependencies - send them all to AI
				ctx.Dependencies = append(ctx.Dependencies, dep)
			}
		}
	}

	// Don't try to infer framework - let the AI figure it out from dependencies
	// The AI is smarter and knows about frameworks we don't!

	// Check for test files
	filepath.Walk(workingDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), "_test.go") {
			ctx.HasTests = true
			return filepath.SkipAll
		}
		return nil
	})

	// Check for main.go to determine if it's a binary
	if _, err := os.Stat(filepath.Join(workingDir, "main.go")); err == nil {
		ctx.BuildCommand = "go build -o app"
	}

	return ctx, nil
}

// =============================================================================
// Node.js Language Detector
// =============================================================================

type NodeDetector struct{}

func (d *NodeDetector) Name() string {
	return "JavaScript/TypeScript"
}

func (d *NodeDetector) Detect(workingDir string) (*LanguageContext, error) {
	packageJsonPath := filepath.Join(workingDir, "package.json")
	if _, err := os.Stat(packageJsonPath); err != nil {
		return nil, err
	}

	ctx := &LanguageContext{
		Language:     "JavaScript/TypeScript",
		Dependencies: make([]string, 0),
	}

	// Detect package manager
	if _, err := os.Stat(filepath.Join(workingDir, "package-lock.json")); err == nil {
		ctx.PackageManager = "npm"
	} else if _, err := os.Stat(filepath.Join(workingDir, "yarn.lock")); err == nil {
		ctx.PackageManager = "yarn"
	} else if _, err := os.Stat(filepath.Join(workingDir, "pnpm-lock.yaml")); err == nil {
		ctx.PackageManager = "pnpm"
	} else {
		ctx.PackageManager = "npm"
	}

	// Read package.json
	data, err := os.ReadFile(packageJsonPath)
	if err != nil {
		return ctx, nil
	}

	content := string(data)

	// Extract ALL dependencies from package.json
	ctx.Dependencies = extractNodeDependencies(content)

	// Detect scripts
	if strings.Contains(content, "\"build\"") {
		ctx.BuildCommand = fmt.Sprintf("%s run build", ctx.PackageManager)
	}
	if strings.Contains(content, "\"test\"") {
		ctx.TestCommand = fmt.Sprintf("%s test", ctx.PackageManager)
		ctx.HasTests = true
	}

	return ctx, nil
}

// extractNodeDependencies pulls dependency names from package.json content
func extractNodeDependencies(content string) []string {
	deps := make([]string, 0)

	// Simple regex-like extraction (looking for quoted package names)
	lines := strings.Split(content, "\n")
	inDeps := false

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		// Check if we're in a dependencies section
		if strings.Contains(trimmed, "\"dependencies\"") || strings.Contains(trimmed, "\"devDependencies\"") {
			inDeps = true
			continue
		}

		// Exit dependencies section
		if inDeps && strings.HasPrefix(trimmed, "}") {
			inDeps = false
			continue
		}

		// Extract dependency name
		if inDeps && strings.Contains(trimmed, ":") {
			parts := strings.Split(trimmed, "\"")
			if len(parts) >= 2 {
				depName := parts[1]
				// Remove @ scope prefix if present
				depName = strings.TrimPrefix(depName, "@")
				// Take last part if scoped (e.g., @angular/core -> core)
				nameParts := strings.Split(depName, "/")
				if len(nameParts) > 0 {
					deps = append(deps, nameParts[len(nameParts)-1])
				}
			}
		}
	}

	return deps
}

// =============================================================================
// Python Language Detector
// =============================================================================

type PythonDetector struct{}

func (d *PythonDetector) Name() string {
	return "Python"
}

func (d *PythonDetector) Detect(workingDir string) (*LanguageContext, error) {
	// Check for Python project indicators
	indicators := []string{"requirements.txt", "setup.py", "pyproject.toml", "Pipfile"}
	found := false
	for _, indicator := range indicators {
		if _, err := os.Stat(filepath.Join(workingDir, indicator)); err == nil {
			found = true
			break
		}
	}

	if !found {
		return nil, fmt.Errorf("no Python project indicators found")
	}

	ctx := &LanguageContext{
		Language:       "Python",
		Dependencies:   make([]string, 0),
		PackageManager: "pip",
		TestCommand:    "pytest",
	}

	// Check for requirements.txt and extract dependencies
	reqPath := filepath.Join(workingDir, "requirements.txt")
	if data, err := os.ReadFile(reqPath); err == nil {
		content := string(data)
		ctx.Dependencies = extractPythonDependencies(content)

		// Don't try to infer framework - send all dependencies to AI
		// The AI can recognize frameworks from the dependency list

		// Check if pytest is in dependencies
		for _, dep := range ctx.Dependencies {
			if strings.Contains(strings.ToLower(dep), "pytest") {
				ctx.HasTests = true
				break
			}
		}
	}

	// Check for Pipfile (Pipenv)
	if _, err := os.Stat(filepath.Join(workingDir, "Pipfile")); err == nil {
		ctx.PackageManager = "pipenv"
	}

	// Check for pyproject.toml (Poetry)
	if data, err := os.ReadFile(filepath.Join(workingDir, "pyproject.toml")); err == nil {
		if strings.Contains(string(data), "[tool.poetry]") {
			ctx.PackageManager = "poetry"
		}
	}

	// Check for test directory
	if _, err := os.Stat(filepath.Join(workingDir, "tests")); err == nil {
		ctx.HasTests = true
	}

	return ctx, nil
}

// extractPythonDependencies pulls package names from requirements.txt
func extractPythonDependencies(content string) []string {
	deps := make([]string, 0)
	lines := strings.Split(content, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)

		// Skip comments and empty lines
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Remove version specifiers (==, >=, ~=, etc.)
		for _, sep := range []string{"==", ">=", "<=", "~=", "!=", ">", "<"} {
			if idx := strings.Index(line, sep); idx != -1 {
				line = line[:idx]
				break
			}
		}

		// Remove brackets (e.g., package[extra])
		if idx := strings.Index(line, "["); idx != -1 {
			line = line[:idx]
		}

		line = strings.TrimSpace(line)
		if line != "" {
			deps = append(deps, line)
		}
	}

	return deps
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

// GetWorkingDirectory gets the current working directory, handles errors gracefully
func GetWorkingDirectory() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}
	return dir
}
