// app/admin/signup/event/create/[draftId]/details/page.tsx
"use client"

import { createPortal } from "react-dom"
import Link from "next/link"
import { useEffect, useMemo, useState, useRef, type CSSProperties, type RefObject } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase/client"

type EventMode = "tickets" | "locations" | "both"
type InventoryStatus = "draft" | "live" | "scheduled" | "ended"
type DiscountType = "none" | "fixed" | "percentage"
type AttributionMode = "none" | "promoter"
type PromoAppliesTo =
  | "whole_event"
  | "all_tickets"
  | "selected_tickets"
  | "all_locations"
  | "selected_locations"

type TicketItem = {
  id: string
  name: string
  description: string
  price: string
  quantity: string
  quantityVisible: boolean
  status: InventoryStatus
  salesStart: string
  salesEnd: string
}

type LocationItem = {
  id: string
  venueZoneId: string
  name: string
  description: string
  price: string
  capacity: string
  minGuests: string
  maxGuests: string
  depositAmount: string
  minimumSpend: string
  quantityVisible: boolean
  status: InventoryStatus
  bookingStart: string
  bookingEnd: string
}

type VenueZoneOption = {
  id: string
  venue_id: string
  code: string
  name: string
  slug: string | null
  description: string | null
  zone_type: string
  access_type: string
  capacity: number | null
  min_guests: number | null
  max_guests: number | null
  base_price: number | null
  deposit_amount: number | null
  minimum_spend: number | null
  currency: string
  status: string
  inventory_mode: string
  display_order: number
  image_url: string | null
  notes: string | null
  is_active: boolean
}

type EventContextRow = {
  id: string
  venue_id: string
  slug: string | null
  title: string | null
  start_at: string | null
  end_at: string | null
  is_series: boolean | null
}

type EventDateRow = {
  id: string
  start_at: string | null
  end_at: string | null
  status: string | null
}

type PromoCodeItem = {
  id: string
  code: string
  discountType: DiscountType
  discountValue: string
  attributionMode: AttributionMode
  promoterName: string
  appliesTo: PromoAppliesTo
  selectedTicketIds: string[]
  selectedLocationIds: string[]
  usageLimit: string
  activeStart: string
  activeEnd: string
}

type EventDraftRecord = {
  id: string
  status: "draft"
  createdAt: string
  updatedAt: string
  basics: {
    eventMode: EventMode
    eventType: "single" | "series"
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
  }
  booking: {
    tickets: TicketItem[]
    locations: LocationItem[]
    promoCodes: PromoCodeItem[]
  }
}




function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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

function TrashIcon() {
  return (
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
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 62,
        height: 36,
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.16)",
        background: checked
          ? "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)"
          : "rgba(255,255,255,0.82)",
        boxShadow: checked
          ? "0 10px 24px rgba(15,23,42,0.12)"
          : "inset 0 1px 0 rgba(255,255,255,0.68)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 29 : 3,
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "#ffffff",
          transition: "left 180ms ease",
          boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
        }}
      />
    </button>
  )
}

function createItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function emptyTicket(): TicketItem {
  return {
    id: createItemId(),
    name: "",
    description: "",
    price: "",
    quantity: "",
    quantityVisible: false,
    status: "draft",
    salesStart: "",
    salesEnd: "",
  }
}

function emptyLocation(): LocationItem {
  return {
    id: createItemId(),
    venueZoneId: "",
    name: "",
    description: "",
    price: "",
    capacity: "",
    minGuests: "",
    maxGuests: "",
    depositAmount: "",
    minimumSpend: "",
    quantityVisible: false,
    status: "draft",
    bookingStart: "",
    bookingEnd: "",
  }
}

function emptyPromoCode(): PromoCodeItem {
  return {
    id: createItemId(),
    code: "",
    discountType: "none",
    discountValue: "",
    attributionMode: "none",
    promoterName: "",
    appliesTo: "whole_event",
    selectedTicketIds: [],
    selectedLocationIds: [],
    usageLimit: "",
    activeStart: "",
    activeEnd: "",
  }
}

function readDraft(draftId: string): EventDraftRecord | null {
  const raw = localStorage.getItem(`guestflow:eventDraft:${draftId}`)
  return raw ? JSON.parse(raw) : null
}

function writeDraft(record: EventDraftRecord) {
  localStorage.setItem(`guestflow:eventDraft:${record.id}`, JSON.stringify(record))
}

function normalizeTicket(item: Partial<TicketItem>): TicketItem {
  return {
    id: item.id || createItemId(),
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    quantity: item.quantity || "",
    quantityVisible: Boolean(item.quantityVisible),
    status: item.status || "draft",
    salesStart: item.salesStart || "",
    salesEnd: item.salesEnd || "",
  }
}

function normalizeLocation(item: Partial<LocationItem>): LocationItem {
  return {
    id: item.id || createItemId(),
    venueZoneId: item.venueZoneId || "",
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    capacity: item.capacity || "",
    minGuests: item.minGuests || "",
    maxGuests: item.maxGuests || "",
    depositAmount: item.depositAmount || "",
    minimumSpend: item.minimumSpend || "",
    quantityVisible: Boolean(item.quantityVisible),
    status: item.status || "draft",
    bookingStart: item.bookingStart || "",
    bookingEnd: item.bookingEnd || "",
  }
}

function normalizePromoCode(item: Partial<PromoCodeItem>): PromoCodeItem {
  return {
    id: item.id || createItemId(),
    code: item.code || "",
    discountType: item.discountType || "none",
    discountValue: item.discountValue || "",
    attributionMode: item.attributionMode || "none",
    promoterName: item.promoterName || "",
    appliesTo: item.appliesTo || "whole_event",
    selectedTicketIds: Array.isArray(item.selectedTicketIds) ? item.selectedTicketIds : [],
    selectedLocationIds: Array.isArray(item.selectedLocationIds)
      ? item.selectedLocationIds
      : [],
    usageLimit: item.usageLimit || "",
    activeStart: item.activeStart || "",
    activeEnd: item.activeEnd || "",
  }
}

function normalizeDraft(stored: any): EventDraftRecord {
  const mode: EventMode = stored?.basics?.eventMode ?? "both"
  const rawBooking = stored?.booking ?? {}

  const basics = stored?.basics

const tickets =
  Array.isArray(rawBooking.tickets) && rawBooking.tickets.length > 0
    ? rawBooking.tickets.map((item: Partial<TicketItem>) => normalizeTicket(item))
    : mode === "tickets" || mode === "both"
      ? [emptyTicket()]
      : []

const locations =
  Array.isArray(rawBooking.locations) && rawBooking.locations.length > 0
    ? rawBooking.locations.map((item: Partial<LocationItem>) => normalizeLocation(item))
    : []

const promoCodes = Array.isArray(rawBooking.promoCodes)
  ? rawBooking.promoCodes.map((item: Partial<PromoCodeItem>) => normalizePromoCode(item))
  : []

  return {
    ...stored,
    booking: {
      tickets,
      locations,
      promoCodes,
    },
  }
}

