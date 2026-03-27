"use client"

type EchoBadge = "Here Now" | "Attended" | "Booked Table" | "VIP"

export type EchoReply = {
  id: string
  author: string
  text: string
  minutesAgo: number
}

export type EchoPost = {
  id: string
  author: string
  text: string
  badge: EchoBadge
  tags: string[]
  minutesAgo: number
  replyCount: number
  popularity: number
  replies: EchoReply[]
  avatarUrl?: string
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

function EchoBadgePill({ badge }: { badge: EchoBadge }) {
  const BADGE_STYLES: Record<EchoBadge, { bg: string; color: string; border: string }> = {
    "Here Now": {
      bg: "rgba(16, 185, 129, 0.12)",
      color: "#047857",
      border: "rgba(16, 185, 129, 0.2)",
    },
    Attended: {
      bg: "rgba(59, 130, 246, 0.11)",
      color: "#1D4ED8",
      border: "rgba(59, 130, 246, 0.18)",
    },
    "Booked Table": {
      bg: "rgba(245, 158, 11, 0.13)",
      color: "#B45309",
      border: "rgba(245, 158, 11, 0.2)",
    },
    VIP: {
      bg: "rgba(168, 85, 247, 0.11)",
      color: "#7C3AED",
      border: "rgba(168, 85, 247, 0.18)",
    },
  }

  const style = BADGE_STYLES[badge]

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: style.color,
          flex: "0 0 auto",
        }}
      />
      {badge}
    </div>
  )
}

function DualCommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38BDF8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 7.5h7a3.5 3.5 0 0 1 0 7H13.5L10.8 16v-1.7A3.5 3.5 0 0 1 9 7.5Z" />
      <path d="M7.5 9.5H7A3 3 0 0 0 4 12.5c0 1 .5 1.9 1.3 2.5V17l2-1h1.2" />
    </svg>
  )
}

function Avatar({
  author,
  avatarUrl,
}: {
  author: string
  avatarUrl?: string
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={author}
        style={{
          width: 62,
          height: 62,
          borderRadius: 30,
          objectFit: "cover",
          display: "block",
          boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
          border: "1px solid rgba(255,255,255,0.78)",
          background: "#E5E7EB",
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        background:
          "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(34,197,94,0.18) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 900,
        color: "#0F172A",
        boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
      }}
    >
      {getInitials(author)}
    </div>
  )
}

export default function EchoPostCard({
  post,
  onOpenThread,
  onOpenAvatar,
}: {
  post: EchoPost
  onOpenThread: (post: EchoPost) => void
  onOpenAvatar: (post: EchoPost) => void
}) {
  const visibleTags = post.tags.slice(0, 2)
  const hiddenTagCount = Math.max(post.tags.length - visibleTags.length, 0)

  return (
    <div
      style={{
        width: "100%",
        padding: 18,
        borderRadius: 24,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          <button
            onClick={() => onOpenAvatar(post)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              margin: 0,
              cursor: post.avatarUrl ? "pointer" : "default",
              borderRadius: 16,
              flex: "0 0 auto",
            }}
            aria-label={post.avatarUrl ? `Open ${post.author} profile image` : `${post.author} avatar`}
            disabled={!post.avatarUrl}
          >
            <Avatar author={post.author} avatarUrl={post.avatarUrl} />
          </button>

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1.15,
              }}
            >
              {post.author}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(15,23,42,0.5)",
                lineHeight: 1,
              }}
            >
              {formatMinutesAgo(post.minutesAgo)}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenThread(post)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 6,
            color: "#38BDF8",
            flex: "0 0 auto",
            minWidth: 58,
          }}
          aria-label={`Open thread with ${post.replyCount} replies`}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#38BDF8",
              lineHeight: 1,
            }}
          >
            {post.replyCount}
          </div>

          <DualCommentIcon />
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 15,
          lineHeight: 1.55,
          color: "#0F172A",
          fontWeight: 600,
        }}
      >
        {post.text}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <EchoBadgePill badge={post.badge} />

        {visibleTags.map((tag) => (
          <div
            key={tag}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(14,165,233,0.08)",
              color: "#0369A1",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {tag}
          </div>
        ))}

        {hiddenTagCount > 0 ? (
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.06)",
              color: "rgba(15,23,42,0.58)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            +{hiddenTagCount}
          </div>
        ) : null}
      </div>
    </div>
  )
}