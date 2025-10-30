package main

import (
	"fluxion-be/internal/db"
	"fluxion-be/internal/handlers"
	"fluxion-be/internal/middleware"
	stripeClient "fluxion-be/internal/stripe"
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

	// Initialize Stripe
	if err := stripeClient.InitStripe(); err != nil {
		log.Fatalf("Failed to initialize Stripe: %v", err)
	}

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

	authHandler := &handlers.AuthHandler{DB: db_conn}
	auth := r.Group("/api/auth")
	auth.POST("/signup", authHandler.HandleSignup) // Email/password signup
	auth.POST("/login", authHandler.HandleLogin)   // Email/password login
	auth.POST("/oauth", authHandler.HandleOAuth)   // Google/GitHub OAuth

	// Checkout routes (protected)
	checkoutHandler := &handlers.CheckoutHandler{}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())

	checkout := protected.Group("/checkout")
	checkout.POST("/session", checkoutHandler.CreateCheckoutSession)

	commands := protected.Group("/commands")
	generateHandler := &handlers.GenerateHandler{DB: db_conn}
	debugHandler := &handlers.DebugHandler{DB: db_conn}
	commands.POST("/generate", generateHandler.GeneratePipelineConfig)
	commands.POST("/debug", debugHandler.DebugPipelineConfig)

	// User routes
	userHandler := &handlers.UserHandler{DB: db_conn}
	userRoutes := protected.Group("/users")
	userRoutes.GET("/:id", userHandler.GetUserByID)

	// API Key routes - must be defined before the catch-all :id route
	apiKeyHandler := &handlers.APIKeyHandler{DB: db_conn}
	userRoutes.GET("/:id/apikey", apiKeyHandler.GetAPIKeyByUserID)
	userRoutes.POST("/:id/apikey", apiKeyHandler.CreateAPIKey)
	userRoutes.DELETE("/:id/apikey", apiKeyHandler.DeleteAPIKey)

	// Credit Transaction routes
	creditHandler := &handlers.CreditTransactionHandler{DB: db_conn}
	creditRoutes := protected.Group("/credits")
	creditRoutes.GET("/user/:user_id", creditHandler.ListCreditTransactionsByUserID)
	creditRoutes.POST("/user/:user_id", creditHandler.CreateCreditTransaction)

	// Pipeline routes
	pipelineHandler := &handlers.PipelineHandler{DB: db_conn}
	pipelineRoutes := protected.Group("/pipelines")
	pipelineRoutes.GET("/user/:user_id", pipelineHandler.ListUserPipelines)
	pipelineRoutes.POST("", pipelineHandler.CreatePipeline)
	pipelineRoutes.GET("/:id", pipelineHandler.GetPipeline)
	pipelineRoutes.PUT("/:id", pipelineHandler.UpdatePipeline)
	pipelineRoutes.DELETE("/:id", pipelineHandler.DeletePipeline)

	log.Println("Starting backend server on", address)
	r.Run(address)
}
