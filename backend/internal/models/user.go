package models

import "time"

type User struct {
	ID                    string    `json:"id"`
	Email                 string    `json:"email"`
	CreatedAt             time.Time `json:"created_at"`
	PasswordHash          string    `json:"password_hash"`
	PermanentCredits      int       `json:"permanent_credits"`
	SubscriptionCredits   int       `json:"subscription_credits"`
	StripeCustomerID      string    `json:"stripe_customer_id"`
	SubscriptionPlanID    string    `json:"subscription_plan_id"`
	SubscriptionPeriodEnd time.Time `json:"subscription_period_end"`
	Name                  string    `json:"name"`
	UpdatedAt             time.Time `json:"updated_at"`
	Provider              string    `json:"provider"`    // "credentials", "google", "github"
	ProviderID            string    `json:"provider_id"` // e.g. Google or GitHub user ID
	GitHubAccessToken     string    `json:"github_access_token"`
	GitHubUsername        string    `json:"github_username"`
}
