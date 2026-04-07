// app/lib/booking-queries.ts
import { supabase } from "@/app/lib/supabase"
import type { VenueZone, VenueZoneType, ZoneStatus } from "@/app/lib/booking-data"

type DbEventMediaRow = {
  id: string
  media_type: "image" | "video" | string
  placement:
    | "flyer"
    | "cover"
    | "hero"
    | "gallery"
    | "tickets"
    | "map"
    | "promo"
    | string
  storage_path: string
  thumbnail_path: string | null
  alt_text: string | null
  sort_order: number | null
  is_primary: boolean | null
  is_active: boolean | null
}

type DbEventRow = {
  id: string
  slug: string
  title: string
  description: string | null
  start_at: string | null
  end_at: string | null
  flyer_image_url: string | null
  cover_image_url: string | null
  booking_type: string | null
  venue_id: string | null
  venues:
    | {
        name: string | null
      }
    | {
        name: string | null
      }[]
    | null
  event_media: DbEventMediaRow[] | null
}

type DbTicketTypeRow = {
  id: string
  name: string
  subtitle: string | null
  description: string | null
  price: number | string | null
  quantity_total: number | null
  quantity_sold: number | null
  per_order_limit: number | null
  sort_order: number | null
  is_visible: boolean | null
  image_path: string | null
  benefits: string[] | null
  badge_label: string | null
  sales_status: string | null
  status: string | null
}

type DbEventDateRow = {
  id: string
  event_id: string
  start_at: string | null
}

type DbReservationRow = {
  table_area_id: string
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "cancelled"
    | "no_show"
    | "expired"
    | string
  hold_expires_at: string | null
  session: string | null
}

type DbTableAreaStatusRow = {
  id: string
  map_zone_code: string | null
  is_visible: boolean | null
}

type DbVenueMapRow = {
  id: string
  name: string | null
  floor_label: string | null
  storage_path: string | null
  is_active: boolean | null
}

type DbEventMapRow = {
  venue_map_id: string
  is_default: boolean | null
  sort_order: number | null
  venue_maps: DbVenueMapRow | DbVenueMapRow[] | null
}

type DbTableZoneJoinRow = {
  code: string | null
  name: string | null
  description: string | null
  zone_type: string | null
  capacity: number | null
  min_guests: number | null
  max_guests: number | null
  base_price: number | string | null
  deposit_amount: number | string | null
  minimum_spend: number | string | null
  display_order: number | null
  is_active: boolean | null
}

type DbMapZoneRow = {
  x_pct: number | string | null
  y_pct: number | string | null
  w_pct: number | string | null
  h_pct: number | string | null
  rotation_deg: number | string | null
  z_index: number | null
  is_active: boolean | null
  table_zones: DbTableZoneJoinRow | DbTableZoneJoinRow[] | null
}

type MappedVenueZone = VenueZone & {
  code?: string
  xPct?: number
  yPct?: number
  wPct?: number
  hPct?: number
  rotationDeg?: number
  zIndex?: number
}

export type EventBookingMeta = {
  id: string
  slug: string
  name: string
  venueName: string
  description: string
  date: string
  timeLabel: string
  flyerSrc: string
  coverSrc?: string
  promoVideoSrc?: string
  heroImages: string[]
  ticketImages: string[]
  mapImages: string[]
  hasTickets: boolean
  hasTables: boolean
  mapPath: string
}

export type TicketTypeProduct = {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  imageSrc: string
  benefits: string[]
  badgeLabel?: string
  perOrderLimit?: number
  quantityTotal?: number
  quantitySold?: number
  isSoldOut: boolean
  sortOrder: number
}

export type ReservationStatusMap = Record<string, ZoneStatus>

const PUBLIC_MEDIA_BUCKET = "event-assets"

function normalizeZoneType(value: string | null): VenueZoneType {
  if (
    value === "table" ||
    value === "bed" ||
    value === "cabana" ||
    value === "booth" ||
    value === "sofa" ||
    value === "vip"
  ) {
    return value
  }

  return "table"
}

function normalizeStoragePath(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null

  const trimmed = storagePath.trim()
  if (!trimmed) return null

  if (trimmed.startsWith(`${PUBLIC_MEDIA_BUCKET}/`)) {
    return trimmed.slice(PUBLIC_MEDIA_BUCKET.length + 1)
  }

  return trimmed
}

function toPublicMediaUrl(storagePath: string | null | undefined): string | null {
  const normalizedPath = normalizeStoragePath(storagePath)
  if (!normalizedPath) return null

  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(normalizedPath)
  return data?.publicUrl || null
}

