package cmd

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

// LanguageDetector interface for language-specific detection
//
// This is the "contract" that all language detectors must follow.
// Any struct that implements these two methods can be used as a detector.
//
// Think of it like a template:
// - Name() returns the language name (e.g., "Go", "Python")
// - Detect() checks if this is that language's project and returns info
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

// Registry of language detectors
//
// This is where ALL language detectors are registered.
// When DetectProjectContext runs, it loops through this list
// and asks each detector: "Is this your language?"
//
// To add a new language:
// 1. Create a new detector (e.g., RustDetector)
// 2. Add it here: &RustDetector{},
// That's it! The system will automatically detect it.
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

	// Parse go.mod for dependencies and frameworks
	file, err := os.Open(goModPath)
	if err != nil {
		return ctx, nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	inRequire := false

	frameworks := map[string]string{
		"cobra":         "Cobra CLI",
		"gin-gonic/gin": "Gin Web Framework",
		"gofiber/fiber": "Fiber Web Framework",
		"labstack/echo": "Echo Web Framework",
		"gorilla/mux":   "Gorilla Mux",
	}

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

				// Check for known frameworks
				for key, framework := range frameworks {
					if strings.Contains(dep, key) {
						ctx.Framework = framework
						ctx.Dependencies = append(ctx.Dependencies, key)
						break
					}
				}
			}
		}
	}

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

	// Detect frameworks
	frameworks := map[string]string{
		"\"next\"":          "Next.js",
		"\"react\"":         "React",
		"\"vue\"":           "Vue.js",
		"\"@angular/core\"": "Angular",
		"\"express\"":       "Express.js",
		"\"nestjs\"":        "NestJS",
		"\"vite\"":          "Vite",
		"\"svelte\"":        "Svelte",
	}

	for key, framework := range frameworks {
		if strings.Contains(content, key) {
			ctx.Framework = framework
			ctx.Dependencies = append(ctx.Dependencies, strings.Trim(key, "\""))
			break
		}
	}

	// Detect scripts
	if strings.Contains(content, "\"build\"") {
		ctx.BuildCommand = fmt.Sprintf("%s run build", ctx.PackageManager)
	}
	if strings.Contains(content, "\"test\"") {
		ctx.TestCommand = fmt.Sprintf("%s test", ctx.PackageManager)
		ctx.HasTests = true
	}

	// Check for TypeScript
	if strings.Contains(content, "\"typescript\"") {
		ctx.Dependencies = append(ctx.Dependencies, "TypeScript")
	}

	return ctx, nil
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

	// Check for requirements.txt
	reqPath := filepath.Join(workingDir, "requirements.txt")
	if data, err := os.ReadFile(reqPath); err == nil {
		content := strings.ToLower(string(data))

		frameworks := map[string]string{
			"django":  "Django",
			"flask":   "Flask",
			"fastapi": "FastAPI",
			"tornado": "Tornado",
			"pyramid": "Pyramid",
		}

		for key, framework := range frameworks {
			if strings.Contains(content, key) {
				ctx.Framework = framework
				ctx.Dependencies = append(ctx.Dependencies, key)
			}
		}

		if strings.Contains(content, "pytest") {
			ctx.HasTests = true
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

	if ctx.Framework != "" {
		parts = append(parts, fmt.Sprintf("- Framework: %s", ctx.Framework))
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
		// Limit to first 5 dependencies
		deps := ctx.Dependencies
		if len(deps) > 5 {
			deps = deps[:5]
		}
		parts = append(parts, fmt.Sprintf("- Key Dependencies: %s", strings.Join(deps, ", ")))
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

// GetWorkingDirectory gets the current working directory, handles errors gracefully
func GetWorkingDirectory() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}
	return dir
}
