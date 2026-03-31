"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type TicketProduct = {
  id: string
  name: string
  category: "GA" | "VIP" | "Early Bird" | "Comp"
  price: number
  sold: number
  scanned: number
  capacity: number
  live: boolean
  saleWindow: string
}

type TicketStatus = "Active" | "Scanned" | "Refunded" | "Voided" | "Transferred"

type TicketRecord = {
  id: string
  buyerName: string
  email: string
  orderId: string
  ticketType: string
  status: TicketStatus
  purchasedAt: string
  scannedAt?: string
  channel: "App" | "Promoter Link" | "Walk-Up" | "Comp"
}

const initialProducts: TicketProduct[] = [
  {
    id: "tp_1",
    name: "General Admission",
    category: "GA",
    price: 25,
    sold: 184,
    scanned: 121,
    capacity: 250,
    live: true,
    saleWindow: "Now - 11:30 PM",
  },
  {
    id: "tp_2",
    name: "VIP Express Entry",
    category: "VIP",
    price: 60,
    sold: 72,
    scanned: 48,
    capacity: 100,
    live: true,
    saleWindow: "Now - 12:00 AM",
  },
  {
    id: "tp_3",
    name: "Early Bird",
    category: "Early Bird",
    price: 18,
    sold: 96,
    scanned: 96,
    capacity: 100,
    live: false,
    saleWindow: "Closed",
  },
  {
    id: "tp_4",
    name: "Promoter Comp",
    category: "Comp",
    price: 0,
    sold: 21,
    scanned: 9,
    capacity: 40,
    live: true,
    saleWindow: "Now - Event End",
  },
]

const initialRecords: TicketRecord[] = [
  {
    id: "tr_1",
    buyerName: "Jasmine Carter",
    email: "jasmine.carter@email.com",
    orderId: "GF-48219",
    ticketType: "General Admission",
    status: "Active",
    purchasedAt: "8:12 PM",
    channel: "App",
  },
  {
    id: "tr_2",
    buyerName: "Devin Brooks",
    email: "devin.brooks@email.com",
    orderId: "GF-48218",
    ticketType: "VIP Express Entry",
    status: "Scanned",
    purchasedAt: "7:54 PM",
    scannedAt: "9:06 PM",
    channel: "Promoter Link",
  },
  {
    id: "tr_3",
    buyerName: "Kayla Simmons",
    email: "kayla.simmons@email.com",
    orderId: "GF-48215",
    ticketType: "General Admission",
    status: "Refunded",
    purchasedAt: "7:32 PM",
    channel: "App",
  },
  {
    id: "tr_4",
    buyerName: "Marcus Hill",
    email: "marcus.hill@email.com",
    orderId: "GF-48212",
    ticketType: "Promoter Comp",
    status: "Active",
    purchasedAt: "7:11 PM",
    channel: "Comp",
  },
  {
    id: "tr_5",
    buyerName: "Arianna Lopez",
    email: "arianna.lopez@email.com",
    orderId: "GF-48209",
    ticketType: "Early Bird",
    status: "Scanned",
    purchasedAt: "6:44 PM",
    scannedAt: "8:58 PM",
    channel: "App",
  },
  {
    id: "tr_6",
    buyerName: "Noah Bennett",
    email: "noah.bennett@email.com",
    orderId: "GF-48203",
    ticketType: "VIP Express Entry",
    status: "Transferred",
    purchasedAt: "6:10 PM",
    channel: "Promoter Link",
  },
  {
    id: "tr_7",
    buyerName: "Tiana Reed",
    email: "tiana.reed@email.com",
    orderId: "GF-48198",
    ticketType: "General Admission",
    status: "Voided",
    purchasedAt: "5:52 PM",
    channel: "Walk-Up",
  },
  {
    id: "tr_8",
    buyerName: "Chris Morgan",
    email: "chris.morgan@email.com",
    orderId: "GF-48191",
    ticketType: "General Admission",
    status: "Active",
    purchasedAt: "5:35 PM",
    channel: "App",
  },
]

