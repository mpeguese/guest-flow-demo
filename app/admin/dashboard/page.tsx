// app/admin/dashboard/page.tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { createClient } from "@/app/lib/supabase/client"

type VenueRecord = {
  id: string
  name: string | null
  city: string | null
  state: string | null
  description: string | null
  timezone: string | null
  active_status: string | null
}

type EventRecord = {
  id: string
  title: string | null
  slug: string | null
  start_at: string | null
  end_at: string | null
  status: string | null
  event_type: string | null
  is_series: boolean | null
}

type StaffRecord = {
  id: string
  user_id: string | null
  role_at_venue: string | null
  status: string | null
  invited_at: string | null
  accepted_at: string | null
}

type ProfileRecord = {
  id: string
  role: string | null
  is_active: boolean | null
  first_name?: string | null
  last_name?: string | null
}

type DashboardData = {
  venue: VenueRecord | null
  events: EventRecord[]
  staff: StaffRecord[]
  mapCount: number
  zoneCount: number
  latestMapId: string | null
}

function CalendarIcon() {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </svg>
  )
}

function UsersIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function MapIcon() {
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
      <path d="M3 6.5 9 3l6 3.5L21 3v14l-6 3.5L9 17 3 20.5z" />
      <path d="M9 3v14" />
      <path d="M15 6.5v14" />
    </svg>
  )
}

function GridIcon() {
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
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  )
}

function ArrowRightIcon() {
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
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  )
}

function formatDateLabel(value: string | null) {
  if (!value) return "TBD"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "TBD"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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

function formatFullDateLabel(value: string | null) {
  if (!value) return "No date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No date"
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getEventTone(status: string | null) {
  const normalized = (status || "").toLowerCase()
  if (normalized === "live" || normalized === "active") {
    return {
      bg: "rgba(15,118,110,0.10)",
      color: "#0f766e",
      border: "1px solid rgba(15,118,110,0.16)",
      label: "Live",
    }
  }

  if (normalized === "draft") {
    return {
      bg: "rgba(168,85,247,0.08)",
      color: "#7c3aed",
      border: "1px solid rgba(168,85,247,0.12)",
      label: "Draft",
    }
  }

  if (normalized === "scheduled") {
    return {
      bg: "rgba(37,99,235,0.08)",
      color: "#2563eb",
      border: "1px solid rgba(37,99,235,0.12)",
      label: "Scheduled",
    }
  }

  if (normalized === "ended") {
    return {
      bg: "rgba(148,163,184,0.10)",
      color: "#64748b",
      border: "1px solid rgba(148,163,184,0.14)",
      label: "Ended",
    }
  }

  return {
    bg: "rgba(148,163,184,0.10)",
    color: "#64748b",
    border: "1px solid rgba(148,163,184,0.14)",
    label: status || "Unknown",
  }
}

function getStaffTone(status: string | null) {
  const normalized = (status || "").toLowerCase()
  if (normalized === "active") {
    return {
      bg: "rgba(15,118,110,0.10)",
      color: "#0f766e",
      border: "1px solid rgba(15,118,110,0.16)",
      label: "Active",
    }
  }

  if (normalized === "invited") {
    return {
      bg: "rgba(37,99,235,0.08)",
      color: "#2563eb",
      border: "1px solid rgba(37,99,235,0.12)",
      label: "Invited",
    }
  }

  return {
    bg: "rgba(148,163,184,0.10)",
    color: "#64748b",
    border: "1px solid rgba(148,163,184,0.14)",
    label: status || "Unknown",
  }
}

function SideNavItem({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isHighlighted = active || hovered

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        minHeight: 48,
        borderRadius: 16,
        border: isHighlighted
          ? "1px solid rgba(15,118,110,0.18)"
          : "1px solid transparent",
        background: isHighlighted ? "rgba(15,118,110,0.08)" : "transparent",
        color: isHighlighted ? "#0F766E" : "#334155",
        fontSize: 14,
        fontWeight: 800,
        textAlign: "left",
        padding: "0 14px",
        cursor: "pointer",
        transition:
          "background 160ms ease, color 160ms ease, border-color 160ms ease",
      }}
    >
      {label}
    </button>
  )
}

function StatCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string
  value: string
  sublabel: string
  icon: React.ReactNode
}) {
  return (
    <div
      style={{
        borderRadius: 28,
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "#64748B",
          }}
        >
          {label}
        </div>

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#0F172A",
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 34,
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
          lineHeight: 1.5,
          color: "#64748B",
        }}
      >
        {sublabel}
      </div>
    </div>
  )
}

function EventRow({
  event,
  onOpen,
}: {
  event: EventRecord
  onOpen: (eventId: string) => void
}) {
  const tone = getEventTone(event.status)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.3fr) 110px 120px 92px",
        gap: 14,
        alignItems: "center",
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(255,255,255,0.16)",
        padding: "16px 18px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#0F172A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.title || "Untitled Event"}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#64748B",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatDateLabel(event.start_at)} · {event.is_series ? "Series" : "Single"}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#475569",
          whiteSpace: "nowrap",
        }}
      >
        {formatTimeLabel(event.start_at)}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 26,
          borderRadius: 999,
          padding: "0 9px",
          background: "transparent",
          color: tone.color,
          border: "none",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.2,
          textTransform: "lowercase",
          whiteSpace: "nowrap",
        }}
      >
        {tone.label.toLowerCase()}
      </div>

      <button
        type="button"
        onClick={() => onOpen(event.id)}
        style={{
          height: 38,
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.22)",
          background: "rgba(255,255,255,0.85)",
          color: "#0F172A",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Open
      </button>
    </div>
  )
}

