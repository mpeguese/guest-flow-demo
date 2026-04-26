// app/api/reservations/hold/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type HoldRequestBody = {
  eventSlug?: string
  eventDate?: string
  zoneId?: string
  partySize?: number | null
  price?: number | null
  date?: string
  guestCount?: number | null
  session?: string | null
  userId?: string | null
}

type EventRow = {
  id: string
  venue_id: string | null
}

type EventDateRow = {
  id: string
  event_id: string
  start_at: string | null
}

type ReservationZoneSource = "event_zone" | "venue_zone"

type ResolvedZone = {
  id: string
  source: ReservationZoneSource
  name: string | null
}

type BlockingReservationRow = {
  id: string
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "cancelled"
    | "expired"
    | "no_show"
    | string
  hold_expires_at: string | null
}

function getUtcDayBounds(dateKey: string) {
  const start = new Date(`${dateKey}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 1)

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}

function isValidDateKey(dateKey: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HoldRequestBody

    const eventSlug = String(body.eventSlug || "").trim()
    const dateKey = String(body.eventDate || body.date || "").trim()
    const zoneId = String(body.zoneId || "").trim()
    const session = body.session?.trim() || null

    const guestCountSource =
      typeof body.partySize === "number" && Number.isFinite(body.partySize)
        ? body.partySize
        : typeof body.guestCount === "number" && Number.isFinite(body.guestCount)
          ? body.guestCount
          : 1

    const guestCount = Math.max(1, Math.floor(guestCountSource))
    const userId = body.userId?.trim() || null

    if (!eventSlug) {
      return NextResponse.json({ error: "Missing eventSlug." }, { status: 400 })
    }

    if (!dateKey || !isValidDateKey(dateKey)) {
      return NextResponse.json(
        { error: "Missing or invalid date. Expected YYYY-MM-DD." },
        { status: 400 }
      )
    }

    if (!zoneId) {
      return NextResponse.json({ error: "Missing zoneId." }, { status: 400 })
    }

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

    const eventResult = await supabase
      .from("events")
      .select("id, venue_id")
      .eq("slug", eventSlug)
      .single<EventRow>()

    if (eventResult.error || !eventResult.data) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 })
    }

    const event = eventResult.data
    const eventId = event.id

    const { startIso, endIso } = getUtcDayBounds(dateKey)

    const eventDateResult = await supabase
      .from("event_dates")
      .select("id, event_id, start_at")
      .eq("event_id", eventId)
      .gte("start_at", startIso)
      .lt("start_at", endIso)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle<EventDateRow>()

    if (eventDateResult.error) {
      return NextResponse.json(
        {
          error: "Failed to resolve event date.",
          details: eventDateResult.error.message,
        },
        { status: 500 }
      )
    }

    if (!eventDateResult.data) {
      return NextResponse.json(
        { error: "No event date found for that day." },
        { status: 404 }
      )
    }

    const eventDateId = eventDateResult.data.id

    let resolvedZone: ResolvedZone | null = null

    const eventZoneResult = await supabase
      .from("event_zones")
      .select("id, name, status, is_active")
      .eq("event_id", eventId)
      .eq("id", zoneId)
      .maybeSingle<{
        id: string
        name: string | null
        status: string | null
        is_active: boolean | null
      }>()

    if (eventZoneResult.error) {
      return NextResponse.json(
        {
          error: "Failed to resolve event zone.",
          details: eventZoneResult.error.message,
        },
        { status: 500 }
      )
    }

    if (
      eventZoneResult.data &&
      eventZoneResult.data.is_active !== false &&
      eventZoneResult.data.status !== "inactive"
    ) {
      resolvedZone = {
        id: eventZoneResult.data.id,
        source: "event_zone",
        name: eventZoneResult.data.name,
      }
    }

    if (!resolvedZone) {
      if (!event.venue_id) {
        return NextResponse.json(
          { error: "Event is missing venue_id." },
          { status: 500 }
        )
      }

      const venueZoneResult = await supabase
        .from("venue_zones")
        .select("id, name, status, is_active")
        .eq("venue_id", event.venue_id)
        .eq("id", zoneId)
        .maybeSingle<{
          id: string
          name: string | null
          status: string | null
          is_active: boolean | null
        }>()

      if (venueZoneResult.error) {
        return NextResponse.json(
          {
            error: "Failed to resolve venue zone.",
            details: venueZoneResult.error.message,
          },
          { status: 500 }
        )
      }

      if (
        venueZoneResult.data &&
        venueZoneResult.data.is_active !== false &&
        venueZoneResult.data.status !== "inactive"
      ) {
        resolvedZone = {
          id: venueZoneResult.data.id,
          source: "venue_zone",
          name: venueZoneResult.data.name,
        }
      }
    }

    if (!resolvedZone) {
      return NextResponse.json(
        { error: "Zone not found for this event." },
        { status: 404 }
      )
    }

    let blockingQuery = supabase
      .from("reservations")
      .select("id, status, hold_expires_at")
      .eq("event_id", eventId)
      .eq("event_date_id", eventDateId)
      .in("status", ["pending", "confirmed", "checked_in"])

    if (resolvedZone.source === "event_zone") {
      blockingQuery = blockingQuery.eq("event_zone_id", resolvedZone.id)
    } else {
      blockingQuery = blockingQuery.eq("venue_zone_id", resolvedZone.id)
    }

    if (session) {
      blockingQuery = blockingQuery.eq("session", session)
    }

    const blockingResult = await blockingQuery.returns<BlockingReservationRow[]>()

    if (blockingResult.error) {
      return NextResponse.json(
        {
          error: "Failed to check existing reservations.",
          details: blockingResult.error.message,
        },
        { status: 500 }
      )
    }

    const now = new Date()

    const hasBlockingReservation = (blockingResult.data || []).some((reservation) => {
      if (
        reservation.status === "confirmed" ||
        reservation.status === "checked_in"
      ) {
        return true
      }

      if (reservation.status === "pending") {
        if (!reservation.hold_expires_at) return true
        const expiresAt = new Date(reservation.hold_expires_at)
        return expiresAt > now
      }

      return false
    })

    if (hasBlockingReservation) {
      return NextResponse.json(
        { error: "This table is no longer available." },
        { status: 409 }
      )
    }

    const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString()

    const insertPayload = {
      order_id: null,
      event_id: eventId,
      event_date_id: eventDateId,
      table_area_id: null,
      venue_zone_id: resolvedZone.source === "venue_zone" ? resolvedZone.id : null,
      event_zone_id: resolvedZone.source === "event_zone" ? resolvedZone.id : null,
      zone_source: resolvedZone.source,
      user_id: userId,
      guest_name: null,
      phone: null,
      email: null,
      guest_count: guestCount,
      session,
      status: "pending",
      deposit_amount_paid: 0,
      balance_due_at_venue: 0,
      notes: null,
      reserved_at: now.toISOString(),
      confirmed_at: null,
      checked_in_at: null,
      hold_expires_at: holdExpiresAt,
      cancelled_at: null,
      expired_at: null,
      checked_in_by: null,
      reservation_code: null,
    }

    const insertResult = await supabase
      .from("reservations")
      .insert(insertPayload)
      .select(
        "id, event_id, event_date_id, venue_zone_id, event_zone_id, zone_source, status, hold_expires_at"
      )
      .single()

    if (insertResult.error || !insertResult.data) {
      return NextResponse.json(
        {
          error: "Failed to create reservation hold.",
          details: insertResult.error?.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: insertResult.data.id,
        event_id: insertResult.data.event_id,
        event_date_id: insertResult.data.event_date_id,
        venue_zone_id: insertResult.data.venue_zone_id,
        event_zone_id: insertResult.data.event_zone_id,
        zone_source: insertResult.data.zone_source,
        status: insertResult.data.status,
        expires_at: insertResult.data.hold_expires_at,
      },
      reservationId: insertResult.data.id,
      eventId: insertResult.data.event_id,
      eventDateId: insertResult.data.event_date_id,
      venueZoneId: insertResult.data.venue_zone_id,
      eventZoneId: insertResult.data.event_zone_id,
      zoneSource: insertResult.data.zone_source,
      status: insertResult.data.status,
      holdExpiresAt: insertResult.data.hold_expires_at,
      expiresAt: insertResult.data.hold_expires_at,
    })
  } catch (error) {
    console.error("Unexpected error creating reservation hold:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}