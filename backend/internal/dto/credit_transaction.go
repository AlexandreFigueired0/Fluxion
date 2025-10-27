package dto

import "time"

type CreditTransactionDTO struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Amount    int       `json:"amount"`
	Reason    string    `json:"reason"`
	Source    string    `json:"source"`
	CreatedAt time.Time `json:"created_at"`
}
