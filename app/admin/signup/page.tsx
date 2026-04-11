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
    summary: "Good for teams running events, maps, staff, and venue operations together.",
  },
}

function getIntent(value: string | string[] | undefined): IntentKey {
  const normalized = Array.isArray(value) ? value[0] : value

  if (normalized === "hybrid") return "hybrid"
  return "event"
}

export default function AdminSignupPage({
  searchParams,
}: {
  searchParams?: { intent?: string | string[] }
}) {
  const intent = getIntent(searchParams?.intent)
  const content = INTENT_CONTENT[intent]

  return <AdminSignupClient content={content} />
}