package db

import (
	"time"

	"fluxion-be/internal/models"

	supa "github.com/supabase-community/supabase-go"
)

const keyPrefix = "FLX_"

func CreateAPIKey(userID string, name string, db supa.Client) (*models.APIKey, error) {
	key := keyPrefix + GenerateRandomString(32)

	newKey := map[string]interface{}{
		"user_id":    userID,
		"key":        key,
		"name":       name,
		"created_at": time.Now(),
		"updated_at": time.Now(),
	}

	var apiKey models.APIKey
	_, err := db.From("api_keys").Insert(newKey, false, "", "", "").Single().ExecuteTo(&apiKey)
	if err != nil {
		return nil, err
	}
	return &apiKey, nil
}

func GetAPIKeyByUserID(userID string, db supa.Client) (models.APIKey, error) {
	var apiKeys models.APIKey

	_, err := db.
		From("api_keys").
		Select("*", "", false).
		Eq("user_id", userID).
		Filter("revoked_at", "is", "null").
		Single().
		ExecuteTo(&apiKeys)
	if err != nil {
		return models.APIKey{}, err
	}

	return apiKeys, nil
}
func RevokeAPIKey(user_id string, db supa.Client) error {
	// Use a map to update revoked_at
	updates := map[string]interface{}{
		"revoked_at": time.Now(),
	}

	// Use slice to hold returned row(s) (optional, depending on version)
	var updated models.APIKey

	_, err := db.
		From("api_keys").
		Update(updates, "", "").
		Eq("user_id", user_id).
		Single().
		ExecuteTo(&updated)
	if err != nil {
		return err
	}

	return nil
}

func GenerateRandomString(n int) string {
	var letters string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
