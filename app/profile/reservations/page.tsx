// app/profile/reservations/page.tsx
import { Suspense } from "react"
import ReservationsClient from "./ReservationsClient"

function ReservationsFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
      }}
    />
  )
}

export default function ProfileReservationsPage() {
  return (
    <Suspense fallback={<ReservationsFallback />}>
      <ReservationsClient />
    </Suspense>
  )
}