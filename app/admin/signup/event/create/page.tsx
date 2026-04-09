// app/admin/signup/event/create/page.tsx
"use client"
import { createPortal } from "react-dom"

import Link from "next/link"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type RefObject,
} from "react"
import { useRouter } from "next/navigation"

type EventMode = "tickets" | "locations" | "both"
type EventType = "single" | "series"
type RepeatUnit = "day" | "week" | "month" | "year"
type SeriesEndsMode = "occurrences" | "date"

type EventDraftRecord = {
  id: string
  status: "draft"
  createdAt: string
  updatedAt: string
  basics: {
    eventMode: EventMode
    eventType: EventType
    eventTitle: string
    eventDate: string
    eventEndDate: string
    seriesEndDate: string
    startTime: string
    endTime: string
    description: string
    location: string
    flyerName: string
    flyerPreviewUrl: string
    videoName: string
    videoPreviewUrl: string
    repeatInterval: number
    repeatUnit: RepeatUnit
    repeatOnLabel: string
    repeatOccurrences: number
    seriesEndsMode: SeriesEndsMode
  }
  booking: {
    tickets: Array<{
      id: string
      name: string
      description: string
      price: string
      quantity: string
      quantityVisible: boolean
      status: "draft" | "live" | "scheduled" | "ended"
      salesStart: string
      salesEnd: string
    }>
    locations: Array<{
      id: string
      name: string
      description: string
      price: string
      capacity: string
      quantityVisible: boolean
      status: "draft" | "live" | "scheduled" | "ended"
      bookingStart: string
      bookingEnd: string
    }>
    promoCodes: Array<{
      id: string
      code: string
      discountType: "none" | "fixed" | "percentage"
      discountValue: string
      attributionMode: "none" | "promoter"
      promoterName: string
      appliesTo: "event" | "tickets" | "locations" | "both"
      usageLimit: string
      activeStart: string
      activeEnd: string
    }>
  }
}

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9" r="1.6" />
      <path d="m21 15-4.8-4.8a1.4 1.4 0 0 0-2 0L7 17.4" />
      <path d="m10.5 14.5 1.8-1.8a1.4 1.4 0 0 1 2 0L18 16.4" />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="14" height="14" rx="4" />
      <path d="m17 10 4-2v8l-4-2z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M9 21H3v-6" />
      <path d="M3 21 14 10" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </svg>
  )
}

type SegmentedOption<T extends string> = {
  value: T
  label: string
}

function SlidingPillGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const optionCount = options.length
  const widthPercent = 100 / optionCount

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
        padding: 6,
        display: "flex",
        gap: 6,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 6,
          bottom: 6,
          left: `calc(${activeIndex * widthPercent}% + 6px)`,
          width: `calc(${widthPercent}% - 12px)`,
          borderRadius: 999,
          background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
          boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
          transition: "left 220ms ease, width 220ms ease",
        }}
      />

      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              height: 44,
              borderRadius: 999,
              border: "none",
              background: "transparent",
              color: active ? "#FFFFFF" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              transition: "color 160ms ease",
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function buildTimeOptions() {
  const options: Array<{ value: string; label: string }> = []

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      const minuteLabel = String(minute).padStart(2, "0")
      const period = hour < 12 ? "AM" : "PM"
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      const label = `${hour12}:${minuteLabel} ${period}`
      options.push({ value, label })
    }
  }

  return options
}

function createDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function saveDraftToStorage(record: EventDraftRecord) {
  const draftKey = `guestflow:eventDraft:${record.id}`
  localStorage.setItem(draftKey, JSON.stringify(record))

  const draftIndexKey = "guestflow:eventDraft:index"
  const existingIndexRaw = localStorage.getItem(draftIndexKey)
  const existingIndex: string[] = existingIndexRaw ? JSON.parse(existingIndexRaw) : []

  if (!existingIndex.includes(record.id)) {
    localStorage.setItem(draftIndexKey, JSON.stringify([record.id, ...existingIndex]))
  }
}

function getOrdinal(n: number) {
  const remainder10 = n % 10
  const remainder100 = n % 100

  if (remainder10 === 1 && remainder100 !== 11) return `${n}st`
  if (remainder10 === 2 && remainder100 !== 12) return `${n}nd`
  if (remainder10 === 3 && remainder100 !== 13) return `${n}rd`
  return `${n}th`
}

