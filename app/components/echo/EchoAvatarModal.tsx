"use client"

import type { EchoPost } from "./EchoPostCard"

type EchoAvatarModalProps = {
  post: EchoPost | null
  onClose: () => void
}

export default function EchoAvatarModal({
  post,
  onClose,
}: EchoAvatarModalProps) {
  if (!post) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.68)",
          backdropFilter: "blur(14px)",
          zIndex: 120,
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 121,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close image"
          style={{
            position: "fixed",
            top: "calc(18px + env(safe-area-inset-top))",
            right: 18,
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "#FFFFFF",
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
          }}
        >
          ×
        </button>

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {post.avatarUrl ? (
              <img
                src={post.avatarUrl}
                alt={post.author}
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  aspectRatio: "4 / 5",
                  background: "#111827",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(14,165,233,0.22) 0%, rgba(34,197,94,0.18) 100%)",
                  color: "#FFFFFF",
                  fontSize: 72,
                  fontWeight: 900,
                }}
              >
                {post.author
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div
              style={{
                position: "absolute",
                inset: "auto 0 0 0",
                padding: 18,
                background:
                  "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.18) 25%, rgba(2,6,23,0.72) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "#FFFFFF",
                    opacity: 0.9,
                    flex: "0 0 auto",
                  }}
                />
                {post.badge}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: -0.3,
                  lineHeight: 1.05,
                  textShadow: "0 4px 18px rgba(0,0,0,0.22)",
                }}
              >
                {post.author}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}