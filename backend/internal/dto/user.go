package dto

type UserDTO struct {
	ID                    string `json:"id"`
	Name                  string `json:"name"`
	Email                 string `json:"email"`
	SubscriptionCredits   int    `json:"subscription_credits"`
	PermanentCredits      int    `json:"permanent_credits"`
	SubscriptionPlanID    string `json:"subscription_plan_id"`
	SubscriptionPeriodEnd string `json:"subscription_period_end"`
}
