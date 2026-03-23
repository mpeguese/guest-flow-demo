// app/book/cart/page.tsx
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { useBookingCart } from "@/app/lib/booking-cart"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"

function formatDate(dateKey: string) {
  if (!dateKey) return "Not selected"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
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

const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F7FBFC",
  bgWarm: "#FFF4E5",
  card: "#FFFFFF",
  cardSoft: "#F2FAFB",
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",
  borderSoft: "#E6EEF2",

  primary: "#0EA5E9",
  primaryHover: "#0284C7",
  primarySoft: "#E0F2FE",

  accent: "#14B8A6",
  accentSoft: "#DDF7F3",

  coral: "#FF7A59",
  coralSoft: "#FFE7E0",

  gold: "#F59E0B",
  goldSoft: "#FEF3C7",

  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, cartCount, subtotal } = useBookingCart()

  const pricing = useMemo(() => calculateBookingPricing(subtotal), [subtotal])

  return (
    <MobileShell>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 52%, #FFF4E5 100%)",
          margin: "-16px",
          padding: "20px 16px 40px",
          color: COLORS.text,
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              color: COLORS.text,
              border: "none",
              padding: 0,
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.1,
                color: COLORS.textMuted,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Cart
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: -0.8,
                color: COLORS.text,
              }}
            >
              Review your selected locations
            </h1>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: COLORS.textSoft,
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              Add multiple tables or lounge areas, then check out together.
            </p>
          </div>

          {cartCount === 0 ? (
            <div
              style={{
                padding: 22,
                borderRadius: 24,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                Your cart is empty
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: COLORS.textMuted,
                  marginBottom: 16,
                }}
              >
                Head back to the map and add one or more locations to continue.
              </div>

              <button
                onClick={() => router.push("/book/map")}
                style={{
                  height: 52,
                  padding: "0 18px",
                  border: "none",
                  borderRadius: 18,
                  background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(14,165,233,0.24)",
                }}
              >
                Return to map
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 14 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 16,
                      borderRadius: 24,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "92px 1fr",
                        gap: 14,
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{
                          width: 92,
                          height: 92,
                          borderRadius: 18,
                          overflow: "hidden",
                          background: COLORS.bgSoft,
                          border: `1px solid ${COLORS.border}`,
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
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 21,
                                fontWeight: 900,
                                color: COLORS.text,
                                letterSpacing: -0.4,
                              }}
                            >
                              {item.zoneName}
                            </div>

                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 14,
                                color: COLORS.textMuted,
                                lineHeight: 1.55,
                              }}
                            >
                              {item.section} · {formatDate(item.date)} · {item.partySize} guests ·{" "}
                              {item.session}
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.zoneName} from cart`}
                            title="Remove from cart"
                            style={{
                              width: 40,
                              height: 40,
                              border: `1px solid ${COLORS.dangerSoft}`,
                              background: "#FFF5F5",
                              color: COLORS.danger,
                              borderRadius: 12,
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            fontSize: 16,
                            fontWeight: 800,
                            color: COLORS.text,
                          }}
                        >
                          {money(item.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: 20,
                  borderRadius: 24,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    color: COLORS.textSoft,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal</span>
                    <span>{money(pricing.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Tax (7%)</span>
                    <span>{money(pricing.tax)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Processing Fee (5%)</span>
                    <span>{money(pricing.processingFee)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      marginTop: 4,
                      borderTop: `1px solid ${COLORS.border}`,
                      fontSize: 16,
                      fontWeight: 900,
                      color: COLORS.text,
                    }}
                  >
                    <span>Grand Total</span>
                    <span>{money(pricing.total)}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => router.push("/book/map")}
                    style={{
                      height: 54,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 18,
                      background: COLORS.card,
                      color: COLORS.text,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Add another location
                  </button>

                  <button
                    onClick={() => router.push("/book/details")}
                    style={{
                      height: 54,
                      border: "none",
                      borderRadius: 18,
                      background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 12px 24px rgba(14,165,233,0.24)",
                    }}
                  >
                    Continue to payment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MobileShell>
  )
}