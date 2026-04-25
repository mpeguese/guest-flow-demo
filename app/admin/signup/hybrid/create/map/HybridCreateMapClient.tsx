// app/admin/signup/hybrid/create/map/HybridCreateMapClient.tsx
"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react"
import { supabase } from "@/app/lib/supabase"

const MAP_BUCKET = "venue-maps"

type VenueMapRow = {
  id: string
  venue_id: string
  name: string
  description: string | null
  storage_bucket: string | null
  storage_path: string | null
  image_url: string | null
  image_width: number | null
  image_height: number | null
  floor_label: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9" r="1.6" />
      <path d="m21 15-4.8-4.8a1.4 1.4 0 0 0-2 0L7 17.4" />
      <path d="m10.5 14.5 1.8-1.8a1.4 1.4 0 0 1 2 0L18 16.4" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Unable to read image dimensions"))
    }

    image.src = url
  })
}

export default function HybridCreateMapClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const venueId = (searchParams.get("venueId") || "").trim()
  const from = (searchParams.get("from") || "").trim()

  const [name, setName] = useState("")
  const [floorLabel, setFloorLabel] = useState("")
  const [description, setDescription] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const venueIdFromQuery = (searchParams.get("venueId") || "").trim()

  const [maps, setMaps] = useState<VenueMapRow[]>([])
  const [loadingMaps, setLoadingMaps] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingMapId, setDeletingMapId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const [venueName, setVenueName] = useState("")
  const [loadingVenue, setLoadingVenue] = useState(true)

  useEffect(() => {
    let active = true

    async function loadMaps() {
      if (!venueId) {
        setMaps([])
        setLoadingMaps(false)
        return
      }

      setLoadingMaps(true)
      setErrorMessage("")

      const { data, error } = await supabase
        .from("venue_maps")
        .select("*")
        .eq("venue_id", venueId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })

      if (!active) return

      if (error) {
        setErrorMessage(error.message || "Unable to load maps.")
        setMaps([])
      } else {
        setMaps((data as VenueMapRow[]) || [])
      }

      setLoadingMaps(false)
    }

    void loadMaps()

    return () => {
      active = false
    }
  }, [venueId])

  useEffect(() => {
  let active = true

  async function loadVenue() {
    if (!venueId) {
      setVenueName("")
      setLoadingVenue(false)
      return
    }

    setLoadingVenue(true)

    const { data, error } = await supabase
      .from("venues")
      .select("name")
      .eq("id", venueId)
      .single()

    if (!active) return

    if (error) {
      console.error("Unable to load venue:", error)
      setVenueName("")
    } else {
      setVenueName(data?.name || "")
    }

    setLoadingVenue(false)
  }

  void loadVenue()

  return () => {
    active = false
  }
}, [venueId])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return nextUrl
    })
    setFileName(file.name)
    setSelectedFile(file)
  }

  const handleAddMap = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!venueId) {
      setErrorMessage("Missing venueId in URL.")
      return
    }

    if (!name.trim() || !selectedFile) {
      setErrorMessage("Map name and image are required.")
      return
    }

    setSubmitting(true)
    setErrorMessage("")

    try {
      const { width, height } = await getImageDimensions(selectedFile)

      const fileExt = selectedFile.name.split(".").pop() || "jpg"
      const safeName = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const filePath = `${venueId}/${Date.now()}-${safeName}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(MAP_BUCKET)
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MAP_BUCKET).getPublicUrl(filePath)

      const nextSortOrder =
        maps.length > 0 ? Math.max(...maps.map((map) => map.sort_order || 0)) + 1 : 1

      const { data: insertedMap, error: insertError } = await supabase
        .from("venue_maps")
        .insert({
          venue_id: venueId,
          name: name.trim(),
          description: description.trim() || null,
          storage_bucket: MAP_BUCKET,
          storage_path: filePath,
          image_url: publicUrl,
          image_width: width,
          image_height: height,
          floor_label: floorLabel.trim() || null,
          sort_order: nextSortOrder,
          is_active: true,
        })
        .select("*")
        .single()

      if (insertError) {
        console.error("venue_maps insert error:", insertError)

        try {
          await supabase.storage.from(MAP_BUCKET).remove([filePath])
        } catch (cleanupError) {
          console.error("storage cleanup error:", cleanupError)
        }

        throw insertError
      }

      const createdMap = insertedMap as VenueMapRow

      setMaps((prev) => [...prev, createdMap])
      setName("")
      setFloorLabel("")
      setDescription("")
      setFileName("")
      setSelectedFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return ""
      })

      if (inputRef.current) {
        inputRef.current.value = ""
      }
    } catch (error) {
      console.error("Add map failed:", error)

      const message =
        error instanceof Error
          ? error.message
          : JSON.stringify(error)

      setErrorMessage(message || "Unable to add map.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMap = async (map: VenueMapRow) => {
    const confirmed = window.confirm(
      `Delete "${map.name}"?\n\nThis will remove the map from the UI and deactivate its mapped zone placements.`
    )

    if (!confirmed) return

    setDeletingMapId(map.id)
    setErrorMessage("")

    try {
      const { error: placementError } = await supabase
        .from("venue_map_zones")
        .update({ is_active: false })
        .eq("venue_map_id", map.id)

      if (placementError) {
        throw placementError
      }

      const { error: mapError } = await supabase
        .from("venue_maps")
        .update({ is_active: false })
        .eq("id", map.id)

      if (mapError) {
        throw mapError
      }

      if (map.storage_bucket && map.storage_path) {
        try {
          await supabase.storage.from(map.storage_bucket).remove([map.storage_path])
        } catch (storageError) {
          console.error("map storage cleanup error:", storageError)
        }
      }

      setMaps((prev) => prev.filter((item) => item.id !== map.id))
    } catch (error) {
      console.error("Delete map failed:", error)

      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete map."

      setErrorMessage(message)
    } finally {
      setDeletingMapId(null)
    }
  }

  function handleBack() {
    if (from === "dashboard") {
      router.push(`/admin/dashboard?venueId=${venueId}`)
      return
    }

    router.push(`/admin/signup/hybrid/create?venueId=${venueId}`)
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: "22px 14px 96px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 1120,
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
      marginRight: 30
    },
    panel: {
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
      maxWidth: 700,
    },
    venuePill: {
      marginTop: 14,
      display: "inline-flex",
      alignItems: "center",
      minHeight: 38,
      padding: "0 14px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
      fontSize: 13,
      fontWeight: 800,
      color: "#0f172a",
    },
    errorText: {
      marginTop: 14,
      color: "#b91c1c",
      fontSize: 14,
      fontWeight: 700,
    },
    layout: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      gap: 16,
    },
    card: {
      borderRadius: 26,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.20), 0 14px 30px rgba(15,23,42,0.05)",
      padding: 18,
    },
    cardLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    formGrid: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },
    full: {
      gridColumn: "1 / -1",
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
      height: 52,
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
    textarea: {
      width: "100%",
      minHeight: 90,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.10)",
      padding: 14,
      boxSizing: "border-box",
      fontSize: 14,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    },
    uploadTile: {
      marginTop: 14,
      position: "relative",
      minHeight: 260,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.08)",
      overflow: "hidden",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px rgba(15,23,42,0.05)",
    },
    uploadBtn: {
      position: "absolute",
      inset: 0,
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
    },
    uploadPlaceholder: {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      color: "#64748b",
    },
    placeholderInner: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    },
    placeholderText: {
      fontSize: 14,
      fontWeight: 800,
      color: "#475569",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    filePill: {
      marginTop: 12,
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
    },
    footer: {
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
      minWidth: 130,
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
      minWidth: 150,
      height: 52,
      borderRadius: 16,
      border: "none",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
      opacity: submitting ? 0.7 : 1,
    },
    mapGrid: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },
    mapCard: {
      borderRadius: 22,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.08)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 28px rgba(15,23,42,0.05)",
      display: "flex",
      flexDirection: "column",
    },
    mapThumbWrap: {
      position: "relative",
      height: 180,
      background: "rgba(255,255,255,0.08)",
    },
    mapThumb: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    deleteMapBtn: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.34)",
      background: "rgba(255,255,255,0.22)",
      color: "#dc2626",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      zIndex: 20,
      boxShadow: "0 10px 22px rgba(15,23,42,0.10)",
    },
    mapBody: {
      padding: 16,
      display: "grid",
      gap: 8,
    },
    mapName: {
      fontSize: 18,
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    mapMeta: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
    },
    metaPill: {
      display: "inline-flex",
      alignItems: "center",
      minHeight: 32,
      padding: "0 12px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.16)",
      fontSize: 12,
      fontWeight: 800,
      color: "#0f172a",
    },
    mapDescription: {
      fontSize: 13,
      lineHeight: 1.55,
      color: "#64748b",
      minHeight: 40,
    },
    mapActions: {
      marginTop: 6,
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },
    mapActionBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 42,
      padding: "0 14px",
      borderRadius: 14,
      textDecoration: "none",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(15,23,42,0.88)",
      color: "#ffffff",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
    },
    emptyState: {
      marginTop: 14,
      borderRadius: 22,
      padding: 18,
      background: "rgba(255,255,255,0.08)",
      border: "1px dashed rgba(148,163,184,0.24)",
      color: "#64748b",
      fontSize: 14,
      lineHeight: 1.65,
    },
    bottomPillWrap: {
      position: "sticky",
      bottom: 12,
      zIndex: 20,
      marginTop: 18,
    },

    bottomPill: {
      maxWidth: 760,
      margin: "0 auto",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.24)",
      background: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "0 20px 44px rgba(15,23,42,0.10)",
      padding: 8,
      display: "flex",
      gap: 8,
    },

    bottomPillButton: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      border: "none",
      background: "transparent",
      color: "#475569",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: "inherit",
    },

  bottomPillPrimary: {
    flex: 1.1,
    height: 48,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)",
    color: "#FFFFFF",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 10px 22px rgba(15,23,42,0.12)",
    minWidth: 0,
    opacity: submitting ? 0.8 : 1,
  },
  }

  return (
    <div style={styles.page}>
      <style jsx>{`
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

        .zones-field-grid,
        .zones-field-grid-3 {
          grid-template-columns: 1fr !important;
        }
      }
        @media (max-width: 980px) {
          .map-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .map-form-grid,
          .map-grid {
            grid-template-columns: 1fr !important;
          }

          .map-full {
            grid-column: auto !important;
          }

          .map-title {
            font-size: 34px !important;
          }
        }
          
      `}</style>

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GL</div>

          <Link href="/admin/signup/hybrid/create" style={styles.backLink}>
            Back to SetUp
          </Link>
        </div>

        <section style={styles.panel}>
          <div style={styles.badge}>Hybrid · Maps</div>
          <div style={styles.title} className="map-title">
            Venue maps
          </div>
          <div style={styles.summary}>
            Add and manage every floor or area you want to map. Each map gets its own zone editor.
          </div>

          <div style={styles.venuePill}>
          {!venueId
            ? "Missing venueId in URL"
            : loadingVenue
            ? "Loading venue..."
            : venueName || "Venue"}
        </div>

          {/* <div style={styles.venuePill}>
            {venueId ? `Venue ID: ${venueId}` : "Missing venueId in URL"}
          </div> */}

          {errorMessage ? <div style={styles.errorText}>{errorMessage}</div> : null}

          <div style={styles.layout} className="map-layout">
            <div style={styles.card}>
              <div style={styles.cardLabel}>Add Map</div>

              <form id="venue-map-form" onSubmit={handleAddMap}>
                <div style={styles.formGrid} className="map-form-grid">
                  <div>
                    <label style={styles.label}>Map Name</label>
                    <input
                      style={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Main Floor"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Floor / Area Label</label>
                    <input
                      style={styles.input}
                      value={floorLabel}
                      onChange={(e) => setFloorLabel(e.target.value)}
                      placeholder="Floor 1, Rooftop, Patio..."
                    />
                  </div>

                  <div style={styles.full} className="map-full">
                    <label style={styles.label}>Description</label>
                    <textarea
                      style={styles.textarea}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes about this map..."
                    />
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <div style={styles.uploadTile}>
                  <button
                    type="button"
                    style={styles.uploadBtn}
                    onClick={() => inputRef.current?.click()}
                    aria-label="Upload map image"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Map preview" style={styles.previewImage} />
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <div style={styles.placeholderInner}>
                          <ImageIcon />
                          <div style={styles.placeholderText}>Tap to upload a map</div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {fileName ? <div style={styles.filePill}>{fileName}</div> : null}

                {/* <div style={styles.footer}>
                  <Link href="/admin/signup/hybrid/create" style={styles.ghostBtn}>
                    Back
                  </Link>

                  <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Adding..." : "Add Map"}
                  </button>
                </div> */}
              </form>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>Saved Maps</div>

              {loadingMaps ? (
                <div style={styles.emptyState}>Loading maps...</div>
              ) : maps.length ? (
                <div style={styles.mapGrid} className="map-grid">
                  {maps.map((map) => {
                    const isDeleting = deletingMapId === map.id

                    return (
                      <div key={map.id} style={styles.mapCard}>
                        <div style={styles.mapThumbWrap}>
                          {map.image_url ? (
                            <img src={map.image_url} alt={map.name} style={styles.mapThumb} />
                          ) : null}

                          <button
                            type="button"
                            style={{
                              ...styles.deleteMapBtn,
                              opacity: isDeleting ? 0.7 : 1,
                              cursor: isDeleting ? "not-allowed" : "pointer",
                            }}
                            disabled={isDeleting}
                            onClick={() => void handleDeleteMap(map)}
                            aria-label={`Delete ${map.name}`}
                            title="Delete map"
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <div style={styles.mapBody}>
                          <div style={styles.mapName}>{map.name}</div>

                          <div style={styles.mapMeta}>
                            {map.floor_label ? (
                              <div style={styles.metaPill}>{map.floor_label}</div>
                            ) : null}

                            <div style={styles.metaPill}>Order {map.sort_order}</div>
                          </div>

                          <div style={styles.mapDescription}>
                            {map.description || "No description added yet."}
                          </div>

                          <div style={styles.mapActions}>
                            <button
                              type="button"
                              style={styles.mapActionBtn}
                              onClick={() =>
                                router.push(
                                  `/admin/signup/hybrid/create/zones/${map.id}?venueId=${venueId}&from=setup`
                                )
                              }
                            >
                              Edit Zones
                              <ArrowRightIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  No maps added yet. Add your first floor or area map here.
                </div>
              )}
            </div>
          </div>
          
        </section>
      </div>
      <section style={styles.bottomPillWrap}>
        <div style={styles.bottomPill}>
          <button
            type="button"
            onClick={handleBack}
            //onClick={() => router.push(`/admin/dashboard?venueId=${venueIdFromQuery}`)}
            style={styles.bottomPillButton}
          >
            Back
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              const form = document.getElementById("venue-map-form") as HTMLFormElement | null
              form?.requestSubmit()
            }}
            style={styles.bottomPillPrimary}
          >
            {submitting ? "Adding..." : "Add Map"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/dashboard?venueId=${venueId}`)}
            style={styles.bottomPillButton}
          >
            Dashboard
          </button>
        </div>
      </section>
    </div>
  )
}