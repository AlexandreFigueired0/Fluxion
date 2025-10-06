package detectors

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

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
