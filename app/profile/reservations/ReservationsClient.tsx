// app/profile/reservations/ReservationsClient.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import MobileShell from "@/app/components/booking/MobileShell"
import { supabase } from "@/app/lib/supabase"

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
  gold: "#F59E0B",
  goldSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
} as const

type ReservationQrCode = {
  id: string
  reservationId: string | null
  bookingCode: string
  itemType: string
  itemRefId: string | null
  label: string | null
  qrValue: string
  status: string
  scannedAt: string | null
}

type RetrievedReservation = {
  id: string
  reservationCode: string
  status: string
  guestName: string | null
  email: string | null
  phone: string | null
  userId: string | null
  eventTitle: string
  eventSlug: string | null
  eventDate: string | null
  zoneName: string | null
  zoneCode: string | null
  guestCount: number | null
  session: string | null
  amountPaid: number
  confirmedAt: string | null
  createdAt: string | null
  qrCodes?: ReservationQrCode[]
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3Z" />
      <path d="M9 9h6" />
      <path d="M9 15h6" />
    </svg>
  )
}

function formatReservationDate(value: string | null) {
  if (!value) return "Date TBA"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date TBA"

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(date)
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0)
}

function statusStyle(status: string) {
  if (status === "confirmed") {
    return {
      background: COLORS.accentSoft,
      color: "#0F766E",
      label: "Confirmed",
    }
  }

  if (status === "pending") {
    return {
      background: COLORS.goldSoft,
      color: "#B45309",
      label: "Pending",
    }
  }

  if (status === "checked_in") {
    return {
      background: COLORS.primarySoft,
      color: COLORS.primaryHover,
      label: "Checked In",
    }
  }

  return {
    background: COLORS.cardSoft,
    color: COLORS.textMuted,
    label: status || "Unknown",
  }
}

function ReservationCard({
  reservation,
  onShowQr,
}: {
  reservation: RetrievedReservation
  onShowQr: () => void
}) {
  const status = statusStyle(reservation.status)
  const canShowQr =
    reservation.status === "confirmed" && Boolean(reservation.reservationCode)

  return (
    <div
      style={{
        borderRadius: 24,
        border: `1px solid ${COLORS.border}`,
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 14px 30px rgba(15,23,42,0.07)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={canShowQr ? onShowQr : undefined}
        disabled={!canShowQr}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 16,
          textAlign: "left",
          cursor: canShowQr ? "pointer" : "default",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 0.9,
                color: COLORS.textMuted,
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              {reservation.reservationCode || "Reservation"}
            </div>

            <div
              style={{
                fontSize: 19,
                lineHeight: 1.15,
                fontWeight: 950,
                color: COLORS.text,
                letterSpacing: -0.5,
              }}
            >
              {reservation.eventTitle || "Event"}
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 13,
                lineHeight: 1.45,
                color: COLORS.textSoft,
              }}
            >
              {formatReservationDate(reservation.eventDate)}
            </div>
          </div>

          <div
            style={{
              padding: "7px 9px",
              borderRadius: 999,
              background: status.background,
              color: status.color,
              fontSize: 11,
              fontWeight: 900,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            {status.label}
          </div>
        </div>

        <div
          style={{
            marginTop: 13,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 18,
              background: COLORS.bgSoft,
              border: `1px solid ${COLORS.borderSoft}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: COLORS.textMuted,
                marginBottom: 4,
              }}
            >
              Location
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: COLORS.text,
              }}
            >
              {reservation.zoneName || reservation.zoneCode || "TBA"}
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 18,
              background: COLORS.bgSoft,
              border: `1px solid ${COLORS.borderSoft}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: COLORS.textMuted,
                marginBottom: 4,
              }}
            >
              Paid
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: COLORS.text,
              }}
            >
              {money(reservation.amountPaid)}
            </div>
          </div>
        </div>

        {canShowQr ? (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              //borderRadius: 16,
              //background: COLORS.primarySoft,
              color: COLORS.primaryHover,
              fontSize: 13,
              fontWeight: 900,
              textAlign: "center",
            }}
          >
            Show QR Code
          </div>
        ) : null}
      </button>
    </div>
  )
}

