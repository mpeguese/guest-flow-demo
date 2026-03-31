//app/admin/events/page.tsx
"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type EventStatus = "Draft" | "Published" | "Cancelled"
type EventKind = "Series" | "Standalone Event"
type MediaType = "image" | "video" | ""
type DateMode = "single" | "range"
type RepeatUnit = "day" | "week" | "month"
type Weekday = "Su" | "M" | "T" | "W" | "Th" | "F" | "S"

type EventRecord = {
  id: string
  title: string
  dateMode: DateMode
  eventDate: string
  rangeStartDate: string
  rangeEndDate: string
  startTime: string
  endTime: string
  kind: EventKind
  repeatEveryValue: string
  repeatUnit: RepeatUnit
  repeatDays: Weekday[]
  location: string
  description: string
  mediaType: MediaType
  mediaName: string
  mediaPreviewUrl: string
  allowDateChange: boolean
  allowReservations: boolean
  allowPasses: boolean
  status: EventStatus
}

type EventForm = EventRecord

const pageBackground =
  "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)"

const elevatedBackground =
  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,250,255,0.98) 100%)"

const elevatedShadow = "0 -24px 60px rgba(15,23,42,0.18)"

const textPrimary = "#0F172A"
const textSecondary = "#526077"
const labelText = "#64748B"
const borderColor = "rgba(148,163,184,0.16)"
const aqua = "#17CFCF"
const sky = "#53A7FF"
const coral = "#FF8D7A"
const peach = "#FFD7C7"
const success = "#10B981"

const locationOptions = [
  "LIV Tampa",
  "Sky Lounge",
  "Main Floor",
  "Rooftop",
  "Tangra",
]

const weekdayOptions: Weekday[] = ["Su", "M", "T", "W", "Th", "F", "S"]

const timeOptions = buildTimeOptions()
const defaultPreview = "/images/tangra-interior.jpg"

const initialEvents: EventRecord[] = [
  {
    id: "e1",
    title: "Rooftop Fridays",
    dateMode: "single",
    eventDate: "2026-04-30",
    rangeStartDate: "",
    rangeEndDate: "",
    startTime: "9:00 PM",
    endTime: "2:00 AM",
    kind: "Series",
    repeatEveryValue: "1",
    repeatUnit: "month",
    repeatDays: ["F"],
    location: "Rooftop",
    description:
      "Monthly rooftop experience with premium table reservations and passes.",
    mediaType: "image",
    mediaName: "tangra-interior.jpg",
    mediaPreviewUrl: defaultPreview,
    allowDateChange: false,
    allowReservations: true,
    allowPasses: true,
    status: "Published",
  },
  {
    id: "e2",
    title: "Latin Nights",
    dateMode: "range",
    eventDate: "",
    rangeStartDate: "2026-05-29",
    rangeEndDate: "2026-05-31",
    startTime: "10:00 PM",
    endTime: "3:00 AM",
    kind: "Series",
    repeatEveryValue: "1",
    repeatUnit: "week",
    repeatDays: ["F"],
    location: "Main Floor",
    description:
      "Recurring Latin night with live DJ programming and express entry options.",
    mediaType: "video",
    mediaName: "latin-nights-teaser.mp4",
    mediaPreviewUrl: defaultPreview,
    allowDateChange: false,
    allowReservations: true,
    allowPasses: true,
    status: "Draft",
  },
  {
    id: "e3",
    title: "GuestFlow Summer Kickoff",
    dateMode: "single",
    eventDate: "2026-06-15",
    rangeStartDate: "",
    rangeEndDate: "",
    startTime: "8:00 PM",
    endTime: "1:00 AM",
    kind: "Standalone Event",
    repeatEveryValue: "1",
    repeatUnit: "month",
    repeatDays: [],
    location: "Tangra",
    description: "Standalone seasonal launch party with limited VIP sections.",
    mediaType: "image",
    mediaName: "summer-kickoff-cover.png",
    mediaPreviewUrl: defaultPreview,
    allowDateChange: false,
    allowReservations: true,
    allowPasses: false,
    status: "Cancelled",
  },
]

