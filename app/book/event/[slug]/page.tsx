// app/book/event/[slug]/page.tsx
import { notFound } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import {
  getEventBookingMetaBySlug,
  getVisibleTicketTypesForEventSlug,
} from "@/app/lib/booking-queries"
import EventBookingPageClient from "./EventBookingPageClient"

export default async function EventBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [event, ticketTypes] = await Promise.all([
    getEventBookingMetaBySlug(slug),
    getVisibleTicketTypesForEventSlug(slug),
  ])

  if (!event) {
    notFound()
  }

  const ticketCount = ticketTypes.length

//   const startPrice =
//     ticketTypes.length > 0
//       ? Math.min(...ticketTypes.map((ticket) => ticket.price))
//       : null

  const availableTickets = ticketTypes.filter(ticket => !ticket.isSoldOut)

  const startPrice =
    availableTickets.length > 0
      ? Math.min(...availableTickets.map(ticket => ticket.price))
      : null

  return (
    <MobileShell fullBleed>
      <EventBookingPageClient
        event={event}
        startPrice={startPrice}
        ticketCount={ticketCount}
      />
    </MobileShell>
  )
}