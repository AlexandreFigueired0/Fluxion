package db

import (
	"fluxion-be/internal/models"
	"time"

	supa "github.com/supabase-community/supabase-go"
)

// CreatePipeline creates a new pipeline in the database.
func CreatePipeline(userID, name, description, configYAML string, db *supa.Client) (*models.Pipeline, error) {
	newPipeline := map[string]interface{}{
		"user_id":     userID,
		"name":        name,
		"description": description,
		"config_yaml": configYAML,
		"created_at":  time.Now(),
		"updated_at":  time.Now(),
	}

	var pipeline models.Pipeline
	_, err := db.From("pipelines").Insert(newPipeline, false, "", "", "").Single().ExecuteTo(&pipeline)
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}
