import { Suspense } from "react"
import AdminSignupEventCreateClient from "./AdminSignupEventCreateClient"

function AdminSignupEventCreateFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function AdminSignupEventCreatePage() {
  return (
    <Suspense fallback={<AdminSignupEventCreateFallback />}>
      <AdminSignupEventCreateClient />
    </Suspense>
  )
}