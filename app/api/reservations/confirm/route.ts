// app/api/reservations/confirm/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type ConfirmReservationItem = {
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

function generateQrCode(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = prefix
  for (let i = 0; i < 12; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

function inferItemType(item: Pick<ConfirmReservationItem, "itemType" | "session">) {
  if (item.itemType) return item.itemType
  if (item.session === "entry") return "pass"
  return "zone"
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.GFDEV_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
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

    const supabase = getSupabaseAdmin()

    const zoneItems = items.filter((item) => inferItemType(item) === "zone")
    const passItems = items.filter((item) => inferItemType(item) === "pass")

    const bookingCode = generateReservationCode()
    const nowIso = new Date().toISOString()

    const confirmedReservationIds: string[] = []

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
      const finalReservationCode = reservation.reservation_code || bookingCode

      if (reservation.status === "confirmed" || reservation.status === "checked_in") {
        confirmedReservationIds.push(reservation.id)
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
          reservation_code: finalReservationCode,
          deposit_amount_paid:
            typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0,
          updated_at: nowIso,
        })
        .eq("id", item.reservationId)
        .select("id, reservation_code")
        .single()

      if (updateResult.error || !updateResult.data) {
        return NextResponse.json(
          {
            error: "Failed to confirm reservation.",
            details: updateResult.error?.message,
          },
          { status: 500 }
        )
      }

      confirmedReservationIds.push(updateResult.data.id)

      const qrValue = `GuestLyst://reservation/${finalReservationCode}`

      const qrInsertResult = await supabase
        .from("reservation_qr_codes")
        .upsert(
          {
            reservation_id: updateResult.data.id,
            booking_code: finalReservationCode,
            payment_intent: paymentIntent,
            item_type: "reservation",
            item_ref_id: updateResult.data.id,
            label: item.zoneName || item.section || "Reservation",
            qr_value: qrValue,
            status: "active",
            updated_at: nowIso,
          },
          {
            onConflict: "qr_value",
          }
        )

      if (qrInsertResult.error) {
        return NextResponse.json(
          {
            error: "Reservation confirmed, but QR creation failed.",
            details: qrInsertResult.error.message,
          },
          { status: 500 }
        )
      }
    }

    const primaryBookingCode = bookingCode

    if (passItems.length > 0) {
      const passQrRows = passItems.map((item, index) => {
        const passQrCode = generateQrCode("PASS-")
        return {
          reservation_id: null,
          booking_code: primaryBookingCode,
          payment_intent: paymentIntent,
          item_type: "pass",
          item_ref_id: item.productId || item.zoneId || item.id,
          label: item.zoneName || item.section || `Pass ${index + 1}`,
          qr_value: `GuestLyst://pass/${passQrCode}`,
          status: "active",
          updated_at: nowIso,
        }
      })

      const passQrInsertResult = await supabase
        .from("reservation_qr_codes")
        .insert(passQrRows)

      if (passQrInsertResult.error) {
        return NextResponse.json(
          {
            error: "Payment confirmed, but pass QR creation failed.",
            details: passQrInsertResult.error.message,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      reservationCode: primaryBookingCode,
      bookingCode: primaryBookingCode,
      confirmedReservationIds,
    })
  } catch (error) {
    console.error("confirm reservation error", error)

    return NextResponse.json(
      { error: "Unable to confirm reservation." },
      { status: 500 }
    )
  }
}