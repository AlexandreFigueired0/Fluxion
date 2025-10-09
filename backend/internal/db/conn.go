package db

import (
	"fmt"
	"os"

	supa "github.com/supabase-community/supabase-go"
)

func NewClient() (*supa.Client, error) {
	url := os.Getenv("DATABASE_URL")
	key := os.Getenv("SUPABASE_KEY")
	if url == "" || key == "" {
		return nil, fmt.Errorf("DATABASE_URL or SUPABASE_KEY not set")
	}

	client, err := supa.NewClient(url, key, &supa.ClientOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to create supabase client: %w", err)
	}

	return client, nil
}
