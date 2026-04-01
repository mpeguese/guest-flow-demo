// app/components/booking/VenueMap.tsx
"use client"

import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch"
import { useMemo, useRef } from "react"
import type { VenueZone, ZoneStatus } from "@/app/lib/booking-data"
import { COLORS } from "@/app/lib/theme"

type Props = {
  zones: VenueZone[]
  statusByZoneId?: Record<string, ZoneStatus>
  selectedZoneId?: string
  onSelect: (zoneId: string) => void
  interactionLocked?: boolean
  controlsBottomOffset?: number
}

type Hotspot = {
  id: string
  xPct: number
  yPct: number
  wPct: number
  hPct: number
}

const hotspots: Hotspot[] = [
  { id: "R1", xPct: 16.18, yPct: 3.6, wPct: 12.81, hPct: 7.84 },
  { id: "R2", xPct: 42.7, yPct: 3.6, wPct: 12.81, hPct: 7.84 },
  { id: "R3", xPct: 58.2, yPct: 28.39, wPct: 12.25, hPct: 8.69 },
  { id: "R4", xPct: 71.12, yPct: 28.39, wPct: 12.25, hPct: 8.69 },
  { id: "R5", xPct: 94.04, yPct: 7.42, wPct: 4.38, hPct: 25.21 },
  { id: "R6", xPct: 94.04, yPct: 65.89, wPct: 3.6, hPct: 24.36 },
  { id: "R7", xPct: 78.76, yPct: 86.02, wPct: 12.81, hPct: 8.26 },
  { id: "R8", xPct: 51.8, yPct: 86.86, wPct: 12.81, hPct: 8.26 },
  { id: "R9", xPct: 16.18, yPct: 86.86, wPct: 12.36, hPct: 8.26 },
  { id: "R10", xPct: 8.2, yPct: 50, wPct: 3.82, hPct: 23.73 },
  { id: "M1", xPct: 42.7, yPct: 44.28, wPct: 2.36, hPct: 4.24 },
  { id: "M2", xPct: 38.31, yPct: 53.81, wPct: 1.8, hPct: 3.6 },
  { id: "M3", xPct: 33.26, yPct: 44.28, wPct: 1.91, hPct: 4.24 },
]

function getFill(status: ZoneStatus, selected: boolean) {
  if (selected) return "rgba(255, 209, 102, 0.94)"
  if (status === "available") return "rgba(255,255,255,0.16)"
  if (status === "limited") return "rgba(245, 158, 11, 0.44)"
  return "rgba(239, 68, 68, 0.42)"
}

function getStroke(status: ZoneStatus, selected: boolean) {
  if (selected) return "rgba(255, 209, 102, 1)"
  if (status === "available") return "rgba(255,255,255,0.38)"
  if (status === "limited") return "rgba(245, 158, 11, 0.96)"
  return "rgba(239, 68, 68, 0.96)"
}

function getTextColor(status: ZoneStatus, selected: boolean) {
  if (selected) return "#1A1303"
  if (status === "booked") return "#FFE3E3"
  return "#FFFFFF"
}

function MapControls({ bottomOffset = 96 }: { bottomOffset?: number }) {
  const { zoomIn, zoomOut } = useControls()

  const buttonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,18,27,0.82)",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 24px rgba(0,0,0,0.22)",
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        bottom: bottomOffset,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 10,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          zoomIn(0.2)
        }}
        style={buttonStyle}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          zoomOut(0.2)
        }}
        style={buttonStyle}
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  )
}

