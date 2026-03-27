// app/component/booking/ZoneDetailsCard.tsx
"use client"

import { useEffect, useState } from "react"
import type { VenueZone, ZoneStatus } from "@/app/lib/booking-data"

const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F7FBFC",
  card: "#FFFFFF",
  cardSoft: "#F2FAFB",
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",

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

  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
}

function statusLabel(status?: ZoneStatus) {
  if (status === "available") return "Available"
  if (status === "limited") return "Limited"
  if (status === "booked") return "Booked"
  return "Select a zone"
}

function statusColor(status?: ZoneStatus) {
  if (status === "available") return COLORS.success
  if (status === "limited") return COLORS.gold
  if (status === "booked") return COLORS.danger
  return COLORS.textMuted
}

function statusBg(status?: ZoneStatus) {
  if (status === "available") return COLORS.successSoft
  if (status === "limited") return COLORS.goldSoft
  if (status === "booked") return COLORS.dangerSoft
  return COLORS.bgSoft
}

export default function ZoneDetailsCard({
  zone,
  status,
  isOpen,
  onClose,
  onContinue,
}: {
  zone?: VenueZone
  status?: ZoneStatus
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen && zone) {
      setShouldRender(true)
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    if (!isOpen && shouldRender) {
      setIsVisible(false)
      const timeout = window.setTimeout(() => {
        setShouldRender(false)
      }, 260)
      return () => window.clearTimeout(timeout)
    }
  }, [isOpen, zone, shouldRender])

  useEffect(() => {
    if (!zone) {
      setIsVisible(false)
      const timeout = window.setTimeout(() => {
        setShouldRender(false)
      }, 260)
      return () => window.clearTimeout(timeout)
    }
  }, [zone])

  if (!shouldRender || !zone) return null

  const isBlocked = status === "booked"
  const previewImageSrc = "/images/table-preview.jpg"

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: isVisible ? "rgba(15, 23, 42, 0.20)" : "rgba(15, 23, 42, 0)",
          backdropFilter: isVisible ? "blur(6px)" : "blur(0px)",
          zIndex: 80,
          transition: "background 240ms ease, backdrop-filter 240ms ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 81,
          display: "flex",
          justifyContent: "center",
          padding: "0 12px 12px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            borderRadius: "30px 30px 0 0",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 100%)",
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            boxShadow: "0 24px 48px rgba(15,23,42,0.16)",
            overflow: "hidden",
            transform: isVisible ? "translateY(0)" : "translateY(36px)",
            opacity: isVisible ? 1 : 0,
            transition: "transform 260ms ease, opacity 260ms ease",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              paddingTop: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 5,
                borderRadius: 999,
                background: "#C9DCE2",
              }}
            />
          </div>

          <div
            style={{
              padding: "14px 16px 18px",
              maxHeight: "78vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: statusBg(status),
                    border: `1px solid ${COLORS.border}`,
                    color: statusColor(status),
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: statusColor(status),
                      boxShadow: `0 0 10px ${statusColor(status)}55`,
                    }}
                  />
                  {statusLabel(status)}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                    marginBottom: 6,
                  }}
                >
                  {zone.floor.toUpperCase()} · {zone.section.toUpperCase()}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 26,
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    color: COLORS.text,
                  }}
                >
                  {zone.name}
                </h3>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bg,
                  color: COLORS.text,
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: 210,
                borderRadius: 24,
                overflow: "hidden",
                marginBottom: 16,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 18px 30px rgba(15,23,42,0.10)",
                background: COLORS.bgSoft,
              }}
            >
              <img
                src={previewImageSrc}
                alt={`${zone.name} seating preview`}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 210,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 36%, rgba(15,23,42,0.38) 100%)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "rgba(255,255,255,0.76)",
                      marginBottom: 6,
                    }}
                  >
                    RESERVED EXPERIENCE
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      lineHeight: 1.1,
                      fontWeight: 900,
                      color: "#fff",
                      textShadow: "0 10px 18px rgba(0,0,0,0.20)",
                    }}
                  >
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} seating
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.88)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    boxShadow: "0 10px 18px rgba(15,23,42,0.10)",
                  }}
                >
                  ${zone.price}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  background: COLORS.cardSoft,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {zone.capacityMin}–{zone.capacityMax} guests
              </div>

              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  background: COLORS.cardSoft,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {zone.type}
              </div>

              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  background: COLORS.coralSoft,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.coral,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Min spend ${zone.minSpend}
              </div>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.6,
                color: COLORS.textSoft,
              }}
            >
              {zone.description}
            </p>

            {zone.perks && zone.perks.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.textMuted,
                    marginBottom: 8,
                  }}
                >
                  WHAT’S INCLUDED
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {zone.perks.map((perk) => (
                    <span
                      key={perk}
                      style={{
                        padding: "8px 11px",
                        borderRadius: 999,
                        background: COLORS.cardSoft,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onContinue}
              disabled={isBlocked}
              style={{
                width: "100%",
                height: 54,
                marginTop: 18,
                borderRadius: 18,
                border: isBlocked
                  ? `1px solid ${COLORS.border}`
                  : "1px solid rgba(14,165,233,0.24)",
                background: isBlocked
                  ? COLORS.bgSoft
                  : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                color: isBlocked ? COLORS.textMuted : "#FFFFFF",
                fontSize: 15,
                fontWeight: 900,
                cursor: isBlocked ? "not-allowed" : "pointer",
                boxShadow: isBlocked ? "none" : "0 14px 24px rgba(14,165,233,0.22)",
              }}
            >
              {isBlocked ? "This Area Is Unavailable" : "Continue with This Area"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}