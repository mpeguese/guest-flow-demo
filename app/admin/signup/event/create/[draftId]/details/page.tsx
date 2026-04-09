// app/admin/signup/event/create/[draftId]/details/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { useParams, useRouter } from "next/navigation"

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
  name: string
  description: string
  price: string
  capacity: string
  quantityVisible: boolean
  status: InventoryStatus
  bookingStart: string
  bookingEnd: string
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
    name: "",
    description: "",
    price: "",
    capacity: "",
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
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    capacity: item.capacity || "",
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

  const tickets =
    Array.isArray(rawBooking.tickets) && rawBooking.tickets.length > 0
      ? rawBooking.tickets.map((item: Partial<TicketItem>) => normalizeTicket(item))
      : mode === "tickets" || mode === "both"
        ? [emptyTicket()]
        : []

  const locations =
    Array.isArray(rawBooking.locations) && rawBooking.locations.length > 0
      ? rawBooking.locations.map((item: Partial<LocationItem>) => normalizeLocation(item))
      : mode === "locations" || mode === "both"
        ? [emptyLocation()]
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

function WindowFields({
  label,
  valueStart,
  valueEnd,
  onChangeStart,
  onChangeEnd,
  styles,
}: {
  label: string
  valueStart: string
  valueEnd: string
  onChangeStart: (next: string) => void
  onChangeEnd: (next: string) => void
  styles: Record<string, CSSProperties>
}) {
  const start = splitDateTime(valueStart)
  const end = splitDateTime(valueEnd)
  const timeOptions = buildTimeOptions()

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={styles.windowCard}>
        <div style={styles.windowTitle}>{label}</div>

        <div style={styles.windowGrid}>
          <div>
            <label style={styles.fieldLabel}>Start Date</label>
            <div style={styles.fieldShell}>
              <input
                style={styles.fieldInput}
                type="date"
                value={start.date}
                onChange={(e) => onChangeStart(setDatePart(valueStart, e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={styles.fieldLabel}>Start Time</label>
            <div style={styles.selectShell}>
              <select
                style={styles.select}
                value={start.time}
                onChange={(e) => onChangeStart(setTimePart(valueStart, e.target.value))}
              >
                <option value="">Select start time</option>
                {timeOptions.map((entry) => {
                  const [value, optionLabel] = entry.split("|")
                  return (
                    <option key={value} value={value}>
                      {optionLabel}
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
            <label style={styles.fieldLabel}>End Date</label>
            <div style={styles.fieldShell}>
              <input
                style={styles.fieldInput}
                type="date"
                value={end.date}
                onChange={(e) => onChangeEnd(setDatePart(valueEnd, e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={styles.fieldLabel}>End Time</label>
            <div style={styles.selectShell}>
              <select
                style={styles.select}
                value={end.time}
                onChange={(e) => onChangeEnd(setTimePart(valueEnd, e.target.value))}
              >
                <option value="">Select end time</option>
                {timeOptions.map((entry) => {
                  const [value, optionLabel] = entry.split("|")
                  return (
                    <option key={value} value={value}>
                      {optionLabel}
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
      </div>
    </div>
  )
}

export default function AdminSignupEventDetailsPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const draftId = Array.isArray(params?.draftId) ? params.draftId[0] : params?.draftId ?? ""

  const [draft, setDraft] = useState<EventDraftRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const sync = () => setIsCompact(window.innerWidth <= 640)
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
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

  const saveAndSetDraft = (nextDraft: EventDraftRecord) => {
    const cleanedPromoCodes = nextDraft.booking.promoCodes.map((code) => ({
      ...code,
      selectedTicketIds: clampSelectedIds(code.selectedTicketIds, nextDraft.booking.tickets),
      selectedLocationIds: clampSelectedIds(
        code.selectedLocationIds,
        nextDraft.booking.locations
      ),
    }))

    const record = {
      ...nextDraft,
      updatedAt: new Date().toISOString(),
      booking: {
        ...nextDraft.booking,
        promoCodes: cleanedPromoCodes,
      },
    }

    setDraft(record)
    writeDraft(record)
  }

  const mode = draft?.basics.eventMode ?? "both"
  const showTickets = mode === "tickets" || mode === "both"
  const showLocations = mode === "locations" || mode === "both"

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

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        tickets: [...draft.booking.tickets, emptyTicket()],
      },
    })
  }

  const addLocation = () => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        locations: [...draft.booking.locations, emptyLocation()],
      },
    })
  }

  const addPromoCode = () => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      booking: {
        ...draft.booking,
        promoCodes: [...draft.booking.promoCodes, emptyPromoCode()],
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
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
      width: 58,
      height: 58,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 20,
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
    card: {
      borderRadius: isCompact ? 28 : 34,
      border: "1px solid rgba(148, 163, 184, 0.16)",
      background: "rgba(255, 255, 255, 0.82)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
      padding: isCompact ? 20 : 34,
      overflow: "hidden",
      isolation: "isolate",
    },
    intentBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "10px 16px",
      background: "rgba(15, 118, 110, 0.08)",
      border: "1px solid rgba(15, 118, 110, 0.12)",
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
      borderRadius: 26,
      border: "1px solid rgba(148,163,184,0.16)",
      background: "rgba(255,255,255,0.62)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
      padding: 18,
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
      marginBottom: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    fieldShell: {
      minHeight: 58,
      width: "100%",
      borderRadius: 18,
      border: "1px solid rgba(148,163,184,0.14)",
      background: "rgba(255,255,255,0.74)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.68), 0 10px 22px rgba(15,23,42,0.05)",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxSizing: "border-box",
    },
    fieldInput: {
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: 15,
      fontWeight: 700,
      color: "#0f172a",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textareaShell: {
      width: "100%",
      borderRadius: 22,
      border: "1px solid rgba(148,163,184,0.14)",
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.68), 0 10px 22px rgba(15,23,42,0.05)",
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
  }

  if (loading || !draft) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
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

        <section style={styles.card}>
          <div style={styles.intentBadge}>Booking Details</div>

          <div style={styles.title}>Set up your tickets, locations, and promo codes</div>

          <div style={styles.subtitle}>
            Build richer inventory with staged releases, cleaner availability windows, and promo attribution.
          </div>

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
                        <div style={styles.fieldShell}>
                          <select
                            style={styles.fieldInput}
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
                        <div style={styles.fieldShell}>
                          <select
                            style={styles.fieldInput}
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
                    </div>

                    <WindowFields
                      label="Booking Window"
                      valueStart={item.bookingStart}
                      valueEnd={item.bookingEnd}
                      onChangeStart={(next) => updateLocation(item.id, { bookingStart: next })}
                      onChangeEnd={(next) => updateLocation(item.id, { bookingEnd: next })}
                      styles={styles}
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

              <div style={styles.addRow}>
                <button type="button" style={styles.addButton} onClick={addLocation}>
                  <PlusIcon />
                  Add Location
                </button>
              </div>
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
                      <div style={styles.fieldShell}>
                        <select
                          style={styles.fieldInput}
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
                      <div style={styles.fieldShell}>
                        <select
                          style={styles.fieldInput}
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
                    <div style={styles.fieldShell}>
                      <select
                        style={styles.fieldInput}
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

          <section style={styles.stickyFooter}>
            <div style={styles.stickyBar}>
              <Link href="/admin/signup/event/create" style={styles.footerGhostLink}>
                Back
              </Link>

              <button
                type="button"
                style={styles.footerPrimary}
                onClick={() => router.push(`/admin/signup/event/create/${draft.id}/payment`)}
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