const emptyForm: EventForm = {
  id: "",
  title: "",
  dateMode: "single",
  eventDate: "",
  rangeStartDate: "",
  rangeEndDate: "",
  startTime: "9:00 PM",
  endTime: "2:00 AM",
  kind: "Standalone Event",
  repeatEveryValue: "1",
  repeatUnit: "month",
  repeatDays: [],
  location: "",
  description: "",
  mediaType: "",
  mediaName: "",
  mediaPreviewUrl: defaultPreview,
  allowDateChange: false,
  allowReservations: true,
  allowPasses: true,
  status: "Draft",
}

function buildTimeOptions() {
  const values: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const suffix = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      const minuteLabel = minute === 0 ? "00" : "30"
      values.push(`${hour12}:${minuteLabel} ${suffix}`)
    }
  }
  return values
}

function formatDateUS(input: string) {
  if (!input) return "Not set"
  const [y, m, d] = input.split("-")
  if (!y || !m || !d) return input
  return `${m}-${d}-${y}`
}

function formatDateLabel(event: EventRecord) {
  if (event.dateMode === "range" && event.rangeStartDate && event.rangeEndDate) {
    return `${formatDateUS(event.rangeStartDate)} - ${formatDateUS(event.rangeEndDate)}`
  }
  return formatDateUS(event.eventDate)
}

function TopButton({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: `1px solid ${active ? "rgba(83,167,255,0.28)" : borderColor}`,
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        borderRadius: 999,
        padding: "12px 16px",
        color: active ? textPrimary : textSecondary,
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  rightContent,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  rightContent?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        border: `1px solid ${borderColor}`,
        borderRadius: 28,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 14,
                color: textSecondary,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {rightContent}
      </div>
      {children}
    </div>
  )
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div
      style={{
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        border: `1px solid ${borderColor}`,
        borderRadius: 24,
        padding: 20,
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.9,
          textTransform: "uppercase",
          color: labelText,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          lineHeight: 1.05,
          fontWeight: 900,
          color: textPrimary,
          marginBottom: 10,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          color: textSecondary,
          fontWeight: 700,
          lineHeight: 1.45,
        }}
      >
        {helper}
      </div>
    </div>
  )
}

function Toggle({
  checked,
  label,
  onToggle,
}: {
  checked: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        appearance: "none",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 18,
        border: `1px solid ${checked ? "rgba(83,167,255,0.24)" : borderColor}`,
        background: checked ? "rgba(83,167,255,0.08)" : "rgba(255,255,255,0.82)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          textAlign: "left",
          fontSize: 14,
          fontWeight: 800,
          color: textPrimary,
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          background: checked ? sky : "#D6E3EA",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#FFFFFF",
            boxShadow: "0 4px 10px rgba(15,23,42,0.18)",
          }}
        />
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status: EventStatus }) {
  const map = {
    Draft: { bg: "rgba(83,167,255,0.14)", color: "#2563EB" },
    Published: { bg: "rgba(16,185,129,0.14)", color: "#059669" },
    Cancelled: { bg: "rgba(255,141,122,0.16)", color: "#D9644A" },
  } as const

  const token = map[status]

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        borderRadius: 999,
        background: token.bg,
        color: token.color,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {status}
    </span>
  )
}

function KindBadge({ kind }: { kind: EventKind }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        borderRadius: 999,
        background:
          kind === "Series" ? "rgba(23,207,207,0.14)" : "rgba(255,215,199,0.70)",
        color: kind === "Series" ? "#0E9F9F" : "#B45309",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {kind}
    </span>
  )
}

function MetaPill({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "aqua" | "sky" | "coral"
}) {
  const styleMap = {
    neutral: {
      background: "rgba(255,255,255,0.78)",
      color: textSecondary,
      border: `1px solid ${borderColor}`,
    },
    aqua: {
      background: "rgba(23,207,207,0.12)",
      color: "#0E9F9F",
      border: "1px solid rgba(23,207,207,0.18)",
    },
    sky: {
      background: "rgba(83,167,255,0.12)",
      color: "#2563EB",
      border: "1px solid rgba(83,167,255,0.18)",
    },
    coral: {
      background: "rgba(255,141,122,0.14)",
      color: "#D9644A",
      border: "1px solid rgba(255,141,122,0.18)",
    },
  } as const

  const token = styleMap[tone]

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 10px",
        borderRadius: 999,
        background: token.background,
        color: token.color,
        border: token.border,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  )
}

