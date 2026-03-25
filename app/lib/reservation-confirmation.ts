// app/lib/reservation-confirmation.ts

export type ReservationGuestInfo = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  marketingOptIn?: boolean
}

export type ReservationItemType = "zone" | "pass"

export type ReservationLineItem = {
  id: string
  itemType?: ReservationItemType
  productId?: string
  zoneId: string
  zoneName: string
  section: string
  date: string
  partySize: string
  session: string
  price: number
  imageSrc?: string
  qrCode?: string
}

export type ReservationRecord = {
  reservationCode: string
  createdAt: string
  subtotal: number
  tax: number
  processingFee: number
  total: number
  items: ReservationLineItem[]
  guestInfo?: ReservationGuestInfo
}

const STORAGE_KEY = "guestflow_latest_reservation"

export function generateReservationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = "GF-"
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export function inferReservationItemType(
  item: Pick<ReservationLineItem, "itemType" | "section" | "session">
): ReservationItemType {
  if (item.itemType) return item.itemType
  if (item.section === "Guest Entry Pass" || item.session === "entry") return "pass"
  return "zone"
}

export function normalizeReservationItem(item: ReservationLineItem): ReservationLineItem {
  const itemType = inferReservationItemType(item)
  const productId =
    item.productId ||
    (itemType === "pass"
      ? item.zoneId.split("-").slice(0, -1).join("-") || item.zoneId
      : item.zoneId)

  return {
    ...item,
    itemType,
    productId,
    qrCode: item.qrCode || buildItemQrCode(item.id, itemType),
  }
}

export function normalizeReservationRecord(
  reservation: ReservationRecord
): ReservationRecord {
  return {
    ...reservation,
    items: Array.isArray(reservation.items)
      ? reservation.items.map((item) => normalizeReservationItem(item))
      : [],
  }
}

export function buildItemQrCode(itemId: string, itemType: ReservationItemType) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let suffix = ""
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  const prefix = itemType === "pass" ? "GF-PASS" : "GF-RES"
  return `${prefix}-${suffix}-${itemId.slice(-4).toUpperCase()}`
}

export function saveLatestReservation(reservation: ReservationRecord) {
  if (typeof window === "undefined") return
  const normalized = normalizeReservationRecord(reservation)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
}

export function getLatestReservation(): ReservationRecord | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as ReservationRecord
    return normalizeReservationRecord(parsed)
  } catch {
    return null
  }
}

export function updateLatestReservationGuestInfo(guestInfo: ReservationGuestInfo) {
  if (typeof window === "undefined") return
  const existing = getLatestReservation()
  if (!existing) return

  const updated: ReservationRecord = {
    ...existing,
    guestInfo: {
      ...existing.guestInfo,
      ...guestInfo,
    },
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}