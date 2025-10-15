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

// Create user type with only the fields we want to expose
type UserDTO struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Credits int    `json:"credits"`
}

// GetUserByID retrieves a user by their ID.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	user, err := db.GetUserByID(id, h.DB)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	userResponse := UserDTO{
		ID:      user.ID,
		Name:    user.Name,
		Email:   user.Email,
		Credits: user.Credits,
	}
	c.JSON(http.StatusOK, userResponse)
}
