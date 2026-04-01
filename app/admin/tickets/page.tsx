// app/admin/tickets/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type TicketCategory = "GA" | "VIP" | "Early Bird" | "Comp" | "Late Bird"
type TicketLiveStatus = "Live" | "Paused"

type TicketProduct = {
  id: string
  name: string
  category: TicketCategory
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

type AddTicketFormState = {
  name: string
  priceType: "Free" | "Paid"
  price: string
  category: Exclude<TicketCategory, "Comp">
  quantity: string
  status: TicketLiveStatus
  saleWindow: string
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

const defaultAddTicketForm: AddTicketFormState = {
  name: "",
  priceType: "Paid",
  price: "",
  category: "GA",
  quantity: "",
  status: "Live",
  saleWindow: "Now - 11:30 PM",
}

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
    case "Late Bird":
      return {
        bg: "rgba(34,197,94,0.14)",
        color: "#166534",
        border: "rgba(34,197,94,0.30)",
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
  const [doorMode, setDoorMode] = useState(true)
  const [flashMessage, setFlashMessage] = useState("")
  const [showAddTicketModal, setShowAddTicketModal] = useState(false)
  const [ticketForm, setTicketForm] =
    useState<AddTicketFormState>(defaultAddTicketForm)
  const [ticketFormError, setTicketFormError] = useState("")

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAddTicketModal(false)
      }
    }

    if (showAddTicketModal) {
      window.addEventListener("keydown", onKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [showAddTicketModal])

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

  function resetTicketForm() {
    setTicketForm(defaultAddTicketForm)
    setTicketFormError("")
  }

  function openAddTicketModal() {
    resetTicketForm()
    setShowAddTicketModal(true)
  }

  function closeAddTicketModal() {
    setShowAddTicketModal(false)
    setTicketFormError("")
  }

  function saveNewTicket() {
    const name = ticketForm.name.trim()
    const quantity = Number(ticketForm.quantity)
    const priceValue =
      ticketForm.priceType === "Free" ? 0 : Number(ticketForm.price)

    if (!name) {
      setTicketFormError("Please enter a ticket name.")
      return
    }

    if (!ticketForm.quantity || Number.isNaN(quantity) || quantity <= 0) {
      setTicketFormError("Please enter a valid quantity.")
      return
    }

    if (
      ticketForm.priceType === "Paid" &&
      (!ticketForm.price || Number.isNaN(priceValue) || priceValue < 0)
    ) {
      setTicketFormError("Please enter a valid paid price.")
      return
    }

    const newProduct: TicketProduct = {
      id: `tp_${Date.now()}`,
      name,
      category: ticketForm.category,
      price: priceValue,
      sold: 0,
      scanned: 0,
      capacity: quantity,
      live: ticketForm.status === "Live",
      saleWindow: ticketForm.saleWindow,
    }

    setProducts((current) => [newProduct, ...current])
    setShowAddTicketModal(false)
    resetTicketForm()
    showFlash("Ticket added")
  }

  return (
    <>
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
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={openAddTicketModal}
                style={actionButtonStyle("secondary")}
              >
                Add Ticket
              </button>

              <button
                onClick={() => {
                  setProducts((current) =>
                    current.map((item) => ({ ...item, live: false }))
                  )
                  showFlash("All ticket sales paused")
                }}
                style={actionButtonStyle("secondary")}
              >
                Pause All Sales
              </button>

              <button
                onClick={() => showFlash("Export prepared")}
                style={actionButtonStyle("secondary")}
              >
                Export
              </button>

              <button
                onClick={() => router.push("/admin/dashboard")}
                style={actionButtonStyle("primary")}
              >
                Dashboard
              </button>
            </div>
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
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 14,
              }}
            >
              {products.map((product) => {
                const remaining = Math.max(product.capacity - product.sold, 0)
                const soldPct =
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
                        "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.94) 100%)",
                      borderRadius: 24,
                      padding: 18,
                      minWidth: 0,
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
                      <div style={{ minWidth: 0, flex: 1 }}>
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
                              fontSize: 18,
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
                          <span>{product.saleWindow}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleProductLive(product.id)}
                        style={{
                          ...actionButtonStyle(product.live ? "muted" : "secondary"),
                          minWidth: 108,
                        }}
                      >
                        {product.live ? "Pause" : "Go Live"}
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <SingleDonut
                        value={product.sold}
                        total={product.capacity}
                        percentage={soldPct}
                        centerLabel="Sold"
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 10,
                      }}
                    >
                      <MiniStat label="Sold" value={String(product.sold)} />
                      <MiniStat label="Scanned" value={String(product.scanned)} />
                      <MiniStat label="Capacity" value={String(product.capacity)} />
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 14,
                          background: "rgba(248,250,252,0.9)",
                          border: "1px solid rgba(148,163,184,0.12)",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        <LegendDot
                          label="Remaining"
                          color="#E2E8F0"
                          value={remaining}
                        />
                        <LegendDot
                          label="Sold"
                          color="#FB7185"
                          value={product.sold}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
              gap: 18,
            }}
          >
            <section
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(148,163,184,0.16)",
                borderRadius: 26,
                boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
                padding: 18,
                overflow: "hidden",
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
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748B",
                                marginTop: 3,
                              }}
                            >
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
                                  if (!doorMode) {
                                    showFlash(
                                      "Enable Door Mode to check guests in"
                                    )
                                    return
                                  }
                                  handleRecordAction(record.id, "scan")
                                }}
                                style={tinyActionStyle("#06B6D4", !doorMode)}
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
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: -0.3,
                  }}
                >
                  Door Controls
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
                  onClick={() => {
                    if (!doorMode) {
                      showFlash("Enable Door Mode first")
                      return
                    }
                    showFlash("Manual check-in enabled")
                  }}
                  disabled={!doorMode}
                />
                <ActionBlock
                  title="Resend Ticket"
                  subtitle="Quickly resend a pass to the guest."
                  buttonLabel="Send"
                  onClick={() => showFlash("Ticket resend started")}
                />
                <ActionBlock
                  title="Create Comp"
                  subtitle="Issue a comp ticket for a guest at the door."
                  buttonLabel="Create"
                  onClick={createCompTicket}
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
                  <div>
                    • Peak check-ins are trending between 8:45 PM and 9:30 PM
                  </div>
                  <div>• VIP Express Entry is pacing fastest tonight</div>
                  <div>• Refund/void activity is low and within normal range</div>
                </div>
              </div>
            </section>
          </div>

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
                marginBottom: 14,
              }}
            >
              Ticket Detail Panel
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
                <DetailCard
                  label="Ticket Type"
                  value={selectedRecord.ticketType}
                />
                <DetailCard
                  label="Purchased"
                  value={selectedRecord.purchasedAt}
                />
                <DetailCard
                  label="Scanned"
                  value={selectedRecord.scannedAt ?? "Not yet"}
                />

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
                      onClick={() => {
                        if (!doorMode) {
                          showFlash("Enable Door Mode to check guests in")
                          return
                        }
                        handleRecordAction(selectedRecord.id, "scan")
                      }}
                      style={actionButtonStyle(doorMode ? "primary" : "muted")}
                    >
                      Manual Check-In
                    </button>
                    <button
                      onClick={() =>
                        handleRecordAction(selectedRecord.id, "activate")
                      }
                      style={actionButtonStyle("secondary")}
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() =>
                        handleRecordAction(selectedRecord.id, "refund")
                      }
                      style={actionButtonStyle("warn")}
                    >
                      Refund
                    </button>
                    <button
                      onClick={() =>
                        handleRecordAction(selectedRecord.id, "void")
                      }
                      style={actionButtonStyle("danger")}
                    >
                      Void
                    </button>
                    <button
                      onClick={() =>
                        handleRecordAction(selectedRecord.id, "resend")
                      }
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

      {showAddTicketModal ? (
        <div
          onClick={closeAddTicketModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.42)",
            backdropFilter: "blur(8px)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "min(88dvh, 900px)",
              overflowY: "auto",
              borderRadius: 26,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
              border: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "0 30px 80px rgba(15,23,42,0.22)",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: -0.5,
                    color: "#0F172A",
                  }}
                >
                  Add Ticket
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: "#64748B",
                  }}
                >
                  Create a new ticket product for this session.
                </div>
              </div>

              <button
                onClick={closeAddTicketModal}
                style={{
                  border: "1px solid rgba(148,163,184,0.18)",
                  background: "rgba(255,255,255,0.88)",
                  color: "#334155",
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Close add ticket modal"
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <FieldLabel label="Ticket Name" />
              <input
                value={ticketForm.name}
                onChange={(e) =>
                  setTicketForm((current) => ({
                    ...current,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter ticket name"
                style={inputStyle}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                <div>
                  <FieldLabel label="Price Type" />
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {(["Free", "Paid"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setTicketForm((current) => ({
                            ...current,
                            priceType: option,
                            price: option === "Free" ? "" : current.price,
                          }))
                        }
                        style={pillButtonStyle(ticketForm.priceType === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel label="Price" />
                  <input
                    value={ticketForm.priceType === "Free" ? "Free" : ticketForm.price}
                    onChange={(e) =>
                      setTicketForm((current) => ({
                        ...current,
                        price: e.target.value.replace(/[^\d.]/g, ""),
                      }))
                    }
                    disabled={ticketForm.priceType === "Free"}
                    placeholder={ticketForm.priceType === "Free" ? "Free" : "0.00"}
                    style={{
                      ...inputStyle,
                      opacity: ticketForm.priceType === "Free" ? 0.7 : 1,
                      cursor:
                        ticketForm.priceType === "Free" ? "not-allowed" : "text",
                    }}
                  />
                </div>
              </div>

              <div>
                <FieldLabel label="Category" />
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {(["Early Bird", "Late Bird", "GA", "VIP"] as const).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setTicketForm((current) => ({
                            ...current,
                            category: option,
                          }))
                        }
                        style={pillButtonStyle(ticketForm.category === option)}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                <div>
                  <FieldLabel label="Quantity" />
                  <input
                    value={ticketForm.quantity}
                    onChange={(e) =>
                      setTicketForm((current) => ({
                        ...current,
                        quantity: e.target.value.replace(/[^\d]/g, ""),
                      }))
                    }
                    placeholder="Enter quantity"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <FieldLabel label="Status" />
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {(["Live", "Paused"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setTicketForm((current) => ({
                            ...current,
                            status: option,
                          }))
                        }
                        style={pillButtonStyle(ticketForm.status === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel label="Sale Window" />
                <select
                  value={ticketForm.saleWindow}
                  onChange={(e) =>
                    setTicketForm((current) => ({
                      ...current,
                      saleWindow: e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="Now - 11:30 PM">Now - 11:30 PM</option>
                  <option value="Now - 12:00 AM">Now - 12:00 AM</option>
                  <option value="Now - Event End">Now - Event End</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {ticketFormError ? (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    color: "#991B1B",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {ticketFormError}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 6,
                }}
              >
                <button
                  onClick={closeAddTicketModal}
                  style={actionButtonStyle("muted")}
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewTicket}
                  style={actionButtonStyle("primary")}
                >
                  Save Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function SingleDonut({
  value,
  total,
  percentage,
  centerLabel,
}: {
  value: number
  total: number
  percentage: number
  centerLabel: string
}) {
  const safeTotal = Math.max(total, 1)
  const pct = Math.max(0, Math.min(value / safeTotal, 1))
  const angle = pct * 360

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          maxWidth: "100%",
          borderRadius: "50%",
          background: `conic-gradient(#22D3EE 0deg, #38BDF8 ${angle * 0.58}deg, #FB7185 ${angle}deg, rgba(226,232,240,0.95) ${angle}deg, rgba(226,232,240,0.95) 360deg)`,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 102,
            height: 102,
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "grid",
            placeItems: "center",
            boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.10)",
            padding: 8,
          }}
        >
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -0.8,
                color: "#0F172A",
              }}
            >
              {value}
            </div>
            <div
              style={{
                marginTop: 5,
                fontSize: 11,
                fontWeight: 900,
                color: "#64748B",
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              {centerLabel}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                fontWeight: 800,
                color: "#0EA5E9",
              }}
            >
              {Math.round(percentage)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendDot({
  label,
  color,
  value,
}: {
  label: string
  color: string
  value: number
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#475569",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: "#0F172A",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
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
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.7,
          color: "#64748B",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
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
          lineHeight: 1.05,
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
  disabled = false,
}: {
  title: string
  subtitle: string
  buttonLabel: string
  onClick: () => void
  disabled?: boolean
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

      <button
        onClick={onClick}
        style={actionButtonStyle(disabled ? "muted" : "secondary")}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "#64748B",
        marginBottom: 8,
      }}
    >
      {label}
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

function pillButtonStyle(active: boolean) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: active
      ? "1px solid rgba(14,165,233,0.26)"
      : "1px solid rgba(148,163,184,0.18)",
    background: active ? "rgba(14,165,233,0.10)" : "rgba(255,255,255,0.88)",
    color: active ? "#075985" : "#334155",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  }
}

function tinyActionStyle(color: string, disabled = false) {
  return {
    border: "none",
    background: disabled ? "rgba(148,163,184,0.10)" : `${color}14`,
    color: disabled ? "#94A3B8" : color,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap" as const,
  }
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.22)",
  outline: "none",
  fontSize: 14,
  background: "#FFFFFF",
  color: "#0F172A",
  boxSizing: "border-box",
}

const cellStyle: React.CSSProperties = {
  padding: "14px 14px",
  fontSize: 14,
  color: "#334155",
  verticalAlign: "middle",
}