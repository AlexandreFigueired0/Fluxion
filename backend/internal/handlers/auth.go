package handlers

import (
	"errors"
	"log"
	"net/http"

	db "fluxion-be/internal/db"

	"github.com/gin-gonic/gin"
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
	Email      string `json:"email" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Provider   string `json:"provider" binding:"required"`
	ProviderID string `json:"providerId" binding:"required"`
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

	log.Printf("✅ User created: %s (ID: %s) with %d credits", user.Email, user.ID, user.Credits)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"credits": user.Credits,
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
		"credits": user.Credits,
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
	case errors.Is(err, db.ErrUserNotFound):
		log.Printf("📝 Creating new %s user: %s", req.Provider, req.Email)

		user, err = db.CreateOAuthUser(req.Name, req.Email, req.Provider, req.ProviderID, h.DB)
		if err != nil {
			log.Println("❌ Error creating OAuth user:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
			return
		}

		log.Printf("✅ Created new %s user: %s (ID: %s) with %d credits",
			req.Provider, user.Email, user.ID, user.Credits)
	default:
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"credits": user.Credits,
	})
}
