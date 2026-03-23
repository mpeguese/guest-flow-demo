// app/components/booking/StripeCheckoutForm.tsx
"use client"

import { FormEvent, useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

type StripeCheckoutFormProps = {
  clientSecret: string
  returnUrl: string
}

function InnerCheckoutForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe()
  const elements = useElements()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) return

    try {
      setErrorMessage("")
      setIsSubmitting(true)

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}${returnUrl}`,
        },
      })

      if (result.error) {
        setErrorMessage(result.error.message || "Payment could not be completed.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 26,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 16px 34px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          color: "#64748B",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Secure payment: Test Mode
      </div>
        {/* REMOVE TEST TEXT FOR STRIPE CC NUMBERS*/}
      {/* <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#475569",
          marginBottom: 18,
        }}
      >
        Test mode only. Use card number 4242 4242 4242 4242, any future date,
        any 3-digit CVC, and any ZIP code.
      </div> */}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          <PaymentElement />
        </div>

        {errorMessage ? (
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              borderRadius: 14,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          style={{
            width: "100%",
            marginTop: 16,
            height: 54,
            border: "none",
            borderRadius: 18,
            background: isSubmitting ? "#93C5FD" : "#2563EB",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: isSubmitting ? "default" : "pointer",
            boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
          }}
        >
          {isSubmitting ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  )
}

export default function StripeCheckoutForm({
  clientSecret,
  returnUrl,
}: StripeCheckoutFormProps) {
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#2563EB",
          colorText: "#0F172A",
          colorDanger: "#B91C1C",
          colorBackground: "#FFFFFF",
          borderRadius: "16px",
        },
      },
    }),
    [clientSecret]
  )

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 20,
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#B91C1C",
          fontWeight: 700,
        }}
      >
        Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerCheckoutForm returnUrl={returnUrl} />
    </Elements>
  )
}