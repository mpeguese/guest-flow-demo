//app/admin/events/page.tsx
"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/app/lib/supabase/client"

type EventStatusFilter = "All" | "draft" | "live" | "scheduled" | "ended" | "cancelled" | "active"

type VenueRecord = {
  id: string
  name: string | null
  city: string | null
  state: string | null
  description: string | null
  active_status: string | null
}

type EventRecord = {
  id: string
  venue_id: string
  title: string | null
  slug: string | null
  description: string | null
  start_at: string | null
  end_at: string | null
  status: string | null
  event_type: string | null
  is_series: boolean | null
  booking_type: string | null
  flyer_image_url: string | null
  cover_image_url: string | null
  video_url: string | null
  timezone: string | null
  created_at?: string | null
}

type ProfileRecord = {
  id: string
  role: string | null
  is_active: boolean | null
  first_name?: string | null
  last_name?: string | null
}

function formatDateLabel(value: string | null) {
  if (!value) return "No date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No date"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTimeLabel(value: string | null) {
  if (!value) return "TBD"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "TBD"
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStatusTone(status: string | null) {
  const normalized = (status || "").toLowerCase()

  if (normalized === "live" || normalized === "active") {
    return {
      label: normalized === "active" ? "active" : "live",
      bg: "rgba(15,118,110,0.10)",
      color: "#0f766e",
      border: "1px solid rgba(15,118,110,0.16)",
    }
  }

  if (normalized === "draft") {
    return {
      label: "draft",
      bg: "rgba(83,167,255,0.10)",
      color: "#2563eb",
      border: "1px solid rgba(83,167,255,0.16)",
    }
  }

  if (normalized === "scheduled") {
    return {
      label: "scheduled",
      bg: "rgba(168,85,247,0.10)",
      color: "#7c3aed",
      border: "1px solid rgba(168,85,247,0.16)",
    }
  }

  if (normalized === "ended") {
    return {
      label: "ended",
      bg: "rgba(148,163,184,0.10)",
      color: "#64748b",
      border: "1px solid rgba(148,163,184,0.14)",
    }
  }

  if (normalized === "cancelled") {
    return {
      label: "cancelled",
      bg: "rgba(255,141,122,0.14)",
      color: "#d9644a",
      border: "1px solid rgba(255,141,122,0.18)",
    }
  }

  return {
    label: normalized || "unknown",
    bg: "rgba(148,163,184,0.10)",
    color: "#64748b",
    border: "1px solid rgba(148,163,184,0.14)",
  }
}

function getKindLabel(event: EventRecord) {
  if (event.is_series) return "Series"
  if ((event.event_type || "").toLowerCase() === "series") return "Series"
  return "Single"
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: active
          ? "1px solid rgba(15,118,110,0.18)"
          : "1px solid rgba(255,255,255,0.20)",
        background: active ? "rgba(15,118,110,0.08)" : "rgba(255,255,255,0.72)",
        color: active ? "#0f766e" : "#475569",
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
        boxShadow: active ? "0 8px 18px rgba(15,23,42,0.04)" : "none",
      }}
    >
      {label}
    </button>
  )
}

function SnapshotCard({
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
        borderRadius: 26,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 34px rgba(15,23,42,0.06)",
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: "#64748B",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: -1.2,
          color: "#020617",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 14,
          lineHeight: 1.55,
          color: "#64748B",
        }}
      >
        {helper}
      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  rightContent,
  children,
}: {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(255,255,255,0.24)",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.46), 0 18px 40px rgba(15,23,42,0.06)",
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: -0.4,
              color: "#020617",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#64748B",
                maxWidth: 640,
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

function EventCard({
  event,
  onEdit,
  onCopyLink,
  copiedLink,
  isNarrow,
}: {
  event: EventRecord
  onEdit: (eventId: string) => void
  onCopyLink: (value: string) => void
  copiedLink: string
  isNarrow: boolean
}) {
  const tone = getStatusTone(event.status)
  const previewUrl =
    event.flyer_image_url || event.cover_image_url || "/images/tangra-interior.jpg"

  const publicLink = event.slug ? buildPublicEventLink(event.slug) : ""
  const scheduleLabel = `${formatDateLabel(event.start_at)} · ${formatTimeLabel(
    event.start_at
  )} - ${formatTimeLabel(event.end_at)}`

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(26px)",
        WebkitBackdropFilter: "blur(26px)",
        padding: "18px 18px 28px",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.42), 0 14px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isNarrow ? "1fr" : "190px minmax(0, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: "100%",
            height: isNarrow ? 220 : 160,
            borderRadius: 22,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.20)",
            background: "rgba(255,255,255,0.70)",
          }}
        >
          <img
            src={previewUrl}
            alt={event.title || "Event preview"}
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
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  lineHeight: 1.1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {event.title || "Untitled Event"}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#526077",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {event.description?.trim()
                  ? event.description
                  : "No description added yet."}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEdit(event.id)}
              style={{
                appearance: "none",
                border: "1px solid rgba(148,163,184,0.16)",
                background: "rgba(255,255,255,0.82)",
                color: "#0F172A",
                borderRadius: 999,
                padding: "10px 14px",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
              }}
            >
              Edit Event
            </button>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#64748B",
                marginBottom: 6,
              }}
            >
              Schedule
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {scheduleLabel}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#64748B",
                marginBottom: 6,
              }}
            >
              Event Link
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: publicLink ? "minmax(0, 1fr) 36px" : "1fr",
                gap: 10,
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#0F172A",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={publicLink || "Slug not available"}
              >
                {publicLink || "Slug not available"}
              </div>

              {publicLink ? (
                <button
                  type="button"
                  onClick={() => onCopyLink(publicLink)}
                  aria-label={copiedLink === publicLink ? "Copied" : "Copy event link"}
                  title={copiedLink === publicLink ? "Copied" : "Copy link"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: "1px solid rgba(56,189,248,0.18)",
                    background:
                      "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)",
                    color: "#0369a1",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {copiedLink === publicLink ? "✓" : <CopyIcon/>}
                  
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* <div
        style={{
          position: "absolute",
          right: 18,
          bottom: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 22,
          padding: "0 2px",
          background: "transparent",
          color: tone.color,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.1,
          textTransform: "lowercase",
          whiteSpace: "nowrap",
        }}
      >
        {tone.label}
      </div> */}
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
        borderRadius: 20,
        border: `1px solid ${token.border}`,
        background: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
          color: "#526077",
          fontWeight: 700,
        }}
      >
        {text}
      </div>
    </div>
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

