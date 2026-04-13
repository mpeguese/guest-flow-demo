// app/admin/login/page.tsx
import { Suspense } from "react"
import LoginClient from "./LoginClient"

function LoginFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18) 0%, transparent 28%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.18) 0%, transparent 26%), linear-gradient(180deg, #0b1020 0%, #11162a 100%)",
      }}
    />
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  )
}