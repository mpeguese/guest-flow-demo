"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type ReservationStatus =
  | "Reserved"
  | "Arrived"
  | "Seated"
  | "No-Show"
  | "Released"
  | "Closed"

type Reservation = {
  id: string
  guestName: string
  phone: string
  email: string
  partySize: number
  tableName: string
  section: string
  eventName: string
  time: string
  depositStatus: "Paid" | "Pending"
  depositAmount: string
  minimumSpend: string
  code: string
  notes: string
  status: ReservationStatus
}

function statusTone(status: ReservationStatus) {
  switch (status) {
    case "Reserved":
      return {
        bg: "#F1F5F9",
        text: "#475569",
        border: "rgba(100,116,139,0.14)",
      }
    case "Arrived":
      return {
        bg: "#ECFEFF",
        text: "#0F766E",
        border: "rgba(15,118,110,0.14)",
      }
    case "Seated":
      return {
        bg: "#ECFDF5",
        text: "#047857",
        border: "rgba(16,185,129,0.16)",
      }
    case "No-Show":
      return {
        bg: "#FEF2F2",
        text: "#B91C1C",
        border: "rgba(239,68,68,0.16)",
      }
    case "Released":
      return {
        bg: "#FFF7ED",
        text: "#C2410C",
        border: "rgba(249,115,22,0.16)",
      }
    case "Closed":
      return {
        bg: "#E2E8F0",
        text: "#334155",
        border: "rgba(100,116,139,0.16)",
      }
    default:
      return {
        bg: "#F1F5F9",
        text: "#475569",
        border: "rgba(100,116,139,0.14)",
      }
  }
}

function SummaryCard({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel: string
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
        padding: 20,
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
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: -1,
          color: "#020617",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          lineHeight: 1.55,
          color: "#64748B",
        }}
      >
        {sublabel}
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40,
        padding: "0 16px",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(15,118,110,0.16)"
          : "1px solid rgba(148,163,184,0.18)",
        background: active ? "rgba(15,118,110,0.08)" : "#FFFFFF",
        color: active ? "#0F766E" : "#475569",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

