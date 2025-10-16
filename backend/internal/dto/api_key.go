package dto

type APIKeyDTO struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Name      string `json:"name"`
	KeyPrefix string `json:"key_prefix"`
	CreatedAt string `json:"created_at"`
}
