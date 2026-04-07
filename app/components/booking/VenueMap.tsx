// app/components/booking/VenueMap.tsx
"use client"

import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch"
import { useEffect, useMemo, useRef, useState } from "react"
import type { VenueZone, ZoneStatus } from "@/app/lib/booking-data"
import { COLORS } from "@/app/lib/theme"

type ZoneWithMapPlacement = VenueZone & {
  code?: string | null
  mapZoneId?: string | null
  xPct?: number | string | null
  yPct?: number | string | null
  wPct?: number | string | null
  hPct?: number | string | null
  rotationDeg?: number | string | null
  zIndex?: number | null
}

type Props = {
  zones: VenueZone[]
  statusByZoneId?: Record<string, ZoneStatus>
  selectedZoneId?: string
  onSelect: (zoneId: string) => void
  interactionLocked?: boolean
  controlsBottomOffset?: number
  mapImageSrc?: string
  mapImageAlt?: string
}

type RenderHotspot = {
  zoneId: string
  label: string
  xPct: number
  yPct: number
  wPct: number
  hPct: number
  rotationDeg: number
  zIndex: number
}

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

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
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
  mapImageSrc,
  mapImageAlt = "Venue map",
}: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const pointerStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    moved: false,
  })

  const renderHotspots = useMemo<RenderHotspot[]>(() => {
    return (zones as ZoneWithMapPlacement[])
      .map((zone) => {
        const xPct = toNumber(zone.xPct)
        const yPct = toNumber(zone.yPct)
        const wPct = toNumber(zone.wPct)
        const hPct = toNumber(zone.hPct)
        const rotationDeg = toNumber(zone.rotationDeg) ?? 0
        const zIndex = zone.zIndex ?? 3

        if (
          xPct === null ||
          yPct === null ||
          wPct === null ||
          hPct === null
        ) {
          return null
        }

        return {
          zoneId: zone.id,
          label: zone.code?.trim() || zone.name,
          xPct,
          yPct,
          wPct,
          hPct,
          rotationDeg,
          zIndex,
        }
      })
      .filter((spot): spot is RenderHotspot => !!spot)
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [zones])

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
    zoneId: string
  ) {
    e.preventDefault()
    e.stopPropagation()

    const moved = pointerStateRef.current.moved
    resetPointerState()

    if (interactionLocked) return
    if (moved) return

    onSelect(zoneId)
  }

  const resolvedMapImageSrc = mapImageSrc || "/images/guestflow-rooftop.jpg"
  const hasPlacements = renderHotspots.length > 0

  if (!mounted) {
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
              src={resolvedMapImageSrc}
              alt={mapImageAlt}
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
          </div>
        </div>
      </div>
    )
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
                src={resolvedMapImageSrc}
                alt={mapImageAlt}
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

              {hasPlacements
                ? renderHotspots.map((spot) => {
                    const status = statusByZoneId?.[spot.zoneId] ?? "available"
                    const isSelected = selectedZoneId === spot.zoneId
                    const isDisabled = interactionLocked

                    return (
                      <button
                        key={spot.zoneId}
                        type="button"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={(e) => handlePointerUp(e, spot.zoneId)}
                        onPointerCancel={resetPointerState}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        disabled={isDisabled}
                        aria-label={`Select ${spot.label}`}
                        title={spot.label}
                        style={{
                          position: "absolute",
                          left: `${spot.xPct}%`,
                          top: `${spot.yPct}%`,
                          width: `${spot.wPct}%`,
                          height: `${spot.hPct}%`,
                          zIndex: spot.zIndex,
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
                          transform:
                            spot.rotationDeg !== 0
                              ? `rotate(${spot.rotationDeg}deg)`
                              : undefined,
                          transformOrigin: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !isDisabled) {
                            e.currentTarget.style.boxShadow =
                              "0 14px 24px rgba(0,0,0,0.18)"
                            e.currentTarget.style.transform =
                              spot.rotationDeg !== 0
                                ? `translateY(-1px) rotate(${spot.rotationDeg}deg)`
                                : "translateY(-1px)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.boxShadow =
                              "0 10px 18px rgba(0,0,0,0.14)"
                            e.currentTarget.style.transform =
                              spot.rotationDeg !== 0
                                ? `rotate(${spot.rotationDeg}deg)`
                                : "translateY(0)"
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
                            textShadow: isSelected
                              ? "none"
                              : "0 1px 2px rgba(0,0,0,0.28)",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {spot.label}
                        </span>
                      </button>
                    )
                  })
                : null}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}