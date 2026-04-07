// app/book/cart/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { useBookingCart } from "@/app/lib/booking-cart"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import {
  clearStoredPromoCode,
  findPromoByCode,
  getStoredPromoCode,
  normalizePromoCode,
  setStoredPromoCode,
} from "@/app/lib/booking-promos"

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

function getCountdown(expiresAt?: string | null) {
  if (!expiresAt) {
    return {
      expired: true,
      minutes: "00",
      seconds: "00",
      totalMs: 0,
    }
  }

  const diff = new Date(expiresAt).getTime() - Date.now()
  const totalMs = Math.max(0, diff)

  return {
    expired: totalMs <= 0,
    minutes: String(Math.floor(totalMs / 1000 / 60)).padStart(2, "0"),
    seconds: String(Math.floor((totalMs / 1000) % 60)).padStart(2, "0"),
    totalMs,
  }
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

  const [promoCode, setPromoCode] = useState("")
  const [promoInput, setPromoInput] = useState("")
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoError, setPromoError] = useState("")

  const [lastMapHref, setLastMapHref] = useState("/book/map")

  const activeZoneHoldExpiresAt = useMemo(() => {
    const now = Date.now()

    const activeZoneItems = items
      .filter((item) => inferItemType(item) === "zone" && item.expiresAt)
      .filter((item) => {
        const ms = new Date(item.expiresAt as string).getTime()
        return Number.isFinite(ms) && ms > now
      })

    if (!activeZoneItems.length) return null

    const sorted = [...activeZoneItems].sort((a, b) => {
      return (
        new Date(a.expiresAt as string).getTime() -
        new Date(b.expiresAt as string).getTime()
      )
    })

    return sorted[0]?.expiresAt || null
  }, [items])

  const [holdCountdown, setHoldCountdown] = useState(() =>
    getCountdown(activeZoneHoldExpiresAt)
  )

  useEffect(() => {
    setHoldCountdown(getCountdown(activeZoneHoldExpiresAt))

    if (!activeZoneHoldExpiresAt) return

    const interval = window.setInterval(() => {
      setHoldCountdown(getCountdown(activeZoneHoldExpiresAt))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [activeZoneHoldExpiresAt])

  const hasAnyHeldZoneItems = items.some(
  (item) => inferItemType(item) === "zone" && !!item.expiresAt
)

  const isZoneHoldExpired = hasAnyHeldZoneItems && !activeZoneHoldExpiresAt

  useEffect(() => {
    const storedCode = getStoredPromoCode()
    if (storedCode) {
      setPromoCode(storedCode)
      setPromoInput(storedCode)
      setPromoOpen(true)
    }
  }, [])

  useEffect(() => {
  if (typeof window === "undefined") return

  const stored = window.sessionStorage.getItem("gf-last-map-href")
  if (stored) {
    setLastMapHref(stored)
  }
}, [])

  const pricing = useMemo(
    () => calculateBookingPricing(subtotal, promoCode),
    [subtotal, promoCode]
  )

  const zoneCount = useMemo(
    () => items.filter((item) => inferItemType(item) === "zone").length,
    [items]
  )

  const passCount = useMemo(
    () => items.filter((item) => inferItemType(item) === "pass").length,
    [items]
  )

  const addAnotherItemHref = useMemo(() => {
  const sourceItem =
    items.find((item) => inferItemType(item) === "zone") || items[0]

  if (!sourceItem) return lastMapHref

  const params = new URLSearchParams()

  if (sourceItem.date) {
    params.set("date", sourceItem.date)
  }

  if (sourceItem.eventSlug) {
    params.set("event", sourceItem.eventSlug)
  }

  const query = params.toString()
  return query ? `/book/map?${query}` : lastMapHref
}, [items, lastMapHref])

  function handleApplyPromo() {
    const normalized = normalizePromoCode(promoInput)
    if (!normalized) {
      setPromoError("Enter a promo code.")
      return
    }

    const matchedPromo = findPromoByCode(normalized)
    if (!matchedPromo) {
      setPromoError("That promo code is not valid!")
      return
    }

    setPromoError("")
    setPromoCode(normalized)
    setPromoInput(normalized)
    setStoredPromoCode(normalized)
  }

  function handleRemovePromo() {
    setPromoCode("")
    setPromoInput("")
    setPromoError("")
    clearStoredPromoCode()
  }

  async function handleRemoveCartItem(item: (typeof items)[number]) {
  const isZone = inferItemType(item) === "zone"

  try {
    if (isZone && item.reservationId) {
      const response = await fetch("/api/reservations/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId: item.reservationId,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        console.error(
          "Failed to release reservation hold:",
          data?.error || response.statusText
        )
      }
    }
  } catch (error) {
    console.error("Error releasing cart reservation:", error)
  } finally {
    removeItem(item.id)
  }
}

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
                //onClick={() => router.push("/book/map")}
                onClick={() => router.push(lastMapHref)}
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
                          gridTemplateColumns: "92px 1fr auto",
                          gap: 14,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 92,
                            height: 92,
                            borderRadius: 20,
                            overflow: "hidden",
                            background: COLORS.bgSoft,
                            border: `1px solid ${COLORS.borderSoft}`,
                          }}
                        >
                          <img
                            src={item.imageSrc}
                            alt={item.zoneName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 10px",
                              borderRadius: 999,
                              background: badge.background,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              fontSize: 12,
                              fontWeight: 800,
                              marginBottom: 10,
                            }}
                          >
                            {badge.label}
                          </div>

                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: COLORS.text,
                              letterSpacing: -0.35,
                              lineHeight: 1.15,
                            }}
                          >
                            {item.zoneName}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              color: COLORS.textSoft,
                              fontSize: 14,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.section}
                            {isPass ? "" : ` • ${item.partySize} guests`}
                            <br />
                            {formatDate(item.date)} • {item.session}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 10,
                            justifyItems: "end",
                            alignSelf: "stretch",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: COLORS.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {money(item.price)}
                          </div>

                          <button
                            onClick={() => handleRemoveCartItem(item)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: COLORS.danger,
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 18,
                  borderRadius: 24,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Pricing summary
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    fontSize: 14,
                    color: COLORS.textSoft,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal</span>
                    <span>{money(pricing.subtotal)}</span>
                  </div>

                  {pricing.discount > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#0F766E",
                      }}
                    >
                      <span>
                        Promo Discount
                        {pricing.appliedPromo ? ` (${pricing.appliedPromo.code})` : ""}
                      </span>
                      <span>-{money(pricing.discount)}</span>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Tax (7%)</span>
                    <span>{money(pricing.tax)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Processing Fee (5%)</span>
                    <span>{money(pricing.processingFee)}</span>
                  </div>
                </div>

                {!promoOpen ? (
                  <button
                    onClick={() => setPromoOpen(true)}
                    style={{
                      marginTop: 14,
                      border: "none",
                      background: "transparent",
                      color: COLORS.primaryHover,
                      padding: 0,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    Have a promo code?
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 18,
                      background: COLORS.bgSoft,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: COLORS.text,
                        marginBottom: 10,
                      }}
                    >
                      Promo or promoter code
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10,
                      }}
                    >
                      <input
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value)
                          if (promoError) setPromoError("")
                        }}
                        placeholder="Enter code"
                        autoCapitalize="characters"
                        spellCheck={false}
                        style={{
                          height: 48,
                          borderRadius: 14,
                          border: `1px solid ${promoError ? "#FCA5A5" : COLORS.border}`,
                          background: "#FFFFFF",
                          padding: "0 14px",
                          fontSize: 15,
                          fontWeight: 600,
                          color: COLORS.text,
                          outline: "none",
                        }}
                      />

                      <button
                        onClick={handleApplyPromo}
                        style={{
                          height: 48,
                          padding: "0 16px",
                          border: "none",
                          borderRadius: 14,
                          background: COLORS.text,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        Apply
                      </button>
                    </div>

                    {promoError ? (
                      <div
                        style={{
                          marginTop: 10,
                          color: "#B91C1C",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {promoError}
                      </div>
                    ) : null}

                    {pricing.appliedPromo ? (
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 14,
                          background: "#ECFDF5",
                          border: "1px solid #A7F3D0",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: "#065F46",
                            }}
                          >
                            {pricing.appliedPromo.code} applied
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#047857",
                            }}
                          >
                            {pricing.appliedPromo.description}
                          </div>
                        </div>

                        <button
                          onClick={handleRemovePromo}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#065F46",
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: COLORS.textMuted,
                          fontWeight: 600,
                        }}
                      >
                        Demo codes: SAVE10, WELCOME15, NOFEE, PROMOTERJAY
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    marginTop: 14,
                    borderTop: `1px solid ${COLORS.border}`,
                    fontSize: 16,
                    fontWeight: 900,
                    color: COLORS.text,
                  }}
                >
                  <span>Grand Total</span>
                  <span>{money(pricing.total)}</span>
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
                  Locations and passes can be purchased together. V.I.P. & Table bookings will use the main reservation QR, Passes receive individual swipeable QR codes after payment.
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
                    onClick={() => router.push(addAnotherItemHref)}
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
                    onClick={() => {
                      if (isZoneHoldExpired) return
                      router.push("/book/details")
                    }}
                    disabled={isZoneHoldExpired}
                    style={{
                      height: 54,
                      border: "none",
                      borderRadius: 18,
                      background: isZoneHoldExpired
                        ? "#CBD5E1"
                        : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: isZoneHoldExpired ? "not-allowed" : "pointer",
                      boxShadow: isZoneHoldExpired
                        ? "none"
                        : "0 12px 24px rgba(14,165,233,0.24)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: isZoneHoldExpired ? 0.86 : 1,
                    }}
                  >
                    {activeZoneHoldExpiresAt
                      ? isZoneHoldExpired
                        ? "Expired"
                        : `Payment • ${holdCountdown.minutes}:${holdCountdown.seconds}`
                      : "Payment"}
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