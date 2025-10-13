package handlers

import (
	"database/sql"
	"log"
	"net/http"

	db "fluxion-be/internal/db"
	"fluxion-be/internal/models"

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

	// Check if user exists
	var user *models.User
	user, err := db.GetUserByEmail(req.Email, h.DB)

	if err == sql.ErrNoRows {
		log.Printf("⚠️  User not found: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	if err != nil {
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
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

	user, err = db.CreateUser(req.Name, req.Email, string(hashedPassword), h.DB)

	if err != nil {
		log.Println("❌ Error creating user:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	log.Printf("✅ User created: %s (ID: %d) with %d credits", user.Email, user.ID, user.Credits)

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

	// Find user
	var user *models.User
	user, err := db.GetUserByEmail(req.Email, h.DB)

	if err == sql.ErrNoRows {
		log.Printf("⚠️  User not found: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	if err != nil {
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	)
	if err != nil {
		log.Printf("⚠️  Invalid password for: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	log.Printf("✅ Login successful: %s (ID: %d)", user.Email, user.ID)

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"credits": user.Credits,
	})
	
// TODO
// HandleOAuth - POST /api/auth/oauth
func (h *AuthHandler) HandleOAuth(c *gin.Context) {
	var req OAuthRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	log.Printf("🔑 OAuth login attempt: %s via %s", req.Email, req.Provider)

	// Check if user exists
	var user *models.User
	user, err := db.GetUserByEmail(req.Email, h.DB)

	if err == sql.ErrNoRows {
		log.Printf("⚠️  User not found: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	if err != nil {
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	if err == sql.ErrNoRows {
		// Create new OAuth user
		log.Printf("📝 Creating new %s user: %s", req.Provider, req.Email)

		err = h.DB.QueryRow(`
			INSERT INTO users (name, email, provider, provider_id, credits) 
			VALUES ($1, $2, $3, $4, $5) 
			RETURNING id, name, email, credits`,
			req.Name,
			req.Email,
			req.Provider,
			req.ProviderID,
			50,
		).Scan(&user.ID, &user.Name, &user.Email, &user.Credits)

		if err != nil {
			log.Println("❌ Error creating OAuth user:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
			return
		}

		log.Printf("✅ Created new %s user: %s (ID: %d) with %d credits",
			req.Provider, user.Email, user.ID, user.Credits)

	} else if err != nil {
		log.Println("❌ Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	} else {
		log.Printf("✅ Existing user logged in: %s (ID: %d)", user.Email, user.ID)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"name":    user.Name,
		"email":   user.Email,
		"credits": user.Credits,
	})
}
