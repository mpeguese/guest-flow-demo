// app/api/profile/reservations/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

type QrCodeRow = {
  id: string
  reservation_id: string | null
  booking_code: string
  item_type: "reservation" | "zone" | "pass" | "ticket" | string
  item_ref_id: string | null
  label: string | null
  qr_value: string
  status: string
  scanned_at: string | null
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

    const { data: qrRows } = await supabase
    .from("reservation_qr_codes")
    .select(
      "id, reservation_id, booking_code, item_type, item_ref_id, label, qr_value, status, scanned_at"
    )
    .eq("booking_code", reservation.reservation_code || "")
    .order("created_at", { ascending: true })
    .returns<QrCodeRow[]>()

  const qrCodes = (qrRows || []).map((qr) => ({
    id: qr.id,
    reservationId: qr.reservation_id,
    bookingCode: qr.booking_code,
    itemType: qr.item_type,
    itemRefId: qr.item_ref_id,
    label: qr.label,
    qrValue: qr.qr_value,
    status: qr.status,
    scannedAt: qr.scanned_at,
  }))

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
    qrCodes,
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : ""

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to view saved reservations." },
        { status: 401 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user?.id) {
      return NextResponse.json(
        { error: "Invalid or expired login session." },
        { status: 401 }
      )
    }

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select(
        "id, event_id, event_date_id, user_id, guest_name, email, phone, reservation_code, status, confirmed_at, created_at, venue_zone_id, event_zone_id, zone_source, deposit_amount_paid, guest_count, session"
      )
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(25)
      .returns<ReservationRow[]>()

    if (error) {
      return NextResponse.json(
        {
          error: "Unable to load reservations.",
          details: error.message,
        },
        { status: 500 }
      )
    }

    const decorated = await Promise.all(
      (reservations || []).map((reservation) =>
        decorateReservation(supabase, reservation)
      )
    )

    return NextResponse.json({
      success: true,
      reservations: decorated,
    })
  } catch (error) {
    console.error("profile reservations error", error)

    return NextResponse.json(
      { error: "Unexpected error loading profile reservations." },
      { status: 500 }
    )
  }
}