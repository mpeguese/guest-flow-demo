// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import { venueZones } from "@/app/lib/booking-data"
import { calculateBookingPricing } from "@/app/lib/booking-pricing"
import { stripe } from "@/app/lib/stripe"

type CheckoutItem = {
  zoneId: string
  date: string
  partySize: string
  session: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = Array.isArray(body?.items) ? (body.items as CheckoutItem[]) : []

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      )
    }

    let subtotal = 0

    for (const item of items) {
      if (!item.zoneId || !item.date || !item.partySize || !item.session) {
        return NextResponse.json(
          { error: "One or more cart items are missing required details." },
          { status: 400 }
        )
      }

      const zone = venueZones.find((z) => z.id === item.zoneId)

      if (!zone) {
        return NextResponse.json(
          { error: `Selected zone was not found: ${item.zoneId}` },
          { status: 404 }
        )
      }

      subtotal += zone.price
    }

    const pricing = calculateBookingPricing(subtotal)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.total * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        itemCount: String(items.length),
        zoneIds: items.map((item) => item.zoneId).join(",").slice(0, 500),
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