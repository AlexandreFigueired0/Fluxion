package handlers

import (
	"errors"
	"log"
	"net/http"

	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	supa "github.com/supabase-community/supabase-go"
)

type APIKeyHandler struct {
	DB *supa.Client
}

type CreateAPIKeyRequest struct {
	Name string `json:"name" binding:"required"`
}

type RevokeAPIKeyRequest struct {
	Name string `json:"name" binding:"required"`
}

// GetAPIKeyByUserID retrieves the API key for a given user ID.
func (h *APIKeyHandler) GetAPIKeyByUserID(c *gin.Context) {
	userId := c.Param("id")

	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's data"})
		return
	}

	apiKey, err := db.GetAPIKeyByUserID(userId, h.DB)
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
	userId := c.Param("id")

	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's data"})
		return
	}

	var req CreateAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	apiKey, unhashedKey, err := db.CreateAPIKey(userId, req.Name, h.DB)
	if err != nil {
		log.Printf("Error creating API key for user %s: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create API key"})
		return
	}
	apiKeyResponse := dto.APIKeyDTO{
		ID:         apiKey.ID,
		UserID:     apiKey.UserID,
		Name:       apiKey.Name,
		KeyPrefix:  apiKey.KeyPrefix,
		CreatedAt:  apiKey.CreatedAt,
		Key:        unhashedKey,
		LastUsedAt: apiKey.LastUsedAt,
	}
	c.JSON(http.StatusOK, apiKeyResponse)
}

// DeleteAPIKey revokes the API key for a given user ID.
func (h *APIKeyHandler) DeleteAPIKey(c *gin.Context) {
	userId := c.Param("id")

	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's data"})
		return
	}

	var req RevokeAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err := db.RevokeAPIKey(userId, req.Name, h.DB)
	if err != nil {
		if errors.Is(err, db.ErrAPIKeyNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "API key not found"})
			return
		}
		log.Printf("Error revoking API key for user %s: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke API key"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "API key revoked successfully"})
}
