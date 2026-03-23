// app/lib/reservation-confirmation.ts

export type ReservationGuestInfo = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  marketingOptIn?: boolean
}

export type ReservationLineItem = {
  id: string
  zoneId: string
  zoneName: string
  section: string
  date: string
  partySize: string
  session: string
  price: number
  imageSrc?: string
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

export function saveLatestReservation(reservation: ReservationRecord) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservation))
}

export function getLatestReservation(): ReservationRecord | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ReservationRecord
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