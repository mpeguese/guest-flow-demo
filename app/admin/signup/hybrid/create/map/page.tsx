// app/admin/signup/hybrid/create/map/page.tsx
import { Suspense } from "react"
import HybridCreateMapClient from "./HybridCreateMapClient"

function HybridMapFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function HybridMapPage() {
  return (
    <Suspense fallback={<HybridMapFallback />}>
      <HybridCreateMapClient />
    </Suspense>
  )
}