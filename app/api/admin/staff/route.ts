// app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StaffRole = "owner" | "manager" | "promoter" | "staff" | "security"
type MembershipStatus = "invited" | "active" | "inactive"

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

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: clientError } = getAdminClient()
    if (!supabaseAdmin) {
      return jsonError(clientError || "Supabase admin client is not available.", 500)
    }

    const venueId = request.nextUrl.searchParams.get("venueId")
    if (!venueId) {
      return jsonError("venueId is required.", 400)
    }

    let venue: { id: string; name: string | null } = { id: venueId, name: null }

    const venueLookup = await supabaseAdmin
      .from("venues")
      .select("id, name")
      .eq("id", venueId)
      .maybeSingle()

    if (!venueLookup.error && venueLookup.data) {
      venue = venueLookup.data
    }

    const staffLookup = await supabaseAdmin
      .from("venue_staff")
      .select(
        `
        id,
        venue_id,
        user_id,
        first_name,
        last_name,
        email,
        role_at_venue,
        status,
        invited_at,
        accepted_at,
        created_at,
        updated_at
      `
      )
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })

    if (staffLookup.error) {
      return jsonError(staffLookup.error.message, 500)
    }

    return NextResponse.json({
      venue,
      staff: staffLookup.data ?? [],
    })
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load venue staff.",
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: clientError } = getAdminClient()
    if (!supabaseAdmin) {
      return jsonError(clientError || "Supabase admin client is not available.", 500)
    }

    const body = await request.json()

    const venueId = String(body?.venueId || "").trim()
    const firstName = String(body?.firstName || "").trim()
    const lastName = String(body?.lastName || "").trim()
    const email = String(body?.email || "").trim().toLowerCase()
    const role = String(body?.role || "").trim() as StaffRole

    if (!venueId || !firstName || !lastName || !email || !role) {
      return jsonError("venueId, firstName, lastName, email, and role are required.", 400)
    }

    const allowedRoles: StaffRole[] = ["owner", "manager", "promoter", "staff", "security"]
    if (!allowedRoles.includes(role)) {
      return jsonError("Invalid staff role.", 400)
    }

    const nowIso = new Date().toISOString()

    const existingLookup = await supabaseAdmin
      .from("venue_staff")
      .select("id")
      .eq("venue_id", venueId)
      .ilike("email", email)
      .maybeSingle()

    if (existingLookup.error) {
      return jsonError(existingLookup.error.message, 500)
    }

    let venueStaffId: string | null = null

    if (existingLookup.data?.id) {
      const updated = await supabaseAdmin
        .from("venue_staff")
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          role_at_venue: role,
          status: "invited" satisfies MembershipStatus,
          invited_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", existingLookup.data.id)
        .select("id")
        .single()

      if (updated.error) {
        return jsonError(updated.error.message, 500)
      }

      venueStaffId = updated.data.id
    } else {
      const inserted = await supabaseAdmin
        .from("venue_staff")
        .insert({
          venue_id: venueId,
          first_name: firstName,
          last_name: lastName,
          email,
          role_at_venue: role,
          status: "invited" satisfies MembershipStatus,
          invited_at: nowIso,
        })
        .select("id")
        .single()

      if (inserted.error) {
        return jsonError(inserted.error.message, 500)
      }

      venueStaffId = inserted.data.id
    }

    const requestOrigin = request.nextUrl.origin
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      requestOrigin

    const redirectTo = `${siteUrl}/admin/auth/accept-invite`

    const inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        venue_id: venueId,
        role_at_venue: role,
        first_name: firstName,
        last_name: lastName,
        venue_staff_id: venueStaffId,
      },
    })

    if (inviteResult.error) {
      return jsonError(inviteResult.error.message, 500)
    }

    return NextResponse.json({
      success: true,
      venueStaffId,
      message: "Invite created and email sent.",
    })
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to send invite.",
      500
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: clientError } = getAdminClient()
    if (!supabaseAdmin) {
      return jsonError(clientError || "Supabase admin client is not available.", 500)
    }

    const body = await request.json()

    const id = String(body?.id || "").trim()
    const status = String(body?.status || "").trim() as MembershipStatus

    if (!id || !status) {
      return jsonError("id and status are required.", 400)
    }

    const allowedStatuses: MembershipStatus[] = ["invited", "active", "inactive"]
    if (!allowedStatuses.includes(status)) {
      return jsonError("Invalid status.", 400)
    }

    const updatePayload: Record<string, string | null> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "active") {
      updatePayload.accepted_at = new Date().toISOString()
    }

    const updated = await supabaseAdmin
      .from("venue_staff")
      .update(updatePayload)
      .eq("id", id)

    if (updated.error) {
      return jsonError(updated.error.message, 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to update staff status.",
      500
    )
  }
}