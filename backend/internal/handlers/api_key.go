package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	supa "github.com/supabase-community/supabase-go"
)

type APIKeyHandler struct {
	DB *supa.Client
}

type CreateAPIKeyRequest struct {
	Name string `json:"name" binding:"required"`
}

// GetAPIKeyByUserID retrieves the API key for a given user ID.
func (h *APIKeyHandler) GetAPIKeyByUserID(c *gin.Context) {
	userID := c.Param("id")
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

// CreateAPIKey creates a new API key for a given user ID.
func (h *APIKeyHandler) CreateAPIKey(c *gin.Context) {
	userID := c.Param("id")
	var req CreateAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	apiKey, err := db.CreateAPIKey(userID, req.Name, h.DB)
	if err != nil {
		log.Printf("Error creating API key for user %s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create API key"})
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
