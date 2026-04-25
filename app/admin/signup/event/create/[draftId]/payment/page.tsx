// app/admin/signup/event/create/[draftId]/payment/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { useParams, useRouter } from "next/navigation"

type EventMode = "tickets" | "locations" | "both"
type InventoryStatus = "draft" | "live" | "scheduled" | "ended"
type DiscountType = "none" | "fixed" | "percentage"
type AttributionMode = "none" | "promoter"
type PromoAppliesTo =
  | "whole_event"
  | "all_tickets"
  | "selected_tickets"
  | "all_locations"
  | "selected_locations"

type PayoutMethod = "wire" | "zelle" | "stripe"
type StripeOnboardingStatus = "not_connected" | "pending" | "ready"

type TicketItem = {
  id: string
  name: string
  description: string
  price: string
  quantity: string
  quantityVisible: boolean
  status: InventoryStatus
  salesStart: string
  salesEnd: string
}

type LocationItem = {
  id: string
  name: string
  description: string
  price: string
  capacity: string
  quantityVisible: boolean
  status: InventoryStatus
  bookingStart: string
  bookingEnd: string
}

type PromoCodeItem = {
  id: string
  code: string
  discountType: DiscountType
  discountValue: string
  attributionMode: AttributionMode
  promoterName: string
  appliesTo: PromoAppliesTo
  selectedTicketIds: string[]
  selectedLocationIds: string[]
  usageLimit: string
  activeStart: string
  activeEnd: string
}

type PaymentDetails = {
  payoutMethod: PayoutMethod
  wire: {
    accountName: string
    bankName: string
    routingNumber: string
    accountNumber: string
    swiftCode: string
    bankAddress: string
    acknowledgeFees: boolean
  }
  zelle: {
    recipientName: string
    payoutContact: string
    acknowledgeLimit: boolean
  }
  stripe: {
    accountId: string
    onboardingStatus: StripeOnboardingStatus
  }
}

type EventDraftRecord = {
  id: string
  status: "draft"
  createdAt: string
  updatedAt: string
  basics: {
    eventMode: EventMode
    eventType: "single" | "series"
    eventTitle: string
    eventDate: string
    seriesEndDate: string
    startTime: string
    endTime: string
    description: string
    location: string
    flyerName: string
    flyerPreviewUrl: string
    videoName: string
    videoPreviewUrl: string
  }
  booking: {
    tickets: TicketItem[]
    locations: LocationItem[]
    promoCodes: PromoCodeItem[]
  }
  payment: PaymentDetails
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

type SegmentedOption<T extends string> = {
  value: T
  label: string
}

function SlidingPillGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const optionCount = options.length
  const widthPercent = 100 / optionCount

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.20)",
        background: "rgba(255,255,255,0.28)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
        padding: 6,
        display: "flex",
        gap: 6,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 6,
          bottom: 6,
          left: `calc(${activeIndex * widthPercent}% + 6px)`,
          width: `calc(${widthPercent}% - 12px)`,
          borderRadius: 999,
          background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
          boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
          transition: "left 220ms ease, width 220ms ease",
        }}
      />

      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              height: 44,
              borderRadius: 999,
              border: "none",
              background: "transparent",
              color: active ? "#FFFFFF" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              transition: "color 160ms ease",
              minWidth: 0,
              whiteSpace: "nowrap",
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 62,
        height: 36,
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.16)",
        background: checked
          ? "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)"
          : "rgba(255,255,255,0.82)",
        boxShadow: checked
          ? "0 10px 24px rgba(15,23,42,0.12)"
          : "inset 0 1px 0 rgba(255,255,255,0.68)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 29 : 3,
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "#ffffff",
          transition: "left 180ms ease",
          boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
        }}
      />
    </button>
  )
}

function emptyPayment(): PaymentDetails {
  return {
    payoutMethod: "stripe",
    wire: {
      accountName: "",
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      swiftCode: "",
      bankAddress: "",
      acknowledgeFees: false,
    },
    zelle: {
      recipientName: "",
      payoutContact: "",
      acknowledgeLimit: false,
    },
    stripe: {
      accountId: "",
      onboardingStatus: "not_connected",
    },
  }
}

