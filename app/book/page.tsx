// app/book/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateKey: string) {
  if (!dateKey) return "Choose A Date"

  const date = new Date(`${dateKey}T12:00:00Z`)

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function buildCalendarDays(monthDate: Date) {
  const firstDay = startOfMonth(monthDate)
  const firstWeekday = firstDay.getDay()
  const startCell = new Date(firstDay)
  startCell.setDate(firstDay.getDate() - firstWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(startCell)
    day.setDate(startCell.getDate() + index)
    return day
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
}

export default function BookPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null)

  useEffect(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    setToday(now)
    setVisibleMonth(startOfMonth(now))
    setMounted(true)
  }, [])

  const monthLabel = useMemo(() => {
    if (!visibleMonth) return ""
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(visibleMonth)
  }, [visibleMonth])

  const calendarDays = useMemo(() => {
    if (!visibleMonth) return []
    return buildCalendarDays(visibleMonth)
  }, [visibleMonth])

  const canGoPrev = useMemo(() => {
    if (!visibleMonth || !today) return false
    return visibleMonth > startOfMonth(today)
  }, [visibleMonth, today])

  function openCalendar() {
    if (selectedDate) {
      const parsed = new Date(`${selectedDate}T12:00:00Z`)
      if (!Number.isNaN(parsed.getTime())) {
        setVisibleMonth(startOfMonth(parsed))
      }
    }
    setCalendarOpen(true)
  }

  function handleDateClick(day: Date) {
    if (!today) return

    const normalized = new Date(day)
    normalized.setHours(0, 0, 0, 0)

    if (normalized < today) return

    const nextDate = formatDateKey(normalized)
    setSelectedDate(nextDate)
    setCalendarOpen(false)

    // REMOVED: forced fallback params for party size and session.
    // const params = new URLSearchParams({
    //   date: nextDate,
    //   partySize: "2",
    //   session: "night",
    // })

    // ADDED: only pass the date. Party size and session remain unset unless explicitly chosen later.
    const params = new URLSearchParams({
      date: nextDate,
    })

    router.push(`/book/map?${params.toString()}`)
  }

  return (
    <MobileShell fullBleed>
      <div style={{ paddingTop: 0, paddingBottom: 0, position: "relative" }}>
        <style jsx>{`
          @keyframes bookBarFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-4px);
            }
            100% {
              transform: translateY(0px);
            }
          }

          @keyframes bookCalendarIn {
            0% {
              opacity: 0;
              transform: translateY(14px) scale(0.985);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        <div
          style={{
            position: "relative",
            minHeight: "100vh",
            borderRadius: 0,
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(15,23,42,0.10)",
            border: `1px solid ${COLORS.borderSoft}`,
            background: "#DFF6FB",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          >
            <source src="/videos/venue-party-bg.mp4" type="video/mp4" />
          </video>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 24%, rgba(15,23,42,0.08) 72%, rgba(15,23,42,0.18) 100%),
                radial-gradient(circle at top right, rgba(255,255,255,0.28), transparent 28%),
                radial-gradient(circle at bottom left, rgba(20,184,166,0.14), transparent 24%),
                radial-gradient(circle at center, rgba(14,165,233,0.10), transparent 34%)
              `,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              minHeight: "82vh",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                width: "80%",
                maxWidth: 640,
                margin: "0 auto",
                animation: "bookBarFloat 4.8s ease-in-out infinite",
              }}
            >
              <button
                type="button"
                onClick={openCalendar}
                style={{
                  width: "100%",
                  minHeight: 46,
                  borderRadius: 40,
                  border: "1px solid rgba(255,255,255,0.72)",
                  background: "rgba(255,255,255,0.40)",
                  color: COLORS.text,
                  padding: "0 16px 0 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  cursor: "pointer",
                  boxShadow:
                    "0 18px 40px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
                aria-label="Open date calendar"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      color: COLORS.primaryHover,
                      flexShrink: 0,
                      boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
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
                  </div>

                  <div style={{ minWidth: 0, textAlign: "left" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: COLORS.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {mounted ? formatDisplayDate(selectedDate) : "Choose A Date"}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {calendarOpen && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingLeft: 12,
                paddingRight: 12,
                paddingBottom: 12,
                paddingTop: 88,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
              onClick={() => setCalendarOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 390,
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.96)",
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 24px 50px rgba(15,23,42,0.14)",
                  padding: 16,
                  animation: "bookCalendarIn 180ms ease both",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 40px",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <button
                    onClick={() =>
                      visibleMonth && canGoPrev
                        ? setVisibleMonth(addMonths(visibleMonth, -1))
                        : undefined
                    }
                    disabled={!visibleMonth || !canGoPrev}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      color:
                        visibleMonth && canGoPrev ? COLORS.text : "rgba(100,116,139,0.35)",
                      fontSize: 22,
                      cursor: visibleMonth && canGoPrev ? "pointer" : "not-allowed",
                      background: COLORS.bgSoft,
                      border: `1px solid ${COLORS.border}`,
                    }}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: 800,
                      color: COLORS.text,
                    }}
                  >
                    {mounted ? monthLabel : ""}
                  </div>

                  <button
                    onClick={() =>
                      visibleMonth ? setVisibleMonth(addMonths(visibleMonth, 1)) : undefined
                    }
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      color: COLORS.text,
                      fontSize: 22,
                      cursor: "pointer",
                      background: COLORS.bgSoft,
                      border: `1px solid ${COLORS.border}`,
                    }}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                    <div
                      key={label}
                      style={{
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.6,
                        color: COLORS.textMuted,
                        paddingBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 8,
                  }}
                >
                  {mounted &&
                    today &&
                    visibleMonth &&
                    calendarDays.map((day) => {
                      const inMonth = isSameMonth(day, visibleMonth)
                      const normalized = new Date(day)
                      normalized.setHours(0, 0, 0, 0)

                      const disabled = normalized < today
                      const active = selectedDate === formatDateKey(normalized)

                      return (
                        <button
                          key={normalized.toISOString()}
                          onClick={() => handleDateClick(normalized)}
                          disabled={disabled}
                          style={{
                            aspectRatio: "1 / 1",
                            borderRadius: 18,
                            border: "none",
                            background: active ? COLORS.primarySoft : "transparent",
                            color: active
                              ? COLORS.primaryHover
                              : !inMonth
                              ? "rgba(100,116,139,0.35)"
                              : disabled
                              ? "rgba(100,116,139,0.35)"
                              : COLORS.text,
                            fontSize: 15,
                            fontWeight: active ? 900 : 700,
                            cursor: disabled ? "not-allowed" : "pointer",
                            transition:
                              "transform 140ms ease, opacity 140ms ease, background 140ms ease, color 140ms ease",
                          }}
                          onMouseDown={(e) => {
                            if (disabled) return
                            e.currentTarget.style.transform = "scale(0.96)"
                            e.currentTarget.style.opacity = "0.86"
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = "scale(1)"
                            e.currentTarget.style.opacity = "1"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)"
                            e.currentTarget.style.opacity = "1"
                          }}
                          onTouchStart={(e) => {
                            if (disabled) return
                            e.currentTarget.style.transform = "scale(0.96)"
                            e.currentTarget.style.opacity = "0.86"
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "scale(1)"
                            e.currentTarget.style.opacity = "1"
                          }}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}