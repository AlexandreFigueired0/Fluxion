package handlers

import (
	db "fluxion-be/internal/db"
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
	c.JSON(http.StatusOK, user)
}
