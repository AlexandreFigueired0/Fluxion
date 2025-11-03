package context

import (
	"fmt"

	types "fluxion-shared/types"
	"fluxion-be/internal/context/detectors"
)

// ProjectDetector orchestrates language detection for a GitHub repository
type ProjectDetector struct {
	client    *GitHubClient
	detectors []detectors.LanguageDetector
}

// NewProjectDetector creates a new project detector for a GitHub repository
func NewProjectDetector(owner, repo, githubToken string) *ProjectDetector {
	return &ProjectDetector{
		client: NewGitHubClient(owner, repo, githubToken),
		detectors: []detectors.LanguageDetector{
			&detectors.GoDetector{},
			&detectors.NodeDetector{},
			&detectors.PythonDetector{},
		},
	}
}

// Detect analyzes the repository and returns project context
func (pd *ProjectDetector) Detect() (*types.ProjectContext, error) {
	ctx := &types.ProjectContext{
		Languages:    make([]string, 0),
		Dependencies: make([]string, 0),
		DockerFiles:  make([]string, 0),
		ExistingCI:   make([]string, 0),
	}

	// Fetch repository root
	rootFiles, err := pd.client.FetchDirectoryContents("")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch repo root: %w", err)
	}

	// Try to detect languages at root level
	pd.detectLanguagesInDir(rootFiles, ctx)

	// If no languages detected at root, check subdirectories (monorepo support)
	if len(ctx.Languages) == 0 {
		for _, file := range rootFiles {
			if file.Type == "dir" && file.Name[0:1] != "." {
				subFiles, err := pd.client.FetchDirectoryContents(file.Name)
				if err == nil {
					pd.detectLanguagesInDir(subFiles, ctx)
					if len(ctx.Languages) > 0 {
						break // Stop after first match
					}
				}
			}
		}
	}

	// Detect Docker files
	pd.detectDockerFiles(rootFiles, ctx)

	// Detect GitHub Actions workflows
	ghWorkflows, err := pd.client.FetchDirectoryContents(".github/workflows")
	if err == nil {
		for _, file := range ghWorkflows {
			if file.Type == "file" && (endsWith(file.Name, ".yml") || endsWith(file.Name, ".yaml")) {
				ctx.ExistingCI = append(ctx.ExistingCI, file.Name)
			}
		}
	}

	// Build structure description
	ctx.Structure = DescribeStructure(rootFiles)

	return ctx, nil
}

// detectLanguagesInDir checks a directory for language indicators
func (pd *ProjectDetector) detectLanguagesInDir(files []detectors.GitHubFileContent, ctx *types.ProjectContext) {
	// Run all detectors
	for _, detector := range pd.detectors {
		langCtx := detector.Detect(files)
		if langCtx != nil {
			ctx.Languages = append(ctx.Languages, langCtx.Language)

			// First detected language becomes primary
			if ctx.PrimaryLang == "" {
				ctx.PrimaryLang = langCtx.Language
				ctx.PackageManager = langCtx.PackageManager
				ctx.BuildCommand = langCtx.BuildCommand
				ctx.TestCommand = langCtx.TestCommand
				ctx.HasTests = langCtx.HasTests
				ctx.Dependencies = langCtx.Dependencies
			} else {
				// Merge additional language info
				ctx.HasTests = ctx.HasTests || langCtx.HasTests
			}
			
			// Stop after first detection
			break
		}
	}
}

// detectDockerFiles looks for Docker-related files
func (pd *ProjectDetector) detectDockerFiles(files []detectors.GitHubFileContent, ctx *types.ProjectContext) {
	dockerPatterns := []string{"Dockerfile", "docker-compose.yml", "docker-compose.yaml"}
	for _, file := range files {
		if file.Type == "file" {
			for _, pattern := range dockerPatterns {
				if contains(file.Name, pattern) {
					ctx.DockerFiles = append(ctx.DockerFiles, file.Name)
				}
			}
		}
	}
}

// Helper functions
func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func endsWith(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}
