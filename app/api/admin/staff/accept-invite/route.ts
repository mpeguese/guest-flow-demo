// app/api/admin/staff/accept-invite/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StaffRole = "owner" | "manager" | "promoter" | "staff" | "security"

function jsonError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      client: null,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    }
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return { client, error: null }
}

function getUserClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !anonKey) {
    return {
      client: null,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    }
  }

  const client = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return { client, error: null }
}

function resolveRedirect(role: StaffRole, venueId: string | null) {
  if (role === "staff" || role === "security") {
    return "/admin/scanner"
  }

  if (role === "owner" || role === "manager" || role === "promoter") {
    return venueId
      ? `/admin/dashboard?venueId=${encodeURIComponent(venueId)}`
      : "/admin/dashboard"
  }

  return "/admin/scanner"
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : ""

    if (!token) {
      return jsonError("Missing bearer token.", 401)
    }

    const { client: userClient, error: userClientError } = getUserClient(token)
    if (!userClient) {
      return jsonError(userClientError || "User client is not available.", 500)
    }

    const { data: userResult, error: userError } = await userClient.auth.getUser()

    if (userError || !userResult?.user) {
      return jsonError("Unable to validate invited user session.", 401)
    }

    const authUser = userResult.user
    const email = String(authUser.email || "").trim().toLowerCase()

    if (!email) {
      return jsonError("Authenticated user does not have an email address.", 400)
    }

    const { client: supabaseAdmin, error: adminClientError } = getAdminClient()
    if (!supabaseAdmin) {
      return jsonError(adminClientError || "Supabase admin client is not available.", 500)
    }

    const metadata = {
      ...(authUser.user_metadata || {}),
      ...(authUser.app_metadata || {}),
    }

    const metadataVenueStaffId = String(metadata?.venue_staff_id || "").trim()
    const metadataVenueId = String(metadata?.venue_id || "").trim()

    let lookupQuery = supabaseAdmin
      .from("venue_staff")
      .select(`
        id,
        venue_id,
        user_id,
        email,
        role_at_venue,
        status
      `)

    if (metadataVenueStaffId) {
      lookupQuery = lookupQuery.eq("id", metadataVenueStaffId)
    } else if (metadataVenueId) {
      lookupQuery = lookupQuery.eq("venue_id", metadataVenueId).ilike("email", email)
    } else {
      lookupQuery = lookupQuery.ilike("email", email).order("created_at", { ascending: false })
    }

    const lookup = await lookupQuery.limit(1).maybeSingle()

    if (lookup.error) {
      return jsonError(lookup.error.message, 500)
    }

    if (!lookup.data) {
      return jsonError(
        "No matching venue staff record was found for this invite.",
        404
      )
    }

    const staffRecord = lookup.data as {
      id: string
      venue_id: string | null
      user_id: string | null
      email: string | null
      role_at_venue: StaffRole
      status: string | null
    }

    const nowIso = new Date().toISOString()

    const updatePayload = {
      user_id: authUser.id,
      email,
      status: "active",
      accepted_at: nowIso,
      updated_at: nowIso,
    }

    const updated = await supabaseAdmin
      .from("venue_staff")
      .update(updatePayload)
      .eq("id", staffRecord.id)
      .select(`
        id,
        venue_id,
        role_at_venue,
        status
      `)
      .single()

    if (updated.error) {
      return jsonError(updated.error.message, 500)
    }

    const venueId = updated.data.venue_id || staffRecord.venue_id || null
    const role = updated.data.role_at_venue as StaffRole
    const redirectTo = resolveRedirect(role, venueId)

    return NextResponse.json({
      success: true,
      role,
      venueId,
      redirectTo,
      message: "Invite accepted. Redirecting now.",
    })
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to complete invite acceptance.",
      500
    )
  }
}