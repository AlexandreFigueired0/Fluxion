package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	db "fluxion-be/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	supa "github.com/supabase-community/supabase-go"

	"golang.org/x/crypto/bcrypt"
)

// AuthHandler holds the database connection
type AuthHandler struct {
	DB *supa.Client
}

// Request structs
type SignupRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type OAuthRequest struct {
	Email          string `json:"email" binding:"required"`
	Name           string `json:"name" binding:"required"`
	Provider       string `json:"provider" binding:"required"`
	ProviderID     string `json:"providerId" binding:"required"`
	AccessToken    string `json:"accessToken"`    // GitHub OAuth token (optional)
	GitHubUsername string `json:"githubUsername"` // GitHub username (optional)
}

// HandleSignup - POST /api/auth/signup
func (h *AuthHandler) HandleSignup(c *gin.Context) {
	var req SignupRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	log.Printf("📝 Signup attempt: %s (%s)", req.Name, req.Email)

	// Ensure the email is not already registered
	_, err := db.GetUserByEmail(req.Email, h.DB)
	if err != nil && !errors.Is(err, db.ErrUserNotFound) {
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}
	if err == nil {
		log.Printf("⚠️  User already exists: %s", req.Email)
		c.JSON(http.StatusConflict, gin.H{"message": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		log.Println("❌ Error hashing password:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	user, err := db.CreateUser(req.Name, req.Email, string(hashedPassword), h.DB)

	if err != nil {
		log.Println("❌ Error creating user:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	log.Printf("✅ User created: %s (ID: %s) with %d credits", user.Email, user.ID, user.PermanentCredits)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"credits": user.PermanentCredits,
		},
	})
}

// HandleLogin - POST /api/auth/login
func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	log.Printf("🔐 Login attempt: %s", req.Email)

	user, err := db.GetUserByEmail(req.Email, h.DB)
	if err != nil {
		if errors.Is(err, db.ErrUserNotFound) {
			log.Printf("⚠️  User not found: %s", req.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
			return
		}

		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	); err != nil {
		log.Printf("⚠️  Invalid password for: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	log.Printf("✅ Login successful: %s (ID: %s)", user.Email, user.ID)

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"credits": user.PermanentCredits,
	})
}

// HandleOAuth - POST /api/auth/oauth
func (h *AuthHandler) HandleOAuth(c *gin.Context) {
	var req OAuthRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	log.Printf("🔑 OAuth login attempt: %s via %s", req.Email, req.Provider)

	// Check if user exists
	user, err := db.GetUserByEmail(req.Email, h.DB)

	switch {
	case err == nil:
		log.Printf("✅ Existing user logged in: %s (ID: %s)", user.Email, user.ID)

		// Update GitHub token if provided
		if req.Provider == "github" && req.AccessToken != "" {
			err := db.UpdateGitHubToken(user.ID, req.AccessToken, req.GitHubUsername, h.DB)
			if err != nil {
				log.Printf("⚠️  Failed to update GitHub token: %v", err)
				// Don't fail the entire login, just log the warning
			} else {
				log.Printf("✅ Updated GitHub token for user: %s", user.Email)
			}
		}

	case errors.Is(err, db.ErrUserNotFound):
		log.Printf("📝 Creating new %s user: %s", req.Provider, req.Email)

		user, err = db.CreateOAuthUser(req.Name, req.Email, req.Provider, req.ProviderID, h.DB)
		if err != nil {
			log.Println("❌ Error creating OAuth user:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
			return
		}

		log.Printf("✅ Created new %s user: %s (ID: %s) with %d credits",
			req.Provider, user.Email, user.ID, user.PermanentCredits)

		// Save GitHub token if provided
		if req.Provider == "github" && req.AccessToken != "" {
			err := db.UpdateGitHubToken(user.ID, req.AccessToken, req.GitHubUsername, h.DB)
			if err != nil {
				log.Printf("⚠️  Failed to store GitHub token: %v", err)
				// Don't fail the entire login, just log the warning
			} else {
				log.Printf("✅ Stored GitHub token for user: %s", user.Email)
			}
		}

	default:
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"credits": user.PermanentCredits,
	})
}

// StartGitHubLink - GET /api/auth/github/link (protected)
// Generates the GitHub authorization URL for the currently authenticated user
func (h *AuthHandler) StartGitHubLink(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userClaims := claims.(jwt.MapClaims)
	userID := fmt.Sprintf("%v", userClaims["id"])

	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GitHub OAuth not configured"})
		return
	}

	redirectURI := os.Getenv("GITHUB_OAUTH_REDIRECT_URI")
	if redirectURI == "" {
		backendURL := strings.TrimSuffix(os.Getenv("BACKEND_URL"), "/")
		if backendURL == "" {
			backendURL = "http://localhost:8080"
		}
		redirectURI = backendURL + "/api/auth/github/callback"
	}

	state, err := generateGitHubLinkState(userID)
	if err != nil {
		log.Printf("❌ Failed to generate GitHub link state: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate GitHub link"})
		return
	}

	authURL, err := url.Parse("https://github.com/login/oauth/authorize")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build GitHub URL"})
		return
	}

	query := authURL.Query()
	query.Set("client_id", clientID)
	query.Set("redirect_uri", redirectURI)
	query.Set("scope", "repo read:user")
	query.Set("state", state)
	authURL.RawQuery = query.Encode()

	c.JSON(http.StatusOK, gin.H{"url": authURL.String()})
}

