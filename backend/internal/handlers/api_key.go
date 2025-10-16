package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	supa "github.com/supabase-community/supabase-go"
)

type APIKeyHandler struct {
	DB *supa.Client
}

// GetAPIKeyByUserID retrieves the API key for a given user ID.
func (h *APIKeyHandler) GetAPIKeyByUserID(c *gin.Context) {
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
