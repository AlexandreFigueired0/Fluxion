package dto

type CheckoutSessionRequest struct {
	Type       string `json:"type" binding:"required,oneof=subscription credits"`
	ResourceID string `json:"resourceID" binding:"required"`
}

type CheckoutSessionResponse struct {
	SessionID string `json:"sessionID"`
}
