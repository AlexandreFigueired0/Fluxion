package models

import "time"

type CreditTransaction struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Amount    int       `json:"amount"` // positive for grants, negative for spends
	Reason    string    `json:"reason"` // e.g. 'subscription_refill', 'credit_pack', 'usage'
	Source    string    `json:"source"` // e.g. 'stripe', 'system'
	CreatedAt time.Time `json:"created_at"`
}
