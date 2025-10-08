package detectors

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

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
	depsMap := make(map[string]bool)

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
					depsMap[nameParts[len(nameParts)-1]] = true
				}
			}
		}
	}

	deps := make([]string, 0, len(depsMap))
	for dep := range depsMap {
		deps = append(deps, dep)
	}
	return deps
}