function ActionPill({
  label,
  active,
  onClick,
  danger = false,
}: {
  label: string
  active: boolean
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: `1px solid ${
          active
            ? danger
              ? "rgba(255,141,122,0.24)"
              : "rgba(83,167,255,0.24)"
            : borderColor
        }`,
        background: active
          ? danger
            ? "rgba(255,141,122,0.12)"
            : "rgba(83,167,255,0.10)"
          : "rgba(255,255,255,0.82)",
        color: active ? (danger ? "#D9644A" : "#2563EB") : textSecondary,
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: 6,
        padding: 6,
        borderRadius: 18,
        background: "rgba(241,245,249,0.95)",
        border: `1px solid ${borderColor}`,
        width: "100%",
      }}
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              appearance: "none",
              border: "none",
              borderRadius: 14,
              padding: "11px 14px",
              background: active
                ? "linear-gradient(90deg, rgba(23,207,207,0.16) 0%, rgba(83,167,255,0.18) 100%)"
                : "transparent",
              color: active ? textPrimary : textSecondary,
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: active ? "0 8px 20px rgba(15,23,42,0.07)" : "none",
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function ImageGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="8.5" cy="9" r="1.4" />
      <path d="M20.5 15.2 15 10.5l-4.2 3.9-2.3-2-5 4.1" />
    </svg>
  )
}

function VideoGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="13.5" height="14" rx="3" />
      <path d="m17 10 3.8-2.2a.7.7 0 0 1 1 .6v7.2a.7.7 0 0 1-1 .6L17 14" />
      <path d="m9.2 9.3 4 2.7-4 2.7V9.3Z" />
    </svg>
  )
}

function EventCard({
  event,
  onEdit,
  onStatusChange,
}: {
  event: EventRecord
  onEdit: (event: EventRecord) => void
  onStatusChange: (id: string, status: EventStatus) => void
}) {
  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 22,
        padding: 18,
        background: "rgba(255,255,255,0.78)",
      }}
    >
      <div
        className="gf-event-card-head"
        style={{
          display: "grid",
          gridTemplateColumns: "124px 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 110,
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            background: "#F8FAFC",
          }}
        >
          <img
            src={event.mediaPreviewUrl || defaultPreview}
            alt={event.title}
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
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: textPrimary,
                marginBottom: 8,
                lineHeight: 1.15,
              }}
            >
              {event.kind === "Series" && event.eventDate
                ? `${event.title} — ${formatDateUS(event.eventDate)}`
                : event.kind === "Series" &&
                  event.rangeStartDate &&
                  event.rangeEndDate
                ? `${event.title} — ${formatDateUS(event.rangeStartDate)}`
                : event.title}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <KindBadge kind={event.kind} />
              <StatusBadge status={event.status} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEdit(event)}
            style={{
              appearance: "none",
              border: `1px solid ${borderColor}`,
              background: elevatedBackground,
              borderRadius: 999,
              padding: "10px 14px",
              color: textPrimary,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Edit Event
          </button>
        </div>
      </div>

      <div
        className="gf-event-meta"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            padding: 12,
            background: "rgba(255,255,255,0.82)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: labelText,
              marginBottom: 6,
            }}
          >
            Schedule
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 4,
            }}
          >
            {formatDateLabel(event)}
          </div>
          <div
            style={{
              fontSize: 13,
              color: textSecondary,
              fontWeight: 700,
            }}
          >
            {event.startTime} - {event.endTime}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: 12,
            background: "rgba(255,255,255,0.82)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: labelText,
              marginBottom: 6,
            }}
          >
            Location
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 4,
            }}
          >
            {event.location || "Not set"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: textSecondary,
              fontWeight: 700,
            }}
          >
            {event.kind === "Series"
              ? `Repeats every ${event.repeatEveryValue} ${event.repeatUnit}${Number(event.repeatEveryValue) > 1 ? "s" : ""}`
              : "Standalone event"}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: textSecondary,
          marginBottom: 14,
        }}
      >
        {event.description}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <MetaPill label={event.allowDateChange ? "Date Change Allowed" : "Date Locked"} tone="sky" />
        <MetaPill label={event.allowReservations ? "Reservations On" : "Reservations Off"} tone="aqua" />
        <MetaPill label={event.allowPasses ? "Passes On" : "Passes Off"} tone="coral" />
        <MetaPill
          label={event.mediaType ? `${event.mediaType === "image" ? "Hero Image" : "Hero Video"}` : "No Media"}
          tone="neutral"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <ActionPill
          label="Draft"
          active={event.status === "Draft"}
          onClick={() => onStatusChange(event.id, "Draft")}
        />
        <ActionPill
          label="Publish"
          active={event.status === "Published"}
          onClick={() => onStatusChange(event.id, "Published")}
        />
        <ActionPill
          label="Cancel"
          active={event.status === "Cancelled"}
          onClick={() => onStatusChange(event.id, "Cancelled")}
          danger
        />
      </div>
    </div>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: labelText,
        marginBottom: 8,
      }}
    >
      {label}
    </div>
  )
}

