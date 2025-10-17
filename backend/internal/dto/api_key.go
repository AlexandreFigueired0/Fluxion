package dto

import "time"

type APIKeyDTO struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Name       string    `json:"name"`
	Key        string    `json:"key"` // Only returned on creation
	KeyPrefix  string    `json:"key_prefix"`
	CreatedAt  time.Time `json:"created_at"`
	LastUsedAt time.Time `json:"last_used_at"`
}
