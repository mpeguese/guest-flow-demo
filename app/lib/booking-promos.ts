// app/lib/booking-promos.ts
export type PromoKind = "percent" | "fixed" | "fee_waiver" | "attribution"

export type PromoDefinition = {
  code: string
  kind: PromoKind
  description: string
  value?: number
  promoterName?: string
  maxDiscount?: number
}

export type AppliedPromo = {
  code: string
  description: string
  promoterName?: string
}

const STORAGE_KEY = "gf_booking_promo_code"

export const MOCK_PROMOS: PromoDefinition[] = [
  {
    code: "SAVE10",
    kind: "percent",
    value: 10,
    description: "10% off your booking",
  },
  {
    code: "WELCOME15",
    kind: "fixed",
    value: 15,
    description: "$15 off your booking",
  },
  {
    code: "NOFEE",
    kind: "fee_waiver",
    description: "Processing fee waived",
  },
  {
    code: "PROMOTERJAY",
    kind: "attribution",
    promoterName: "Jay",
    description: "Promoter applied",
  },
]

export function normalizePromoCode(value: string) {
  return value.trim().toUpperCase()
}

export function findPromoByCode(code: string) {
  const normalized = normalizePromoCode(code)
  if (!normalized) return null
  return MOCK_PROMOS.find((promo) => promo.code === normalized) || null
}

export function getStoredPromoCode() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(STORAGE_KEY) || ""
}

export function setStoredPromoCode(code: string) {
  if (typeof window === "undefined") return
  const normalized = normalizePromoCode(code)

  if (!normalized) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, normalized)
}

export function clearStoredPromoCode() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}