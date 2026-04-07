// app/book/event/[slug]/EventBookingPageClient.tsx
"use client"

import { useRouter } from "next/navigation"
import type { EventBookingMeta } from "@/app/lib/booking-queries"

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

export default function EventBookingPageClient({
  event,
  ticketCount,
  startPrice,
}: {
  event: EventBookingMeta
  ticketCount: number
  startPrice: number | null
}) {
  const router = useRouter()

  function handleOpenMap() {
    const searchParams = new URLSearchParams({
      date: event.date,
      event: event.slug,
    })

    router.push(`${event.mapPath}?${searchParams.toString()}`)
  }

  return (
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
            //poster={event.coverSrc || event.flyerSrc}
            poster={event.flyerSrc || event.coverSrc}
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
            //src={event.coverSrc || event.flyerSrc}
            src={event.flyerSrc || event.coverSrc}
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

            {event.description ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {event.description}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {ticketCount} ticket options ·{" "}
              {startPrice === 0
                ? "From Free"
                : startPrice !== null
                  ? `From $${startPrice}`
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
  )
}