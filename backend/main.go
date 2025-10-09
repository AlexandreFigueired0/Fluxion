package main

import (
	"fluxion-be/internal/db"
	"fluxion-be/internal/handlers"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

const address = "localhost:8080"

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	r := gin.Default()

	db_conn, err := db.NewClient()
	if err != nil {
		log.Fatalf("Failed to create database connection: %v", err)
	}
	generateHandler := &handlers.GenerateHandler{DB: db_conn}
	debugHandler := &handlers.DebugHandler{DB: db_conn}

	r.POST("/generate", generateHandler.GeneratePipelineConfig)
	r.POST("/debug", debugHandler.DebugPipelineConfig)

	log.Println("Starting backend server on", address)
	r.Run(address)
}
