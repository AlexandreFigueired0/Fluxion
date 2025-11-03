package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"fluxion-be/internal/context"
	db "fluxion-be/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	supa "github.com/supabase-community/supabase-go"
)

// DetectHandler handles project detection requests
type DetectHandler struct {
	DB *supa.Client
}

// DetectProjectRequest is the request body for project detection
type DetectProjectRequest struct {
	Owner string `json:"owner" binding:"required"`
	Repo  string `json:"repo" binding:"required"`
	Token string `json:"token"` // Optional - for non-authenticated users providing their own token
}

// DetectProject - POST /api/detect/project
// Analyzes a GitHub repository and returns detected project context
func (h *DetectHandler) DetectProject(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userClaims := claims.(jwt.MapClaims)
	userID := fmt.Sprintf("%v", userClaims["id"])

	var req DetectProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid detect request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: owner and repo are required"})
		return
	}

	log.Printf("Detect project request: user_id=%s, owner=%s, repo=%s", userID, req.Owner, req.Repo)

	// Get GitHub token - either from request (for public repos) or from user's stored token
	githubToken := req.Token
	if githubToken == "" {
		// Try to get from user's stored token
		storedToken, err := db.GetGitHubToken(userID, h.DB)
		if err != nil {
			log.Printf("No GitHub token available: %v", err)
			// Continue anyway - public repos don't need a token
			githubToken = ""
		} else {
			githubToken = storedToken
		}
	}

	// Create detector and run analysis
	detector := context.NewProjectDetector(req.Owner, req.Repo, githubToken)
	projectCtx, err := detector.Detect()
	if err != nil {
		log.Printf("Failed to detect project: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to detect project: %v", err)})
		return
	}

	log.Printf("Successfully detected project: language=%s, pm=%s", projectCtx.PrimaryLang, projectCtx.PackageManager)

	c.JSON(http.StatusOK, projectCtx)
}

// ListUserRepositories - GET /api/detect/repos
// Lists repositories accessible by the authenticated user
func (h *DetectHandler) ListUserRepositories(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userClaims := claims.(jwt.MapClaims)
	userID := fmt.Sprintf("%v", userClaims["id"])

	log.Printf("List repos request: user_id=%s", userID)

	// Get user's GitHub token
	githubToken, err := db.GetGitHubToken(userID, h.DB)
	if err != nil {
		log.Printf("User has no GitHub token: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has not connected GitHub account"})
		return
	}

	// Fetch user's repositories from GitHub
	repos, err := fetchUserRepositories(githubToken)
	if err != nil {
		log.Printf("Failed to fetch repositories: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repositories"})
		return
	}

	log.Printf("Found %d repositories for user %s", len(repos), userID)

	c.JSON(http.StatusOK, gin.H{
		"repositories": repos,
		"count":        len(repos),
	})
}

// GitHubRepo is the raw response from GitHub API
type GitHubRepo struct {
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	HtmlURL     string `json:"html_url"`
	Private     bool   `json:"private"`
	Owner       struct {
		Login string `json:"login"`
	} `json:"owner"`
}

// fetchUserRepositories fetches user's repositories from GitHub API
func fetchUserRepositories(githubToken string) ([]GitHubRepo, error) {
	url := "https://api.github.com/user/repos?per_page=100&sort=updated&direction=desc"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// Set GitHub API headers
	req.Header.Set("Authorization", fmt.Sprintf("token %s", githubToken))
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "Fluxion")

	// Make request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch repositories: %w", err)
	}
	defer resp.Body.Close()

	// Check status
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitHub API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse response
	var ghRepos []GitHubRepo
	if err := json.NewDecoder(resp.Body).Decode(&ghRepos); err != nil {
		return nil, fmt.Errorf("failed to parse GitHub response: %w", err)
	}

	return ghRepos, nil
}
