// app/admin/signup/hybrid/create/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { createClient } from "@/app/lib/supabase/client"

type StepStatus = "complete" | "ready" | "next" | "locked"

type StepItem = {
  id: string
  title: string
  subtitle: string
  status: StepStatus
  href?: string
  ctaLabel?: string
  disabled?: boolean
}

type VenueLite = {
  id: string
  name: string
  business_id: string | null
}

type MapLite = {
  id: string
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

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h.01" />
      <path d="M15 8h.01" />
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M9 16h.01" />
      <path d="M15 16h.01" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
    </svg>
  )
}

function getStepIcon(id: string) {
  switch (id) {
    case "business":
      return <BuildingIcon />
    case "map":
      return <MapPinIcon />
    case "zones":
      return <GridIcon />
    case "event":
      return <CalendarIcon />
    case "staff":
      return <UsersIcon />
    case "payouts":
      return <CreditCardIcon />
    default:
      return null
  }
}

function getStatusLabel(status: StepStatus) {
  if (status === "complete") return "Complete"
  if (status === "ready") return "Ready"
  if (status === "next") return "Next"
  return "Locked"
}

function getStatusStyles(status: StepStatus): CSSProperties {
  if (status === "complete") {
    return {
      background: "rgba(15,118,110,0.10)",
      color: "#0f766e",
      border: "1px solid rgba(15,118,110,0.14)",
    }
  }

  if (status === "ready") {
    return {
      background: "rgba(168,85,247,0.08)",
      color: "#7c3aed",
      border: "1px solid rgba(168,85,247,0.12)",
    }
  }

  if (status === "next") {
    return {
      background: "rgba(37,99,235,0.07)",
      color: "#2563eb",
      border: "1px solid rgba(37,99,235,0.10)",
    }
  }

  return {
    background: "rgba(100,116,139,0.06)",
    color: "#64748b",
    border: "1px solid rgba(100,116,139,0.08)",
  }
}

