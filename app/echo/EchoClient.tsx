"use client"

import { useEffect, useMemo, useState } from "react"

type EchoFilter = "latest" | "hereNow" | "popular"
type EchoBadge = "Here Now" | "Attended" | "Booked Table" | "VIP"

type EchoReply = {
  id: string
  author: string
  text: string
  minutesAgo: number
}

type EchoPost = {
  id: string
  author: string
  text: string
  badge: EchoBadge
  tags: string[]
  minutesAgo: number
  replyCount: number
  popularity: number
  replies: EchoReply[]
}

const POST_LIMIT = 140
const REPLY_LIMIT = 120

const BADGE_STYLES: Record<EchoBadge, { bg: string; color: string; border: string }> = {
  "Here Now": {
    bg: "rgba(16, 185, 129, 0.14)",
    color: "#047857",
    border: "rgba(16, 185, 129, 0.22)",
  },
  Attended: {
    bg: "rgba(59, 130, 246, 0.14)",
    color: "#1D4ED8",
    border: "rgba(59, 130, 246, 0.22)",
  },
  "Booked Table": {
    bg: "rgba(245, 158, 11, 0.16)",
    color: "#B45309",
    border: "rgba(245, 158, 11, 0.24)",
  },
  VIP: {
    bg: "rgba(168, 85, 247, 0.14)",
    color: "#7C3AED",
    border: "rgba(168, 85, 247, 0.22)",
  },
}

const TAG_OPTIONS = [
  "Packed",
  "Good Music",
  "Long Line",
  "Chill",
  "Upscale",
  "Fast Entry",
  "VIP Crowd",
  "Worth It",
  "High Energy",
  "Smooth Night",
]

const INITIAL_POSTS: EchoPost[] = [
  {
    id: "p1",
    author: "Mia R.",
    text: "Crowd really picked up after 11. Energy is strong and the DJ is carrying tonight.",
    badge: "Here Now",
    tags: ["High Energy", "Good Music"],
    minutesAgo: 6,
    replyCount: 3,
    popularity: 91,
    replies: [
      { id: "r1", author: "Jalen", text: "Agreed. Best it has felt all night.", minutesAgo: 4 },
      { id: "r2", author: "Chris", text: "How is the line now?", minutesAgo: 3 },
      { id: "r3", author: "Mia R.", text: "Not terrible anymore.", minutesAgo: 2 },
    ],
  },
  {
    id: "p2",
    author: "Andre T.",
    text: "Table section looks great tonight. More polished crowd than usual.",
    badge: "Booked Table",
    tags: ["Upscale", "VIP Crowd"],
    minutesAgo: 11,
    replyCount: 2,
    popularity: 78,
    replies: [
      { id: "r4", author: "Keisha", text: "How packed is it by the bar?", minutesAgo: 9 },
      { id: "r5", author: "Andre T.", text: "Busy but still moving.", minutesAgo: 8 },
    ],
  },
  {
    id: "p3",
    author: "Lena",
    text: "Entry moved faster than I expected. Worth pulling up before midnight.",
    badge: "Here Now",
    tags: ["Fast Entry", "Worth It"],
    minutesAgo: 14,
    replyCount: 1,
    popularity: 73,
    replies: [{ id: "r6", author: "Dev", text: "Good look.", minutesAgo: 12 }],
  },
  {
    id: "p4",
    author: "Noah P.",
    text: "Good balance tonight. Busy enough to feel alive but not shoulder to shoulder.",
    badge: "Attended",
    tags: ["Chill", "Smooth Night"],
    minutesAgo: 27,
    replyCount: 2,
    popularity: 66,
    replies: [
      { id: "r7", author: "Elle", text: "This is exactly what I wanted to know.", minutesAgo: 22 },
      { id: "r8", author: "Noah P.", text: "Yeah it is in a good pocket right now.", minutesAgo: 21 },
    ],
  },
  {
    id: "p5",
    author: "Sasha",
    text: "Line was slow earlier but inside feels worth it now. Music definitely saved the night.",
    badge: "Attended",
    tags: ["Long Line", "Good Music"],
    minutesAgo: 38,
    replyCount: 4,
    popularity: 84,
    replies: [
      { id: "r9", author: "Kim", text: "That is what I heard too.", minutesAgo: 34 },
      { id: "r10", author: "Dre", text: "What time did it get better?", minutesAgo: 32 },
      { id: "r11", author: "Sasha", text: "Around 10:45.", minutesAgo: 30 },
      { id: "r12", author: "Leo", text: "Helpful.", minutesAgo: 28 },
    ],
  },
]

