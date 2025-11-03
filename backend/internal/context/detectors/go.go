package detectors

import (
	"strings"
)

type GoDetector struct{}

func (d *GoDetector) Name() string {
	return "Go"
}

func (d *GoDetector) Detect(files []GitHubFileContent) *LanguageContext {
	if !fileExists(files, "go.mod") {
		return nil
	}

	ctx := &LanguageContext{
		Language:       "Go",
		PackageManager: "go mod",
		BuildCommand:   "go build ./...",
		TestCommand:    "go test ./...",
		Dependencies:   make([]string, 0),
	}

	// Check for test files
	for _, file := range files {
		if strings.HasSuffix(file.Name, "_test.go") {
			ctx.HasTests = true
			break
		}
	}

	// Check for main.go to customize build command
	for _, file := range files {
		if file.Name == "main.go" {
			ctx.BuildCommand = "go build -o app"
			break
		}
	}

	return ctx
}

func fileExists(files []GitHubFileContent, name string) bool {
	for _, f := range files {
		if f.Name == name {
			return true
		}
	}
	return false
}
