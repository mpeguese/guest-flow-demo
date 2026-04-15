// app/admin/auth/accept-invite/page.tsx
import { Suspense } from "react"
import AcceptInviteClient from "./AcceptInviteClient"

function AcceptInviteFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      }}
    />
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <AcceptInviteClient />
    </Suspense>
  )
}