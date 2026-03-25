//app/echo/EchoClient.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import EchoPostCard, { type EchoPost } from "../components/echo/EchoPostCard"
import EchoHeader from "../components/echo/EchoHeader"
import EchoThreadSheet from "../components/echo/EchoThreadSheet"
import EchoComposer from "../components/echo/EchoComposer"
import EchoFilterTabs, { type EchoFilter,} from "../components/echo/EchoFilterTabs"


type EchoBadge = "Here Now" | "Attended" | "Booked Table" | "VIP"

type EchoReply = {
  id: string
  author: string
  text: string
  minutesAgo: number
}

const POST_LIMIT = 140
const REPLY_LIMIT = 120

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
          animation: echoIntroFadeIn 480ms ease-out both;
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

      <EchoComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
        postLimit={POST_LIMIT}
        tagOptions={TAG_OPTIONS}
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