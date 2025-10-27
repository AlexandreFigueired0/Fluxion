package handlers

import (
	db "fluxion-be/internal/db"
	"fluxion-be/internal/dto"
	"fluxion-be/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	supa "github.com/supabase-community/supabase-go"
)

const DEFAULT_SIZE_LIMIT = 4

type CreditTransactionHandler struct {
	DB *supa.Client
}

func (h *CreditTransactionHandler) GetCreditTransactions(c *gin.Context) {
	userID := c.Param("user_id")

	var creditTransactions []models.CreditTransaction
	creditTransactions, err := db.GetCreditTransactionsByUserID(userID, DEFAULT_SIZE_LIMIT, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve credit transactions"})
		return
	}

	c.JSON(http.StatusOK, creditTransactions)
}

func (h *CreditTransactionHandler) CreateCreditTransaction(c *gin.Context) {
	var newCreditTransaction dto.CreditTransactionDTO

	if err := c.ShouldBindJSON(&newCreditTransaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	err := db.AddCreditTransaction(newCreditTransaction.UserID, newCreditTransaction.Amount, newCreditTransaction.Reason, newCreditTransaction.Source, h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create credit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Credit transaction created successfully"})
}
