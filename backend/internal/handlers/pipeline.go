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
