// app/admin/signup/event/create/[draftId]/preview/page.tsx
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

type PayoutMethod = "wire" | "zelle" | "stripe"
type StripeOnboardingStatus = "not_connected" | "pending" | "ready"

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

type PaymentDetails = {
  payoutMethod: PayoutMethod
  wire: {
    accountName: string
    bankName: string
    routingNumber: string
    accountNumber: string
    swiftCode: string
    bankAddress: string
    acknowledgeFees: boolean
  }
  zelle: {
    recipientName: string
    payoutContact: string
    acknowledgeLimit: boolean
  }
  stripe: {
    accountId: string
    onboardingStatus: StripeOnboardingStatus
  }
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
  payment?: PaymentDetails
}

function LinkIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 4" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L14 20" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.99 7.64 7.72 5 12 5s8.01 2.64 9.94 6.65a1 1 0 0 1 0 .7C20.01 16.36 16.28 19 12 19s-8.01-2.64-9.94-6.65Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function readDraft(draftId: string): EventDraftRecord | null {
  const raw = localStorage.getItem(`GuestLyst:eventDraft:${draftId}`)
  return raw ? JSON.parse(raw) : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatDate(dateString: string) {
  if (!dateString) return "Date TBD"
  const date = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(date.getTime())) return "Date TBD"

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(time: string) {
  if (!time) return "Time TBD"

  const [hours, minutes] = time.split(":")
  const h = Number(hours)
  const m = Number(minutes)

  if (Number.isNaN(h) || Number.isNaN(m)) return "Time TBD"

  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? "AM" : "PM"
  const minuteLabel = String(m).padStart(2, "0")
  return `${hour12}:${minuteLabel} ${suffix}`
}

function formatCurrency(value: string) {
  if (!value) return "TBD"
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function getPublicPreviewUrl(draft: EventDraftRecord) {
  const slug = slugify(draft.basics.eventTitle || "event-preview")
  return `${window.location.origin}/book/event/${slug}?preview=1&draftId=${draft.id}`
}

export default function AdminSignupEventPreviewPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const draftId = Array.isArray(params?.draftId) ? params.draftId[0] : params?.draftId ?? ""

  const [draft, setDraft] = useState<EventDraftRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)

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
    if (!draftId) return

    const stored = readDraft(draftId)

    if (!stored) {
      router.replace("/admin/signup/event/create")
      return
    }

    setDraft(stored)
    setLoading(false)
  }, [draftId, router])

  const previewUrl = useMemo(() => {
    if (!draft || typeof window === "undefined") return ""
    return getPublicPreviewUrl(draft)
  }, [draft])

  const liveTickets = useMemo(() => {
    if (!draft) return []
    return draft.booking.tickets.filter((ticket) => ticket.status !== "ended")
  }, [draft])

  const liveLocations = useMemo(() => {
    if (!draft) return []
    return draft.booking.locations.filter((location) => location.status !== "ended")
  }, [draft])

  const handleCopyLink = async () => {
    if (!previewUrl) return
    try {
      await navigator.clipboard.writeText(previewUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: isMobile ? "16px 12px 24px" : "24px 18px 30px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 1020,
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
      maxWidth: 680,
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
    linkRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto",
      gap: 10,
      alignItems: "center",
    },
    linkShell: {
      minHeight: 54,
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
      gap: 10,
      boxSizing: "border-box",
      overflow: "hidden",
    },
    linkText: {
      flex: 1,
      minWidth: 0,
      fontSize: isMobile ? 12 : 13,
      fontWeight: 700,
      color: "#0F172A",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    pillButton: {
      minHeight: 46,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.34)",
      background: "rgba(255,255,255,0.28)",
      color: "#0369A1",
      fontSize: 13,
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "0 16px",
      textDecoration: "none",
      cursor: "pointer",
      boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
      whiteSpace: "nowrap",
    },
    previewWrap: {
      marginTop: 18,
      borderRadius: 28,
      overflow: "hidden",
      background: "rgba(255,255,255,0.16)",
      boxShadow: "0 18px 42px rgba(15,23,42,0.12)",
    },
    previewHero: {
      position: "relative",
      minHeight: isMobile ? 310 : 430,
      padding: isMobile ? "18px" : "26px",
      display: "flex",
      alignItems: "flex-end",
      background: draft?.basics.flyerPreviewUrl
        ? `linear-gradient(180deg, rgba(2,6,23,0.06) 0%, rgba(2,6,23,0.82) 100%), url(${draft.basics.flyerPreviewUrl}) center / cover no-repeat`
        : "linear-gradient(135deg, rgba(15,23,42,0.76) 0%, rgba(14,165,233,0.54) 100%)",
    },
    previewHeroCard: {
      width: "100%",
      maxWidth: 760,
      borderRadius: 24,
      background: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
      padding: isMobile ? 16 : 20,
    },
    previewTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      padding: "8px 12px",
      background: "rgba(255,255,255,0.16)",
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.3px",
      textTransform: "uppercase",
    },
    previewTitle: {
      marginTop: 14,
      fontSize: isMobile ? 28 : 42,
      lineHeight: 1,
      letterSpacing: "-1.2px",
      fontWeight: 900,
      color: "#FFFFFF",
      maxWidth: 640,
    },
    previewMetaRow: {
      marginTop: 14,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
    },
    previewMetaPill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      minHeight: 38,
      padding: "0 12px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.14)",
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: 800,
    },
    previewBody: {
      padding: isMobile ? "18px" : "24px",
      display: "grid",
      gap: 18,
      background: "linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.22) 100%)",
    },
    consumerCard: {
      borderRadius: 24,
      background: "rgba(255,255,255,0.30)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.62), 0 10px 22px rgba(15,23,42,0.06)",
      padding: isMobile ? 16 : 18,
    },
    bodyCopy: {
      fontSize: 14,
      fontWeight: 600,
      color: "#334155",
      lineHeight: 1.7,
      margin: 0,
    },
    inventoryGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 16,
    },
    inventoryTitle: {
      fontSize: 16,
      fontWeight: 900,
      color: "#0F172A",
      marginBottom: 12,
    },
    inventoryList: {
      display: "grid",
      gap: 10,
    },
    inventoryItem: {
      borderRadius: 18,
      background: "rgba(255,255,255,0.22)",
      padding: "12px 14px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.56)",
    },
    inventoryTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    inventoryName: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A",
    },
    inventoryPrice: {
      fontSize: 13,
      fontWeight: 900,
      color: "#0369A1",
      whiteSpace: "nowrap",
    },
    inventoryDesc: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: 600,
      color: "#64748B",
      lineHeight: 1.5,
    },
    ctaRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
    },
    primaryCta: {
      minHeight: 48,
      borderRadius: 999,
      border: "none",
      background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: 900,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 18px",
      boxShadow: "0 12px 26px rgba(15,23,42,0.14)",
    },
    secondaryCta: {
      minHeight: 48,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.34)",
      background: "rgba(255,255,255,0.22)",
      color: "#0F172A",
      fontSize: 13,
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 18px",
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
    },
    loader: {
      color: "#0f172a",
      fontSize: 15,
      fontWeight: 700,
      padding: "40px 0",
    },
  }

  if (loading || !draft) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <div style={styles.loader}>Loading preview…</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GL</div>
          <Link href={`/admin/signup/event/create/${draft.id}/payment`} style={styles.backLink}>
            Back
          </Link>
        </div>

        <section style={styles.card}>
          <div style={styles.intentBadge}>Preview</div>

          <div style={styles.title}>Preview your event before publishing</div>

          <div style={styles.subtitle}>
            This is the link-first view. Copy the preview URL and see how the event will feel to your guests.
          </div>

          <div style={styles.section}>
            <label style={styles.sectionLabel}>Generated Preview Link</label>

            <div style={styles.linkRow}>
              <div style={styles.linkShell}>
                <LinkIcon />
                <div style={styles.linkText}>{previewUrl || "Generating preview link..."}</div>
              </div>

              <button type="button" style={styles.pillButton} onClick={handleCopyLink}>
                <CopyIcon />
                {copied ? "Copied" : "Copy Link"}
              </button>

              <a
                href={previewUrl || "#"}
                target="_blank"
                rel="noreferrer"
                style={styles.pillButton}
              >
                <EyeIcon />
                Open Preview
              </a>
            </div>
          </div>

          <div style={styles.previewWrap}>
            <div style={styles.previewHero}>
              <div style={styles.previewHeroCard}>
                <div style={styles.previewTag}>Preview Mode</div>

                <div style={styles.previewTitle}>
                  {draft.basics.eventTitle || "Untitled Event"}
                </div>

                <div style={styles.previewMetaRow}>
                  <div style={styles.previewMetaPill}>
                    <CalendarIcon />
                    {formatDate(draft.basics.eventDate)}
                  </div>

                  <div style={styles.previewMetaPill}>
                    <ClockIcon />
                    {formatTime(draft.basics.startTime)} - {formatTime(draft.basics.endTime)}
                  </div>

                  <div style={styles.previewMetaPill}>
                    <LocationIcon />
                    {draft.basics.location || "Location TBD"}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.previewBody}>
              <div style={styles.consumerCard}>
                <p style={styles.bodyCopy}>
                  {draft.basics.description || "Your event description will appear here."}
                </p>

                <div style={styles.ctaRow}>
                  {liveTickets.length > 0 ? (
                    <div style={styles.primaryCta}>View Tickets</div>
                  ) : null}

                  {liveLocations.length > 0 ? (
                    <div style={styles.secondaryCta}>View Map</div>
                  ) : null}
                </div>
              </div>

              <div style={styles.inventoryGrid}>
                {liveTickets.length > 0 ? (
                  <div style={styles.consumerCard}>
                    <div style={styles.inventoryTitle}>Tickets</div>
                    <div style={styles.inventoryList}>
                      {liveTickets.map((ticket) => (
                        <div key={ticket.id} style={styles.inventoryItem}>
                          <div style={styles.inventoryTop}>
                            <div style={styles.inventoryName}>
                              {ticket.name || "Untitled Ticket"}
                            </div>
                            <div style={styles.inventoryPrice}>
                              {formatCurrency(ticket.price)}
                            </div>
                          </div>
                          {ticket.description ? (
                            <div style={styles.inventoryDesc}>{ticket.description}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {liveLocations.length > 0 ? (
                  <div style={styles.consumerCard}>
                    <div style={styles.inventoryTitle}>Locations</div>
                    <div style={styles.inventoryList}>
                      {liveLocations.map((location) => (
                        <div key={location.id} style={styles.inventoryItem}>
                          <div style={styles.inventoryTop}>
                            <div style={styles.inventoryName}>
                              {location.name || "Untitled Location"}
                            </div>
                            <div style={styles.inventoryPrice}>
                              {formatCurrency(location.price)}
                            </div>
                          </div>
                          <div style={styles.inventoryDesc}>
                            {location.description || "Premium placement and reservation details."}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <section style={styles.stickyFooter}>
            <div style={styles.stickyBar}>
              <Link
                href={`/admin/signup/event/create/${draft.id}/payment`}
                style={styles.footerGhostLink}
              >
                Back
              </Link>

              <button
                type="button"
                style={styles.footerPrimary}
                onClick={() => router.push("/admin/dashboard")}
              >
                Publish
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