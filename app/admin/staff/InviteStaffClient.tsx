// app/admin/staff/InviteStaffClient.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type StaffRole = "owner" | "manager" | "promoter" | "staff" | "security"
type MembershipStatus = "invited" | "active" | "inactive"

type StaffMember = {
  id: string
  venue_id: string
  user_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  role_at_venue: StaffRole
  status: MembershipStatus
  invited_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

type VenueSummary = {
  id: string
  name: string | null
} | null

type InviteStaffClientProps = {
  initialVenueId?: string
}

const ROLE_OPTIONS: StaffRole[] = ["owner", "manager", "promoter", "staff", "security"]

const ROLE_HELP: Record<StaffRole, string> = {
  owner: "Highest venue-level permissions.",
  manager: "Operational admin access.",
  promoter: "Promoter-facing access.",
  staff: "General team access.",
  security: "Door and security workflows.",
}

async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return await res.json()
  }

  const text = await res.text()
  return {
    error:
      text && text.trim().startsWith("<!DOCTYPE")
        ? "The server returned an HTML page instead of JSON. This usually means the API route was redirected or intercepted before your route handler returned."
        : text || "Request failed.",
  }
}

export default function InviteStaffClient({
  initialVenueId = "",
}: InviteStaffClientProps) {
  const router = useRouter()

  const [venueId] = useState(initialVenueId)
  const [venue, setVenue] = useState<VenueSummary>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState(1400)
  const [rolesOpen, setRolesOpen] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff" as StaffRole,
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const isMobile = screenWidth < 700
  const isTablet = screenWidth >= 700 && screenWidth < 1080

  const pagePadding = isMobile ? "18px 14px 36px" : isTablet ? "24px 18px 42px" : "28px 22px 48px"
  const shellMaxWidth = 1180
  const mainGridCols = screenWidth < 1020 ? "1fr" : "1.35fr 0.95fr"
  const formDoubleCol = isMobile ? "1fr" : "1fr 1fr"
  const statTriple = screenWidth < 820 ? "1fr" : "1fr 1fr 1fr"
  const listRowGrid =
    screenWidth < 860
      ? "1fr"
      : screenWidth < 1120
      ? "1.3fr 0.9fr 0.9fr 0.95fr"
      : "1.5fr 0.95fr 0.95fr 1fr 0.95fr"

  const fetchStaff = useCallback(async () => {
    if (!venueId) {
      setVenue(null)
      setStaff([])
      setLoading(false)
      setError("Missing venue ID in the page URL.")
      return
    }

    try {
      setLoading(true)
      setError("")
      const res = await fetch(`/api/admin/staff?venueId=${encodeURIComponent(venueId)}`, {
        method: "GET",
        cache: "no-store",
      })

      const data = await parseApiResponse(res)

      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to load staff.")
      }

      setVenue(data?.venue ?? null)
      setStaff(Array.isArray(data?.staff) ? data.staff : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff.")
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const sortedStaff = useMemo(() => {
    const statusOrder: Record<MembershipStatus, number> = {
      active: 0,
      invited: 1,
      inactive: 2,
    }

    return [...staff].sort((a, b) => {
      const statusDelta = statusOrder[a.status] - statusOrder[b.status]
      if (statusDelta !== 0) return statusDelta

      const aName = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase()
      const bName = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase()
      return aName.localeCompare(bName)
    })
  }, [staff])

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()

    setMessage("")
    setError("")

    if (!venueId.trim()) {
      setError("Venue context is missing.")
      return
    }

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.")
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId: venueId.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
        }),
      })

      const data = await parseApiResponse(res)

      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to send invite.")
      }

      setMessage("Invite sent successfully.")
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "staff",
      })

      await fetchStaff()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateMemberStatus(id: string, status: MembershipStatus) {
    try {
      setError("")
      setMessage("")
      setStatusUpdatingId(id)

      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      })

      const data = await parseApiResponse(res)

      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to update staff status.")
      }

      setMessage(status === "inactive" ? "Staff member set to inactive." : "Staff member activated.")
      await fetchStaff()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff status.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  function formatRole(role: StaffRole) {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  function formatName(member: StaffMember) {
    const name = `${member.first_name || ""} ${member.last_name || ""}`.trim()
    return name || "Unnamed staff member"
  }

  function formatDate(value: string | null) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  function statusPillStyle(status: MembershipStatus) {
    if (status === "active") {
      return {
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.18)",
        color: "#166534",
      }
    }

    if (status === "inactive") {
      return {
        background: "rgba(239,68,68,0.10)",
        border: "1px solid rgba(239,68,68,0.16)",
        color: "#991b1b",
      }
    }

    return {
      background: "rgba(245,158,11,0.12)",
      border: "1px solid rgba(245,158,11,0.18)",
      color: "#92400e",
    }
  }

  const invitedCount = staff.filter((item) => item.status === "invited").length
  const activeCount = staff.filter((item) => item.status === "active").length
  const inactiveCount = staff.filter((item) => item.status === "inactive").length

  const styles = {
    page: {
      minHeight: "100dvh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: pagePadding,
      color: "#10243a",
    } as React.CSSProperties,

    shell: {
      width: "100%",
      maxWidth: shellMaxWidth,
      margin: "0 auto",
      display: "grid",
      gap: isMobile ? 14 : 18,
    } as React.CSSProperties,

    frost: {
      borderRadius: 28,
      background: "rgba(255,255,255,0.24)",
      border: "1px solid rgba(255,255,255,0.40)",
      boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    } as React.CSSProperties,

    heroCard: {
      padding: isMobile ? 18 : 24,
    } as React.CSSProperties,

    heroTop: {
      display: "flex",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 14,
      flexDirection: isMobile ? "column" : "row",
    } as React.CSSProperties,

    title: {
      fontSize: isMobile ? 28 : 36,
      lineHeight: 1.05,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      margin: 0,
      color: "#0b1f33",
    },

    subtitle: {
      margin: "8px 0 0",
      fontSize: isMobile ? 14 : 15,
      lineHeight: 1.55,
      color: "rgba(16,36,58,0.74)",
      fontWeight: 600,
      maxWidth: 760,
    },

    heroActions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap" as const,
      alignItems: "center",
    } as React.CSSProperties,

    venueChip: {
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.30)",
      border: "1px solid rgba(255,255,255,0.42)",
      color: "#0f2940",
      fontSize: 13,
      fontWeight: 800,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } as React.CSSProperties,

    backButton: {
      minHeight: 40,
      borderRadius: 14,
      padding: "0 14px",
      background: "rgba(255,255,255,0.30)",
      border: "1px solid rgba(255,255,255,0.42)",
      color: "#0f2940",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } as React.CSSProperties,

    feedback: {
      borderRadius: 18,
      padding: "12px 14px",
      fontSize: 13,
      fontWeight: 700,
      border: "1px solid rgba(255,255,255,0.44)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 10px 20px rgba(15,23,42,0.06)",
    } as React.CSSProperties,

    mainGrid: {
      display: "grid",
      gridTemplateColumns: mainGridCols,
      gap: isMobile ? 14 : 16,
    } as React.CSSProperties,

    card: {
      padding: isMobile ? 16 : 18,
    } as React.CSSProperties,

    cardTitle: {
      margin: 0,
      fontSize: isMobile ? 18 : 20,
      fontWeight: 800,
      color: "#0d2438",
      letterSpacing: "-0.02em",
    },

    form: {
      marginTop: 14,
      display: "grid",
      gap: 12,
    } as React.CSSProperties,

    formRow: {
      display: "grid",
      gridTemplateColumns: formDoubleCol,
      gap: 12,
    } as React.CSSProperties,

    inputWrap: {
      display: "grid",
      gap: 8,
      minWidth: 0,
    } as React.CSSProperties,

    label: {
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      color: "rgba(16,36,58,0.64)",
      paddingLeft: 2,
    },

    input: {
      width: "100%",
      minHeight: 50,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.46)",
      background: "rgba(255,255,255,0.28)",
      color: "#0d2438",
      padding: "0 15px",
      outline: "none",
      fontSize: 15,
      fontWeight: 700,
      boxSizing: "border-box" as const,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    },

    select: {
      width: "100%",
      minHeight: 50,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.46)",
      background: "rgba(255,255,255,0.28)",
      color: "#0d2438",
      padding: "0 15px",
      outline: "none",
      fontSize: 15,
      fontWeight: 700,
      boxSizing: "border-box" as const,
      appearance: "none" as const,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    },

    formFooter: {
      display: "flex",
      justifyContent: isMobile ? "stretch" : "flex-end",
      marginTop: 2,
    } as React.CSSProperties,

    primaryButton: {
      minHeight: 52,
      borderRadius: 18,
      border: "1px solid rgba(15,41,64,0.14)",
      background: "#0f2940",
      color: "#ffffff",
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: "-0.01em",
      padding: "0 18px",
      cursor: "pointer",
      boxShadow: "0 12px 22px rgba(15,41,64,0.16)",
      minWidth: isMobile ? "100%" : 170,
    } as React.CSSProperties,

    utilityStack: {
      display: "grid",
      gap: 12,
    } as React.CSSProperties,

    statRow: {
      display: "grid",
      gridTemplateColumns: statTriple,
      gap: 10,
      marginTop: 14,
    } as React.CSSProperties,

    statItem: {
      borderRadius: 18,
      padding: "12px 12px",
      background: "rgba(255,255,255,0.22)",
      border: "1px solid rgba(255,255,255,0.34)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display: "grid",
      gap: 6,
    } as React.CSSProperties,

    statLabel: {
      fontSize: 11,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color: "rgba(16,36,58,0.56)",
      fontWeight: 800,
    },

    statValue: {
      fontSize: 22,
      lineHeight: 1,
      fontWeight: 800,
      color: "#0d2438",
    },

    utilityHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    } as React.CSSProperties,

    collapseButton: {
      minHeight: 36,
      borderRadius: 14,
      padding: "0 12px",
      background: "rgba(255,255,255,0.26)",
      border: "1px solid rgba(255,255,255,0.38)",
      color: "#0f2940",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    } as React.CSSProperties,

    roleList: {
      marginTop: 12,
      display: "grid",
      gap: 8,
    } as React.CSSProperties,

    rolePill: {
      borderRadius: 16,
      padding: "10px 12px",
      background: "rgba(255,255,255,0.22)",
      border: "1px solid rgba(255,255,255,0.34)",
      color: "#0d2438",
      fontSize: 13,
      fontWeight: 700,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    } as React.CSSProperties,

    roleTitle: {
      fontSize: 13,
      fontWeight: 800,
      color: "#0d2438",
    } as React.CSSProperties,

    roleHelp: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 1.45,
      color: "rgba(16,36,58,0.68)",
      fontWeight: 600,
    } as React.CSSProperties,

    listCard: {
      padding: isMobile ? 16 : 18,
    } as React.CSSProperties,

    // listWrap: {
    //   display: "grid",
    //   gap: 10,
    // } as React.CSSProperties,

    // rowCard: {
    //   display: "grid",
    //   gridTemplateColumns: listRowGrid,
    //   gap: 10,
    //   alignItems: "center",
    //   padding: screenWidth < 860 ? 14 : 12,
    //   borderRadius: 22,
    //   background: "rgba(255,255,255,0.22)",
    //   border: "1px solid rgba(255,255,255,0.34)",
    //   backdropFilter: "blur(16px)",
    //   WebkitBackdropFilter: "blur(16px)",
    // } as React.CSSProperties,

    rowBlock: {
      display: "grid",
      gap: 4,
      minWidth: 0,
    } as React.CSSProperties,

    // rowLabel: {
    //   fontSize: 11,
    //   fontWeight: 800,
    //   textTransform: "uppercase" as const,
    //   letterSpacing: "0.1em",
    //   color: "rgba(16,36,58,0.54)",
    // },

    // rowValue: {
    //   fontSize: 14,
    //   fontWeight: 800,
    //   color: "#0d2438",
    //   whiteSpace: "nowrap" as const,
    //   overflow: "hidden",
    //   textOverflow: "ellipsis",
    // },

    // subValue: {
    //   fontSize: 12,
    //   color: "rgba(16,36,58,0.64)",
    //   whiteSpace: "nowrap" as const,
    //   overflow: "hidden",
    //   textOverflow: "ellipsis",
    //   fontWeight: 600,
    // },

    pill: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 32,
      borderRadius: 999,
      padding: "0 12px",
      fontSize: 12,
      fontWeight: 800,
      textTransform: "capitalize" as const,
      width: "fit-content",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } as React.CSSProperties,

    // actionRow: {
    //   display: "flex",
    //   alignItems: "center",
    //   gap: 8,
    //   flexWrap: "wrap" as const,
    //   justifyContent: screenWidth < 860 ? "flex-start" : "flex-end",
    // } as React.CSSProperties,

    // ghostButton: {
    //   minHeight: 38,
    //   borderRadius: 14,
    //   padding: "0 12px",
    //   fontSize: 12,
    //   fontWeight: 800,
    //   color: "#0f2940",
    //   background: "rgba(255,255,255,0.26)",
    //   border: "1px solid rgba(255,255,255,0.38)",
    //   cursor: "pointer",
    //   backdropFilter: "blur(14px)",
    //   WebkitBackdropFilter: "blur(14px)",
    // } as React.CSSProperties,

    emptyState: {
      borderRadius: 22,
      padding: "18px 16px",
      background: "rgba(255,255,255,0.22)",
      border: "1px dashed rgba(255,255,255,0.36)",
      color: "rgba(16,36,58,0.76)",
      fontSize: 14,
      lineHeight: 1.6,
      fontWeight: 600,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    } as React.CSSProperties,

    listWrap: {
  display: "grid",
  gap: 10,
} as React.CSSProperties,

