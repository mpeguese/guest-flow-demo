// app/api/reservations/hold/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type HoldRequestBody = {
  eventSlug?: string

  // current client payload
  eventDate?: string
  zoneId?: string
  partySize?: number | null
  price?: number | null

  // optional / legacy compatibility
  date?: string
  tableAreaId?: string
  guestCount?: number | null

  session?: string | null
  userId?: string | null
}

type EventRow = {
  id: string
}

type EventDateRow = {
  id: string
  event_id: string
  start_at: string | null
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

type TableAreaLookupRow = {
  id: string
  event_id: string
  name: string | null
  map_zone_code: string | null
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

    console.log("hold route payload", body)

    const eventSlug = String(body.eventSlug || "").trim()

    // support both new and legacy client field names
    const dateKey = String(body.eventDate || body.date || "").trim()

    // In the current client flow, zoneId is actually the map_zone_code.
    const zoneId = String(body.zoneId || "").trim()
    const legacyTableAreaId = String(body.tableAreaId || "").trim()

    const session = body.session?.trim() || null

    const guestCountSource =
      typeof body.partySize === "number" && Number.isFinite(body.partySize)
        ? body.partySize
        : typeof body.guestCount === "number" && Number.isFinite(body.guestCount)
          ? body.guestCount
          : 1

    const guestCount = Math.max(1, Math.floor(guestCountSource))
    const userId = body.userId?.trim() || null

    console.log("hold route normalized values", {
      eventSlug,
      dateKey,
      zoneId,
      legacyTableAreaId,
      guestCount,
      session,
    })

    if (!eventSlug) {
      return NextResponse.json({ error: "Missing eventSlug." }, { status: 400 })
    }

    if (!dateKey || !isValidDateKey(dateKey)) {
      return NextResponse.json(
        { error: "Missing or invalid date. Expected YYYY-MM-DD." },
        { status: 400 }
      )
    }

    if (!zoneId && !legacyTableAreaId) {
      return NextResponse.json(
        { error: "Missing zoneId/tableAreaId." },
        { status: 400 }
      )
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

    // 1) Resolve event by slug
    const eventResult = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug)
      .single<EventRow>()

    if (eventResult.error || !eventResult.data) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 })
    }

    const eventId = eventResult.data.id

    // 2) Resolve event_dates row by calendar day
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

    // 3) Resolve the actual table_areas.id
    // Current client sends map_zone_code as zoneId, but older code may send tableAreaId UUID.
    let resolvedTableArea: TableAreaLookupRow | null = null

    if (legacyTableAreaId) {
      const tableAreaByIdResult = await supabase
        .from("table_areas")
        .select("id, event_id, name, map_zone_code")
        .eq("id", legacyTableAreaId)
        .eq("event_id", eventId)
        .maybeSingle<TableAreaLookupRow>()

      if (tableAreaByIdResult.error) {
        return NextResponse.json(
          {
            error: "Failed to resolve table area by id.",
            details: tableAreaByIdResult.error.message,
          },
          { status: 500 }
        )
      }

      resolvedTableArea = tableAreaByIdResult.data ?? null
    }

    if (!resolvedTableArea && zoneId) {
      const tableAreaByZoneCodeResult = await supabase
        .from("table_areas")
        .select("id, event_id, name, map_zone_code")
        .eq("event_id", eventId)
        .eq("map_zone_code", zoneId)
        .maybeSingle<TableAreaLookupRow>()

      if (tableAreaByZoneCodeResult.error) {
        return NextResponse.json(
          {
            error: "Failed to resolve table area by zone code.",
            details: tableAreaByZoneCodeResult.error.message,
          },
          { status: 500 }
        )
      }

      resolvedTableArea = tableAreaByZoneCodeResult.data ?? null
    }

    if (!resolvedTableArea) {
      return NextResponse.json(
        { error: "Table area not found for this event." },
        { status: 404 }
      )
    }

    const tableAreaId = resolvedTableArea.id

    console.log("resolved table area", {
      zoneId,
      tableAreaId,
      mapZoneCode: resolvedTableArea.map_zone_code,
      tableAreaName: resolvedTableArea.name,
    })

    // 4) Check for blocking reservations
    let blockingQuery = supabase
      .from("reservations")
      .select("id, status, hold_expires_at")
      .eq("event_id", eventId)
      .eq("event_date_id", eventDateId)
      .eq("table_area_id", tableAreaId)
      .in("status", ["pending", "confirmed", "checked_in"])

    if (session) {
      blockingQuery = blockingQuery.eq("session", session)
    }

    const blockingResult = await blockingQuery.returns<BlockingReservationRow[]>()

    if (blockingResult.error) {
      return NextResponse.json(
        { error: "Failed to check existing reservations." },
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

    // 5) Create pending hold
    const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString()

    const insertPayload = {
      order_id: null,
      event_id: eventId,
      event_date_id: eventDateId,
      table_area_id: tableAreaId,
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
      .select("id, event_id, event_date_id, table_area_id, status, hold_expires_at")
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
        table_area_id: insertResult.data.table_area_id,
        status: insertResult.data.status,
        expires_at: insertResult.data.hold_expires_at,
      },
      reservationId: insertResult.data.id,
      eventId: insertResult.data.event_id,
      eventDateId: insertResult.data.event_date_id,
      tableAreaId: insertResult.data.table_area_id,
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