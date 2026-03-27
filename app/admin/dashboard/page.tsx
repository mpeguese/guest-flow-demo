// app/admin/dashboard/page.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

type StatCardProps = {
  label: string
  value: string
  sublabel: string
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div
      style={{
        borderRadius: 26,
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        padding: 22,
        boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: "#94A3B8",
        }}
      >
        {label}
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

type ActivityRowProps = {
  time: string
  action: string
  meta: string
  status: string
  statusTone?: "green" | "red" | "amber" | "slate"
}

function ActivityRow({
  time,
  action,
  meta,
  status,
  statusTone = "green",
}: ActivityRowProps) {
  const toneStyles: Record<string, { bg: string; color: string }> = {
    green: { bg: "#ECFDF5", color: "#047857" },
    red: { bg: "#FEF2F2", color: "#B91C1C" },
    amber: { bg: "#FFFBEB", color: "#B45309" },
    slate: { bg: "#F1F5F9", color: "#475569" },
  }

  const tone = toneStyles[statusTone]

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderRadius: 20,
        border: "1px solid rgba(148,163,184,0.16)",
        background: "#FFFFFF",
        padding: "14px 16px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          minWidth: 62,
          fontSize: 13,
          fontWeight: 800,
          color: "#64748B",
        }}
      >
        {time}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
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
          {action}
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
          {meta}
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
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </div>
    </div>
  )
}

type EventRowProps = {
  event: string
  venue: string
  time: string
  sales: string
  scans: string
}

