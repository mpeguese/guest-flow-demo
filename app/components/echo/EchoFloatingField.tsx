//app/components/echo/EchoFloatingField.tsx
"use client"

import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import type { EchoPost } from "../../echo/EchoClient"

type EchoFloatingFieldProps = {
  posts: EchoPost[]
  onOpenPost: (post: EchoPost) => void
  onOpenAvatar: (post: EchoPost) => void
}

type PositionedEcho = EchoPost & {
  layer: 0 | 1 | 2
  width: number
  height: number
  isTrending: boolean
  accent: string
  opacity: number
  scale: number
  blur: number
  zIndex: number
  floatSeed: number
  startXPercent: number
  startYPercent: number
}

type DragState = {
  draggingId: string | null
  pointerId: number | null
  offsetX: number
  offsetY: number
  moved: boolean
}

type PhysicsItem = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  scale: number
}

const EDGE_INSET_X = 18
const EDGE_INSET_Y = 10

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

function getAccent(post: EchoPost) {
  if (post.badge === "VIP") return "rgba(251, 146, 60, 0.95)"
  if (post.badge === "Booked Table") return "rgba(245, 158, 11, 0.95)"
  if (post.badge === "Here Now") return "rgba(56, 189, 248, 0.95)"
  return "rgba(34, 197, 94, 0.95)"
}

function getPillWidth(text: string) {
  const length = text.length
  if (length <= 10) return 128
  if (length <= 18) return 176
  if (length <= 30) return 232
  if (length <= 46) return 286
  return 320
}

function getPillHeight(text: string) {
  if (text.length > 40) return 64
  return 54
}

function getLayerFromPost(post: EchoPost, index: number): 0 | 1 | 2 {
  if (post.popularity >= 85 || post.badge === "Here Now") return 2
  if (post.popularity >= 68 || index % 2 === 0) return 1
  return 0
}

function getLayerStyle(layer: 0 | 1 | 2) {
  if (layer === 0) {
    return {
      opacity: 0.62,
      scale: 0.94,
      blur: 0.4,
      zIndex: 1,
    }
  }

  if (layer === 1) {
    return {
      opacity: 0.9,
      scale: 1,
      blur: 0,
      zIndex: 2,
    }
  }

  return {
    opacity: 1,
    scale: 1.04,
    blur: 0,
    zIndex: 3,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function sortForDisplay(posts: EchoPost[]) {
  return [...posts].sort((a, b) => {
    const aScore = a.popularity + (a.badge === "Here Now" ? 8 : 0) - a.minutesAgo * 0.4
    const bScore = b.popularity + (b.badge === "Here Now" ? 8 : 0) - b.minutesAgo * 0.4
    return bScore - aScore
  })
}

function hashSeed(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getStartPercents(count: number) {
  const base = [
    { x: 18, y: 10 },
    { x: 50, y: 10 },
    { x: 80, y: 13 },
    { x: 26, y: 25 },
    { x: 68, y: 25 },
    { x: 14, y: 40 },
    { x: 49, y: 39 },
    { x: 84, y: 43 },
    { x: 28, y: 56 },
    { x: 69, y: 57 },
    { x: 18, y: 72 },
    { x: 54, y: 73 },
  ]

  return Array.from({ length: count }).map((_, index) => {
    const slot = base[index % base.length]
    return {
      x: slot.x,
      y: slot.y,
    }
  })
}

function Avatar({
  author,
  avatarUrl,
  onClick,
}: {
  author: string
  avatarUrl?: string
  onClick: () => void
}) {
  if (avatarUrl) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
            e.stopPropagation()
            onClick?.()
        }}
        onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            e.stopPropagation()
            onClick?.()
            }
        }}
        aria-label={`Open ${author} profile image`}
        style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: 0,
            margin: 0,
            background: "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        }}
        >
        <img
          src={avatarUrl}
          alt={author}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        background:
          "linear-gradient(135deg, rgba(14,165,233,0.95) 0%, rgba(34,197,94,0.95) 100%)",
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        boxShadow: "0 8px 16px rgba(15,23,42,0.10)",
      }}
    >
      {getInitials(author)}
    </div>
  )
}

