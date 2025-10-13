package models

type ApiKeys struct {
    id        uint      `json:"id"`
   	userID    uint      `json:"user_id"`
	key_hash string    `json:"key_hash"`
	key_prefix string    `json:"key_prefix"`
	name	   string    `json:"name"`
	createdAt time.Time `json:"created_at"`
	lastUsedAt time.Time `json:"last_used_at"`
	revokedAt time.Time `json:"revoked_at"`
}