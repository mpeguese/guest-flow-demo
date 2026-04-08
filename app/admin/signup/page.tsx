import AdminSignupClient from "./AdminSignupClient"

type IntentKey = "event" | "business" | "hybrid"

const INTENT_CONTENT: Record<
  IntentKey,
  {
    badge: string
    title: string
    subtitle: string
    summary: string
  }
> = {
  event: {
    badge: "Host Events",
    title: "Create your admin account",
    subtitle: "Start with events",
    summary: "Good for promoters, one-time events, and recurring series.",
  },
  business: {
    badge: "Business / Venue",
    title: "Create your admin account",
    subtitle: "Start with your venue",
    summary: "Good for operators managing staff, sections, maps, and service flow.",
  },
  hybrid: {
    badge: "Hybrid",
    title: "Create your admin account",
    subtitle: "Start with both sides",
    summary: "Good for teams running venue operations and hosted events together.",
  },
}

function getIntent(value: string | string[] | undefined): IntentKey {
  const normalized = Array.isArray(value) ? value[0] : value

  if (normalized === "business" || normalized === "hybrid" || normalized === "event") {
    return normalized
  }

  return "event"
}

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const intent = getIntent(resolvedSearchParams?.intent)
  const content = INTENT_CONTENT[intent]

  return <AdminSignupClient content={content} />
}