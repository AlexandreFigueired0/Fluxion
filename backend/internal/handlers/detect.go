package handlers

import (
	"fmt"
	"log"
	"net/http"

	db "fluxion-be/internal/db"
	"fluxion-be/internal/context"

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

// Repository represents a GitHub repository
type Repository struct {
	Name        string `json:"name"`
	Owner       string `json:"owner"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	URL         string `json:"html_url"`
	Private     bool   `json:"private"`
}

// fetchUserRepositories fetches user's repositories from GitHub API
func fetchUserRepositories(githubToken string) ([]Repository, error) {
	// For now, return empty list - this can be enhanced to fetch from GitHub API
	// This would require making authenticated requests to https://api.github.com/user/repos
	// For MVP, users can just paste owner/repo manually
	return []Repository{}, nil
}