function formatMoney(value: number) {
  return value === 0 ? "Free" : `$${value}`
}

function statusColors(status: TicketStatus) {
  switch (status) {
    case "Active":
      return {
        bg: "rgba(34,197,94,0.14)",
        color: "#166534",
        border: "rgba(34,197,94,0.28)",
      }
    case "Scanned":
      return {
        bg: "rgba(14,165,233,0.14)",
        color: "#075985",
        border: "rgba(14,165,233,0.28)",
      }
    case "Refunded":
      return {
        bg: "rgba(245,158,11,0.14)",
        color: "#92400E",
        border: "rgba(245,158,11,0.28)",
      }
    case "Voided":
      return {
        bg: "rgba(239,68,68,0.14)",
        color: "#991B1B",
        border: "rgba(239,68,68,0.28)",
      }
    case "Transferred":
      return {
        bg: "rgba(168,85,247,0.14)",
        color: "#6B21A8",
        border: "rgba(168,85,247,0.28)",
      }
    default:
      return {
        bg: "rgba(148,163,184,0.14)",
        color: "#334155",
        border: "rgba(148,163,184,0.22)",
      }
  }
}

function categoryColors(category: TicketProduct["category"]) {
  switch (category) {
    case "GA":
      return {
        bg: "rgba(6,182,212,0.12)",
        color: "#155E75",
        border: "rgba(6,182,212,0.26)",
      }
    case "VIP":
      return {
        bg: "rgba(236,72,153,0.12)",
        color: "#9D174D",
        border: "rgba(236,72,153,0.26)",
      }
    case "Early Bird":
      return {
        bg: "rgba(251,146,60,0.14)",
        color: "#9A3412",
        border: "rgba(251,146,60,0.30)",
      }
    case "Comp":
      return {
        bg: "rgba(168,85,247,0.12)",
        color: "#6B21A8",
        border: "rgba(168,85,247,0.28)",
      }
    default:
      return {
        bg: "rgba(148,163,184,0.12)",
        color: "#334155",
        border: "rgba(148,163,184,0.24)",
      }
  }
}

