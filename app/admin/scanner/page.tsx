"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Html5Qrcode } from "html5-qrcode"

type ValidationStatus =
  | "idle"
  | "valid"
  | "checked_in"
  | "already_used"
  | "invalid"
  | "voided"
  | "refunded"
  | "error"

type ValidationResult = {
  status:
    | "valid"
    | "checked_in"
    | "already_used"
    | "invalid"
    | "voided"
    | "refunded"
  title: string
  description: string
  guestName?: string
  passType?: string
  eventName?: string
  accessPoint?: string
  ticketCode?: string
}

type RecentScan = {
  id: string
  time: string
  guest: string
  passType: string
  event: string
  status: "checked_in" | "already_used" | "invalid" | "voided" | "refunded"
}

function toneForStatus(status: ValidationStatus) {
  switch (status) {
    case "valid":
      return {
        bg: "#ECFEFF",
        border: "rgba(15,118,110,0.20)",
        text: "#0F766E",
        pillBg: "#CCFBF1",
        pillText: "#0F766E",
      }
    case "checked_in":
      return {
        bg: "#ECFDF5",
        border: "rgba(16,185,129,0.24)",
        text: "#047857",
        pillBg: "#D1FAE5",
        pillText: "#047857",
      }
    case "already_used":
      return {
        bg: "#FEF2F2",
        border: "rgba(239,68,68,0.22)",
        text: "#B91C1C",
        pillBg: "#FEE2E2",
        pillText: "#B91C1C",
      }
    case "invalid":
      return {
        bg: "#FFF7ED",
        border: "rgba(249,115,22,0.22)",
        text: "#C2410C",
        pillBg: "#FED7AA",
        pillText: "#C2410C",
      }
    case "voided":
      return {
        bg: "#F8FAFC",
        border: "rgba(100,116,139,0.22)",
        text: "#475569",
        pillBg: "#E2E8F0",
        pillText: "#475569",
      }
    case "refunded":
      return {
        bg: "#FEF2F2",
        border: "rgba(244,63,94,0.20)",
        text: "#BE123C",
        pillBg: "#FFE4E6",
        pillText: "#BE123C",
      }
    case "error":
      return {
        bg: "#FEF2F2",
        border: "rgba(239,68,68,0.22)",
        text: "#B91C1C",
        pillBg: "#FEE2E2",
        pillText: "#B91C1C",
      }
    default:
      return {
        bg: "#FFFFFF",
        border: "rgba(148,163,184,0.16)",
        text: "#0F172A",
        pillBg: "#E2E8F0",
        pillText: "#475569",
      }
  }
}

function statusLabel(status: ValidationStatus) {
  switch (status) {
    case "valid":
      return "Validated"
    case "checked_in":
      return "Checked In"
    case "already_used":
      return "Already Used"
    case "invalid":
      return "Invalid"
    case "voided":
      return "Voided"
    case "refunded":
      return "Refunded"
    case "error":
      return "Error"
    default:
      return "Ready"
  }
}