function getMonthWeekOrdinal(date: Date) {
  return Math.floor((date.getDate() - 1) / 7) + 1
}

function getWeekdayLong(date: Date) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]
}

function getMonthAndDay(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" })
  return `${month} ${date.getDate()}`
}

function deriveRepeatOnLabel(eventDate: string, repeatUnit: RepeatUnit) {
  if (!eventDate) return ""

  const date = new Date(`${eventDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ""

  if (repeatUnit === "day") return "Daily cadence"
  if (repeatUnit === "week") return getWeekdayLong(date)
  if (repeatUnit === "month") {
    return `${getOrdinal(getMonthWeekOrdinal(date))} ${getWeekdayLong(date)}`
  }

  return getMonthAndDay(date)
}

function formatDateLabel(value: string) {
  if (!value) return ""
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTimeLabel(value: string) {
  if (!value) return ""
  const [hourStr, minuteStr] = value.split(":")
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return ""

  const period = hour < 12 ? "AM" : "PM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`
}

function formatDateTimeLabel(dateValue: string, timeValue: string, fallback: string) {
  if (!dateValue && !timeValue) return fallback
  if (dateValue && timeValue) return `${formatDateLabel(dateValue)} · ${formatTimeLabel(timeValue)}`
  if (dateValue) return formatDateLabel(dateValue)
  return formatTimeLabel(timeValue)
}

function parseDateParts(value: string) {
  if (!value) return null
  const [yearStr, monthStr, dayStr] = value.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if ([year, month, day].some(Number.isNaN)) return null
  return { year, month, day }
}

function getDateFromYMD(value: string) {
  const parts = parseDateParts(value)
  if (!parts) return null
  return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0)
}

