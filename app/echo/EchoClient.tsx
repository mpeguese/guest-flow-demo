//app/echo/EchoClient.tsx
"use client"

import { useMemo, useState } from "react"
import EchoHeader from "../components/echo/EchoHeader"
import EchoComposer from "../components/echo/EchoComposer"
import EchoFilterTabs, { type EchoFilter } from "../components/echo/EchoFilterTabs"
import EchoAvatarModal from "../components/echo/EchoAvatarModal"
import EchoFloatingField from "../components/echo/EchoFloatingField"
import EchoMomentSheet from "../components/echo/EchoMomentSheet"

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

const POST_LIMIT = 140

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
    avatarUrl: "/images/avatars/mia.jpg",
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
    avatarUrl: "/images/avatars/andre.jpg",
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
    avatarUrl: "/images/avatars/lena.jpg",
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
    avatarUrl: "/images/avatars/sasha.jpg",
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
  {
    id: "p6",
    author: "Chris V.",
    avatarUrl: "/images/avatars/andre.jpg",
    text: "VIP finally started feeling active. Better energy than it looked from the door.",
    badge: "VIP",
    tags: ["VIP Crowd", "Worth It"],
    minutesAgo: 9,
    replyCount: 2,
    popularity: 88,
    replies: [
      { id: "r13", author: "Nia", text: "That is the update I needed.", minutesAgo: 6 },
      { id: "r14", author: "Chris V.", text: "Yeah it turned a corner.", minutesAgo: 4 },
    ],
  },
]

function sortPosts(posts: EchoPost[], filter: EchoFilter) {
  if (filter === "hereNow") {
    const hereNowPosts = posts.filter((post) => post.badge === "Here Now")
    const otherPosts = posts.filter((post) => post.badge !== "Here Now")

    return [
      ...hereNowPosts.sort((a, b) => a.minutesAgo - b.minutesAgo),
      ...otherPosts.sort((a, b) => a.minutesAgo - b.minutesAgo),
    ]
  }

  if (filter === "popular") {
    return [...posts].sort((a, b) => b.popularity - a.popularity)
  }

  return [...posts].sort((a, b) => a.minutesAgo - b.minutesAgo)
}

function getLiveMomentsLabel(posts: EchoPost[]) {
  const activeCount = posts.filter((post) => post.minutesAgo <= 15).length
  return activeCount > 0 ? `${activeCount} live` : `${posts.length} echoes`
}

function getMoodLine(posts: EchoPost[]) {
  const popular = [...posts].sort((a, b) => b.popularity - a.popularity).slice(0, 3)
  const tags = popular.flatMap((post) => post.tags).filter(Boolean)
  const unique = Array.from(new Set(tags)).slice(0, 3)

  if (unique.length === 0) {
    return ["Live Now", "Good Energy", "Worth Pulling Up"]
  }

  return unique
}

export default function EchoClient() {
  const [filter, setFilter] = useState<EchoFilter>("latest")
  const [posts, setPosts] = useState<EchoPost[]>(INITIAL_POSTS)
  const [composerOpen, setComposerOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [selectedAvatarPost, setSelectedAvatarPost] = useState<EchoPost | null>(null)
  const [selectedMoment, setSelectedMoment] = useState<EchoPost | null>(null)

  const filteredPosts = useMemo(() => sortPosts(posts, filter), [posts, filter])
  const moodLine = useMemo(() => getMoodLine(posts), [posts])
  const liveMomentsLabel = useMemo(() => getLiveMomentsLabel(posts), [posts])

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
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F4FBFF 32%, #F1FDFA 68%, #FFF7EE 100%)",
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
          position: "relative",
          zIndex: 2,
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          padding: "calc(18px + env(safe-area-inset-top)) 14px 0",
          boxSizing: "border-box",
          flex: "0 0 auto",
        }}
      >
        <EchoHeader
          postCount={posts.length}
          liveLabel={liveMomentsLabel}
          moodWords={moodLine}
          onBack={handleBack}
          showIntro={showIntro}
          onDismissIntro={() => setShowIntro(false)}
        />

        <div style={{ marginTop: 14 }}>
          <EchoFilterTabs active={filter} onChange={setFilter} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
        }}
      >
        <EchoFloatingField
          posts={filteredPosts}
          onOpenPost={(post) => setSelectedMoment(post)}
          onOpenAvatar={(post) => {
            if (!post.avatarUrl) return
            setSelectedAvatarPost(post)
          }}
        />
      </div>

      <button
        onClick={() => setComposerOpen(true)}
        style={{
          position: "fixed",
          left: "50%",
          marginBottom: 40,
          transform: "translateX(-50%)",
          bottom: "calc(16px + env(safe-area-inset-bottom))",
          border: "none",
          cursor: "pointer",
          borderRadius: 999,
          padding: "16px 22px",
          background: "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 0.2,
          boxShadow: "0 18px 36px rgba(14,165,233,0.24)",
          zIndex: 20,
          whiteSpace: "nowrap",
        }}
      >
        Drop an Echo
      </button>

      <EchoComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
        postLimit={POST_LIMIT}
        tagOptions={TAG_OPTIONS}
      />

      <EchoMomentSheet
        post={selectedMoment}
        onClose={() => setSelectedMoment(null)}
        onOpenAvatar={(post) => {
          if (!post.avatarUrl) return
          setSelectedAvatarPost(post)
        }}
      />

      <EchoAvatarModal
        post={selectedAvatarPost}
        onClose={() => setSelectedAvatarPost(null)}
      />
    </div>
  )
}