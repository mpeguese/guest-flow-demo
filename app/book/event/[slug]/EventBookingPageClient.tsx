// app/book/event/[slug]/EventBookingPageClient.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2.5" fill="currentColor" />
      <rect
        x="10.45"
        y="10.15"
        width="3.1"
        height="10.2"
        rx="1.55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
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

  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const startYRef = useRef(0)
  const startOffsetRef = useRef(0)

  const collapsedPeekHeight = 148
  const maxSheetTravel = useMemo(() => 155, [])



  function handleOpenMap() {
    const searchParams = new URLSearchParams({
      date: event.date,
      event: event.slug,
    })

    router.push(`${event.mapPath}?${searchParams.toString()}`)
  }

  const restingOffset = sheetExpanded ? 0 : maxSheetTravel
  const translateY = Math.max(0, Math.min(maxSheetTravel, restingOffset + dragY))
  const isCollapsed = !sheetExpanded && !isDragging

  function startDragging(clientY: number) {
    setIsDragging(true)
    startYRef.current = clientY
    startOffsetRef.current = sheetExpanded ? 0 : maxSheetTravel
  }

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!isDragging) return

      const delta = e.clientY - startYRef.current
      const next = Math.max(
        -maxSheetTravel,
        Math.min(maxSheetTravel, delta)
      )
      setDragY(next)
    }

    function handlePointerUp() {
      if (!isDragging) return

      const finalOffset = startOffsetRef.current + dragY
      const shouldCollapse = finalOffset > maxSheetTravel * 0.38

      setSheetExpanded(!shouldCollapse)
      setDragY(0)
      setIsDragging(false)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [dragY, isDragging, maxSheetTravel])

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
              "linear-gradient(180deg, rgba(3,7,18,0.08) 0%, rgba(3,7,18,0.12) 18%, rgba(3,7,18,0.22) 58%, rgba(3,7,18,0.52) 100%)",
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
          {/* <button
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
          </button> */}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
            minHeight: "58dvh",
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
              overflow: "hidden",
              transform: `translateY(${translateY}px)`,
              transition: isDragging ? "none" : "transform 260ms ease",
              willChange: "transform",
            }}
          >
            <div
              onPointerDown={(e) => startDragging(e.clientY)}
              style={{
                padding: "10px 16px 12px",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 5,
                  borderRadius: 999,
                  margin: "0 auto 12px",
                  background: "rgba(255,255,255,0.52)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 26,
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
                </div>

                <button
                  type="button"
                  aria-label={sheetExpanded ? "Hide details" : "Show details"}
                  title={sheetExpanded ? "Hide details" : "Show details"}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSheetExpanded((prev) => !prev)
                    setDragY(0)
                    setIsDragging(false)
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#FFFFFF",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <InfoIcon />
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 10,
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

            <div
              style={{
                maxHeight: isCollapsed ? 0 : 260,
                opacity: isCollapsed ? 0 : 1,
                overflow: "hidden",
                transition: "max-height 220ms ease, opacity 180ms ease",
                padding: "0 16px 16px",
              }}
            >
              {event.description ? (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.78)",
                      display: "-webkit-box",
                      WebkitLineClamp: descriptionExpanded ? "unset" : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      transition: "all 220ms ease",
                    }}
                  >
                    {event.description}
                  </div>

                  {event.description.length > 110 ? (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((prev) => !prev)}
                      style={{
                        marginTop: 8,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {descriptionExpanded ? "Show less" : "Show more"}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: event.description ? 12 : 0,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {/* {ticketCount} ticket options ·{" "}
                {startPrice === 0
                  ? "From Free"
                  : startPrice !== null
                    ? `From $${startPrice}`
                    : "Unavailable"} */}
                {ticketCount > 0 ? (
                  <>
                    {ticketCount} ticket option{ticketCount === 1 ? "" : "s"} ·{" "}
                    {startPrice === 0
                      ? "From Free"
                      : startPrice !== null
                        ? `From $${startPrice}`
                        : "Unavailable"}
                  </>
                ) : (
                  <>No tickets available</>
                )}
              </div>
            </div>

            <div
              style={{
                height: isCollapsed ? Math.max(0, collapsedPeekHeight - 118) : 0,
                transition: "height 260ms ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}