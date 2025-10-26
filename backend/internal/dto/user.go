package dto

type UserDTO struct {
	ID                  string `json:"id"`
	Name                string `json:"name"`
	Email               string `json:"email"`
	SubscriptionCredits int    `json:"subscription_credits"`
	PermanentCredits    int    `json:"permanent_credits"`
}
