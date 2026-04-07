// app/book/event/[slug]/tickets/page.tsx
import { notFound } from "next/navigation"
import {
  getEventBookingMetaBySlug,
  getVisibleTicketTypesForEventSlug,
} from "@/app/lib/booking-queries"
import EventTicketsPageClient from "./EventTicketsPageClient"

export default async function EventTicketsPage({
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

  return <EventTicketsPageClient event={event} ticketTypes={ticketTypes} />
}