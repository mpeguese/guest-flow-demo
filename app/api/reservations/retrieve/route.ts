// app/api/reservations/retrieve/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RetrieveBody = {
  reservationCode?: string
  contact?: string
}

type ReservationRow = {
  id: string
  event_id: string
  event_date_id: string | null
  user_id: string | null
  guest_name: string | null
  email: string | null
  phone: string | null
  reservation_code: string | null
  status: string
  confirmed_at: string | null
  created_at: string | null
  venue_zone_id: string | null
  event_zone_id: string | null
  zone_source: string | null
  deposit_amount_paid: number | string | null
  guest_count: number | null
  session: string | null
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

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(value: string | null | undefined) {
  return clean(value).replace(/\D/g, "")
}

function contactsMatch(input: string, reservation: ReservationRow) {
  const contact = clean(input).toLowerCase()
  const email = clean(reservation.email).toLowerCase()

  if (contact && email && contact === email) return true

  const inputPhone = normalizePhone(contact)
  const reservationPhone = normalizePhone(reservation.phone)

  if (inputPhone && reservationPhone && inputPhone === reservationPhone) return true

  return false
}

async function decorateReservation(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  reservation: ReservationRow
) {
  const [{ data: event }, { data: eventDate }] = await Promise.all([
    supabase
      .from("events")
      .select("id, slug, title, start_at")
      .eq("id", reservation.event_id)
      .maybeSingle<{
        id: string
        slug: string | null
        title: string | null
        start_at: string | null
      }>(),
    reservation.event_date_id
      ? supabase
          .from("event_dates")
          .select("id, start_at")
          .eq("id", reservation.event_date_id)
          .maybeSingle<{ id: string; start_at: string | null }>()
      : Promise.resolve({ data: null }),
  ])

  let zoneName: string | null = null
  let zoneCode: string | null = null

  if (reservation.event_zone_id) {
    const { data: zone } = await supabase
      .from("event_zones")
      .select("id, name, code")
      .eq("id", reservation.event_zone_id)
      .maybeSingle<{ id: string; name: string | null; code: string | null }>()

    zoneName = zone?.name || null
    zoneCode = zone?.code || null
  }

  if (!zoneName && reservation.venue_zone_id) {
    const { data: zone } = await supabase
      .from("venue_zones")
      .select("id, name, code")
      .eq("id", reservation.venue_zone_id)
      .maybeSingle<{ id: string; name: string | null; code: string | null }>()

    zoneName = zone?.name || null
    zoneCode = zone?.code || null
  }

  return {
    id: reservation.id,
    reservationCode: reservation.reservation_code || "",
    status: reservation.status,
    guestName: reservation.guest_name,
    email: reservation.email,
    phone: reservation.phone,
    userId: reservation.user_id,
    eventTitle: event?.title || "Event",
    eventSlug: event?.slug || null,
    eventDate: eventDate?.start_at || event?.start_at || null,
    zoneName,
    zoneCode,
    guestCount: reservation.guest_count,
    session: reservation.session,
    amountPaid: Number(reservation.deposit_amount_paid || 0),
    confirmedAt: reservation.confirmed_at,
    createdAt: reservation.created_at,
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RetrieveBody

    const reservationCode = clean(body.reservationCode).toUpperCase()
    const contact = clean(body.contact)

    if (!reservationCode) {
      return NextResponse.json(
        { error: "Reservation code is required." },
        { status: 400 }
      )
    }

    if (!contact) {
      return NextResponse.json(
        { error: "Email or phone is required." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select(
        "id, event_id, event_date_id, user_id, guest_name, email, phone, reservation_code, status, confirmed_at, created_at, venue_zone_id, event_zone_id, zone_source, deposit_amount_paid, guest_count, session"
      )
      .eq("reservation_code", reservationCode)
      .maybeSingle<ReservationRow>()

    if (error) {
      return NextResponse.json(
        {
          error: "Unable to retrieve reservation.",
          details: error.message,
        },
        { status: 500 }
      )
    }

    if (!reservation || !contactsMatch(contact, reservation)) {
      return NextResponse.json(
        { error: "No reservation found with that code and contact." },
        { status: 404 }
      )
    }

    const decorated = await decorateReservation(supabase, reservation)

    return NextResponse.json({
      success: true,
      reservation: decorated,
    })
  } catch (error) {
    console.error("retrieve reservation error", error)

    return NextResponse.json(
      { error: "Unexpected error retrieving reservation." },
      { status: 500 }
    )
  }
}