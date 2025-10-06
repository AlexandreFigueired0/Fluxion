package detectors

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

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
		TestCommand:    "go test",
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
