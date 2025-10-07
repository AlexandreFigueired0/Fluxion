package main

import (
	"fluxion-be/internal"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.POST("/generate", internal.GeneratePipelineConfig)

	r.Run("localhost:8080") // listen and serve on localhost:8080
}