// HandleGitHubLinkCallback - GET /api/auth/github/callback
// Exchanges the GitHub OAuth code for a token and stores it for the user from the state payload
func (h *AuthHandler) HandleGitHubLinkCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	if code == "" || state == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing code or state"})
		return
	}

	userID, err := parseGitHubLinkState(state)
	if err != nil {
		log.Printf("❌ Invalid GitHub link state: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state"})
		return
	}

	redirectURI := os.Getenv("GITHUB_OAUTH_REDIRECT_URI")
	if redirectURI == "" {
		backendURL := strings.TrimSuffix(os.Getenv("BACKEND_URL"), "/")
		if backendURL == "" {
			backendURL = "http://localhost:8080"
		}
		redirectURI = backendURL + "/api/auth/github/callback"
	}

	accessToken, err := exchangeGitHubCodeForToken(code, redirectURI)
	if err != nil {
		log.Printf("❌ Failed to exchange GitHub code: %v", err)
		h.redirectWithGitHubStatus(c, "error", "exchange_failed")
		return
	}

	githubUsername, err := fetchGitHubUsername(accessToken)
	if err != nil {
		log.Printf("⚠️  Failed to fetch GitHub username: %v", err)
		githubUsername = ""
	}

	if err := db.UpdateGitHubToken(userID, accessToken, githubUsername, h.DB); err != nil {
		log.Printf("❌ Failed to store GitHub token: %v", err)
		h.redirectWithGitHubStatus(c, "error", "store_failed")
		return
	}

	log.Printf("✅ Linked GitHub account for user %s", userID)
	h.redirectWithGitHubStatus(c, "connected", "")
}

func (h *AuthHandler) redirectWithGitHubStatus(c *gin.Context, status string, reason string) {
	frontendURL := strings.TrimSuffix(os.Getenv("FRONTEND_URL"), "/")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	params := url.Values{}
	params.Set("github", status)
	if reason != "" {
		params.Set("reason", reason)
	}

	redirectTarget := frontendURL + "/dashboard/generate/new"
	if encoded := params.Encode(); encoded != "" {
		redirectTarget += "?" + encoded
	}

	c.Redirect(http.StatusFound, redirectTarget)
}

func generateGitHubLinkState(userID string) (string, error) {
	secret := os.Getenv("NEXTAUTH_SECRET")
	if secret == "" {
		return "", errors.New("NEXTAUTH_SECRET not set")
	}

	claims := jwt.MapClaims{
		"uid": userID,
		"exp": time.Now().Add(10 * time.Minute).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func parseGitHubLinkState(state string) (string, error) {
	secret := os.Getenv("NEXTAUTH_SECRET")
	if secret == "" {
		return "", errors.New("NEXTAUTH_SECRET not set")
	}

	parsed, err := jwt.Parse(state, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !parsed.Valid {
		return "", errors.New("invalid state token")
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid state claims")
	}

	uid, ok := claims["uid"].(string)
	if ok {
		return uid, nil
	}

	return "", errors.New("state missing uid")
}

func exchangeGitHubCodeForToken(code string, redirectURI string) (string, error) {
	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		return "", errors.New("GitHub OAuth not configured")
	}

	data := url.Values{}
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)

	req, err := http.NewRequest(http.MethodPost, "https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("GitHub token exchange failed: %s", string(body))
	}

	var payload struct {
		AccessToken string `json:"access_token"`
		Scope       string `json:"scope"`
		TokenType   string `json:"token_type"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return "", err
	}

	if payload.AccessToken == "" {
		return "", errors.New("empty access token from GitHub")
	}

	return payload.AccessToken, nil
}

func fetchGitHubUsername(accessToken string) (string, error) {
	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "token "+accessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "Fluxion-GitHub-Linker")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GitHub user lookup failed with status %d", resp.StatusCode)
	}

	var payload struct {
		Login string `json:"login"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return "", err
	}

	return payload.Login, nil
}