function toYMD(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  whenActive: boolean
) {
  useEffect(() => {
    if (!whenActive) return

    const handlePointerDown = (event: Event) => {
      const node = ref.current
      if (!node) return
      if (!(event.target instanceof Node)) return
      if (node.contains(event.target)) return
      onOutside()
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [onOutside, ref, whenActive])
}

function StepperInline({
  value,
  onChange,
  min = 1,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
}) {
  return (
    <div
      style={{
        height: 46,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        gap: 8,
        minWidth: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.48), 0 10px 22px rgba(15,23,42,0.05)",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 30,
          height: 30,
          borderRadius: 12,
          border: "none",
          background: "rgba(255,255,255,0.28)",
          color: "#475569",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <MinusIcon />
      </button>

      <div
        style={{
          minWidth: 28,
          textAlign: "center",
          fontSize: 15,
          fontWeight: 900,
          color: "#0F172A",
          flex: 1,
        }}
      >
        {value}
      </div>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 12,
          border: "none",
          background: "rgba(255,255,255,0.28)",
          color: "#475569",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function DateTimePickerField({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  placeholder,
  isMobile,
}: {
  label: string
  dateValue: string
  timeValue: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  placeholder: string
  isMobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showTimeWheel, setShowTimeWheel] = useState(false)

  const initialDate = getDateFromYMD(dateValue) ?? new Date()
  const initialTime = parseTimeToParts(timeValue)

  const [draftDate, setDraftDate] = useState(dateValue)
  const [draftHour, setDraftHour] = useState(initialTime.hour)
  const [draftMinute, setDraftMinute] = useState(initialTime.minute)
  const [draftPeriod, setDraftPeriod] = useState<"AM" | "PM">(initialTime.period)
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return

    const nextDate = getDateFromYMD(dateValue) ?? new Date()
    const nextTime = parseTimeToParts(timeValue)

    setDraftDate(dateValue || toYMD(nextDate))
    setDraftHour(nextTime.hour)
    setDraftMinute(nextTime.minute)
    setDraftPeriod(nextTime.period)
    setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
    setShowTimeWheel(false)
  }, [open, dateValue, timeValue])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leadingDays = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const selectedDate = getDateFromYMD(draftDate)

  const cells: Array<{ date: Date | null; key: string }> = []

  for (let i = 0; i < leadingDays; i += 1) {
    cells.push({ date: null, key: `empty-start-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day, 12, 0, 0, 0),
      key: `day-${day}`,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `empty-end-${cells.length}` })
  }

  const draftTimeValue = buildTimeFromParts(draftHour, draftMinute, draftPeriod)
  const draftTimeLabel = formatTimeLabel(draftTimeValue)

  return (
    <>
      <div style={{ position: "relative", minWidth: 0 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#64748B",
          }}
        >
          {label}
        </label>

        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            minHeight: 48,
            width: "100%",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 18px rgba(15,23,42,0.05)",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxSizing: "border-box",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {/* <CalendarIcon /> */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: 700,
              color: dateValue || timeValue ? "#0F172A" : "#64748B",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {formatDateTimeLabel(dateValue, timeValue, placeholder)}
          </div>

          <div style={{ color: "#64748B", flexShrink: 0 }}>
            <ChevronDownIcon />
          </div>
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
                style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.58)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
                }}
                onClick={() => setOpen(false)}
            >
                <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: isMobile ? "min(88vw, 340px)" : "min(360px, 92vw)",
                    maxHeight: isMobile ? "calc(100vh - 24px)" : "calc(100vh - 48px)",
                    borderRadius: 22,
                    background: "#0A0A0A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
                >
                <div
                    style={{
                    padding: "12px 12px 8px",
                    }}
                >
                    <div
                    style={{
                        width: 42,
                        height: 4,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.22)",
                        margin: "0 auto 10px",
                    }}
                    />

                    <div
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.46)",
                        marginBottom: 12,
                    }}
                    >
                    Select date and time
                    </div>

                    <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                    }}
                    >
                    <div
                        style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#FFFFFF",
                        }}
                    >
                        {viewDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                        })}
                    </div>

                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        }}
                    >
                        <button
                        type="button"
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            border: "none",
                            background: "transparent",
                            color: "rgba(255,255,255,0.52)",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                        }}
                        >
                        <ChevronLeftIcon />
                        </button>

                        <button
                        type="button"
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            border: "none",
                            background: "transparent",
                            color: "#1D9BF0",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                        }}
                        >
                        <ChevronRightIcon />
                        </button>
                    </div>
                    </div>

                    <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                        gap: 4,
                        marginBottom: 6,
                    }}
                    >
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                        <div
                        key={day}
                        style={{
                            textAlign: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "rgba(255,255,255,0.48)",
                            paddingBottom: 2,
                        }}
                        >
                        {day}
                        </div>
                    ))}
                    </div>

                    <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                        gap: 4,
                    }}
                    >
                    {cells.map((cell) => {
                        if (!cell.date) {
                        return <div key={cell.key} style={{ height: 36 }} />
                        }

                        const selected = selectedDate
                        ? isSameDay(cell.date, selectedDate)
                        : false

                        return (
                        <button
                            key={cell.key}
                            type="button"
                            onClick={() => setDraftDate(toYMD(cell.date!))}
                            style={{
                            height: 36,
                            borderRadius: 999,
                            border: "none",
                            background: selected ? "#1D9BF0" : "transparent",
                            color: selected ? "#FFFFFF" : "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: selected ? 800 : 500,
                            cursor: "pointer",
                            }}
                        >
                            {cell.date.getDate()}
                        </button>
                        )
                    })}
                    </div>

                    <div
                    style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                    }}
                    >
                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        }}
                    >
                        <div
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#FFFFFF",
                        }}
                        >
                        Time
                        </div>

                        <button
                        type="button"
                        onClick={() => setShowTimeWheel((prev) => !prev)}
                        style={{
                            minWidth: 92,
                            height: 36,
                            padding: "0 14px",
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(255,255,255,0.12)",
                            color: "#FFFFFF",
                            fontSize: 15,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                        >
                        {draftTimeLabel}
                        </button>
                    </div>

                    {showTimeWheel ? (
                        <div style={{ marginTop: 10 }}>
                        <TimeWheel
                            hour={draftHour}
                            minute={draftMinute}
                            period={draftPeriod}
                            onHourChange={setDraftHour}
                            onMinuteChange={setDraftMinute}
                            onPeriodChange={setDraftPeriod}
                        />
                        </div>
                    ) : null}
                    </div>
                </div>

                <div
                    style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    }}
                >
                    <button
                    type="button"
                    onClick={() => {
                        onDateChange(draftDate)
                        onTimeChange(draftTimeValue)
                        setOpen(false)
                    }}
                    style={{
                        height: 54,
                        border: "none",
                        background: "transparent",
                        color: "#1D9BF0",
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                    >
                    Confirm
                    </button>

                    <div
                    style={{
                        height: 1,
                        background: "rgba(255,255,255,0.08)",
                    }}
                    />

                    <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                        height: 54,
                        border: "none",
                        background: "transparent",
                        color: "#1D9BF0",
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </div>,
            document.body
            )
        : null}
    </>
  )
}

function DateOnlyPickerField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const initialDate = getDateFromYMD(value) ?? new Date()
  const [draftDate, setDraftDate] = useState(value || toYMD(initialDate))
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return

    const nextDate = getDateFromYMD(value) ?? new Date()
    setDraftDate(value || toYMD(nextDate))
    setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
  }, [open, value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leadingDays = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const selectedDate = getDateFromYMD(draftDate)

  const cells: Array<{ date: Date | null; key: string }> = []

  for (let i = 0; i < leadingDays; i += 1) {
    cells.push({ date: null, key: `empty-start-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day, 12, 0, 0, 0),
      key: `day-${day}`,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `empty-end-${cells.length}` })
  }

  return (
    <>
      <div style={{ position: "relative", minWidth: 0 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#64748B",
          }}
        >
          {label}
        </label>

        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            minHeight: 48,
            width: "100%",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 18px rgba(15,23,42,0.05)",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxSizing: "border-box",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <CalendarIcon />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: 700,
              color: value ? "#0F172A" : "#64748B",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value ? formatDateLabel(value) : placeholder}
          </div>

          <div style={{ color: "#64748B", flexShrink: 0 }}>
            <ChevronDownIcon />
          </div>
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.58)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
              }}
              onClick={() => setOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(88vw, 340px)",
                  maxHeight: "calc(100vh - 24px)",
                  borderRadius: 22,
                  background: "#0A0A0A",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 12px 8px",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 4,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.22)",
                      margin: "0 auto 10px",
                    }}
                  />

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.46)",
                      marginBottom: 12,
                    }}
                  >
                    Select date
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#FFFFFF",
                      }}
                    >
                      {viewDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          border: "none",
                          background: "transparent",
                          color: "rgba(255,255,255,0.52)",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <ChevronLeftIcon />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          border: "none",
                          background: "transparent",
                          color: "#1D9BF0",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <ChevronRightIcon />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                      <div
                        key={day}
                        style={{
                          textAlign: "center",
                          fontSize: 10,
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.48)",
                          paddingBottom: 2,
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                      gap: 4,
                    }}
                  >
                    {cells.map((cell) => {
                      if (!cell.date) {
                        return <div key={cell.key} style={{ height: 36 }} />
                      }

                      const selected = selectedDate
                        ? isSameDay(cell.date, selectedDate)
                        : false

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => setDraftDate(toYMD(cell.date!))}
                          style={{
                            height: 36,
                            borderRadius: 999,
                            border: "none",
                            background: selected ? "#1D9BF0" : "transparent",
                            color: selected ? "#FFFFFF" : "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: selected ? 800 : 500,
                            cursor: "pointer",
                          }}
                        >
                          {cell.date.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(draftDate)
                      setOpen(false)
                    }}
                    style={{
                      height: 54,
                      border: "none",
                      background: "transparent",
                      color: "#1D9BF0",
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Confirm
                  </button>

                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      height: 54,
                      border: "none",
                      background: "transparent",
                      color: "#1D9BF0",
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function MediaUploadTile({
  type,
  previewUrl,
  onFileChange,
  onExpand,
  inputRef,
  isMobile,
}: {
  type: "image" | "video"
  previewUrl: string
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onExpand: () => void
  inputRef: RefObject<HTMLInputElement | null>
  isMobile: boolean
}) {
  const hasMedia = Boolean(previewUrl)
  const height = hasMedia
    ? isMobile
      ? 314
      : 416
    : isMobile
      ? 242
      : 320

  return (
    <div
      style={{
        position: "relative",
        minHeight: height,
        height,
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 14px 30px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={type === "image" ? "image/*" : "video/*"}
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
        }}
        aria-label={type === "image" ? "Select event flyer" : "Select event video"}
      >
        {previewUrl ? (
          type === "image" ? (
            <img
              src={previewUrl}
              alt="Event flyer preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <video
              src={previewUrl}
              muted
              loop
              playsInline
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#64748B",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              {type === "image" ? <ImageIcon /> : <VideoIcon />}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                {type === "image" ? "Add Imagery" : "Add Video"}
              </div>
            </div>
          </div>
        )}
      </button>

      {previewUrl ? (
        <>
          <div
            style={{
              position: "absolute",
              insetInline: 0,
              bottom: 0,
              padding: "40px 16px 14px",
              background:
                "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.54) 100%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Tap anywhere to replace
            </div>
          </div>

          <button
            type="button"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.28)",
              background: "rgba(15,23,42,0.44)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            onClick={(event) => {
              event.stopPropagation()
              onExpand()
            }}
            aria-label={`Expand ${type} preview`}
          >
            <ExpandIcon />
          </button>
        </>
      ) : null}
    </div>
  )
}

function parseTimeToParts(value: string) {
  if (!value) {
    return { hour: "9", minute: "00", period: "PM" as "AM" | "PM" }
  }

  const [hourStr, minuteStr] = value.split(":")
  const hour24 = Number(hourStr)
  const minute = Number(minuteStr)

  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return { hour: "9", minute: "00", period: "PM" as "AM" | "PM" }
  }

  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return {
    hour: String(hour12),
    minute: String(minute).padStart(2, "0"),
    period,
  }
}

function buildTimeFromParts(hour: string, minute: string, period: "AM" | "PM") {
  let hourNumber = Number(hour)
  const minuteNumber = Number(minute)

  if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) {
    return "21:00"
  }

  if (period === "AM") {
    if (hourNumber === 12) hourNumber = 0
  } else {
    if (hourNumber !== 12) hourNumber += 12
  }

  return `${String(hourNumber).padStart(2, "0")}:${String(minuteNumber).padStart(2, "0")}`
}

function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}