export default function AdminTicketsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<TicketProduct[]>(initialProducts)
  const [records, setRecords] = useState<TicketRecord[]>(initialRecords)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | TicketStatus>("All")
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [showOnlyLiveProducts, setShowOnlyLiveProducts] = useState(false)
  const [doorMode, setDoorMode] = useState(true)
  const [flashMessage, setFlashMessage] = useState("")

  const filteredProducts = useMemo(() => {
    if (!showOnlyLiveProducts) return products
    return products.filter((p) => p.live)
  }, [products, showOnlyLiveProducts])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchBlob =
        `${record.buyerName} ${record.email} ${record.orderId} ${record.ticketType} ${record.channel}`.toLowerCase()

      const matchesSearch = searchBlob.includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "All" ? true : record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [records, search, statusFilter])

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? null

  const totals = useMemo(() => {
    const totalSold = products.reduce((sum, item) => sum + item.sold, 0)
    const totalScanned = products.reduce((sum, item) => sum + item.scanned, 0)
    const totalCapacity = products.reduce((sum, item) => sum + item.capacity, 0)
    const remainingCapacity = Math.max(totalCapacity - totalSold, 0)
    const refundedOrVoided = records.filter(
      (item) => item.status === "Refunded" || item.status === "Voided"
    ).length

    return {
      totalSold,
      totalScanned,
      totalCapacity,
      remainingCapacity,
      refundedOrVoided,
    }
  }, [products, records])

  function showFlash(text: string) {
    setFlashMessage(text)
    window.setTimeout(() => setFlashMessage(""), 1800)
  }

  function toggleProductLive(productId: string) {
    setProducts((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, live: !item.live } : item
      )
    )
    showFlash("Ticket sale status updated")
  }

  function handleRecordAction(
    recordId: string,
    action: "scan" | "refund" | "void" | "activate" | "resend"
  ) {
    if (action === "resend") {
      showFlash("Ticket resent")
      return
    }

    setRecords((current) =>
      current.map((item) => {
        if (item.id !== recordId) return item

        if (action === "scan") {
          return {
            ...item,
            status: "Scanned",
            scannedAt: "Now",
          }
        }

        if (action === "refund") {
          return {
            ...item,
            status: "Refunded",
          }
        }

        if (action === "void") {
          return {
            ...item,
            status: "Voided",
          }
        }

        if (action === "activate") {
          return {
            ...item,
            status: "Active",
            scannedAt: undefined,
          }
        }

        return item
      })
    )

    if (action === "scan") showFlash("Guest checked in")
    if (action === "refund") showFlash("Ticket refunded")
    if (action === "void") showFlash("Ticket voided")
    if (action === "activate") showFlash("Ticket reactivated")
  }

  function createCompTicket() {
    const newRecord: TicketRecord = {
      id: `tr_${Date.now()}`,
      buyerName: "New Comp Guest",
      email: "comp.guest@email.com",
      orderId: `GF-COMP-${Math.floor(Math.random() * 900 + 100)}`,
      ticketType: "Promoter Comp",
      status: "Active",
      purchasedAt: "Now",
      channel: "Comp",
    }

    setRecords((current) => [newRecord, ...current])
    setProducts((current) =>
      current.map((item) =>
        item.name === "Promoter Comp"
          ? { ...item, sold: item.sold + 1 }
          : item
      )
    )
    setSelectedRecordId(newRecord.id)
    showFlash("Comp ticket created")
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #FFF8F1 0%, #F2FBFF 45%, #ECFEFF 100%)",
        padding: "20px 16px 32px",
        color: "#0F172A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gap: 18,
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
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.5,
                color: "#0EA5E9",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Miami Ticket Ops
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: -0.8,
              }}
            >
              Tickets
            </h1>

            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                color: "#475569",
                maxWidth: 760,
                lineHeight: 1.55,
              }}
            >
              Manage ticket inventory, track admissions, and resolve guest
              issues at the door.
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)",
              color: "#FFFFFF",
              padding: "12px 18px",
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 12px 28px rgba(14,165,233,0.22)",
              whiteSpace: "nowrap",
            }}
          >
            Dashboard
          </button>
        </div>

        {flashMessage ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 16,
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.22)",
              color: "#065F46",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {flashMessage}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <MetricCard
            title="Tickets Sold"
            value={String(totals.totalSold)}
            subtext="Across all active ticket products"
            accent="cyan"
          />
          <MetricCard
            title="Checked In"
            value={String(totals.totalScanned)}
            subtext="Tickets successfully scanned"
            accent="sky"
          />
          <MetricCard
            title="Remaining Capacity"
            value={String(totals.remainingCapacity)}
            subtext={`${totals.totalCapacity} total event capacity`}
            accent="orange"
          />
          <MetricCard
            title="Refunds / Voids"
            value={String(totals.refundedOrVoided)}
            subtext="Requires manager visibility"
            accent="pink"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 18,
          }}
        >
          <section
            style={{
              background: "rgba(255,255,255,0.84)",
              border: "1px solid rgba(148,163,184,0.16)",
              borderRadius: 26,
              boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
              padding: 18,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: -0.3,
                  }}
                >
                  Ticket Products
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#64748B",
                    fontSize: 14,
                  }}
                >
                  Control pricing, inventory, and sale status.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <TogglePill
                  label="Live Only"
                  active={showOnlyLiveProducts}
                  onClick={() => setShowOnlyLiveProducts((v) => !v)}
                />
                <button
                  onClick={createCompTicket}
                  style={actionButtonStyle("secondary")}
                >
                  Create Comp
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {filteredProducts.map((product) => {
                const remaining = Math.max(product.capacity - product.sold, 0)
                const fillPct =
                  product.capacity > 0
                    ? Math.min((product.sold / product.capacity) * 100, 100)
                    : 0
                const categoryStyle = categoryColors(product.category)

                return (
                  <div
                    key={product.id}
                    style={{
                      border: "1px solid rgba(148,163,184,0.14)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.92) 100%)",
                      borderRadius: 22,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 900,
                              letterSpacing: -0.2,
                            }}
                          >
                            {product.name}
                          </div>

                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              border: `1px solid ${categoryStyle.border}`,
                              background: categoryStyle.bg,
                              color: categoryStyle.color,
                            }}
                          >
                            {product.category}
                          </span>

                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              border: `1px solid ${
                                product.live
                                  ? "rgba(34,197,94,0.28)"
                                  : "rgba(148,163,184,0.22)"
                              }`,
                              background: product.live
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(148,163,184,0.10)",
                              color: product.live ? "#166534" : "#475569",
                            }}
                          >
                            {product.live ? "Live" : "Paused"}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 14,
                            flexWrap: "wrap",
                            color: "#475569",
                            fontSize: 14,
                          }}
                        >
                          <span>
                            <strong style={{ color: "#0F172A" }}>
                              {formatMoney(product.price)}
                            </strong>
                          </span>
                          <span>Window: {product.saleWindow}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleProductLive(product.id)}
                        style={{
                          ...actionButtonStyle(product.live ? "muted" : "primary"),
                          minWidth: 108,
                        }}
                      >
                        {product.live ? "Pause Sales" : "Go Live"}
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: 10,
                      }}
                    >
                      <MiniStat label="Sold" value={String(product.sold)} />
                      <MiniStat label="Scanned" value={String(product.scanned)} />
                      <MiniStat label="Remaining" value={String(remaining)} />
                      <MiniStat label="Capacity" value={String(product.capacity)} />
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                      }}
                    >
                      <div
                        style={{
                          height: 10,
                          borderRadius: 999,
                          background: "rgba(14,165,233,0.10)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${fillPct}%`,
                            height: "100%",
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg, #22D3EE 0%, #38BDF8 55%, #FB7185 100%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section
            style={{
              background: "rgba(255,255,255,0.84)",
              border: "1px solid rgba(148,163,184,0.16)",
              borderRadius: 26,
              boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
              padding: 18,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: -0.3,
                  }}
                >
                  Door Controls
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#64748B",
                    fontSize: 14,
                  }}
                >
                  Quick actions for live event operations.
                </div>
              </div>

              <TogglePill
                label="Door Mode"
                active={doorMode}
                onClick={() => {
                  setDoorMode((v) => !v)
                  showFlash(`Door mode ${!doorMode ? "enabled" : "disabled"}`)
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <ActionBlock
                title="Manual Check-In"
                subtitle="Mark a guest present if scanning fails."
                buttonLabel="Enable"
                onClick={() => showFlash("Manual check-in enabled")}
              />
              <ActionBlock
                title="Resend Ticket"
                subtitle="Quickly resend a pass to the guest."
                buttonLabel="Send"
                onClick={() => showFlash("Ticket resend started")}
              />
              <ActionBlock
                title="Pause All Sales"
                subtitle="Temporarily stop all online ticket purchases."
                buttonLabel="Pause"
                onClick={() => {
                  setProducts((current) =>
                    current.map((item) => ({ ...item, live: false }))
                  )
                  showFlash("All ticket sales paused")
                }}
              />
              <ActionBlock
                title="Export Entry List"
                subtitle="Prepare a downloadable admissions list."
                buttonLabel="Export"
                onClick={() => showFlash("Entry list export prepared")}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 18,
                background:
                  "linear-gradient(135deg, rgba(34,211,238,0.10) 0%, rgba(251,113,133,0.10) 100%)",
                border: "1px solid rgba(14,165,233,0.16)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: 1.1,
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                }}
              >
                Live Event Snapshot
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: "grid",
                  gap: 8,
                  color: "#0F172A",
                  fontSize: 14,
                }}
              >
                <div>• Peak check-ins are trending between 8:45 PM and 9:30 PM</div>
                <div>• VIP Express Entry is pacing fastest tonight</div>
                <div>• Refund/void activity is low and within normal range</div>
              </div>
            </div>
          </section>
        </div>

        <section
          style={{
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(148,163,184,0.16)",
            borderRadius: 26,
            boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
            padding: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: -0.3,
                }}
              >
                Recent Ticket Activity
              </div>
              <div
                style={{
                  marginTop: 4,
                  color: "#64748B",
                  fontSize: 14,
                }}
              >
                Search ticket holders, review status, and take action.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search buyer, order ID, email..."
                style={{
                  width: 280,
                  maxWidth: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.22)",
                  outline: "none",
                  fontSize: 14,
                  background: "#FFFFFF",
                  color: "#0F172A",
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "All" | TicketStatus)
                }
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.22)",
                  outline: "none",
                  fontSize: 14,
                  background: "#FFFFFF",
                  color: "#0F172A",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Scanned">Scanned</option>
                <option value="Refunded">Refunded</option>
                <option value="Voided">Voided</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              borderRadius: 18,
              border: "1px solid rgba(148,163,184,0.14)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 980,
                background: "#FFFFFF",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(34,211,238,0.08) 0%, rgba(251,113,133,0.08) 100%)",
                  }}
                >
                  {[
                    "Buyer",
                    "Order ID",
                    "Ticket",
                    "Channel",
                    "Status",
                    "Purchased",
                    "Scanned",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: "left",
                        padding: "14px 14px",
                        fontSize: 12,
                        color: "#475569",
                        fontWeight: 900,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const statusStyle = statusColors(record.status)

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecordId(record.id)}
                      style={{
                        borderTop: "1px solid rgba(148,163,184,0.10)",
                        cursor: "pointer",
                        background:
                          selectedRecordId === record.id
                            ? "rgba(14,165,233,0.04)"
                            : "#FFFFFF",
                      }}
                    >
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 800, color: "#0F172A" }}>
                          {record.buyerName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>
                          {record.email}
                        </div>
                      </td>

                      <td style={cellStyle}>{record.orderId}</td>
                      <td style={cellStyle}>{record.ticketType}</td>
                      <td style={cellStyle}>{record.channel}</td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "7px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td style={cellStyle}>{record.purchasedAt}</td>
                      <td style={cellStyle}>{record.scannedAt ?? "—"}</td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRecordAction(record.id, "scan")
                            }}
                            style={tinyActionStyle("#06B6D4")}
                          >
                            Check In
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRecordAction(record.id, "resend")
                            }}
                            style={tinyActionStyle("#FB7185")}
                          >
                            Resend
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "28px 18px",
                        textAlign: "center",
                        color: "#64748B",
                        fontWeight: 700,
                      }}
                    >
                      No ticket records match your current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.90)",
            border: "1px solid rgba(148,163,184,0.16)",
            borderRadius: 26,
            boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: -0.3,
              marginBottom: 6,
            }}
          >
            Ticket Detail Panel
          </div>
          <div
            style={{
              color: "#64748B",
              fontSize: 14,
              marginBottom: 14,
            }}
          >
            Select a ticket row above to inspect and resolve guest issues.
          </div>

          {selectedRecord ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <DetailCard label="Guest" value={selectedRecord.buyerName} />
              <DetailCard label="Email" value={selectedRecord.email} />
              <DetailCard label="Order ID" value={selectedRecord.orderId} />
              <DetailCard label="Ticket Type" value={selectedRecord.ticketType} />
              <DetailCard label="Purchased" value={selectedRecord.purchasedAt} />
              <DetailCard label="Scanned" value={selectedRecord.scannedAt ?? "Not yet"} />

              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.14)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => handleRecordAction(selectedRecord.id, "scan")}
                    style={actionButtonStyle("primary")}
                  >
                    Manual Check-In
                  </button>
                  <button
                    onClick={() => handleRecordAction(selectedRecord.id, "activate")}
                    style={actionButtonStyle("secondary")}
                  >
                    Reactivate
                  </button>
                  <button
                    onClick={() => handleRecordAction(selectedRecord.id, "refund")}
                    style={actionButtonStyle("warn")}
                  >
                    Refund
                  </button>
                  <button
                    onClick={() => handleRecordAction(selectedRecord.id, "void")}
                    style={actionButtonStyle("danger")}
                  >
                    Void
                  </button>
                  <button
                    onClick={() => handleRecordAction(selectedRecord.id, "resend")}
                    style={actionButtonStyle("muted")}
                  >
                    Resend Ticket
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "22px 16px",
                borderRadius: 18,
                border: "1px dashed rgba(148,163,184,0.28)",
                background: "rgba(248,250,252,0.72)",
                color: "#64748B",
                fontWeight: 700,
              }}
            >
              No ticket selected yet.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtext,
  accent,
}: {
  title: string
  value: string
  subtext: string
  accent: "cyan" | "sky" | "orange" | "pink"
}) {
  const backgrounds = {
    cyan: "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(255,255,255,0.94) 100%)",
    sky: "linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(255,255,255,0.94) 100%)",
    orange: "linear-gradient(135deg, rgba(251,146,60,0.18) 0%, rgba(255,255,255,0.94) 100%)",
    pink: "linear-gradient(135deg, rgba(251,113,133,0.18) 0%, rgba(255,255,255,0.94) 100%)",
  } as const

  return (
    <div
      style={{
        borderRadius: 24,
        padding: 18,
        background: backgrounds[accent],
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.1,
          textTransform: "uppercase",
          color: "#475569",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: -1,
          color: "#0F172A",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          color: "#64748B",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {subtext}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 16,
        background: "rgba(248,250,252,0.95)",
        border: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.8,
          color: "#64748B",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          fontWeight: 900,
          color: "#0F172A",
        }}
      >
        {value}
      </div>
    </div>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#64748B",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 16,
          fontWeight: 800,
          color: "#0F172A",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  )
}

