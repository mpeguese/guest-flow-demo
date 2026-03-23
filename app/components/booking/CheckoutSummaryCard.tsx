// app/components/booking/CheckoutSummaryCard.tsx
"use client"

import { useState } from "react"

type Pricing = {
  subtotal: number
  tax: number
  processingFee: number
  total: number
}

type CheckoutSummaryCardProps = {
  date: string
  partySize: string
  session: string
  zoneName: string
  section: string
  reservationPrice: number
  pricing: Pricing
  previewImageSrc?: string
}

function formatDate(dateKey: string) {
  if (!dateKey) return "Not selected"

  const date = new Date(`${dateKey}T12:00:00Z`)

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
        fontSize: bold ? 16 : 14,
        fontWeight: bold ? 800 : 600,
        color: bold ? "#0F172A" : "#334155",
      }}
    >
      <div>{label}</div>
      <div style={{ textAlign: "right" }}>{value}</div>
    </div>
  )
}

export default function CheckoutSummaryCard({
  date,
  partySize,
  session,
  zoneName,
  section,
  pricing,
  previewImageSrc,
}: CheckoutSummaryCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const fallbackImageSrc = "/images/table-preview.jpg"
  const finalImageSrc =
    !imageFailed && previewImageSrc ? previewImageSrc : fallbackImageSrc

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 26,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 16px 34px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          color: "#64748B",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Order summary
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "96px 1fr",
          gap: 14,
          alignItems: "start",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 20,
            overflow: "hidden",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
            flexShrink: 0,
          }}
        >
          <img
            src={finalImageSrc}
            alt={`${zoneName} seating preview`}
            onError={() => setImageFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: -0.6,
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            {zoneName}
          </div>

          <div
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "#64748B",
            }}
          >
            VIP table for up to 8 guests.  Centrally located in the middle of all the action.
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          borderBottom: "1px solid #E2E8F0",
          padding: "6px 0",
        }}
      >
        <SummaryRow label="Booking Date" value={formatDate(date)} />
        <SummaryRow label="Section Purchased" value={section} />
        <SummaryRow label="Party Size" value={partySize || "Not selected"} />
        <SummaryRow label="Session" value={session || "Not selected"} />
      </div>

      <div style={{ paddingTop: 10 }}>
        <SummaryRow label="Subtotal" value={money(pricing.subtotal)} />
        <SummaryRow label="Tax (7%)" value={money(pricing.tax)} />
        <SummaryRow label="Processing Fee (5%)" value={money(pricing.processingFee)} />

        <div
          style={{
            marginTop: 8,
            paddingTop: 12,
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <SummaryRow label="Grand Total" value={money(pricing.total)} bold />
        </div>
      </div>
    </div>
  )
}