// app/book/map/BookMapClient.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import VenueMap from "@/app/components/booking/VenueMap"
import ZoneDetailsCard from "@/app/components/booking/ZoneDetailsCard"
import AreaSelectionModal from "@/app/components/booking/AreaSelectionModal"
import DatePickerModal from "@/app/components/booking/DatePickerModal"
import { getZoneStatus, venueZones } from "@/app/lib/booking-data"
import { passProducts } from "@/app/lib/book-pass-data"
import { useBookingCart } from "@/app/lib/booking-cart"
import Image from "next/image"

function formatDisplayDate(dateKey: string) {
  if (!dateKey) return "No date selected"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function parsePartySize(value: string | null) {
  if (!value) return null
  if (value === "10+") return 10
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDateKey(dateKey: string) {
  if (!dateKey) return null
  const parsed = new Date(`${dateKey}T12:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDateKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatShortDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatWeekday(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date)
}

function buildNextTwoWeeks(baseDateKey: string) {
  const start = baseDateKey ? new Date(`${baseDateKey}T12:00:00Z`) : new Date()
  start.setUTCHours(12, 0, 0, 0)

  return Array.from({ length: 30 }, (_, index) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + index)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
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

type FrozenSelection = {
  id: string
  itemType?: "zone" | "pass"
  productId?: string
  zoneId: string
  zoneName: string
  section: string
  date: string
  partySize: string
  session: string
  price: number
  imageSrc?: string
}

type PromotionTile = {
  id: string
  title: string
  subtitle: string
  imageSrc: string
  accentBg: string
  accentColor: string
  tag: string
}

const promotionTiles: PromotionTile[] = [
  {
    id: "ladies-free",
    title: "Ladies Free before 10pm",
    subtitle: "Complimentary entry for ladies who arrive before 10pm, subject to venue timing and capacity.",
    imageSrc: "/images/tangra-interior.jpg",
    accentBg: "#FCE7F3",
    accentColor: "#BE185D",
    tag: "Guest List",
  },
  {
    id: "late-night-hh",
    title: "Late Night Happy Hour until 11",
    subtitle: "Enjoy discounted cocktails and select pours during the early late-night window.",
    imageSrc: "/images/table-preview.jpg",
    accentBg: "#FEF3C7",
    accentColor: "#B45309",
    tag: "Drinks",
  },
  {
    id: "brunch-bottomless",
    title: "Brunch - $30 bottomless mimosas",
    subtitle: "Weekend brunch special with bottomless mimosas available during the featured seating period.",
    imageSrc: "/images/checkout-poster.jpg",
    accentBg: "#DDF7F3",
    accentColor: "#0F766E",
    tag: "Brunch",
  },
  {
    id: "green-tea",
    title: "$7 Green tea shots all night",
    subtitle: "A featured late-night shot special running throughout the event while inventory lasts.",
    imageSrc: "/images/tangra-interior.jpg",
    accentBg: "#E0F2FE",
    accentColor: "#0369A1",
    tag: "Special",
  },
]

function PassPurchaseModal({
  open,
  onClose,
  selectedDate,
  onSelectDate,
  onOpenMainCalendar,
  quantities,
  onDecrease,
  onIncrease,
  onAddPassesToCart,
}: {
  open: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenMainCalendar: () => void
  quantities: Record<string, number>
  onDecrease: (id: string) => void
  onIncrease: (id: string) => void
  onAddPassesToCart: () => void
}) {
  const passDates = useMemo(() => buildNextTwoWeeks(selectedDate), [selectedDate])
  const totalQty = Object.values(quantities).reduce((sum, value) => sum + value, 0)

  const dateStripRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  })

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el) return

    dragStateRef.current.isDown = true
    dragStateRef.current.startX = e.clientX
    dragStateRef.current.scrollLeft = el.scrollLeft
    dragStateRef.current.moved = false
    el.setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el || !dragStateRef.current.isDown) return

    const dx = e.clientX - dragStateRef.current.startX
    if (Math.abs(dx) > 4) dragStateRef.current.moved = true
    el.scrollLeft = dragStateRef.current.scrollLeft - dx
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el) return
    dragStateRef.current.isDown = false
    el.releasePointerCapture?.(e.pointerId)
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
          background: "rgba(15,23,42,0.22)",
          backdropFilter: "blur(6px)",
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
          padding: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            maxHeight: "86vh",
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
              maxHeight: "calc(86vh - 20px)",
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
                  SKIP THE LINE
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
                  Pre-purchase entry
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: COLORS.textSoft,
                  }}
                >
                  Reserve passes in advance and move through entry faster.
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

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                  }}
                >
                  CHOOSE DATE
                </div>

                <button
                  onClick={onOpenMainCalendar}
                  aria-label="Open main calendar"
                  title="Open main calendar"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.card,
                    color: COLORS.primaryHover,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    boxShadow: "0 8px 16px rgba(15,23,42,0.05)",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>

              <div
                ref={dateStripRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  overflowY: "hidden",
                  paddingBottom: 6,
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                  cursor: dragStateRef.current.isDown ? "grabbing" : "grab",
                  userSelect: "none",
                  touchAction: "pan-x",
                }}
              >
                {passDates.map((dateKey) => {
                  const selected = selectedDate === dateKey

                  return (
                    <button
                      key={dateKey}
                      onClick={(e) => {
                        if (dragStateRef.current.moved) {
                          e.preventDefault()
                          return
                        }
                        onSelectDate(dateKey)
                      }}
                      style={{
                        minWidth: 78,
                        height: 74,
                        borderRadius: 20,
                        border: selected
                          ? "1px solid rgba(14,165,233,0.24)"
                          : `1px solid ${COLORS.border}`,
                        background: selected ? COLORS.primarySoft : COLORS.card,
                        color: selected ? COLORS.primaryHover : COLORS.text,
                        cursor: "pointer",
                        boxShadow: selected
                          ? "0 12px 24px rgba(14,165,233,0.14)"
                          : "0 10px 20px rgba(15,23,42,0.05)",
                        display: "grid",
                        alignContent: "center",
                        gap: 4,
                        flex: "0 0 auto",
                        userSelect: "none",
                        touchAction: "manipulation",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          color: selected ? COLORS.primaryHover : COLORS.textMuted,
                        }}
                      >
                        {formatWeekday(dateKey)}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        {formatShortDate(dateKey)}
                      </div>
                    </button>
                  )
                })}
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
                              onClick={() => onDecrease(pass.id)}
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
                              onClick={() => onIncrease(pass.id)}
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
                onClick={onAddPassesToCart}
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

function PromotionsModal({
  open,
  onClose,
  selectedDate,
  onSelectDate,
  onOpenMainCalendar,
}: {
  open: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenMainCalendar: () => void
}) {
  const promoDates = useMemo(() => buildNextTwoWeeks(selectedDate), [selectedDate])

  const dateStripRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  })

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el) return

    dragStateRef.current.isDown = true
    dragStateRef.current.startX = e.clientX
    dragStateRef.current.scrollLeft = el.scrollLeft
    dragStateRef.current.moved = false
    el.setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el || !dragStateRef.current.isDown) return

    const dx = e.clientX - dragStateRef.current.startX
    if (Math.abs(dx) > 4) dragStateRef.current.moved = true
    el.scrollLeft = dragStateRef.current.scrollLeft - dx
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = dateStripRef.current
    if (!el) return
    dragStateRef.current.isDown = false
    el.releasePointerCapture?.(e.pointerId)
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
          background: "rgba(15,23,42,0.22)",
          backdropFilter: "blur(6px)",
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
          padding: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            maxHeight: "86vh",
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
              maxHeight: "calc(86vh - 20px)",
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
                  CURATED OFFERS
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
                  Special Promotions
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: COLORS.textSoft,
                  }}
                >
                  Explore featured specials and event-driven offers for your selected date.
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
                aria-label="Close promotions modal"
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                  }}
                >
                  CHOOSE DATE
                </div>

                <button
                  onClick={onOpenMainCalendar}
                  aria-label="Open main calendar"
                  title="Open main calendar"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.card,
                    color: COLORS.primaryHover,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    boxShadow: "0 8px 16px rgba(15,23,42,0.05)",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>

              <div
                ref={dateStripRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  overflowY: "hidden",
                  paddingBottom: 6,
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                  cursor: dragStateRef.current.isDown ? "grabbing" : "grab",
                  userSelect: "none",
                  touchAction: "pan-x",
                }}
              >
                {promoDates.map((dateKey) => {
                  const selected = selectedDate === dateKey

                  return (
                    <button
                      key={dateKey}
                      onClick={(e) => {
                        if (dragStateRef.current.moved) {
                          e.preventDefault()
                          return
                        }
                        onSelectDate(dateKey)
                      }}
                      style={{
                        minWidth: 78,
                        height: 74,
                        borderRadius: 20,
                        border: selected
                          ? "1px solid rgba(14,165,233,0.24)"
                          : `1px solid ${COLORS.border}`,
                        background: selected ? COLORS.primarySoft : COLORS.card,
                        color: selected ? COLORS.primaryHover : COLORS.text,
                        cursor: "pointer",
                        boxShadow: selected
                          ? "0 12px 24px rgba(14,165,233,0.14)"
                          : "0 10px 20px rgba(15,23,42,0.05)",
                        display: "grid",
                        alignContent: "center",
                        gap: 4,
                        flex: "0 0 auto",
                        userSelect: "none",
                        touchAction: "manipulation",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          color: selected ? COLORS.primaryHover : COLORS.textMuted,
                        }}
                      >
                        {formatWeekday(dateKey)}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        {formatShortDate(dateKey)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {promotionTiles.map((promo) => (
                <div
                  key={promo.id}
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
                      gridTemplateColumns: "1fr 108px",
                      gap: 14,
                      padding: 14,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "7px 10px",
                          borderRadius: 999,
                          background: promo.accentBg,
                          color: promo.accentColor,
                          fontSize: 12,
                          fontWeight: 800,
                          marginBottom: 10,
                        }}
                      >
                        {promo.tag}
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: COLORS.text,
                          letterSpacing: -0.4,
                          lineHeight: 1.18,
                        }}
                      >
                        {promo.title}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: COLORS.textMuted,
                        }}
                      >
                        {promo.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 108,
                        height: 108,
                        borderRadius: 20,
                        overflow: "hidden",
                        background: COLORS.bgSoft,
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: "0 10px 18px rgba(15,23,42,0.08)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={promo.imageSrc}
                        alt={promo.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: `1px solid ${COLORS.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
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
                  SELECTED DATE
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: COLORS.text,
                  }}
                >
                  {formatDisplayDate(selectedDate)}
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  minWidth: 136,
                  height: 50,
                  borderRadius: 18,
                  border: "none",
                  background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 12px 22px rgba(14,165,233,0.22)",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3H5l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.7L21 7H6.2" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="6" width="14" height="12" rx="3" />
      <path d="M9 10h6" />
      <path d="M9 13h3.5" />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="7,5 17,5 21,10 12,20 3,10" />
      <path d="M3 10h18" />
      <path d="M7 5l2.8 5" />
      <path d="M17 5l-2.8 5" />
      <path d="M9.8 10 12 20l2.2-10" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <Image
      src="/images/pulse-icon.jpg"
      alt=""
      width={22}
      height={22}
      aria-hidden="true"
    />
  )
}

function EchoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.95 8.05 h5.05 c1.9 0 3.45 1.55 3.45 3.45 s-1.55 3.45-3.45 3.45 h-2 l-2.55 1.75 v-1.75 H8.95 c-1.9 0-3.45-1.55-3.45-3.45 s1.55-3.45 3.45-3.45 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.45 8.45a4.95 4.95 0 0 1 0 7.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.45 6.85a7 7 0 0 1 0 10.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.55 15.55a4.95 4.95 0 0 1 0-7.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.55 17.15a7 7 0 0 1 0-10.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AdminPanelIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.6-2.8 7.9-7 10-4.2-2.1-7-5.4-7-10V6l7-3z" />
      <path d="M9.5 12h5" />
      <path d="M12 9.5v5" />
    </svg>
  )
}