function buildSteps(
  hasVenue: boolean,
  hasMap: boolean,
  hasZones: boolean,
  venueId?: string,
  latestMapId?: string | null
): StepItem[] {
  const canOpenStaff = hasVenue && hasMap && hasZones
  const canOpenPayouts = hasVenue && hasMap && hasZones

  const staffHref = venueId
    ? `/admin/staff?venueId=${venueId}`
    : "/admin/staff"

  const payoutsHref = venueId
    ? `/admin/signup/hybrid/create/payouts?venueId=${venueId}`
    : "/admin/signup/hybrid/create/payouts"

  if (!hasVenue) {
    return [
      {
        id: "business",
        title: "Business & Venue",
        subtitle: "Create the business and attach the first venue.",
        status: "next",
        href: "/admin/signup/hybrid/create/business",
        ctaLabel: "Open",
      },
      {
        id: "map",
        title: "Upload Venue Map",
        subtitle: "Map setup unlocks after a venue exists.",
        status: "locked",
        disabled: true,
      },
      {
        id: "zones",
        title: "Map Venue Zones",
        subtitle: "Zones unlock after a venue map is uploaded.",
        status: "locked",
        disabled: true,
      },
      {
        id: "event",
        title: "Add First Event",
        subtitle: "Event setup can begin after the venue foundation exists.",
        status: "locked",
        disabled: true,
      },
      {
        id: "staff",
        title: "Invite Staff",
        subtitle: "Invite staff after the venue map and zones are complete.",
        status: "locked",
        disabled: true,
      },
      {
        id: "payouts",
        title: "Payouts",
        subtitle: "Connect payouts after the venue map and zones are complete.",
        status: "locked",
        disabled: true,
      },
    ]
  }

  if (hasVenue && !hasMap) {
    return [
      {
        id: "business",
        title: "Business & Venue",
        subtitle: "Business and venue foundation are complete.",
        status: "complete",
        href: "/admin/signup/hybrid/create/business",
        ctaLabel: "View",
      },
      {
        id: "map",
        title: "Upload Venue Map",
        subtitle: "Next step: upload the venue map for this location.",
        status: "next",
        href: venueId
          ? `/admin/signup/hybrid/create/map?venueId=${venueId}`
          : "/admin/signup/hybrid/create/map",
        ctaLabel: "Open",
      },
      {
        id: "zones",
        title: "Map Venue Zones",
        subtitle: "Zones unlock after a venue map is uploaded.",
        status: "locked",
        disabled: true,
      },
      {
        id: "event",
        title: "Add An Event",
        subtitle: "Event setup is available once your venue exists.",
        status: "ready",
        href: "/admin/signup/event/create",
        ctaLabel: "Open",
      },
      {
        id: "staff",
        title: "Invite Staff",
        subtitle: "Invite staff after venue map and zones are complete.",
        status: "locked",
        disabled: true,
      },
      {
        id: "payouts",
        title: "Payouts",
        subtitle: "Stripe payout setup unlocks after venue map and zones are complete.",
        status: "locked",
        disabled: true,
      },
    ]
  }

  if (hasVenue && hasMap && !hasZones) {
    return [
      {
        id: "business",
        title: "Business & Venue",
        subtitle: "Business and venue foundation are complete.",
        status: "complete",
        href: "/admin/signup/hybrid/create/business",
        ctaLabel: "View",
      },
      {
        id: "map",
        title: "Upload Venue Map",
        subtitle: "Venue map has already been added.",
        status: "complete",
        href: venueId
          ? `/admin/signup/hybrid/create/map?venueId=${venueId}`
          : "/admin/signup/hybrid/create/map",
        ctaLabel: "View",
      },
      {
        id: "zones",
        title: "Map Venue Zones",
        subtitle: "Now place clickable booking areas on the uploaded map.",
        status: "next",
        href:
          latestMapId && venueId
            ? `/admin/signup/hybrid/create/zones/${latestMapId}?venueId=${venueId}`
            : undefined,
        ctaLabel: "Open",
        disabled: !latestMapId,
      },
      {
        id: "event",
        title: "Add An Event",
        subtitle: "Event setup is available once your venue exists.",
        status: "ready",
        href: "/admin/signup/event/create",
        ctaLabel: "Open",
      },
      {
        id: "staff",
        title: "Invite Staff",
        subtitle: "Invite staff after venue zones are complete.",
        status: "locked",
        disabled: true,
      },
      {
        id: "payouts",
        title: "Payouts",
        subtitle: "Stripe payout setup unlocks after venue zones are complete.",
        status: "locked",
        disabled: true,
      },
    ]
  }

  return [
    {
      id: "business",
      title: "Business & Venue",
      subtitle: "Business and venue foundation are complete.",
      status: "complete",
      href: "/admin/signup/hybrid/create/business",
      ctaLabel: "View",
    },
    {
      id: "map",
      title: "Upload Venue Map",
      subtitle: "Venue map has already been added.",
      status: "complete",
      href: venueId
        ? `/admin/signup/hybrid/create/map?venueId=${venueId}`
        : "/admin/signup/hybrid/create/map",
      ctaLabel: "View",
    },
    {
      id: "zones",
      title: "Map Venue Zones",
      subtitle: "Venue zones have already been added.",
      status: "complete",
      href:
        latestMapId && venueId
          ? `/admin/signup/hybrid/create/zones/${latestMapId}?venueId=${venueId}`
          : undefined,
      ctaLabel: latestMapId && venueId ? "View" : undefined,
      disabled: !latestMapId,
    },
    {
      id: "event",
      title: "Add An Event",
      subtitle: "Event setup is available once your venue exists.",
      status: "ready",
      href: "/admin/signup/event/create",
      ctaLabel: "Open",
    },
    {
      id: "staff",
      title: "Invite Staff",
      subtitle: "Team access is now available.",
      status: "ready",
      href: staffHref,
      ctaLabel: "Open",
    },
    {
      id: "payouts",
      title: "Payouts",
      subtitle: "Stripe payout setup is now available.",
      status: "ready",
      href: payoutsHref,
      ctaLabel: "Open",
    },
  ]
}

