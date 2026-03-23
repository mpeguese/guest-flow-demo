//app/components/booking/DatePickerModal.tsx
"use client"

import { useEffect, useMemo, useState } from "react"

type DatePickerModalProps = {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  onClose: () => void
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
} as const

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBeforeToday(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const candidate = new Date(date)
  candidate.setHours(0, 0, 0, 0)

  return candidate < today
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

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export default function DatePickerModal({
  selectedDate,
  onSelectDate,
  onClose,
}: DatePickerModalProps) {
  const [today, setToday] = useState<Date | null>(null)
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(selectedDate || new Date()))

  useEffect(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    setToday(now)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(startOfMonth(selectedDate))
    }
  }, [selectedDate])

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(visibleMonth)
  }, [visibleMonth])

  const calendarDays = useMemo(() => {
    return buildCalendarDays(visibleMonth)
  }, [visibleMonth])

  const canGoPrev = useMemo(() => {
    if (!today) return false
    return visibleMonth > startOfMonth(today)
  }, [visibleMonth, today])

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(15,23,42,0.12)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "86px 12px 12px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(388px, calc(100vw - 16px))",
          borderRadius: 28,
          background: "rgba(255,255,255,0.96)",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 28px 56px rgba(15,23,42,0.16)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 16,
            borderBottom: `1px solid ${COLORS.borderSoft}`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,251,252,0.96) 100%)",
          }}
        >
          {/* <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.1,
              color: COLORS.textMuted,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            CHOOSE A DATE
          </div> */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 40px",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => (canGoPrev ? setVisibleMonth(addMonths(visibleMonth, -1)) : undefined)}
              disabled={!canGoPrev}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgSoft,
                color: canGoPrev ? COLORS.text : "rgba(100,116,139,0.35)",
                fontSize: 22,
                cursor: canGoPrev ? "pointer" : "not-allowed",
              }}
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
              {monthLabel}
            </div>

            <button
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgSoft,
                color: COLORS.text,
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div style={{ padding: 14 }}>
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
            {today &&
              calendarDays.map((day) => {
                const inMonth = isSameMonth(day, visibleMonth)
                const normalized = new Date(day)
                normalized.setHours(0, 0, 0, 0)

                const disabled = isBeforeToday(normalized)
                const selected = isSameDay(normalized, selectedDate)

                return (
                  <button
                    key={normalized.toISOString()}
                    type="button"
                    onClick={() => !disabled && onSelectDate(normalized)}
                    disabled={disabled}
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: 18,
                      border: "none",
                      background: selected ? COLORS.primarySoft : "transparent",
                      color: selected
                        ? COLORS.primary
                        : !inMonth
                        ? "rgba(100,116,139,0.35)"
                        : disabled
                        ? "rgba(100,116,139,0.35)"
                        : COLORS.text,
                      fontSize: 15,
                      fontWeight: selected ? 900 : 600,
                      cursor: disabled ? "not-allowed" : "pointer",
                      boxShadow: "none",
                      transition:
                        "transform 140ms ease, opacity 140ms ease, color 140ms ease, background 140ms ease",
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 22,
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 120,
                height: 50,
                borderRadius: 18,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgSoft,
                color: COLORS.text,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedDate) {
                  onSelectDate(selectedDate)
                } else {
                  const now = new Date()
                  now.setHours(0, 0, 0, 0)
                  onSelectDate(now)
                }
              }}
              style={{
                width: 140,
                height: 50,
                borderRadius: 18,
                border: "1px solid rgba(14,165,233,0.24)",
                background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 12px 22px rgba(14,165,233,0.22)",
              }}
            >
              {selectedDate ? "Use date" : "Use today"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}