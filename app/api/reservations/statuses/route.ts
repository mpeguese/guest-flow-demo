// app/api/reservations/statuses/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type EventRow = {
  id: string
  venue_id: string | null
}

type EventDateRow = {
  id: string
  event_id: string
  start_at: string | null
}

type ZoneRow = {
  id: string
  status: string | null
  is_active: boolean | null
}

type ReservationRow = {
  venue_zone_id: string | null
  event_zone_id: string | null
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "cancelled"
    | "no_show"
    | "expired"
    | string
  hold_expires_at: string | null
  session: string | null
}

function isYyyyMmDd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventSlug = (searchParams.get("eventSlug") || "").trim()
    const dateKey = (searchParams.get("date") || "").trim()
    const session = (searchParams.get("session") || "").trim() || null

    if (!eventSlug) {
      return NextResponse.json({ error: "Missing eventSlug." }, { status: 400 })
    }

    if (!dateKey || !isYyyyMmDd(dateKey)) {
      return NextResponse.json(
        { error: "Missing or invalid date. Expected YYYY-MM-DD." },
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
      return NextResponse.json({ statuses: {} })
    }

    const eventDateId = eventDateResult.data.id
    const statuses: Record<string, "available" | "limited" | "booked"> = {}

    const eventZonesResult = await supabase
      .from("event_zones")
      .select("id, status, is_active")
      .eq("event_id", eventId)
      .returns<ZoneRow[]>()

    if (eventZonesResult.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch event zones.",
          details: eventZonesResult.error.message,
        },
        { status: 500 }
      )
    }

    ;(eventZonesResult.data || []).forEach((zone) => {
      if (zone.is_active === false) return
      if (zone.status === "inactive") return
      statuses[zone.id] = "available"
    })

    if (event.venue_id) {
      const venueZonesResult = await supabase
        .from("venue_zones")
        .select("id, status, is_active")
        .eq("venue_id", event.venue_id)
        .returns<ZoneRow[]>()

      if (venueZonesResult.error) {
        return NextResponse.json(
          {
            error: "Failed to fetch venue zones.",
            details: venueZonesResult.error.message,
          },
          { status: 500 }
        )
      }

      ;(venueZonesResult.data || []).forEach((zone) => {
        if (zone.is_active === false) return
        if (zone.status === "inactive") return
        statuses[zone.id] = "available"
      })
    }

    let reservationsQuery = supabase
      .from("reservations")
      .select("venue_zone_id, event_zone_id, status, hold_expires_at, session")
      .eq("event_id", eventId)
      .eq("event_date_id", eventDateId)
      .in("status", ["pending", "confirmed", "checked_in"])

    if (session) {
      reservationsQuery = reservationsQuery.eq("session", session)
    }

    const reservationsResult = await reservationsQuery.returns<ReservationRow[]>()

    if (reservationsResult.error) {
      return NextResponse.json(
        {
          error: "Failed to fetch reservations.",
          details: reservationsResult.error.message,
        },
        { status: 500 }
      )
    }

    const now = new Date()

    ;(reservationsResult.data || []).forEach((reservation) => {
      const zoneId = reservation.event_zone_id || reservation.venue_zone_id
      if (!zoneId) return

      if (!(zoneId in statuses)) {
        statuses[zoneId] = "available"
      }

      if (
        reservation.status === "confirmed" ||
        reservation.status === "checked_in"
      ) {
        statuses[zoneId] = "booked"
        return
      }

      if (reservation.status === "pending") {
        const expiresAt = reservation.hold_expires_at
          ? new Date(reservation.hold_expires_at)
          : null

        if (expiresAt && expiresAt > now && statuses[zoneId] !== "booked") {
          statuses[zoneId] = "limited"
        }
      }
    })

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error("statuses route error", error)

    return NextResponse.json(
      { error: "Unable to load reservation statuses." },
      { status: 500 }
    )
  }
}