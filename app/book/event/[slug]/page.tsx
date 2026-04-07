// app/book/event/[slug]/page.tsx
import { notFound } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { passProducts } from "@/app/lib/book-pass-data"
import { getEventBookingMetaBySlug } from "@/app/lib/booking-queries" 
import EventBookingPageClient from "./EventBookingPageClient"

function formatDisplayDate(dateKey: string) {
  if (!dateKey) return "Date TBA"
  const date = new Date(`${dateKey}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export default async function EventBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBookingMetaBySlug(slug)

  if (!event) {
    notFound()
  }

  const startPrice =
    passProducts.length > 0 ? Math.min(...passProducts.map((pass) => pass.price)) : null

  return (
    <MobileShell fullBleed>
      <EventBookingPageClient
        event={event}
        startPrice={startPrice}
        ticketCount={passProducts.length}
      />
    </MobileShell>
  )
}