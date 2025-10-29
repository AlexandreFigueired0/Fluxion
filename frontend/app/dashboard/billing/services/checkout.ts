import { loadStripe } from "@stripe/stripe-js";

export interface CheckoutSessionRequest {
  type: "subscription" | "credits";
  planId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

class CheckoutService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  }

  async createCheckoutSession(
    request: CheckoutSessionRequest,
    accessToken: string
  ): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${this.backendUrl}/api/checkout/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    return response.json();
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
    );

    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async handleCheckout(
    request: CheckoutSessionRequest,
    accessToken: string
  ): Promise<void> {
    try {
      const { sessionId } = await this.createCheckoutSession(
        request,
        accessToken
      );
      await this.redirectToCheckout(sessionId);
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  }
}

export default new CheckoutService();