export default function SignupHybridCreatePage() {
  const supabase = useMemo(() => createClient(), [])
  const [mounted, setMounted] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [latestVenue, setLatestVenue] = useState<VenueLite | null>(null)
  const [hasMap, setHasMap] = useState(false)
  const [latestMapId, setLatestMapId] = useState<string | null>(null)
  const [hasZones, setHasZones] = useState(false)

  useEffect(() => {
    setMounted(true)

    const media = window.matchMedia("(max-width: 900px)")
    const update = () => setIsNarrow(media.matches)

    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
    } else {
      media.addListener(update)
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", update)
      } else {
        media.removeListener(update)
      }
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadProgression() {
      try {
        setErrorMessage("")
        setIsLoading(true)
        setLatestVenue(null)
        setHasMap(false)
        setLatestMapId(null)
        setHasZones(false)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return

        if (userError) {
          setErrorMessage(userError.message)
          return
        }

        if (!user) {
          setErrorMessage("You must be signed in to view Hybrid setup.")
          return
        }

        const { data: venueRows, error: venueError } = await supabase
          .from("venues")
          .select("id, name, business_id")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (!active) return

        if (venueError) {
          setErrorMessage(venueError.message)
          return
        }

        const venue = venueRows && venueRows.length > 0 ? venueRows[0] : null
        setLatestVenue(venue)

        if (!venue) {
          return
        }

        const { data: mapRows, error: mapError } = await supabase
          .from("venue_maps")
          .select("id")
          .eq("venue_id", venue.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (!active) return

        if (mapError) {
          setErrorMessage(mapError.message)
          return
        }

        const activeMaps = (mapRows as MapLite[] | null) || []
        const latestMap = activeMaps.length > 0 ? activeMaps[0] : null

        setHasMap(activeMaps.length > 0)
        setLatestMapId(latestMap?.id ?? null)

        if (activeMaps.length === 0) {
          return
        }

        const mapIds = activeMaps.map((map) => map.id)

        const { data: zoneRows, error: zoneError } = await supabase
          //.from("venue_map_zones")
          .from("venue_zones_coordinates")
          .select("id, venue_map_id")
          .in("venue_map_id", mapIds)
          .eq("is_active", true)
          .limit(1)

        if (!active) return

        if (zoneError) {
          setErrorMessage(zoneError.message)
          return
        }

        setHasZones(Boolean(zoneRows && zoneRows.length > 0))
      } catch (error) {
        if (!active) return

        setErrorMessage(
          error instanceof Error ? error.message : "Could not load Hybrid setup state."
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProgression()

    return () => {
      active = false
    }
  }, [supabase])

  const steps = useMemo(
    () =>
      buildSteps(
        Boolean(latestVenue),
        hasMap,
        hasZones,
        latestVenue?.id,
        latestMapId
      ),
    [latestVenue, hasMap, hasZones, latestMapId]
  )

  const nextStep = steps.find((step) => step.status === "next")
  const completedCount = steps.filter((step) => step.status === "complete").length

  if (!mounted) return null

  const glassCard: CSSProperties = {
    borderRadius: 30,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.24), 0 18px 42px rgba(15,23,42,0.06)",
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100dvh",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: isNarrow ? "14px 12px 22px" : "18px 14px 28px",
      boxSizing: "border-box",
    },
    shell: {
      width: "100%",
      maxWidth: 1040,
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.06)",
      color: "#0f172a",
      fontSize: 19,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      border: "1px solid rgba(255,255,255,0.24)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.18), 0 14px 30px rgba(15,23,42,0.05)",
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    heroPanel: {
      ...glassCard,
      padding: isNarrow ? 18 : 28,
      overflow: "hidden",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(15,118,110,0.05)",
      color: "#0f766e",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      border: "1px solid rgba(15,118,110,0.08)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    title: {
      marginTop: 18,
      fontSize: isNarrow ? 34 : 52,
      lineHeight: 0.98,
      fontWeight: 900,
      letterSpacing: isNarrow ? "-1.2px" : "-1.6px",
      color: "#020617",
      maxWidth: 760,
    },
    summary: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 1.65,
      color: "#475569",
      maxWidth: 680,
    },
    messageError: {
      marginTop: 16,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.18)",
      color: "#b91c1c",
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.5,
    },
    heroMetaRow: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: isNarrow ? "1fr" : "1.05fr 0.95fr",
      gap: 16,
    },
    buildOrderCard: {
      position: "relative",
      borderRadius: 30,
      padding: isNarrow ? 18 : 20,
      overflow: "hidden",
      background:
        "linear-gradient(145deg, rgba(15,23,42,0.44) 0%, rgba(30,41,59,0.36) 100%)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px rgba(15,23,42,0.12)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      color: "#ffffff",
    },
    glow: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      right: -50,
      top: -60,
      background: "rgba(56,189,248,0.20)",
      filter: "blur(24px)",
      pointerEvents: "none",
    },
    buildLabel: {
      position: "relative",
      zIndex: 1,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.70)",
    },
    buildTitle: {
      position: "relative",
      zIndex: 1,
      marginTop: 10,
      fontSize: isNarrow ? 28 : 34,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-1px",
      color: "#ffffff",
    },
    buildSub: {
      position: "relative",
      zIndex: 1,
      marginTop: 10,
      fontSize: 14,
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.80)",
      maxWidth: 460,
    },
    eventCard: {
      ...glassCard,
      padding: isNarrow ? 18 : 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 180,
    },
    eventLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    eventTitle: {
      marginTop: 10,
      fontSize: 28,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-0.8px",
      color: "#0f172a",
    },
    eventSub: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 1.6,
      color: "#64748b",
      maxWidth: 320,
    },
    eventBtnRow: {
      marginTop: 18,
      display: "flex",
      justifyContent: "flex-start",
    },
    primaryLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      minHeight: 50,
      padding: "0 18px",
      borderRadius: 16,
      textDecoration: "none",
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(15,23,42,0.88)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      boxShadow: "0 16px 36px rgba(15,23,42,0.10)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    primaryLinkDisabled: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      minHeight: 50,
      padding: "0 18px",
      borderRadius: 16,
      border: "1px solid rgba(148,163,184,0.16)",
      background: "rgba(255,255,255,0.35)",
      color: "#94a3b8",
      fontSize: 14,
      fontWeight: 900,
      cursor: "not-allowed",
      pointerEvents: "none",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    checklistWrap: {
      marginTop: 18,
      display: "grid",
      gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr 1fr",
      gap: 14,
    },
    stepCard: {
      ...glassCard,
      padding: 18,
      minHeight: 152,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    stepTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    stepIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.06)",
      color: "#0f172a",
      border: "1px solid rgba(255,255,255,0.16)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      flexShrink: 0,
    },
    statusPill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      minHeight: 32,
      borderRadius: 999,
      padding: "0 10px",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.1px",
      textTransform: "uppercase",
      flexShrink: 0,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    stepTitle: {
      marginTop: 14,
      fontSize: 18,
      lineHeight: 1.1,
      fontWeight: 900,
      letterSpacing: "-0.4px",
      color: "#0f172a",
    },
    stepSubtitle: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 1.55,
      color: "#64748b",
    },
    stepFooter: {
      marginTop: 14,
      display: "flex",
      justifyContent: "flex-start",
    },
    miniLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      minHeight: 38,
      padding: "0 12px",
      borderRadius: 14,
      textDecoration: "none",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(15,23,42,0.84)",
      color: "#ffffff",
      fontSize: 13,
      fontWeight: 900,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    miniLinkDisabled: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      minHeight: 38,
      padding: "0 12px",
      borderRadius: 14,
      border: "1px solid rgba(148,163,184,0.16)",
      background: "rgba(255,255,255,0.35)",
      color: "#94a3b8",
      fontSize: 13,
      fontWeight: 900,
      cursor: "not-allowed",
      pointerEvents: "none",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
  }

  const hasVenue = Boolean(latestVenue)

  return (
    <div style={styles.page}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 300,
          height: 300,
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

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GL</div>

          <Link href="/admin/signup?intent=hybrid" style={styles.backLink}>
            Back to signup
          </Link>
        </div>

        <section style={styles.heroPanel}>
          <div style={styles.badge}>Hybrid Setup</div>

          <div style={styles.title}>Build your venue workflow.</div>

          <div style={styles.summary}>
            Create the business and venue first, map the venue, and unlock the next steps.
          </div>

          {errorMessage ? <div style={styles.messageError}>{errorMessage}</div> : null}

          <div style={styles.heroMetaRow}>
            <div style={styles.buildOrderCard}>
              <div style={styles.glow} />
              <div style={styles.buildLabel}>Recommended Build Order</div>
              <div style={styles.buildTitle}>
                Business & Venue → Venue Map → Zones → Event → Staff
              </div>
              <div style={styles.buildSub}>
                {isLoading
                  ? "Loading setup status..."
                  : nextStep
                  ? `Current next step: ${nextStep.title}. Completed ${completedCount} of ${steps.length}.`
                  : `Setup progress loaded. Completed ${completedCount} of ${steps.length}.`}
              </div>
            </div>

            <div style={styles.eventCard}>
              <div>
                <div style={styles.eventLabel}>
                  {hasVenue ? "Available Now" : "Locked Until Venue Exists"}
                </div>
                <div style={styles.eventTitle}>Add An Event</div>
                <div style={styles.eventSub}>
                  {hasVenue
                    ? "Continue with the existing event setup flow whenever you are ready."
                    : "Event setup unlocks after the first venue is created."}
                </div>
              </div>

              <div style={styles.eventBtnRow}>
                {hasVenue ? (
                  <Link href="/admin/signup/event/create" style={styles.primaryLink}>
                    Open Event Setup
                    <ArrowRightIcon />
                  </Link>
                ) : (
                  <div style={styles.primaryLinkDisabled}>
                    Locked
                    <LockIcon />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.checklistWrap}>
          {steps.map((step) => {
            const isComplete = step.status === "complete"
            const isLocked = step.status === "locked"

            return (
              <article key={step.id} style={styles.stepCard}>
                <div>
                  <div style={styles.stepTop}>
                    <div style={styles.stepIconWrap}>{getStepIcon(step.id)}</div>

                    <div
                      style={{
                        ...styles.statusPill,
                        ...getStatusStyles(step.status),
                      }}
                    >
                      {isComplete ? <CheckIcon /> : isLocked ? <LockIcon /> : null}
                      {getStatusLabel(step.status)}
                    </div>
                  </div>

                  <div style={styles.stepTitle}>{step.title}</div>
                  <div style={styles.stepSubtitle}>{step.subtitle}</div>
                </div>

                <div style={styles.stepFooter}>
                  {step.href && step.ctaLabel && !step.disabled ? (
                    <Link href={step.href} style={styles.miniLink}>
                      {step.ctaLabel}
                      <ArrowRightIcon />
                    </Link>
                  ) : step.disabled ? (
                    <div style={styles.miniLinkDisabled}>
                      Locked
                      <LockIcon />
                    </div>
                  ) : step.status === "ready" ? (
                    <div style={styles.miniLinkDisabled}>Ready</div>
                  ) : step.status === "complete" ? (
                    <div style={styles.miniLinkDisabled}>Complete</div>
                  ) : (
                    <div style={styles.miniLinkDisabled}>Locked</div>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}