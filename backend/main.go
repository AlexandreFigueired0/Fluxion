package main

import (
	"fluxion-be/internal"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.POST("/generate", internal.GeneratePipelineConfig)
}
