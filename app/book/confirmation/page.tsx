"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import MobileShell from "@/app/components/booking/MobileShell"
import { BookingCartItem, useBookingCart } from "@/app/lib/booking-cart"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import {
  generateReservationCode,
  getLatestReservation,
  saveLatestReservation,
  updateLatestReservationGuestInfo,
} from "@/app/lib/reservation-confirmation"

function formatDate(dateKey: string) {
  if (!dateKey) return "Not selected"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
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

const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F7FBFC",
  bgWarm: "#FFF4E5",
  card: "#FFFFFF",
  cardSoft: "#F2FAFB",
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",
  borderSoft: "#E6EEF2",

  primary: "#0EA5E9",
  primaryHover: "#0284C7",
  primarySoft: "#E0F2FE",

  accent: "#14B8A6",
  accentSoft: "#DDF7F3",

  coral: "#FF7A59",
  coralSoft: "#FFE7E0",

  gold: "#F59E0B",
  goldSoft: "#FEF3C7",

  success: "#16A34A",
  successSoft: "#DCFCE7",
} as const

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: `1px solid ${COLORS.border}`,
  padding: "0 14px",
  fontSize: 15,
  color: COLORS.text,
  background: COLORS.card,
  outline: "none",
}

export default function ConfirmationPage() {
  const router = useRouter()
  const { items, clearCart } = useBookingCart()

  const [completedItems, setCompletedItems] = useState<BookingCartItem[]>([])
  const [reservationCode, setReservationCode] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  const initialItems = useMemo(() => items, [])

  useEffect(() => {
    const existing = getLatestReservation()

    if (existing && existing.items?.length > 0) {
      setCompletedItems(existing.items as BookingCartItem[])
      setReservationCode(existing.reservationCode)

      if (existing.guestInfo) {
        setFirstName(existing.guestInfo.firstName || "")
        setLastName(existing.guestInfo.lastName || "")
        setEmail(existing.guestInfo.email || "")
        setPhone(existing.guestInfo.phone || "")
        setMarketingOptIn(!!existing.guestInfo.marketingOptIn)
      }

      if (initialItems.length > 0) {
        clearCart()
      }

      return
    }

    if (initialItems.length > 0) {
      const newCode = generateReservationCode()
      const now = new Date().toISOString()

      setCompletedItems(initialItems)
      setReservationCode(newCode)

      const subtotal = initialItems.reduce((sum, item) => sum + item.price, 0)
      const pricing = calculateBookingPricing(subtotal)

      saveLatestReservation({
        reservationCode: newCode,
        createdAt: now,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        processingFee: pricing.processingFee,
        total: pricing.total,
        items: initialItems.map((item) => ({
          id: item.id,
          zoneId: item.zoneId,
          zoneName: item.zoneName,
          section: item.section,
          date: item.date,
          partySize: item.partySize,
          session: item.session,
          price: item.price,
          imageSrc: item.imageSrc,
        })),
      })

      clearCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subtotal = useMemo(
    () => completedItems.reduce((sum, item) => sum + item.price, 0),
    [completedItems]
  )

  const pricing = useMemo(() => calculateBookingPricing(subtotal), [subtotal])

  const qrValue = useMemo(() => {
    if (!reservationCode) return ""
    return `guestflow://reservation/${reservationCode}`
  }, [reservationCode])

  function handleSaveGuestInfo() {
    updateLatestReservationGuestInfo({
      firstName,
      lastName,
      email,
      phone,
      marketingOptIn,
    })

    setSavedMessage("Details saved. You can use them later to retrieve your reservation.")
    window.setTimeout(() => setSavedMessage(""), 2600)
  }

  return (
    <MobileShell>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 52%, #FFF4E5 100%)",
          margin: "-16px",
          padding: "20px 16px 40px",
          color: COLORS.text,
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div
            style={{
              padding: 24,
              borderRadius: 28,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 18px 36px rgba(15,23,42,0.06)",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: COLORS.successSoft,
                color: COLORS.success,
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 18,
                boxShadow: "0 10px 18px rgba(22,163,74,0.14)",
              }}
            >
              ✓
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1,
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Booking confirmed
            </div>

            <p
              style={{
                marginTop: 10,
                color: COLORS.textSoft,
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 18,
              }}
            >
              Show this QR code at check-in or use your reservation code to retrieve your booking later.
            </p>

            {qrValue ? (
              <div
                style={{
                  display: "grid",
                  justifyItems: "center",
                  gap: 14,
                  padding: 18,
                  borderRadius: 22,
                  background: COLORS.bgSoft,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <QRCodeSVG
                  value={qrValue}
                  size={190}
                  bgColor="#FFFFFF"
                  fgColor={COLORS.text}
                  level="M"
                  includeMargin
                />

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  Reservation Code
                </div>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    color: COLORS.text,
                  }}
                >
                  {reservationCode}
                </div>
              </div>
            ) : null}
          </div>

          {completedItems.length > 0 ? (
            <div
              style={{
                padding: 20,
                borderRadius: 24,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Reservation Summary
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 0",
                      borderTop: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 16,
                        overflow: "hidden",
                        background: COLORS.bgSoft,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <img
                        src={item.imageSrc || "/images/table-preview.jpg"}
                        alt={`${item.zoneName} preview`}
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
                          fontSize: 16,
                          fontWeight: 900,
                          color: COLORS.text,
                        }}
                      >
                        {item.zoneName}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: COLORS.textMuted,
                        }}
                      >
                        {item.section} · {formatDate(item.date)} · {item.partySize} guests ·{" "}
                        {item.session}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: COLORS.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {money(item.price)}
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    paddingTop: 12,
                    marginTop: 4,
                    borderTop: `1px solid ${COLORS.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 16,
                    fontWeight: 900,
                    color: COLORS.text,
                  }}
                >
                  <span>Total paid</span>
                  <span>{money(pricing.total)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div
            style={{
              padding: 20,
              borderRadius: 24,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Save Your Details
            </div>

            <div
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: COLORS.textSoft,
                marginBottom: 16,
              }}
            >
              Add your email or phone so you can retrieve this reservation later and get updates more easily.
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  style={inputStyle}
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  style={inputStyle}
                />
              </div>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                autoComplete="email"
                style={inputStyle}
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
                type="tel"
                autoComplete="tel"
                style={inputStyle}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: COLORS.textSoft,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>Send me reservation updates and occasional event offers.</span>
              </label>

              {savedMessage ? (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: COLORS.successSoft,
                    border: "1px solid #BBF7D0",
                    color: COLORS.success,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {savedMessage}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                <button
                  onClick={handleSaveGuestInfo}
                  style={{
                    flex: 1,
                    height: 42,
                    border: "none",
                    borderRadius: 16,
                    background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(14,165,233,0.22)",
                  }}
                >
                  Save Details
                </button>

                <button
                  onClick={() => router.push("/book")}
                  style={{
                    flex: 1,
                    height: 42,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 16,
                    background: COLORS.card,
                    color: COLORS.primaryHover,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Book another experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}