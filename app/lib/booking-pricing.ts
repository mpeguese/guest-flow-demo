// app/lib/booking-pricing.ts
import { findPromoByCode, type AppliedPromo } from "@/app/lib/booking-promos"

export type BookingPricing = {
  subtotal: number
  discount: number
  discountedSubtotal: number
  tax: number
  processingFee: number
  total: number
  appliedPromo: AppliedPromo | null
}

function roundToCents(value: number) {
  return Math.round(value * 100) / 100
}

export function calculateBookingPricing(
  basePrice: number,
  promoCode?: string
): BookingPricing {
  const safeBase = Number.isFinite(basePrice) ? Number(basePrice) : 0
  const subtotal = roundToCents(safeBase)

  const promo = promoCode ? findPromoByCode(promoCode) : null

  let discount = 0

  if (promo?.kind === "percent") {
    const percentValue = Number(promo.value) || 0
    discount = subtotal * (percentValue / 100)

    if (typeof promo.maxDiscount === "number") {
      discount = Math.min(discount, promo.maxDiscount)
    }
  }

  if (promo?.kind === "fixed") {
    discount = Number(promo.value) || 0
  }

  discount = roundToCents(Math.max(0, Math.min(discount, subtotal)))

  const discountedSubtotal = roundToCents(Math.max(0, subtotal - discount))
  const tax = roundToCents(discountedSubtotal * 0.07)

  let processingFee = roundToCents(discountedSubtotal * 0.05)
  if (promo?.kind === "fee_waiver") {
    processingFee = 0
  }

  const total = roundToCents(discountedSubtotal + tax + processingFee)

  const appliedPromo: AppliedPromo | null = promo
    ? {
        code: promo.code,
        description: promo.description,
        promoterName: promo.promoterName,
      }
    : null

  return {
    subtotal,
    discount,
    discountedSubtotal,
    tax,
    processingFee,
    total,
    appliedPromo,
  }
}