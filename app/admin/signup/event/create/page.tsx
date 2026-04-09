// app/admin/signup/event/create/page.tsx
// app/admin/signup/event/create/page.tsx
// app/admin/signup/event/create/page.tsx
"use client"

import Link from "next/link"
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
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
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.30)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 16px 36px rgba(15,23,42,0.10)",
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
          boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
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
              height: 42,
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
  const options: string[] = []

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      const minuteLabel = minute === 0 ? "00" : "30"
      const period = hour < 12 ? "AM" : "PM"
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      const label = `${hour12}:${minuteLabel} ${period}`
      options.push(`${value}|${label}`)
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
        height: 42,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.22)",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div
        style={{
          minWidth: 28,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            border: "none",
            background: "rgba(255,255,255,0.32)",
            color: "#475569",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <PlusIcon />
        </button>

        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            border: "none",
            background: "rgba(255,255,255,0.32)",
            color: "#475569",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <MinusIcon />
        </button>
      </div>
    </div>
  )
}

export default function AdminSignupEventCreatePage() {
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(false)

  const [eventTitle, setEventTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
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

  const descriptionRemaining = 750 - description.length
  const timeOptions = useMemo(() => buildTimeOptions(), [])
  const repeatOnLabel = useMemo(
    () => deriveRepeatOnLabel(eventDate, repeatUnit),
    [eventDate, repeatUnit]
  )

  const handleFlyerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFlyerName(file.name)
    const nextUrl = URL.createObjectURL(file)
    setFlyerPreviewUrl(nextUrl)
  }

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoName(file.name)
    const nextUrl = URL.createObjectURL(file)
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

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: isMobile ? "16px 12px 22px" : "24px 18px 30px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 920,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 16,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.46)",
      color: "#0F172A",
      fontSize: 19,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      boxShadow: "0 14px 30px rgba(15,23,42,0.10)",
      border: "1px solid rgba(255,255,255,0.44)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F766E",
      textDecoration: "none",
    },
    card: {
      borderRadius: isMobile ? 26 : 32,
      border: "1px solid rgba(255,255,255,0.42)",
      background: "rgba(255,255,255,0.34)",
      backdropFilter: "blur(26px)",
      WebkitBackdropFilter: "blur(26px)",
      boxShadow: "0 18px 42px rgba(15,23,42,0.10)",
      padding: isMobile ? 18 : 28,
      overflow: "hidden",
      isolation: "isolate",
    },
    intentBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "9px 14px",
      background: "rgba(56,189,248,0.12)",
      border: "1px solid rgba(56,189,248,0.16)",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#0369A1",
    },
    title: {
      marginTop: 16,
      fontSize: isMobile ? 28 : 38,
      lineHeight: 1,
      letterSpacing: "-1.2px",
      fontWeight: 900,
      color: "#020617",
      maxWidth: 620,
    },
    subtitle: {
      marginTop: 10,
      fontSize: isMobile ? 15 : 16,
      fontWeight: 800,
      color: "#334155",
      maxWidth: 580,
    },
    section: {
      marginTop: 24,
    },
    sectionLabel: {
      display: "block",
      marginBottom: 10,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748B",
    },
    mediaGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 16,
    },
    uploadCard: {
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.38)",
      background: "rgba(255,255,255,0.26)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
      padding: 16,
      overflow: "hidden",
    },
    uploadHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: 900,
      color: "#0F172A",
    },
    uploadButton: {
      minWidth: 120,
      height: 40,
      borderRadius: 999,
      border: "1px solid rgba(56,189,248,0.18)",
      background: "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)",
      color: "#0369A1",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 14px",
      boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
    },
    hiddenInput: {
      display: "none",
    },
    previewFrame: {
      position: "relative",
      width: "100%",
      minHeight: isMobile ? 240 : 280,
      height: isMobile ? 240 : "clamp(280px, 36vw, 360px)",
      borderRadius: 20,
      overflow: "hidden",
      background:
        "linear-gradient(180deg, rgba(248,250,252,0.94) 0%, rgba(255,255,255,0.84) 100%)",
      border: "1px solid rgba(255,255,255,0.42)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72), 0 10px 24px rgba(15,23,42,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "default",
    },
    previewMedia: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      cursor: "pointer",
    },
    emptyPreview: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#94A3B8",
    },
    expandButton: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 38,
      height: 38,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.34)",
      background: "rgba(15,23,42,0.46)",
      color: "#ffffff",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },
    fileName: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: 800,
      color: "#0F766E",
      wordBreak: "break-word",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
      gap: isMobile ? 10 : 14,
    },
    full: {
      gridColumn: "1 / -1",
    },
    fieldLabel: {
      display: "block",
      marginBottom: 7,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748B",
    },
    fieldShell: {
      minHeight: 52,
      width: "100%",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      boxSizing: "border-box",
      minWidth: 0,
    },
    fieldInput: {
      width: "100%",
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isMobile ? 13 : 14,
      fontWeight: 600,
      color: "#0F172A",
      boxSizing: "border-box",
    },
    textareaShell: {
      width: "100%",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: 14,
      boxSizing: "border-box",
    },
    textarea: {
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
    },
    helperRow: {
      marginTop: 7,
      display: "flex",
      justifyContent: "flex-end",
    },
    helperCount: {
      fontSize: 12,
      fontWeight: 800,
      color: descriptionRemaining < 80 ? "#D97706" : "#0F766E",
    },
    selectShell: {
      minHeight: 52,
      width: "100%",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      position: "relative",
      boxSizing: "border-box",
      minWidth: 0,
    },
    select: {
      width: "100%",
      height: 50,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isMobile ? 13 : 14,
      fontWeight: 700,
      color: "#0F172A",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
      paddingRight: 24,
    },
    selectIcon: {
      position: "absolute",
      right: 14,
      color: "#64748B",
      pointerEvents: "none",
    },
    recurrenceCard: {
      marginTop: 12,
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,0.34)",
      background: "rgba(255,255,255,0.24)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "0 10px 22px rgba(15,23,42,0.07)",
      padding: 14,
    },
    recurrenceRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "92px 86px minmax(0, 1fr)" : "118px 104px 1fr",
      alignItems: "center",
      gap: isMobile ? 8 : 10,
    },
    recurrenceRowSecond: {
      marginTop: 10,
      display: "grid",
      gridTemplateColumns: isMobile
        ? "42px minmax(0, 1fr) 118px"
        : "54px minmax(0, 1fr) 180px",
      alignItems: "center",
      gap: isMobile ? 8 : 10,
    },
    compactLabel: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: 800,
      color: "#0F172A",
      whiteSpace: "nowrap",
    },
    endsSummary: {
      height: 42,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 10px",
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      color: "#0F766E",
      whiteSpace: "nowrap",
      textAlign: "center",
      minWidth: 0,
    },
    stickyFooter: {
      position: "sticky",
      bottom: 12,
      zIndex: 20,
      marginTop: 24,
    },
    stickyBar: {
      maxWidth: isMobile ? "100%" : 760,
      margin: "0 auto",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.42)",
      background: "rgba(255,255,255,0.44)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
      padding: 8,
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    footerGhostLink: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      color: "#475569",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      minWidth: 0,
    },
    footerPrimary: {
      flex: 1.25,
      height: 46,
      borderRadius: 999,
      border: "none",
      background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
      color: "#FFFFFF",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      boxShadow: "0 10px 22px rgba(15,23,42,0.14)",
      cursor: "pointer",
      minWidth: 0,
      opacity: submitting ? 0.8 : 1,
    },
    lightboxOverlay: {
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
    },
    lightboxCard: {
      position: "relative",
      width: "min(92vw, 1080px)",
      maxHeight: "90vh",
      borderRadius: 28,
      overflow: "hidden",
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
    },
    lightboxClose: {
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
    },
    lightboxMedia: {
      width: "100%",
      maxHeight: "90vh",
      display: "block",
      objectFit: "contain",
      background: "#020617",
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GF</div>
          <Link href="/admin/signup?intent=event" style={styles.backLink}>
            Back
          </Link>
        </div>

        <section style={styles.card}>
          <div style={styles.intentBadge}>Event Setup</div>

          <div style={styles.title}>Create your first event</div>

          <div style={styles.subtitle}>
            Start with the media, details, booking style, and event cadence.
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Media</div>

            <div style={styles.mediaGrid}>
              <div style={styles.uploadCard}>
                <div style={styles.uploadHeader}>
                  <div style={styles.uploadTitle}>Flyer</div>

                  <label style={styles.uploadButton}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={styles.hiddenInput}
                      onChange={handleFlyerChange}
                    />
                  </label>
                </div>

                <div style={styles.previewFrame}>
                  {flyerPreviewUrl ? (
                    <>
                      <img
                        src={flyerPreviewUrl}
                        alt="Flyer preview"
                        style={styles.previewMedia}
                        onClick={() => setLightboxType("image")}
                      />

                      <button
                        type="button"
                        style={styles.expandButton}
                        onClick={() => setLightboxType("image")}
                        aria-label="Expand flyer preview"
                      >
                        <ExpandIcon />
                      </button>
                    </>
                  ) : (
                    <div style={styles.emptyPreview}>
                      <ImageIcon />
                    </div>
                  )}
                </div>

                <div style={styles.fileName}>{flyerName || "Flyer"}</div>
              </div>

              <div style={styles.uploadCard}>
                <div style={styles.uploadHeader}>
                  <div style={styles.uploadTitle}>Video</div>

                  <label style={styles.uploadButton}>
                    Upload
                    <input
                      type="file"
                      accept="video/*"
                      style={styles.hiddenInput}
                      onChange={handleVideoChange}
                    />
                  </label>
                </div>

                <div style={styles.previewFrame}>
                  {videoPreviewUrl ? (
                    <>
                      <video
                        src={videoPreviewUrl}
                        style={styles.previewMedia}
                        controls
                        playsInline
                        muted
                        onClick={() => setLightboxType("video")}
                      />

                      <button
                        type="button"
                        style={styles.expandButton}
                        onClick={() => setLightboxType("video")}
                        aria-label="Expand video preview"
                      >
                        <ExpandIcon />
                      </button>
                    </>
                  ) : (
                    <div style={styles.emptyPreview}>
                      <VideoIcon />
                    </div>
                  )}
                </div>

                <div style={styles.fileName}>{videoName || "Video"}</div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Core Details</div>

            <div style={styles.formGrid}>
              <div style={styles.full}>
                <label style={styles.fieldLabel}>Event Title</label>
                <div style={styles.fieldShell}>
                  <input
                    style={styles.fieldInput}
                    type="text"
                    placeholder="Skyline Saturdays Opening Weekend"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.full}>
                <label style={styles.fieldLabel}>Event Description</label>
                <div style={styles.textareaShell}>
                  <textarea
                    style={styles.textarea}
                    maxLength={750}
                    placeholder="Tell guests what the event is, what to expect, and why they should show up."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={styles.helperRow}>
                  <div style={styles.helperCount}>
                    {descriptionRemaining} characters left
                  </div>
                </div>
              </div>

              <div style={styles.full}>
                <label style={styles.fieldLabel}>Event Location</label>
                <div style={styles.fieldShell}>
                  <LocationIcon />
                  <input
                    style={styles.fieldInput}
                    type="text"
                    placeholder="Venue name or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Booking Type</div>

            <SlidingPillGroup<EventMode>
              value={eventMode}
              onChange={setEventMode}
              options={[
                { value: "tickets", label: "Tickets" },
                { value: "locations", label: "Locations" },
                { value: "both", label: "Both" },
              ]}
            />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Event Type</div>

            <SlidingPillGroup<EventType>
              value={eventType}
              onChange={setEventType}
              options={[
                { value: "single", label: "Single Event" },
                { value: "series", label: "Series" },
              ]}
            />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Schedule</div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.fieldLabel}>
                  {eventType === "single" ? "Event Date" : "Start Date"}
                </label>
                <div style={styles.fieldShell}>
                  <input
                    style={styles.fieldInput}
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              {eventType === "series" ? (
                <div>
                  <label style={styles.fieldLabel}>End Date</label>
                  <div style={styles.fieldShell}>
                    <input
                      style={styles.fieldInput}
                      type="date"
                      value={seriesEndDate}
                      onChange={(e) => setSeriesEndDate(e.target.value)}
                      disabled={seriesEndsMode === "occurrences"}
                    />
                  </div>
                </div>
              ) : (
                <div />
              )}

              <div>
                <label style={styles.fieldLabel}>Start Time</label>
                <div style={styles.selectShell}>
                  <select
                    style={styles.select}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    <option value="">Select start time</option>
                    {timeOptions.map((entry) => {
                      const [value, label] = entry.split("|")
                      return (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                  <div style={styles.selectIcon}>
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>End Time</label>
                <div style={styles.selectShell}>
                  <select
                    style={styles.select}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    <option value="">Select end time</option>
                    {timeOptions.map((entry) => {
                      const [value, label] = entry.split("|")
                      return (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                  <div style={styles.selectIcon}>
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>

            {eventType === "series" ? (
              <div style={styles.recurrenceCard}>
                <div style={styles.recurrenceRow}>
                  <div style={styles.compactLabel}>Repeats Every</div>

                  <StepperInline
                    value={repeatInterval}
                    onChange={setRepeatInterval}
                  />

                  <div style={styles.selectShell}>
                    <select
                      style={styles.select}
                      value={repeatUnit}
                      onChange={(e) => setRepeatUnit(e.target.value as RepeatUnit)}
                    >
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                    <div style={styles.selectIcon}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                <div style={styles.recurrenceRowSecond}>
                  <div style={styles.compactLabel}>Ends</div>

                  <div style={styles.selectShell}>
                    <select
                      style={styles.select}
                      value={seriesEndsMode}
                      onChange={(e) => setSeriesEndsMode(e.target.value as SeriesEndsMode)}
                    >
                      <option value="occurrences">after number of occurrences</option>
                      <option value="date">on a specific date</option>
                    </select>
                    <div style={styles.selectIcon}>
                      <ChevronDownIcon />
                    </div>
                  </div>

                  {seriesEndsMode === "occurrences" ? (
                    <StepperInline
                      value={repeatOccurrences}
                      onChange={setRepeatOccurrences}
                    />
                  ) : (
                    <div style={styles.endsSummary}>Uses End Date above</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <section style={styles.stickyFooter}>
            <div style={styles.stickyBar}>
              <Link href="/admin/signup?intent=event" style={styles.footerGhostLink}>
                Back
              </Link>

              <button
                type="button"
                style={styles.footerPrimary}
                onClick={handleContinue}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </button>

              <Link href="/admin/dashboard" style={styles.footerGhostLink}>
                Dashboard
              </Link>
            </div>
          </section>
        </section>
      </div>

      {lightboxType ? (
        <div style={styles.lightboxOverlay} onClick={() => setLightboxType(null)}>
          <div style={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={styles.lightboxClose}
              onClick={() => setLightboxType(null)}
            >
              Close
            </button>

            {lightboxType === "image" && flyerPreviewUrl ? (
              <img
                src={flyerPreviewUrl}
                alt="Expanded flyer preview"
                style={styles.lightboxMedia}
              />
            ) : null}

            {lightboxType === "video" && videoPreviewUrl ? (
              <video
                src={videoPreviewUrl}
                style={styles.lightboxMedia}
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