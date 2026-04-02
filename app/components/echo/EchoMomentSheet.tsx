"use client"

import type { EchoPost } from "../../echo/EchoClient"

type EchoMomentSheetProps = {
  post: EchoPost | null
  onClose: () => void
  onOpenAvatar: (post: EchoPost) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatMinutesAgo(minutesAgo: number) {
  if (minutesAgo < 1) return "now"
  if (minutesAgo < 60) return `${minutesAgo}m`
  const hours = Math.floor(minutesAgo / 60)
  return `${hours}h`
}

function badgeStyle(badge: EchoPost["badge"]) {
  if (badge === "Here Now") {
    return {
      bg: "rgba(16,185,129,0.12)",
      color: "#047857",
      border: "rgba(16,185,129,0.18)",
    }
  }

  if (badge === "Booked Table") {
    return {
      bg: "rgba(245,158,11,0.12)",
      color: "#B45309",
      border: "rgba(245,158,11,0.18)",
    }
  }

  if (badge === "VIP") {
    return {
      bg: "rgba(168,85,247,0.12)",
      color: "#7C3AED",
      border: "rgba(168,85,247,0.18)",
    }
  }

  return {
    bg: "rgba(59,130,246,0.12)",
    color: "#1D4ED8",
    border: "rgba(59,130,246,0.18)",
  }
}

export default function EchoMomentSheet({
  post,
  onClose,
  onOpenAvatar,
}: EchoMomentSheetProps) {
  if (!post) return null

  const badge = badgeStyle(post.badge)

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 110,
        }}
      />

      <div
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 111,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,250,255,0.98) 100%)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
          padding: "14px 18px calc(18px + env(safe-area-inset-bottom))",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            borderRadius: 999,
            background: "rgba(15,23,42,0.14)",
            margin: "0 auto 16px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {post.avatarUrl ? (
            <button
              type="button"
              onClick={() => onOpenAvatar(post)}
              aria-label={`Open ${post.author} profile photo`}
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                padding: 0,
                margin: 0,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.84)",
                cursor: "pointer",
                background: "transparent",
                boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                flex: "0 0 auto",
              }}
            >
              <img
                src={post.avatarUrl}
                alt={post.author}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(34,197,94,0.18) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#0F172A",
                boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                flex: "0 0 auto",
              }}
            >
              {getInitials(post.author)}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1.1,
              }}
            >
              {post.author}
            </div>

            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 10px",
                  borderRadius: 999,
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: badge.color,
                    flex: "0 0 auto",
                  }}
                />
                {post.badge}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.52)",
                }}
              >
                {formatMinutesAgo(post.minutesAgo)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 21,
            lineHeight: 1.28,
            color: "#0F172A",
            fontWeight: 900,
            letterSpacing: -0.45,
          }}
        >
          {post.text}
        </div>

        {post.tags.length > 0 ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {post.tags.map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(14,165,233,0.08)",
                  color: "#0369A1",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: "none",
              cursor: "pointer",
              borderRadius: 18,
              padding: "15px 16px",
              background: "rgba(241,245,249,0.98)",
              color: "#0F172A",
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}