function clampSelectedIds<T extends { id: string }>(items: string[], available: T[]) {
  const allowed = new Set(available.map((item) => item.id))
  return items.filter((id) => allowed.has(id))
}

function splitDateTime(value: string) {
  if (!value) return { date: "", time: "" }
  const [date = "", time = ""] = value.split("T")
  return { date, time: time.slice(0, 5) }
}

function mergeDateTime(date: string, time: string) {
  if (!date && !time) return ""
  if (date && time) return `${date}T${time}`
  if (date) return `${date}T00:00`
  return ""
}

function toInputString(value: number | null | undefined) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function inventoryStatusFromZoneStatus(value: string): InventoryStatus {
  if (value === "active") return "live"
  if (value === "draft") return "draft"
  if (value === "inactive" || value === "hidden" || value === "sold_out") return "ended"
  return "draft"
}

function buildLocationFromVenueZone(
  zone: VenueZoneOption,
  eventDate: string,
  startTime: string,
  endTime: string
): LocationItem {
  const defaultStart =
    eventDate && startTime ? `${eventDate}T${startTime}` : ""

  const defaultEnd =
    eventDate && endTime ? `${eventDate}T${endTime}` : ""

  return {
    id: createItemId(),
    venueZoneId: zone.id,
    name: zone.name || "",
    description: zone.description || "",
    price: toInputString(zone.base_price),
    capacity: toInputString(zone.capacity),
    minGuests: toInputString(zone.min_guests),
    maxGuests: toInputString(zone.max_guests),
    depositAmount: toInputString(zone.deposit_amount),
    minimumSpend: toInputString(zone.minimum_spend),
    quantityVisible: false,
    status: inventoryStatusFromZoneStatus(zone.status),
    bookingStart: defaultStart,
    bookingEnd: defaultEnd,
  }
}

function setDatePart(value: string, nextDate: string) {
  const current = splitDateTime(value)
  return mergeDateTime(nextDate, current.time)
}

function setTimePart(value: string, nextTime: string) {
  const current = splitDateTime(value)
  return mergeDateTime(current.date, nextTime)
}

