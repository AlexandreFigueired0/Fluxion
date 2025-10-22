package models

import "time"

type User struct {
	ID               string    `json:"id"`
	Email            string    `json:"email"`
	CreatedAt        time.Time `json:"created_at"`
	PasswordHash     string    `json:"password_hash"`
	Credits          float64   `json:"credits"`
	StripeCustomerID string    `json:"stripe_customer_id"`
	Name             string    `json:"name"`
	UpdatedAt        time.Time `json:"updated_at"`
	Provider         string    `json:"provider"`    // "credentials", "google", "github"
	ProviderID       string    `json:"provider_id"` // e.g. Google or GitHub user ID
}
