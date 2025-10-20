package db

import (
	"encoding/json"
	"fluxion-be/internal/models"
	"time"

	supa "github.com/supabase-community/supabase-go"
)

// CreatePipeline creates a new pipeline in the database.
func CreatePipeline(userID, name, description string, configYAML json.RawMessage, db *supa.Client) (*models.Pipeline, error) {
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

// GetPipelineByID retrieves a pipeline by its ID.
func GetPipelineByID(pipelineID string, db *supa.Client) (*models.Pipeline, error) {
	var pipeline models.Pipeline
	_, err := db.From("pipelines").Select("*", "", false).Eq("id", pipelineID).Single().ExecuteTo(&pipeline)
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}

// DeletePipelineByID deletes a pipeline by its ID.
func DeletePipelineByID(pipelineID string, db *supa.Client) error {
	_, _, err := db.From("pipelines").Delete("", "").Eq("id", pipelineID).Execute()
	return err
}

// UpdatePipeline updates an existing pipeline's details.
func UpdatePipeline(pipelineID, name, description string, configYAML json.RawMessage, db *supa.Client) (*models.Pipeline, error) {
	updatedPipeline := map[string]interface{}{
		"name":        name,
		"description": description,
		"config_yaml": configYAML,
		"updated_at":  time.Now(),
	}

	var pipeline models.Pipeline
	_, err := db.From("pipelines").Update(updatedPipeline, "", "").Eq("id", pipelineID).Single().ExecuteTo(&pipeline)
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}

// GetPipelinesByUserID retrieves all pipelines for a specific user.
func GetPipelinesByUserID(userID string, db *supa.Client) ([]models.Pipeline, error) {
	var pipelines []models.Pipeline
	_, err := db.From("pipelines").Select("*", "", false).Eq("user_id", userID).ExecuteTo(&pipelines)
	if err != nil {
		return nil, err
	}
	return pipelines, nil
}