function formatEventDate(dateValue: string | null): string {
  if (!dateValue) return ""

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString().slice(0, 10)
}

function formatEventTimeLabel(startAt: string | null): string {
  if (!startAt) return "Time TBA"

  const date = new Date(startAt)
  if (Number.isNaN(date.getTime())) return "Time TBA"

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: date.getUTCMinutes() === 0 ? undefined : "2-digit",
    timeZone: "America/New_York",
  }).format(date)

  return `Doors ${formattedTime}`
}

function getVenueName(venueValue: DbEventRow["venues"]): string {
  if (!venueValue) return "Venue TBA"

  if (Array.isArray(venueValue)) {
    return venueValue[0]?.name || "Venue TBA"
  }

  return venueValue.name || "Venue TBA"
}

function selectPrimaryMedia(
  media: DbEventMediaRow[],
  placement: string,
  mediaType?: "image" | "video"
): DbEventMediaRow | null {
  const filtered = media
    .filter((item) => item.is_active !== false)
    .filter((item) => item.placement === placement)
    .filter((item) => (mediaType ? item.media_type === mediaType : true))
    .sort((a, b) => {
      const primaryDiff = Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))
      if (primaryDiff !== 0) return primaryDiff
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })

  return filtered[0] || null
}

function selectMediaUrls(
  media: DbEventMediaRow[],
  placement: string,
  mediaType: "image" | "video"
): string[] {
  return media
    .filter((item) => item.is_active !== false)
    .filter((item) => item.placement === placement)
    .filter((item) => item.media_type === mediaType)
    .sort((a, b) => {
      const primaryDiff = Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))
      if (primaryDiff !== 0) return primaryDiff
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })
    .map((item) => toPublicMediaUrl(item.storage_path))
    .filter((url): url is string => Boolean(url))
}

function mapBookingTypeToFlags(bookingType: string | null): {
  hasTickets: boolean
  hasTables: boolean
} {
  switch (bookingType) {
    case "tickets":
      return { hasTickets: true, hasTables: false }
    case "tables":
      return { hasTickets: false, hasTables: true }
    case "both":
      return { hasTickets: true, hasTables: true }
    default:
      return { hasTickets: true, hasTables: true }
  }
}

