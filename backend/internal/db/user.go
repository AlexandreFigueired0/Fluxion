package db

import (
	"errors"
	"time"

	models "fluxion-be/internal/models"

	supa "github.com/supabase-community/supabase-go"
)

var ErrUserNotFound = errors.New("user not found")

const freeCredits = 3

// Get user by email
func GetUserByEmail(email string, db *supa.Client) (*models.User, error) {
	var users []models.User
	_, err := db.From("users").Select("*", "", false).Eq("email", email).Limit(1, "").ExecuteTo(&users)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, ErrUserNotFound
	}
	return &users[0], nil
}

// CreateUser creates a new user in the database
func CreateUser(name, email, passwordHash string, db *supa.Client) (*models.User, error) {
	newUser := map[string]interface{}{
		"email":         email,
		"created_at":    time.Now(),
		"password_hash": passwordHash,
		"credits":       freeCredits,
		"name":          name,
		"updated_at":    time.Now(),
		"provider":      "credentials",
	}

	var user models.User
	_, err := db.From("users").Insert(newUser, false, "", "", "").Single().ExecuteTo(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateOAuthUser(name, email, provider, providerID string, db *supa.Client) (*models.User, error) {
	newUser := map[string]interface{}{
		"email":       email,
		"created_at":  time.Now(),
		"credits":     3,
		"name":        name,
		"updated_at":  time.Now(),
		"provider":    provider,
		"provider_id": providerID,
	}

	var user models.User
	_, err := db.From("users").Insert(newUser, false, "", "", "").Single().ExecuteTo(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(id string, db *supa.Client) (*models.User, error) {
	var users []models.User
	_, err := db.From("users").Select("*", "", false).Eq("id", id).Limit(1, "").ExecuteTo(&users)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, ErrUserNotFound
	}
	return &users[0], nil
}

// UpdateUserCredits sets a user's credit balance to the provided value.
func UpdateUserCredits(id string, credits float64, db *supa.Client) (*models.User, error) {
	updatedFields := map[string]interface{}{
		"credits":    credits,
		"updated_at": time.Now(),
	}

	var user models.User
	_, err := db.From("users").Update(updatedFields, "", "").Eq("id", id).Single().ExecuteTo(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
