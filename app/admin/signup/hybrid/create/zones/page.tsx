// app/admin/signup/hybrid/create/zones/page.tsx
"use client"

import Link from "next/link"
import { useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react"
import { useRouter } from "next/navigation"

type ZoneRecord = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

type DragState = {
  zoneId: string
  pointerId: number
  offsetXPercent: number
  offsetYPercent: number
}

type PanState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startPanX: number
  startPanY: number
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function createZoneId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `zone_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function HybridZonesPage() {
  const router = useRouter()
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const [zones, setZones] = useState<ZoneRecord[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [panState, setPanState] = useState<PanState | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const movedDuringPanRef = useRef(false)

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) ?? null,
    [zones, selectedZoneId]
  )

  const toMapPercent = (clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return null

    const mapX = ((clientX - rect.left - panX) / (rect.width * zoom)) * 100
    const mapY = ((clientY - rect.top - panY) / (rect.height * zoom)) * 100

    return {
      x: mapX,
      y: mapY,
    }
  }

  const addZoneAtPoint = (event: MouseEvent<HTMLDivElement>) => {
    if (dragState) return

    if (movedDuringPanRef.current) {
      movedDuringPanRef.current = false
      return
    }

    const point = toMapPercent(event.clientX, event.clientY)
    if (!point) return

    const width = 16
    const height = 12

    const newZone: ZoneRecord = {
      id: createZoneId(),
      name: `Zone ${zones.length + 1}`,
      x: clamp(point.x - width / 2, 0, 100 - width),
      y: clamp(point.y - height / 2, 0, 100 - height),
      width,
      height,
    }

    setZones((prev) => [...prev, newZone])
    setSelectedZoneId(newZone.id)
  }

  const updateZone = (id: string, updates: Partial<ZoneRecord>) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone))
    )
  }

  const removeZone = (id: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id))
    setSelectedZoneId((prev) => (prev === id ? null : prev))
    setDragState((prev) => (prev?.zoneId === id ? null : prev))
  }

  const handleZonePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    zone: ZoneRecord
  ) => {
    event.stopPropagation()

    const point = toMapPercent(event.clientX, event.clientY)
    if (!point) return

    setSelectedZoneId(zone.id)
    setDragState({
      zoneId: zone.id,
      pointerId: event.pointerId,
      offsetXPercent: point.x - zone.x,
      offsetYPercent: point.y - zone.y,
    })

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handleViewportPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null

    if (target?.closest("[data-zone='true']")) return
    if (dragState) return

    movedDuringPanRef.current = false

    setPanState({
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: panX,
        startPanY: panY,
    })

    try {
        event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      const zone = zones.find((item) => item.id === dragState.zoneId)
      if (!zone) return

      const point = toMapPercent(event.clientX, event.clientY)
      if (!point) return

      const nextX = clamp(point.x - dragState.offsetXPercent, 0, 100 - zone.width)
      const nextY = clamp(point.y - dragState.offsetYPercent, 0, 100 - zone.height)

      updateZone(zone.id, {
        x: Number(nextX.toFixed(2)),
        y: Number(nextY.toFixed(2)),
      })

      return
    }

    if (panState) {
      const dx = event.clientX - panState.startClientX
      const dy = event.clientY - panState.startClientY

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        movedDuringPanRef.current = true
      }

      setPanX(panState.startPanX + dx)
      setPanY(panState.startPanY + dy)
    }
  }

  const clearInteractions = () => {
    setDragState(null)
    setPanState(null)
  }

  const changeZoom = (nextZoom: number) => {
    setZoom(clamp(Number(nextZoom.toFixed(2)), 0.75, 2.5))
  }

  const resetView = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at top left, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 28%), radial-gradient(circle at bottom right, rgba(251,191,36,0.14) 0%, rgba(251,191,36,0) 24%), linear-gradient(180deg, #f8fcff 0%, #eef8ff 48%, #fff7ed 100%)",
      padding: "22px 14px 28px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 1180,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.08)",
      color: "#0f172a",
      fontSize: 19,
      fontWeight: 900,
      border: "1px solid rgba(255,255,255,0.22)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    heroPanel: {
      borderRadius: 30,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.24), 0 18px 42px rgba(15,23,42,0.06)",
      padding: 24,
    },
    badge: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(15,118,110,0.05)",
      color: "#0f766e",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      border: "1px solid rgba(15,118,110,0.08)",
    },
    title: {
      marginTop: 18,
      fontSize: 42,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-1.2px",
      color: "#020617",
    },
    summary: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 1.65,
      color: "#475569",
      maxWidth: 760,
    },
    helperPills: {
      marginTop: 16,
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },
    helperPill: {
      display: "inline-flex",
      alignItems: "center",
      minHeight: 36,
      padding: "0 14px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
      fontSize: 13,
      fontWeight: 700,
      color: "#0f172a",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
    layout: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)",
      gap: 16,
    },
    card: {
      borderRadius: 28,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.22), 0 16px 36px rgba(15,23,42,0.05)",
      padding: 18,
    },
    mapCard: {
      minHeight: 600,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    cardTopRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    cardLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    toolRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    toolBtn: {
      minWidth: 38,
      height: 38,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.12)",
      color: "#0f172a",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      fontSize: 13,
      fontWeight: 900,
    },
    zoomPill: {
      minHeight: 38,
      padding: "0 14px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.12)",
      color: "#0f172a",
      display: "inline-flex",
      alignItems: "center",
      fontSize: 13,
      fontWeight: 900,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    },
    mapFrame: {
      position: "relative",
      flex: 1,
      minHeight: 500,
      borderRadius: 24,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.18), 0 14px 30px rgba(15,23,42,0.05)",
    },
    viewport: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      cursor: dragState ? "grabbing" : panState ? "grabbing" : "grab",
      touchAction: "none",
      userSelect: "none",
    },
    mapContent: {
      position: "absolute",
      inset: 0,
      transformOrigin: "top left",
      willChange: "transform",
    },
    mapImage: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.10) 100%)",
      backgroundSize: "36px 36px, 36px 36px, cover",
      pointerEvents: "none",
    },
    mapOverlayNote: {
      position: "absolute",
      left: 14,
      top: 14,
      zIndex: 3,
      display: "inline-flex",
      alignItems: "center",
      minHeight: 34,
      padding: "0 12px",
      borderRadius: 999,
      background: "rgba(15,23,42,0.58)",
      color: "#ffffff",
      fontSize: 12,
      fontWeight: 800,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      pointerEvents: "none",
    },
    zoneBox: {
      position: "absolute",
      borderRadius: 8,
      border: "2px solid rgba(59,130,246,0.92)",
      background: "rgba(59,130,246,0.18)",
      boxShadow: "0 10px 22px rgba(59,130,246,0.18)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: 8,
      color: "#0f172a",
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "-0.2px",
      cursor: dragState ? "grabbing" : "grab",
      touchAction: "none",
      userSelect: "none",
    },
    zoneBoxSelected: {
      border: "2px solid rgba(245,158,11,0.98)",
      background: "rgba(245,158,11,0.22)",
      boxShadow: "0 12px 26px rgba(245,158,11,0.20)",
    },
    sideCard: {
      minHeight: 600,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    zoneList: {
      display: "grid",
      gap: 10,
    },
    zoneListItem: {
      borderRadius: 18,
      padding: 14,
      background: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      cursor: "pointer",
    },
    zoneListItemSelected: {
      border: "1px solid rgba(245,158,11,0.34)",
      background: "rgba(245,158,11,0.12)",
    },
    zoneListMeta: {
      display: "grid",
      gap: 4,
    },
    zoneListTitle: {
      fontSize: 15,
      fontWeight: 900,
      color: "#0f172a",
    },
    zoneListSub: {
      fontSize: 12,
      fontWeight: 700,
      color: "#64748b",
    },
    deleteBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: "1px solid rgba(239,68,68,0.14)",
      background: "rgba(239,68,68,0.08)",
      color: "#dc2626",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      flexShrink: 0,
    },
    emptyState: {
      borderRadius: 22,
      padding: 18,
      background: "rgba(255,255,255,0.08)",
      border: "1px dashed rgba(148,163,184,0.24)",
      color: "#64748b",
      fontSize: 14,
      lineHeight: 1.65,
    },
    editorCard: {
      marginTop: 6,
      borderRadius: 22,
      padding: 16,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.18)",
      display: "grid",
      gap: 14,
    },
    fieldGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    label: {
      display: "block",
      marginBottom: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.3px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    input: {
      width: "100%",
      height: 48,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.10)",
      padding: "0 14px",
      boxSizing: "border-box",
      fontSize: 14,
      fontWeight: 700,
      color: "#0f172a",
      outline: "none",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    actions: {
      marginTop: 18,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    ghostBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 140,
      height: 52,
      borderRadius: 16,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.18)",
      color: "#0f172a",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 800,
    },
    primaryBtn: {
      minWidth: 190,
      height: 52,
      borderRadius: 16,
      border: "none",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
    },
  }

  return (
    <div style={styles.page}>
      <style jsx>{`
        @media (max-width: 980px) {
          .zones-layout {
            grid-template-columns: 1fr !important;
          }

          .zones-field-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .zones-title {
            font-size: 34px !important;
          }

          .zones-map-card,
          .zones-side-card {
            min-height: auto !important;
          }

          .zones-map-frame {
            min-height: 380px !important;
          }

          .zones-field-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GL</div>

          <Link href="/admin/signup/hybrid/create/map" style={styles.backLink}>
            Back to Map
          </Link>
        </div>

        <section style={styles.heroPanel}>
          <div style={styles.badge}>Hybrid · Zones</div>
          <div style={styles.title} className="zones-title">
            Map clickable zones
          </div>
          <div style={styles.summary}>
            Click anywhere on the map to place a zone. Drag a zone to move it. Drag empty
            canvas space to pan the map. Use zoom controls to get closer.
          </div>

          <div style={styles.helperPills}>
            <div style={styles.helperPill}>Click map to add zone</div>
            <div style={styles.helperPill}>Drag zone to reposition</div>
            <div style={styles.helperPill}>Drag canvas to pan</div>
            <div style={styles.helperPill}>Zoom in for precision</div>
          </div>

          <div style={styles.layout} className="zones-layout">
            <div style={{ ...styles.card, ...styles.mapCard }} className="zones-map-card">
              <div style={styles.cardTopRow}>
                <div style={styles.cardLabel}>Map Canvas</div>

                <div style={styles.toolRow}>
                  <button
                    type="button"
                    style={styles.toolBtn}
                    onClick={() => changeZoom(zoom - 0.2)}
                    aria-label="Zoom out"
                  >
                    <MinusIcon />
                  </button>

                  <div style={styles.zoomPill}>{Math.round(zoom * 100)}%</div>

                  <button
                    type="button"
                    style={styles.toolBtn}
                    onClick={() => changeZoom(zoom + 0.2)}
                    aria-label="Zoom in"
                  >
                    <PlusIcon />
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.toolBtn, minWidth: 64 }}
                    onClick={resetView}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div style={styles.mapFrame} className="zones-map-frame">
                <div
                  ref={viewportRef}
                  style={styles.viewport}
                  onClick={addZoneAtPoint}
                  onPointerDown={handleViewportPointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={clearInteractions}
                  onPointerLeave={clearInteractions}
                  onPointerCancel={clearInteractions}
                >
                  <div style={styles.mapOverlayNote}>
                    {dragState
                      ? "Dragging zone…"
                      : panState
                        ? "Panning map…"
                        : "Click to add · Drag to move"}
                  </div>

                  <div
                    style={{
                      ...styles.mapContent,
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    }}
                  >
                    <div style={styles.mapImage} />

                    {zones.map((zone) => {
                      const selected = zone.id === selectedZoneId

                      return (
                        <button
                          key={zone.id}
                          type="button"
                          data-zone="true"
                          onPointerDown={(event) => handleZonePointerDown(event, zone)}
                          onClick={(event) => event.stopPropagation()}
                          style={{
                            ...styles.zoneBox,
                            ...(selected ? styles.zoneBoxSelected : null),
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                            width: `${zone.width}%`,
                            height: `${zone.height}%`,
                          }}
                        >
                          {zone.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, ...styles.sideCard }} className="zones-side-card">
              <div style={styles.cardLabel}>Zone List</div>

              {zones.length ? (
                <div style={styles.zoneList}>
                  {zones.map((zone) => {
                    const selected = zone.id === selectedZoneId

                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        style={{
                          ...styles.zoneListItem,
                          ...(selected ? styles.zoneListItemSelected : null),
                        }}
                      >
                        <div style={styles.zoneListMeta}>
                          <div style={styles.zoneListTitle}>{zone.name}</div>
                          <div style={styles.zoneListSub}>
                            x {zone.x.toFixed(1)} · y {zone.y.toFixed(1)} · w {zone.width} · h{" "}
                            {zone.height}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            removeZone(zone.id)
                          }}
                          style={styles.deleteBtn}
                          aria-label={`Remove ${zone.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  No zones yet. Click on the map to place the first booking area.
                </div>
              )}

              {selectedZone ? (
                <div style={styles.editorCard}>
                  <div style={styles.cardLabel}>Selected Zone</div>

                  <div>
                    <label style={styles.label}>Zone Name</label>
                    <input
                      style={styles.input}
                      value={selectedZone.name}
                      onChange={(e) =>
                        updateZone(selectedZone.id, { name: e.target.value })
                      }
                    />
                  </div>

                  <div style={styles.fieldGrid} className="zones-field-grid">
                    <div>
                      <label style={styles.label}>X</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.x}
                        onChange={(e) =>
                          updateZone(selectedZone.id, {
                            x: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Y</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.y}
                        onChange={(e) =>
                          updateZone(selectedZone.id, {
                            y: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Width</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.width}
                        onChange={(e) =>
                          updateZone(selectedZone.id, {
                            width: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Height</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.height}
                        onChange={(e) =>
                          updateZone(selectedZone.id, {
                            height: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={styles.actions}>
            <Link href="/admin/signup/hybrid/create/map" style={styles.ghostBtn}>
              Back
            </Link>

            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => router.push("/admin/signup/hybrid/create")}
            >
              Save and Return to Hybrid
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}