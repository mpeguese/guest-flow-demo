// app/login/page.tsx
import { Suspense } from "react"
import LoginClient from "./LoginClient"
import MobileShell from "@/app/components/booking/MobileShell"

function LoginFallback() {
  return (
    <MobileShell fullBleed>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
          display: "grid",
          placeItems: "center",
          color: "#64748B",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 0.8,
        }}
      >
        LOADING
      </div>
    </MobileShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  )
}