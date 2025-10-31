package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"fluxion-be/internal/db"
	"fluxion-be/internal/models"
	"fluxion-be/internal/stripe"

	"github.com/gin-gonic/gin"
	stripesdk "github.com/stripe/stripe-go/v81"
	subscriptionsdk "github.com/stripe/stripe-go/v81/subscription"
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
		log.Printf("Webhook error while parsing basic request: %v\n", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "error parsing webhook JSON"})
		return
	}

	// Verify the event came from Stripe
	signatureHeader := c.GetHeader("Stripe-Signature")
	webhookSecret := stripe.GetWebhookSecret()

	event, err = webhook.ConstructEvent(payload, signatureHeader, webhookSecret)
	if err != nil {
		log.Printf("Webhook signature verification failed. %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "webhook signature verification failed"})
		return
	}

	// Handle the event
	switch event.Type {
	case "checkout.session.completed":
		h.handleCheckoutSessionCompleted(event)
	case "invoice.payment_succeeded":
		h.handleInvoicePaymentSucceeded(event)
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
	resourceType := session.Metadata["type"]
	planID := session.Metadata["resourceID"]

	if userID == "" {
		log.Printf("Error: no user_id in metadata for session %s\n", session.ID)
		return
	}

	// Verify user exists
	user, err := db.GetUserByID(userID, h.DB)
	if err != nil {
		log.Printf("Error: user %s not found for session %s\n", userID, session.ID)
		return
	}

	// Persist Stripe customer ID for renewal lookups
	if session.Customer != nil && session.Customer.ID != "" && user.StripeCustomerID != session.Customer.ID {
		if _, err := db.UpdateUserStripeCustomerID(userID, session.Customer.ID, h.DB); err != nil {
			log.Printf("Warning: failed to update Stripe customer ID for user %s: %v\n", userID, err)
		}
	}

	// Get credits to add
	credits := stripe.GetCreditsForPlan(resourceType, planID)
	if credits == 0 {
		log.Printf("Error: could not determine credits for type=%s, planID=%s\n", resourceType, planID)
		return
	}

	// if is subscription, increase user's subscription credits
	if resourceType == "subscription" {
		_, err = db.UpdateUserSubscriptionCredits(userID, credits, h.DB)
		if err != nil {
			log.Printf("Error increasing subscription credits for user %s: %v\n", userID, err)
			return
		}
		_, err = db.UpdateUserSubscriptionPlanID(userID, planID, h.DB)
		if err != nil {
			log.Printf("Error updating subscription plan ID for user %s: %v\n", userID, err)
			return
		}
	} else {
		// Increase user credits
		_, err = db.UpdateUserPermanentCredits(userID, user.PermanentCredits+credits, h.DB)
		if err != nil {
			log.Printf("Error increasing credits for user %s: %v\n", userID, err)
			return
		}
	}

	// Add credit transaction
	var reason string
	if resourceType == "subscription" {
		reason = "Subscription payment processed"
	} else {
		reason = "One-time credit purchase"
	}
	source := "stripe"

	err = db.AddCreditTransaction(userID, credits, reason, source, h.DB)
	if err != nil {
		log.Printf("Error adding credit transaction for user %s: %v\n", userID, err)
		return
	}

	log.Printf("Added %d credits to user %s (checkout session %s)\n", credits, userID, session.ID)
}

// handleInvoicePaymentSucceeded handles subscription renewals (monthly recurring)
func (h *WebhookHandler) handleInvoicePaymentSucceeded(event stripesdk.Event) {
	var invoice stripesdk.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		log.Printf("Error parsing invoice.payment_succeeded: %v\n", err)
		return
	}

	if invoice.Subscription == nil || invoice.Subscription.ID == "" {
		log.Printf("Skipping invoice %s - subscription details missing\n", invoice.ID)
		return
	}

	subscriptionID := invoice.Subscription.ID
	sub, err := subscriptionsdk.Get(subscriptionID, nil)
	if err != nil {
		log.Printf("Error retrieving subscription %s: %v\n", subscriptionID, err)
		return
	}

	userID := sub.Metadata["user_id"]
	planID := sub.Metadata["resourceID"]
	customerID := ""

	if sub.Customer != nil && sub.Customer.ID != "" {
		customerID = sub.Customer.ID
	} else if invoice.Customer != nil && invoice.Customer.ID != "" {
		customerID = invoice.Customer.ID
	}

	var user *models.User
	if userID != "" {
		if u, err := db.GetUserByID(userID, h.DB); err == nil {
			user = u
		} else {
			log.Printf("Warning: could not fetch user %s for subscription %s: %v\n", userID, subscriptionID, err)
		}
	}

	if user == nil && customerID != "" {
		if u, err := db.GetUserByStripeCustomerID(customerID, h.DB); err == nil {
			user = u
			userID = u.ID
		} else {
			log.Printf("Warning: no user found for Stripe customer %s: %v\n", customerID, err)
		}
	}

	if user == nil {
		log.Printf("Error: unable to resolve user for subscription %s (invoice %s)\n", subscriptionID, invoice.ID)
		return
	}

	if planID == "" {
		planID = user.SubscriptionPlanID
	}

	if planID == "" {
		log.Printf("Warning: user %s has no subscription plan set\n", userID)
		return
	}

	credits := stripe.GetCreditsForPlan("subscription", planID)
	if credits == 0 {
		log.Printf("Error: could not determine credits for subscription planID=%s\n", planID)
		return
	}

	if _, err := db.UpdateUserSubscriptionCredits(userID, credits, h.DB); err != nil {
		log.Printf("Error renewing subscription credits for user %s: %v\n", userID, err)
		return
	}

	if _, err := db.UpdateUserSubscriptionPlanID(userID, planID, h.DB); err != nil {
		log.Printf("Warning: unable to refresh subscription plan for user %s: %v\n", userID, err)
	}

	if customerID != "" && user.StripeCustomerID != customerID {
		if _, err := db.UpdateUserStripeCustomerID(userID, customerID, h.DB); err != nil {
			log.Printf("Warning: failed to persist Stripe customer ID for user %s: %v\n", userID, err)
		}
	}

	reason := "Monthly subscription renewal"
	source := "stripe"
	if err := db.AddCreditTransaction(userID, credits, reason, source, h.DB); err != nil {
		log.Printf("Error adding credit transaction for renewal for user %s: %v\n", userID, err)
		return
	}

	log.Printf("Renewed %d credits for user %s (invoice %s, subscription %s)\n", credits, userID, invoice.ID, subscriptionID)
}
