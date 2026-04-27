// app/api/reservations/retrieve/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RetrieveBody = {
  email?: string
  phone?: string
  contact?: string // backwards-compatible fallback if one field is sent
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

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(value: string | null | undefined) {
  return clean(value).replace(/\D/g, "")
}

function looksLikeEmail(value: string) {
  return value.includes("@")
}

function phoneMatches(inputPhone: string, storedPhone: string | null) {
  const inputDigits = normalizePhone(inputPhone)
  const storedDigits = normalizePhone(storedPhone)

  if (!inputDigits || !storedDigits) return false

  // Exact match, or allow matching the last 10 digits for +1 / formatted phone variants.
  return (
    storedDigits === inputDigits ||
    storedDigits.endsWith(inputDigits) ||
    inputDigits.endsWith(storedDigits)
  )
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

  const { data: qrRows, error: qrError } = await supabase
    .from("reservation_qr_codes")
    .select(
      "id, reservation_id, booking_code, item_type, item_ref_id, label, qr_value, status, scanned_at"
    )
    .eq("booking_code", reservation.reservation_code || "")
    .order("created_at", { ascending: true })
    .returns<QrCodeRow[]>()

  if (qrError) {
    console.error("Failed to fetch QR codes for reservation:", qrError.message)
  }

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RetrieveBody

    const rawContact = clean(body.contact)
    const emailInput = clean(body.email || (looksLikeEmail(rawContact) ? rawContact : "")).toLowerCase()
    const phoneInput = clean(body.phone || (!looksLikeEmail(rawContact) ? rawContact : ""))

    if (!emailInput && !phoneInput) {
      return NextResponse.json(
        { error: "Email or phone number is required." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    let reservations: ReservationRow[] = []

    if (emailInput) {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, event_id, event_date_id, user_id, guest_name, email, phone, reservation_code, status, confirmed_at, created_at, venue_zone_id, event_zone_id, zone_source, deposit_amount_paid, guest_count, session"
        )
        .eq("email", emailInput)
        .not("reservation_code", "is", null)
        .in("status", ["confirmed", "checked_in"])
        .order("created_at", { ascending: false })
        .limit(25)
        .returns<ReservationRow[]>()

      if (error) {
        return NextResponse.json(
          {
            error: "Unable to retrieve reservations by email.",
            details: error.message,
          },
          { status: 500 }
        )
      }

      reservations = data || []
    }

    if (phoneInput) {
      const phoneDigits = normalizePhone(phoneInput)

      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, event_id, event_date_id, user_id, guest_name, email, phone, reservation_code, status, confirmed_at, created_at, venue_zone_id, event_zone_id, zone_source, deposit_amount_paid, guest_count, session"
        )
        .not("reservation_code", "is", null)
        .in("status", ["confirmed", "checked_in"])
        .order("created_at", { ascending: false })
        .limit(100)
        .returns<ReservationRow[]>()

      if (error) {
        return NextResponse.json(
          {
            error: "Unable to retrieve reservations by phone.",
            details: error.message,
          },
          { status: 500 }
        )
      }

      const phoneMatchesList = (data || []).filter((reservation) =>
        phoneMatches(phoneDigits, reservation.phone)
      )

      const existingIds = new Set(reservations.map((reservation) => reservation.id))
      phoneMatchesList.forEach((reservation) => {
        if (!existingIds.has(reservation.id)) {
          reservations.push(reservation)
        }
      })
    }

    if (emailInput && phoneInput) {
      reservations = reservations.filter((reservation) => {
        const emailOk = clean(reservation.email).toLowerCase() === emailInput
        const phoneOk = phoneMatches(phoneInput, reservation.phone)
        return emailOk || phoneOk
      })
    }

    if (reservations.length === 0) {
      return NextResponse.json(
        { error: "No reservations found for that email or phone." },
        { status: 404 }
      )
    }

    const decorated = await Promise.all(
      reservations.map((reservation) => decorateReservation(supabase, reservation))
    )

    return NextResponse.json({
      success: true,
      reservations: decorated,
      reservation: decorated[0] || null,
    })
  } catch (error) {
    console.error("retrieve reservation error", error)

    return NextResponse.json(
      { error: "Unexpected error retrieving reservations." },
      { status: 500 }
    )
  }
}