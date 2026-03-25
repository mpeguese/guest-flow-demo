// app/book/details/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import StripeCheckoutForm from "@/app/components/booking/StripeCheckoutForm"
import { useBookingCart } from "@/app/lib/booking-cart"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import {
  generateReservationCode,
  saveLatestReservation,
} from "@/app/lib/reservation-confirmation"

function formatDate(dateKey: string) {
  if (!dateKey) return "Not selected"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export default function DetailsPage() {
  const router = useRouter()
  const { items, cartCount, subtotal } = useBookingCart()

  const pricing = useMemo(() => calculateBookingPricing(subtotal), [subtotal])

  const reservationCode = useMemo(() => generateReservationCode(), [])

  const [clientSecret, setClientSecret] = useState("")
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const zoneCount = items.filter((item) => (item.itemType || "zone") === "zone").length
  const passCount = items.filter((item) => item.itemType === "pass").length

  async function initializeCheckout() {
    try {
      setCheckoutError("")
      setIsLoadingCheckout(true)
      setClientSecret("")

      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            itemType: item.itemType,
            productId: item.productId,
            zoneId: item.zoneId,
            date: item.date,
            partySize: item.partySize,
            session: item.session,
          })),
        }),
      })

      let data: any = null

      try {
        data = await response.json()
      } catch {
        throw new Error("Checkout setup returned an invalid response.")
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to initialize checkout.")
      }

      if (!data?.clientSecret || typeof data.clientSecret !== "string") {
        throw new Error("Checkout initialized, but no client secret was returned.")
      }

      saveLatestReservation({
        reservationCode,
        createdAt: new Date().toISOString(),
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        processingFee: pricing.processingFee,
        total: pricing.total,
        items: items.map((item) => ({
          id: item.id,
          itemType: item.itemType || "zone",
          productId: item.productId || item.zoneId,
          zoneId: item.zoneId,
          zoneName: item.zoneName,
          section: item.section,
          date: item.date,
          partySize: item.partySize,
          session: item.session,
          price: item.price,
          imageSrc: item.imageSrc,
        })),
      })

      setClientSecret(data.clientSecret)
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to initialize checkout."
      )
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  useEffect(() => {
    if (cartCount === 0) return
    initializeCheckout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCount])

  if (cartCount === 0) {
    return (
      <MobileShell>
        <div
          style={{
            minHeight: "100dvh",
            background: "#F8FAFC",
            margin: "-16px",
            padding: "20px 16px 40px",
            color: "#0F172A",
          }}
        >
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <button
              onClick={() => router.push("/book/map")}
              style={{
                background: "transparent",
                color: "#0F172A",
                border: "none",
                padding: 0,
                marginBottom: 16,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Return to map
            </button>

            <div
              style={{
                padding: 22,
                borderRadius: 24,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 8,
                }}
              >
                Your cart is empty
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Add one or more locations or passes before starting payment.
              </div>
            </div>
          </div>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 48%, #EEF2F7 100%)",
          margin: "-16px",
          padding: "20px 16px 40px",
          color: "#0F172A",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <button
            onClick={() => router.push("/book/cart")}
            style={{
              background: "transparent",
              color: "#0F172A",
              border: "none",
              padding: 0,
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back to cart
          </button>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.1,
                color: "#64748B",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Checkout
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: -0.8,
                color: "#0F172A",
              }}
            >
              Review and complete payment
            </h1>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "#475569",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              You’re checking out {cartCount} item{cartCount > 1 ? "s" : ""}
              {zoneCount > 0 || passCount > 0
                ? ` • ${zoneCount} location${zoneCount === 1 ? "" : "s"} • ${passCount} pass${passCount === 1 ? "" : "es"}`
                : ""}
              .
            </p>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 24,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
                color: "#64748B",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Order summary
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "76px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    paddingBottom: 14,
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <img
                      src={item.imageSrc || "/images/table-preview.jpg"}
                      alt={`${item.zoneName} preview`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#0F172A",
                        letterSpacing: -0.3,
                      }}
                    >
                      {item.zoneName}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#64748B",
                      }}
                    >
                      {item.section} · {formatDate(item.date)} · {item.partySize} guest
                      {item.partySize === "1" ? "" : "s"} · {item.session}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0F172A",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {money(item.price)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 14, display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span>Subtotal</span>
                <span>{money(pricing.subtotal)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span>Tax (7%)</span>
                <span>{money(pricing.tax)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span>Processing Fee (5%)</span>
                <span>{money(pricing.processingFee)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  marginTop: 4,
                  borderTop: "1px solid #E2E8F0",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#0F172A",
                }}
              >
                <span>Grand Total</span>
                <span>{money(pricing.total)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 24,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
            }}
          >
            {isLoadingCheckout ? (
              <div
                style={{
                  minHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748B",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Loading secure checkout...
              </div>
            ) : checkoutError ? (
              <>
                <div
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {checkoutError}
                </div>

                <button
                  onClick={initializeCheckout}
                  style={{
                    width: "100%",
                    height: 54,
                    border: "none",
                    borderRadius: 18,
                    background: "#2563EB",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
                  }}
                >
                  Try Again
                </button>
              </>
            ) : clientSecret ? (
              <StripeCheckoutForm
                key={clientSecret}
                clientSecret={clientSecret}
                returnUrl="/book/confirmation"
              />
            ) : (
              <>
                <div
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Secure checkout could not be prepared.
                </div>

                <button
                  onClick={initializeCheckout}
                  style={{
                    width: "100%",
                    height: 54,
                    border: "none",
                    borderRadius: 18,
                    background: "#2563EB",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
                  }}
                >
                  Reload Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  )
}