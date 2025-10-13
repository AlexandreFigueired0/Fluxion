package db

import (
	models "fluxion-be/internal/models"
	"time"

	supa "github.com/supabase-community/supabase-go"
)

// Get user by email
func GetUserByEmail(email string, db *supa.Client) (*models.User, error) {
	var user models.User
	_, err := db.From("users").Select("*", "", false).Eq("email", email).Single().ExecuteTo(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateUser creates a new user in the database
func CreateUser(name, email, passwordHash string, db *supa.Client) (*models.User, error) {
	newUser := map[string]interface{}{
		"email":         email,
		"created_at":    time.Now(),
		"password_hash": passwordHash,
		"credits":       50,
		"name":          name,
		"updated_at":    time.Now(),
		"provider":      "credentials",
	}

	var user models.User
	_, err := db.From("users").Insert(newUser, false, "", "*", "").Single().ExecuteTo(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
