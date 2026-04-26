// app/api/reservations/guest-info/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type GuestInfoRequestBody = {
  reservationIds?: string[]
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  marketingOptIn?: boolean
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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GuestInfoRequestBody

    const reservationIds = Array.isArray(body.reservationIds)
      ? body.reservationIds.filter((id) => typeof id === "string" && id.trim())
      : []

    const firstName = cleanText(body.firstName)
    const lastName = cleanText(body.lastName)
    const email = cleanText(body.email).toLowerCase()
    const phone = cleanText(body.phone)
    const marketingOptIn = Boolean(body.marketingOptIn)

    if (reservationIds.length === 0) {
      return NextResponse.json(
        { error: "At least one reservationId is required." },
        { status: 400 }
      )
    }

    if (!firstName && !lastName && !email && !phone) {
      return NextResponse.json(
        { error: "At least one guest detail is required." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    let authenticatedUserId: string | null = null

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : ""

    if (token) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token)

      if (!authError && authData.user?.id) {
        authenticatedUserId = authData.user.id
      }
    }

    const guestName = [firstName, lastName].filter(Boolean).join(" ").trim() || null
    const nowIso = new Date().toISOString()

    const reservationUpdatePayload = {
      user_id: authenticatedUserId,
      guest_name: guestName,
      email: email || null,
      phone: phone || null,
      notes: marketingOptIn ? "Marketing opt-in: yes" : null,
      updated_at: nowIso,
    }

    const reservationsResult = await supabase
      .from("reservations")
      .update(reservationUpdatePayload)
      .in("id", reservationIds)
      .select("id, user_id, guest_name, email, phone, reservation_code, status")

    if (reservationsResult.error) {
      return NextResponse.json(
        {
          error: "Failed to save guest details to reservation.",
          details: reservationsResult.error.message,
        },
        { status: 500 }
      )
    }

    if (authenticatedUserId) {
      const profilePayload = {
        id: authenticatedUserId,
        first_name: firstName || null,
        last_name: lastName || null,
        email: email || null,
        phone: phone || null,
        updated_at: nowIso,
      }

      const profileResult = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select("id")
        .single()

      if (profileResult.error) {
        return NextResponse.json(
          {
            error: "Reservation details were saved, but profile update failed.",
            details: profileResult.error.message,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      userId: authenticatedUserId,
      reservations: reservationsResult.data || [],
    })
  } catch (error) {
    console.error("Unexpected error saving guest info:", error)

    return NextResponse.json(
      { error: "Unexpected error saving guest details." },
      { status: 500 }
    )
  }
}