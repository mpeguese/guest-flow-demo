// app/book/map/page.tsx
import { Suspense } from "react"
import BookMapClient from "./BookMapClient"

function BookMapFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function BookMapPage() {
  return (
    <Suspense fallback={<BookMapFallback />}>
      <BookMapClient />
    </Suspense>
  )
}