function TimeWheel({
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: {
  hour: string
  minute: string
  period: "AM" | "PM"
  onHourChange: (value: string) => void
  onMinuteChange: (value: string) => void
  onPeriodChange: (value: "AM" | "PM") => void
}) {
  const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
  const minutes = ["00", "15", "30", "45"]
  const periods: Array<"AM" | "PM"> = ["AM", "PM"]

  const columnStyle: CSSProperties = {
    flex: 1,
    maxHeight: 190,
    overflowY: "auto",
    scrollSnapType: "y mandatory",
    padding: "54px 0",
  }

  const itemBaseStyle: CSSProperties = {
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 500,
    color: "rgba(255,255,255,0.28)",
    scrollSnapAlign: "center",
    border: "none",
    background: "transparent",
    width: "100%",
    cursor: "pointer",
  }

  return (
    <div
      style={{
        position: "relative",
        marginTop: 14,
        borderRadius: 30,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          height: 44,
          borderRadius: 18,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 0,
        }}
      >
        <div style={columnStyle}>
          {hours.map((item) => {
            const active = item === hour
            return (
              <button
                key={item}
                type="button"
                onClick={() => onHourChange(item)}
                style={{
                  ...itemBaseStyle,
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.28)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div style={columnStyle}>
          {minutes.map((item) => {
            const active = item === minute
            return (
              <button
                key={item}
                type="button"
                onClick={() => onMinuteChange(item)}
                style={{
                  ...itemBaseStyle,
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.28)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div style={columnStyle}>
          {periods.map((item) => {
            const active = item === period
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPeriodChange(item)}
                style={{
                  ...itemBaseStyle,
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.28)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AdminSignupEventCreatePage() {
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [eventTitle, setEventTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [seriesEndDate, setSeriesEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [eventMode, setEventMode] = useState<EventMode>("both")
  const [eventType, setEventType] = useState<EventType>("single")

  const [repeatInterval, setRepeatInterval] = useState(1)
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>("month")
  const [repeatOccurrences, setRepeatOccurrences] = useState(12)
  const [seriesEndsMode, setSeriesEndsMode] = useState<SeriesEndsMode>("occurrences")

  const [flyerName, setFlyerName] = useState("")
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState("")
  const [videoName, setVideoName] = useState("")
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("")

  const [lightboxType, setLightboxType] = useState<"image" | "video" | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const flyerInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const previousFlyerUrlRef = useRef("")
  const previousVideoUrlRef = useRef("")

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)")
    const update = () => setIsMobile(media.matches)

    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    return () => {
      if (previousFlyerUrlRef.current) URL.revokeObjectURL(previousFlyerUrlRef.current)
      if (previousVideoUrlRef.current) URL.revokeObjectURL(previousVideoUrlRef.current)
    }
  }, [])

  useEffect(() => {
  setMounted(true)
}, [])



  const descriptionRemaining = 750 - description.length
  const repeatOnLabel = useMemo(
    () => deriveRepeatOnLabel(eventDate, repeatUnit),
    [eventDate, repeatUnit]
  )

  if (!mounted) {
  return null
}

  const handleFlyerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previousFlyerUrlRef.current) {
      URL.revokeObjectURL(previousFlyerUrlRef.current)
    }

    const nextUrl = URL.createObjectURL(file)
    previousFlyerUrlRef.current = nextUrl

    setFlyerName(file.name)
    setFlyerPreviewUrl(nextUrl)
  }

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previousVideoUrlRef.current) {
      URL.revokeObjectURL(previousVideoUrlRef.current)
    }

    const nextUrl = URL.createObjectURL(file)
    previousVideoUrlRef.current = nextUrl

    setVideoName(file.name)
    setVideoPreviewUrl(nextUrl)
  }

  const handleContinue = () => {
    const basicValid =
      eventTitle.trim() &&
      description.trim() &&
      location.trim() &&
      eventDate &&
      startTime &&
      endTime

    const seriesValid =
      eventType === "single" ||
      (seriesEndsMode === "occurrences"
        ? repeatOccurrences >= 1
        : Boolean(seriesEndDate))

    if (!basicValid || !seriesValid) {
      return
    }

    setSubmitting(true)

    const draftId = createDraftId()
    const now = new Date().toISOString()

    const draftRecord: EventDraftRecord = {
      id: draftId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      basics: {
        eventMode,
        eventType,
        eventTitle: eventTitle.trim(),
        eventDate,
        eventEndDate: eventEndDate || eventDate,
        seriesEndDate,
        startTime,
        endTime,
        description: description.trim(),
        location: location.trim(),
        flyerName,
        flyerPreviewUrl,
        videoName,
        videoPreviewUrl,
        repeatInterval,
        repeatUnit,
        repeatOnLabel,
        repeatOccurrences,
        seriesEndsMode,
      },
      booking: {
        tickets: [],
        locations: [],
        promoCodes: [],
      },
    }

    saveDraftToStorage(draftRecord)
    router.push(`/admin/signup/event/create/${draftId}/details`)
  }

  const sectionCard: CSSProperties = {
    borderRadius: isMobile ? 24 : 30,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px rgba(15,23,42,0.06)",
    padding: isMobile ? 16 : 22,
  }

  const fieldShell: CSSProperties = {
    minHeight: 56,
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 22px rgba(15,23,42,0.05)",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    boxSizing: "border-box",
    minWidth: 0,
  }

  const selectShell: CSSProperties = {
    minHeight: 46,
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 22px rgba(15,23,42,0.05)",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    position: "relative",
    boxSizing: "border-box",
    minWidth: 0,
  }

  const fieldLabel: CSSProperties = {
    display: "block",
    marginBottom: 8,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    color: "#64748B",
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
        padding: isMobile ? "16px 12px 22px" : "24px 18px 34px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.22)",
              color: "#0F172A",
              fontSize: 19,
              fontWeight: 900,
              letterSpacing: "-0.5px",
              boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
              border: "1px solid rgba(255,255,255,0.26)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            GF
          </div>

          <Link
            href="/admin/signup?intent=event"
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0F766E",
              textDecoration: "none",
            }}
          >
            Back
          </Link>
        </div>

        {/* <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            padding: "9px 14px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#0369A1",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          Event Setup
        </div> */}

        <div
          style={{
            marginTop: 16,
            fontSize: isMobile ? 30 : 42,
            lineHeight: 1,
            letterSpacing: "-1.2px",
            fontWeight: 900,
            color: "#020617",
            maxWidth: 640,
          }}
        >
          Create your first event
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: isMobile ? 15 : 16,
            fontWeight: 800,
            color: "#334155",
            maxWidth: 620,
          }}
        >
          Start with the media, details, booking style, and event cadence.
        </div>

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gap: 18,
          }}
        >
          <section style={sectionCard}>
            <div
              style={{
                display: "block",
                marginBottom: 12,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                color: "#64748B",
              }}
            >
              Media
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 16,
              }}
            >
              <MediaUploadTile
                type="image"
                previewUrl={flyerPreviewUrl}
                onFileChange={handleFlyerChange}
                onExpand={() => setLightboxType("image")}
                inputRef={flyerInputRef}
                isMobile={isMobile}
              />

              <MediaUploadTile
                type="video"
                previewUrl={videoPreviewUrl}
                onFileChange={handleVideoChange}
                onExpand={() => setLightboxType("video")}
                inputRef={videoInputRef}
                isMobile={isMobile}
              />
            </div>
          </section>

          <section style={sectionCard}>
            <div style={fieldLabel}>Core Details</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={fieldLabel}>Event Title</label>
                <div style={fieldShell}>
                  <input
                    style={{
                      width: "100%",
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 700,
                      color: "#0F172A",
                      boxSizing: "border-box",
                    }}
                    type="text"
                    placeholder="Skyline Saturdays Opening Weekend"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={fieldLabel}>Event Description</label>
                <div
                  style={{
                    width: "100%",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.14)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 22px rgba(15,23,42,0.05)",
                    padding: 14,
                    boxSizing: "border-box",
                  }}
                >
                  <textarea
                    style={{
                      width: "100%",
                      minHeight: 138,
                      border: "none",
                      outline: "none",
                      resize: "vertical",
                      background: "transparent",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F172A",
                      lineHeight: 1.6,
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                    maxLength={750}
                    placeholder="Tell guests what the event is, what to expect, and why they should show up."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    marginTop: 7,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: descriptionRemaining < 80 ? "#D97706" : "#0F766E",
                    }}
                  >
                    {descriptionRemaining} characters left
                  </div>
                </div>
              </div>

              <div>
                <label style={fieldLabel}>Event Location</label>
                <div style={fieldShell}>
                  <LocationIcon />
                  <input
                    style={{
                      width: "100%",
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 700,
                      color: "#0F172A",
                      boxSizing: "border-box",
                    }}
                    type="text"
                    placeholder="Venue name or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={sectionCard}>
            <div style={fieldLabel}>Booking Type</div>

            <SlidingPillGroup<EventMode>
              value={eventMode}
              onChange={setEventMode}
              options={[
                { value: "tickets", label: "Tickets" },
                { value: "locations", label: "Locations" },
                { value: "both", label: "Both" },
              ]}
            />
          </section>

          <section style={sectionCard}>
            <div style={fieldLabel}>Event Type</div>

            <SlidingPillGroup<EventType>
              value={eventType}
              onChange={setEventType}
              options={[
                { value: "single", label: "Single Event" },
                { value: "series", label: "Series" },
              ]}
            />
          </section>

          <section style={sectionCard}>
            <div style={fieldLabel}>Schedule</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <DateTimePickerField
                label={eventType === "single" ? "Starts" : "Series Starts"}
                dateValue={eventDate}
                timeValue={startTime}
                onDateChange={(value) => {
                    setEventDate(value)
                    if (!eventEndDate) {
                    setEventEndDate(value)
                    }
                }}
                onTimeChange={setStartTime}
                placeholder="Select date and start time"
                isMobile={isMobile}
                />

                <DateTimePickerField
                label="Ends"
                dateValue={eventEndDate || eventDate}
                timeValue={endTime}
                onDateChange={setEventEndDate}
                onTimeChange={setEndTime}
                placeholder="Select date and end time"
                isMobile={isMobile}
                />
            </div>

            {eventType === "series" ? (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "120px 112px minmax(0, 1fr)",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    Repeats Every
                  </div>

                  <StepperInline
                    value={repeatInterval}
                    onChange={setRepeatInterval}
                  />

                  <div style={selectShell}>
                    <select
                      style={{
                        width: "100%",
                        height: 44,
                        minWidth: 0,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0F172A",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        cursor: "pointer",
                        paddingRight: 24,
                      }}
                      value={repeatUnit}
                      onChange={(e) => setRepeatUnit(e.target.value as RepeatUnit)}
                    >
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        color: "#64748B",
                        pointerEvents: "none",
                      }}
                    >
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "120px minmax(0, 1fr) 160px",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    Ends
                  </div>

                  <div style={selectShell}>
                    <select
                      style={{
                        width: "100%",
                        height: 44,
                        minWidth: 0,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0F172A",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        cursor: "pointer",
                        paddingRight: 24,
                      }}
                      value={seriesEndsMode}
                      onChange={(e) => setSeriesEndsMode(e.target.value as SeriesEndsMode)}
                    >
                      <option value="occurrences">after number of occurrences</option>
                      <option value="date">on a specific date</option>
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        color: "#64748B",
                        pointerEvents: "none",
                      }}
                    >
                      <ChevronDownIcon />
                    </div>
                  </div>

                  {seriesEndsMode === "occurrences" ? (
                    <StepperInline
                      value={repeatOccurrences}
                      onChange={setRepeatOccurrences}
                    />
                  ) : (
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <DateOnlyPickerField
                        label="Series End Date"
                        value={seriesEndDate}
                        onChange={setSeriesEndDate}
                        placeholder="Select end date"
                      />
                    </div>
                  )}
                </div>

                {repeatOnLabel ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 999,
                      padding: "9px 12px",
                      background: "rgba(56,189,248,0.10)",
                      border: "1px solid rgba(56,189,248,0.16)",
                      color: "#0369A1",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Repeats on {repeatOnLabel}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section
            style={{
              position: "sticky",
              bottom: 12,
              zIndex: 20,
              marginTop: 2,
            }}
          >
            <div
              style={{
                maxWidth: isMobile ? "100%" : 760,
                margin: "0 auto",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                padding: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Link
                href="/admin/signup?intent=event"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  color: "#475569",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 800,
                  minWidth: 0,
                }}
              >
                Back
              </Link>

              <button
                type="button"
                style={{
                  flex: 1.25,
                  height: 48,
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
                  color: "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 800,
                  boxShadow: "0 10px 22px rgba(15,23,42,0.12)",
                  cursor: "pointer",
                  minWidth: 0,
                  opacity: submitting ? 0.8 : 1,
                }}
                onClick={handleContinue}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </button>

              <Link
                href="/admin/dashboard"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  color: "#475569",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 800,
                  minWidth: 0,
                }}
              >
                Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>

      {lightboxType ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.68)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 1000,
          }}
          onClick={() => setLightboxType(null)}
        >
          <div
            style={{
              position: "relative",
              width: "min(92vw, 1080px)",
              maxHeight: "90vh",
              borderRadius: 28,
              overflow: "hidden",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 2,
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(15,23,42,0.54)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              onClick={() => setLightboxType(null)}
            >
              X
            </button>

            {lightboxType === "image" && flyerPreviewUrl ? (
              <img
                src={flyerPreviewUrl}
                alt="Expanded flyer preview"
                style={{
                  width: "100%",
                  maxHeight: "90vh",
                  display: "block",
                  objectFit: "contain",
                  background: "#020617",
                }}
              />
            ) : null}

            {lightboxType === "video" && videoPreviewUrl ? (
              <video
                src={videoPreviewUrl}
                style={{
                  width: "100%",
                  maxHeight: "90vh",
                  display: "block",
                  objectFit: "contain",
                  background: "#020617",
                }}
                controls
                autoPlay
                playsInline
                muted
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}