//app/components/echo/EchoFilterTabs.tsx
"use client"

export type EchoFilter = "latest" | "hereNow" | "popular"

type EchoFilterTabsProps = {
  active: EchoFilter
  onChange: (filter: EchoFilter) => void
}

export default function EchoFilterTabs({
  active,
  onChange,
}: EchoFilterTabsProps) {
  const filters: { key: EchoFilter; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "hereNow", label: "Here Now" },
    { key: "popular", label: "Popular" },
  ]

  return (
    <div
      className="echo-hide-scrollbar"
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {filters.map((filter) => {
        const activeFilter = active === filter.key
        return (
          <button
            key={filter.key}
            onClick={() => onChange(filter.key)}
            style={{
              border: "none",
              cursor: "pointer",
              borderRadius: 999,
              padding: "11px 16px",
              whiteSpace: "nowrap",
              background: activeFilter
                ? "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)"
                : "rgba(255,255,255,0.8)",
              color: activeFilter ? "#FFFFFF" : "#0F172A",
              boxShadow: activeFilter
                ? "0 12px 26px rgba(14,165,233,0.22)"
                : "0 8px 20px rgba(15,23,42,0.06)",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 0.2,
              flex: "0 0 auto",
            }}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}