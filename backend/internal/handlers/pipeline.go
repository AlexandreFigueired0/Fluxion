package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	supa "github.com/supabase-community/supabase-go"
)

type PipelineHandler struct {
	DB *supa.Client
}

// CreatePipelineHandler handles the creation of a new pipeline.
func (h *PipelineHandler) CreatePipeline(c *gin.Context) {
	var pipelineDTO dto.PipelineDTO
	if err := c.ShouldBindJSON(&pipelineDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId := pipelineDTO.UserID

	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot create pipeline for other user"})
		return
	}

	pipeline, err := db.CreatePipeline(
		pipelineDTO.UserID,
		pipelineDTO.Name,
		pipelineDTO.Description,
		pipelineDTO.PipelineJSON,
		h.DB,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	createdPipelineDTO := dto.PipelineDTO{
		ID:           pipeline.ID,
		UserID:       pipeline.UserID,
		Name:         pipeline.Name,
		Description:  pipeline.Description,
		PipelineJSON: pipeline.PipelineJSON,
		CreatedAt:    pipeline.CreatedAt,
		UpdatedAt:    pipeline.UpdatedAt,
	}

	c.JSON(http.StatusCreated, createdPipelineDTO)
}

// GetPipelineHandler retrieves a pipeline by its ID.
func (h *PipelineHandler) GetPipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	pipeline, err := db.GetPipelineByID(pipelineID, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pipelineDTO := dto.PipelineDTO{
		ID:           pipeline.ID,
		UserID:       pipeline.UserID,
		Name:         pipeline.Name,
		Description:  pipeline.Description,
		PipelineJSON: pipeline.PipelineJSON,
		CreatedAt:    pipeline.CreatedAt,
		UpdatedAt:    pipeline.UpdatedAt,
	}

	userId := pipeline.UserID
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot get other user's pipeline"})
		return
	}

	c.JSON(http.StatusOK, pipelineDTO)
}

// DeletePipelineHandler deletes a pipeline by its ID.
func (h *PipelineHandler) DeletePipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	pipeline, err := db.GetPipelineByID(pipelineID, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userId := pipeline.UserID
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete other user's pipeline"})
		return
	}

	if err := db.DeletePipelineByID(pipelineID, h.DB); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdatePipelineHandler updates an existing pipeline.
func (h *PipelineHandler) UpdatePipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	pipeline, err := db.GetPipelineByID(pipelineID, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userId := pipeline.UserID
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot update other user's pipeline"})
		return
	}

	var pipelineDTO dto.PipelineDTO
	if err := c.ShouldBindJSON(&pipelineDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedPipeline, err := db.UpdatePipeline(
		pipelineID,
		pipelineDTO.Name,
		pipelineDTO.Description,
		pipelineDTO.PipelineJSON,
		h.DB,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	updatedPipelineDTO := dto.PipelineDTO{
		ID:           updatedPipeline.ID,
		UserID:       updatedPipeline.UserID,
		Name:         updatedPipeline.Name,
		Description:  updatedPipeline.Description,
		PipelineJSON: updatedPipeline.PipelineJSON,
		CreatedAt:    updatedPipeline.CreatedAt,
		UpdatedAt:    updatedPipeline.UpdatedAt,
	}

	c.JSON(http.StatusOK, updatedPipelineDTO)
}

// ListUserPipelinesHandler lists all pipelines for a specific user.
func (h *PipelineHandler) ListUserPipelines(c *gin.Context) {
	userId := c.Param("user_id")

	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	if userClaims["id"] != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's pipelines"})
		return
	}

	pipelines, err := db.GetPipelinesByUserID(userId, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var pipelineDTOs []dto.PipelineDTO
	for _, pipeline := range pipelines {
		pipelineDTOs = append(pipelineDTOs, dto.PipelineDTO{
			ID:           pipeline.ID,
			UserID:       pipeline.UserID,
			Name:         pipeline.Name,
			Description:  pipeline.Description,
			PipelineJSON: pipeline.PipelineJSON,
			CreatedAt:    pipeline.CreatedAt,
			UpdatedAt:    pipeline.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, pipelineDTOs)
}
