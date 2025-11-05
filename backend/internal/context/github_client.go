package context

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"fluxion-be/internal/context/detectors"
)

// GitHubClient handles communication with GitHub API
type GitHubClient struct {
	Owner      string
	Repo       string
	Token      string // Optional - for authenticated requests
	HttpClient *http.Client
}

// NewGitHubClient creates a new GitHub API client
func NewGitHubClient(owner, repo, token string) *GitHubClient {
	return &GitHubClient{
		Owner:      owner,
		Repo:       repo,
		Token:      token,
		HttpClient: &http.Client{},
	}
}

// FetchDirectoryContents fetches the contents of a directory from GitHub
func (gc *GitHubClient) FetchDirectoryContents(path string) ([]detectors.GitHubFileContent, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s", gc.Owner, gc.Repo, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "Fluxion-Context-Detector")
	if gc.Token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("token %s", gc.Token))
	}

	resp, err := gc.HttpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d", resp.StatusCode)
	}

	var files []detectors.GitHubFileContent
	if err := json.NewDecoder(resp.Body).Decode(&files); err != nil {
		return nil, err
	}

	return files, nil
}

// FetchFileContent fetches the raw content of a file from GitHub
func (gc *GitHubClient) FetchFileContent(path string) (string, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s", gc.Owner, gc.Repo, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Accept", "application/vnd.github.v3.raw")
	req.Header.Set("User-Agent", "Fluxion-Context-Detector")
	if gc.Token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("token %s", gc.Token))
	}

	resp, err := gc.HttpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch file: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// FileExists checks if a file exists in the given list
func FileExists(files []detectors.GitHubFileContent, name string) bool {
	for _, f := range files {
		if f.Name == name {
			return true
		}
	}
	return false
}

// DescribeStructure creates a human-readable description of the repo structure
func DescribeStructure(files []detectors.GitHubFileContent) string {
	dirs := make([]string, 0)
	for _, file := range files {
		if file.Type == "dir" && file.Name != "." && file.Name != ".." {
			dirs = append(dirs, file.Name)
		}
	}

	if len(dirs) == 0 {
		return "Single directory project"
	}

	if len(dirs) > 1 {
		// Check for monorepo pattern
		commonMonorepoPatterns := []string{"cmd", "internal", "pkg", "src", "apps", "packages", "services", "backend", "frontend", "cli"}
		matchCount := 0
		for _, pattern := range commonMonorepoPatterns {
			for _, dir := range dirs {
				if strings.EqualFold(dir, pattern) {
					matchCount++
				}
			}
		}

		if matchCount >= 2 {
			return fmt.Sprintf("Monorepo with directories: %s", strings.Join(dirs[:minInt(3, len(dirs))], ", "))
		}
	}

	return fmt.Sprintf("Project with structure: %s", strings.Join(dirs[:minInt(3, len(dirs))], ", "))
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