function formatMinutesAgo(minutesAgo: number) {
  if (minutesAgo < 1) return "now"
  if (minutesAgo < 60) return `${minutesAgo}m`
  const hours = Math.floor(minutesAgo / 60)
  return `${hours}h`
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function sortPosts(posts: EchoPost[], filter: EchoFilter) {
  if (filter === "hereNow") {
    return [...posts].sort((a, b) => {
      const aScore = a.badge === "Here Now" ? 1 : 0
      const bScore = b.badge === "Here Now" ? 1 : 0
      if (aScore !== bScore) return bScore - aScore
      return a.minutesAgo - b.minutesAgo
    })
  }

  if (filter === "popular") {
    return [...posts].sort((a, b) => b.popularity - a.popularity)
  }

  return [...posts].sort((a, b) => a.minutesAgo - b.minutesAgo)
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.55 2.46c.2 2.13-.55 3.53-1.88 4.91-1.27 1.32-2.85 2.72-2.85 5.13 0 1.95 1.42 3.32 3.18 3.32 2.42 0 4.05-2 4.05-4.65 0-2.16-.92-3.91-2.5-5.56Zm-1.7 19.07c-3.77 0-6.73-2.8-6.73-6.67 0-2.84 1.53-4.9 3.31-6.58.77-.73 1.41-1.46 1.58-2.46.07-.39.08-.78.02-1.17 3.87 1.98 6.85 5.7 6.85 10.13 0 3.95-2.83 6.75-5.03 6.75Zm.33-4.03c1.31 0 2.31-1.03 2.31-2.53 0-1.2-.54-2.08-1.52-3.14-.06 1.01-.5 1.65-1.09 2.25-.63.65-1.28 1.32-1.28 2.5 0 .56.42.92 1.03.92.33 0 .42 0 .55 0Z" />
    </svg>
  )
}

function SummaryIconBars() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 18V12" />
      <path d="M12 18V7" />
      <path d="M19 18V10" />
    </svg>
  )
}

function SummaryMusicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V7l10-2v11" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="16" cy="16" r="2" />
    </svg>
  )
}

function SummarySparkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  )
}

