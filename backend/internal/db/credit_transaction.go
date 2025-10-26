package db

import (
	"fluxion-be/internal/models"
	"time"

	supa "github.com/supabase-community/supabase-go"
)

// AddCreditTransaction adds a credit transaction record
func AddCreditTransaction(userID string, amount int, reason, source string, db *supa.Client) error {
	newTransaction := map[string]interface{}{
		"user_id":    userID,
		"amount":     amount,
		"reason":     reason,
		"source":     source,
		"created_at": time.Now(),
	}

	var newCreditTransaction models.CreditTransaction

	_, err := db.From("credit_transactions").Insert(newTransaction, false, "", "", "").ExecuteTo(&newCreditTransaction)
	return err
}
