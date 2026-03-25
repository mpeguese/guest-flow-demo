//app/components/echo/EchoThreadSheet.tsx
"use client"

import { useEffect, useState } from "react"
import type { EchoPost } from "./EchoPostCard"

type EchoThreadSheetProps = {
  open: boolean
  post: EchoPost | null
  onClose: () => void
  onReply: (postId: string, text: string) => void
  replyLimit?: number
}

type EchoBadge = "Here Now" | "Attended" | "Booked Table" | "VIP"

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

function formatMinutesAgo(minutesAgo: number) {
  if (minutesAgo < 1) return "now"
  if (minutesAgo < 60) return `${minutesAgo}m`
  const hours = Math.floor(minutesAgo / 60)
  return `${hours}h`
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

export default function EchoThreadSheet({
  open,
  post,
  onClose,
  onReply,
  replyLimit = 120,
}: EchoThreadSheetProps) {
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    if (open) setReplyText("")
  }, [open, post?.id])

  if (!open || !post) return null

  const remaining = replyLimit - replyText.length
  const canReply = replyText.trim().length > 0 && replyText.trim().length <= replyLimit

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
                  fontWeight: 600,
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
                      fontWeight: 700,
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
                    fontWeight: 600,
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
                onChange={(e) => setReplyText(e.target.value.slice(0, replyLimit))}
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