export default function VenueMap({
  zones,
  statusByZoneId = {},
  selectedZoneId,
  onSelect,
  interactionLocked = false,
  controlsBottomOffset = 96,
}: Props) {
  const zoneIds = useMemo(() => new Set(zones.map((zone) => zone.id)), [zones])

  const pointerStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    moved: false,
  })

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    pointerStateRef.current.isDown = true
    pointerStateRef.current.startX = e.clientX
    pointerStateRef.current.startY = e.clientY
    pointerStateRef.current.moved = false
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!pointerStateRef.current.isDown) return

    const dx = e.clientX - pointerStateRef.current.startX
    const dy = e.clientY - pointerStateRef.current.startY

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      pointerStateRef.current.moved = true
    }
  }

  function resetPointerState() {
    pointerStateRef.current.isDown = false
    pointerStateRef.current.moved = false
  }

  function handlePointerUp(
    e: React.PointerEvent<HTMLButtonElement>,
    zoneId: string,
    zoneExists: boolean
  ) {
    e.preventDefault()
    e.stopPropagation()

    const moved = pointerStateRef.current.moved
    resetPointerState()

    if (interactionLocked) return
    if (moved) return
    if (!zoneExists) return

    onSelect(zoneId)
  }

  return (
    <div
      style={{
        borderRadius: 0,
        overflow: "hidden",
        background: COLORS.bg,
        border: "none",
        boxShadow: "none",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          background: COLORS.bg,
          minHeight: "100dvh",
          overflow: "hidden",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "auto",
        }}
      >
        <TransformWrapper
          initialScale={1.7}
          minScale={1.25}
          maxScale={2.2}
          initialPositionY={-100}
          centerOnInit
          limitToBounds
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.12 }}
          pinch={{ step: 5 }}
          panning={{
            disabled: false,
            velocityDisabled: true,
          }}
        >
          <MapControls bottomOffset={controlsBottomOffset} />

          <TransformComponent
            wrapperStyle={{
              width: "100%",
              minHeight: "100dvh",
              touchAction: "none",
              background: COLORS.bg,
              overflow: "hidden",
              overscrollBehavior: "none",
            }}
            contentStyle={{
              width: "118%",
              minWidth: "980px",
              maxWidth: "none",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                display: "block",
                userSelect: "none",
              }}
            >
              <img
                src="/images/guestflow-rooftop.jpg"
                alt="Guestflow rooftop map"
                draggable={false}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(4,9,14,0.08) 0%, rgba(4,9,14,0.02) 36%, rgba(4,9,14,0.10) 100%)",
                  pointerEvents: "none",
                }}
              />

              {hotspots.map((spot) => {
                const status = statusByZoneId?.[spot.id] ?? "available"
                const isSelected = selectedZoneId === spot.id
                const zoneExists = zoneIds.has(spot.id)
                const isDisabled = interactionLocked || !zoneExists

                return (
                  <button
                    key={spot.id}
                    type="button"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(e, spot.id, zoneExists)}
                    onPointerCancel={resetPointerState}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    disabled={isDisabled}
                    aria-label={`Select ${spot.id}`}
                    title={zoneExists ? spot.id : `${spot.id} (not configured)`}
                    style={{
                      position: "absolute",
                      left: `${spot.xPct}%`,
                      top: `${spot.yPct}%`,
                      width: `${spot.wPct}%`,
                      height: `${spot.hPct}%`,
                      zIndex: 3,
                      borderRadius: 16,
                      border: `2px solid ${getStroke(status, isSelected)}`,
                      background: getFill(status, isSelected),
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(255,209,102,0.24), 0 14px 28px rgba(0,0,0,0.22)"
                        : "0 10px 18px rgba(0,0,0,0.14)",
                      cursor: isDisabled ? "default" : "pointer",
                      transition:
                        "transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease",
                      backdropFilter: "blur(1.5px)",
                      opacity: interactionLocked && !isSelected ? 0.92 : 1,
                      touchAction: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isDisabled) {
                        e.currentTarget.style.transform = "translateY(-1px)"
                        e.currentTarget.style.boxShadow = "0 14px 24px rgba(0,0,0,0.18)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 10px 18px rgba(0,0,0,0.14)"
                      }
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        color: getTextColor(status, isSelected),
                        fontWeight: 900,
                        fontSize: 12,
                        letterSpacing: 0.4,
                        textShadow: isSelected ? "none" : "0 1px 2px rgba(0,0,0,0.28)",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {spot.id}
                    </span>
                  </button>
                )
              })}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}