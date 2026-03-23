// app/components/booking/MobileShell.tsx
"use client"

import { ReactNode } from "react"

export default function MobileShell({
  children,
  fullBleed = false,
}: {
  children: ReactNode
  fullBleed?: boolean
}) {
  if (fullBleed) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
          color: "#0F172A",
        }}
      >
        <div
          style={{
            width: "100%",
            minHeight: "100dvh",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
        color: "#0F172A",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  )
}