function TogglePill({
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
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(14,165,233,0.24)"
          : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? "rgba(14,165,233,0.10)"
          : "rgba(255,255,255,0.85)",
        color: active ? "#075985" : "#334155",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          background: active ? "#0EA5E9" : "#CBD5E1",
          position: "relative",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: active ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(15,23,42,0.2)",
            transition: "all 0.2s ease",
          }}
        />
      </span>
    </button>
  )
}

function ActionBlock({
  title,
  subtitle,
  buttonLabel,
  onClick,
}: {
  title: string
  subtitle: string
  buttonLabel: string
  onClick: () => void
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        border: "1px solid rgba(148,163,184,0.14)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#0F172A",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            color: "#64748B",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>

      <button onClick={onClick} style={actionButtonStyle("secondary")}>
        {buttonLabel}
      </button>
    </div>
  )
}

function actionButtonStyle(
  variant: "primary" | "secondary" | "warn" | "danger" | "muted"
) {
  const styles = {
    primary: {
      background: "linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)",
      color: "#FFFFFF",
      border: "none",
    },
    secondary: {
      background: "rgba(14,165,233,0.10)",
      color: "#075985",
      border: "1px solid rgba(14,165,233,0.18)",
    },
    warn: {
      background: "rgba(245,158,11,0.12)",
      color: "#92400E",
      border: "1px solid rgba(245,158,11,0.20)",
    },
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: "#991B1B",
      border: "1px solid rgba(239,68,68,0.20)",
    },
    muted: {
      background: "rgba(148,163,184,0.10)",
      color: "#334155",
      border: "1px solid rgba(148,163,184,0.20)",
    },
  } as const

  return {
    padding: "11px 14px",
    borderRadius: 14,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow:
      variant === "primary" ? "0 12px 24px rgba(14,165,233,0.18)" : "none",
    ...styles[variant],
  } as const
}

function tinyActionStyle(color: string) {
  return {
    border: "none",
    background: `${color}14`,
    color,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  }
}

const cellStyle: React.CSSProperties = {
  padding: "14px 14px",
  fontSize: 14,
  color: "#334155",
  verticalAlign: "middle",
}