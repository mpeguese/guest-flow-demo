"use client"

import { useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { passProducts } from "@/app/lib/book-pass-data"
import { useBookingCart } from "@/app/lib/booking-cart"

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

type EventItem = {
  slug: string
  name: string
  venueName: string
  date: string
  timeLabel: string
  flyerSrc: string
  promoVideoSrc?: string
  hasTickets: boolean
  hasTables: boolean
  mapPath: string
}

const EVENTS: Record<string, EventItem> = {
  "daer-sundays": {
    slug: "daer-sundays",
    name: "Sundays",
    venueName: "DAER Dayclub",
    date: "2026-04-12",
    timeLabel: "Doors 12PM",
    flyerSrc: "/images/daerdayclub.jpg",
    hasTickets: true,
    hasTables: true,
    mapPath: "/book/map",
  },
}

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

function PassPurchaseModal({
  open,
  onClose,
  event,
}: {
  open: boolean
  onClose: () => void
  event: EventItem
}) {
  const { addItem } = useBookingCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "free-rsvp": 0,
    "general-entry": 0,
  })

  const totalQty = Object.values(quantities).reduce((sum, value) => sum + value, 0)

  function adjustPassQuantity(id: string, delta: number) {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta)
      return {
        ...prev,
        [id]: next,
      }
    })
  }

  function handleAddPassesToCart() {
    const selectedEntries = passProducts.filter((pass) => (quantities[pass.id] || 0) > 0)
    if (selectedEntries.length === 0) return

    selectedEntries.forEach((pass) => {
      const qty = quantities[pass.id] || 0

      for (let i = 0; i < qty; i += 1) {
        addItem({
          id: `${event.slug}-${pass.id}-${event.date}-${i + 1}`,
          itemType: "pass",
          productId: pass.id,
          zoneId: `${pass.id}-${i + 1}`,
          zoneName: pass.title,
          section: event.name,
          date: event.date,
          partySize: "1",
          session: "entry",
          price: pass.price,
          imageSrc: pass.imageSrc,
        })
      }
    })

    setQuantities({
      "free-rsvp": 0,
      "general-entry": 0,
    })
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 120,
          background: "rgba(15,23,42,0.28)",
          backdropFilter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 121,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            maxHeight: "88vh",
            overflow: "hidden",
            borderRadius: "30px 30px 0 0",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 100%)",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 28px 56px rgba(15,23,42,0.18)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ paddingTop: 10, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 46,
                height: 5,
                borderRadius: 999,
                background: "#C9DCE2",
              }}
            />
          </div>

          <div
            style={{
              padding: "14px 16px 18px",
              overflowY: "auto",
              maxHeight: "calc(88vh - 20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                    marginBottom: 6,
                  }}
                >
                  {event.venueName.toUpperCase()}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 26,
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    color: COLORS.text,
                  }}
                >
                  {event.name}
                </h3>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: COLORS.textSoft,
                  }}
                >
                  {formatDisplayDate(event.date)} · {event.timeLabel}
                </p>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.card,
                  color: COLORS.text,
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Close pass modal"
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 18,
                background: COLORS.cardSoft,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: COLORS.textMuted,
                  marginBottom: 4,
                }}
              >
                EVENT DATE
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                {formatDisplayDate(event.date)}
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {passProducts.map((pass) => {
                const qty = quantities[pass.id] || 0

                return (
                  <div
                    key={pass.id}
                    style={{
                      borderRadius: 24,
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 14px 28px rgba(15,23,42,0.07)",
                      overflow: "hidden",
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
                          src={pass.imageSrc}
                          alt={pass.title}
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
                                fontSize: 18,
                                fontWeight: 900,
                                color: COLORS.text,
                                letterSpacing: -0.4,
                              }}
                            >
                              {pass.title}
                            </div>

                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: COLORS.textMuted,
                              }}
                            >
                              {pass.subtitle}
                            </div>
                          </div>

                          <div
                            style={{
                              padding: "8px 10px",
                              borderRadius: 14,
                              background: pass.price === 0 ? COLORS.accentSoft : COLORS.coralSoft,
                              color: pass.price === 0 ? "#0F766E" : COLORS.coral,
                              fontSize: 13,
                              fontWeight: 900,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pass.price === 0 ? "Free" : `$${pass.price}`}
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
                          {pass.benefits.map((benefit) => (
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
                              onClick={() => adjustPassQuantity(pass.id, -1)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                border: `1px solid ${COLORS.border}`,
                                background: COLORS.card,
                                color: COLORS.text,
                                fontSize: 18,
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 8px 16px rgba(15,23,42,0.05)",
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
                              onClick={() => adjustPassQuantity(pass.id, 1)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                border: "none",
                                background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                                color: "#fff",
                                fontSize: 18,
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 10px 18px rgba(14,165,233,0.18)",
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginTop: 18,
                paddingTop: 14,
                borderTop: `1px solid ${COLORS.border}`,
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
                  SELECTED PASSES
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

              <button
                onClick={handleAddPassesToCart}
                disabled={totalQty === 0}
                style={{
                  minWidth: 156,
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
                Add passes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
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

export default function EventBookingPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || ""
  const event = EVENTS[slug] || EVENTS["daer-sundays"]

  const [passModalOpen, setPassModalOpen] = useState(false)

  const ticketSummary = useMemo(() => {
    const startPrice =
      passProducts.length > 0 ? Math.min(...passProducts.map((pass) => pass.price)) : null

    return {
      count: passProducts.length,
      startPrice,
    }
  }, [])

  function handleOpenMap() {
    const params = new URLSearchParams({
      date: event.date,
      event: event.slug,
    })

    router.push(`${event.mapPath}?${params.toString()}`)
  }

  return (
    <MobileShell fullBleed>
      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          background: "#0B1220",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {event.promoVideoSrc ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={event.flyerSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src={event.promoVideoSrc} type="video/mp4" />
            </video>
          ) : (
            <img
              src={event.flyerSrc}
              alt={event.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(3,7,18,0.12) 0%, rgba(3,7,18,0.18) 18%, rgba(3,7,18,0.34) 58%, rgba(3,7,18,0.74) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.34)",
                background: "rgba(255,255,255,0.14)",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              <BackIcon />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                borderRadius: 28,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.24)",
                boxShadow: "0 24px 50px rgba(0,0,0,0.18)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: -0.7,
                  color: "#FFFFFF",
                  textShadow: "0 10px 18px rgba(0,0,0,0.18)",
                }}
              >
                {event.name}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.88)",
                  fontWeight: 700,
                }}
              >
                {formatDisplayDate(event.date)} · {event.timeLabel}
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {event.venueName}
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {ticketSummary.count} ticket options ·{" "}
                {ticketSummary.startPrice === 0
                  ? "From Free"
                  : ticketSummary.startPrice !== null
                    ? `From $${ticketSummary.startPrice}`
                    : "Unavailable"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {event.hasTickets ? (
                  <button
                    type="button"
                    onClick={() => setPassModalOpen(true)}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 16,
                      border: "none",
                      background: "linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 10px 20px rgba(96,165,250,0.20)",
                    }}
                  >
                    View Tickets
                  </button>
                ) : null}

                {event.hasTables ? (
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.32)",
                      background: "rgba(255,255,255,0.14)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    Explore Map
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <PassPurchaseModal
          open={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          event={event}
        />
      </div>
    </MobileShell>
  )
}