function readDraft(draftId: string): EventDraftRecord | null {
  const raw = localStorage.getItem(`GuestLyst:eventDraft:${draftId}`)
  return raw ? JSON.parse(raw) : null
}

function writeDraft(record: EventDraftRecord) {
  localStorage.setItem(`GuestLyst:eventDraft:${record.id}`, JSON.stringify(record))
}

function normalizePayment(payment: Partial<PaymentDetails> | undefined): PaymentDetails {
  const base = emptyPayment()

  return {
    payoutMethod: payment?.payoutMethod || base.payoutMethod,
    wire: {
      ...base.wire,
      ...(payment?.wire ?? {}),
    },
    zelle: {
      ...base.zelle,
      ...(payment?.zelle ?? {}),
    },
    stripe: {
      ...base.stripe,
      ...(payment?.stripe ?? {}),
    },
  }
}

function normalizeDraft(stored: any): EventDraftRecord {
  return {
    ...stored,
    payment: normalizePayment(stored?.payment),
  }
}

export default function AdminSignupEventPaymentPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const draftId = Array.isArray(params?.draftId) ? params.draftId[0] : params?.draftId ?? ""

  const [draft, setDraft] = useState<EventDraftRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)")
    const update = () => setIsMobile(media.matches)

    update()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (!draftId) return

    const stored = readDraft(draftId)

    if (!stored) {
      router.replace("/admin/signup/event/create")
      return
    }

    const nextDraft = normalizeDraft(stored)
    setDraft(nextDraft)
    writeDraft(nextDraft)
    setLoading(false)
  }, [draftId, router])

  const payment = draft?.payment ?? emptyPayment()

  const payoutOptions = useMemo<SegmentedOption<PayoutMethod>[]>(
    () => [
      { value: "wire", label: "Wire" },
      { value: "zelle", label: "Zelle" },
      { value: "stripe", label: "Stripe" },
    ],
    []
  )

  const saveAndSetDraft = (nextDraft: EventDraftRecord) => {
    const record = {
      ...nextDraft,
      updatedAt: new Date().toISOString(),
    }
    setDraft(record)
    writeDraft(record)
  }

  const updatePayment = (patch: Partial<PaymentDetails>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      payment: {
        ...draft.payment,
        ...patch,
      },
    })
  }

  const updateWire = (patch: Partial<PaymentDetails["wire"]>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      payment: {
        ...draft.payment,
        wire: {
          ...draft.payment.wire,
          ...patch,
        },
      },
    })
  }

  const updateZelle = (patch: Partial<PaymentDetails["zelle"]>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      payment: {
        ...draft.payment,
        zelle: {
          ...draft.payment.zelle,
          ...patch,
        },
      },
    })
  }

  const updateStripe = (patch: Partial<PaymentDetails["stripe"]>) => {
    if (!draft) return

    saveAndSetDraft({
      ...draft,
      payment: {
        ...draft.payment,
        stripe: {
          ...draft.payment.stripe,
          ...patch,
        },
      },
    })
  }

  const handleContinue = () => {
    if (!draft) return

    const method = draft.payment.payoutMethod

    if (method === "wire") {
      const valid =
        draft.payment.wire.accountName.trim() &&
        draft.payment.wire.bankName.trim() &&
        draft.payment.wire.accountNumber.trim() &&
        draft.payment.wire.acknowledgeFees

      if (!valid) return
    }

    if (method === "zelle") {
      const valid =
        draft.payment.zelle.recipientName.trim() &&
        draft.payment.zelle.payoutContact.trim() &&
        draft.payment.zelle.acknowledgeLimit

      if (!valid) return
    }

    if (method === "stripe") {
      const valid =
        draft.payment.stripe.onboardingStatus === "pending" ||
        draft.payment.stripe.onboardingStatus === "ready"

      if (!valid) return
    }

    setSubmitting(true)
    saveAndSetDraft(draft)

    // Preview step comes next.
    router.push(`/admin/signup/event/create/${draft.id}/preview`)
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: isMobile ? "16px 12px 24px" : "24px 18px 30px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 920,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 16,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.46)",
      color: "#0F172A",
      fontSize: 19,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      boxShadow: "0 14px 30px rgba(15,23,42,0.10)",
      border: "1px solid rgba(255,255,255,0.44)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F766E",
      textDecoration: "none",
    },
    card: {
      borderRadius: isMobile ? 26 : 32,
      border: "1px solid rgba(255,255,255,0.42)",
      background: "rgba(255,255,255,0.34)",
      backdropFilter: "blur(26px)",
      WebkitBackdropFilter: "blur(26px)",
      boxShadow: "0 18px 42px rgba(15,23,42,0.10)",
      padding: isMobile ? 18 : 28,
      overflow: "hidden",
      isolation: "isolate",
    },
    intentBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "9px 14px",
      background: "rgba(56,189,248,0.12)",
      border: "1px solid rgba(56,189,248,0.16)",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#0369A1",
    },
    title: {
      marginTop: 16,
      fontSize: isMobile ? 28 : 38,
      lineHeight: 1,
      letterSpacing: "-1.2px",
      fontWeight: 900,
      color: "#020617",
      maxWidth: 620,
    },
    subtitle: {
      marginTop: 10,
      fontSize: isMobile ? 15 : 16,
      fontWeight: 800,
      color: "#334155",
      maxWidth: 640,
    },
    section: {
      marginTop: 24,
    },
    sectionLabel: {
      display: "block",
      marginBottom: 10,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748B",
    },
    block: {
      marginTop: 14,
      display: "grid",
      gap: 14,
    },
    fieldGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 14,
    },
    full: {
      gridColumn: "1 / -1",
    },
    fieldLabel: {
      display: "block",
      marginBottom: 7,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748B",
    },
    fieldShell: {
      minHeight: 52,
      width: "100%",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      boxSizing: "border-box",
      minWidth: 0,
    },
    fieldInput: {
      width: "100%",
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isMobile ? 13 : 14,
      fontWeight: 600,
      color: "#0F172A",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textareaShell: {
      width: "100%",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: 14,
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      minHeight: 92,
      border: "none",
      outline: "none",
      resize: "vertical",
      background: "transparent",
      fontSize: 14,
      fontWeight: 600,
      color: "#0F172A",
      lineHeight: 1.6,
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    helperText: {
      fontSize: 13,
      fontWeight: 700,
      color: "#475569",
      lineHeight: 1.55,
    },
    noteRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      minHeight: 56,
      borderRadius: 18,
      background: "rgba(255,255,255,0.22)",
      padding: "12px 14px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.62)",
    },
    noteTextWrap: {
      display: "grid",
      gap: 4,
      minWidth: 0,
      flex: 1,
    },
    noteTitle: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A",
    },
    noteText: {
      fontSize: 12,
      fontWeight: 700,
      color: "#64748B",
      lineHeight: 1.5,
    },
    statusRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
      gap: 12,
      alignItems: "center",
      minHeight: 58,
      borderRadius: 18,
      background: "rgba(255,255,255,0.22)",
      padding: "12px 14px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.62)",
    },
    statusPill: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 40,
      padding: "0 14px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.66)",
      color: "#0F766E",
      fontSize: 12,
      fontWeight: 800,
      border: "1px solid rgba(15,118,110,0.12)",
      whiteSpace: "nowrap",
    },
    connectButton: {
      minHeight: 48,
      borderRadius: 999,
      border: "1px solid rgba(56,189,248,0.18)",
      background:
        "linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(34,211,238,0.16) 100%)",
      color: "#0369A1",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 18px",
      boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
      borderStyle: "solid",
    },
    selectShell: {
      minHeight: 52,
      width: "100%",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.36)",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(15,23,42,0.06)",
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      position: "relative",
      boxSizing: "border-box",
      minWidth: 0,
    },
    select: {
      width: "100%",
      height: 50,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: isMobile ? 13 : 14,
      fontWeight: 700,
      color: "#0F172A",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
      paddingRight: 24,
      fontFamily: "inherit",
    },
    selectIcon: {
      position: "absolute",
      right: 14,
      color: "#64748B",
      pointerEvents: "none",
    },
    stickyFooter: {
      position: "sticky",
      bottom: 12,
      zIndex: 20,
      marginTop: 24,
    },
    stickyBar: {
      maxWidth: isMobile ? "100%" : 760,
      margin: "0 auto",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.42)",
      background: "rgba(255,255,255,0.44)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
      padding: 8,
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    footerGhostLink: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      color: "#475569",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      minWidth: 0,
    },
    footerPrimary: {
      flex: 1.25,
      height: 46,
      borderRadius: 999,
      border: "none",
      background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
      color: "#FFFFFF",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      boxShadow: "0 10px 22px rgba(15,23,42,0.14)",
      cursor: "pointer",
      minWidth: 0,
      opacity: submitting ? 0.8 : 1,
    },
    loader: {
      color: "#0f172a",
      fontSize: 15,
      fontWeight: 700,
      padding: "40px 0",
    },
  }

  if (loading || !draft) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <div style={styles.loader}>Loading payment details…</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GL</div>
          <Link href={`/admin/signup/event/create/${draft.id}/details`} style={styles.backLink}>
            Back
          </Link>
        </div>

        <section style={styles.card}>
          <div style={styles.intentBadge}>Payment Details</div>

          <div style={styles.title}>How would you like to be paid?</div>

          <div style={styles.subtitle}>
            Choose the payout method for this event. You can polish the payout settings later.
          </div>

          <div style={styles.section}>
            <label style={styles.sectionLabel}>Payout Method</label>
            <SlidingPillGroup
              value={payment.payoutMethod}
              onChange={(value) => updatePayment({ payoutMethod: value })}
              options={payoutOptions}
            />
          </div>

          {payment.payoutMethod === "wire" ? (
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Wire Transfer</label>

              <div style={styles.block}>
                <div style={styles.helperText}>
                  Bank wire payout. Additional fees may be deducted to cover wire costs.
                </div>

                <div style={styles.fieldGrid}>
                  <div>
                    <label style={styles.fieldLabel}>Account Name</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="Your Business LLC"
                        value={payment.wire.accountName}
                        onChange={(e) => updateWire({ accountName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Bank Name</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="Chase"
                        value={payment.wire.bankName}
                        onChange={(e) => updateWire({ bankName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Routing Number</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="021000021"
                        value={payment.wire.routingNumber}
                        onChange={(e) => updateWire({ routingNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Account Number</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="Account number"
                        value={payment.wire.accountNumber}
                        onChange={(e) => updateWire({ accountNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>SWIFT Code</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="Optional"
                        value={payment.wire.swiftCode}
                        onChange={(e) => updateWire({ swiftCode: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* <div style={styles.full}>
                    <label style={styles.fieldLabel}>Bank Address</label>
                    <div style={styles.textareaShell}>
                      <textarea
                        style={styles.textarea}
                        placeholder="Bank address"
                        value={payment.wire.bankAddress}
                        onChange={(e) => updateWire({ bankAddress: e.target.value })}
                      />
                    </div>
                  </div> */}
                </div>

                <div style={styles.noteRow}>
                    <label
                        style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                        width: "100%",
                        }}
                    >
                    <input
                    type="checkbox"
                    checked={payment.wire.acknowledgeFees}
                    onChange={(e) => updateWire({ acknowledgeFees: e.target.checked })}
                    style={{
                        marginTop: 2,
                        width: 18,
                        height: 18,
                        accentColor: "#22D3EE",
                        cursor: "pointer",
                        flexShrink: 0,
                        borderRadius: 10
                    }}
                    />

                    <div style={styles.noteTextWrap}>
                    <div style={styles.noteTitle}>Acknowledge wire fees</div>
                    <div style={styles.noteText}>
                        I understand wire fees may be deducted from the payout amount.
                    </div>
                    </div>
                </label>
                </div>
              </div>
            </div>
          ) : null}

          {payment.payoutMethod === "zelle" ? (
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Zelle</label>

              <div style={styles.block}>
                <div style={styles.helperText}>
                  Fast manual payout option. Zelle payouts may be limited to $3,000 per 24 hours.
                </div>

                <div style={styles.fieldGrid}>
                  <div>
                    <label style={styles.fieldLabel}>Recipient Name</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="John Doe"
                        value={payment.zelle.recipientName}
                        onChange={(e) => updateZelle({ recipientName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Zelle Email or Phone</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="email@domain.com or phone number"
                        value={payment.zelle.payoutContact}
                        onChange={(e) => updateZelle({ payoutContact: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.noteRow}>
                <label
                    style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    width: "100%",
                    }}
                >
                    <input
                    type="checkbox"
                    checked={payment.zelle.acknowledgeLimit}
                    onChange={(e) => updateZelle({ acknowledgeLimit: e.target.checked })}
                    style={{
                        marginTop: 2,
                        width: 18,
                        height: 18,
                        accentColor: "#22D3EE",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                    />

                    <div style={styles.noteTextWrap}>
                    <div style={styles.noteTitle}>Acknowledge Zelle limit</div>
                    <div style={styles.noteText}>
                        I understand payouts above $3,000 may require split disbursements or another payout method.
                    </div>
                    </div>
                </label>
                </div>
              </div>
            </div>
          ) : null}

          {payment.payoutMethod === "stripe" ? (
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Stripe</label>

              <div style={styles.block}>
                <div style={styles.helperText}>
                  Recommended for automated payouts and scaling. Connect your Stripe account and use Stripe for payout routing.
                </div>

                <div style={styles.statusRow}>
                  <div style={styles.noteTextWrap}>
                    <div style={styles.noteTitle}>Connected account status</div>
                    <div style={styles.noteText}>
                      Connect now or mark this draft as pending until onboarding is complete.
                    </div>
                  </div>

                  <div style={styles.statusPill}>
                    <CheckIcon />
                    {payment.stripe.onboardingStatus === "not_connected"
                      ? "Not connected"
                      : payment.stripe.onboardingStatus === "pending"
                        ? "Pending"
                        : "Ready"}
                  </div>
                </div>

                <div style={styles.fieldGrid}>
                  <div>
                    <label style={styles.fieldLabel}>Stripe Account ID</label>
                    <div style={styles.fieldShell}>
                      <input
                        style={styles.fieldInput}
                        type="text"
                        placeholder="acct_..."
                        value={payment.stripe.accountId}
                        onChange={(e) => updateStripe({ accountId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Onboarding Status</label>
                    <div style={styles.selectShell}>
                      <select
                        style={styles.select}
                        value={payment.stripe.onboardingStatus}
                        onChange={(e) =>
                          updateStripe({
                            onboardingStatus: e.target.value as StripeOnboardingStatus,
                          })
                        }
                      >
                        <option value="not_connected">Not connected</option>
                        <option value="pending">Pending</option>
                        <option value="ready">Ready</option>
                      </select>
                      <div style={styles.selectIcon}>
                        <ChevronDownIcon />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.addRow}>
                  <button
                    type="button"
                    style={styles.connectButton}
                    onClick={() => updateStripe({ onboardingStatus: "pending" })}
                  >
                    Connect with Stripe
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <section style={styles.stickyFooter}>
            <div style={styles.stickyBar}>
              <Link
                href={`/admin/signup/event/create/${draft.id}/details`}
                style={styles.footerGhostLink}
              >
                Back
              </Link>

              <button
                type="button"
                style={styles.footerPrimary}
                onClick={handleContinue}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </button>

              <Link href="/admin/dashboard" style={styles.footerGhostLink}>
                Dashboard
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}