function MultiSelectChips({
  options,
  selectedIds,
  onToggle,
  emptyLabel,
}: {
  options: { id: string; label: string }[]
  selectedIds: string[]
  onToggle: (id: string) => void
  emptyLabel: string
}) {
  if (!options.length) {
    return <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>{emptyLabel}</div>
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      {options.map((option) => {
        const active = selectedIds.includes(option.id)

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            style={{
              minHeight: 40,
              borderRadius: 999,
              border: active
                ? "1px solid rgba(14,165,233,0.28)"
                : "1px solid rgba(148,163,184,0.18)",
              background: active
                ? "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)"
                : "rgba(255,255,255,0.72)",
              color: active ? "#0369a1" : "#334155",
              fontSize: 13,
              fontWeight: 800,
              padding: "0 14px",
              cursor: "pointer",
              boxShadow: active
                ? "0 10px 22px rgba(56,189,248,0.10)"
                : "inset 0 1px 0 rgba(255,255,255,0.68)",
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

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
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

function parseTimeToParts(
  value: string
): { hour: string; minute: string; period: "AM" | "PM" } {
  if (!value) {
    return { hour: "8", minute: "00", period: "PM" }
  }

  const [hourStr, minuteStrRaw] = value.split(":")
  const rawHour = Number(hourStr)

  if (Number.isNaN(rawHour)) {
    return { hour: "8", minute: "00", period: "PM" }
  }

  const allowedMinutes = ["00", "15", "30", "45"]
  const minute = allowedMinutes.includes(minuteStrRaw) ? minuteStrRaw : "00"
  const period: "AM" | "PM" = rawHour >= 12 ? "PM" : "AM"
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12

  return {
    hour: String(hour12),
    minute,
    period,
  }
}

function buildTimeFromParts(hour: string, minute: string, period: "AM" | "PM") {
  const parsedHour = Number(hour)
  const safeHour = Number.isNaN(parsedHour) ? 12 : parsedHour

  let nextHour = safeHour % 12
  if (period === "PM") nextHour += 12

  return `${String(nextHour).padStart(2, "0")}:${minute}`
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [locked])
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

  const VISIBLE_ROW_HEIGHT = 34
  const VISIBLE_ROWS = 3
  const SIDE_PADDING = VISIBLE_ROW_HEIGHT

  const columnStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: VISIBLE_ROW_HEIGHT * VISIBLE_ROWS,
    borderRadius: 0,
    background: "rgba(255,255,255,0.04)",
    border: "none",
    paddingTop: SIDE_PADDING,
    paddingBottom: SIDE_PADDING,
    paddingLeft: 4,
    paddingRight: 4,
    display: "grid",
    gap: 4,
    overflowY: "auto",
    scrollSnapType: "y mandatory",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
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
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: VISIBLE_ROW_HEIGHT,
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

function DateTimePickerField({
  label,
  dateValue,
  timeValue,
  onChange,
  placeholder,
  isMobile,
}: {
  label: string
  dateValue: string
  timeValue: string
  onChange: (value: string) => void
  placeholder: string
  isMobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showTimeWheel, setShowTimeWheel] = useState(false)

  const initialDate = getDateFromYMD(dateValue) ?? new Date()
  const initialTime = parseTimeToParts(timeValue)

  const [draftDate, setDraftDate] = useState(dateValue || toYMD(initialDate))
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
          <CalendarIcon />
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
                <div style={{ padding: "12px 12px 8px" }}>
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

                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                      if (!cell.date) return <div key={cell.key} style={{ height: 36 }} />

                      const selected = selectedDate ? isSameDay(cell.date, selectedDate) : false

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
                        onChange(mergeDateTime(draftDate, draftTimeValue))
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

function WindowFields({
  label,
  valueStart,
  valueEnd,
  onChangeStart,
  onChangeEnd,
  styles,
  isMobile,
}: {
  label: string
  valueStart: string
  valueEnd: string
  onChangeStart: (next: string) => void
  onChangeEnd: (next: string) => void
  styles: Record<string, CSSProperties>
  isMobile: boolean
}) {
  const start = splitDateTime(valueStart)
  const end = splitDateTime(valueEnd)

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={styles.windowGrid}>
        <DateTimePickerField
          label={`${label} Start`}
          dateValue={start.date}
          timeValue={start.time}
          onChange={onChangeStart}
          placeholder="Select start"
          isMobile={isMobile}
        />

        <DateTimePickerField
          label={`${label} End`}
          dateValue={end.date}
          timeValue={end.time}
          onChange={onChangeEnd}
          placeholder="Select end"
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

type PersistedInventoryDraft = {
  eventId: string
  eventMode: EventMode
  tickets: TicketItem[]
  locations: LocationItem[]
  promoCodes: PromoCodeItem[]
  updatedAt: string
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toNullableNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

function toNullableInteger(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = parseInt(trimmed, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function toPromoDiscountType(value: DiscountType) {
  if (value === "fixed") return "fixed"
  if (value === "percentage") return "percentage"
  return null
}

function zoneCodeFromName(name: string, index: number) {
  const clean = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return clean || `ZONE_${index + 1}`
}

async function saveInventoryDraftToEvent(
  supabase: ReturnType<typeof createClient>,
  payload: PersistedInventoryDraft
) {
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("id, venue_id")
    .eq("id", payload.eventId)
    .single()

  if (eventError || !eventRow) {
    throw new Error(eventError?.message || "Could not load event context.")
  }

  const venueId = eventRow.venue_id ?? null

  // ----------------------------
  // SAVE TICKETS -> ticket_types
  // ----------------------------
  const ticketRows = payload.tickets.map((item, index) => {
  const salesStatus =
    item.status === "ended"
      ? "ended"
      : item.status === "scheduled"
        ? "upcoming"
        : "live"

  const ticketStatus =
    item.status === "ended"
      ? "ended"
      : item.status === "scheduled"
        ? "draft"
        : "live"

  return {
    event_id: payload.eventId,
    event_date_id: null,
    name: item.name.trim() || `Ticket ${index + 1}`,
    description: item.description.trim() || null,
    category_label: null,
    price: toNullableNumber(item.price) ?? 0,
    currency: "USD",
    quantity_total: toNullableInteger(item.quantity) ?? 0,
    quantity_sold: 0,
    per_order_limit: null,
    sale_start_at: item.salesStart || null,
    sale_end_at: item.salesEnd || null,
    sales_status: salesStatus,
    status: ticketStatus,
    sort_order: index,
    is_visible: item.quantityVisible,
    updated_at: payload.updatedAt,
    subtitle: null,
    image_path: null,
    benefits: [],
    badge_label: null,
  }
})

  const { error: deleteTicketsError } = await supabase
    .from("ticket_types")
    .delete()
    .eq("event_id", payload.eventId)

  if (deleteTicketsError) {
    throw new Error(`Could not clear existing tickets: ${deleteTicketsError.message}`)
  }

  if (ticketRows.length > 0) {
    const { error: insertTicketsError } = await supabase
      .from("ticket_types")
      .insert(ticketRows)

    if (insertTicketsError) {
      throw new Error(`Could not save tickets: ${insertTicketsError.message}`)
    }
  }

  // ----------------------------
  // SAVE LOCATIONS -> event_zones
  // ----------------------------
  const zoneRows = payload.locations
    .filter((item) => item.venueZoneId)
    .map((item, index) => {
      const displayName = item.name.trim() || `Location ${index + 1}`
      const slug = slugify(displayName)

      return {
        event_id: payload.eventId,
        venue_id: venueId,
        venue_zone_id: item.venueZoneId,
        code: zoneCodeFromName(displayName, index),
        name: displayName,
        slug: slug || null,
        description: item.description.trim() || null,
        zone_type: "table",
        access_type: "reservation",
        capacity: toNullableInteger(item.capacity),
        min_guests: toNullableInteger(item.minGuests),
        max_guests: toNullableInteger(item.maxGuests),
        base_price: toNullableNumber(item.price),
        deposit_amount: toNullableNumber(item.depositAmount),
        minimum_spend: toNullableNumber(item.minimumSpend),
        currency: "USD",
        status: item.status === "ended" ? "inactive" : "active",
        inventory_mode: "single",
        display_order: index,
        image_url: null,
        notes: null,
        metadata: {
          source: "event-create-details",
          bookingStart: item.bookingStart || null,
          bookingEnd: item.bookingEnd || null,
          quantityVisible: item.quantityVisible,
          localDraftId: item.id,
        },
        is_active: item.status !== "ended",
        updated_at: payload.updatedAt,
      }
    })

  const { error: deleteZonesError } = await supabase
    .from("event_zones")
    .delete()
    .eq("event_id", payload.eventId)

  if (deleteZonesError) {
    throw new Error(`Could not clear existing locations: ${deleteZonesError.message}`)
  }

  if (zoneRows.length > 0) {
    const { error: insertZonesError } = await supabase
      .from("event_zones")
      .insert(zoneRows)

    if (insertZonesError) {
      throw new Error(`Could not save locations: ${insertZonesError.message}`)
    }
  }

  // ----------------------------
  // SAVE PROMO CODES -> promo_codes
  // ----------------------------
  const validPromoRows = payload.promoCodes
    .filter((item) => item.code.trim())
    .map((item) => {
      const discountType = toPromoDiscountType(item.discountType)

      if (!discountType) {
        return null
      }

      return {
        code: item.code.trim().toUpperCase(),
        event_id: payload.eventId,
        ticket_type_id: null,
        discount_type: discountType,
        discount_value: toNullableNumber(item.discountValue) ?? 0,
        max_discount_amount: null,
        usage_limit: toNullableInteger(item.usageLimit),
        starts_at: item.activeStart || null,
        ends_at: item.activeEnd || null,
        active: true,
        updated_at: payload.updatedAt,
      }
    })
    .filter(Boolean)

  const { error: deletePromoError } = await supabase
    .from("promo_codes")
    .delete()
    .eq("event_id", payload.eventId)

  if (deletePromoError) {
    throw new Error(`Could not clear existing promo codes: ${deletePromoError.message}`)
  }

  if (validPromoRows.length > 0) {
    const { error: insertPromoError } = await supabase
      .from("promo_codes")
      .insert(validPromoRows)

    if (insertPromoError) {
      throw new Error(`Could not save promo codes: ${insertPromoError.message}`)
    }
  }

  // ----------------------------
  // TOUCH EVENT UPDATED_AT
  // ----------------------------
  const { error: touchEventError } = await supabase
    .from("events")
    .update({
      updated_at: payload.updatedAt,
    })
    .eq("id", payload.eventId)

  if (touchEventError) {
    throw new Error(touchEventError.message)
  }
}

function getBaseSiteUrl() {
  const envUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : ""

  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/+$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return ""
}

function toDateParam(value: string | null | undefined) {
  if (!value) return ""
  return value.slice(0, 10)
}

function buildPublicEventLink(slug: string, date?: string) {
  const baseUrl = getBaseSiteUrl()
  const params = new URLSearchParams({ event: slug })

  if (date) {
    params.set("date", date)
  }

  return `${baseUrl}/book/map?${params.toString()}`
}

export default function AdminSignupEventDetailsPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const draftId = Array.isArray(params?.draftId) ? params.draftId[0] : params?.draftId ?? ""

  const [draft, setDraft] = useState<EventDraftRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(false)

  const [eventContext, setEventContext] = useState<EventContextRow | null>(null)
  const [eventDates, setEventDates] = useState<EventDateRow[]>([])
  const [venueZones, setVenueZones] = useState<VenueZoneOption[]>([])
  const [loadingVenueZones, setLoadingVenueZones] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [copiedLink, setCopiedLink] = useState("")
  const saveTimeoutRef = useRef<number | null>(null)

  
  const copyLink = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedLink(value)

      window.setTimeout(() => {
        setCopiedLink((current) => (current === value ? "" : current))
      }, 1600)
    } catch {
      setSaveError("Could not copy the public booking link.")
    }
  }

  useEffect(() => {
    const sync = () => setIsCompact(window.innerWidth <= 640)
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [])

  useEffect(() => {
    return () => {
        if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
        }
    }
  }, [])

  useEffect(() => {
    if (!draftId) return

    const stored = readDraft(draftId)

    if (!stored) {
      router.replace("/admin/signup/event/create")
      return
    }

    const nextDraft = normalizeDraft(stored)
    setDraft(nextDraft)
    writeDraft(nextDraft)
    setLoading(false)
  }, [draftId, router])

  useEffect(() => {
    let active = true

    async function loadVenueZones() {
  if (!draftId) return

  setLoadingVenueZones(true)

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("id, venue_id, slug, title, start_at, end_at, is_series")
    .eq("id", draftId)
    .single()

  if (!active) return

  if (eventError || !eventRow) {
    setLoadingVenueZones(false)
    return
  }

  setEventContext(eventRow as EventContextRow)

  const { data: eventDateRows, error: eventDatesError } = await supabase
    .from("event_dates")
    .select("id, start_at, end_at, status")
    .eq("event_id", draftId)
    .order("start_at", { ascending: true })

  if (!active) return

  if (!eventDatesError) {
    setEventDates((eventDateRows || []) as EventDateRow[])
  }

  const { data: zoneRows, error: zoneError } = await supabase
    .from("venue_zones")
    .select("*")
    .eq("venue_id", eventRow.venue_id)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (!active) return

  if (!zoneError) {
    setVenueZones((zoneRows || []) as VenueZoneOption[])
  }

  setLoadingVenueZones(false)
}

    void loadVenueZones()

    return () => {
      active = false
    }
  }, [draftId, supabase])

  const queueDbSave = (record: EventDraftRecord) => {
  if (saveTimeoutRef.current) {
    window.clearTimeout(saveTimeoutRef.current)
  }

  saveTimeoutRef.current = window.setTimeout(async () => {
    try {
      setIsSaving(true)
      setSaveError("")

      await saveInventoryDraftToEvent(supabase, {
        eventId: record.id,
        eventMode: record.basics.eventMode,
        tickets: record.booking.tickets,
        locations: record.booking.locations,
        promoCodes: record.booking.promoCodes,
        updatedAt: record.updatedAt,
      })
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save booking details."
      )
    } finally {
      setIsSaving(false)
    }
  }, 500)
}

  const saveAndSetDraft = (nextDraft: EventDraftRecord) => {
  const cleanedPromoCodes = nextDraft.booking.promoCodes.map((code) => ({
    ...code,
    selectedTicketIds: clampSelectedIds(
      code.selectedTicketIds,
      nextDraft.booking.tickets
    ),
    selectedLocationIds: clampSelectedIds(
      code.selectedLocationIds,
      nextDraft.booking.locations
    ),
  }))

  const record: EventDraftRecord = {
    ...nextDraft,
    updatedAt: new Date().toISOString(),
    booking: {
      ...nextDraft.booking,
      promoCodes: cleanedPromoCodes,
    },
  }

  setDraft(record)
  writeDraft(record)
  queueDbSave(record)
}

  const mode = draft?.basics.eventMode ?? "both"
  const showTickets = mode === "tickets" || mode === "both"
  const showLocations = mode === "locations" || mode === "both"

  const eventSlug = eventContext?.slug?.trim() || ""
  const singleOccurrenceDate =
    draft?.basics?.eventDate || toDateParam(eventContext?.start_at)

  const publicBookingLink =
    eventSlug
      ? buildPublicEventLink(
          eventSlug,
          draft?.basics?.eventType === "series" ? singleOccurrenceDate : undefined
        )
      : ""

const publicBookingHelper =
  draft?.basics?.eventType === "series"
    ? "This is the first occurrence link. Later, you can expand this to show one share link per occurrence."
    : "This is the direct purchasing link for this event."

  const ticketCountLabel = useMemo(() => {
    if (!draft) return ""
    return `${draft.booking.tickets.length} ticket${draft.booking.tickets.length === 1 ? "" : "s"}`
  }, [draft])

  const locationCountLabel = useMemo(() => {
    if (!draft) return ""
    return `${draft.booking.locations.length} location${draft.booking.locations.length === 1 ? "" : "s"}`
  }, [draft])

  const promoCountLabel = useMemo(() => {
    if (!draft) return ""
    return `${draft.booking.promoCodes.length} code${draft.booking.promoCodes.length === 1 ? "" : "s"}`
  }, [draft])

  const updateTicket = (id: string, patch: Partial<TicketItem>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        tickets: draft.booking.tickets.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      },
    })
  }

  const updateLocation = (id: string, patch: Partial<LocationItem>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        locations: draft.booking.locations.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      },
    })
  }

  const addVenueZoneToLocations = (zone: VenueZoneOption) => {
    if (!draft) return

    const alreadySelected = draft.booking.locations.some(
      (item) => item.venueZoneId === zone.id
    )

    if (alreadySelected) return

    const nextLocation = buildLocationFromVenueZone(
      zone,
      draft.basics.eventDate,
      draft.basics.startTime,
      draft.basics.endTime
    )

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        locations: [...draft.booking.locations, nextLocation],
      },
    })
  }

  const removeVenueZoneFromLocations = (venueZoneId: string) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        locations: draft.booking.locations.filter(
          (item) => item.venueZoneId !== venueZoneId
        ),
      },
    })
  }

  const updatePromoCode = (id: string, patch: Partial<PromoCodeItem>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        promoCodes: draft.booking.promoCodes.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      },
    })
  }

  const togglePromoTicket = (promoId: string, ticketId: string) => {
    if (!draft) return

    const promo = draft.booking.promoCodes.find((item) => item.id === promoId)
    if (!promo) return

    const selected = promo.selectedTicketIds.includes(ticketId)
      ? promo.selectedTicketIds.filter((id) => id !== ticketId)
      : [...promo.selectedTicketIds, ticketId]

    updatePromoCode(promoId, { selectedTicketIds: selected })
  }

  const togglePromoLocation = (promoId: string, locationId: string) => {
    if (!draft) return

    const promo = draft.booking.promoCodes.find((item) => item.id === promoId)
    if (!promo) return

    const selected = promo.selectedLocationIds.includes(locationId)
      ? promo.selectedLocationIds.filter((id) => id !== locationId)
      : [...promo.selectedLocationIds, locationId]

    updatePromoCode(promoId, { selectedLocationIds: selected })
  }

  const addTicket = () => {
  if (!draft) return

  const defaultStart =
    draft.basics.eventDate && draft.basics.startTime
      ? `${draft.basics.eventDate}T${draft.basics.startTime}`
      : ""

  const defaultEnd =
    draft.basics.eventDate && draft.basics.endTime
      ? `${draft.basics.eventDate}T${draft.basics.endTime}`
      : ""

  saveAndSetDraft({
    ...draft,
    booking: {
      ...draft.booking,
      tickets: [
        ...draft.booking.tickets,
        {
          ...emptyTicket(),
          salesStart: defaultStart,
          salesEnd: defaultEnd,
        },
      ],
    },
  })
}


  const addPromoCode = () => {
  if (!draft) return

  const defaultStart =
    draft.basics.eventDate && draft.basics.startTime
      ? `${draft.basics.eventDate}T${draft.basics.startTime}`
      : ""

  const defaultEnd =
    draft.basics.eventDate && draft.basics.endTime
      ? `${draft.basics.eventDate}T${draft.basics.endTime}`
      : ""

  saveAndSetDraft({
    ...draft,
    booking: {
      ...draft.booking,
      promoCodes: [
        ...draft.booking.promoCodes,
        {
          ...emptyPromoCode(),
          activeStart: defaultStart,
          activeEnd: defaultEnd,
        },
      ],
    },
  })
}

  const removeTicket = (id: string) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        tickets: draft.booking.tickets.filter((item) => item.id !== id),
      },
    })
  }

  const removeLocation = (id: string) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        locations: draft.booking.locations.filter((item) => item.id !== id),
      },
    })
  }

  const removePromoCode = (id: string) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        promoCodes: draft.booking.promoCodes.filter((item) => item.id !== id),
      },
    })
  }

  const grid2 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  } satisfies CSSProperties

  const grid3 = {
    display: "grid",
    gridTemplateColumns: isCompact ? "1fr 1fr 1fr" : "repeat(3, minmax(0, 1fr))",
    gap: 10,
    alignItems: "end",
  } satisfies CSSProperties

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: isCompact ? "18px 12px 24px" : "28px 18px 34px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 980,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
      marginBottom: 18,
    },
    gfMark: {
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
      boxShadow: "0 14px 32px rgba(15, 23, 42, 0.18)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    // card: {
    //   borderRadius: isCompact ? 28 : 34,
    //   border: "1px solid rgba(148, 163, 184, 0.16)",
    //   background: "rgba(255, 255, 255, 0.82)",
    //   backdropFilter: "blur(20px)",
    //   WebkitBackdropFilter: "blur(20px)",
    //   boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
    //   padding: isCompact ? 20 : 34,
    //   overflow: "hidden",
    //   isolation: "isolate",
    // },
    contentWrap: {
    display: "grid",
    gap: 20,
    },
    intentBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "10px 16px",
      //background: "rgba(15, 118, 110, 0.08)",
      //border: "1px solid rgba(15, 118, 110, 0.12)",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.6px",
      textTransform: "uppercase",
      color: "#0f766e",
    },
    title: {
      marginTop: 18,
      fontSize: isCompact ? 30 : 42,
      lineHeight: 1.02,
      letterSpacing: "-1.4px",
      fontWeight: 900,
      color: "#020617",
      maxWidth: 720,
    },
    subtitle: {
      marginTop: 12,
      fontSize: isCompact ? 16 : 18,
      fontWeight: 800,
      color: "#0f172a",
      maxWidth: 720,
    },
    section: {
      marginTop: 28,
    },
    sectionTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    countBadge: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "9px 14px",
      background: "rgba(255,255,255,0.82)",
      border: "1px solid rgba(148,163,184,0.16)",
      color: "#475569",
      fontSize: 12,
      fontWeight: 800,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    itemCard: {
      borderRadius: isCompact ? 24 : 30,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px rgba(15,23,42,0.06)",
      padding: isCompact ? 16 : 22,
      marginTop: 14,
    },
    itemHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 900,
      color: "#0f172a",
    },
    ghostDanger: {
      width: 40,
      height: 40,
      borderRadius: 999,
      border: "1px solid rgba(248,113,113,0.18)",
      background: "rgba(255,255,255,0.82)",
      color: "#ef4444",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    fieldLabel: {
      display: "block",
      marginBottom: 6,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    fieldSelectShell: {
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
      position: "relative",
      boxSizing: "border-box",
      minWidth: 0,
    },
    fieldSelect: {
      width: "100%",
      height: 50,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isCompact ? 13 : 14,
      fontWeight: 700,
      color: "#0F172A",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
      paddingRight: 24,
      fontFamily: "inherit",
    },
    fieldSelectIcon: {
      position: "absolute",
      right: 14,
      color: "#64748B",
      pointerEvents: "none",
    },
    fieldShell: {
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
    },
    fieldInput: {
      width: "100%",
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isCompact ? 13 : 15,
      fontWeight: 700,
      color: "#0f172a",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textareaShell: {
      width: "100%",
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,0.22)",
      background: "rgba(255,255,255,0.14)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 22px rgba(15,23,42,0.05)",
      padding: 16,
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      minHeight: 110,
      border: "none",
      outline: "none",
      resize: "vertical",
      background: "transparent",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      lineHeight: 1.65,
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    helper: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: 700,
      color: "#64748b",
      lineHeight: 1.5,
    },
    toggleRow: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f172a",
    },
    addRow: {
      marginTop: 16,
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
    },
    addButton: {
      height: 48,
      borderRadius: 999,
      border: "1px solid rgba(56,189,248,0.18)",
      background:
        "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)",
      color: "#0369a1",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "0 18px",
      boxShadow: "0 10px 24px rgba(56,189,248,0.10)",
    },
    windowCard: {
      borderRadius: 22,
      border: "1px solid rgba(148,163,184,0.14)",
      background: "rgba(255,255,255,0.46)",
      padding: 14,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58)",
    },
    windowTitle: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "1.3px",
      textTransform: "uppercase",
      color: "#475569",
      marginBottom: 12,
    },
    windowGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
      gap: 14,
    },
    stickyFooter: {
        position: "sticky",
        bottom: 12,
        zIndex: 20,
        marginTop: 24,
        },
        stickyBar: {
        maxWidth: isCompact ? "100%" : 760,
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
        height: 48,
        borderRadius: 999,
        color: "#475569",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 800,
        minWidth: 0,
        },
        footerPrimary: {
        flex: 1.25,
        height: 48,
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
        color: "#FFFFFF",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 800,
        boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
        cursor: "pointer",
        minWidth: 0,
        },
    loader: {
      color: "#0f172a",
      fontSize: 15,
      fontWeight: 700,
      padding: "40px 0",
    },
    loaderWrap: {
    borderRadius: isCompact ? 24 : 30,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px rgba(15,23,42,0.06)",
    padding: isCompact ? 16 : 22,
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
    fontSize: isCompact ? 13 : 14,
    fontWeight: 700,
    color: "#0F172A",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
    paddingRight: 24,
    fontFamily: "inherit",
    },
    selectIcon: {
    position: "absolute",
    right: 14,
    color: "#64748B",
    pointerEvents: "none",
    },
    shareCard: {
  marginTop: 18,
  borderRadius: isCompact ? 22 : 26,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px rgba(15,23,42,0.06)",
  padding: isCompact ? 16 : 18,
},
shareLabel: {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "1.4px",
  textTransform: "uppercase",
  color: "#64748b",
},
shareRow: {
  marginTop: 10,
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
},
shareLinkShell: {
  flex: 1,
  minWidth: 0,
  minHeight: 50,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.16)",
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
},
shareLinkText: {
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
},
shareCopyBtn: {
  width: 50,
  height: 50,
  borderRadius: 16,
  border: "1px solid rgba(56,189,248,0.18)",
  background:
    "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)",
  color: "#0369a1",
  fontSize: 18,
  fontWeight: 900,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
},
shareHelper: {
  marginTop: 10,
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  lineHeight: 1.5,
},
  }

  if (loading || !draft) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.loaderWrap}>
            <div style={styles.loader}>Loading booking details…</div>
          </div>
        </div>
      </div>
    )
  }

  const ticketOptions = draft.booking.tickets.map((ticket, index) => ({
    id: ticket.id,
    label: ticket.name.trim() || `Ticket ${index + 1}`,
  }))

  const locationOptions = draft.booking.locations.map((location, index) => ({
    id: location.id,
    label: location.name.trim() || `Location ${index + 1}`,
  }))

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GF</div>
          <Link href="/admin/signup/event/create" style={styles.backLink}>
            Back
          </Link>
        </div>

        <section style={styles.contentWrap}>
          {/* <div style={styles.intentBadge}>Booking Details</div> */}

          <div style={styles.title}>Set up your tickets, locations, and promo codes</div>

          <div style={styles.subtitle}>
            Build richer inventory with staged releases, cleaner availability windows, and promo attribution.
          </div>

          {publicBookingLink ? (
            <div style={styles.shareCard}>
                <div style={styles.shareLabel}>Public Event Link</div>

                <div style={styles.shareRow}>
                <div style={styles.shareLinkShell}>
                    <div style={styles.shareLinkText}>{publicBookingLink}</div>
                </div>

                <button
                  type="button"
                  style={styles.shareCopyBtn}
                  onClick={() => void copyLink(publicBookingLink)}
                  aria-label={copiedLink === publicBookingLink ? "Copied" : "Copy public booking link"}
                  title={copiedLink === publicBookingLink ? "Copied" : "Copy link"}
                >
                  {copiedLink === publicBookingLink ? "✓" : <CopyIcon />}
                </button>
                </div>

                <div style={styles.shareHelper}>{publicBookingHelper}</div>
            </div>
            ) : null}

          {showTickets ? (
            <div style={styles.section}>
                <div style={styles.sectionTop}>
                <div style={styles.sectionLabel}>Tickets</div>
                <div style={styles.countBadge}>{ticketCountLabel}</div>
                </div>

                {draft.booking.tickets.map((ticket, index) => (
                <div key={ticket.id} style={styles.itemCard}>
                    <div style={styles.itemHeader}>
                    <div style={styles.itemTitle}>Ticket {index + 1}</div>

                    {draft.booking.tickets.length > 1 ? (
                        <button
                        type="button"
                        style={styles.ghostDanger}
                        onClick={() => removeTicket(ticket.id)}
                        aria-label={`Remove ticket ${index + 1}`}
                        >
                        <TrashIcon />
                        </button>
                    ) : null}
                    </div>

                    <div style={{ display: "grid", gap: 14 }}>
                    <div>
                        <label style={styles.fieldLabel}>Ticket Name</label>
                        <div style={styles.fieldShell}>
                        <input
                            style={styles.fieldInput}
                            type="text"
                            placeholder="General Admission"
                            value={ticket.name}
                            onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                        />
                        </div>
                    </div>

                    <div>
                        <label style={styles.fieldLabel}>Ticket Description</label>
                        <div style={styles.textareaShell}>
                        <textarea
                            style={styles.textarea}
                            placeholder="Admits one guest. Includes standard event access."
                            value={ticket.description}
                            onChange={(e) =>
                            updateTicket(ticket.id, { description: e.target.value })
                            }
                        />
                        </div>
                    </div>

                    <div style={grid3}>
                        <div>
                        <label style={styles.fieldLabel}>Price</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="decimal"
                            placeholder="25.00"
                            value={ticket.price}
                            onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Quantity</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="numeric"
                            placeholder="150"
                            value={ticket.quantity}
                            onChange={(e) =>
                                updateTicket(ticket.id, { quantity: e.target.value })
                            }
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Status</label>
                        <div style={styles.fieldSelectShell}>
                            <select
                            style={styles.fieldSelect}
                            value={ticket.status}
                            onChange={(e) =>
                                updateTicket(ticket.id, {
                                status: e.target.value as InventoryStatus,
                                })
                            }
                            >
                            <option value="draft">Draft</option>
                            <option value="live">Live</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ended">Ended</option>
                            </select>
                        </div>
                        </div>
                    </div>

                    <WindowFields
                        label="Sales Window"
                        valueStart={ticket.salesStart}
                        valueEnd={ticket.salesEnd}
                        onChangeStart={(next) => updateTicket(ticket.id, { salesStart: next })}
                        onChangeEnd={(next) => updateTicket(ticket.id, { salesEnd: next })}
                        styles={styles}
                        isMobile={isCompact}
                    />

                    <div style={styles.toggleRow}>
                        <div>
                        <div style={styles.toggleLabel}>Show quantity to customer</div>
                        <div style={styles.helper}>
                            Turn this on when you want buyers to see remaining ticket inventory.
                        </div>
                        </div>
                        <Toggle
                        checked={ticket.quantityVisible}
                        onChange={(value) =>
                            updateTicket(ticket.id, { quantityVisible: value })
                        }
                        />
                    </div>
                    </div>
                </div>
                ))}

                <div style={styles.addRow}>
                <button type="button" style={styles.addButton} onClick={addTicket}>
                    <PlusIcon />
                    Add Ticket
                </button>
                </div>
            </div>
            ) : null}

            {showLocations ? (
            <div style={styles.section}>
                <div style={styles.sectionTop}>
                <div style={styles.sectionLabel}>Locations</div>
                <div style={styles.countBadge}>{locationCountLabel}</div>
                </div>

                <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
                <div style={styles.helper}>
                    Select from the venue’s existing mapped zones, then adjust event-specific pricing and guest settings below.
                </div>

                {loadingVenueZones ? (
                    <div style={styles.helper}>Loading venue zones...</div>
                ) : venueZones.length ? (
                    <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                    >
                    {venueZones.map((zone) => {
                        const selected = draft.booking.locations.some(
                        (item) => item.venueZoneId === zone.id
                        )

                        return (
                        <button
                            key={zone.id}
                            type="button"
                            onClick={() =>
                            selected
                                ? removeVenueZoneFromLocations(zone.id)
                                : addVenueZoneToLocations(zone)
                            }
                            style={{
                            minHeight: 40,
                            borderRadius: 999,
                            border: selected
                                ? "1px solid rgba(14,165,233,0.28)"
                                : "1px solid rgba(148,163,184,0.18)",
                            background: selected
                                ? "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)"
                                : "rgba(255,255,255,0.72)",
                            color: selected ? "#0369a1" : "#334155",
                            fontSize: 13,
                            fontWeight: 800,
                            padding: "0 14px",
                            cursor: "pointer",
                            boxShadow: selected
                                ? "0 10px 22px rgba(56,189,248,0.10)"
                                : "inset 0 1px 0 rgba(255,255,255,0.68)",
                            }}
                        >
                            {zone.name}
                        </button>
                        )
                    })}
                    </div>
                ) : (
                    <div style={styles.helper}>
                    No active venue zones were found for this venue.
                    </div>
                )}
                </div>

                {draft.booking.locations.map((item, index) => (
                <div key={item.id} style={styles.itemCard}>
                    <div style={styles.itemHeader}>
                    <div style={styles.itemTitle}>Location {index + 1}</div>

                    {draft.booking.locations.length > 1 ? (
                        <button
                        type="button"
                        style={styles.ghostDanger}
                        onClick={() => removeLocation(item.id)}
                        aria-label={`Remove location ${index + 1}`}
                        >
                        <TrashIcon />
                        </button>
                    ) : null}
                    </div>

                    <div style={{ display: "grid", gap: 14 }}>
                    <div>
                        <label style={styles.fieldLabel}>Location Name</label>
                        <div style={styles.fieldShell}>
                        <input
                            style={styles.fieldInput}
                            type="text"
                            placeholder="VIP Booth A"
                            value={item.name}
                            onChange={(e) => updateLocation(item.id, { name: e.target.value })}
                        />
                        </div>
                    </div>

                    <div>
                        <label style={styles.fieldLabel}>Location Description</label>
                        <div style={styles.textareaShell}>
                        <textarea
                            style={styles.textarea}
                            placeholder="Seats up to 6 guests with premium placement."
                            value={item.description}
                            onChange={(e) =>
                            updateLocation(item.id, { description: e.target.value })
                            }
                        />
                        </div>
                    </div>

                    <div style={grid3}>
                        <div>
                        <label style={styles.fieldLabel}>Price</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="decimal"
                            placeholder="250.00"
                            value={item.price}
                            onChange={(e) => updateLocation(item.id, { price: e.target.value })}
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Capacity</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="numeric"
                            placeholder="6"
                            value={item.capacity}
                            onChange={(e) =>
                                updateLocation(item.id, { capacity: e.target.value })
                            }
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Status</label>
                        <div style={styles.fieldSelectShell}>
                            <select
                            style={styles.fieldSelect}
                            value={item.status}
                            onChange={(e) =>
                                updateLocation(item.id, {
                                status: e.target.value as InventoryStatus,
                                })
                            }
                            >
                            <option value="draft">Draft</option>
                            <option value="live">Live</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ended">Ended</option>
                            </select>
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Min Guests</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="numeric"
                            placeholder="2"
                            value={item.minGuests}
                            onChange={(e) =>
                                updateLocation(item.id, { minGuests: e.target.value })
                            }
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Max Guests</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="numeric"
                            placeholder="8"
                            value={item.maxGuests}
                            onChange={(e) =>
                                updateLocation(item.id, { maxGuests: e.target.value })
                            }
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Deposit</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="decimal"
                            placeholder="100.00"
                            value={item.depositAmount}
                            onChange={(e) =>
                                updateLocation(item.id, { depositAmount: e.target.value })
                            }
                            />
                        </div>
                        </div>

                        <div>
                        <label style={styles.fieldLabel}>Minimum Spend</label>
                        <div style={styles.fieldShell}>
                            <input
                            style={styles.fieldInput}
                            type="text"
                            inputMode="decimal"
                            placeholder="500.00"
                            value={item.minimumSpend}
                            onChange={(e) =>
                                updateLocation(item.id, { minimumSpend: e.target.value })
                            }
                            />
                        </div>
                        </div>
                    </div>

                    <WindowFields
                        label="Booking Window"
                        valueStart={item.bookingStart}
                        valueEnd={item.bookingEnd}
                        onChangeStart={(next) => updateLocation(item.id, { bookingStart: next })}
                        onChangeEnd={(next) => updateLocation(item.id, { bookingEnd: next })}
                        styles={styles}
                        isMobile={isCompact}
                    />

                    <div style={styles.toggleRow}>
                        <div>
                        <div style={styles.toggleLabel}>Show quantity to customer</div>
                        <div style={styles.helper}>
                            Use this when you want guests to see how much location inventory remains.
                        </div>
                        </div>
                        <Toggle
                        checked={item.quantityVisible}
                        onChange={(value) =>
                            updateLocation(item.id, { quantityVisible: value })
                        }
                        />
                    </div>
                    </div>
                </div>
                ))}
            </div>
            ) : null}

          <div style={styles.section}>
            <div style={styles.sectionTop}>
              <div style={styles.sectionLabel}>Promo Codes</div>
              <div style={styles.countBadge}>{promoCountLabel}</div>
            </div>

            {draft.booking.promoCodes.map((promo, index) => (
              <div key={promo.id} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <div style={styles.itemTitle}>Promo Code {index + 1}</div>

                  <button
                    type="button"
                    style={styles.ghostDanger}
                    onClick={() => removePromoCode(promo.id)}
                    aria-label={`Remove promo code ${index + 1}`}
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  <div style={grid2}>
                    <div>
                      <label style={styles.fieldLabel}>Code</label>
                      <div style={styles.fieldShell}>
                        <input
                          style={styles.fieldInput}
                          type="text"
                          placeholder="MIKE10"
                          value={promo.code}
                          onChange={(e) =>
                            updatePromoCode(promo.id, {
                              code: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label style={styles.fieldLabel}>Usage Limit</label>
                      <div style={styles.fieldShell}>
                        <input
                          style={styles.fieldInput}
                          type="text"
                          inputMode="numeric"
                          placeholder="100"
                          value={promo.usageLimit}
                          onChange={(e) =>
                            updatePromoCode(promo.id, {
                              usageLimit: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div style={grid3}>
                    <div>
                    <label style={styles.fieldLabel}>Discount Type</label>
                        <div style={styles.fieldSelectShell}>
                            <select
                            style={styles.fieldSelect}
                            value={promo.discountType}
                            onChange={(e) =>
                                updatePromoCode(promo.id, {
                                discountType: e.target.value as DiscountType,
                                discountValue:
                                    e.target.value === "none" ? "" : promo.discountValue,
                                })
                            }
                            >
                            <option value="none">None</option>
                            <option value="fixed">Fixed Amount Off</option>
                            <option value="percentage">Percentage Off</option>
                            </select>
                            <div style={styles.fieldSelectIcon}>
                            <ChevronDownIcon />
                            </div>
                        </div>
                    </div>

                    <div>
                      <label style={styles.fieldLabel}>Discount Value</label>
                      <div style={styles.fieldShell}>
                        <input
                          style={styles.fieldInput}
                          type="text"
                          inputMode="decimal"
                          placeholder={promo.discountType === "percentage" ? "10" : "20.00"}
                          value={promo.discountValue}
                          onChange={(e) =>
                            updatePromoCode(promo.id, {
                              discountValue: e.target.value,
                            })
                          }
                          disabled={promo.discountType === "none"}
                        />
                      </div>
                    </div>

                    <div>
                    <label style={styles.fieldLabel}>Attribution</label>
                        <div style={styles.fieldSelectShell}>
                            <select
                            style={styles.fieldSelect}
                            value={promo.attributionMode}
                            onChange={(e) =>
                                updatePromoCode(promo.id, {
                                attributionMode: e.target.value as AttributionMode,
                                promoterName:
                                    e.target.value === "none" ? "" : promo.promoterName,
                                })
                            }
                            >
                            <option value="none">None</option>
                            <option value="promoter">Promoter Attribution</option>
                            </select>
                            <div style={styles.fieldSelectIcon}>
                            <ChevronDownIcon />
                            </div>
                        </div>
                    </div>
                  </div>

                  {promo.attributionMode === "promoter" ? (
                    <div>
                      <label style={styles.fieldLabel}>Promoter / Affiliate Name</label>
                      <div style={styles.fieldShell}>
                        <input
                          style={styles.fieldInput}
                          type="text"
                          placeholder="Mike"
                          value={promo.promoterName}
                          onChange={(e) =>
                            updatePromoCode(promo.id, {
                              promoterName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label style={styles.fieldLabel}>Applies To</label>
                    <div style={styles.fieldSelectShell}>
                        <select
                        style={styles.fieldSelect}
                        value={promo.appliesTo}
                        onChange={(e) =>
                            updatePromoCode(promo.id, {
                            appliesTo: e.target.value as PromoAppliesTo,
                            selectedTicketIds:
                                e.target.value === "selected_tickets"
                                ? promo.selectedTicketIds
                                : [],
                            selectedLocationIds:
                                e.target.value === "selected_locations"
                                ? promo.selectedLocationIds
                                : [],
                            })
                        }
                        >
                        <option value="whole_event">Whole Event</option>
                        <option value="all_tickets">All Tickets</option>
                        <option value="selected_tickets">Selected Tickets</option>
                        <option value="all_locations">All Locations</option>
                        <option value="selected_locations">Selected Locations</option>
                        </select>
                        <div style={styles.fieldSelectIcon}>
                        <ChevronDownIcon />
                        </div>
                    </div>
                  </div>

                  {promo.appliesTo === "selected_tickets" ? (
                    <div>
                      <label style={styles.fieldLabel}>Select Tickets</label>
                      <div style={styles.textareaShell}>
                        <MultiSelectChips
                          options={ticketOptions}
                          selectedIds={promo.selectedTicketIds}
                          onToggle={(ticketId) => togglePromoTicket(promo.id, ticketId)}
                          emptyLabel="No tickets created yet."
                        />
                      </div>
                    </div>
                  ) : null}

                  {promo.appliesTo === "selected_locations" ? (
                    <div>
                      <label style={styles.fieldLabel}>Select Locations</label>
                      <div style={styles.textareaShell}>
                        <MultiSelectChips
                          options={locationOptions}
                          selectedIds={promo.selectedLocationIds}
                          onToggle={(locationId) => togglePromoLocation(promo.id, locationId)}
                          emptyLabel="No locations created yet."
                        />
                      </div>
                    </div>
                  ) : null}

                  <WindowFields
  label="Promo Active Window"
  valueStart={promo.activeStart}
  valueEnd={promo.activeEnd}
  onChangeStart={(next) => updatePromoCode(promo.id, { activeStart: next })}
  onChangeEnd={(next) => updatePromoCode(promo.id, { activeEnd: next })}
  styles={styles}
  isMobile={isCompact}
/>
                </div>
              </div>
            ))}

            <div style={styles.addRow}>
              <button type="button" style={styles.addButton} onClick={addPromoCode}>
                <PlusIcon />
                Add Promo Code
              </button>
            </div>
          </div>

          {saveError ? (
            <div
                style={{
                marginTop: 14,
                borderRadius: 16,
                padding: "12px 14px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.18)",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.5,
                }}
            >
                {saveError}
            </div>
            ) : null}

            {isSaving ? (
            <div
                style={{
                marginTop: 14,
                borderRadius: 16,
                padding: "12px 14px",
                background: "rgba(15, 118, 110, 0.07)",
                border: "1px solid rgba(15, 118, 110, 0.14)",
                color: "#0f766e",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.5,
                }}
            >
                Saving changes...
            </div>
            ) : null}

          <section style={styles.stickyFooter}>
            <div style={styles.stickyBar}>
              <Link href="/admin/signup/event/create" style={styles.footerGhostLink}>
                Back
              </Link>

              <button
                type="button"
                style={styles.footerPrimary}
                //onClick={() => router.push(`/admin/signup/event/create/${draft.id}/payment`)}
                onClick={() =>router.push(`/admin/signup/hybrid/create?venueId=${eventContext?.venue_id || ""}`)}
                >
                Continue
              </button>

              <Link href="/admin/dashboard" style={styles.footerGhostLink}>
                Dashboard
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}