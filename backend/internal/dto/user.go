package dto

import "time"

type UserDTO struct {
	ID                    string    `json:"id"`
	Name                  string    `json:"name"`
	Email                 string    `json:"email"`
	SubscriptionCredits   int       `json:"subscription_credits"`
	PermanentCredits      int       `json:"permanent_credits"`
	SubscriptionPlanID    string    `json:"subscription_plan_id"`
	SubscriptionPeriodEnd time.Time `json:"subscription_period_end"`
	GitHubUsername        string    `json:"github_username,omitempty"`
	GitHubConnected       bool      `json:"github_connected"`
}