rowCard: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 22,
  background: "rgba(255,255,255,0.22)",
  border: "1px solid rgba(255,255,255,0.34)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  overflow: "hidden",
} as React.CSSProperties,

nameBlock: {
  minWidth: 0,
  flex: "1.7 1 0",
  display: "grid",
  gap: 4,
} as React.CSSProperties,

metaBlock: {
  minWidth: 92,
  flex: "0 1 110px",
  display: "grid",
  gap: 4,
} as React.CSSProperties,

dateBlock: {
  minWidth: 108,
  flex: "0 1 120px",
  display: "grid",
  gap: 4,
} as React.CSSProperties,

actionRow: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flex: "0 0 auto",
  marginLeft: "auto",
} as React.CSSProperties,

rowLabel: {
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "rgba(16,36,58,0.54)",
  whiteSpace: "nowrap" as const,
},

rowValue: {
  fontSize: 14,
  fontWeight: 800,
  color: "#0d2438",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
},

subValue: {
  fontSize: 12,
  color: "rgba(16,36,58,0.64)",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: 600,
},

ghostButton: {
  minHeight: 36,
  borderRadius: 14,
  padding: "0 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#0f2940",
  background: "rgba(255,255,255,0.26)",
  border: "1px solid rgba(255,255,255,0.38)",
  cursor: "pointer",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
} as React.CSSProperties,
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={{ ...styles.frost, ...styles.heroCard }}>
          <div style={styles.heroTop}>
            <div>
              <h1 style={styles.title}>Invite Staff</h1>
              <p style={styles.subtitle}>Manage venue team members and permissions.</p>
            </div>

            <div style={styles.heroActions}>
              <div style={styles.venueChip}>{venue?.name?.trim() || "Venue"}</div>
              <button
                type="button"
                style={styles.backButton}
                onClick={() => router.push("/admin/signup/hybrid/create")}
              >
                Back to SetUp
              </button>

              {/* <div style={styles.venueChip}>{venue?.name?.trim() || "Venue"}</div> */}
            </div>
          </div>
        </section>

        {(error || message) && (
          <div
            style={{
              ...styles.feedback,
              ...styles.frost,
              background: error ? "rgba(255,240,240,0.26)" : "rgba(240,255,245,0.26)",
              color: error ? "#991b1b" : "#166534",
            }}
          >
            {error || message}
          </div>
        )}

        <div style={styles.mainGrid}>
          <section style={{ ...styles.frost, ...styles.card }}>
            <h2 style={styles.cardTitle}>Send Invite</h2>

            <form style={styles.form} onSubmit={handleInvite}>
              <div style={styles.formRow}>
                <div style={styles.inputWrap}>
                  <label htmlFor="staff-first-name" style={styles.label}>
                    First Name
                  </label>
                  <input
                    id="staff-first-name"
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    placeholder="First name"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputWrap}>
                  <label htmlFor="staff-last-name" style={styles.label}>
                    Last Name
                  </label>
                  <input
                    id="staff-last-name"
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    placeholder="Last name"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.inputWrap}>
                  <label htmlFor="staff-email" style={styles.label}>
                    Email
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoCorrect="off"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputWrap}>
                  <label htmlFor="staff-role" style={styles.label}>
                    Role
                  </label>
                  <select
                    id="staff-role"
                    value={form.role}
                    onChange={(e) => updateForm("role", e.target.value as StaffRole)}
                    style={styles.select}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {formatRole(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formFooter}>
                <button type="submit" disabled={submitting} style={styles.primaryButton}>
                  {submitting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </section>

          <div style={styles.utilityStack}>
            <section style={{ ...styles.frost, ...styles.card }}>
              <h2 style={styles.cardTitle}>Status</h2>

              <div style={styles.statRow}>
                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Invited</div>
                  <div style={styles.statValue}>{invitedCount}</div>
                </div>

                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Active</div>
                  <div style={styles.statValue}>{activeCount}</div>
                </div>

                <div style={styles.statItem}>
                  <div style={styles.statLabel}>Inactive</div>
                  <div style={styles.statValue}>{inactiveCount}</div>
                </div>
              </div>
            </section>

            <section style={{ ...styles.frost, ...styles.card }}>
              <div style={styles.utilityHeader}>
                <h2 style={styles.cardTitle}>Roles</h2>
                <button
                  type="button"
                  style={styles.collapseButton}
                  onClick={() => setRolesOpen((prev) => !prev)}
                >
                  {rolesOpen ? "Hide" : "Show"}
                </button>
              </div>

              {rolesOpen && (
                <div style={styles.roleList}>
                  {ROLE_OPTIONS.map((role) => (
                    <div key={role} style={styles.rolePill}>
                        <div style={styles.roleTitle}>{formatRole(role)}</div>
                        <div style={styles.roleHelp}>{ROLE_HELP[role]}</div>
                    </div>
                    ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <section style={{ ...styles.frost, ...styles.listCard }}>
          <h2 style={styles.cardTitle}>Current Team</h2>

          {loading ? (
            <div style={{ ...styles.emptyState, marginTop: 12 }}>Loading staff members...</div>
          ) : sortedStaff.length === 0 ? (
            <div style={{ ...styles.emptyState, marginTop: 12 }}>No staff members found for this venue yet.</div>
          ) : (
            <div style={{ ...styles.listWrap, marginTop: 12 }}>
              {sortedStaff.map((member) => (
                <div key={member.id} style={styles.rowCard}>
                  <div style={styles.rowBlock}>
                    <div style={styles.rowLabel}>Name</div>
                    <div style={styles.rowValue}>{formatName(member)}</div>
                    <div style={styles.subValue}>{member.email || "No email"}</div>
                  </div>

                  <div style={styles.rowBlock}>
                    <div style={styles.rowLabel}>Role</div>
                    <div style={styles.rowValue}>{formatRole(member.role_at_venue)}</div>
                  </div>

                  <div style={styles.rowBlock}>
                    <div style={styles.rowLabel}>Status</div>
                    <div style={{ ...styles.pill, ...statusPillStyle(member.status) }}>
                      {member.status}
                    </div>
                  </div>

                  <div style={styles.rowBlock}>
                    <div style={styles.rowLabel}>Date</div>
                    <div style={styles.rowValue}>
                      {member.status === "active"
                        ? formatDate(member.accepted_at)
                        : formatDate(member.invited_at)}
                    </div>
                  </div>

                  <div style={styles.actionRow}>
                    {member.status !== "active" ? (
                      <button
                        type="button"
                        onClick={() => updateMemberStatus(member.id, "active")}
                        disabled={statusUpdatingId === member.id}
                        style={styles.ghostButton}
                      >
                        {statusUpdatingId === member.id ? "Saving..." : "Set Active"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateMemberStatus(member.id, "inactive")}
                        disabled={statusUpdatingId === member.id}
                        style={styles.ghostButton}
                      >
                        {statusUpdatingId === member.id ? "Saving..." : "Disable"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}