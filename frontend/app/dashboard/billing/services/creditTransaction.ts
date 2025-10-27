
interface CreditTransaction {
    id: string;
    user_id: string;
    amount: number;
    reason: string;
    source: string;
    created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class CreditTransactionService {
    /**
     * Fetch credit transactions for a user
     * @param userToken - Auth token
     * @param userID - User ID
     */
    async listCreditTransactionsByUserID(
        userToken: string,
        userID: string
    ): Promise<CreditTransaction[]> {
        const response = await fetch(`${API_BASE_URL}/api/credits/${userID}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${userToken}`,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch credit transactions");
        }

        return response.json();
    }

    /**
     * Create a new credit transaction for a user
     * @param userToken - Auth token
     * @param userID - User ID
     * @param amount - Amount of credits
     * @param reason - Reason for the transaction
     * @param source - Source of the transaction
     */
    async createCreditTransaction(
        userToken: string,
        userID: string,
        amount: number,
        reason: string,
        source: string
    ): Promise<CreditTransaction> {
        const response = await fetch(`${API_BASE_URL}/api/credits/${userID}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${userToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount,
                reason,
                source
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create credit transaction");
        }

        return response.json();
    }
}

export const creditTransactionService = new CreditTransactionService();