function getUtcDayBounds(dateKey: string) {
  const start = new Date(`${dateKey}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 1)

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}

function isYyyyMmDd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function unwrapSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] || null : value
}

async function getDefaultVenueMapForEvent(eventId: string): Promise<DbVenueMapRow | null> {
  const eventMapResult = await supabase
    .from("event_maps")
    .select(`
      venue_map_id,
      is_default,
      sort_order,
      venue_maps (
        id,
        name,
        floor_label,
        storage_path,
        is_active
      )
    `)
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle<DbEventMapRow>()

  if (eventMapResult.error) {
    console.error("Failed to fetch event map:", eventMapResult.error.message)
    return null
  }

  return unwrapSingle(eventMapResult.data?.venue_maps)
}

function mapMapZoneRowToVenueZone(
  row: DbMapZoneRow,
  floorLabel: string | null
): MappedVenueZone | null {
  const zone = unwrapSingle(row.table_zones)
  if (!zone?.code || !zone.name) return null
  if (zone.is_active === false) return null

  return {
    id: zone.code,
    svgId: zone.code,
    code: zone.code,
    name: zone.name,
    type: normalizeZoneType(zone.zone_type),
    floor: floorLabel || "Main",
    section: zone.code,
    capacityMin: zone.min_guests ?? 1,
    capacityMax: zone.max_guests ?? zone.capacity ?? zone.min_guests ?? 1,
    price: toNumber(zone.deposit_amount ?? zone.base_price, 0),
    minSpend: toNumber(zone.minimum_spend, 0),
    description: zone.description || "",
    perks: [],
    xPct: toNumber(row.x_pct, 0),
    yPct: toNumber(row.y_pct, 0),
    wPct: toNumber(row.w_pct, 0),
    hPct: toNumber(row.h_pct, 0),
    rotationDeg: toNumber(row.rotation_deg, 0),
    zIndex: row.z_index ?? zone.display_order ?? 1,
  }
}

export async function getVenueZonesForEventSlug(eventSlug: string): Promise<VenueZone[]> {
  if (!eventSlug) return []

  const eventResult = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .single<{ id: string }>()

  if (eventResult.error || !eventResult.data) {
    console.error("Failed to fetch event:", eventResult.error?.message)
    return []
  }

  const eventId = eventResult.data.id

  const venueMap = await getDefaultVenueMapForEvent(eventId)
  if (!venueMap?.id) {
    console.error("No active event map found for event:", eventSlug)
    return []
  }

  const mapZonesResult = await supabase
    .from("map_zones")
    .select(`
      x_pct,
      y_pct,
      w_pct,
      h_pct,
      rotation_deg,
      z_index,
      is_active,
      table_zones!inner (
        code,
        name,
        description,
        zone_type,
        capacity,
        min_guests,
        max_guests,
        base_price,
        deposit_amount,
        minimum_spend,
        display_order,
        is_active
      )
    `)
    .eq("venue_map_id", venueMap.id)
    .eq("is_active", true)
    .order("z_index", { ascending: true })
    .returns<DbMapZoneRow[]>()

  if (mapZonesResult.error || !mapZonesResult.data) {
    console.error("Failed to fetch map zones:", mapZonesResult.error?.message)
    return []
  }

  return mapZonesResult.data
    .map((row) => mapMapZoneRowToVenueZone(row, venueMap.floor_label))
    .filter((zone): zone is MappedVenueZone => Boolean(zone))
}

export async function getEventBookingMetaBySlug(
  eventSlug: string
): Promise<EventBookingMeta | null> {
  if (!eventSlug) return null

  const eventResult = await supabase
    .from("events")
    .select(`
      id,
      slug,
      title,
      description,
      start_at,
      end_at,
      flyer_image_url,
      cover_image_url,
      booking_type,
      venue_id,
      venues (
        name
      ),
      event_media (
        id,
        media_type,
        placement,
        storage_path,
        thumbnail_path,
        alt_text,
        sort_order,
        is_primary,
        is_active
      )
    `)
    .eq("slug", eventSlug)
    .single<DbEventRow>()

  if (eventResult.error || !eventResult.data) {
    console.error("Failed to fetch event booking meta:", eventResult.error?.message)
    return null
  }

  const event = eventResult.data
  const media = Array.isArray(event.event_media) ? event.event_media : []

  const flyerMedia = selectPrimaryMedia(media, "flyer", "image")
  const coverMedia = selectPrimaryMedia(media, "cover", "image")
  const promoVideo = selectPrimaryMedia(media, "promo", "video")

  const flyerSrc =
    toPublicMediaUrl(flyerMedia?.storage_path) ||
    toPublicMediaUrl(event.flyer_image_url) ||
    ""

  const coverSrc =
    toPublicMediaUrl(coverMedia?.storage_path) ||
    toPublicMediaUrl(event.cover_image_url) ||
    undefined

  const promoVideoSrc =
    toPublicMediaUrl(promoVideo?.storage_path) || undefined

  const heroImages = selectMediaUrls(media, "hero", "image")
  const ticketImages = selectMediaUrls(media, "tickets", "image")

  const venueMap = await getDefaultVenueMapForEvent(event.id)
  const dbMapImage = toPublicMediaUrl(venueMap?.storage_path)
  const mediaMapImages = selectMediaUrls(media, "map", "image")
  const mapImages = dbMapImage
    ? [dbMapImage, ...mediaMapImages.filter((url) => url !== dbMapImage)]
    : mediaMapImages

  const bookingFlags = mapBookingTypeToFlags(event.booking_type)

  return {
    id: event.id,
    slug: event.slug,
    name: event.title,
    venueName: getVenueName(event.venues),
    description: event.description || "",
    date: formatEventDate(event.start_at),
    timeLabel: formatEventTimeLabel(event.start_at),
    flyerSrc,
    coverSrc,
    promoVideoSrc,
    heroImages,
    ticketImages,
    mapImages,
    hasTickets: bookingFlags.hasTickets,
    hasTables: bookingFlags.hasTables,
    mapPath: "/book/map",
  }
}

export async function getVisibleTicketTypesForEventSlug(
  eventSlug: string
): Promise<TicketTypeProduct[]> {
  if (!eventSlug) return []

  const eventResult = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .single<{ id: string }>()

  if (eventResult.error || !eventResult.data) {
    console.error("Failed to fetch event for ticket types:", eventResult.error?.message)
    return []
  }

  const ticketTypesResult = await supabase
    .from("ticket_types")
    .select(`
      id,
      name,
      subtitle,
      description,
      price,
      quantity_total,
      quantity_sold,
      per_order_limit,
      sort_order,
      is_visible,
      image_path,
      benefits,
      badge_label,
      sales_status,
      status
    `)
    .eq("event_id", eventResult.data.id)
    .eq("is_visible", true)
    .eq("status", "live")
    .eq("sales_status", "live")
    .order("sort_order", { ascending: true })
    .returns<DbTicketTypeRow[]>()

  if (ticketTypesResult.error || !ticketTypesResult.data) {
    console.error("Failed to fetch ticket types:", ticketTypesResult.error?.message)
    return []
  }

  return ticketTypesResult.data.map((row) => {
    const quantityTotal = row.quantity_total ?? 0
    const quantitySold = row.quantity_sold ?? 0
    const isSoldOut = quantityTotal > 0 ? quantitySold >= quantityTotal : false

    return {
      id: row.id,
      title: row.name,
      subtitle: row.subtitle || row.description || "",
      description: row.description || "",
      price: Number(row.price ?? 0),
      imageSrc: toPublicMediaUrl(row.image_path) || "",
      benefits: row.benefits || [],
      badgeLabel: row.badge_label || undefined,
      perOrderLimit: row.per_order_limit ?? undefined,
      quantityTotal: row.quantity_total ?? undefined,
      quantitySold: row.quantity_sold ?? undefined,
      isSoldOut,
      sortOrder: row.sort_order ?? 0,
    }
  })
}

export async function getReservationStatusesForEventSlugAndDate(
  eventSlug: string,
  dateKey: string,
  session?: string | null
): Promise<ReservationStatusMap> {
  if (!eventSlug || !dateKey) return {}

  if (!isYyyyMmDd(dateKey)) {
    console.error("Invalid dateKey passed to getReservationStatusesForEventSlugAndDate:", dateKey)
    return {}
  }

  const eventResult = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .single<{ id: string }>()

  if (eventResult.error || !eventResult.data) {
    console.error(
      "Failed to fetch event for reservation statuses:",
      eventResult.error?.message
    )
    return {}
  }

  const eventId = eventResult.data.id
  const { startIso, endIso } = getUtcDayBounds(dateKey)

  const eventDateResult = await supabase
    .from("event_dates")
    .select("id, event_id, start_at")
    .eq("event_id", eventId)
    .gte("start_at", startIso)
    .lt("start_at", endIso)
    .order("start_at", { ascending: true })
    .limit(1)
    .maybeSingle<DbEventDateRow>()

  if (eventDateResult.error) {
    console.error(
      "Failed to fetch event_dates row for reservation statuses:",
      eventDateResult.error?.message
    )
    return {}
  }

  if (!eventDateResult.data) {
    console.warn("No event_dates row found for reservation statuses.", {
      eventId,
      dateKey,
      startIso,
      endIso,
    })
    return {}
  }

  const eventDateId = eventDateResult.data.id

  const areasResult = await supabase
    .from("table_areas")
    .select("id, map_zone_code, is_visible")
    .eq("event_id", eventId)
    .eq("is_visible", true)
    .returns<DbTableAreaStatusRow[]>()

  if (areasResult.error || !areasResult.data) {
    console.error(
      "Failed to fetch table areas for reservation statuses:",
      areasResult.error?.message
    )
    return {}
  }

  const areaIdToZoneCode = new Map<string, string>()
  const statusMap: ReservationStatusMap = {}

  areasResult.data.forEach((area) => {
    if (!area.map_zone_code) return
    areaIdToZoneCode.set(area.id, area.map_zone_code)
    statusMap[area.map_zone_code] = "available"
  })

  if (areaIdToZoneCode.size === 0) {
    return statusMap
  }

  let reservationsQuery = supabase
    .from("reservations")
    .select("table_area_id, status, hold_expires_at, session")
    .eq("event_id", eventId)
    .eq("event_date_id", eventDateId)
    .in("status", ["pending", "confirmed", "checked_in"])

  if (session && session.trim()) {
    reservationsQuery = reservationsQuery.eq("session", session.trim())
  }

  const reservationsResult = await reservationsQuery.returns<DbReservationRow[]>()

  if (reservationsResult.error || !reservationsResult.data) {
    console.error(
      "Failed to fetch reservations for reservation statuses:",
      reservationsResult.error?.message
    )
    return statusMap
  }

  const now = new Date()

  reservationsResult.data.forEach((reservation) => {
    const zoneCode = areaIdToZoneCode.get(reservation.table_area_id)
    if (!zoneCode) return

    if (
      reservation.status === "confirmed" ||
      reservation.status === "checked_in"
    ) {
      statusMap[zoneCode] = "booked"
      return
    }

    if (reservation.status === "pending") {
      const expiresAt = reservation.hold_expires_at
        ? new Date(reservation.hold_expires_at)
        : null

      if (expiresAt && expiresAt > now && statusMap[zoneCode] !== "booked") {
        statusMap[zoneCode] = "limited"
      }
    }
  })

  return statusMap
}