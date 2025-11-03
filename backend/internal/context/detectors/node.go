package detectors

import (
	"encoding/json"
	"fmt"
	"strings"
)

type NodeDetector struct{}

func (d *NodeDetector) Name() string {
	return "JavaScript/TypeScript"
}

func (d *NodeDetector) Detect(files []GitHubFileContent) *LanguageContext {
	if !fileExists(files, "package.json") {
		return nil
	}

	// Detect package manager
	pm := "npm"
	for _, file := range files {
		if file.Name == "yarn.lock" {
			pm = "yarn"
			break
		}
		if file.Name == "pnpm-lock.yaml" {
			pm = "pnpm"
			break
		}
	}

	ctx := &LanguageContext{
		Language:       "JavaScript/TypeScript",
		PackageManager: pm,
		BuildCommand:   fmt.Sprintf("%s run build", pm),
		TestCommand:    fmt.Sprintf("%s test", pm),
		Dependencies:   make([]string, 0),
	}

	// Extract dependencies from package.json content
	// Note: We assume Content is passed in when files are fetched
	var pkgJson map[string]interface{}
	for _, file := range files {
		if file.Name == "package.json" {
			if err := json.Unmarshal([]byte(file.Content), &pkgJson); err == nil {
				ctx.Dependencies = extractNodeDependencies(pkgJson)
				
				// Check for test scripts
				if scripts, ok := pkgJson["scripts"].(map[string]interface{}); ok {
					if _, hasTest := scripts["test"]; hasTest {
						ctx.HasTests = true
					}
				}
			}
			break
		}
	}

	return ctx
}

func extractNodeDependencies(pkgJson map[string]interface{}) []string {
	deps := make(map[string]bool)

	// Extract from dependencies
	if dependencies, ok := pkgJson["dependencies"].(map[string]interface{}); ok {
		for dep := range dependencies {
			deps[dep] = true
		}
	}

	// Extract from devDependencies
	if devDeps, ok := pkgJson["devDependencies"].(map[string]interface{}); ok {
		for dep := range devDeps {
			if !shouldExcludeDep(dep) {
				deps[dep] = true
			}
		}
	}

	result := make([]string, 0, len(deps))
	for dep := range deps {
		result = append(result, dep)
	}
	return result
}

func shouldExcludeDep(depName string) bool {
	excludePatterns := []string{
		"types/", "@types/", "eslint", "prettier", "webpack", "babel",
		"jest", "mocha", "chai", "test", "mock", "stub",
	}

	depLower := strings.ToLower(depName)
	for _, pattern := range excludePatterns {
		if strings.Contains(depLower, pattern) {
			return true
		}
	}
	return false
}
