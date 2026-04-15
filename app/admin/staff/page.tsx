// app/admin/staff/page.tsx
import InviteStaffClient from "./InviteStaffClient"

type StaffPageProps = {
  searchParams?: Promise<{
    venueId?: string
  }>
}

export default async function AdminStaffPage({ searchParams }: StaffPageProps) {
  const params = (await searchParams) ?? {}
  const venueId = typeof params.venueId === "string" ? params.venueId : ""

  return <InviteStaffClient initialVenueId={venueId} />
}