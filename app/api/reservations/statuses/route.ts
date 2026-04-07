// app/api/reservations/statuses/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type EventRow = {
  id: string
}

type EventDateRow = {
  id: string
  event_id: string
  start_at: string | null
}

type TableAreaRow = {
  id: string
  map_zone_code: string | null
  is_visible: boolean | null
}

type ReservationRow = {
  table_area_id: string
  status: "pending" | "confirmed" | "checked_in" | "cancelled" | "no_show" | "expired" | string
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
      .select("id")
      .eq("slug", eventSlug)
      .single<EventRow>()

    if (eventResult.error || !eventResult.data) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      )
    }

    const eventId = eventResult.data.id
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

    const areasResult = await supabase
      .from("table_areas")
      .select("id, map_zone_code, is_visible")
      .eq("event_id", eventId)
      .eq("is_visible", true)
      .returns<TableAreaRow[]>()

    if (areasResult.error || !areasResult.data) {
      return NextResponse.json(
        {
          error: "Failed to fetch table areas.",
          details: areasResult.error?.message,
        },
        { status: 500 }
      )
    }

    const areaIdToZoneCode = new Map<string, string>()
    const statuses: Record<string, "available" | "limited" | "booked"> = {}

    areasResult.data.forEach((area) => {
      if (!area.map_zone_code) return
      areaIdToZoneCode.set(area.id, area.map_zone_code)
      statuses[area.map_zone_code] = "available"
    })

    if (areaIdToZoneCode.size === 0) {
      return NextResponse.json({ statuses })
    }

    let reservationsQuery = supabase
      .from("reservations")
      .select("table_area_id, status, hold_expires_at, session")
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
      const zoneCode = areaIdToZoneCode.get(reservation.table_area_id)
      if (!zoneCode) return

      if (
        reservation.status === "confirmed" ||
        reservation.status === "checked_in"
      ) {
        statuses[zoneCode] = "booked"
        return
      }

      if (reservation.status === "pending") {
        const expiresAt = reservation.hold_expires_at
          ? new Date(reservation.hold_expires_at)
          : null

        if (expiresAt && expiresAt > now && statuses[zoneCode] !== "booked") {
          statuses[zoneCode] = "limited"
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