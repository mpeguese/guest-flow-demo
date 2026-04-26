// app/profile/page.tsx
import { Suspense } from "react"
import ProfileClient from "./ProfileClient"

function ProfileFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 52%, #FFF4E5 100%)",
      }}
    />
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileClient />
    </Suspense>
  )
}