function EchoBadgePill({ badge }: { badge: EchoBadge }) {
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

function EchoFilterTabs({
  active,
  onChange,
}: {
  active: EchoFilter
  onChange: (filter: EchoFilter) => void
}) {
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
                : "rgba(255,255,255,0.78)",
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

function EchoHeader({
  postCount,
  onBack,
  showIntro,
  onDismissIntro,
}: {
  postCount: number
  onBack: () => void
  showIntro: boolean
  onDismissIntro: () => void
}) {
  const summaryItems = [
    {
      label: "Packed Tonight",
      icon: <SummaryIconBars />,
      color: "#0369A1",
      bg: "rgba(14,165,233,0.11)",
    },
    {
      label: "Music Up",
      icon: <SummaryMusicIcon />,
      color: "#047857",
      bg: "rgba(34,197,94,0.11)",
    },
    {
      label: "Worth Pulling Up",
      icon: <SummarySparkIcon />,
      color: "#B45309",
      bg: "rgba(245,158,11,0.13)",
    },
  ]

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          aria-label="Go back"
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.72)",
            background: "rgba(255,255,255,0.76)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 12px 26px rgba(15,23,42,0.07)",
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          <ChevronLeftIcon />
        </button>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 12px 26px rgba(15,23,42,0.07)",
            border: "1px solid rgba(255,255,255,0.7)",
            color: "#0F172A",
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
            flex: "0 0 auto",
          }}
        >
          {postCount} live updates
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 31,
            fontWeight: 900,
            letterSpacing: -0.8,
            lineHeight: 1,
            color: "#0F172A",
          }}
        >
          Echo
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(15,23,42,0.66)",
          }}
        >
          LIV Saturday
        </div>
      </div>

      {showIntro ? (
        <div
          className="echo-intro-fade-in"
          style={{
            position: "relative",
            padding: 16,
            borderRadius: 24,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(255,255,255,0.76)",
            boxShadow: "0 14px 28px rgba(15,23,42,0.06)",
            backdropFilter: "blur(14px)",
          }}
        >
          <button
            onClick={onDismissIntro}
            aria-label="Dismiss intro"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 30,
              height: 30,
              borderRadius: 999,
              border: "none",
              background: "rgba(241,245,249,0.92)",
              color: "rgba(15,23,42,0.62)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <CloseIcon />
          </button>

          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#0F172A",
              letterSpacing: -0.2,
              paddingRight: 40,
            }}
          >
            The live voice of the room
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.5,
              color: "rgba(15,23,42,0.72)",
              fontWeight: 700,
              paddingRight: 10,
            }}
          >
            Live takes from guests who are here, just left, or already booked in. See the
            energy before you pull up and join the conversation.
          </div>
        </div>
      ) : null}

      <div
        className="echo-hide-scrollbar"
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 2,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {summaryItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 13px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(255,255,255,0.78)",
              boxShadow: "0 12px 22px rgba(15,23,42,0.05)",
              whiteSpace: "nowrap",
              flex: "0 0 auto",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: item.bg,
                color: item.color,
                flex: "0 0 auto",
              }}
            >
              {item.icon}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: 0.15,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EchoPostCard({
  post,
  onOpen,
}: {
  post: EchoPost
  onOpen: (post: EchoPost) => void
}) {
  const isHot = post.replyCount >= 3

  return (
    <button
      onClick={() => onOpen(post)}
      style={{
        width: "100%",
        textAlign: "left",
        //border: "none",
        cursor: "pointer",
        padding: 18,
        borderRadius: 24,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
        border: "1px solid rgba(255,255,255,0.72)",
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
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(34,197,94,0.18) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: "#0F172A",
              flex: "0 0 auto",
            }}
          >
            {getInitials(post.author)}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#0F172A",
                }}
              >
                {post.author}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(15,23,42,0.5)",
                }}
              >
                {formatMinutesAgo(post.minutesAgo)}
              </div>
              {isHot ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 8px",
                    borderRadius: 999,
                    background: "rgba(249,115,22,0.12)",
                    color: "#EA580C",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 0.2,
                  }}
                >
                  <FlameIcon />
                  Hot
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 10 }}>
              <EchoBadgePill badge={post.badge} />
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 15,
                lineHeight: 1.45,
                color: "#0F172A",
                fontWeight: 700,
              }}
            >
              {post.text}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {post.tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(14,165,233,0.09)",
                    color: "#0369A1",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            minWidth: 58,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            paddingTop: 2,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            {post.replyCount}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(15,23,42,0.52)",
              letterSpacing: 0.2,
              width: "100%",
              textAlign: "center",
            }}
          >
            replies
          </div>
        </div>
      </div>
    </button>
  )
}

function EchoComposerSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { text: string; badge: EchoBadge; tags: string[] }) => void
}) {
  const [text, setText] = useState("")
  const [badge, setBadge] = useState<EchoBadge>("Here Now")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setText("")
      setBadge("Here Now")
      setSelectedTags([])
    }
  }, [open])

  if (!open) return null

  const remaining = POST_LIMIT - text.length
  const trimmed = text.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= POST_LIMIT

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) return current.filter((t) => t !== tag)
      if (current.length >= 3) return current
      return [...current, tag]
    })
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.26)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,250,255,0.98) 100%)",
          boxShadow: "0 -24px 60px rgba(15,23,42,0.18)",
          padding: "14px 18px calc(18px + env(safe-area-inset-bottom))",
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
            fontSize: 22,
            fontWeight: 900,
            color: "#0F172A",
            letterSpacing: -0.4,
          }}
        >
          Share the vibe
        </div>

        <div style={{ marginTop: 16 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, POST_LIMIT))}
            placeholder="What’s the vibe?"
            rows={4}
            style={{
              width: "100%",
              resize: "none",
              border: "1px solid rgba(148,163,184,0.18)",
              outline: "none",
              borderRadius: 22,
              padding: 16,
              fontSize: 15,
              lineHeight: 1.45,
              color: "#0F172A",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              marginTop: 8,
              textAlign: "right",
              fontSize: 12,
              fontWeight: 800,
              color: remaining < 16 ? "#DC2626" : "rgba(15,23,42,0.48)",
            }}
          >
            {remaining}
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["Here Now", "Attended", "Booked Table", "VIP"] as EchoBadge[]).map((item) => {
            const active = badge === item
            return (
              <button
                key={item}
                onClick={() => setBadge(item)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 999,
                  padding: "10px 12px",
                  background: active
                    ? "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)"
                    : "rgba(241,245,249,0.95)",
                  color: active ? "#FFFFFF" : "#0F172A",
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow: active ? "0 10px 20px rgba(14,165,233,0.18)" : "none",
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TAG_OPTIONS.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 999,
                  padding: "10px 12px",
                  background: active ? "rgba(14,165,233,0.12)" : "rgba(241,245,249,0.95)",
                  color: active ? "#0369A1" : "#334155",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

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
              fontWeight: 800,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!canSubmit) return
              onSubmit({ text: trimmed, badge, tags: selectedTags })
              onClose()
            }}
            style={{
              flex: 1,
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              borderRadius: 18,
              padding: "15px 16px",
              background: canSubmit
                ? "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)"
                : "rgba(148,163,184,0.35)",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 900,
              boxShadow: canSubmit ? "0 14px 30px rgba(14,165,233,0.22)" : "none",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </>
  )
}

function EchoThreadSheet({
  open,
  post,
  onClose,
  onReply,
}: {
  open: boolean
  post: EchoPost | null
  onClose: () => void
  onReply: (postId: string, text: string) => void
}) {
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    if (open) setReplyText("")
  }, [open, post?.id])

  if (!open || !post) return null

  const remaining = REPLY_LIMIT - replyText.length
  const canReply = replyText.trim().length > 0 && replyText.trim().length <= REPLY_LIMIT

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.3)",
          backdropFilter: "blur(6px)",
          zIndex: 110,
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "75dvh",
          zIndex: 111,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.985) 0%, rgba(247,250,255,0.985) 100%)",
          boxShadow: "0 -28px 64px rgba(15,23,42,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 18px 10px" }}>
          <div
            style={{
              width: 44,
              height: 5,
              borderRadius: 999,
              background: "rgba(15,23,42,0.14)",
              margin: "0 auto 14px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#0F172A",
                  }}
                >
                  {post.author}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "rgba(15,23,42,0.5)",
                  }}
                >
                  {formatMinutesAgo(post.minutesAgo)}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <EchoBadgePill badge={post.badge} />
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "#0F172A",
                  fontWeight: 700,
                }}
              >
                {post.text}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {post.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      background: "rgba(14,165,233,0.09)",
                      color: "#0369A1",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                border: "none",
                cursor: "pointer",
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "rgba(241,245,249,0.92)",
                color: "#0F172A",
                fontSize: 18,
                fontWeight: 900,
                flex: "0 0 auto",
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 18px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingBottom: 110,
            }}
          >
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                style={{
                  borderRadius: 22,
                  padding: 14,
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(255,255,255,0.72)",
                  boxShadow: "0 12px 24px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#0F172A",
                    }}
                  >
                    {reply.author}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(15,23,42,0.46)",
                    }}
                  >
                    {formatMinutesAgo(reply.minutesAgo)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: "#0F172A",
                    fontWeight: 700,
                  }}
                >
                  {reply.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px 16px calc(14px + env(safe-area-inset-bottom))",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.95) 18%, rgba(255,255,255,0.98) 100%)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(148,163,184,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1 }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, REPLY_LIMIT))}
                rows={2}
                placeholder="Reply"
                style={{
                  width: "100%",
                  resize: "none",
                  border: "1px solid rgba(148,163,184,0.18)",
                  outline: "none",
                  borderRadius: 18,
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.35,
                  color: "#0F172A",
                  background: "rgba(255,255,255,0.95)",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: 6,
                  textAlign: "right",
                  fontSize: 11,
                  fontWeight: 800,
                  color: remaining < 16 ? "#DC2626" : "rgba(15,23,42,0.46)",
                }}
              >
                {remaining}
              </div>
            </div>

            <button
              onClick={() => {
                if (!canReply) return
                onReply(post.id, replyText.trim())
                setReplyText("")
              }}
              style={{
                border: "none",
                cursor: canReply ? "pointer" : "not-allowed",
                borderRadius: 18,
                padding: "14px 16px",
                background: canReply
                  ? "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)"
                  : "rgba(148,163,184,0.35)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 900,
                minWidth: 78,
              }}
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EchoClient() {
  const [filter, setFilter] = useState<EchoFilter>("latest")
  const [posts, setPosts] = useState<EchoPost[]>(INITIAL_POSTS)
  const [composerOpen, setComposerOpen] = useState(false)
  const [threadOpen, setThreadOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  const filteredPosts = useMemo(() => sortPosts(posts, filter), [posts, filter])

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId]
  )

  const openThread = (post: EchoPost) => {
    setSelectedPostId(post.id)
    setThreadOpen(true)
  }

  const handleCreatePost = (payload: { text: string; badge: EchoBadge; tags: string[] }) => {
    const newPost: EchoPost = {
      id: `post-${Date.now()}`,
      author: "You",
      text: payload.text,
      badge: payload.badge,
      tags: payload.tags,
      minutesAgo: 0,
      replyCount: 0,
      popularity: 95,
      replies: [],
    }

    setPosts((current) => [
      newPost,
      ...current.map((post) => ({ ...post, minutesAgo: post.minutesAgo + 1 })),
    ])
  }

  const handleReply = (postId: string, text: string) => {
    const newReply: EchoReply = {
      id: `reply-${Date.now()}`,
      author: "You",
      text,
      minutesAgo: 0,
    }

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          replyCount: post.replyCount + 1,
          popularity: post.popularity + 2,
          replies: [...post.replies, newReply],
        }
      })
    )
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.href = "/"
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F5FBFF 38%, #EEFDF8 72%, #FFF6EC 100%)",
        color: "#0F172A",
      }}
    >
      <style jsx global>{`
        .echo-hide-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
          background: transparent;
        }

       @keyframes echoIntroFadeIn {
        0% {
            opacity: 0;
            transform: translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
        }

        .echo-intro-fade-in {
        animation: echoIntroFadeIn 500ms ease-out both;
        }
      `}</style>

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "calc(22px + env(safe-area-inset-top)) 16px 120px",
          boxSizing: "border-box",
        }}
      >
        <EchoHeader
          postCount={posts.length}
          onBack={handleBack}
          showIntro={showIntro}
          onDismissIntro={() => setShowIntro(false)}
        />

        <div style={{ marginTop: 18 }}>
          <EchoFilterTabs active={filter} onChange={setFilter} />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {filteredPosts.map((post) => (
            <EchoPostCard key={post.id} post={post} onOpen={openThread} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setComposerOpen(true)}
        style={{
          position: "fixed",
          right: 18,
          bottom: "calc(18px + env(safe-area-inset-bottom))",
          border: "none",
          cursor: "pointer",
          borderRadius: 999,
          padding: "16px 20px",
          background: "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 0.2,
          boxShadow: "0 18px 36px rgba(14,165,233,0.28)",
          zIndex: 20,
        }}
      >
        Share the vibe
      </button>

      <EchoComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
      />

      <EchoThreadSheet
        open={threadOpen}
        post={selectedPost}
        onClose={() => setThreadOpen(false)}
        onReply={handleReply}
      />
    </div>
  )
}