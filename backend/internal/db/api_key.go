package db

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"fluxion-be/internal/models"

	supa "github.com/supabase-community/supabase-go"
)

const keyPrefix = "FLX_"

var ErrAPIKeyNotFound = errors.New("api key not found")

func CreateAPIKey(userID string, name string, db *supa.Client) (*models.APIKey, string, error) {
	unhashedKey := keyPrefix + GenerateRandomString(32)
	h := sha256.New()
	h.Write([]byte(unhashedKey))
	keyHash := hex.EncodeToString(h.Sum(nil))
	keyStart := unhashedKey[:13]

	newKey := map[string]interface{}{
		"user_id":    userID,
		"key_hash":   keyHash,
		"key_prefix": keyStart,
		"name":       name,
		"created_at": time.Now(),
	}

	var apiKey models.APIKey
	_, err := db.From("api_keys").Insert(newKey, false, "", "", "").Single().ExecuteTo(&apiKey)
	if err != nil {
		return nil, "", err
	}
	// When creating the API key, we only return the unhashed key to the user once.
	return &apiKey, unhashedKey, nil
}

func GetAPIKeyByUserID(userID string, db *supa.Client) (models.APIKey, error) {
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

func RevokeAPIKey(userID string, name string, db *supa.Client) error {
	updates := map[string]interface{}{
		"revoked_at": time.Now(),
	}

	var updated []models.APIKey

	_, err := db.
		From("api_keys").
		Update(updates, "", "").
		Eq("user_id", userID).
		Eq("name", name).
		Filter("revoked_at", "is", "null").
		ExecuteTo(&updated)
	if err != nil {
		return err
	}

	if len(updated) == 0 {
		return ErrAPIKeyNotFound
	}

	return nil
}

func GenerateRandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		randomByte := make([]byte, 1)
		if _, err := rand.Read(randomByte); err != nil {
			// Fallback to time-based if rand fails (shouldn't happen)
			b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		} else {
			b[i] = letters[randomByte[0]%byte(len(letters))]
		}
	}
	return string(b)
}