function buildPublicEventLink(slug: string) {
  const baseUrl = getBaseSiteUrl()
  return `${baseUrl}/book/map?event=${encodeURIComponent(slug)}`
}

function truncateTwoLinesStyle(): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }
}

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [mounted, setMounted] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [venue, setVenue] = useState<VenueRecord | null>(null)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [filter, setFilter] = useState<EventStatusFilter>("All")
  const [copiedLink, setCopiedLink] = useState("")

  const venueIdFromQuery = (searchParams.get("venueId") || "").trim()

  useEffect(() => {
    setMounted(true)

    const desktopMedia = window.matchMedia("(max-width: 1160px)")
    const mobileMedia = window.matchMedia("(max-width: 700px)")

    const update = () => {
      setIsNarrow(desktopMedia.matches)
      setIsMobile(mobileMedia.matches)
    }

    update()

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", update)
      mobileMedia.addEventListener("change", update)
      return () => {
        desktopMedia.removeEventListener("change", update)
        mobileMedia.removeEventListener("change", update)
      }
    }

    desktopMedia.addListener(update)
    mobileMedia.addListener(update)
    return () => {
      desktopMedia.removeListener(update)
      mobileMedia.removeListener(update)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    let active = true

    async function loadEventsPage() {
      setLoading(true)
      setErrorMessage("")

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return

        if (userError) throw new Error(userError.message)

        if (!user) {
          router.replace("/admin/login")
          return
        }

        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, is_active, first_name, last_name")
          .eq("id", user.id)
          .single()

        if (!active) return

        if (profileError) throw new Error(profileError.message)
        setProfile(profileRow as ProfileRecord)

        let resolvedVenueId = venueIdFromQuery

        if (!resolvedVenueId) {
          const { data: venueRows, error: venueLookupError } = await supabase
            .from("venues")
            .select("id")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false })
            .limit(1)

          if (!active) return

          if (venueLookupError) throw new Error(venueLookupError.message)
          resolvedVenueId = venueRows?.[0]?.id || ""
        }

        if (!resolvedVenueId) {
          router.replace("/admin/signup/hybrid/create")
          return
        }

        const [venueRes, eventsRes] = await Promise.all([
          supabase
            .from("venues")
            .select("id, name, city, state, description, active_status")
            .eq("id", resolvedVenueId)
            .single(),
          supabase
            .from("events")
            .select(
              "id, venue_id, title, slug, description, start_at, end_at, status, event_type, is_series, booking_type, flyer_image_url, cover_image_url, video_url, timezone, created_at"
            )
            .eq("venue_id", resolvedVenueId)
            .order("start_at", { ascending: true }),
        ])

        if (!active) return

        if (venueRes.error) throw new Error(venueRes.error.message)
        if (eventsRes.error) throw new Error(eventsRes.error.message)

        setVenue((venueRes.data || null) as VenueRecord | null)
        setEvents((eventsRes.data || []) as EventRecord[])
      } catch (error) {
        if (!active) return
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load events."
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadEventsPage()

    return () => {
      active = false
    }
  }, [mounted, router, supabase, venueIdFromQuery])

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events
    return events.filter((event) => (event.status || "").toLowerCase() === filter)
  }, [events, filter])

  const liveCount = events.filter((event) => {
    const status = (event.status || "").toLowerCase()
    return status === "live" || status === "active"
  }).length

  const draftCount = events.filter(
    (event) => (event.status || "").toLowerCase() === "draft"
  ).length

  const endedCount = events.filter(
    (event) => (event.status || "").toLowerCase() === "ended"
  ).length

  const displayName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  const dashboardHref = venue?.id
    ? `/admin/dashboard?venueId=${venue.id}`
    : "/admin/dashboard"

  const copyLink = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedLink(value)

      window.setTimeout(() => {
        setCopiedLink((current) => (current === value ? "" : current))
      }, 1600)
    } catch {
      setErrorMessage("Could not copy the event link.")
    }
  }

  if (!mounted) return null

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
  "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
        color: "#0F172A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1380,
          margin: "0 auto",
          padding: isMobile ? "18px 12px 34px" : "28px 18px 48px",
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
                color: "#64748B",
                marginBottom: 8,
              }}
            >
              GuestFlow Admin
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 30 : 36,
                lineHeight: 1.04,
                fontWeight: 900,
                color: "#0F172A",
              }}
            >
              Events
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#526077",
                maxWidth: 760,
              }}
            >
              Manage event basics, review publish states, and jump directly into the
              existing event editor.
            </p>

            {venue?.name ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#0F766E",
                }}
              >
                {venue.name}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => router.push(dashboardHref)}
              style={{
                appearance: "none",
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.72)",
                color: "#0F172A",
                borderRadius: 999,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 10px 22px rgba(15,23,42,0.04)",
              }}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/signup/event/create")}
              style={{
                appearance: "none",
                border: "1px solid rgba(15,118,110,0.16)",
                background: "rgba(15,118,110,0.08)",
                color: "#0F766E",
                borderRadius: 999,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 10px 22px rgba(15,23,42,0.04)",
              }}
            >
              Create Event
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div
            style={{
              marginBottom: 18,
              borderRadius: 18,
              padding: "12px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "#b91c1c",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <SnapshotCard
            label="Total Events"
            value={String(events.length)}
            helper="All current events linked to this venue"
          />
          <SnapshotCard
            label="Live + Active"
            value={String(liveCount)}
            helper="Events currently intended to be purchasable"
          />
          <SnapshotCard
            label="Drafts"
            value={String(draftCount)}
            helper={`${endedCount} ended event${endedCount === 1 ? "" : "s"} also on file`}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "1.15fr 0.85fr",
            gap: 18,
          }}
        >
          <SectionCard
            title="Event Instances"
            subtitle="Real events from the database. Edit opens the same event basics editor you just wired into create/edit mode."
            rightContent={
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <FilterPill
                  label="All"
                  active={filter === "All"}
                  onClick={() => setFilter("All")}
                />
                <FilterPill
                  label="Draft"
                  active={filter === "draft"}
                  onClick={() => setFilter("draft")}
                />
                <FilterPill
                  label="Live"
                  active={filter === "live"}
                  onClick={() => setFilter("live")}
                />
                <FilterPill
                  label="Scheduled"
                  active={filter === "scheduled"}
                  onClick={() => setFilter("scheduled")}
                />
                <FilterPill
                  label="Ended"
                  active={filter === "ended"}
                  onClick={() => setFilter("ended")}
                />
              </div>
            }
          >
            {loading ? (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                Loading events…
              </div>
            ) : filteredEvents.length ? (
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
                    isNarrow={isMobile}
                    copiedLink={copiedLink}
                    onCopyLink={copyLink}
                    onEdit={(eventId) =>
                      router.push(`/admin/signup/event/create?eventId=${eventId}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 22,
                  border: "1px dashed rgba(148,163,184,0.24)",
                  background: "rgba(255,255,255,0.10)",
                  color: "#64748B",
                  fontSize: 14,
                  lineHeight: 1.7,
                  padding: 18,
                }}
              >
                No events matched the selected filter.
              </div>
            )}
          </SectionCard>

          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "start",
            }}
          >
            <SectionCard
              title="Event Editing"
              subtitle="How this screen now works"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <InfoBox
                  title="Edit Event"
                  text="Each event card now routes into the existing event basics page using ?eventId=..., so title, media, dates, times, booking type, and description can be updated."
                  tone="aqua"
                />
                <InfoBox
                  title="Tickets + Locations"
                  text="The event basics editor can still continue into the existing details screen for inventory, locations, and promo codes."
                  tone="sky"
                />
                <InfoBox
                  title="Snapshot First"
                  text="This page stays focused on listing and managing events. It no longer tries to be a local modal builder."
                  tone="coral"
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Signed In"
              subtitle="Current admin context"
            >
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#526077",
                }}
              >
                <div>
                  <strong style={{ color: "#0F172A" }}>Admin:</strong>{" "}
                  {displayName || "GuestFlow Admin"}
                </div>
                <div>
                  <strong style={{ color: "#0F172A" }}>Role:</strong>{" "}
                  {profile?.role || "venue_admin"}
                </div>
                <div>
                  <strong style={{ color: "#0F172A" }}>Venue:</strong>{" "}
                  {venue?.name || "Not resolved"}
                </div>
                <div>
                  <strong style={{ color: "#0F172A" }}>Status:</strong>{" "}
                  {venue?.active_status || "Active"}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}