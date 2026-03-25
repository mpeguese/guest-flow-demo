//app/components/echo/EchoHeader.tsx
"use client"

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

type EchoHeaderProps = {
  postCount: number
  onBack: () => void
  showIntro: boolean
  onDismissIntro: () => void
}

export default function EchoHeader({
  postCount,
  onBack,
  showIntro,
  onDismissIntro,
}: EchoHeaderProps) {
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
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: 6,
          columnGap: 10,
          color: "rgba(15,23,42,0.58)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.2,
          textAlign: "center",
        }}
      >
        <span>Packed Tonight</span>
        <span style={{ color: "rgba(15,23,42,0.28)" }}>•</span>
        <span>Music Up</span>
        <span style={{ color: "rgba(15,23,42,0.28)" }}>•</span>
        <span>Worth Pulling Up</span>
      </div>
    </div>
  )
}