function EchoPill({
  id,
  author,
  avatarUrl,
  text,
  badge,
  minutesAgo,
  popularity,
  replies,
  replyCount,
  tags,
  width,
  height,
  isTrending,
  accent,
  opacity,
  scale,
  blur,
  zIndex,
  registerNode,
  unregisterNode,
  onPointerDown,
  onOpenPost,
  onOpenAvatar,
}: PositionedEcho & {
  registerNode: (id: string, el: HTMLButtonElement | null) => void
  unregisterNode: (id: string) => void
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>, id: string) => void
  onOpenPost: (post: EchoPost) => void
  onOpenAvatar: (post: EchoPost) => void
}) {
  const age = formatMinutesAgo(minutesAgo)

  const post: EchoPost = {
    id,
    author,
    avatarUrl,
    text,
    badge,
    tags,
    minutesAgo,
    replyCount,
    popularity,
    replies,
  }

  return (
    <button
      type="button"
      ref={(el) => {
        if (el) registerNode(id, el)
        else unregisterNode(id)
      }}
      onPointerDown={(e) => onPointerDown(e, id)}
      onClick={() => onOpenPost(post)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        minHeight: height,
        padding: "10px 12px 10px 10px",
        margin: 0,
        borderRadius: 999,
        border: isTrending
          ? "1px solid rgba(255,255,255,0.92)"
          : "1px solid rgba(255,255,255,0.76)",
        background: isTrending
          ? "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.70) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.77) 0%, rgba(255,255,255,0.60) 100%)",
        backdropFilter: `blur(${16 + blur}px) saturate(145%)`,
        WebkitBackdropFilter: `blur(${16 + blur}px) saturate(145%)`,
        boxShadow: isTrending
          ? `0 16px 30px rgba(15,23,42,0.10), 0 0 0 1px rgba(255,255,255,0.18), 0 0 28px ${accent}`
          : "0 12px 24px rgba(15,23,42,0.08)",
        color: "#0F172A",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        overflow: "hidden",
        cursor: "grab",
        opacity,
        zIndex,
        touchAction: "none",
        willChange: "transform",
        transform: `translate3d(-9999px, -9999px, 0) scale(${scale})`,
      }}
      aria-label={`Open echo from ${author}`}
    >
      {isTrending ? (
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 999,
            boxShadow: `0 0 0 1px ${accent}, 0 0 24px ${accent}`,
            opacity: 0.42,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <Avatar
        author={author}
        avatarUrl={avatarUrl}
        onClick={() => onOpenAvatar(post)}
      />

      <div
        style={{
          minWidth: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            fontSize: 13,
            lineHeight: text.length > 44 ? 1.2 : 1.1,
            fontWeight: 900,
            color: "#0F172A",
            letterSpacing: -0.15,
            display: "-webkit-box",
            WebkitLineClamp: text.length > 40 ? 2 : 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(15,23,42,0.56)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {age}
          </span>

          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: accent,
              flex: "0 0 auto",
              boxShadow: `0 0 10px ${accent}`,
            }}
          />

          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(15,23,42,0.56)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function EchoFloatingField({
  posts,
  onOpenPost,
  onOpenAvatar,
}: EchoFloatingFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeMapRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const physicsRef = useRef<Map<string, PhysicsItem>>(new Map())
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dragStateRef = useRef<DragState>({
    draggingId: null,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    moved: false,
  })

  const visiblePosts = useMemo<PositionedEcho[]>(() => {
    const sorted = sortForDisplay(posts).slice(0, 12)
    const starts = getStartPercents(sorted.length)

    return sorted.map((post, index) => {
      const layer = getLayerFromPost(post, index)
      const layerStyle = getLayerStyle(layer)
      const width = getPillWidth(post.text)
      const height = getPillHeight(post.text)
      const isTrending = post.popularity >= 85 || (post.badge === "Here Now" && post.minutesAgo <= 15)
      const accent = getAccent(post)
      const seed = hashSeed(post.id + post.author + index.toString())

      return {
        ...post,
        layer,
        width,
        height,
        isTrending,
        accent,
        opacity: layerStyle.opacity,
        scale: layerStyle.scale,
        blur: layerStyle.blur,
        zIndex: layerStyle.zIndex,
        floatSeed: seed,
        startXPercent: starts[index].x,
        startYPercent: starts[index].y,
      }
    })
  }, [posts])

  const registerNode = (id: string, el: HTMLButtonElement | null) => {
    if (!el) return
    nodeMapRef.current.set(id, el)
  }

  const unregisterNode = (id: string) => {
    nodeMapRef.current.delete(id)
  }

  const applyTransforms = () => {
    physicsRef.current.forEach((item, id) => {
      const node = nodeMapRef.current.get(id)
      if (!node) return
      node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${item.scale})`
    })
  }

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()

    visiblePosts.forEach((post) => {
      const seeded = post.floatSeed
      const existing = physicsRef.current.get(post.id)

      if (existing) {
        existing.width = post.width
        existing.height = post.height
        existing.scale = post.scale
        return
      }

      const pxX = (rect.width * post.startXPercent) / 100 - post.width / 2
      const pxY = (rect.height * post.startYPercent) / 100 - post.height / 2

      const speedXBase = 14 + (seeded % 24)
      const speedYBase = 12 + (seeded % 18)
      const dirX = seeded % 2 === 0 ? 1 : -1
      const dirY = seeded % 3 === 0 ? 1 : -1

      physicsRef.current.set(post.id, {
        id: post.id,
        x: pxX,
        y: pxY,
        vx: speedXBase * dirX,
        vy: speedYBase * dirY,
        width: post.width,
        height: post.height,
        scale: post.scale,
      })
    })

    const visibleIds = new Set(visiblePosts.map((post) => post.id))
    physicsRef.current.forEach((_, id) => {
      if (!visibleIds.has(id)) {
        physicsRef.current.delete(id)
        nodeMapRef.current.delete(id)
      }
    })

    applyTransforms()
  }, [visiblePosts])

  useEffect(() => {
    const animate = (now: number) => {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const dt = lastTimeRef.current ? Math.min((now - lastTimeRef.current) / 1000, 0.03) : 0.016
      lastTimeRef.current = now
      const drag = dragStateRef.current

      physicsRef.current.forEach((item, id) => {
        const activelyDragging = drag.draggingId === id && drag.moved
        if (activelyDragging) return

        item.x += item.vx * dt
        item.y += item.vy * dt

        const minX = EDGE_INSET_X
        const maxX = rect.width - item.width - EDGE_INSET_X
        const minY = EDGE_INSET_Y
        const maxY = rect.height - item.height - EDGE_INSET_Y

        if (item.x <= minX) {
          item.x = minX
          item.vx = Math.abs(item.vx)
        } else if (item.x >= maxX) {
          item.x = maxX
          item.vx = -Math.abs(item.vx)
        }

        if (item.y <= minY) {
          item.y = minY
          item.vy = Math.abs(item.vy)
        } else if (item.y >= maxY) {
          item.y = maxY
          item.vy = -Math.abs(item.vy)
        }

        const node = nodeMapRef.current.get(id)
        if (node) {
          const trendPulse =
            node.style.boxShadow.indexOf("0 0 28px") >= 0
              ? 1 + Math.sin(now / 500) * 0.01
              : 1

          node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${item.scale * trendPulse})`
        }
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return

      const drag = dragStateRef.current
      if (!drag.draggingId) return

      const rect = containerRef.current.getBoundingClientRect()
      const item = physicsRef.current.get(drag.draggingId)
      if (!item) return

      const nextX = clamp(
        e.clientX - rect.left - drag.offsetX,
        EDGE_INSET_X,
        rect.width - item.width - EDGE_INSET_X
      )
      const nextY = clamp(
        e.clientY - rect.top - drag.offsetY,
        EDGE_INSET_Y,
        rect.height - item.height - EDGE_INSET_Y
      )

      const dx = Math.abs(nextX - item.x)
      const dy = Math.abs(nextY - item.y)

      item.x = nextX
      item.y = nextY

      if (dx > 1 || dy > 1) {
        drag.moved = true
      }

      const node = nodeMapRef.current.get(item.id)
      if (node) {
        node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${item.scale + 0.03})`
      }
    }

    const handlePointerUp = () => {
      const drag = dragStateRef.current

      if (drag.draggingId) {
        const item = physicsRef.current.get(drag.draggingId)
        const node = nodeMapRef.current.get(drag.draggingId)

        if (item && node) {
          node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${item.scale})`
        }
      }

      dragStateRef.current = {
        draggingId: null,
        pointerId: null,
        offsetX: 0,
        offsetY: 0,
        moved: false,
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    id: string
  ) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const item = physicsRef.current.get(id)
    if (!rect || !item) return

    e.preventDefault()

    dragStateRef.current = {
      draggingId: id,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left - item.x,
      offsetY: e.clientY - rect.top - item.y,
      moved: false,
    }
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100dvh - 320px)",
        //minHeight: "100dvh",
        padding: "0 14px 88px",
        zIndex: 1,
      }}
    >
      <style jsx>{`
        @keyframes echoPillFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          //backgroundImage: "url('/images/daerdayclub.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "blur(26px) saturate(1.06)",
          transform: "scale(1.06)",
          opacity: 0.28,
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(244,251,255,0.34) 24%, rgba(240,253,250,0.34) 62%, rgba(255,247,238,0.34) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0) 28%), radial-gradient(circle at 82% 22%, rgba(251,146,60,0.08) 0%, rgba(251,146,60,0) 24%), radial-gradient(circle at 48% 78%, rgba(34,197,94,0.07) 0%, rgba(34,197,94,0) 28%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          minHeight: "calc(100dvh - 300px)",
          //minHeight: "100dvh",
          borderRadius: 0,
          overflow: "visible",
          background: "transparent",
        }}
      >
        {visiblePosts.map((post) => (
          <EchoPill
            key={post.id}
            {...post}
            registerNode={registerNode}
            unregisterNode={unregisterNode}
            onPointerDown={handlePointerDown}
            onOpenPost={onOpenPost}
            onOpenAvatar={onOpenAvatar}
          />
        ))}
      </div>
    </div>
  )
}