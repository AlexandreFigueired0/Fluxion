package dto

import (
	"encoding/json"
	"time"
)

// PipelineDTO represents the data transfer object for a pipeline.
type PipelineDTO struct {
	ID           string          `json:"id"`
	UserID       string          `json:"user_id"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	PipelineJSON json.RawMessage `json:"pipeline_json"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}
