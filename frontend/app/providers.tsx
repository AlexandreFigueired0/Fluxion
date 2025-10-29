'use client'

import { SessionProvider } from "next-auth/react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </SessionProvider>
  )
}