function RecentScanRow({ item }: { item: RecentScan }) {
  const tone = toneForStatus(item.status)

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(148,163,184,0.14)",
        background: "#FFFFFF",
        padding: "14px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          minWidth: 52,
          fontSize: 12,
          fontWeight: 800,
          color: "#64748B",
        }}
      >
        {item.time}
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
          {item.guest}
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
          {item.passType} • {item.event}
        </div>
      </div>

      <div
        style={{
          borderRadius: 999,
          padding: "8px 10px",
          background: tone.pillBg,
          color: tone.pillText,
          fontSize: 11,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {statusLabel(item.status)}
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
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
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
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

export default function AdminScannerPage() {
  const scannerRegionId = "guestflow-scanner-region"

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isStartingRef = useRef(false)
  const isMountedRef = useRef(true)
  const isScanningRef = useRef(false)
  const lastScannedTextRef = useRef("")
  const lastScannedAtRef = useRef(0)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [scanStatus, setScanStatus] = useState<ValidationStatus>("idle")
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [recentScansOpen, setRecentScansOpen] = useState(false)
  const [scanSheetOpen, setScanSheetOpen] = useState(false)

  const [recentScans, setRecentScans] = useState<RecentScan[]>([
    {
      id: "seed-1",
      time: "10:42",
      guest: "Michael Peguese",
      passType: "VIP Entry",
      event: "Neon Saturdays",
      status: "checked_in",
    },
    {
      id: "seed-2",
      time: "10:39",
      guest: "J. Carter",
      passType: "General Admission",
      event: "Skyline Rooftop Social",
      status: "already_used",
    },
    {
      id: "seed-3",
      time: "10:34",
      guest: "No Match Found",
      passType: "Unknown",
      event: "—",
      status: "invalid",
    },
  ])

  const scanSummary = useMemo(() => {
    return {
      checkedIn: recentScans.filter((s) => s.status === "checked_in").length,
      issues: recentScans.filter((s) => s.status !== "checked_in").length,
    }
  }, [recentScans])

  const addRecentScan = useCallback(
    (payload: {
      guest?: string
      passType?: string
      eventName?: string
      status: RecentScan["status"]
    }) => {
      const now = new Date()
      const time = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })

      setRecentScans((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          time,
          guest: payload.guest || "Unknown Guest",
          passType: payload.passType || "Unknown Pass",
          event: payload.eventName || "—",
          status: payload.status,
        },
        ...prev,
      ].slice(0, 8))
    },
    []
  )

  const resetResult = useCallback(() => {
    setScanStatus("idle")
    setResult(null)
    setCameraError("")
    setManualCode("")
    setScanSheetOpen(false)
    lastScannedTextRef.current = ""
    lastScannedAtRef.current = 0
  }, [])

  const validateCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) {
        setScanStatus("invalid")
        setResult({
          status: "invalid",
          title: "Invalid Code",
          description:
            "Please scan a valid GuestFlow QR code or enter a code manually.",
        })
        return
      }

      setIsValidating(true)
      setCameraError("")
      setScanSheetOpen(false)

      try {
        const response = await fetch("/api/admin/scanner/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qrCode: trimmed,
            locationId: "liv-tampa-main-door",
            eventId: "neon-saturdays",
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || "Validation failed")
        }

        const nextStatus = data.result.status as ValidationResult["status"]

        setScanStatus(nextStatus)
        setResult(data.result)

        if (nextStatus === "valid") {
          setScanSheetOpen(true)
        }

        if (
          nextStatus === "already_used" ||
          nextStatus === "invalid" ||
          nextStatus === "voided" ||
          nextStatus === "refunded"
        ) {
          addRecentScan({
            guest: data.result.guestName,
            passType: data.result.passType,
            eventName: data.result.eventName,
            status: nextStatus,
          })
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected validation error."

        setScanStatus("error")
        setResult(null)
        setCameraError(message)
      } finally {
        if (isMountedRef.current) {
          setIsValidating(false)
        }
      }
    },
    [addRecentScan]
  )

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current && isScanningRef.current) {
        await scannerRef.current.stop()
        isScanningRef.current = false
      }
    } catch {
      // ignore stop errors
    }
  }, [])

  const startScanner = useCallback(async () => {
    if (typeof window === "undefined") return
    if (isStartingRef.current) return

    setCameraLoading(true)
    setCameraError("")

    try {
      isStartingRef.current = true

      if (!scannerRef.current) {
        const mod = await import("html5-qrcode")
        const Html5QrcodeCtor = mod.Html5Qrcode
        scannerRef.current = new Html5QrcodeCtor(scannerRegionId, false)
      }

      await stopScanner()

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          const now = Date.now()
          const isDuplicateText = decodedText === lastScannedTextRef.current
          const isTooSoon = now - lastScannedAtRef.current < 2500

          if (isDuplicateText && isTooSoon) return

          lastScannedTextRef.current = decodedText
          lastScannedAtRef.current = now

          await validateCode(decodedText)
        },
        () => {}
      )

      if (!isMountedRef.current) return

      isScanningRef.current = true
      setCameraReady(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Camera could not be started on this device."

      setCameraReady(false)
      setCameraError(message)
    } finally {
      if (isMountedRef.current) {
        setCameraLoading(false)
      }
      isStartingRef.current = false
    }
  }, [scannerRegionId, stopScanner, validateCode])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      void stopScanner()
    }
  }, [stopScanner])

  async function handleManualValidate() {
    await validateCode(manualCode)
  }

  function handleConfirmCheckIn() {
    if (!result || scanStatus !== "valid") return

    setIsCheckingIn(true)

    setTimeout(() => {
      const checkedInResult: ValidationResult = {
        ...result,
        status: "checked_in",
        title: "Guest Checked In",
        description:
          "Entry confirmed successfully. This guest is now marked as checked in.",
      }

      setResult(checkedInResult)
      setScanStatus("checked_in")
      setIsCheckingIn(false)

      addRecentScan({
        guest: checkedInResult.guestName,
        passType: checkedInResult.passType,
        eventName: checkedInResult.eventName,
        status: "checked_in",
      })

      setTimeout(() => {
        resetResult()
      }, 900)
    }, 350)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 46%, #FFF5E8 100%)",
        color: "#0F172A",
        padding: "12px 12px 96px",
      }}
    >
      <div
        style={{
          maxWidth: 1380,
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
            padding: 16,
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
                GuestFlow Scanner
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: -0.9,
                  color: "#020617",
                }}
              >
                Scan & Validate
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Neon Saturdays • Main Door
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            gap: 16,
          }}
          className="scanner-grid"
        >
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 30,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.84)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
                padding: 18,
              }}
            >
              <div
                style={{
                  borderRadius: 28,
                  minHeight: 320,
                  background:
                    "linear-gradient(145deg, rgba(186,230,253,0.98) 0%, rgba(125,211,252,0.95) 38%, rgba(103,232,249,0.92) 68%, rgba(254,215,170,0.92) 100%)",
                  position: "relative",
                  overflow: "hidden",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at top right, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0) 52%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    justifyContent: "center",
                  }}
                >
                  <div
                    id={scannerRegionId}
                    style={{
                      width: "100%",
                      maxWidth: 520,
                      margin: "0 auto",
                      minHeight: 240,
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "2px solid rgba(255,255,255,0.52)",
                      background: "rgba(255,255,255,0.22)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 20px 40px rgba(14,165,233,0.10)",
                    }}
                  />

                  {!cameraReady && !cameraLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#0F172A",
                        maxWidth: 320,
                        margin: "0 auto",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: "rgba(15,23,42,0.58)",
                        }}
                      >
                        Camera Preview
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          fontSize: 28,
                          lineHeight: 1,
                          fontWeight: 900,
                          letterSpacing: -0.8,
                          color: "#0F172A",
                        }}
                      >
                        Ready to Scan
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => void startScanner()}
                  disabled={cameraLoading}
                  style={{
                    height: 46,
                    borderRadius: 18,
                    border: "none",
                    background: "linear-gradient(135deg, #93C5FD 0%, #7DD3FC 100%)",
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: cameraLoading ? "default" : "pointer",
                    boxShadow: "0 14px 28px rgba(96,165,250,0.22)",
                    opacity: cameraLoading ? 0.7 : 1,
                  }}
                >
                  {cameraLoading ? "Starting Camera..." : "Open Camera"}
                </button>

                <button
                  onClick={resetResult}
                  style={{
                    height: 46,
                    borderRadius: 18,
                    border: "1px solid rgba(148,163,184,0.22)",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Reset Result
                </button>
              </div>

              {cameraError ? (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 18,
                    border: "1px solid rgba(239,68,68,0.18)",
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    padding: "14px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  {cameraError}
                </div>
              ) : null}
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
                Manual Entry
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#64748B",
                }}
              >
                Use this if the camera cannot scan or the guest needs manual
                lookup.
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                }}
              >
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter or paste QR / ticket code"
                  style={{
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

                <button
                  onClick={() => void handleManualValidate()}
                  disabled={isValidating}
                  style={{
                    height: 54,
                    padding: "0 18px",
                    borderRadius: 18,
                    border: "none",
                    background: "linear-gradient(135deg, #93C5FD 0%, #7DD3FC 100%)",
                    boxShadow: "0 14px 28px rgba(96,165,250,0.22)",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: isValidating ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    opacity: isValidating ? 0.7 : 1,
                  }}
                >
                  {isValidating ? "Validating..." : "Validate"}
                </button>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                borderRadius: 28,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(255,255,255,0.84)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
                padding: 18,
                textAlign: "left",
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
                      fontSize: 19,
                      fontWeight: 900,
                      letterSpacing: -0.4,
                      color: "#020617",
                    }}
                  >
                    Recent Scans
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#64748B",
                    }}
                  >
                    Tap the icon to view latest validation and check-in activity.
                  </div>
                </div>

                <button
                  onClick={() => setRecentScansOpen(true)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.16)",
                    background: "#F8FAFC",
                    color: "#64748B",
                    fontSize: 22,
                    lineHeight: 1,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label="Open recent scans"
                >
                  ◷
                </button>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    borderRadius: 999,
                    padding: "8px 10px",
                    background: "#ECFDF5",
                    color: "#047857",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {scanSummary.checkedIn} Checked In
                </div>
                <div
                  style={{
                    borderRadius: 999,
                    padding: "8px 10px",
                    background: "#F8FAFC",
                    color: "#475569",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {scanSummary.issues} Issues
                </div>
                <div
                  style={{
                    borderRadius: 999,
                    padding: "8px 10px",
                    background: "#F8FAFC",
                    color: "#475569",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {recentScans.length} Total
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            position: "sticky",
            bottom: 12,
            zIndex: 20,
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 20px 44px rgba(15,23,42,0.10)",
              padding: 8,
              display: "flex",
              gap: 8,
            }}
          >
            <Link
              href="/admin/dashboard"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 999,
                color: "#475569",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Dashboard
            </Link>

            <div
              style={{
                flex: 1.1,
                height: 48,
                borderRadius: 999,
                background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
              }}
            >
              Scan
            </div>

            <Link
              href="/admin/reservations"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 999,
                color: "#475569",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Reservations
            </Link>
          </div>
        </section>
      </div>

      {recentScansOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(15,23,42,0.32)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
          onClick={() => setRecentScansOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "72vh",
              overflow: "auto",
              borderRadius: 28,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              padding: 18,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 42,
                height: 5,
                borderRadius: 999,
                background: "#CBD5E1",
                margin: "0 auto 14px",
              }}
            />

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
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: -0.4,
                    color: "#020617",
                  }}
                >
                  Recent Scans
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#64748B",
                  }}
                >
                  Latest validation and check-in activity for this entry point.
                </div>
              </div>

              <button
                onClick={() => setRecentScansOpen(false)}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.18)",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  padding: "8px 10px",
                  background: "#ECFDF5",
                  color: "#047857",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {scanSummary.checkedIn} Checked In
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: "8px 10px",
                  background: "#F8FAFC",
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {scanSummary.issues} Issues
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: "8px 10px",
                  background: "#F8FAFC",
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {recentScans.length} Total
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gap: 10,
              }}
            >
              {recentScans.map((item) => (
                <RecentScanRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {scanSheetOpen && result && scanStatus === "valid" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(15,23,42,0.32)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              background: "rgba(255,255,255,0.98)",
              borderTop: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "0 -18px 44px rgba(15,23,42,0.14)",
              padding: "16px 16px 24px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 5,
                borderRadius: 999,
                background: "#CBD5E1",
                margin: "0 auto 16px",
              }}
            />

            <div
              style={{
                maxWidth: 720,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: "#D1FAE5",
                  color: "#047857",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                Success
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: -0.9,
                  color: "#020617",
                }}
              >
                Scan Successful
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#64748B",
                }}
              >
                GuestFlow pass validated successfully. Review details below and
                complete check-in.
              </div>

              <div
                style={{
                  marginTop: 18,
                  borderRadius: 22,
                  background: "#F8FAFC",
                  border: "1px solid rgba(148,163,184,0.12)",
                  padding: 16,
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
                  Ticket Details
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#0F172A",
                      }}
                    >
                      {result.guestName || "—"}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: "#64748B",
                      }}
                    >
                      {(result.passType || "—") + " • " + (result.eventName || "—")}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <StatPill label="Event" value={result.eventName || "—"} />
                    <StatPill label="Access" value={result.accessPoint || "—"} />
                    <StatPill label="Pass" value={result.passType || "—"} />
                    <StatPill label="Code" value={result.ticketCode || "—"} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmCheckIn}
                disabled={isCheckingIn}
                style={{
                  marginTop: 18,
                  width: "100%",
                  height: 52,
                  borderRadius: 18,
                  border: "none",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: isCheckingIn ? "default" : "pointer",
                  boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
                  opacity: isCheckingIn ? 0.75 : 1,
                }}
              >
                {isCheckingIn ? "Checking In..." : "Check-In"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @media (max-width: 1100px) {
          .scanner-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          #guestflow-scanner-region {
            min-height: 220px !important;
          }
        }
      `}</style>
    </div>
  )
}