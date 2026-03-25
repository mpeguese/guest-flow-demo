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
} as const

function inferItemType(item: {
  itemType?: "zone" | "pass"
  section: string
  session: string
}) {
  if (item.itemType) return item.itemType
  if (item.section === "Guest Entry Pass" || item.session === "entry") return "pass"
  return "zone"
}

function itemBadge(item: {
  itemType?: "zone" | "pass"
  section: string
  session: string
}) {
  const type = inferItemType(item)

  if (type === "pass") {
    return {
      label: "Entry Pass",
      background: COLORS.accentSoft,
      color: "#0F766E",
      border: "#BFECE5",
    }
  }

  return {
    label: "Location",
    background: COLORS.primarySoft,
    color: COLORS.primaryHover,
    border: "#BAE6FD",
  }
}

function CartIconLarge() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="88"
      height="88"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
      <path d="M2.5 3H5l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.7L21 7H6.2" />
    </svg>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, cartCount, subtotal } = useBookingCart()

  const pricing = useMemo(() => calculateBookingPricing(subtotal), [subtotal])

  const zoneCount = useMemo(
    () => items.filter((item) => inferItemType(item) === "zone").length,
    [items]
  )

  const passCount = useMemo(
    () => items.filter((item) => inferItemType(item) === "pass").length,
    [items]
  )

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
              Review your selected experiences
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
              Add hotspot locations, tables, or entry passes and check out together in one polished flow.
            </p>
          </div>

          {cartCount === 0 ? (
            <div
              style={{
                minHeight: "58vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 136,
                  height: 136,
                  borderRadius: 32,
                  //background: "rgba(255,255,255,0.72)",
                  //border: `1px solid ${COLORS.border}`,
                  //boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
                  display: "grid",
                  placeItems: "center",
                  color: COLORS.text,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <CartIconLarge />

                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    minWidth: 28,
                    height: 28,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: COLORS.danger,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 900,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 10px 20px rgba(239,68,68,0.22)",
                  }}
                >
                  0
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: -0.6,
                  color: COLORS.text,
                }}
              >
                Your cart is empty
              </div>

              <button
                onClick={() => router.push("/book/map")}
                style={{
                  marginTop: 24,
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
              <div
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 22,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: COLORS.textMuted,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Cart overview
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: COLORS.text,
                      letterSpacing: -0.4,
                    }}
                  >
                    {cartCount} item{cartCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      padding: "9px 12px",
                      borderRadius: 999,
                      background: COLORS.primarySoft,
                      border: "1px solid #BAE6FD",
                      color: COLORS.primaryHover,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {zoneCount} location{zoneCount === 1 ? "" : "s"}
                  </div>

                  <div
                    style={{
                      padding: "9px 12px",
                      borderRadius: 999,
                      background: COLORS.accentSoft,
                      border: "1px solid #BFECE5",
                      color: "#0F766E",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {passCount} pass{passCount === 1 ? "" : "es"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                {items.map((item) => {
                  const badge = itemBadge(item)
                  const isPass = inferItemType(item) === "pass"

                  return (
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
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                <span
                                  style={{
                                    padding: "7px 10px",
                                    borderRadius: 999,
                                    background: badge.background,
                                    border: `1px solid ${badge.border}`,
                                    color: badge.color,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                  }}
                                >
                                  {badge.label}
                                </span>
                              </div>

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
                                {item.section} · {formatDate(item.date)} ·{" "}
                                {isPass
                                  ? "1 guest"
                                  : `${item.partySize} guest${item.partySize === "1" ? "" : "s"}`}{" "}
                                · {item.session}
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
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: COLORS.text,
                              }}
                            >
                              {money(item.price)}
                            </div>

                            {isPass ? (
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: COLORS.textMuted,
                                  letterSpacing: 0.6,
                                  textTransform: "uppercase",
                                }}
                              >
                                Individual QR issued after purchase
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 18,
                    background: COLORS.bgSoft,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textSoft,
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                >
                  Locations and passes can be purchased together. Table and hotspot bookings will use the main reservation QR, while passes receive individual swipeable QR codes after payment.
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
                    Add another item
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