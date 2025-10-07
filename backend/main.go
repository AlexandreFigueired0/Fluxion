package main

import (
	"fluxion-be/internal"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

const address = "localhost:8080"

func main() {
	// Setup logger
	logFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}
	log.SetOutput(logFile)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	r := gin.Default()

	r.POST("/generate", internal.GeneratePipelineConfig)
	r.POST("/debug", internal.DebugPipelineConfig)

	log.Println("Starting backend server on", address)
	r.Run(address)
}