function ReservationRow({
  item,
  selected,
  onClick,
}: {
  item: Reservation
  selected?: boolean
  onClick?: () => void
}) {
  const tone = statusTone(item.status)

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 22,
        border: selected
          ? "1px solid rgba(15,118,110,0.18)"
          : "1px solid rgba(148,163,184,0.14)",
        background: selected ? "rgba(240,253,250,0.9)" : "#FFFFFF",
        padding: 16,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
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
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "#0F172A",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.guestName}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#64748B",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Party of {item.partySize} • {item.eventName}
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 10px",
            fontSize: 11,
            fontWeight: 800,
            background: tone.bg,
            color: tone.text,
            border: `1px solid ${tone.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {item.status}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            background: "#F8FAFC",
            border: "1px solid rgba(148,163,184,0.12)",
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#94A3B8",
            }}
          >
            Time
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            {item.time}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "#F8FAFC",
            border: "1px solid rgba(148,163,184,0.12)",
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#94A3B8",
            }}
          >
            Table
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            {item.tableName}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "#F8FAFC",
            border: "1px solid rgba(148,163,184,0.12)",
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#94A3B8",
            }}
          >
            Deposit
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              fontWeight: 800,
              color: item.depositStatus === "Paid" ? "#047857" : "#C2410C",
            }}
          >
            {item.depositStatus}
          </div>
        </div>
      </div>
    </button>
  )
}

function StageButton({
  label,
  active = false,
  onClick,
  tone = "default",
}: {
  label: string
  active?: boolean
  onClick?: () => void
  tone?: "default" | "danger"
}) {
  const isDanger = tone === "danger"

  return (
    <button
      onClick={onClick}
      style={{
        height: 42,
        padding: "0 14px",
        borderRadius: 999,
        border: active
          ? isDanger
            ? "1px solid rgba(239,68,68,0.18)"
            : "1px solid rgba(15,118,110,0.18)"
          : isDanger
          ? "1px solid rgba(239,68,68,0.14)"
          : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? isDanger
            ? "#FEF2F2"
            : "rgba(15,118,110,0.08)"
          : "#FFFFFF",
        color: active
          ? isDanger
            ? "#B91C1C"
            : "#0F766E"
          : isDanger
          ? "#B91C1C"
          : "#475569",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition:
          "background 160ms ease, color 160ms ease, border-color 160ms ease",
      }}
    >
      {label}
    </button>
  )
}

const initialReservations: Reservation[] = [
  {
    id: "r1",
    guestName: "J. Carter",
    phone: "(813) 555-2104",
    email: "jcarter@email.com",
    partySize: 6,
    tableName: "Table 12",
    section: "VIP",
    eventName: "Neon Saturdays",
    time: "10:30 PM",
    depositStatus: "Paid",
    depositAmount: "$250",
    minimumSpend: "$1,500",
    code: "RSV-12038",
    notes: "Birthday group. Champagne arrival requested.",
    status: "Reserved",
  },
  {
    id: "r2",
    guestName: "S. Roberts",
    phone: "(813) 555-8021",
    email: "sroberts@email.com",
    partySize: 4,
    tableName: "Table 7",
    section: "Main Floor",
    eventName: "Neon Saturdays",
    time: "10:00 PM",
    depositStatus: "Paid",
    depositAmount: "$150",
    minimumSpend: "$900",
    code: "RSV-12039",
    notes: "Anniversary booking.",
    status: "Arrived",
  },
  {
    id: "r3",
    guestName: "Michael Peguese",
    phone: "(813) 555-9973",
    email: "michael@email.com",
    partySize: 8,
    tableName: "Table 18",
    section: "VIP",
    eventName: "Neon Saturdays",
    time: "11:00 PM",
    depositStatus: "Pending",
    depositAmount: "$300",
    minimumSpend: "$2,000",
    code: "RSV-12040",
    notes: "Pending final confirmation from host.",
    status: "Reserved",
  },
  {
    id: "r4",
    guestName: "A. Johnson",
    phone: "(813) 555-1176",
    email: "ajohnson@email.com",
    partySize: 5,
    tableName: "Table 3",
    section: "Patio",
    eventName: "Skyline Rooftop Social",
    time: "9:45 PM",
    depositStatus: "Paid",
    depositAmount: "$100",
    minimumSpend: "$700",
    code: "RSV-12041",
    notes: "Requested corner seating.",
    status: "Seated",
  },
  {
    id: "r5",
    guestName: "T. Williams",
    phone: "(813) 555-6255",
    email: "twilliams@email.com",
    partySize: 3,
    tableName: "Table 5",
    section: "Main Floor",
    eventName: "Skyline Rooftop Social",
    time: "9:30 PM",
    depositStatus: "Pending",
    depositAmount: "$75",
    minimumSpend: "$500",
    code: "RSV-12042",
    notes: "Call if late.",
    status: "No-Show",
  },
]

export default function AdminReservationsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState("r1")
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations)

  const summary = useMemo(() => {
    return {
      total: reservations.length,
      arrived: reservations.filter((r) => r.status === "Arrived").length,
      seated: reservations.filter((r) => r.status === "Seated").length,
      noShow: reservations.filter((r) => r.status === "No-Show").length,
    }
  }, [reservations])

  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const matchesFilter =
        activeFilter === "All" ? true : item.status === activeFilter

      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        item.guestName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.tableName.toLowerCase().includes(q)

      return matchesFilter && matchesSearch
    })
  }, [reservations, activeFilter, search])

  const selectedReservation =
    filteredReservations.find((item) => item.id === selectedId) ||
    reservations.find((item) => item.id === selectedId) ||
    filteredReservations[0] ||
    reservations[0]

  const selectedTone = statusTone(selectedReservation.status)

  function updateReservationStatus(nextStatus: ReservationStatus) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === selectedReservation.id ? { ...item, status: nextStatus } : item
      )
    )
  }

  function updateReservationNotes(nextNotes: string) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === selectedReservation.id ? { ...item, notes: nextNotes } : item
      )
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 46%, #FFF5E8 100%)",
        color: "#0F172A",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <section
          style={{
            borderRadius: 28,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.84)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
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
                GuestFlow Reservations
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 34,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: -1.1,
                  color: "#020617",
                }}
              >
                Table Validation
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                LIV Tampa • Neon Saturdays • Tonight&apos;s guest and table flow
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => router.push("/admin/dashboard")}
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.20)",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Back to Dashboard
              </button>

              <button
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
                }}
              >
                View Floor
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
          }}
          className="summary-grid"
        >
          <SummaryCard
            label="Tonight's Reservations"
            value={String(summary.total)}
            sublabel="Active table bookings across all sections"
          />
          <SummaryCard
            label="Arrived"
            value={String(summary.arrived)}
            sublabel="Guests checked in and waiting or seated"
          />
          <SummaryCard
            label="Seated"
            value={String(summary.seated)}
            sublabel="Parties currently placed at assigned tables"
          />
          <SummaryCard
            label="No-Shows"
            value={String(summary.noShow)}
            sublabel="Reservations needing follow-up or release"
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(360px, 0.95fr)",
            gap: 16,
          }}
          className="reservations-grid"
        >
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.84)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  letterSpacing: -0.4,
                  color: "#020617",
                }}
              >
                Search Reservations
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Search by guest name, phone, email, reservation code, or table number.
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guest, table, phone, or reservation code"
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: 54,
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.24)",
                  background: "#F8FAFC",
                  padding: "0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  paddingBottom: 2,
                }}
              >
                {[
                  "All",
                  "Reserved",
                  "Arrived",
                  "Seated",
                  "No-Show",
                  "Released",
                  "Closed",
                ].map((filter) => (
                  <FilterPill
                    key={filter}
                    label={filter}
                    active={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 28,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.84)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
                padding: 18,
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
                    Reservation Queue
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#64748B",
                    }}
                  >
                    Tap a reservation to review details and update table status
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#64748B",
                  }}
                >
                  {filteredReservations.length} shown
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {filteredReservations.map((item) => (
                  <ReservationRow
                    key={item.id}
                    item={item}
                    selected={selectedReservation?.id === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${selectedTone.border}`,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
                padding: 18,
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
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Selected Reservation
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 28,
                      lineHeight: 1,
                      fontWeight: 900,
                      letterSpacing: -0.8,
                      color: "#020617",
                    }}
                  >
                    {selectedReservation.guestName}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#64748B",
                    }}
                  >
                    {selectedReservation.eventName} • {selectedReservation.time}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 999,
                    padding: "9px 12px",
                    background: selectedTone.bg,
                    color: selectedTone.text,
                    border: `1px solid ${selectedTone.border}`,
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedReservation.status}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
                className="detail-grid"
              >
                <div
                  style={{
                    borderRadius: 20,
                    background: "#F8FAFC",
                    border: "1px solid rgba(148,163,184,0.12)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Guest
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gap: 8,
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{selectedReservation.guestName}</div>
                    <div>{selectedReservation.phone}</div>
                    <div>{selectedReservation.email}</div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 20,
                    background: "#F8FAFC",
                    border: "1px solid rgba(148,163,184,0.12)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Reservation
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gap: 8,
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  >
                    <div>
                      <strong>Code:</strong> {selectedReservation.code}
                    </div>
                    <div>
                      <strong>Party Size:</strong> {selectedReservation.partySize}
                    </div>
                    <div>
                      <strong>Time:</strong> {selectedReservation.time}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 20,
                    background: "#F8FAFC",
                    border: "1px solid rgba(148,163,184,0.12)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Table
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gap: 8,
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  >
                    <div>
                      <strong>Table:</strong> {selectedReservation.tableName}
                    </div>
                    <div>
                      <strong>Section:</strong> {selectedReservation.section}
                    </div>
                    <div>
                      <strong>Minimum Spend:</strong> {selectedReservation.minimumSpend}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 20,
                    background: "#F8FAFC",
                    border: "1px solid rgba(148,163,184,0.12)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Deposit
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gap: 8,
                      fontSize: 14,
                      color: "#0F172A",
                    }}
                  >
                    <div>
                      <strong>Status:</strong> {selectedReservation.depositStatus}
                    </div>
                    <div>
                      <strong>Amount:</strong> {selectedReservation.depositAmount}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 20,
                  background: "#F8FAFC",
                  border: "1px solid rgba(148,163,184,0.12)",
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: "#94A3B8",
                  }}
                >
                  Notes
                </div>

                <textarea
                  value={selectedReservation.notes}
                  onChange={(e) => updateReservationNotes(e.target.value)}
                  placeholder="Add reservation notes..."
                  style={{
                    marginTop: 10,
                    width: "100%",
                    minHeight: 110,
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.18)",
                    background: "#FFFFFF",
                    padding: 14,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#334155",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                      marginBottom: 10,
                    }}
                  >
                    Reservation Flow
                  </div>

                  <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 10,
                    }}
                    >
                    <StageButton
                        label="Reserved"
                        active={selectedReservation.status === "Reserved"}
                        onClick={() => updateReservationStatus("Reserved")}
                    />

                    <div
                        style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#94A3B8",
                        lineHeight: 1
                        }}
                    >
                        ›
                    </div>

                    <StageButton
                        label="Arrived"
                        active={selectedReservation.status === "Arrived"}
                        onClick={() => updateReservationStatus("Arrived")}
                    />

                    <div
                        style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#94A3B8",
                        lineHeight: 1,
                        }}
                    >
                        ›
                    </div>

                    <StageButton
                        label="Seated"
                        active={selectedReservation.status === "Seated"}
                        onClick={() => updateReservationStatus("Seated")}
                    />

                    <div
                        style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#94A3B8",
                        lineHeight: 1,
                        }}
                    >
                        ›
                    </div>

                    <StageButton
                        label="Released"
                        active={selectedReservation.status === "Released"}
                        onClick={() => updateReservationStatus("Released")}
                    />

                    <div
                        style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#94A3B8",
                        lineHeight: 1,
                        }}
                    >
                        ›
                    </div>

                    <StageButton
                        label="Closed"
                        active={selectedReservation.status === "Closed"}
                        onClick={() => updateReservationStatus("Closed")}
                    />
                    </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "#94A3B8",
                      marginBottom: 10,
                    }}
                  >
                    Exception
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <StageButton
                      label="No-Show"
                      tone="danger"
                      active={selectedReservation.status === "No-Show"}
                      onClick={() => updateReservationStatus("No-Show")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 1180px) {
          .reservations-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 980px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .summary-grid,
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}