function InfoBox({
  title,
  text,
  tone,
}: {
  title: string
  text: string
  tone: "aqua" | "sky" | "coral"
}) {
  const toneMap = {
    aqua: {
      bg: "rgba(23,207,207,0.10)",
      border: "rgba(23,207,207,0.18)",
      title: "#0E9F9F",
    },
    sky: {
      bg: "rgba(83,167,255,0.10)",
      border: "rgba(83,167,255,0.18)",
      title: "#2563EB",
    },
    coral: {
      bg: "rgba(255,141,122,0.12)",
      border: "rgba(255,141,122,0.18)",
      title: "#D9644A",
    },
  } as const

  const token = toneMap[tone]

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        border: `1px solid ${token.border}`,
        background: token.bg,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: token.title,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: textSecondary,
          fontWeight: 700,
        }}
      >
        {text}
      </div>
    </div>
  )
}

function WeekdayPill({
  label,
  active,
  onClick,
}: {
  label: Weekday
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        height: 46,
        width: 46,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? "rgba(83,167,255,0.24)" : borderColor}`,
        background: active ? "rgba(83,167,255,0.10)" : "rgba(255,255,255,0.82)",
        color: active ? "#2563EB" : textSecondary,
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function LocationCombobox({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return options
    return options.filter((item) => item.toLowerCase().includes(q))
  }, [options, value])

  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120)
        }}
        placeholder="Select or type a location"
        style={inputStyle}
      />

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 20,
            borderRadius: 18,
            border: `1px solid ${borderColor}`,
            background: "#FFFFFF",
            boxShadow: "0 20px 40px rgba(15,23,42,0.10)",
            overflow: "hidden",
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onChange(item)
                  setOpen(false)
                }}
                style={{
                  appearance: "none",
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "#FFFFFF",
                  color: textPrimary,
                  padding: "12px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                {item}
              </button>
            ))
          ) : (
            <div
              style={{
                padding: "12px 14px",
                fontSize: 14,
                color: textSecondary,
                fontWeight: 700,
              }}
            >
              Press enter or continue with your typed location.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function EventWizardModal({
  open,
  mode,
  step,
  form,
  onClose,
  onNext,
  onBack,
  onSave,
  onChange,
  onToggle,
  onPickMediaType,
  onSelectMediaFile,
  onToggleRepeatDay,
}: {
  open: boolean
  mode: "create" | "edit"
  step: 1 | 2 | 3
  form: EventForm
  onClose: () => void
  onNext: () => void
  onBack: () => void
  onSave: () => void
  onChange: (field: keyof EventForm, value: string | boolean | Weekday[]) => void
  onToggle: (field: "allowDateChange" | "allowReservations" | "allowPasses") => void
  onPickMediaType: (type: "image" | "video") => void
  onSelectMediaFile: (type: "image" | "video") => void
  onToggleRepeatDay: (day: Weekday) => void
}) {
  if (!open) return null

  const statusOptions: EventStatus[] = ["Draft", "Published", "Cancelled"]

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.52)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 820,
          maxHeight: "92dvh",
          borderRadius: 28,
          overflow: "hidden",
          background: elevatedBackground,
          boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{
            maxHeight: "92dvh",
            overflowY: "auto",
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  color: labelText,
                  marginBottom: 8,
                }}
              >
                GuestFlow Admin
              </div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: textPrimary,
                }}
              >
                {mode === "create" ? "Create Event" : "Edit Event"}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: textSecondary,
                  maxWidth: 560,
                }}
              >
                Grouped steps keep the flow polished and easier to use on mobile.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                appearance: "none",
                border: `1px solid ${borderColor}`,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 999,
                width: 40,
                height: 40,
                color: textPrimary,
                fontWeight: 900,
                fontSize: 18,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              { n: 1, label: "Hero Media" },
              { n: 2, label: "Series & Basics" },
              { n: 3, label: "Rules & Publish" },
            ].map((item) => {
              const active = step === item.n
              const done = step > (item.n as 1 | 2 | 3)

              return (
                <div
                  key={item.n}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 18,
                    border: `1px solid ${
                      active || done ? "rgba(83,167,255,0.24)" : borderColor
                    }`,
                    background:
                      active || done
                        ? "rgba(83,167,255,0.08)"
                        : "rgba(255,255,255,0.82)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 1.1,
                      textTransform: "uppercase",
                      color: active || done ? "#2563EB" : labelText,
                      marginBottom: 6,
                    }}
                  >
                    Step {item.n}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: textPrimary,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>

          {step === 1 ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <FieldLabel label="Media Type" />
                <SegmentedControl
                  value={form.mediaType || "image"}
                  options={[
                    { value: "image", label: "Hero Image" },
                    { value: "video", label: "Short Video" },
                  ]}
                  onChange={(value) => onPickMediaType(value as "image" | "video")}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onSelectMediaFile((form.mediaType || "image") as "image" | "video")
                }
                style={{
                  appearance: "none",
                  width: "100%",
                  textAlign: "left",
                  border: `1px solid ${borderColor}`,
                  background: "rgba(255,255,255,0.84)",
                  borderRadius: 24,
                  padding: 18,
                  cursor: "pointer",
                }}
              >
                <div
                  className="gf-upload-tile"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "58px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      display: "grid",
                      placeItems: "center",
                      background:
                        form.mediaType === "video"
                          ? "rgba(255,141,122,0.12)"
                          : "rgba(83,167,255,0.12)",
                      color: form.mediaType === "video" ? coral : sky,
                    }}
                  >
                    {form.mediaType === "video" ? <VideoGlyph /> : <ImageGlyph />}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {form.mediaType === "video"
                        ? "Upload short video"
                        : "Upload hero image"}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: textSecondary,
                      }}
                    >
                      Tap to open your device photo album or file browser.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(83,167,255,0.10)",
                      color: "#2563EB",
                      fontSize: 13,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Choose File
                  </div>
                </div>
              </button>

              <div
                className="gf-media-preview-wrap"
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: 14,
                  padding: 16,
                  borderRadius: 20,
                  border: `1px solid ${borderColor}`,
                  background: "rgba(255,255,255,0.84)",
                }}
              >
                <div
                  style={{
                    height: 118,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    background: "#F8FAFC",
                  }}
                >
                  <img
                    src={form.mediaPreviewUrl || defaultPreview}
                    alt="Media preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>

                <div>
                  <FieldLabel label="Selected Media" />
                  <input
                    value={form.mediaName}
                    onChange={(e) => onChange("mediaName", e.target.value)}
                    placeholder="Selected file name"
                    style={inputStyle}
                  />

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: textSecondary,
                      lineHeight: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    {form.mediaType
                      ? `Currently set as ${form.mediaType === "image" ? "hero image" : "hero video"}.`
                      : "Choose hero image or short video to continue."}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel label="Event Name" />
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Enter event name"
                    style={inputStyle}
                  />
                </div>
              <div>
                <FieldLabel label="Event Type" />
                <SegmentedControl
                  value={form.kind}
                  options={[
                    { value: "Standalone Event", label: "Standalone" },
                    { value: "Series", label: "Series" }
                  ]}
                  onChange={(value) => onChange("kind", value)}
                />
              </div>

              {form.kind === "Series" ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 20,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.84)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: textPrimary,
                      marginBottom: 12,
                    }}
                  >
                    This event name becomes the recurring series name.
                  </div>

                  <div
                    className="gf-modal-two-col"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <FieldLabel label="Repeats Every" />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "92px 1fr",
                          gap: 10,
                        }}
                      >
                        <input
                          value={form.repeatEveryValue}
                          onChange={(e) => onChange("repeatEveryValue", e.target.value)}
                          placeholder="1"
                          style={inputStyle}
                        />
                        <select
                          value={form.repeatUnit}
                          onChange={(e) =>
                            onChange("repeatUnit", e.target.value as RepeatUnit)
                          }
                          style={inputStyle}
                        >
                          <option value="day">Day</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <FieldLabel label="Repeat Preview" />
                      <div
                        style={{
                          ...inputStyle,
                          display: "flex",
                          alignItems: "center",
                          background: "rgba(241,245,249,0.72)",
                        }}
                      >
                        Repeats every {form.repeatEveryValue || "1"} {form.repeatUnit}
                        {(form.repeatEveryValue || "1") !== "1" ? "s" : ""}
                      </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldLabel label="On" />
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {weekdayOptions.map((day) => (
                          <WeekdayPill
                            key={day}
                            label={day}
                            active={form.repeatDays.includes(day)}
                            onClick={() => onToggleRepeatDay(day)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className="gf-modal-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {/* <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel label="Event Name" />
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Enter event name"
                    style={inputStyle}
                  />
                </div> */}

                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel label="Location" />
                  <LocationCombobox
                    value={form.location}
                    options={locationOptions}
                    onChange={(value) => onChange("location", value)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel label="Event Date Type" />
                  <SegmentedControl
                    value={form.dateMode}
                    options={[
                      { value: "single", label: "Single Date" },
                      { value: "range", label: "Date Range" },
                    ]}
                    onChange={(value) => onChange("dateMode", value)}
                  />
                </div>

                {form.dateMode === "single" ? (
                  <div>
                    <FieldLabel label="Event Date" />
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => onChange("eventDate", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <FieldLabel label="Start Date" />
                      <input
                        type="date"
                        value={form.rangeStartDate}
                        onChange={(e) => onChange("rangeStartDate", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <FieldLabel label="End Date" />
                      <input
                        type="date"
                        value={form.rangeEndDate}
                        onChange={(e) => onChange("rangeEndDate", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                <div>
                  <FieldLabel label="Start Time" />
                  <select
                    value={form.startTime}
                    onChange={(e) => onChange("startTime", e.target.value)}
                    style={inputStyle}
                  >
                    {timeOptions.map((time) => (
                      <option key={`start-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel label="End Time" />
                  <select
                    value={form.endTime}
                    onChange={(e) => onChange("endTime", e.target.value)}
                    style={inputStyle}
                  >
                    {timeOptions.map((time) => (
                      <option key={`end-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel label="Description" />
                <textarea
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  placeholder="Describe the event..."
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    paddingTop: 14,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div
                className="gf-modal-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Toggle
                  checked={form.allowDateChange}
                  label="Allow date change"
                  onToggle={() => onToggle("allowDateChange")}
                />
                <Toggle
                  checked={form.allowReservations}
                  label="Allow reservations"
                  onToggle={() => onToggle("allowReservations")}
                />
                <Toggle
                  checked={form.allowPasses}
                  label="Allow passes"
                  onToggle={() => onToggle("allowPasses")}
                />

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.84)",
                  }}
                >
                  <FieldLabel label="Event Status" />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {statusOptions.map((status) => (
                      <ActionPill
                        key={status}
                        label={status === "Published" ? "Publish" : status}
                        active={form.status === status}
                        danger={status === "Cancelled"}
                        onClick={() => onChange("status", status)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 22,
                  border: `1px solid ${borderColor}`,
                  background: "rgba(255,255,255,0.84)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: labelText,
                    marginBottom: 10,
                  }}
                >
                  Preview Summary
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    fontSize: 14,
                    color: textSecondary,
                    lineHeight: 1.55,
                  }}
                >
                  <div>
                    <strong style={{ color: textPrimary }}>Event:</strong> {form.title || "Not set"}
                  </div>
                  <div>
                    <strong style={{ color: textPrimary }}>Date:</strong>{" "}
                    {form.dateMode === "range"
                      ? `${formatDateUS(form.rangeStartDate)} - ${formatDateUS(form.rangeEndDate)}`
                      : formatDateUS(form.eventDate)}
                  </div>
                  <div>
                    <strong style={{ color: textPrimary }}>Time:</strong> {form.startTime} - {form.endTime}
                  </div>
                  <div>
                    <strong style={{ color: textPrimary }}>Type:</strong> {form.kind}
                  </div>
                  <div>
                    <strong style={{ color: textPrimary }}>Location:</strong> {form.location || "Not set"}
                  </div>
                  <div>
                    <strong style={{ color: textPrimary }}>Status:</strong> {form.status}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {step > 1 ? (
                <button type="button" onClick={onBack} style={secondaryButtonStyle}>
                  Back
                </button>
              ) : (
                <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                  Cancel
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {step < 3 ? (
                <button type="button" onClick={onNext} style={primaryButtonStyle}>
                  Next
                </button>
              ) : (
                <button type="button" onClick={onSave} style={primaryButtonStyle}>
                  Save Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 14,
  border: `1px solid ${borderColor}`,
  outline: "none",
  fontSize: 14,
  fontWeight: 700,
  color: textPrimary,
  background: "rgba(255,255,255,0.9)",
  boxSizing: "border-box",
}

const secondaryButtonStyle: React.CSSProperties = {
  appearance: "none",
  border: `1px solid ${borderColor}`,
  background: "rgba(255,255,255,0.84)",
  color: textPrimary,
  borderRadius: 999,
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
}

const primaryButtonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid rgba(83,167,255,0.22)",
  background: `linear-gradient(90deg, ${aqua} 0%, ${sky} 100%)`,
  color: "#FFFFFF",
  borderRadius: 999,
  padding: "12px 18px",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
}

export default function EventsPage() {
  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const [events, setEvents] = useState<EventRecord[]>(initialEvents)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [filter, setFilter] = useState<"All" | EventStatus>("All")

  const publishedCount = events.filter((e) => e.status === "Published").length
  const draftCount = events.filter((e) => e.status === "Draft").length
  const cancelledCount = events.filter((e) => e.status === "Cancelled").length

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events
    return events.filter((event) => event.status === filter)
  }, [events, filter])

  function openCreateModal() {
    setModalMode("create")
    setForm(emptyForm)
    setStep(1)
    setModalOpen(true)
  }

  function openEditModal(event: EventRecord) {
    setModalMode("edit")
    setForm({ ...event })
    setStep(1)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setStep(1)
    setForm(emptyForm)
  }

  function setFormField(field: keyof EventForm, value: string | boolean | Weekday[]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleFormField(
    field: "allowDateChange" | "allowReservations" | "allowPasses"
  ) {
    setForm((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  function pickMediaType(type: "image" | "video") {
    setForm((current) => ({
      ...current,
      mediaType: type,
    }))
  }

  function selectMediaFile(type: "image" | "video") {
    if (type === "image") imageInputRef.current?.click()
    if (type === "video") videoInputRef.current?.click()
  }

  function handleMediaFileSelected(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    setForm((current) => ({
      ...current,
      mediaType: type,
      mediaName: file.name,
      mediaPreviewUrl: previewUrl,
    }))
  }

  function toggleRepeatDay(day: Weekday) {
    setForm((current) => {
      const exists = current.repeatDays.includes(day)
      return {
        ...current,
        repeatDays: exists
          ? current.repeatDays.filter((item) => item !== day)
          : [...current.repeatDays, day],
      }
    })
  }

  function nextStep() {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
  }

  function previousStep() {
    if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  function saveEvent() {
    const payload: EventRecord = {
      ...form,
      id: form.id || `event_${Date.now()}`,
      title: form.title || "Untitled Event",
      mediaPreviewUrl: form.mediaPreviewUrl || defaultPreview,
    }

    if (modalMode === "create") {
      setEvents((current) => [payload, ...current])
    } else {
      setEvents((current) =>
        current.map((item) => (item.id === payload.id ? payload : item))
      )
    }

    closeModal()
  }

  function changeStatus(id: string, status: EventStatus) {
    setEvents((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: pageBackground,
        color: textPrimary,
      }}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleMediaFileSelected(e, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => handleMediaFileSelected(e, "video")}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 1380,
          margin: "0 auto",
          padding: "28px 18px 48px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelText,
                marginBottom: 8,
              }}
            >
              GuestFlow Admin
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.04,
                fontWeight: 900,
                color: textPrimary,
              }}
            >
              Events
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: textSecondary,
                maxWidth: 760,
              }}
            >
              Manage event series, dated event instances, booking rules, and
              publish states for GuestFlow bookings.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <TopButton
              label="Dashboard"
              onClick={() => router.push("/admin/dashboard")}
            />
            <TopButton label="Create Event" active onClick={openCreateModal} />
          </div>
        </div>

        <div
          className="gf-kpi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <KpiCard
            label="Total Events"
            value={`${events.length}`}
            helper="All current event instances in the admin view"
          />
          <KpiCard
            label="Published"
            value={`${publishedCount}`}
            helper="Live and available for purchase"
          />
          <KpiCard
            label="Drafts"
            value={`${draftCount}`}
            helper="Saved but not yet available to guests"
          />
          <KpiCard
            label="Cancelled"
            value={`${cancelledCount}`}
            helper="Disabled from active guest purchase flow"
          />
        </div>

        <div
          className="gf-events-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 18,
          }}
        >
          <SectionCard
            title="Event Instances"
            subtitle="Create and manage live, draft, and cancelled events"
            rightContent={
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <TopButton
                  label="All"
                  active={filter === "All"}
                  onClick={() => setFilter("All")}
                />
                <TopButton
                  label="Draft"
                  active={filter === "Draft"}
                  onClick={() => setFilter("Draft")}
                />
                <TopButton
                  label="Published"
                  active={filter === "Published"}
                  onClick={() => setFilter("Published")}
                />
                <TopButton
                  label="Cancelled"
                  active={filter === "Cancelled"}
                  onClick={() => setFilter("Cancelled")}
                />
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={openEditModal}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          </SectionCard>

          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "start",
            }}
          >
            <SectionCard
              title="Event Type Snapshot"
              subtitle="High-level structure of current event mix"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <InfoBox
                  title="Series Events"
                  text="Use Series when an event should repeat on a recurring cadence and generate future instances from one branded format."
                  tone="aqua"
                />
                <InfoBox
                  title="Standalone Events"
                  text="Use Standalone for one-off activations, special dates, or unique branded nights."
                  tone="sky"
                />
                <InfoBox
                  title="Publishing"
                  text="Draft keeps the event internal. Publish makes it live for purchase. Cancel removes it from active sales."
                  tone="coral"
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <EventWizardModal
        open={modalOpen}
        mode={modalMode}
        step={step}
        form={form}
        onClose={closeModal}
        onNext={nextStep}
        onBack={previousStep}
        onSave={saveEvent}
        onChange={setFormField}
        onToggle={toggleFormField}
        onPickMediaType={pickMediaType}
        onSelectMediaFile={selectMediaFile}
        onToggleRepeatDay={toggleRepeatDay}
      />

      <style jsx>{`
        @media (max-width: 1160px) {
          .gf-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .gf-events-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 900px) {
          .gf-kpi-grid {
            grid-template-columns: 1fr !important;
          }

          .gf-modal-two-col,
          .gf-media-preview-wrap {
            grid-template-columns: 1fr !important;
          }

          .gf-event-card-head,
          .gf-upload-tile {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .gf-event-meta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}