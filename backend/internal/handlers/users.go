package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	supa "github.com/supabase-community/supabase-go"
)

type UserHandler struct {
	DB *supa.Client
}

// GetUserByID retrieves a user by their ID.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")

	// Auth user
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != id {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's data"})
		return
	}

	user, err := db.GetUserByID(id, h.DB)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	userResponse := dto.UserDTO{
		ID:      user.ID,
		Name:    user.Name,
		Email:   user.Email,
		Credits: user.Credits,
	}
	c.JSON(http.StatusOK, userResponse)
}
