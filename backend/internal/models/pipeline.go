package models

import (
	"encoding/json"
	"time"
)

type Pipeline struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	ConfigYAML  json.RawMessage `json:"config_yaml"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
