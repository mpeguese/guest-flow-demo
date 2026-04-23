// app/admin/events/page.tsx
import { Suspense } from "react"
import AdminEventsClient from "./AdminEventsClient"

function EventsFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<EventsFallback />}>
      <AdminEventsClient />
    </Suspense>
  )
}