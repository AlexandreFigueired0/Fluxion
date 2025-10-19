package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
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

	pipeline, err := db.CreatePipeline(
		pipelineDTO.UserID,
		pipelineDTO.Name,
		pipelineDTO.Description,
		pipelineDTO.ConfigYAML,
		h.DB,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, pipeline)
}

// GetPipelineHandler retrieves a pipeline by its ID.
func (h *PipelineHandler) GetPipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	pipeline, err := db.GetPipelineByID(pipelineID, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pipeline)
}

// DeletePipelineHandler deletes a pipeline by its ID.
func (h *PipelineHandler) DeletePipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	if err := db.DeletePipelineByID(pipelineID, h.DB); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdatePipelineHandler updates an existing pipeline.
func (h *PipelineHandler) UpdatePipeline(c *gin.Context) {
	pipelineID := c.Param("id")
	var pipelineDTO dto.PipelineDTO
	if err := c.ShouldBindJSON(&pipelineDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pipeline, err := db.UpdatePipeline(
		pipelineID,
		pipelineDTO.Name,
		pipelineDTO.Description,
		pipelineDTO.ConfigYAML,
		h.DB,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pipeline)
}
