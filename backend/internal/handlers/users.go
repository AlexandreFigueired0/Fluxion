package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	supa "github.com/supabase-community/supabase-go"
)

type UserHandler struct {
	DB *supa.Client
}

// GetUserByID retrieves a user by their ID.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")
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

// GetAPIKeyByUserID retrieves the API key for a given user ID.
func (h *UserHandler) GetAPIKeyByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	apiKey, err := db.GetAPIKeyByUserID(userID, h.DB)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "API key not found"})
		return
	}
	apiKeyResponse := dto.APIKeyDTO{
		ID:         apiKey.ID,
		UserID:     apiKey.UserID,
		Name:       apiKey.Name,
		KeyPrefix:  apiKey.KeyPrefix,
		CreatedAt:  apiKey.CreatedAt,
		LastUsedAt: apiKey.LastUsedAt,
	}
	c.JSON(http.StatusOK, apiKeyResponse)
}
