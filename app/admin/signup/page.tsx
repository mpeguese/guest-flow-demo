// app/admin/signup/page.tsx
import AdminSignupClient from "./AdminSignupClient"

type IntentKey = "event" | "hybrid"

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
  hybrid: {
    badge: "Hybrid",
    title: "Create your admin account",
    subtitle: "Start with full setup",
    summary:
      "Good for teams running venue operations, events, maps, and staff.",
  },
}

function getIntent(value: string | string[] | undefined): IntentKey {
  const normalized = Array.isArray(value) ? value[0] : value

  if ((normalized || "").trim().toLowerCase() === "hybrid") return "hybrid"
  return "event"
}

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ intent?: string | string[] }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const intent = getIntent(resolvedSearchParams?.intent)
  const content = INTENT_CONTENT[intent]

  return <AdminSignupClient content={content} />
}