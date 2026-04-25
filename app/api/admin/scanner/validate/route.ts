//app/api/admin/scanner/validate/route.ts
import { NextResponse } from "next/server"

type ScannerResultStatus =
  | "valid"
  | "already_used"
  | "invalid"
  | "voided"
  | "refunded"

type ScannerValidationResponse = {
  result: {
    status: ScannerResultStatus
    title: string
    description: string
    guestName?: string
    passType?: string
    eventName?: string
    accessPoint?: string
    ticketCode?: string
  }
}

type ParsedQr =
  | {
      ok: true
      kind: "pass" | "reservation" | "zone"
      original: string
      canonicalValue: string
      displayCode: string
    }
  | {
      ok: false
      original: string
      reason: string
    }

const PASS_CODE_REGEX = /^GF-PASS-[A-Z0-9]{6}-[A-Z0-9]{4}$/i
const ZONE_CODE_REGEX = /^GF-RES-[A-Z0-9]{6}-[A-Z0-9]{4}$/i
const RESERVATION_CODE_REGEX = /^GF-[A-Z0-9]{8}$/i

function parseGuestLystQr(rawValue: string): ParsedQr {
  const original = String(rawValue || "").trim()

  if (!original) {
    return {
      ok: false,
      original,
      reason: "QR code is empty.",
    }
  }

  const lower = original.toLowerCase()

  if (lower.startsWith("GuestLyst://pass/")) {
    const value = original.slice("GuestLyst://pass/".length).trim()

    if (!value) {
      return {
        ok: false,
        original,
        reason: "Pass code is missing from the GuestLyst pass link.",
      }
    }

    if (PASS_CODE_REGEX.test(value)) {
      return {
        ok: true,
        kind: "pass",
        original,
        canonicalValue: value.toUpperCase(),
        displayCode: value.toUpperCase(),
      }
    }

    return {
      ok: false,
      original,
      reason: "GuestLyst pass link does not contain a valid pass code.",
    }
  }

  if (lower.startsWith("GuestLyst://reservation/")) {
    const value = original.slice("GuestLyst://reservation/".length).trim()

    if (!value) {
      return {
        ok: false,
        original,
        reason: "Reservation code is missing from the GuestLyst reservation link.",
      }
    }

    if (RESERVATION_CODE_REGEX.test(value)) {
      return {
        ok: true,
        kind: "reservation",
        original,
        canonicalValue: value.toUpperCase(),
        displayCode: value.toUpperCase(),
      }
    }

    if (ZONE_CODE_REGEX.test(value)) {
      return {
        ok: true,
        kind: "zone",
        original,
        canonicalValue: value.toUpperCase(),
        displayCode: value.toUpperCase(),
      }
    }

    return {
      ok: false,
      original,
      reason:
        "GuestLyst reservation link does not contain a valid reservation or zone code.",
    }
  }

  if (PASS_CODE_REGEX.test(original)) {
    return {
      ok: true,
      kind: "pass",
      original,
      canonicalValue: original.toUpperCase(),
      displayCode: original.toUpperCase(),
    }
  }

  if (ZONE_CODE_REGEX.test(original)) {
    return {
      ok: true,
      kind: "zone",
      original,
      canonicalValue: original.toUpperCase(),
      displayCode: original.toUpperCase(),
    }
  }

  if (RESERVATION_CODE_REGEX.test(original)) {
    return {
      ok: true,
      kind: "reservation",
      original,
      canonicalValue: original.toUpperCase(),
      displayCode: original.toUpperCase(),
    }
  }

  return {
    ok: false,
    original,
    reason: "QR code is not a recognized GuestLyst pass or reservation format.",
  }
}

function buildMockGuestName(code: string) {
  const suffix = code.slice(-4)
  return `Guest ${suffix}`
}

function buildResultFromParsedQr(
  parsed: Extract<ParsedQr, { ok: true }>,
  locationId: string
): ScannerValidationResponse {
  const code = parsed.canonicalValue
  const upper = code.toUpperCase()

  // Optional demo overrides for testing non-valid states.
  if (upper.includes("USED")) {
    return {
      result: {
        status: "already_used",
        title: "Already Used",
        description: "This GuestLyst QR code has already been checked in.",
        guestName: buildMockGuestName(code),
        passType: parsed.kind === "pass" ? "Guest Entry Pass" : "Reservation",
        eventName: "Neon Saturdays",
        accessPoint:
          locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
        ticketCode: parsed.displayCode,
      },
    }
  }

  if (upper.includes("VOID")) {
    return {
      result: {
        status: "voided",
        title: "Voided Pass",
        description: "This GuestLyst pass was voided and cannot be used.",
        guestName: buildMockGuestName(code),
        passType: parsed.kind === "pass" ? "Guest Entry Pass" : "Reservation",
        eventName: "Neon Saturdays",
        accessPoint:
          locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
        ticketCode: parsed.displayCode,
      },
    }
  }

  if (upper.includes("REFUND")) {
    return {
      result: {
        status: "refunded",
        title: "Refunded Pass",
        description: "This GuestLyst order was refunded and is no longer active.",
        guestName: buildMockGuestName(code),
        passType: parsed.kind === "pass" ? "Guest Entry Pass" : "Reservation",
        eventName: "Neon Saturdays",
        accessPoint:
          locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
        ticketCode: parsed.displayCode,
      },
    }
  }

  if (parsed.kind === "pass") {
    return {
      result: {
        status: "valid",
        title: "Valid Pass",
        description: "GuestLyst pass is active and ready for check-in.",
        guestName: buildMockGuestName(code),
        passType: "Guest Entry Pass",
        eventName: "Neon Saturdays",
        accessPoint:
          locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
        ticketCode: parsed.displayCode,
      },
    }
  }

  if (parsed.kind === "zone") {
    return {
      result: {
        status: "valid",
        title: "Valid Reservation Item",
        description: "GuestLyst reservation item is valid for venue access.",
        guestName: buildMockGuestName(code),
        passType: "Table / Zone Reservation",
        eventName: "Neon Saturdays",
        accessPoint:
          locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
        ticketCode: parsed.displayCode,
      },
    }
  }

  return {
    result: {
      status: "valid",
      title: "Valid Reservation",
      description: "GuestLyst reservation is confirmed and ready for lookup.",
      guestName: buildMockGuestName(code),
      passType: "Reservation",
      eventName: "Neon Saturdays",
      accessPoint:
        locationId === "liv-tampa-main-door" ? "Main Door" : "Guest Access",
      ticketCode: parsed.displayCode,
    },
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const qrCode = String(body?.qrCode || "").trim()
    const locationId = String(body?.locationId || "main-door")

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code is required." },
        { status: 400 }
      )
    }

    const parsed = parseGuestLystQr(qrCode)

    if (!parsed.ok) {
      return NextResponse.json({
        result: {
          status: "invalid",
          title: "Invalid Code",
          description: parsed.reason,
          guestName: "No Match Found",
          passType: "Unknown",
          eventName: "Unknown Event",
          accessPoint: "Main Door",
          ticketCode: qrCode,
        },
      })
    }

    const payload = buildResultFromParsedQr(parsed, locationId)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: "Unable to validate the QR code." },
      { status: 500 }
    )
  }
}