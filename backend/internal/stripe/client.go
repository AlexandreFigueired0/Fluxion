package stripe

import (
	"os"

	"github.com/stripe/stripe-go/v81"
)

// InitStripe initializes the Stripe client with the secret key
func InitStripe() error {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" {
		panic("STRIPE_SECRET_KEY not set in environment")
	}

	stripe.Key = secretKey
	return nil
}

// GetPriceID returns the Stripe price ID based on type and plan
func GetPriceID(priceType string, planID string) string {
	switch priceType {
	case "subscription":
		switch planID {
		case "indie":
			return os.Getenv("STRIPE_PRICE_INDIE")
		case "pro":
			return os.Getenv("STRIPE_PRICE_PRO")
		case "ultra":
			return os.Getenv("STRIPE_PRICE_ULTRA")
		}
	case "credits":
		switch planID {
		case "10":
			return os.Getenv("STRIPE_PRICE_CREDITS_10")
		case "25":
			return os.Getenv("STRIPE_PRICE_CREDITS_25")
		case "60":
			return os.Getenv("STRIPE_PRICE_CREDITS_60")
		case "150":
			return os.Getenv("STRIPE_PRICE_CREDITS_150")
		}
	}
	return ""
}
