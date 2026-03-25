//app/components/echo/EchoComposer.tsx
"use client"

import { useEffect, useState } from "react"

export type EchoBadge = "Here Now" | "Attended" | "Booked Table" | "VIP"

type EchoComposerProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { text: string; badge: EchoBadge; tags: string[] }) => void
  postLimit?: number
  tagOptions: string[]
}

export default function EchoComposer({
  open,
  onClose,
  onSubmit,
  postLimit = 140,
  tagOptions,
}: EchoComposerProps) {
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

  const remaining = postLimit - text.length
  const trimmed = text.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= postLimit

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
            onChange={(e) => setText(e.target.value.slice(0, postLimit))}
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
          {tagOptions.map((tag) => {
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