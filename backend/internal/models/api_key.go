package models

import "time"

type APIKey struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	KeyHash    string    `json:"key_hash"`
	KeyPrefix  string    `json:"key_prefix"`
	Name       string    `json:"name"`
	CreatedAt  time.Time `json:"created_at"`
	LastUsedAt time.Time `json:"last_used_at"`
	RevokedAt  time.Time `json:"revoked_at"`
}
