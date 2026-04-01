"use client"

import { useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { passProducts } from "@/app/lib/book-pass-data"
//import { useBookingCart } from "@/app/lib/booking-cart"

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
                    onClick={() => router.push(`/book/event/${event.slug}/tickets`)}
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

      </div>
    </MobileShell>
  )
}