// app/api/reservations/confirm/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type ConfirmReservationItem = {
  id: string
  itemType?: "zone" | "pass"
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

type ConfirmRequestBody = {
  paymentIntent?: string | null
  redirectStatus?: string | null
  items?: ConfirmReservationItem[]
}

type ReservationRow = {
  id: string
  status: string
  hold_expires_at: string | null
  reservation_code: string | null
}

function generateReservationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = "GF-"
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

function inferItemType(item: Pick<ConfirmReservationItem, "itemType" | "session">) {
  if (item.itemType) return item.itemType
  if (item.session === "entry") return "pass"
  return "zone"
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConfirmRequestBody
    const items = Array.isArray(body.items) ? body.items : []
    const paymentIntent = body.paymentIntent?.trim() || null
    const redirectStatus = body.redirectStatus?.trim() || null

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 })
    }

    if (!paymentIntent && redirectStatus !== "succeeded") {
      return NextResponse.json(
        { error: "Payment confirmation context is missing." },
        { status: 400 }
      )
    }

    const zoneItems = items.filter((item) => inferItemType(item) === "zone")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey =
      process.env.GFDEV_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase server environment variables." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const reservationCode = generateReservationCode()
    const nowIso = new Date().toISOString()

    for (const item of zoneItems) {
      if (!item.reservationId) {
        return NextResponse.json(
          { error: `Zone item is missing reservationId: ${item.zoneName || item.zoneId}` },
          { status: 400 }
        )
      }

      const reservationResult = await supabase
        .from("reservations")
        .select("id, status, hold_expires_at, reservation_code")
        .eq("id", item.reservationId)
        .maybeSingle<ReservationRow>()

      if (reservationResult.error) {
        return NextResponse.json(
          {
            error: "Failed to load reservation before confirmation.",
            details: reservationResult.error.message,
          },
          { status: 500 }
        )
      }

      if (!reservationResult.data) {
        return NextResponse.json(
          { error: `Reservation not found: ${item.reservationId}` },
          { status: 404 }
        )
      }

      const reservation = reservationResult.data

      if (reservation.status === "confirmed" || reservation.status === "checked_in") {
        continue
      }

      if (reservation.status !== "pending") {
        return NextResponse.json(
          { error: `Reservation is not in a confirmable state: ${item.reservationId}` },
          { status: 409 }
        )
      }

      if (reservation.hold_expires_at) {
        const expiresAt = new Date(reservation.hold_expires_at)
        const now = new Date()

        if (expiresAt <= now) {
          return NextResponse.json(
            { error: `Reservation hold expired for ${item.zoneName || item.zoneId}.` },
            { status: 409 }
          )
        }
      }

      const updateResult = await supabase
        .from("reservations")
        .update({
          status: "confirmed",
          confirmed_at: nowIso,
          hold_expires_at: null,
          reservation_code: reservation.reservation_code || reservationCode,
          deposit_amount_paid:
            typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0,
        })
        .eq("id", item.reservationId)
        .select("id")
        .single()

      if (updateResult.error) {
        return NextResponse.json(
          {
            error: "Failed to confirm reservation.",
            details: updateResult.error.message,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      reservationCode,
      confirmedReservationIds: zoneItems
        .map((item) => item.reservationId)
        .filter((value): value is string => Boolean(value)),
    })
  } catch (error) {
    console.error("confirm reservation error", error)

    return NextResponse.json(
      { error: "Unable to confirm reservation." },
      { status: 500 }
    )
  }
}