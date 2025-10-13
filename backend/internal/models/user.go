package models

type User struct {
    id        uint      `json:"id"`
    email     string    `json:"email"`
    createdAt time.Time `json:"created_at"`
	passwordHash string    `json:"password_hash"`
	credits	 int       `json:"credits"`
	stripeCustomerID string `json:"stripe_customer_id"`
	name              string `json:"name"`
	updatedAt         time.Time `json:"updated_at"`
	provider          string `json:"provider"` // "credentials", "google", "github"
	providerID        string `json:"provider_id"` // e.g. Google or GitHub user ID
}