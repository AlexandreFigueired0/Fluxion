package detectors

import (
	"strings"
)

type PythonDetector struct{}

func (d *PythonDetector) Name() string {
	return "Python"
}

func (d *PythonDetector) Detect(files []GitHubFileContent) *LanguageContext {
	// Check for Python project indicators
	pythonIndicators := []string{"pyproject.toml", "setup.py", "requirements.txt", "Pipfile"}
	found := false
	pythonFile := ""
	
	for _, indicator := range pythonIndicators {
		if fileExists(files, indicator) {
			found = true
			pythonFile = indicator
			break
		}
	}

	if !found {
		return nil
	}

	ctx := &LanguageContext{
		Language:       "Python",
		PackageManager: "pip",
		TestCommand:    "pytest",
		Dependencies:   make([]string, 0),
	}

	// Detect package manager based on file
	if pythonFile == "Pipfile" {
		ctx.PackageManager = "pipenv"
	} else if pythonFile == "pyproject.toml" {
		// Check if poetry is used
		for _, file := range files {
			if file.Name == "pyproject.toml" {
				if strings.Contains(file.Content, "[tool.poetry]") {
					ctx.PackageManager = "poetry"
				}
				break
			}
		}
	}

	// Extract dependencies
	for _, file := range files {
		if file.Name == pythonFile {
			if pythonFile == "requirements.txt" {
				ctx.Dependencies = extractPythonDependencies(file.Content)
				if strings.Contains(file.Content, "pytest") {
					ctx.HasTests = true
				}
			}
			break
		}
	}

	// Check for test files/directories
	for _, file := range files {
		if strings.HasPrefix(file.Name, "test_") && strings.HasSuffix(file.Name, ".py") {
			ctx.HasTests = true
			break
		}
		if file.Type == "dir" && file.Name == "tests" {
			ctx.HasTests = true
			break
		}
	}

	return ctx
}

func extractPythonDependencies(content string) []string {
	depsMap := make(map[string]bool)
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
			depsMap[line] = true
		}
	}

	deps := make([]string, 0, len(depsMap))
	for dep := range depsMap {
		deps = append(deps, dep)
	}
	return deps
}
