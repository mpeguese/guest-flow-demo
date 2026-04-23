// app/admin/dashboard/page.tsx
import { Suspense } from "react"
import AdminDashboardClient from "./AdminDashboardClient"

function DashboardFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
      }}
    />
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AdminDashboardClient />
    </Suspense>
  )
}