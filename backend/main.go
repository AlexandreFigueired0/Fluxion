package main

import (
	"fluxion-be/internal/db"
	"fluxion-be/internal/handlers"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const address = "0.0.0.0:8080"

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // your Next.js dev URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	db_conn, err := db.NewClient()
	if err != nil {
		log.Fatalf("Failed to create database connection: %v", err)
	}
	generateHandler := &handlers.GenerateHandler{DB: db_conn}
	debugHandler := &handlers.DebugHandler{DB: db_conn}

	commands := r.Group("/api")
	commands.POST("/generate", generateHandler.GeneratePipelineConfig)
	commands.POST("/debug", debugHandler.DebugPipelineConfig)

	authHandler := &handlers.AuthHandler{DB: db_conn}
	auth := r.Group("/api/auth")
	auth.POST("/signup", authHandler.HandleSignup) // Email/password signup
	auth.POST("/login", authHandler.HandleLogin)   // Email/password login
	auth.POST("/oauth", authHandler.HandleOAuth)   // Google/GitHub OAuth

	// User routes
	userHandler := &handlers.UserHandler{DB: db_conn}
	userRoutes := r.Group("/api/users")
	userRoutes.GET("/:id", userHandler.GetUserByID)

	log.Println("Starting backend server on", address)
	r.Run(address)
}