function EventRow({ event, venue, time, sales, scans }: EventRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.5fr) 120px 120px 120px 84px",
        gap: 14,
        alignItems: "center",
        borderRadius: 22,
        border: "1px solid rgba(148,163,184,0.16)",
        background: "#FFFFFF",
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
          {event}
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
          {venue}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#475569",
        }}
      >
        {time}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {sales}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {scans}
      </div>

      <button
        style={{
          height: 38,
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.22)",
          background: "#FFFFFF",
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
        height: 48,
        borderRadius: 16,
        border: isHighlighted
          ? "1px solid rgba(15,118,110,0.18)"
          : "1px solid transparent",
        background: isHighlighted
          ? "rgba(15,118,110,0.08)"
          : "transparent",
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

export default function AdminDashboardPage() {
    const router = useRouter()
    const pathname = usePathname()

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 44%, #FFF5E8 100%)",
        color: "#0F172A",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr)",
          gap: 20,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            borderRadius: 30,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
            padding: 18,
            minHeight: "calc(100vh - 40px)",
            position: "sticky",
            top: 20,
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
                background: "#0F172A",
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
              padding: 12,
              borderRadius: 22,
              background:
                "linear-gradient(135deg, rgba(8,47,73,1) 0%, rgba(15,118,110,0.94) 55%, rgba(245,158,11,0.90) 100%)",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Active Business
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: -0.5,
              }}
            >
              LIV Tampa
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.84)",
              }}
            >
              2 live events tonight • door + table operations active
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
              onClick={() => router.push("/admin/dashboard")}
            />
            <SideNavItem
              label="Scanner"
              active={pathname === "/admin/scanner"}
              onClick={() => router.push("/admin/scanner")}
            />
            <SideNavItem label="Tickets" />
            <SideNavItem 
              label="Reservations"
              active={pathname === "/admin/reservations"}
              onClick={() => router.push("/admin/reservations")}
            />
            <SideNavItem label="Floor" />
            <SideNavItem label="Sales Analytics" />
            <SideNavItem label="Staff" />
            <SideNavItem label="Communications" />
            <SideNavItem label="Settings" />
          </div>

          <div
            style={{
              marginTop: 20,
              borderRadius: 22,
              background: "#F8FAFC",
              border: "1px solid rgba(148,163,184,0.14)",
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#94A3B8",
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
              Michael Peguese
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#64748B",
              }}
            >
              Business Admin
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          style={{
            minWidth: 0,
            display: "grid",
            gap: 20,
          }}
        >
          {/* Top Bar */}
          <section
            style={{
              borderRadius: 30,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
              padding: 24,
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
                    fontSize: 38,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: -1.4,
                    color: "#020617",
                  }}
                >
                  Tonight&apos;s Operations
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  Thursday, March 27 • Tampa Bay • live door and table activity
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
                  style={{
                    height: 46,
                    padding: "0 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.2)",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  View Reservations
                </button>

                <button
                 onClick={() => router.push("/admin/scanner")}
                  style={{
                    height: 46,
                    padding: "0 18px",
                    borderRadius: 999,
                    border: "none",
                    background: "#0F172A",
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
          </section>

          {/* KPI Cards */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <StatCard
              label="Tickets Sold"
              value="482"
              sublabel="+14% compared to last Thursday"
            />
            <StatCard
              label="Checked In"
              value="311"
              sublabel="64.5% scan-through rate"
            />
            <StatCard
              label="Table Revenue"
              value="$8,420"
              sublabel="26 active reservations tonight"
            />
            <StatCard
              label="Exceptions"
              value="07"
              sublabel="duplicates, voids, and overrides"
            />
          </section>

          {/* Middle Grid */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.25fr) minmax(360px, 0.9fr)",
              gap: 20,
            }}
          >
            {/* Live Events */}
            <div
              style={{
                borderRadius: 30,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
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
                    Live Events
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#64748B",
                    }}
                  >
                    Monitor revenue, attendance, and room flow in one place
                  </div>
                </div>

                <button
                  style={{
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.2)",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  See All
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <EventRow
                  event="Neon Saturdays"
                  venue="LIV Tampa • Main Room"
                  time="9:00 PM"
                  sales="$5,980"
                  scans="228"
                />
                <EventRow
                  event="Skyline Rooftop Social"
                  venue="Sky Lounge • Rooftop"
                  time="10:00 PM"
                  sales="$2,440"
                  scans="83"
                />
                <EventRow
                  event="VIP Table Service"
                  venue="LIV Tampa • VIP Section"
                  time="Ongoing"
                  sales="$8,420"
                  scans="26 tables"
                />
              </div>
            </div>

            {/* Activity */}
            <div
              style={{
                borderRadius: 30,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
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
                    Recent Activity
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#64748B",
                    }}
                  >
                    Real-time validation events and staff actions
                  </div>
                </div>

                <button
                  style={{
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.2)",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Activity Log
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <ActivityRow
                  time="10:42"
                  action="QR validated for Michael P."
                  meta="VIP Entry • Neon Saturdays • Scanned by Ava"
                  status="Valid"
                  statusTone="green"
                />
                <ActivityRow
                  time="10:39"
                  action="Table 12 marked seated"
                  meta="Reservation under J. Carter • Party of 6"
                  status="Seated"
                  statusTone="green"
                />
                <ActivityRow
                  time="10:34"
                  action="Duplicate QR attempt blocked"
                  meta="General Admission • Skyline Rooftop Social"
                  status="Blocked"
                  statusTone="red"
                />
                <ActivityRow
                  time="10:31"
                  action="Manual override used"
                  meta="Ticket lookup completed by manager"
                  status="Override"
                  statusTone="amber"
                />
              </div>
            </div>
          </section>

          {/* Bottom Cards */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#94A3B8",
                }}
              >
                Door Team
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
                4 staff active
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Quick snapshot of live staff status and entry coverage.
              </div>
            </div>

            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#94A3B8",
                }}
              >
                Need Attention
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
                2 pending exceptions
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Manual checks, void reviews, and flagged reservations appear
                here.
              </div>
            </div>

            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#94A3B8",
                }}
              >
                Quick Actions
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {["Resend Ticket", "Lookup Guest", "View Sales"].map((label) => (
                  <button
                    key={label}
                    style={{
                      height: 40,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.16)",
                      background: "#FFFFFF",
                      color: "#0F172A",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}