export default function BookMapPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const { cartCount, addItem } = useBookingCart()

  const [mounted, setMounted] = useState(false)
  const [passesCardOpen, setPassesCardOpen] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const date = sp.get("date") || ""
  const rawPartySize = sp.get("partySize")
  const partySizeDisplay = rawPartySize || ""
  const partySize = parsePartySize(rawPartySize)
  const session = sp.get("session") || ""

  const filteredZones = useMemo(() => {
    if (!rawPartySize || partySize === null) {
      return venueZones
    }

    return venueZones.filter((zone) => {
      if (rawPartySize === "10+") {
        return zone.capacityMax >= 10
      }
      return partySize >= zone.capacityMin && partySize <= zone.capacityMax
    })
  }, [partySize, rawPartySize])

  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectionModalOpen, setSelectionModalOpen] = useState(false)
  const [selectionDraft, setSelectionDraft] = useState<FrozenSelection | null>(null)
  const [inventoryTileOpen, setInventoryTileOpen] = useState(true)
  const [cartMessage, setCartMessage] = useState("")
  const [passModalOpen, setPassModalOpen] = useState(false)
  const [promotionsModalOpen, setPromotionsModalOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [reopenPassModalAfterDatePick, setReopenPassModalAfterDatePick] = useState(false)
  const [reopenPromotionsModalAfterDatePick, setReopenPromotionsModalAfterDatePick] =
    useState(false)
  const [passDate, setPassDate] = useState("")
  const [promotionDate, setPromotionDate] = useState("")
  const [passQuantities, setPassQuantities] = useState<Record<string, number>>({
    "free-rsvp": 0,
    "general-entry": 0,
  })

  const actionInFlightRef = useRef(false)

  useEffect(() => {
    const fallbackDate = buildNextTwoWeeks("")[0]
    setPassDate(date || fallbackDate)
    setPromotionDate(date || fallbackDate)
  }, [date])

  const statusByZoneId = useMemo(() => {
    return Object.fromEntries(
      venueZones.map((zone) => [zone.id, getZoneStatus(date, zone.id)])
    )
  }, [date])
  
  const inventorySummary = useMemo(() => {
    const availableTables = filteredZones.filter((zone) => {
      const status = statusByZoneId[zone.id]
      return status === "available" || status === "limited"
    })

    const limitedTables = filteredZones.filter(
      (zone) => statusByZoneId[zone.id] === "limited"
    )

    const soldOutTables = filteredZones.filter(
      (zone) => statusByZoneId[zone.id] === "booked"
    )

    const tableStartPrice =
      availableTables.length > 0
        ? Math.min(...availableTables.map((zone) => zone.price))
        : null

    const passStartPrice =
      passProducts.length > 0
        ? Math.min(...passProducts.map((pass) => pass.price))
        : null

    return {
      availableTables: availableTables.length,
      limitedTables: limitedTables.length,
      soldOutTables: soldOutTables.length,
      tableStartPrice,
      passCount: passProducts.length,
      passStartPrice,
    }
  }, [filteredZones, statusByZoneId])

  const selectedZone = venueZones.find((zone) => zone.id === selectedZoneId)
  const selectedStatus = selectedZoneId ? statusByZoneId[selectedZoneId] : undefined
  const selectedZoneMatchesParty =
    !rawPartySize || partySize === null
      ? true
      : selectedZoneId
        ? filteredZones.some((zone) => zone.id === selectedZoneId)
        : false

  const selectedZonePurchasable =
    !!selectedZone &&
    !!selectedStatus &&
    selectedStatus !== "booked" &&
    selectedZoneMatchesParty

  const noZonesForParty = !!rawPartySize && filteredZones.length === 0
  const interactionLocked =
    detailsOpen || selectionModalOpen || passModalOpen || promotionsModalOpen
  const mapControlsBottomOffset = passesCardOpen ? 166 : 92

  useEffect(() => {
    if (selectedZoneId && !selectionModalOpen && !passModalOpen && !promotionsModalOpen) {
      setDetailsOpen(true)
    }
  }, [selectedZoneId, selectionModalOpen, passModalOpen, promotionsModalOpen])

  useEffect(() => {
    if (!cartMessage) return
    const timeout = window.setTimeout(() => setCartMessage(""), 2600)
    return () => window.clearTimeout(timeout)
  }, [cartMessage])

  function buildFrozenSelectionFromCurrent(): FrozenSelection | null {
    if (!selectedZone || !selectedZonePurchasable) return null

    return {
      id: `${selectedZone.id}-${date}-${session || "unset-session"}`,
      itemType: "zone",
      productId: selectedZone.id,
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      section: selectedZone.section,
      date,
      partySize: partySizeDisplay || "Not set",
      session: session || "Not set",
      price: selectedZone.price,
      imageSrc: "/images/table-preview.jpg",
    }
  }

  function resetSelectionView(message: string) {
    setSelectionModalOpen(false)
    setSelectionDraft(null)
    setDetailsOpen(false)
    setSelectedZoneId(undefined)
    setCartMessage(message)
  }

  function handleZoneSelect(zoneId: string) {
    if (interactionLocked) return
    setSelectedZoneId(zoneId)
  }

  function updateMapDate(nextDateKey: string) {
    const params = new URLSearchParams(sp.toString())
    params.set("date", nextDateKey)
    router.replace(`/book/map?${params.toString()}`)
  }

  function handleDateSelected(nextDateValue: Date) {
    const normalized = new Date(nextDateValue)
    normalized.setUTCHours(12, 0, 0, 0)

    const nextDateKey = formatDateKey(normalized)
    setPassDate(nextDateKey)
    setPromotionDate(nextDateKey)
    updateMapDate(nextDateKey)
    setDatePickerOpen(false)

    if (reopenPassModalAfterDatePick) {
      setPassModalOpen(true)
      setReopenPassModalAfterDatePick(false)
    }

    if (reopenPromotionsModalAfterDatePick) {
      setPromotionsModalOpen(true)
      setReopenPromotionsModalAfterDatePick(false)
    }
  }

  function handleOpenMainCalendarFromPasses() {
    setPassModalOpen(false)
    setReopenPassModalAfterDatePick(true)
    setReopenPromotionsModalAfterDatePick(false)
    setDatePickerOpen(true)
  }

  function handleOpenMainCalendarFromPromotions() {
    setPromotionsModalOpen(false)
    setReopenPromotionsModalAfterDatePick(true)
    setReopenPassModalAfterDatePick(false)
    setDatePickerOpen(true)
  }

  function openSelectionModal() {
    if (!selectedZone) return

    if (!selectedZoneMatchesParty) {
      setCartMessage("This zone does not support your selected group size.")
      return
    }

    if (selectedStatus === "booked") {
      setCartMessage("This zone is already booked for the selected date.")
      return
    }

    const nextDraft = buildFrozenSelectionFromCurrent()
    if (!nextDraft) {
      setCartMessage("We couldn't confirm that area. Please tap the area again.")
      return
    }

    setSelectionDraft(nextDraft)
    setDetailsOpen(false)
    setSelectionModalOpen(true)
  }

  function handleCloseSelectionModal() {
    setSelectionModalOpen(false)
    setSelectionDraft(null)
    setDetailsOpen(false)
    setSelectedZoneId(undefined)
  }

  function handleAddToCart() {
    if (actionInFlightRef.current) return
    actionInFlightRef.current = true

    try {
      if (!selectionDraft) {
        setSelectionModalOpen(false)
        setSelectionDraft(null)
        setSelectedZoneId(undefined)
        setCartMessage("We couldn't confirm that area. Please select it again.")
        return
      }

      const result = addItem(selectionDraft)

      if (result.added) {
        resetSelectionView("Added to cart. Select another location or open your cart.")
      } else {
        resetSelectionView("That location is already in your cart.")
      }
    } finally {
      window.setTimeout(() => {
        actionInFlightRef.current = false
      }, 150)
    }
  }

  function handleCheckout() {
    if (actionInFlightRef.current) return
    actionInFlightRef.current = true

    try {
      if (!selectionDraft) {
        setSelectionModalOpen(false)
        setSelectionDraft(null)
        setSelectedZoneId(undefined)
        setCartMessage("We couldn't confirm that area. Please select it again.")
        return
      }

      addItem(selectionDraft)
      setSelectionModalOpen(false)
      setSelectionDraft(null)
      setDetailsOpen(false)
      setSelectedZoneId(undefined)
      router.push("/book/cart")
    } finally {
      window.setTimeout(() => {
        actionInFlightRef.current = false
      }, 150)
    }
  }

  function handleCloseDetails() {
    setDetailsOpen(false)
    setSelectionDraft(null)
    setSelectedZoneId(undefined)
  }

  function adjustPassQuantity(id: string, delta: number) {
    setPassQuantities((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta)
      return {
        ...prev,
        [id]: next,
      }
    })
  }

  function handleAddPassesToCart() {
    const selectedEntries = passProducts.filter((pass) => (passQuantities[pass.id] || 0) > 0)
    if (selectedEntries.length === 0) return

    let addedCount = 0

    selectedEntries.forEach((pass) => {
      const qty = passQuantities[pass.id] || 0

      for (let i = 0; i < qty; i += 1) {
        const item = {
          id: `${pass.id}-${passDate}-${i + 1}`,
          itemType: "pass" as const,
          productId: pass.id,
          zoneId: `${pass.id}-${i + 1}`,
          zoneName: pass.title,
          section: "Guest Entry Pass",
          date: passDate,
          partySize: "1",
          session: "entry",
          price: pass.price,
          imageSrc: pass.imageSrc,
        }

        const result = addItem(item)
        if (result.added) addedCount += 1
      }
    })

    setPassModalOpen(false)
    setPassQuantities({
      "free-rsvp": 0,
      "general-entry": 0,
    })

    if (addedCount > 0) {
      setCartMessage("Passes added to cart. You can continue shopping or open your cart.")
    } else {
      setCartMessage("Those passes are already in your cart.")
    }
  }

  return (
    <MobileShell fullBleed>
      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
        }}
      >
        {inventoryTileOpen ? (
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 16,
            right: 16,
            zIndex: 12,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              borderRadius: 24,
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(217,232,236,0.62)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
              //backdropFilter: "blur(14px)",
              //WebkitBackdropFilter: "blur(14px)",
              padding: 14,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: -0.5,
                    color: COLORS.text,
                    lineHeight: 1.05,
                  }}
                >
                  {formatDisplayDate(date)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: COLORS.textSoft,
                    lineHeight: 1.45,
                  }}
                >
                  {inventorySummary.passCount} ticket options ·{" "}
                  {inventorySummary.passStartPrice === 0
                    ? "From Free"
                    : inventorySummary.passStartPrice !== null
                      ? `From $${inventorySummary.passStartPrice}`
                      : "Unavailable"}
                </div>

                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: COLORS.textSoft,
                    lineHeight: 1.45,
                  }}
                >
                  {inventorySummary.availableTables} tables available ·{" "}
                  {inventorySummary.tableStartPrice !== null
                    ? `From $${inventorySummary.tableStartPrice}`
                    : "Unavailable"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInventoryTileOpen(false)}
                aria-label="Dismiss inventory panel"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  //border: `1px solid ${COLORS.border}`,
                  //background: "rgba(255,255,255,0.82)",
                  color: COLORS.text,
                  fontSize: 26,
                  fontWeight: 800,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setPassModalOpen(true)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(96,165,250,0.18)",
                }}
              >
                View Tickets
              </button>

              <button
                type="button"
                onClick={() => setInventoryTileOpen(false)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.88)",
                  color: COLORS.text,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Explore Map
              </button>
            </div>
          </div>
        </div>
      ) : null}
        <VenueMap
          zones={filteredZones}
          statusByZoneId={statusByZoneId}
          selectedZoneId={selectedZoneId}
          onSelect={handleZoneSelect}
          interactionLocked={interactionLocked}
          controlsBottomOffset={mapControlsBottomOffset}
        />

        <div
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            right: 14,
            zIndex: 95,
            display: "flex",
            alignItems: "center",
            gap: 12,
            pointerEvents: "none",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              pointerEvents: "auto",
              width: 42,
              height: 42,
              borderRadius: 999,
              border: `1px solid rgba(217,232,236,0.78)`,
              background: "rgba(255,255,255,0.68)",
              color: COLORS.text,
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              flexShrink: 0,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
            }}
            aria-label="Go back"
          >
            ←
          </button>

          <div
            style={{
              pointerEvents: "auto",
              flex: 1,
              minWidth: 0,
              height: 50,
              padding: "6px",
              borderRadius: 999,
              border: `1px solid rgba(217,232,236,0.82)`,
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 16px 32px rgba(15,23,42,0.14)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {mounted ? (
              <button
                onClick={() => {
                  setReopenPassModalAfterDatePick(false)
                  setReopenPromotionsModalAfterDatePick(false)
                  setDatePickerOpen(true)
                }}
                style={{
                  height: "100%",
                  minWidth: 0,
                  flex: 1,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid rgba(217,232,236,0.88)`,
                  background: "rgba(247,251,252,0.92)",
                  color: COLORS.text,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
                }}
                aria-label="Change date"
              >
                <CalendarIcon />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {formatDisplayDate(date)}
                </span>
              </button>
            ) : (
              <div
                style={{
                  flex: 1,
                  height: "100%",
                  borderRadius: 999,
                  background: "rgba(247,251,252,0.92)",
                }}
              />
            )}

            <button
              onClick={() => router.push("/book/cart")}
              aria-label="Open cart"
              title="Open cart"
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid rgba(217,232,236,0.88)`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.text,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
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
              onClick={() => router.push("/admin/login")}
              aria-label="Open admin panel"
              title="Open admin panel"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid rgba(217,232,236,0.88)`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.text,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <AdminPanelIcon />
            </button>
          </div>
        </div>

        {cartMessage ? (
          <div
            style={{
              position: "fixed",
              top: 78,
              left: 14,
              right: 14,
              zIndex: 96,
              padding: "12px 14px",
              borderRadius: 18,
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

        {noZonesForParty ? (
          <div
            style={{
              position: "fixed",
              top: cartMessage ? 132 : 78,
              left: 14,
              right: 14,
              zIndex: 96,
              padding: "16px 18px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.92)",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.textSoft,
              fontSize: 14,
              lineHeight: 1.5,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            No matching areas are available for the selected group size.
          </div>
        ) : null}

        {passesCardOpen ? (
          <div
            style={{
              position: "fixed",
              left: 100,
              right: 100,
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 82px)",
              zIndex: 70,
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 18,
                minHeight: 64,
                border: `1px solid ${COLORS.border}`,
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(20,184,166,0.08) 52%, rgba(255,255,255,0.98) 100%)",
                boxShadow: "0 12px 22px rgba(15,23,42,0.14)",
                backdropFilter: "blur(10px)",
              }}
            >
              <button
                onClick={() => setPassesCardOpen(false)}
                aria-label="Close passes card"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 15,
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  color: COLORS.textMuted,
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                ×
              </button>

              <button
                onClick={() => setPassModalOpen(true)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                }}
                aria-label="Open passes"
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr",
                    gap: 10,
                    alignItems: "center",
                    padding: "8px 34px 8px 8px",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 42,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
                      background: COLORS.bgSoft,
                    }}
                  >
                    <img
                      src="/images/tangra-interior.jpg"
                      alt="Skip the line passes"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: -0.3,
                      color: COLORS.text,
                      lineHeight: 1,
                    }}
                  >
                    Skip the line
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : null}

        <ZoneDetailsCard
          zone={selectedZone}
          status={selectedStatus}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
          onContinue={openSelectionModal}
        />

        <AreaSelectionModal
          open={selectionModalOpen}
          onClose={handleCloseSelectionModal}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckout}
          zoneName={selectionDraft?.zoneName || selectedZone?.name || ""}
          sectionName={selectionDraft?.section || selectedZone?.section || ""}
          dateLabel={formatDisplayDate(selectionDraft?.date || date)}
          partySizeLabel={selectionDraft?.partySize || "Party size not set"}
          sessionLabel={(selectionDraft?.session || "Not set").toUpperCase()}
          videoSrc="/videos/venue-party-bg.mp4"
          posterSrc="/images/checkout-poster.jpg"
        />

        <PassPurchaseModal
          open={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          selectedDate={passDate || buildNextTwoWeeks("")[0]}
          onSelectDate={setPassDate}
          onOpenMainCalendar={handleOpenMainCalendarFromPasses}
          quantities={passQuantities}
          onDecrease={(id) => adjustPassQuantity(id, -1)}
          onIncrease={(id) => adjustPassQuantity(id, 1)}
          onAddPassesToCart={handleAddPassesToCart}
        />

        <PromotionsModal
          open={promotionsModalOpen}
          onClose={() => setPromotionsModalOpen(false)}
          selectedDate={promotionDate || buildNextTwoWeeks("")[0]}
          onSelectDate={setPromotionDate}
          onOpenMainCalendar={handleOpenMainCalendarFromPromotions}
        />

        {datePickerOpen ? (
          <DatePickerModal
            selectedDate={parseDateKey(date)}
            onSelectDate={handleDateSelected}
            onClose={() => {
              setDatePickerOpen(false)
              setReopenPassModalAfterDatePick(false)
              setReopenPromotionsModalAfterDatePick(false)
            }}
          />
        ) : null}

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              pointerEvents: "auto",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.40) 24%, rgba(255,255,255,0.84) 100%)",
            }}
          >
            <div
              style={{
                height: 70,
                marginLeft: 0,
                marginRight: 0,
                borderTop: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.94)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 -10px 24px rgba(15,23,42,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 18px",
              }}
            >
              <button
                onClick={() => {
                  setPassesCardOpen(true)
                  setPromotionsModalOpen(false)
                  setPassModalOpen(true)
                }}
                aria-label="Open passes"
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.primaryHover,
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <TicketIcon />
                <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
                  Tickets
                </div>
              </button>

              <button
                onClick={() => {
                  setPassesCardOpen(true)
                  setPassModalOpen(false)
                  setPromotionsModalOpen(true)
                }}
                aria-label="Open promotions"
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.primaryHover,
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <DiamondIcon />
                <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
                  Promotions
                </div>
              </button>

              <button
                onClick={() => router.push("/echo")}
                aria-label="Open echo"
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.primaryHover,
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <EchoIcon />
                <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
                  Echo
                </div>
              </button>

              <button
                onClick={() => router.push("/profile")}
                aria-label="Open profile"
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.primaryHover,
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <ProfileIcon />

                {/* {cartCount > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
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
                    }}
                  >
                    {cartCount}
                  </span>
                ) : null} */}
                <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
                  Profile
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}