function StaffRow({ staff }: { staff: StaffRecord }) {
  const tone = getStaffTone(staff.status)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(255,255,255,0.16)",
        padding: "14px 16px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#0F172A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textTransform: "capitalize",
          }}
        >
          {staff.role_at_venue || "Staff"}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#64748B",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {staff.accepted_at
            ? `Accepted ${formatDateLabel(staff.accepted_at)}`
            : staff.invited_at
              ? `Invited ${formatDateLabel(staff.invited_at)}`
              : "No activity yet"}
        </div>
      </div>

      <div
        style={{
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.3,
          background: tone.bg,
          color: tone.color,
          border: tone.border,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        {tone.label}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [mounted, setMounted] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [data, setData] = useState<DashboardData>({
    venue: null,
    events: [],
    staff: [],
    mapCount: 0,
    zoneCount: 0,
    latestMapId: null,
  })

  const venueIdFromQuery = (searchParams.get("venueId") || "").trim()

  useEffect(() => {
    setMounted(true)

    const media = window.matchMedia("(max-width: 980px)")
    const update = () => setIsNarrow(media.matches)

    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let active = true

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return

        if (userError) {
          throw new Error(userError.message)
        }

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

        if (profileError) {
          throw new Error(profileError.message)
        }

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

          if (venueLookupError) {
            throw new Error(venueLookupError.message)
          }

          resolvedVenueId = venueRows?.[0]?.id || ""
        }

        if (!resolvedVenueId) {
          router.replace("/admin/signup/hybrid/create")
          return
        }

        const [
          venueRes,
          eventsRes,
          mapsRes,
          zonesCountRes,
          staffRes,
        ] = await Promise.all([
          supabase
            .from("venues")
            .select("id, name, city, state, description, timezone, active_status")
            .eq("id", resolvedVenueId)
            .single(),

          supabase
            .from("events")
            .select("id, title, slug, start_at, end_at, status, event_type, is_series")
            .eq("venue_id", resolvedVenueId)
            .order("start_at", { ascending: true }),

          supabase
            .from("venue_maps")
            .select("id")
            .eq("venue_id", resolvedVenueId)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("venue_zones")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", resolvedVenueId)
            .eq("is_active", true),

          supabase
            .from("venue_staff")
            .select("id, user_id, role_at_venue, status, invited_at, accepted_at")
            .eq("venue_id", resolvedVenueId)
            .order("created_at", { ascending: false }),
        ])

        if (!active) return

        if (venueRes.error) throw new Error(venueRes.error.message)
        if (eventsRes.error) throw new Error(eventsRes.error.message)
        if (mapsRes.error) throw new Error(mapsRes.error.message)
        if (zonesCountRes.error) throw new Error(zonesCountRes.error.message)
        if (staffRes.error) throw new Error(staffRes.error.message)

        const activeMaps = mapsRes.data || []
        const latestMapId = activeMaps[0]?.id || null

        setData({
          venue: (venueRes.data || null) as VenueRecord | null,
          events: ((eventsRes.data || []) as EventRecord[]).slice(0, 3),
          staff: ((staffRes.data || []) as StaffRecord[]).slice(0, 3),
          mapCount: activeMaps.length,
          zoneCount: zonesCountRes.count || 0,
          latestMapId,
        })
      } catch (error) {
        if (!active) return

        setErrorMessage(
          error instanceof Error ? error.message : "Could not load dashboard."
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [mounted, router, supabase, venueIdFromQuery])

  const venueName = data.venue?.name || "Your Venue"
  const venueLocation = [data.venue?.city, data.venue?.state].filter(Boolean).join(", ")
  const activeEventCount = data.events.filter((event) => {
    const status = (event.status || "").toLowerCase()
    return status === "live" || status === "active" || status === "scheduled"
  }).length
  const activeStaffCount = data.staff.filter((staff) => {
    const status = (staff.status || "").toLowerCase()
    return status === "active"
  }).length

  const displayName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  const heroDate = new Date()
  const heroDateLabel = heroDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const venueMapsHref = data.venue?.id
    ? `/admin/signup/hybrid/create/map?venueId=${data.venue.id}`
    : "/admin/signup/hybrid/create/map"

  const mappedZonesHref =
    data.latestMapId && data.venue?.id
      ? `/admin/signup/hybrid/create/zones/${data.latestMapId}?venueId=${data.venue.id}`
      : ""

  const glassCard: CSSProperties = {
    borderRadius: 30,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.42), 0 18px 40px rgba(15,23,42,0.08)",
  }

  if (!mounted) return null

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
        color: "#0F172A",
        padding: isNarrow ? "14px 12px 22px" : "18px 14px 28px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          top: 10,
          right: -90,
          borderRadius: 999,
          filter: "blur(60px)",
          opacity: 0.82,
          background: "rgba(56,189,248,0.22)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          bottom: 10,
          left: -70,
          borderRadius: 999,
          filter: "blur(60px)",
          opacity: 0.78,
          background: "rgba(251,191,36,0.20)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isNarrow ? "1fr" : "280px minmax(0, 1fr)",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        <aside
          style={{
            ...glassCard,
            padding: 18,
            minHeight: isNarrow ? "auto" : "calc(100vh - 36px)",
            position: isNarrow ? "relative" : "sticky",
            top: isNarrow ? undefined : 18,
            alignSelf: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 10,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "rgba(15,23,42,0.88)",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              GF
            </div>

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: -0.4,
                  color: "#020617",
                }}
              >
                GuestFlow
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#64748B",
                }}
              >
                Admin Portal
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 24,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
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
              Active Venue
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: -0.5,
                color: "#0F172A",
              }}
            >
              {venueName}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.5,
                color: "#526077",
              }}
            >
              {venueLocation || "Venue location not set yet"}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                minHeight: 34,
                padding: "0 12px",
                borderRadius: 999,
                background: "rgba(15,118,110,0.10)",
                color: "#0f766e",
                border: "1px solid rgba(15,118,110,0.16)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {data.venue?.active_status || "Active"}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gap: 8,
            }}
          >
            <SideNavItem
              label="Dashboard"
              active={pathname === "/admin/dashboard"}
              onClick={() =>
                router.push(`/admin/dashboard?venueId=${data.venue?.id || ""}`)
              }
            />
            <SideNavItem
              label="Events"
              active={pathname === "/admin/events"}
              onClick={() => router.push("/admin/events")}
            />
            <SideNavItem
              label="Scanner"
              active={pathname === "/admin/scanner"}
              onClick={() => router.push("/admin/scanner")}
            />
            <SideNavItem
              label="Reservations"
              active={pathname === "/admin/reservations"}
              onClick={() => router.push("/admin/reservations")}
            />
            <SideNavItem
              label="Staff"
              active={pathname === "/admin/staff"}
              onClick={() =>
                router.push(
                  data.venue?.id
                    ? `/admin/staff?venueId=${data.venue.id}`
                    : "/admin/staff"
                )
              }
            />
            <SideNavItem
              label="Settings"
              active={pathname === "/admin/settings"}
              onClick={() => router.push("/admin/settings")}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              borderRadius: 24,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: 16,
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
              Signed In As
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {displayName || "GuestFlow Admin"}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#64748B",
                textTransform: "capitalize",
              }}
            >
              {profile?.role || "venue_admin"}
            </div>
          </div>
        </aside>

        <main
          style={{
            minWidth: 0,
            display: "grid",
            gap: 20,
          }}
        >
          <section
            style={{
              ...glassCard,
              padding: isNarrow ? 18 : 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "#0F766E",
                  }}
                >
                  Dashboard
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: isNarrow ? 32 : 42,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: -1.4,
                    color: "#020617",
                  }}
                >
                  {venueName}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  {heroDateLabel} • {venueLocation || "Venue dashboard"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => router.push("/admin/signup/event/create")}
                  style={{
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.20)",
                    background: "rgba(255,255,255,0.82)",
                    color: "#0F172A",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Create Event
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/scanner")}
                  style={{
                    height: 48,
                    padding: "0 18px",
                    borderRadius: 999,
                    border: "none",
                    background: "rgba(15,23,42,0.88)",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
                  }}
                >
                  Open Scanner
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div
                style={{
                  marginTop: 16,
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
                {errorMessage}
              </div>
            ) : null}
          </section>

          {isLoading ? (
            <section
              style={{
                ...glassCard,
                padding: 22,
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Loading dashboard…
            </section>
          ) : (
            <>
              <section
              style={{
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  borderRadius: 28,
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
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "#64748B",
                  }}
                >
                  Events
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: -1.2,
                    color: "#020617",
                  }}
                >
                  {data.events.length}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  {activeEventCount} active event{activeEventCount === 1 ? "" : "s"} currently linked to this venue.
                </div>
              </div>

              <div
                style={{
                  borderRadius: 28,
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
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: "#64748B",
                    }}
                  >
                    Venue Editing
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 32,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: "rgba(15,118,110,0.10)",
                      color: "#0f766e",
                      border: "1px solid rgba(15,118,110,0.16)",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.mapCount} Map{data.mapCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: -0.7,
                    color: "#020617",
                  }}
                >
                  Maps + Zones
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  Open the existing venue map manager and mapped zone editor to update your floor setup.
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push(venueMapsHref)}
                    style={{
                      height: 40,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.16)",
                      background: "rgba(255,255,255,0.82)",
                      color: "#0F172A",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manage Venue Maps
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (mappedZonesHref) router.push(mappedZonesHref)
                    }}
                    disabled={!mappedZonesHref}
                    style={{
                      height: 40,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.16)",
                      background: mappedZonesHref
                        ? "rgba(255,255,255,0.82)"
                        : "rgba(255,255,255,0.40)",
                      color: mappedZonesHref ? "#0F172A" : "#94a3b8",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: mappedZonesHref ? "pointer" : "not-allowed",
                      boxShadow: mappedZonesHref
                        ? "0 8px 18px rgba(15,23,42,0.04)"
                        : "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit Mapped Zones
                  </button>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 28,
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
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "#64748B",
                  }}
                >
                  Quick Actions
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: -0.7,
                    color: "#020617",
                  }}
                >
                  Admin Shortcuts
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  Jump into the most-used operational tools for this venue.
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {[
                    {
                      label: "Create Event",
                      onClick: () => router.push("/admin/signup/event/create"),
                    },
                    {
                      label: "Scanner",
                      onClick: () => router.push("/admin/scanner"),
                    },
                    {
                      label: "Staff",
                      onClick: () =>
                        router.push(
                          data.venue?.id
                            ? `/admin/staff?venueId=${data.venue.id}`
                            : "/admin/staff"
                        ),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      style={{
                        height: 40,
                        padding: "0 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.16)",
                        background: "rgba(255,255,255,0.82)",
                        color: "#0F172A",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: isNarrow
                    ? "1fr"
                    : "minmax(0, 1.2fr) minmax(340px, 0.9fr)",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    ...glassCard,
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          letterSpacing: -0.5,
                          color: "#020617",
                        }}
                      >
                        Current Events
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: "#64748B",
                        }}
                      >
                        Real events linked to this venue from the database
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/admin/events")}
                      style={{
                        height: 40,
                        padding: "0 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.2)",
                        background: "rgba(255,255,255,0.82)",
                        color: "#0F172A",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      See All
                    </button>
                  </div>

                  {data.events.length ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      {data.events.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          //onOpen={(eventId) => router.push(`/admin/signup/event/create/${eventId}/details`)}
                          onOpen={(eventId) => router.push(`/admin/signup/event/create?eventId=${eventId}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        borderRadius: 22,
                        border: "1px dashed rgba(148,163,184,0.24)",
                        background: "rgba(255,255,255,0.10)",
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.7,
                        padding: 18,
                      }}
                    >
                      No events are linked to this venue yet. Create the first event
                      to begin operational tracking.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    ...glassCard,
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          letterSpacing: -0.5,
                          color: "#020617",
                        }}
                      >
                        Staff Snapshot
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: "#64748B",
                        }}
                      >
                        Team members currently linked to this venue
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 999,
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        background: "rgba(15,118,110,0.10)",
                        color: "#0f766e",
                        border: "1px solid rgba(15,118,110,0.16)",
                      }}
                    >
                      {activeStaffCount} Active
                    </div>
                  </div>

                  {data.staff.length ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      {data.staff.map((staff) => (
                        <StaffRow key={staff.id} staff={staff} />
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        borderRadius: 22,
                        border: "1px dashed rgba(148,163,184,0.24)",
                        background: "rgba(255,255,255,0.10)",
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.7,
                        padding: 18,
                      }}
                    >
                      No staff members are linked to this venue yet.
                    </div>
                  )}
                </div>
              </section>

              

              <section
                style={{
                  ...glassCard,
                  padding: 22,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: -0.5,
                        color: "#020617",
                      }}
                    >
                      Timeline Snapshot
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 14,
                        color: "#64748B",
                      }}
                    >
                      Upcoming event dates pulled from your current venue events
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {data.events.length ? (
                    data.events.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          borderRadius: 20,
                          border: "1px solid rgba(255,255,255,0.20)",
                          background: "rgba(255,255,255,0.16)",
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          //justifyContent: "space-between",
                          gap: 14,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "#0F172A",
                            }}
                          >
                            {event.title || "Untitled Event"}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: "#64748B",
                            }}
                          >
                            {formatFullDateLabel(event.start_at)} • {formatTimeLabel(event.start_at)}
                          </div>
                        </div>

                        
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        borderRadius: 22,
                        border: "1px dashed rgba(148,163,184,0.24)",
                        background: "rgba(255,255,255,0.10)",
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.7,
                        padding: 18,
                      }}
                    >
                      Once events are created for this venue, they will appear here.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}