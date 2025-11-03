package db

import (
	"errors"
	"time"

	"fluxion-be/internal/dto"
	models "fluxion-be/internal/models"
	"fluxion-be/internal/utils"

	supa "github.com/supabase-community/supabase-go"
)

var ErrUserNotFound = errors.New("user not found")

const freeCredits = 5

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
		"email":                email,
		"created_at":           time.Now(),
		"password_hash":        passwordHash,
		"permanent_credits":    freeCredits,
		"name":                 name,
		"updated_at":           time.Now(),
		"provider":             "credentials",
		"subscription_credits": 0,
		"subscription_plan_id": "Free",
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
		"email":                email,
		"created_at":           time.Now(),
		"permanent_credits":    freeCredits,
		"subscription_credits": 0,
		"name":                 name,
		"updated_at":           time.Now(),
		"provider":             provider,
		"provider_id":          providerID,
		"subscription_plan_id": "Free",
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

// UpdateUserSubscriptionCredits updates a user's subscription credits
func UpdateUserSubscriptionCredits(user_id string, newSubscriptionCredits int, db *supa.Client) (*dto.UserDTO, error) {
	updates := map[string]interface{}{
		"subscription_credits": newSubscriptionCredits,
		"updated_at":           time.Now(),
	}

	var updatedUser dto.UserDTO

	_, err := db.From("users").Update(updates, "", "").Eq("id", user_id).Single().ExecuteTo(&updatedUser)
	return &updatedUser, err
}

// UpdateUserPermanentCredits updates a user's permanent credits
func UpdateUserPermanentCredits(user_id string, newPermanentCredits int, db *supa.Client) (*dto.UserDTO, error) {
	updates := map[string]interface{}{
		"permanent_credits": newPermanentCredits,
		"updated_at":        time.Now(),
	}

	var updatedUser dto.UserDTO

	_, err := db.From("users").Update(updates, "", "").Eq("id", user_id).Single().ExecuteTo(&updatedUser)
	return &updatedUser, err
}

// UpdateUserSubscriptionPlanID updates a user's subscription plan ID
func UpdateUserSubscriptionPlanID(user_id string, newPlanID string, db *supa.Client) (*dto.UserDTO, error) {
	updates := map[string]interface{}{
		"subscription_plan_id": newPlanID,
		"updated_at":           time.Now(),
	}

	var updatedUser dto.UserDTO

	_, err := db.From("users").Update(updates, "", "").Eq("id", user_id).Single().ExecuteTo(&updatedUser)
	return &updatedUser, err
}

// UpdateUserStripeCustomerID stores the Stripe customer ID for future webhook lookups
func UpdateUserStripeCustomerID(userID string, customerID string, db *supa.Client) (*dto.UserDTO, error) {
	updates := map[string]interface{}{
		"stripe_customer_id": customerID,
		"updated_at":         time.Now(),
	}

	var updatedUser dto.UserDTO

	_, err := db.From("users").Update(updates, "", "").Eq("id", userID).Single().ExecuteTo(&updatedUser)
	return &updatedUser, err
}

// GetUserByStripeCustomerID retrieves a user by their Stripe customer identifier
func GetUserByStripeCustomerID(customerID string, db *supa.Client) (*models.User, error) {
	var users []models.User
	_, err := db.From("users").Select("*", "", false).Eq("stripe_customer_id", customerID).Limit(1, "").ExecuteTo(&users)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, ErrUserNotFound
	}
	return &users[0], nil
}

// UpdateGitHubToken stores the encrypted GitHub access token and username
func UpdateGitHubToken(userID string, accessToken string, username string, db *supa.Client) error {
	// Encrypt the token before storing
	encryptedToken, err := utils.EncryptToken(accessToken)
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"github_access_token": encryptedToken,
		"github_username":     username,
		"updated_at":          time.Now(),
	}

	var updatedUser dto.UserDTO
	_, err = db.From("users").Update(updates, "", "").Eq("id", userID).Single().ExecuteTo(&updatedUser)
	return err
}

// GetGitHubToken retrieves and decrypts the GitHub access token for a user
func GetGitHubToken(userID string, db *supa.Client) (string, error) {
	user, err := GetUserByID(userID, db)
	if err != nil {
		return "", err
	}

	if user.GitHubAccessToken == "" {
		return "", errors.New("user has no GitHub token stored")
	}

	// Decrypt the token before returning
	decryptedToken, err := utils.DecryptToken(user.GitHubAccessToken)
	if err != nil {
		return "", err
	}

	return decryptedToken, nil
}

// GetUserGitHubInfo retrieves GitHub username and returns it (username is stored unencrypted)
func GetUserGitHubInfo(userID string, db *supa.Client) (username string, err error) {
	user, err := GetUserByID(userID, db)
	if err != nil {
		return "", err
	}

	if user.GitHubUsername == "" {
		return "", errors.New("user has no GitHub account linked")
	}

	return user.GitHubUsername, nil
}
