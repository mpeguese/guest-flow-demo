// app/book/confirmation/page.tsx
import { Suspense } from "react"
import ConfirmationClient from "./ConfirmationClient"

function ConfirmationFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationFallback />}>
      <ConfirmationClient />
    </Suspense>
  )
}