// app/admin/signup/hybrid/create/zones/[mapId]/page.tsx
"use client"

import Link from "next/link"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

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

type VenueZoneRow = {
  id: string
  venue_id: string
  code: string
  name: string
  slug: string | null
  description: string | null
  zone_type: string
  access_type: string
  capacity: number | null
  min_guests: number | null
  max_guests: number | null
  base_price: number | null
  deposit_amount: number | null
  minimum_spend: number | null
  currency: string
  status: string
  inventory_mode: string
  display_order: number
  image_url: string | null
  notes: string | null
  metadata: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type VenueMapZoneRow = {
  id: string
  venue_map_id: string
  venue_zone_id: string
  shape_type: string
  x_pct: number
  y_pct: number
  w_pct: number
  h_pct: number
  rotation_deg: number | null
  z_index: number
  polygon_points: unknown
  metadata: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type ZoneRecord = {
  id: string
  venueZoneId: string
  code: string
  name: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
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

type ImageBox = {
  left: number
  top: number
  width: number
  height: number
}

type ZoneDetailsForm = {
  id: string
  venue_id: string
  code: string
  name: string
  slug: string
  description: string
  zone_type: string
  access_type: string
  capacity: string
  min_guests: string
  max_guests: string
  base_price: string
  deposit_amount: string
  minimum_spend: string
  currency: string
  status: string
  inventory_mode: string
  display_order: string
  image_url: string
  notes: string
  is_active: boolean
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function computeContainedImageBox(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageBox {
  if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
    return { left: 0, top: 0, width: containerWidth, height: containerHeight }
  }

  const containerRatio = containerWidth / containerHeight
  const imageRatio = imageWidth / imageHeight

  let width = containerWidth
  let height = containerHeight

  if (imageRatio > containerRatio) {
    width = containerWidth
    height = width / imageRatio
  } else {
    height = containerHeight
    width = height * imageRatio
  }

  const left = (containerWidth - width) / 2
  const top = (containerHeight - height) / 2

  return { left, top, width, height }
}

function toInputValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function buildZoneDetailsForm(zone: VenueZoneRow): ZoneDetailsForm {
  return {
    id: zone.id,
    venue_id: zone.venue_id,
    code: zone.code || "",
    name: zone.name || "",
    slug: zone.slug || "",
    description: zone.description || "",
    zone_type: zone.zone_type || "table",
    access_type: zone.access_type || "reservation",
    capacity: toInputValue(zone.capacity),
    min_guests: toInputValue(zone.min_guests),
    max_guests: toInputValue(zone.max_guests),
    base_price: toInputValue(zone.base_price),
    deposit_amount: toInputValue(zone.deposit_amount),
    minimum_spend: toInputValue(zone.minimum_spend),
    currency: zone.currency || "USD",
    status: zone.status || "active",
    inventory_mode: zone.inventory_mode || "single",
    display_order: toInputValue(zone.display_order),
    image_url: zone.image_url || "",
    notes: zone.notes || "",
    is_active: Boolean(zone.is_active),
  }
}

function parseNullableInt(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseNullableNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

export default function HybridZonesPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const mapId = String(params?.mapId || "")
  const venueIdFromQuery = (searchParams.get("venueId") || "").trim()

  const viewportRef = useRef<HTMLDivElement | null>(null)

  const [mapRecord, setMapRecord] = useState<VenueMapRow | null>(null)
  const [zones, setZones] = useState<ZoneRecord[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [panState, setPanState] = useState<PanState | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingZoneDetails, setLoadingZoneDetails] = useState(false)
  const [savingZoneDetails, setSavingZoneDetails] = useState(false)
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [selectedZoneDetails, setSelectedZoneDetails] = useState<VenueZoneRow | null>(null)
  const [zoneForm, setZoneForm] = useState<ZoneDetailsForm | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [imageBox, setImageBox] = useState<ImageBox>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const movedDuringPanRef = useRef(false)

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) ?? null,
    [zones, selectedZoneId]
  )

  useEffect(() => {
    let active = true

    async function loadMapAndZones() {
      if (!mapId) {
        setLoading(false)
        setErrorMessage("Missing mapId in route.")
        return
      }

      setLoading(true)
      setErrorMessage("")

      const { data: mapData, error: mapError } = await supabase
        .from("venue_maps")
        .select("*")
        .eq("id", mapId)
        .single()

      if (!active) return

      if (mapError) {
        setErrorMessage(mapError.message || "Unable to load map.")
        setLoading(false)
        return
      }

      const mapRow = mapData as VenueMapRow
      setMapRecord(mapRow)

      const { data: placementRows, error: placementError } = await supabase
        .from("venue_map_zones")
        .select("*")
        .eq("venue_map_id", mapId)
        .eq("is_active", true)
        .order("z_index", { ascending: true })
        .order("created_at", { ascending: true })

      if (!active) return

      if (placementError) {
        setErrorMessage(placementError.message || "Unable to load placements.")
        setZones([])
        setLoading(false)
        return
      }

      const placements = (placementRows as VenueMapZoneRow[]) || []
      const venueZoneIds = placements.map((placement) => placement.venue_zone_id)

      let venueZones: VenueZoneRow[] = []

      if (venueZoneIds.length) {
        const { data: zoneRows, error: zoneError } = await supabase
          .from("venue_zones")
          .select("*")
          .in("id", venueZoneIds)
          .eq("is_active", true)

        if (!active) return

        if (zoneError) {
          setErrorMessage(zoneError.message || "Unable to load venue zones.")
          setZones([])
          setLoading(false)
          return
        }

        venueZones = (zoneRows as VenueZoneRow[]) || []
      }

      const venueZoneMap = new Map(venueZones.map((zone) => [zone.id, zone]))

      const normalized: ZoneRecord[] = placements
        .map((placement) => {
          const zone = venueZoneMap.get(placement.venue_zone_id)
          if (!zone) return null

          return {
            id: placement.id,
            venueZoneId: placement.venue_zone_id,
            code: zone.code,
            name: zone.name,
            x: Number(placement.x_pct),
            y: Number(placement.y_pct),
            width: Number(placement.w_pct),
            height: Number(placement.h_pct),
            zIndex: placement.z_index,
          }
        })
        .filter(Boolean) as ZoneRecord[]

      setZones(normalized)
      setLoading(false)
    }

    void loadMapAndZones()

    return () => {
      active = false
    }
  }, [mapId])

  useEffect(() => {
    const updateImageBox = () => {
      const viewport = viewportRef.current
      if (!viewport || !mapRecord?.image_width || !mapRecord?.image_height) return

      const rect = viewport.getBoundingClientRect()
      const nextBox = computeContainedImageBox(
        rect.width,
        rect.height,
        Number(mapRecord.image_width),
        Number(mapRecord.image_height)
      )
      setImageBox(nextBox)
    }

    updateImageBox()

    const viewport = viewportRef.current
    if (!viewport) return

    const observer = new ResizeObserver(() => {
      updateImageBox()
    })

    observer.observe(viewport)
    window.addEventListener("resize", updateImageBox)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateImageBox)
    }
  }, [mapRecord?.image_width, mapRecord?.image_height])

  useEffect(() => {
    let active = true

    async function loadSelectedZoneDetails() {
      if (!selectedZone?.venueZoneId) {
        setSelectedZoneDetails(null)
        setZoneForm(null)
        return
      }

      setLoadingZoneDetails(true)

      const { data, error } = await supabase
        .from("venue_zones")
        .select("*")
        .eq("id", selectedZone.venueZoneId)
        .single()

      if (!active) return

      if (error) {
        setErrorMessage(error.message || "Unable to load zone details.")
        setSelectedZoneDetails(null)
        setZoneForm(null)
      } else {
        const zoneRow = data as VenueZoneRow
        setSelectedZoneDetails(zoneRow)
        setZoneForm(buildZoneDetailsForm(zoneRow))
      }

      setLoadingZoneDetails(false)
    }

    void loadSelectedZoneDetails()

    return () => {
      active = false
    }
  }, [selectedZone?.venueZoneId])

  const toMapPercent = (clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect || !imageBox.width || !imageBox.height) return null

    const contentX = (clientX - rect.left - panX) / zoom
    const contentY = (clientY - rect.top - panY) / zoom

    const localX = contentX - imageBox.left
    const localY = contentY - imageBox.top

    if (localX < 0 || localY < 0 || localX > imageBox.width || localY > imageBox.height) {
      return null
    }

    const mapX = (localX / imageBox.width) * 100
    const mapY = (localY / imageBox.height) * 100

    return { x: mapX, y: mapY }
  }

  const addZoneAtPoint = async (event: MouseEvent<HTMLDivElement>) => {
    if (dragState || !mapId || !mapRecord) return

    if (movedDuringPanRef.current) {
      movedDuringPanRef.current = false
      return
    }

    const point = toMapPercent(event.clientX, event.clientY)
    if (!point) return

    const width = 16
    const height = 12
    const nextZIndex = zones.length > 0 ? Math.max(...zones.map((zone) => zone.zIndex)) + 1 : 1
    const zoneNumber = zones.length + 1
    const zoneName = `Zone ${zoneNumber}`
    const zoneCode = `ZONE-${zoneNumber}`

    setSaving(true)
    setErrorMessage("")

    try {
      const { data: venueZoneData, error: venueZoneError } = await supabase
        .from("venue_zones")
        .insert({
          venue_id: mapRecord.venue_id,
          code: zoneCode,
          name: zoneName,
          slug: slugify(zoneName),
          description: null,
          zone_type: "table",
          access_type: "reservation",
          display_order: nextZIndex,
          metadata: null,
          is_active: true,
        })
        .select("*")
        .single()

      if (venueZoneError) {
        throw venueZoneError
      }

      const venueZone = venueZoneData as VenueZoneRow

      const { data: placementData, error: placementError } = await supabase
        .from("venue_map_zones")
        .insert({
          venue_map_id: mapId,
          venue_zone_id: venueZone.id,
          shape_type: "rect",
          x_pct: clamp(Number((point.x - width / 2).toFixed(2)), 0, 100 - width),
          y_pct: clamp(Number((point.y - height / 2).toFixed(2)), 0, 100 - height),
          w_pct: width,
          h_pct: height,
          rotation_deg: null,
          z_index: nextZIndex,
          polygon_points: null,
          metadata: { name: zoneName },
          is_active: true,
        })
        .select("*")
        .single()

      if (placementError) {
        await supabase.from("venue_zones").update({ is_active: false }).eq("id", venueZone.id)
        throw placementError
      }

      const placement = placementData as VenueMapZoneRow

      const nextZone: ZoneRecord = {
        id: placement.id,
        venueZoneId: venueZone.id,
        code: venueZone.code,
        name: venueZone.name,
        x: Number(placement.x_pct),
        y: Number(placement.y_pct),
        width: Number(placement.w_pct),
        height: Number(placement.h_pct),
        zIndex: placement.z_index,
      }

      setZones((prev) => [...prev, nextZone])
      setSelectedZoneId(nextZone.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create zone."
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const updateZoneLocal = (id: string, updates: Partial<ZoneRecord>) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone))
    )
  }

  const savePlacementToDb = async (zone: ZoneRecord) => {
    const { error } = await supabase
      .from("venue_map_zones")
      .update({
        x_pct: Number(zone.x.toFixed(2)),
        y_pct: Number(zone.y.toFixed(2)),
        w_pct: Number(zone.width.toFixed(2)),
        h_pct: Number(zone.height.toFixed(2)),
        metadata: { name: zone.name },
      })
      .eq("id", zone.id)

    if (error) {
      setErrorMessage(error.message || "Unable to save zone placement.")
    }
  }

  const saveVenueZoneNameToDb = async (zone: ZoneRecord) => {
    const nextSlug = slugify(zone.name)

    const { error } = await supabase
      .from("venue_zones")
      .update({
        name: zone.name,
        slug: nextSlug || null,
      })
      .eq("id", zone.venueZoneId)

    if (error) {
      setErrorMessage(error.message || "Unable to save venue zone.")
      return
    }

    setSelectedZoneDetails((prev) =>
      prev && prev.id === zone.venueZoneId
        ? {
            ...prev,
            name: zone.name,
            slug: nextSlug || null,
          }
        : prev
    )

    setZoneForm((prev) =>
      prev && prev.id === zone.venueZoneId
        ? {
            ...prev,
            name: zone.name,
            slug: nextSlug || "",
          }
        : prev
    )
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

      updateZoneLocal(zone.id, {
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

  const clearInteractions = async () => {
    if (dragState) {
      const zone = zones.find((item) => item.id === dragState.zoneId)
      if (zone) {
        await savePlacementToDb(zone)
      }
    }

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

  const handleDeleteZone = async (zone: ZoneRecord) => {
    const confirmed = window.confirm(
      `Delete "${zone.name}"?\n\nThis will deactivate the zone placement and the underlying venue zone record.`
    )

    if (!confirmed) return

    setSaving(true)
    setErrorMessage("")

    try {
      const { error: placementError } = await supabase
        .from("venue_map_zones")
        .update({ is_active: false })
        .eq("id", zone.id)

      if (placementError) {
        throw placementError
      }

      const { error: venueZoneError } = await supabase
        .from("venue_zones")
        .update({ is_active: false })
        .eq("id", zone.venueZoneId)

      if (venueZoneError) {
        throw venueZoneError
      }

      setZones((prev) => prev.filter((item) => item.id !== zone.id))
      setSelectedZoneId((prev) => (prev === zone.id ? null : prev))
      setDragState((prev) => (prev?.zoneId === zone.id ? null : prev))
      setSelectedZoneDetails((prev) => (prev?.id === zone.venueZoneId ? null : prev))
      setZoneForm((prev) => (prev?.id === zone.venueZoneId ? null : prev))
      setIsZoneModalOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove zone."
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectedZoneFieldChange = async (
    id: string,
    updates: Partial<ZoneRecord>
  ) => {
    const currentZone = zones.find((zone) => zone.id === id)
    if (!currentZone) return

    const merged = { ...currentZone, ...updates }
    updateZoneLocal(id, updates)

    if (updates.name !== undefined) {
      await saveVenueZoneNameToDb(merged)
    }

    if (
      updates.x !== undefined ||
      updates.y !== undefined ||
      updates.width !== undefined ||
      updates.height !== undefined
    ) {
      await savePlacementToDb(merged)
    }
  }

  const openZoneDetailsModal = () => {
    if (!selectedZone) return
    setIsZoneModalOpen(true)
  }

  const closeZoneDetailsModal = () => {
    setIsZoneModalOpen(false)
  }

  const handleZoneFormChange = (
    field: keyof ZoneDetailsForm,
    value: string | boolean
  ) => {
    setZoneForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleSaveZoneDetails = async () => {
    if (!selectedZone || !zoneForm) return

    const trimmedName = zoneForm.name.trim()
    const trimmedCode = zoneForm.code.trim()

    if (!trimmedName) {
      setErrorMessage("Zone name is required.")
      return
    }

    if (!trimmedCode) {
      setErrorMessage("Zone code is required.")
      return
    }

    setSavingZoneDetails(true)
    setErrorMessage("")

    try {
      const nextSlug = zoneForm.slug.trim() || slugify(trimmedName)

      const updatePayload = {
        code: trimmedCode,
        name: trimmedName,
        slug: nextSlug || null,
        description: zoneForm.description.trim() || null,
        zone_type: zoneForm.zone_type.trim() || "table",
        access_type: zoneForm.access_type.trim() || "reservation",
        capacity: parseNullableInt(zoneForm.capacity),
        min_guests: parseNullableInt(zoneForm.min_guests),
        max_guests: parseNullableInt(zoneForm.max_guests),
        base_price: parseNullableNumber(zoneForm.base_price),
        deposit_amount: parseNullableNumber(zoneForm.deposit_amount),
        minimum_spend: parseNullableNumber(zoneForm.minimum_spend),
        currency: zoneForm.currency.trim() || "USD",
        status: zoneForm.status.trim() || "active",
        inventory_mode: zoneForm.inventory_mode.trim() || "single",
        display_order: parseNullableInt(zoneForm.display_order) ?? 0,
        image_url: zoneForm.image_url.trim() || null,
        notes: zoneForm.notes.trim() || null,
        is_active: Boolean(zoneForm.is_active),
      }

      const { data, error } = await supabase
        .from("venue_zones")
        .update(updatePayload)
        .eq("id", selectedZone.venueZoneId)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const updatedZone = data as VenueZoneRow

      setSelectedZoneDetails(updatedZone)
      setZoneForm(buildZoneDetailsForm(updatedZone))

      setZones((prev) =>
        prev.map((zone) =>
          zone.id === selectedZone.id
            ? {
                ...zone,
                name: updatedZone.name,
                code: updatedZone.code,
              }
            : zone
        )
      )

      closeZoneDetailsModal()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save zone details."
      setErrorMessage(message)
    } finally {
      setSavingZoneDetails(false)
    }
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
    mapIdPill: {
      marginTop: 14,
      display: "inline-flex",
      alignItems: "center",
      minHeight: 36,
      padding: "0 14px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
      fontSize: 13,
      fontWeight: 800,
      color: "#0f172a",
    },
    errorText: {
      marginTop: 12,
      color: "#b91c1c",
      fontSize: 14,
      fontWeight: 700,
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
    imageBoxStyle: {
      position: "absolute",
      overflow: "hidden",
      borderRadius: 4,
    },
    mapImageEl: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
      pointerEvents: "none",
    },
    gridOverlay: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
      backgroundSize: "36px 36px",
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
      boxSizing: "border-box",
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
    zoneActionRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    editMiniBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: "1px solid rgba(15,23,42,0.12)",
      background: "rgba(255,255,255,0.16)",
      color: "#0f172a",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      flexShrink: 0,
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
    fieldGridThree: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12,
    },
    fullField: {
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
      height: 48,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.30)",
      background: "rgba(255,255,255,0.22)",
      padding: "0 14px",
      boxSizing: "border-box",
      fontSize: 14,
      fontWeight: 700,
      color: "#0f172a",
      outline: "none",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
    },
    select: {
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
      appearance: "none",
    },
    textarea: {
      width: "100%",
      minHeight: 100,
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
    toggleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 52,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.10)",
      padding: "0 14px",
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f172a",
    },
    checkbox: {
      width: 18,
      height: 18,
      cursor: "pointer",
    },
    editorActionRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },
    secondaryBtn: {
      minWidth: 150,
      height: 46,
      borderRadius: 14,
      border: "1px solid rgba(15,23,42,0.10)",
      background: "rgba(255,255,255,0.18)",
      color: "#0f172a",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
    },
    modalBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(2,6,23,0.44)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    },
    modalSheet: {
      width: "min(920px, 100%)",
      maxHeight: "min(88vh, 920px)",
      overflow: "auto",
      borderRadius: 20,
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      padding: 20,
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
      position: "sticky",
      top: 0,
      zIndex: 2,
      //background: "rgba(248,250,252,0.96)",
      padding: "4px 2px 12px",
    },
    modalTitleWrap: {
      display: "grid",
      gap: 6,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 900,
      color: "#020617",
      letterSpacing: "-0.6px",
    },
    modalSub: {
      fontSize: 13,
      fontWeight: 700,
      color: "#64748b",
    },
    modalScrollBody: {
      overflowY: "auto",
      maxHeight: "min(88vh, 920px)",
      padding: 20,
      scrollbarWidth: "thin",
    },
    closeBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      border: "1px solid rgba(15,23,42,0.10)",
      background: "rgba(255,255,255,0.22)",
      color: "#0f172a",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      flexShrink: 0,
    },
    modalSection: {
      marginTop: 12,
      borderRadius: 22,
      padding: 16,
      background: "rgba(255,255,255,0.16)",
      border: "1px solid rgba(255,255,255,0.28)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
      display: "grid",
      gap: 14,
    },
   modalSectionTitle: {
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#334155",
    },
    modalFooter: {
      marginTop: 18,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      position: "sticky",
      bottom: 0,
      paddingTop: 12,
      //background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(248,250,252,0.72) 38%)",
      //backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
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
      opacity: saving ? 0.7 : 1,
    },
  }

  return (
    <div style={styles.page}>
      <style jsx>{`
  .zones-modal-sheet::-webkit-scrollbar {
    width: 10px;
  }

  .zones-modal-sheet::-webkit-scrollbar-track {
    margin-top: 22px;
    margin-bottom: 22px;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
  }

  .zones-modal-sheet::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(15,23,42,0.28);
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  @media (max-width: 980px) {
    .zones-layout {
      grid-template-columns: 1fr !important;
    }

    .zones-field-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .zones-field-grid-3 {
      grid-template-columns: 1fr 1fr !important;
    }
  }

  @media (max-width: 700px) {
    .zones-modal-sheet {
      width: 100% !important;
      max-height: 92vh !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      border-top-left-radius: 26px !important;
      border-top-right-radius: 26px !important;
      align-self: flex-end !important;
      margin-top: auto !important;
    }

    .zones-modal-backdrop {
      align-items: flex-end !important;
      padding: 0 !important;
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

    .zones-field-grid,
    .zones-field-grid-3 {
      grid-template-columns: 1fr !important;
    }
  }
`}</style>

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GF</div>

          <Link
            href={`/admin/signup/hybrid/create/map?venueId=${venueIdFromQuery || mapRecord?.venue_id || ""}`}
            style={styles.backLink}
          >
            Back to Maps
          </Link>
        </div>

        <section style={styles.heroPanel}>
          <div style={styles.badge}>Hybrid · Venue Zones</div>
          <div style={styles.title} className="zones-title">
            Edit venue zones for this map
          </div>
          <div style={styles.summary}>
            Zones stay anchored to the rendered image area, while zone details can now be edited separately from placement.
          </div>

          <div style={styles.mapIdPill}>
            {mapRecord
              ? `${mapRecord.name}${mapRecord.floor_label ? ` · ${mapRecord.floor_label}` : ""}`
              : `Map ID: ${mapId}`}
          </div>

          {errorMessage ? <div style={styles.errorText}>{errorMessage}</div> : null}

          <div style={styles.helperPills}>
            <div style={styles.helperPill}>Click to add zone</div>
            <div style={styles.helperPill}>Drag zone to move</div>
            <div style={styles.helperPill}>Drag canvas to pan</div>
            <div style={styles.helperPill}>Zone details edit separately</div>
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
                  >
                    <MinusIcon />
                  </button>

                  <div style={styles.zoomPill}>{Math.round(zoom * 100)}%</div>

                  <button
                    type="button"
                    style={styles.toolBtn}
                    onClick={() => changeZoom(zoom + 0.2)}
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
                    {loading
                      ? "Loading map…"
                      : dragState
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
                    <div
                      style={{
                        ...styles.imageBoxStyle,
                        left: imageBox.left,
                        top: imageBox.top,
                        width: imageBox.width,
                        height: imageBox.height,
                      }}
                    >
                      {mapRecord?.image_url ? (
                        <img
                          src={mapRecord.image_url}
                          alt={mapRecord.name}
                          style={styles.mapImageEl}
                        />
                      ) : null}
                      <div style={styles.gridOverlay} />
                    </div>

                    {zones.map((zone) => {
                      const selected = zone.id === selectedZoneId

                      return (
                        <button
                          key={zone.id}
                          type="button"
                          data-zone="true"
                          onPointerDown={(event) => handleZonePointerDown(event, zone)}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedZoneId(zone.id)
                          }}
                          style={{
                            ...styles.zoneBox,
                            ...(selected ? styles.zoneBoxSelected : null),
                            left: imageBox.left + (zone.x / 100) * imageBox.width,
                            top: imageBox.top + (zone.y / 100) * imageBox.height,
                            width: (zone.width / 100) * imageBox.width,
                            height: (zone.height / 100) * imageBox.height,
                            zIndex: zone.zIndex,
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
              <div style={styles.cardLabel}>Venue Zone List</div>

              {loading ? (
                <div style={styles.emptyState}>Loading zones...</div>
              ) : zones.length ? (
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
                            {zone.code} · x {zone.x.toFixed(1)} · y {zone.y.toFixed(1)}
                          </div>
                        </div>

                        <div style={styles.zoneActionRow}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedZoneId(zone.id)
                              setIsZoneModalOpen(true)
                            }}
                            style={styles.editMiniBtn}
                            aria-label={`Edit details for ${zone.name}`}
                            title="Edit details"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleDeleteZone(zone)
                            }}
                            style={styles.deleteBtn}
                            aria-label={`Remove ${zone.name}`}
                            title="Delete zone"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  No venue zones yet. Click on the image to place the first zone.
                </div>
              )}

              {selectedZone ? (
                <div style={styles.editorCard}>
                  <div style={styles.cardLabel}>Selected Venue Zone</div>

                  <div>
                    <label style={styles.label}>Zone Name</label>
                    <input
                      style={styles.input}
                      value={selectedZone.name}
                      onChange={(e) => {
                        void handleSelectedZoneFieldChange(selectedZone.id, {
                          name: e.target.value,
                        })
                      }}
                    />
                  </div>

                  <div style={styles.fieldGrid} className="zones-field-grid">
                    <div>
                      <label style={styles.label}>X</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.x}
                        onChange={(e) => {
                          void handleSelectedZoneFieldChange(selectedZone.id, {
                            x: Number(e.target.value) || 0,
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Y</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.y}
                        onChange={(e) => {
                          void handleSelectedZoneFieldChange(selectedZone.id, {
                            y: Number(e.target.value) || 0,
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Width</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.width}
                        onChange={(e) => {
                          void handleSelectedZoneFieldChange(selectedZone.id, {
                            width: Number(e.target.value) || 0,
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Height</label>
                      <input
                        style={styles.input}
                        type="number"
                        value={selectedZone.height}
                        onChange={(e) => {
                          void handleSelectedZoneFieldChange(selectedZone.id, {
                            height: Number(e.target.value) || 0,
                          })
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.editorActionRow}>
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={openZoneDetailsModal}
                      disabled={loadingZoneDetails}
                    >
                      {loadingZoneDetails ? "Loading details..." : "Edit Zone Details"}
                    </button>

                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => void handleDeleteZone(selectedZone)}
                    >
                      Delete Zone
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={styles.modalFooter}>
            <Link
              href={`/admin/signup/hybrid/create/map?venueId=${venueIdFromQuery || mapRecord?.venue_id || ""}`}
              style={styles.ghostBtn}
            >
              Back to Maps
            </Link>

            <button
              type="button"
              style={styles.primaryBtn}
              disabled={saving}
              onClick={() =>
                router.push(
                  `/admin/signup/hybrid/create?venueId=${venueIdFromQuery || mapRecord?.venue_id || ""}`
                )
              }
            >
              {saving ? "Saving..." : "Return to Hybrid"}
            </button>
          </div>
        </section>
      </div>

      {isZoneModalOpen && zoneForm ? (
        <div
          style={styles.modalBackdrop}
          className="zones-modal-backdrop"
          onClick={closeZoneDetailsModal}
        >
          <div
            style={styles.modalSheet}
            className="zones-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleWrap}>
                <div style={styles.modalTitle}>Edit Zone Details</div>
                <div style={styles.modalSub}>
                  {zoneForm.name || "Selected zone"} · {zoneForm.code || "No code"}
                </div>
              </div>

              <button
                type="button"
                style={styles.closeBtn}
                onClick={closeZoneDetailsModal}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Core Details</div>

              <div style={styles.fieldGrid} className="zones-field-grid">
                <div>
                  <label style={styles.label}>Zone Name</label>
                  <input
                    style={styles.input}
                    value={zoneForm.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Code</label>
                  <input
                    style={styles.input}
                    value={zoneForm.code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("code", e.target.value)
                    }
                  />
                </div>

                <div style={styles.fullField}>
                  <label style={styles.label}>Slug</label>
                  <input
                    style={styles.input}
                    value={zoneForm.slug}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("slug", e.target.value)
                    }
                    placeholder="Leave blank to auto-generate from name"
                  />
                </div>

                <div style={styles.fullField}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    value={zoneForm.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleZoneFormChange("description", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Commercial Settings</div>

              <div style={styles.fieldGridThree} className="zones-field-grid-3">
                <div>
                  <label style={styles.label}>Zone Type</label>
                  <select
                    style={styles.select}
                    value={zoneForm.zone_type}
                    onChange={(e) => handleZoneFormChange("zone_type", e.target.value)}
                  >
                    <option value="table">table</option>
                    <option value="section">section</option>
                    <option value="standing">standing</option>
                    <option value="seat">seat</option>
                    <option value="bar">bar</option>
                    <option value="cabana">cabana</option>
                    <option value="booth">booth</option>
                    <option value="general">general</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Access Type</label>
                  <select
                    style={styles.select}
                    value={zoneForm.access_type}
                    onChange={(e) => handleZoneFormChange("access_type", e.target.value)}
                  >
                    <option value="reservation">reservation</option>
                    <option value="ticket">ticket</option>
                    <option value="guestlist">guestlist</option>
                    <option value="admission">admission</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Currency</label>
                  <input
                    style={styles.input}
                    value={zoneForm.currency}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("currency", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Capacity</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={zoneForm.capacity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("capacity", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Min Guests</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={zoneForm.min_guests}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("min_guests", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Max Guests</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={zoneForm.max_guests}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("max_guests", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Base Price</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={zoneForm.base_price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("base_price", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Deposit Amount</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={zoneForm.deposit_amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("deposit_amount", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={styles.label}>Minimum Spend</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={zoneForm.minimum_spend}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("minimum_spend", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Behavior & Display</div>

              <div style={styles.fieldGridThree} className="zones-field-grid-3">
                <div>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    value={zoneForm.status}
                    onChange={(e) => handleZoneFormChange("status", e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="draft">draft</option>
                    <option value="hidden">hidden</option>
                    <option value="sold_out">sold_out</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Inventory Mode</label>
                  <select
                    style={styles.select}
                    value={zoneForm.inventory_mode}
                    onChange={(e) => handleZoneFormChange("inventory_mode", e.target.value)}
                  >
                    <option value="single">single</option>
                    <option value="shared">shared</option>
                    <option value="pooled">pooled</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Display Order</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={zoneForm.display_order}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("display_order", e.target.value)
                    }
                  />
                </div>

                <div style={styles.fullField}>
                  <div style={styles.toggleRow}>
                    <div style={styles.toggleLabel}>Zone Active</div>
                    <input
                      style={styles.checkbox}
                      type="checkbox"
                      checked={zoneForm.is_active}
                      onChange={(e) => handleZoneFormChange("is_active", e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Optional Media & Notes</div>

              <div style={styles.fieldGrid} className="zones-field-grid">
                <div style={styles.fullField}>
                  <label style={styles.label}>Image URL</label>
                  <input
                    style={styles.input}
                    value={zoneForm.image_url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleZoneFormChange("image_url", e.target.value)
                    }
                  />
                </div>

                <div style={styles.fullField}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={styles.textarea}
                    value={zoneForm.notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleZoneFormChange("notes", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.ghostBtn}
                onClick={closeZoneDetailsModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.primaryBtn,
                  opacity: savingZoneDetails ? 0.7 : 1,
                }}
                onClick={() => void handleSaveZoneDetails()}
                disabled={savingZoneDetails}
              >
                {savingZoneDetails ? "Saving..." : "Save Zone Details"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}