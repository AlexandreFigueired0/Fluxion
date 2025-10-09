package db

import (
	supa "github.com/supabase-community/supabase-go"
)

type User struct {
	ID               string
	Email            string
	Password         string
	CreatedAt        string
	UpdatedAt        string
	Credits          int
	StripeCustomerID string
	Name             string
}

func GetUserByApiKey(conn *supa.Client, apiKey string) (*User, error) {
	var user User

	return &user, nil
}
