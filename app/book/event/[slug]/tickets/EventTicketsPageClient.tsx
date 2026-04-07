// app/book/event/[slug]/tickets/EventTicketsPageClient.tsx
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { useBookingCart } from "@/app/lib/booking-cart"
import type { EventBookingMeta, TicketTypeProduct } from "@/app/lib/booking-queries"

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
} as const

function formatDisplayDate(dateKey: string) {
  if (!dateKey) return "Date TBA"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3H5l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.7L21 7H6.2" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

export default function EventTicketsPageClient({
  event,
  ticketTypes,
}: {
  event: EventBookingMeta
  ticketTypes: TicketTypeProduct[]
}) {
  const router = useRouter()
  const { addItem, cartCount } = useBookingCart()

  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(ticketTypes.map((ticket) => [ticket.id, 0]))
  )
  const [cartMessage, setCartMessage] = useState("")
  const [flyerOpen, setFlyerOpen] = useState(false)

  const totalQty = useMemo(
    () => Object.values(quantities).reduce((sum, value) => sum + value, 0),
    [quantities]
  )

  function adjustPassQuantity(id: string, delta: number, maxAllowed?: number) {
    setQuantities((prev) => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      const capped = typeof maxAllowed === "number" ? Math.min(next, maxAllowed) : next

      return {
        ...prev,
        [id]: capped,
      }
    })
  }

  function buildItemsToAdd() {
    const items: Array<{
      id: string
      itemType: "pass"
      productId: string
      zoneId: string
      zoneName: string
      section: string
      date: string
      partySize: string
      session: string
      price: number
      imageSrc?: string
    }> = []

    ticketTypes.forEach((ticket) => {
      const qty = quantities[ticket.id] || 0

      for (let i = 0; i < qty; i += 1) {
        items.push({
          id: `${event.slug}-${ticket.id}-${event.date}-${i + 1}`,
          itemType: "pass",
          productId: ticket.id,
          zoneId: `${ticket.id}-${i + 1}`,
          zoneName: ticket.title,
          section: event.name,
          date: event.date,
          partySize: "1",
          session: "entry",
          price: ticket.price,
          imageSrc: ticket.imageSrc || event.flyerSrc,
        })
      }
    })

    return items
  }

  function resetQuantities() {
    setQuantities(Object.fromEntries(ticketTypes.map((ticket) => [ticket.id, 0])))
  }

  function handleAddToCart() {
    const items = buildItemsToAdd()
    if (items.length === 0) return

    let addedCount = 0

    items.forEach((item) => {
      const result = addItem(item)
      if (result.added) addedCount += 1
    })

    resetQuantities()
    setCartMessage(
      addedCount > 0
        ? "Tickets added to cart."
        : "Those tickets are already in your cart."
    )

    window.setTimeout(() => {
      setCartMessage("")
    }, 2200)
  }

  function handleViewTables() {
    const params = new URLSearchParams({
      date: event.date,
      event: event.slug,
    })
    router.push(`/book/map?${params.toString()}`)
  }

  return (
    <MobileShell fullBleed>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 52%, #FFF4E5 100%)",
          color: COLORS.text,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            padding: "14px 14px 10px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push(`/book/event/${event.slug}`)}
              aria-label="Go back"
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.86)",
                color: COLORS.text,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 10px 20px rgba(15,23,42,0.06)",
              }}
            >
              <BackIcon />
            </button>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: 50,
                padding: "6px",
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.86)",
                boxShadow: "0 14px 26px rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {formatDisplayDate(event.date)}
              </div>

              <button
                onClick={() => router.push("/book/cart")}
                aria-label="Open cart"
                title="Open cart"
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.92)",
                  color: COLORS.text,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <CartIcon />
                {cartCount > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      borderRadius: 999,
                      background: COLORS.primaryHover,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 900,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 6px 12px rgba(2,132,199,0.24)",
                    }}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </button>

              <button
                onClick={() => router.push("/profile")}
                aria-label="Open profile"
                title="Open profile"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.92)",
                  color: COLORS.text,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <ProfileIcon />
              </button>
            </div>
          </div>
        </div>

        {cartMessage ? (
          <div
            style={{
              position: "sticky",
              top: 78,
              zIndex: 35,
              margin: "0 14px",
              padding: "10px 12px",
              borderRadius: 16,
              background: "rgba(224,242,254,0.92)",
              border: "1px solid rgba(14,165,233,0.20)",
              color: COLORS.primaryHover,
              fontSize: 13,
              fontWeight: 800,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {cartMessage}
          </div>
        ) : null}

        <div
          style={{
            padding: "16px 14px 180px",
            display: "grid",
            gap: 14,
          }}
        >
          <button
            type="button"
            onClick={() => setFlyerOpen(true)}
            style={{
              borderRadius: 24,
              overflow: "hidden",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.card,
              boxShadow: "0 18px 30px rgba(15,23,42,0.08)",
              padding: 0,
              width: "100%",
              cursor: "pointer",
              textAlign: "left",
            }}
            aria-label="Open event flyer"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: 220,
                background: COLORS.bgSoft,
              }}
            >
              <img
                src={event.flyerSrc}
                alt={event.name}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(15,23,42,0.08) 52%, rgba(15,23,42,0.32) 100%)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.border,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
                  pointerEvents: "none",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 3 3 3 3 9" />
                  <line x1="3" y1="3" x2="10" y2="10" />
                  <polyline points="15 21 21 21 21 15" />
                  <line x1="14" y1="14" x2="21" y2="21" />
                </svg>
              </div>
            </div>
          </button>

          <div
            style={{
              padding: "2px 4px 0",
            }}
          >
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: -0.7,
                color: COLORS.text,
              }}
            >
              {event.name}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.55,
                color: COLORS.textSoft,
                fontWeight: 700,
              }}
            >
              {event.venueName}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                lineHeight: 1.5,
                color: COLORS.textMuted,
                fontWeight: 700,
              }}
            >
              {formatDisplayDate(event.date)} · {event.timeLabel}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {ticketTypes.map((ticket) => {
              const qty = quantities[ticket.id] || 0
              const maxSelectable =
                typeof ticket.perOrderLimit === "number" ? ticket.perOrderLimit : undefined
              const canIncrease = !ticket.isSoldOut && (maxSelectable ? qty < maxSelectable : true)

              return (
                <div
                  key={ticket.id}
                  style={{
                    borderRadius: 24,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 14px 28px rgba(15,23,42,0.07)",
                    overflow: "hidden",
                    opacity: ticket.isSoldOut ? 0.72 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "92px 1fr",
                      gap: 14,
                      padding: 14,
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
                        src={ticket.imageSrc || event.flyerSrc}
                        alt={ticket.title}
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
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 900,
                                color: COLORS.text,
                                letterSpacing: -0.4,
                              }}
                            >
                              {ticket.title}
                            </div>

                            {ticket.badgeLabel ? (
                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: COLORS.goldSoft,
                                  color: "#92400E",
                                  fontSize: 11,
                                  fontWeight: 900,
                                  lineHeight: 1,
                                }}
                              >
                                {ticket.badgeLabel}
                              </span>
                            ) : null}

                            {ticket.isSoldOut ? (
                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: COLORS.coralSoft,
                                  color: COLORS.coral,
                                  fontSize: 11,
                                  fontWeight: 900,
                                  lineHeight: 1,
                                }}
                              >
                                Sold Out
                              </span>
                            ) : null}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: COLORS.textMuted,
                            }}
                          >
                            {ticket.subtitle}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "8px 10px",
                            borderRadius: 14,
                            background: ticket.price === 0 ? COLORS.accentSoft : COLORS.coralSoft,
                            color: ticket.price === 0 ? "#0F766E" : COLORS.coral,
                            fontSize: 13,
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        {ticket.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 999,
                              background: COLORS.cardSoft,
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: 0.8,
                            color: COLORS.textMuted,
                          }}
                        >
                          QUANTITY
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <button
                            onClick={() => adjustPassQuantity(ticket.id, -1, maxSelectable)}
                            disabled={qty === 0}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              border: `1px solid ${COLORS.border}`,
                              background: COLORS.card,
                              color: COLORS.text,
                              fontSize: 18,
                              fontWeight: 800,
                              cursor: qty === 0 ? "not-allowed" : "pointer",
                              boxShadow: "0 8px 16px rgba(15,23,42,0.05)",
                              opacity: qty === 0 ? 0.5 : 1,
                            }}
                          >
                            −
                          </button>

                          <div
                            style={{
                              minWidth: 22,
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: 900,
                              color: COLORS.text,
                            }}
                          >
                            {qty}
                          </div>

                          <button
                            onClick={() => adjustPassQuantity(ticket.id, 1, maxSelectable)}
                            disabled={!canIncrease}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              border: "none",
                              background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                              color: "#fff",
                              fontSize: 18,
                              fontWeight: 800,
                              cursor: !canIncrease ? "not-allowed" : "pointer",
                              boxShadow: "0 10px 18px rgba(14,165,233,0.18)",
                              opacity: !canIncrease ? 0.5 : 1,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              pointerEvents: "auto",
              padding: "12px 14px calc(env(safe-area-inset-bottom, 0px) + 12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.46) 22%, rgba(255,255,255,0.92) 100%)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                borderRadius: 22,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.94)",
                boxShadow: "0 18px 34px rgba(15,23,42,0.12)",
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: COLORS.textMuted,
                      marginBottom: 4,
                    }}
                  >
                    SELECTED TICKETS
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: COLORS.text,
                    }}
                  >
                    {totalQty} selected
                  </div>
                </div>

                {event.hasTables ? (
                  <button
                    onClick={handleViewTables}
                    style={{
                      height: 42,
                      padding: "0 14px",
                      borderRadius: 14,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.card,
                      color: COLORS.text,
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Tables
                  </button>
                ) : null}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={totalQty === 0}
                style={{
                  width: "100%",
                  height: 50,
                  borderRadius: 18,
                  border: totalQty === 0 ? `1px solid ${COLORS.border}` : "none",
                  background:
                    totalQty === 0
                      ? COLORS.bgSoft
                      : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: totalQty === 0 ? COLORS.textMuted : "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: totalQty === 0 ? "not-allowed" : "pointer",
                  boxShadow:
                    totalQty === 0 ? "none" : "0 12px 22px rgba(14,165,233,0.22)",
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {flyerOpen ? (
          <>
            <div
              onClick={() => setFlyerOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 120,
                background: "rgba(15,23,42,0.88)",
                backdropFilter: "blur(8px)",
              }}
            />

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 121,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <button
                onClick={() => setFlyerOpen(false)}
                aria-label="Close flyer"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.14)",
                  color: "#FFFFFF",
                  fontSize: 24,
                  fontWeight: 800,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                ×
              </button>

              <img
                src={event.flyerSrc}
                alt={event.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "92vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 20,
                  boxShadow: "0 28px 60px rgba(0,0,0,0.30)",
                  display: "block",
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </MobileShell>
  )
}