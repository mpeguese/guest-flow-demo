// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import { stripe } from "@/app/lib/stripe"

type CheckoutItem = {
  id: string
  itemType?: "zone" | "pass"
  productId?: string
  zoneId: string
  zoneName?: string
  section?: string
  date: string
  partySize: string
  session: string
  price: number
  reservationId?: string
  holdToken?: string
  expiresAt?: string
}

type CheckoutRequestBody = {
  promoCode?: string
  items?: CheckoutItem[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutRequestBody
    const items = Array.isArray(body?.items) ? body.items : []
    const promoCode =
      typeof body?.promoCode === "string" ? body.promoCode.trim() : ""

    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 })
    }

    let subtotal = 0

    for (const item of items) {
      if (!item.zoneId || !item.date || !item.partySize || !item.session) {
        return NextResponse.json(
          { error: "One or more cart items are missing required details." },
          { status: 400 }
        )
      }

      if (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0) {
        return NextResponse.json(
          { error: `One or more cart items have an invalid price.` },
          { status: 400 }
        )
      }

      subtotal += item.price
    }

    const pricing = calculateBookingPricing(subtotal, promoCode)

    const zoneReservationIds = items
      .filter((item) => (item.itemType || (item.session === "entry" ? "pass" : "zone")) === "zone")
      .map((item) => item.reservationId)
      .filter((value): value is string => typeof value === "string" && value.length > 0)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.total * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        itemCount: String(items.length),
        itemTypes: items
          .map((item) => item.itemType || (item.session === "entry" ? "pass" : "zone"))
          .join(",")
          .slice(0, 500),
        productIds: items
          .map((item) => item.productId || item.zoneId)
          .join(",")
          .slice(0, 500),
        reservationIds: zoneReservationIds.join(",").slice(0, 500),
        promoCode: pricing.appliedPromo?.code || "",
        promoDescription: pricing.appliedPromo?.description || "",
        subtotal: pricing.subtotal.toFixed(2),
        discount: pricing.discount.toFixed(2),
        discountedSubtotal: pricing.discountedSubtotal.toFixed(2),
        tax: pricing.tax.toFixed(2),
        processingFee: pricing.processingFee.toFixed(2),
        total: pricing.total.toFixed(2),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("create-payment-intent error", error)

    return NextResponse.json(
      { error: "Unable to create payment intent." },
      { status: 500 }
    )
  }
}