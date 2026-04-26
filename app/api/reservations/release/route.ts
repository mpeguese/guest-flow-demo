// app/api/reservations/release/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const body = await request.json().catch(() => null)

    const reservationId =
      typeof body?.reservationId === "string" ? body.reservationId.trim() : ""

    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId is required." },
        { status: 400 }
      )
    }

    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select(
        "id, status, confirmed_at, cancelled_at, expired_at, hold_expires_at, venue_zone_id, event_zone_id, zone_source"
      )
      .eq("id", reservationId)
      .maybeSingle()

    if (findError) {
      console.error("Error finding reservation to release:", findError)
      return NextResponse.json(
        { error: "Unable to locate reservation hold." },
        { status: 500 }
      )
    }

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found." },
        { status: 404 }
      )
    }

    if (reservation.confirmed_at || reservation.status === "confirmed") {
      return NextResponse.json(
        { error: "Confirmed reservations cannot be released." },
        { status: 409 }
      )
    }

    if (
      reservation.status === "cancelled" ||
      reservation.status === "released" ||
      reservation.cancelled_at
    ) {
      return NextResponse.json({
        success: true,
        alreadyReleased: true,
        reservationId: reservation.id,
      })
    }

    const nowIso = new Date().toISOString()

    const { data: updatedReservation, error: updateError } = await supabase
      .from("reservations")
      .update({
        status: "cancelled",
        cancelled_at: nowIso,
        hold_expires_at: null,
        updated_at: nowIso,
      })
      .eq("id", reservation.id)
      .select(
        "id, status, confirmed_at, cancelled_at, expired_at, hold_expires_at, venue_zone_id, event_zone_id, zone_source"
      )
      .single()

    if (updateError) {
      console.error("Error releasing reservation:", updateError)
      return NextResponse.json(
        { error: "Unable to release reservation hold." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    })
  } catch (error) {
    console.error("Unexpected error releasing reservation hold:", error)

    return NextResponse.json(
      { error: "Unexpected error releasing reservation hold." },
      { status: 500 }
    )
  }
}