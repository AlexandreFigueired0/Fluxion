package dto

type UserDTO struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Email   string  `json:"email"`
	Credits float64 `json:"credits"`
}
