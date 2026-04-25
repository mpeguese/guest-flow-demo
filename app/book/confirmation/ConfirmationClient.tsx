// app/book/confirmation/ConfirmationClient.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import MobileShell from "@/app/components/booking/MobileShell"
import { BookingCartItem, useBookingCart } from "@/app/lib/booking-cart"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import {
  getLatestReservation,
  saveLatestReservation,
  updateLatestReservationGuestInfo,
  buildItemQrCode,
  inferReservationItemType,
  normalizeReservationItem,
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

type CompletedItem = BookingCartItem & {
  itemType?: "zone" | "pass"
  productId?: string
  qrCode?: string
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default function ConfirmationClient() {
  const router = useRouter()
  const { items, clearCart } = useBookingCart()

  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([])
  const [reservationCode, setReservationCode] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const [activePassIndex, setActivePassIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [hasSuccessfulReturn, setHasSuccessfulReturn] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [redirectStatus, setRedirectStatus] = useState("")
  const [confirmationError, setConfirmationError] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)

  const didInitializeRef = useRef(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchDeltaXRef = useRef(0)

  useEffect(() => {
    setHydrated(true)

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const paymentIntent = params.get("payment_intent") || ""
      const status = params.get("redirect_status") || ""
      setPaymentIntentId(paymentIntent)
      setRedirectStatus(status)
      setHasSuccessfulReturn(!!paymentIntent || status === "succeeded")
    }
  }, [])

  useEffect(() => {
    if (!hydrated || didInitializeRef.current) return

    async function initializeConfirmation() {
      const existing = getLatestReservation()

      if (hasSuccessfulReturn && items.length > 0) {
        try {
          setConfirmationError("")
          setIsConfirming(true)

          const confirmResponse = await fetch("/api/reservations/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntent: paymentIntentId || null,
              redirectStatus: redirectStatus || null,
              items: items.map((item) => ({
                id: item.id,
                itemType: item.itemType,
                zoneId: item.zoneId,
                zoneName: item.zoneName,
                section: item.section,
                date: item.date,
                partySize: item.partySize,
                session: item.session,
                price: item.price,
                reservationId: item.reservationId,
                holdToken: item.holdToken,
                expiresAt: item.expiresAt,
              })),
            }),
          })

          const confirmData = await confirmResponse.json().catch(() => null)

          if (!confirmResponse.ok) {
            throw new Error(confirmData?.error || "Unable to confirm reservation.")
          }

          const normalizedItems = items.map((item, index) =>
            normalizeReservationItem({
              id: item.id,
              itemType: item.itemType,
              productId: item.productId,
              zoneId: item.zoneId,
              zoneName: item.zoneName,
              section: item.section,
              date: item.date,
              partySize: item.partySize,
              session: item.session,
              price: item.price,
              imageSrc: item.imageSrc,
              reservationId: item.reservationId,
              holdToken: item.holdToken,
              expiresAt: item.expiresAt,
              qrCode: buildItemQrCode(
                `${item.id}-${index}`,
                item.itemType === "pass" ? "pass" : "zone"
              ),
            })
          ) as CompletedItem[]

          const subtotal = normalizedItems.reduce((sum, item) => sum + item.price, 0)
          const pricing = calculateBookingPricing(subtotal)

          saveLatestReservation({
            reservationCode: confirmData?.reservationCode || "",
            createdAt: new Date().toISOString(),
            subtotal: pricing.subtotal,
            tax: pricing.tax,
            processingFee: pricing.processingFee,
            total: pricing.total,
            items: normalizedItems.map((item) => ({
              id: item.id,
              itemType: item.itemType,
              productId: item.productId,
              zoneId: item.zoneId,
              zoneName: item.zoneName,
              section: item.section,
              date: item.date,
              partySize: item.partySize,
              session: item.session,
              price: item.price,
              imageSrc: item.imageSrc,
              qrCode: item.qrCode,
              reservationId: item.reservationId,
              holdToken: item.holdToken,
              expiresAt: item.expiresAt,
            })),
          })

          setCompletedItems(normalizedItems)
          setReservationCode(confirmData?.reservationCode || "")
          clearCart()
          didInitializeRef.current = true
          return
        } catch (error) {
          setConfirmationError(
            error instanceof Error ? error.message : "Unable to confirm reservation."
          )
          didInitializeRef.current = true
          return
        } finally {
          setIsConfirming(false)
        }
      }

      if (existing && existing.items?.length > 0) {
        setCompletedItems(
          existing.items.map((item) => normalizeReservationItem(item)) as CompletedItem[]
        )
        setReservationCode(existing.reservationCode)

        if (existing.guestInfo) {
          setFirstName(existing.guestInfo.firstName || "")
          setLastName(existing.guestInfo.lastName || "")
          setEmail(existing.guestInfo.email || "")
          setPhone(existing.guestInfo.phone || "")
          setMarketingOptIn(!!existing.guestInfo.marketingOptIn)
        }

        didInitializeRef.current = true
        return
      }

      didInitializeRef.current = true
    }

    initializeConfirmation()
  }, [hydrated, hasSuccessfulReturn, items, clearCart, paymentIntentId, redirectStatus])

  const subtotal = useMemo(
    () => completedItems.reduce((sum, item) => sum + item.price, 0),
    [completedItems]
  )

  const pricing = useMemo(() => calculateBookingPricing(subtotal), [subtotal])

  const reservationQrValue = useMemo(() => {
    if (!reservationCode) return ""
    return `GuestLyst://reservation/${reservationCode}`
  }, [reservationCode])

  const passItems = useMemo(
    () => completedItems.filter((item) => inferReservationItemType(item) === "pass"),
    [completedItems]
  )

  const zoneItems = useMemo(
    () => completedItems.filter((item) => inferReservationItemType(item) === "zone"),
    [completedItems]
  )

  const hasPasses = passItems.length > 0
  const hasZones = zoneItems.length > 0
  const activePass = passItems[activePassIndex] || null

  const headline =
    hasPasses && !hasZones
      ? "Your tickets are ready"
      : !hasPasses && hasZones
      ? "Your reservation is confirmed"
      : "Your booking is confirmed"

  const subcopy =
    hasPasses && !hasZones
      ? "Your entry passes are ready to scan. Swipe through each pass below and keep the QR ID visible for quick door lookup."
      : !hasPasses && hasZones
      ? "Your reservation is confirmed. Show this QR code on arrival for your booked hotspot or table access."
      : "Your reservation and entry passes are ready. Use the reservation QR for hotspot or table access, then swipe through individual entry passes below."

  useEffect(() => {
    if (activePassIndex > passItems.length - 1) {
      setActivePassIndex(0)
    }
  }, [activePassIndex, passItems.length])

  function goToPreviousPass() {
    if (passItems.length <= 1) return
    setActivePassIndex((current) =>
      current === 0 ? passItems.length - 1 : current - 1
    )
  }

  function goToNextPass() {
    if (passItems.length <= 1) return
    setActivePassIndex((current) =>
      current === passItems.length - 1 ? 0 : current + 1
    )
  }

  function handlePassTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = e.touches[0]?.clientX ?? null
    touchDeltaXRef.current = 0
  }

  function handlePassTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartXRef.current == null) return
    const currentX = e.touches[0]?.clientX ?? 0
    touchDeltaXRef.current = currentX - touchStartXRef.current
  }

  function handlePassTouchEnd() {
    const delta = touchDeltaXRef.current

    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goToNextPass()
      } else {
        goToPreviousPass()
      }
    }

    touchStartXRef.current = null
    touchDeltaXRef.current = 0
  }

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

  if (isConfirming) {
    return (
      <MobileShell>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 52%, #FFF4E5 100%)",
            margin: "-16px",
            padding: "20px 16px 40px",
            color: COLORS.text,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              padding: 24,
              borderRadius: 24,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 18px 36px rgba(15,23,42,0.06)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: COLORS.text,
                marginBottom: 8,
              }}
            >
              Finalizing your booking...
            </div>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: COLORS.textSoft,
              }}
            >
              We’re confirming your reservation and preparing your QR codes.
            </div>
          </div>
        </div>
      </MobileShell>
    )
  }

  if (confirmationError) {
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
                borderRadius: 24,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 18px 36px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: COLORS.text,
                  marginBottom: 10,
                }}
              >
                We could not finalize your reservation
              </div>
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: COLORS.textSoft,
                  marginBottom: 16,
                }}
              >
                {confirmationError}
              </div>
              {/* <button
                onClick={() => router.push("/book/details")}
                style={{
                  width: "100%",
                  height: 52,
                  border: "none",
                  borderRadius: 18,
                  background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Return to checkout
              </button> */}
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%",
                  height: 52,
                  border: "none",
                  borderRadius: 18,
                  background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Try confirmation again
              </button>
            </div>
          </div>
        </div>
      </MobileShell>
    )
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
              Confirmed
            </div>

            <div
              style={{
                fontSize: 32,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: -0.9,
                color: COLORS.text,
                marginBottom: 10,
              }}
            >
              {headline}
            </div>

            <p
              style={{
                marginTop: 0,
                color: COLORS.textSoft,
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: hasZones ? 18 : 0,
              }}
            >
              {subcopy}
            </p>

            {hasZones && reservationQrValue ? (
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
                  value={reservationQrValue}
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
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    color: COLORS.text,
                    textAlign: "center",
                  }}
                >
                  {reservationCode}
                </div>
              </div>
            ) : null}
          </div>

          {hasPasses && activePass ? (
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
                  marginBottom: 10,
                }}
              >
                Entry Passes
              </div>

              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: COLORS.textSoft,
                  marginBottom: 16,
                }}
              >
                Swipe left or right to move between passes.
              </div>

              <div
                onTouchStart={handlePassTouchStart}
                onTouchMove={handlePassTouchMove}
                onTouchEnd={handlePassTouchEnd}
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.border}`,
                  background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                  boxShadow: "0 14px 28px rgba(15,23,42,0.08)",
                  touchAction: "pan-y",
                }}
              >
                <div
                  style={{
                    padding: 18,
                    display: "grid",
                    gap: 14,
                    justifyItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 1,
                          color: COLORS.textMuted,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        Pass {activePassIndex + 1} of {passItems.length}
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: COLORS.text,
                          letterSpacing: -0.5,
                        }}
                      >
                        {activePass.zoneName}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 14,
                          color: COLORS.textSoft,
                        }}
                      >
                        {formatDate(activePass.date)} · {activePass.section}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: 14,
                        background:
                          activePass.price === 0 ? COLORS.accentSoft : COLORS.coralSoft,
                        color: activePass.price === 0 ? "#0F766E" : COLORS.coral,
                        fontSize: 13,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {activePass.price === 0 ? "Free" : money(activePass.price)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 14,
                      borderRadius: 20,
                      background: "#FFFFFF",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <QRCodeSVG
                      value={`GuestLyst://pass/${activePass.qrCode || activePass.id}`}
                      size={186}
                      bgColor="#FFFFFF"
                      fgColor={COLORS.text}
                      level="M"
                      includeMargin
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: COLORS.textMuted,
                      textTransform: "uppercase",
                    }}
                  >
                    QR ID Number
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: COLORS.text,
                      textAlign: "center",
                    }}
                  >
                    {activePass.qrCode}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 14,
                      marginTop: 2,
                    }}
                  >
                    <button
                      onClick={goToPreviousPass}
                      aria-label="Previous pass"
                      style={{
                        border: "none",
                        background: "transparent",
                        color: COLORS.primaryHover,
                        width: 28,
                        height: 28,
                        padding: 0,
                        display: "grid",
                        placeItems: "center",
                        cursor: passItems.length > 1 ? "pointer" : "default",
                        opacity: passItems.length > 1 ? 1 : 0.35,
                      }}
                    >
                      <ChevronLeftIcon />
                    </button>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {passItems.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => setActivePassIndex(index)}
                          aria-label={`View pass ${index + 1}`}
                          style={{
                            width: 8,
                            height: 8,
                            padding: 0,
                            borderRadius: 999,
                            border: "none",
                            background:
                              index === activePassIndex
                                ? COLORS.primaryHover
                                : "#CBD5E1",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={goToNextPass}
                      aria-label="Next pass"
                      style={{
                        border: "none",
                        background: "transparent",
                        color: COLORS.primaryHover,
                        width: 28,
                        height: 28,
                        padding: 0,
                        display: "grid",
                        placeItems: "center",
                        cursor: passItems.length > 1 ? "pointer" : "default",
                        opacity: passItems.length > 1 ? 1 : 0.35,
                      }}
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

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
                Purchase Summary
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
                        {item.section} · {formatDate(item.date)} · {item.partySize} guest
                        {item.partySize === "1" ? "" : "s"} · {item.session}
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