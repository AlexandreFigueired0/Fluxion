package handlers

import (
	"log"
	"net/http"
	"os"

	"fluxion-be/internal/dto"
	"fluxion-be/internal/stripe"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	stripesdk "github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

type CheckoutHandler struct{}

// CreateCheckoutSession handles the creation of a Stripe checkout session
func (h *CheckoutHandler) CreateCheckoutSession(c *gin.Context) {
	var req dto.CheckoutSessionRequest

	// Validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Get user ID from JWT claims
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userClaims := claims.(jwt.MapClaims)
	userID, ok := userClaims["id"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user claims"})
		return
	}

	// Get price ID from environment
	priceID := stripe.GetPriceID(req.Type, req.ResourceID)
	if priceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plan or credit type"})
		return
	}

	// Build success and cancel URLs
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // fallback for dev
	}

	successURL := frontendURL + "/dashboard/billing?success=true"
	cancelURL := frontendURL + "/dashboard/billing?cancelled=true"

	// Determine the quantity (for subscriptions, always 1; for credits, we could add quantity support)
	quantity := int64(1)

	// Create checkout session
	params := &stripesdk.CheckoutSessionParams{
		PaymentMethodTypes: stripesdk.StringSlice([]string{"card"}),
		Mode:               stripesdk.String(string(stripesdk.CheckoutSessionModePayment)),
		SuccessURL:         stripesdk.String(successURL),
		CancelURL:          stripesdk.String(cancelURL),
		LineItems: []*stripesdk.CheckoutSessionLineItemParams{
			{
				Price:    stripesdk.String(priceID),
				Quantity: stripesdk.Int64(quantity),
			},
		},
		// Store user ID in metadata for later retrieval in webhook
		Metadata: map[string]string{
			"user_id":    userID,
			"type":       req.Type,
			"resourceID": req.ResourceID,
		},
	}

	// For subscriptions, set mode to subscription and attach metadata so renewals can be mapped
	if req.Type == "subscription" {
		params.Mode = stripesdk.String(string(stripesdk.CheckoutSessionModeSubscription))
		params.SubscriptionData = &stripesdk.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"user_id":    userID,
				"type":       req.Type,
				"resourceID": req.ResourceID,
			},
		}
	}

	sess, err := session.New(params)
	if err != nil {
		log.Printf("Failed to create checkout session: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create checkout session"})
		return
	}

	c.JSON(http.StatusOK, dto.CheckoutSessionResponse{
		SessionID: sess.ID,
	})
}