function QrModal({
  reservation,
  onClose,
}: {
  reservation: RetrievedReservation | null
  onClose: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [reservation?.id])

  if (!reservation) return null

  const fallbackQr: ReservationQrCode[] = reservation.reservationCode
    ? [
        {
          id: reservation.id,
          reservationId: reservation.id,
          bookingCode: reservation.reservationCode,
          itemType: "reservation",
          itemRefId: reservation.id,
          label: reservation.zoneName || reservation.zoneCode || "Reservation",
          qrValue: `GuestLyst://reservation/${reservation.reservationCode}`,
          status: reservation.status,
          scannedAt: null,
        },
      ]
    : []

  const qrCodes =
    reservation.qrCodes && reservation.qrCodes.length > 0
      ? reservation.qrCodes
      : fallbackQr

  const activeQr = qrCodes[activeIndex] || qrCodes[0]

  if (!activeQr) return null

  function goPrev() {
    setActiveIndex((current) =>
      current === 0 ? qrCodes.length - 1 : current - 1
    )
  }

  function goNext() {
    setActiveIndex((current) =>
      current === qrCodes.length - 1 ? 0 : current + 1
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 140,
        background: "rgba(2,6,23,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 370,
          borderRadius: 30,
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 -22px 60px rgba(0,0,0,0.24)",
          padding: 22,
          textAlign: "center",
        }}
      >
        {/* <div
          style={{
            width: 46,
            height: 5,
            borderRadius: 999,
            background: "#CBD5E1",
            margin: "0 auto 16px",
          }}
        /> */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close QR code"
          style={{
            position: "absolute",
            right: 18,
            top: 18,
            width: 38,
            height: 38,
            borderRadius: 999,
            border: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.92)",
            color: COLORS.text,
            fontSize: 22,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: COLORS.textMuted,
            marginBottom: 8,
          }}
        >
          Ready to Scan
        </div>

        <div
          style={{
            fontSize: 23,
            fontWeight: 950,
            color: COLORS.text,
            letterSpacing: -0.6,
            marginBottom: 6,
          }}
        >
          {reservation.eventTitle}
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: COLORS.textSoft,
            marginBottom: 14,
          }}
        >
          {activeQr.label || reservation.zoneName || reservation.zoneCode || "Reservation"}
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 24,
            background: "#FFFFFF",
            border: `1px solid ${COLORS.border}`,
            display: "inline-grid",
            placeItems: "center",
            marginBottom: 14,
            boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
          }}
        >
          <QRCodeSVG
            value={activeQr.qrValue}
            size={220}
            bgColor="#FFFFFF"
            fgColor={COLORS.text}
            level="M"
            includeMargin
          />
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: COLORS.textMuted,
            marginBottom: 4,
          }}
        >
          {activeQr.itemType === "pass" ? "Pass QR" : "Reservation Code"}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 950,
            letterSpacing: 1,
            color: COLORS.text,
            wordBreak: "break-word",
          }}
        >
          {activeQr.itemType === "pass"
            ? activeQr.qrValue.replace("GuestLyst://pass/", "")
            : reservation.reservationCode}
        </div>

        {qrCodes.length > 1 ? (
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 14,
            }}
          >
            <button
              type="button"
              onClick={goPrev}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.primaryHover,
                fontSize: 22,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ‹
            </button>

            <div
              style={{
                minWidth: 58,
                fontSize: 13,
                fontWeight: 900,
                color: COLORS.textMuted,
              }}
            >
              {activeIndex + 1} of {qrCodes.length}
            </div>

            <button
              type="button"
              onClick={goNext}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.primaryHover,
                fontSize: 22,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function RetrieveModal({
  open,
  onClose,
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  retrieving,
  linking,
  isSignedIn,
  onRetrieve,
  onLink,
  foundReservations,
  onShowQr,
}: {
  open: boolean
  onClose: () => void
  email: string
  phone: string
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  retrieving: boolean
  linking: boolean
  isSignedIn: boolean
  onRetrieve: () => void
  onLink: (reservation: RetrievedReservation) => void
  foundReservations: RetrievedReservation[]
  onShowQr: (reservation: RetrievedReservation) => void
}) {
  if (!open) return null

  const canSubmit = Boolean(email.trim() || phone.trim())

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 131,
        background: "rgba(15,23,42,0.34)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 410,
          maxHeight: "86vh",
          overflow: "hidden",
          borderRadius: 30,
          background: "rgba(255,255,255,0.96)",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 28px 70px rgba(15,23,42,0.26)",
        }}
      >
        <div
          style={{
            padding: "18px 18px 14px",
            borderBottom: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 1,
                  color: COLORS.text,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Retrieve Reservations
              </div>

              {/* <div
                style={{
                  fontSize: 25,
                  fontWeight: 950,
                  color: COLORS.text,
                  letterSpacing: -0.7,
                  lineHeight: 1.08,
                }}
              >
                Find your bookings
              </div> */}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close retrieve modal"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.text,
                fontSize: 22,
                fontWeight: 800,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              lineHeight: 1.55,
              color: COLORS.textSoft,
            }}
          >
            Enter the email or phone number used at checkout. You can enter both to narrow the search.
          </div>
        </div>

        <div
          style={{
            padding: 18,
            overflowY: "auto",
            maxHeight: "calc(86vh - 118px)",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <input
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Email address"
              type="email"
              autoComplete="email"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.text,
                fontSize: 15,
                fontWeight: 750,
                padding: "0 14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <input
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Mobile number"
              type="tel"
              autoComplete="tel"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.92)",
                color: COLORS.text,
                fontSize: 15,
                fontWeight: 750,
                padding: "0 14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={onRetrieve}
              disabled={!canSubmit || retrieving}
              style={{
                width: "100%",
                height: 52,
                border: "none",
                borderRadius: 18,
                background:
                  !canSubmit || retrieving
                    ? "linear-gradient(180deg, #94A3B8 0%, #64748B 100%)"
                    : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 900,
                cursor: !canSubmit || retrieving ? "not-allowed" : "pointer",
                boxShadow: "0 12px 22px rgba(14,165,233,0.20)",
              }}
            >
              {retrieving ? "Searching..." : "Search Reservations"}
            </button>
          </div>

          {foundReservations.length > 0 ? (
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Found Reservations
              </div>

              {foundReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  style={{
                    padding: 13,
                    borderRadius: 18,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bgSoft,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 950,
                      color: COLORS.text,
                      marginBottom: 4,
                    }}
                  >
                    {reservation.eventTitle}
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      color: COLORS.textSoft,
                    }}
                  >
                    {reservation.reservationCode} ·{" "}
                    {reservation.zoneName || reservation.zoneCode || "Reservation"}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onShowQr(reservation)}
                      style={{
                        width: "100%",
                        height: 44,
                        borderRadius: 15,
                        border: `1px solid ${COLORS.border}`,
                        background: "rgba(255,255,255,0.92)",
                        color: COLORS.primaryHover,
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Show QR
                    </button>

                    <button
                      type="button"
                      onClick={() => onLink(reservation)}
                      disabled={linking}
                      style={{
                        width: "100%",
                        height: 44,
                        border: "none",
                        borderRadius: 15,
                        background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: linking ? "not-allowed" : "pointer",
                      }}
                    >
                      {linking
                        ? "Saving..."
                        : isSignedIn
                          ? "Link"
                          : "Sign In"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function ReservationsClient() {
  const router = useRouter()

  const [mode, setMode] = useState<"saved" | "retrieve">("saved")
  const [authMode, setAuthMode] = useState<"checking" | "guest" | "signed-in">("checking")
  const [reservations, setReservations] = useState<RetrievedReservation[]>([])
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [retrieveOpen, setRetrieveOpen] = useState(false)
  const [retrieveEmail, setRetrieveEmail] = useState("")
const [retrievePhone, setRetrievePhone] = useState("")
const [retrievedReservations, setRetrievedReservations] = useState<RetrievedReservation[]>([])
  const [retrievedReservation, setRetrievedReservation] = useState<RetrievedReservation | null>(null)
  const [qrReservation, setQrReservation] = useState<RetrievedReservation | null>(null)
  const [retrieving, setRetrieving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const isSignedIn = authMode === "signed-in"

  useEffect(() => {
    let mounted = true

    async function loadAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (user) {
        setAuthMode("signed-in")
      } else {
        setAuthMode("guest")
      }
    }

    loadAuth()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (authMode === "signed-in") {
      loadSavedReservations()
    } else {
      setReservations([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode])

  useEffect(() => {
    if (mode === "retrieve") {
      setRetrieveOpen(true)
    }
  }, [mode])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || ""
  }

  async function loadSavedReservations() {
    setLoadingReservations(true)
    setErrorMessage("")

    try {
      const token = await getAccessToken()

      const response = await fetch("/api/profile/reservations", {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load reservations.")
      }

      setReservations(data?.reservations || [])
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load reservations."
      )
    } finally {
      setLoadingReservations(false)
    }
  }

  async function handleRetrieve() {
  setRetrieving(true)
  setErrorMessage("")
  setMessage("")
  setRetrievedReservations([])

  try {
    const response = await fetch("/api/reservations/retrieve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: retrieveEmail,
        phone: retrievePhone,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || "Unable to retrieve reservations.")
    }

    const foundReservations = data?.reservations || []
    setRetrievedReservations(foundReservations)
    setMessage(
      foundReservations.length === 1
        ? "1 reservation found."
        : `${foundReservations.length} reservations found.`
    )
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : "Unable to retrieve reservations."
    )
  } finally {
    setRetrieving(false)
  }
}

  async function handleLinkReservation(reservation: RetrievedReservation) {
  const contact = retrieveEmail.trim() || retrievePhone.trim()

  if (!contact) {
    setErrorMessage("Email or phone is required to link this reservation.")
    return
  }

  if (!reservation.reservationCode) {
    setErrorMessage("This reservation is missing a reservation code.")
    return
  }

  if (!isSignedIn) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "gf-pending-reservation-claim",
        JSON.stringify({
          reservationCode: reservation.reservationCode,
          contact,
        })
      )
    }

    router.push(`/login?next=${encodeURIComponent("/profile/reservations")}`)
    return
  }

  setLinking(true)
  setErrorMessage("")
  setMessage("")

  try {
    const token = await getAccessToken()

    const response = await fetch("/api/reservations/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        reservationCode: reservation.reservationCode,
        contact,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || "Unable to link reservation.")
    }

    setMessage("Reservation linked to your profile.")
    setMode("saved")
    await loadSavedReservations()
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : "Unable to link reservation."
    )
  } finally {
    setLinking(false)
  }
}

  const emptyMessage = useMemo(() => {
    if (authMode === "checking") return "Checking account..."
    if (!isSignedIn) {
      return "Sign in to save reservations to your profile, or use Retrieve to look up a guest booking."
    }
    return "No saved reservations yet. Use Retrieve to link a guest purchase."
  }, [authMode, isSignedIn])

  return (
    <MobileShell fullBleed>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
          color: COLORS.text,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: "0 auto",
            padding: "14px 14px calc(env(safe-area-inset-bottom, 0px) + 28px)",
            boxSizing: "border-box",
            minHeight: "100dvh",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              paddingTop: 4,
              paddingBottom: 14,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,251,252,0.92) 78%, rgba(247,251,252,0) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <button
                onClick={() => router.push("/profile")}
                aria-label="Back to profile"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.86)",
                  color: COLORS.text,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: "0 10px 22px rgba(15,23,42,0.10)",
                }}
              >
                <BackIcon />
              </button>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 50,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.78)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 14px 28px rgba(15,23,42,0.12)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: COLORS.primarySoft,
                    color: COLORS.primaryHover,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <TicketIcon />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: COLORS.textMuted,
                    }}
                  >
                    RESERVATIONS
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section
            style={{
              borderRadius: 30,
              padding: 18,
              background: "rgba(255,255,255,0.72)",
              border: `1px solid ${COLORS.borderSoft}`,
              boxShadow: "0 24px 60px rgba(15,23,42,0.10)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.05,
                fontWeight: 950,
                letterSpacing: -0.9,
                color: COLORS.text,
              }}
            >
              Reservation Wallet
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color: COLORS.textSoft,
              }}
            >
              View your purchases, retrieve non-linked purchases, and open QR codes when you are ready to scan.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 18,
                padding: 4,
                borderRadius: 999,
                background: "rgba(241,245,249,0.82)",
                border: `1px solid ${COLORS.borderSoft}`,
              }}
            >
              <button
                type="button"
                onClick={() => setMode("saved")}
                style={{
                  height: 40,
                  borderRadius: 999,
                  border: "none",
                  background: mode === "saved" ? "#FFFFFF" : "transparent",
                  color: mode === "saved" ? COLORS.text : COLORS.textMuted,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow:
                    mode === "saved"
                      ? "0 8px 18px rgba(15,23,42,0.08)"
                      : "none",
                }}
              >
                Purchased
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("retrieve")
                  setRetrieveOpen(true)
                }}
                style={{
                  height: 40,
                  borderRadius: 999,
                  border: "none",
                  background: mode === "retrieve" ? "#FFFFFF" : "transparent",
                  color: mode === "retrieve" ? COLORS.text : COLORS.textMuted,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow:
                    mode === "retrieve"
                      ? "0 8px 18px rgba(15,23,42,0.08)"
                      : "none",
                }}
              >
                Retrieve
              </button>
            </div>
          </section>

          {message ? (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid rgba(20,184,166,0.18)`,
                background: COLORS.accentSoft,
                color: "#0F766E",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid rgba(239,68,68,0.20)`,
                background: COLORS.dangerSoft,
                color: "#B91C1C",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <section
            style={{
              marginTop: 16,
              display: "grid",
              gap: 14,
            }}
          >
            {loadingReservations ? (
              <div
                style={{
                  padding: 18,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.78)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textSoft,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Loading reservations...
              </div>
            ) : reservations.length > 0 ? (
              reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onShowQr={() => setQrReservation(reservation)}
                />
              ))
            ) : (
              <div
                style={{
                  padding: 20,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.78)",
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 12px 26px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 950,
                    color: COLORS.text,
                    marginBottom: 8,
                  }}
                >
                  No reservations shown
                </div>

                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: COLORS.textSoft,
                    marginBottom: 14,
                  }}
                >
                  {emptyMessage}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode("retrieve")
                    setRetrieveOpen(true)
                  }}
                  style={{
                    width: "100%",
                    height: 50,
                    border: "none",
                    borderRadius: 18,
                    background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 12px 22px rgba(14,165,233,0.20)",
                  }}
                >
                  Retrieve Reservation
                </button>
              </div>
            )}

            {retrievedReservations.length > 0 && !isSignedIn ? (
              <>
                {retrievedReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onShowQr={() => setQrReservation(reservation)}
                  />
                ))}
              </>
            ) : null}
          </section>

          <RetrieveModal
            open={retrieveOpen}
            onClose={() => setRetrieveOpen(false)}
            email={retrieveEmail}
            phone={retrievePhone}
            onEmailChange={setRetrieveEmail}
            onPhoneChange={setRetrievePhone}
            retrieving={retrieving}
            linking={linking}
            isSignedIn={isSignedIn}
            onRetrieve={handleRetrieve}
            onLink={handleLinkReservation}
            foundReservations={retrievedReservations}
            onShowQr={(reservation) => setQrReservation(reservation)}
          />

          <QrModal
            reservation={qrReservation}
            onClose={() => setQrReservation(null)}
          />
        </div>
      </div>
    </MobileShell>
  )
}