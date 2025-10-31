package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"fluxion-be/internal/db"
	"fluxion-be/internal/stripe"

	"github.com/gin-gonic/gin"
	stripesdk "github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
	supa "github.com/supabase-community/supabase-go"
)

type WebhookHandler struct {
	DB *supa.Client
}

// HandleStripeWebhook handles incoming Stripe webhook events
func (h *WebhookHandler) HandleStripeWebhook(c *gin.Context) {
	const MaxBodySize = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodySize)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading request body: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "error reading request body"})
		return
	}

	event := stripesdk.Event{}

	// Parse the event first
	if err := json.Unmarshal(payload, &event); err != nil {
		log.Printf("⚠️  Webhook error while parsing basic request: %v\n", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "error parsing webhook JSON"})
		return
	}

	// Verify the event came from Stripe
	signatureHeader := c.GetHeader("Stripe-Signature")
	webhookSecret := stripe.GetWebhookSecret()

	event, err = webhook.ConstructEvent(payload, signatureHeader, webhookSecret)
	if err != nil {
		log.Printf("⚠️  Webhook signature verification failed. %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "webhook signature verification failed"})
		return
	}

	// Handle the event
	switch event.Type {
	case "checkout.session.completed":
		h.handleCheckoutSessionCompleted(event)
	default:
		log.Printf("Unhandled event type: %s\n", event.Type)
	}

	c.JSON(http.StatusOK, gin.H{"status": "received"})
}

// handleCheckoutSessionCompleted handles successful checkouts (both subscriptions and one-time)
func (h *WebhookHandler) handleCheckoutSessionCompleted(event stripesdk.Event) {
	var session stripesdk.CheckoutSession
	err := json.Unmarshal(event.Data.Raw, &session)
	if err != nil {
		log.Printf("Error parsing checkout.session.completed: %v\n", err)
		return
	}

	// Get metadata
	userID := session.Metadata["user_id"]
	planType := session.Metadata["type"]
	planID := session.Metadata["resourceID"]

	if userID == "" {
		log.Printf("Error: no user_id in metadata for session %s\n", session.ID)
		return
	}

	// Get credits to add
	credits := stripe.GetCreditsForPlan(planType, planID)
	if credits == 0 {
		log.Printf("Error: could not determine credits for type=%s, planID=%s\n", planType, planID)
		return
	}

	// Add credit transaction
	reason := "Payment processed"
	source := "stripe"

	err = db.AddCreditTransaction(userID, credits, reason, source, h.DB)
	if err != nil {
		log.Printf("Error adding credit transaction for user %s: %v\n", userID, err)
		return
	}

	log.Printf("✅ Added %d credits to user %s (checkout session %s)\n", credits, userID, session.ID)
}
