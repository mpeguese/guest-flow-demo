// app/lib/booking-pricing.ts
export type BookingPricing = {
  subtotal: number
  tax: number
  processingFee: number
  total: number
}

function roundToCents(value: number) {
  return Math.round(value * 100) / 100
}

export function calculateBookingPricing(basePrice: number): BookingPricing {
  const safeBase = Number.isFinite(basePrice) ? Number(basePrice) : 0
  const subtotal = roundToCents(safeBase)
  const tax = roundToCents(subtotal * 0.07)
  const processingFee = roundToCents(subtotal * 0.05)
  const total = roundToCents(subtotal + tax + processingFee)

  return {
    subtotal,
    tax,
    processingFee,
    total,
  }
}