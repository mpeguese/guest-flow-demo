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
  liveLabel: string
  moodWords: string[]
  onBack: () => void
  showIntro: boolean
  onDismissIntro: () => void
}

export default function EchoHeader({
  postCount,
  liveLabel,
  moodWords,
  onBack,
  showIntro,
  onDismissIntro,
}: EchoHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
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
            border: "1px solid rgba(255,255,255,0.84)",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
            border: "1px solid rgba(255,255,255,0.84)",
            color: "#0F172A",
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
            flex: "0 0 auto",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#22C55E",
              boxShadow: "0 0 12px rgba(34,197,94,0.44)",
              flex: "0 0 auto",
            }}
          />
          {liveLabel}
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
            fontSize: 32,
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
            fontWeight: 800,
            color: "rgba(15,23,42,0.64)",
          }}
        >
          {postCount} voices in the room
        </div>
      </div>

      {showIntro ? (
        <div
          className="echo-intro-fade-in"
          style={{
            position: "relative",
            padding: "16px 18px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(255,255,255,0.84)",
            boxShadow: "0 14px 28px rgba(15,23,42,0.05)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
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
              background: "rgba(241,245,249,0.95)",
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
            A live field of moments
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.45,
              color: "rgba(15,23,42,0.72)",
              fontWeight: 700,
              paddingRight: 10,
            }}
          >
            Tap into what guests are feeling right now. The hottest echoes float forward.
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
          color: "rgba(15,23,42,0.56)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.2,
          textAlign: "center",
        }}
      >
        {moodWords.map((word, index) => (
          <div
            key={`${word}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {index > 0 ? (
              <span style={{ color: "rgba(15,23,42,0.24)" }}>•</span>
            ) : null}
            <span>{word}</span>
          </div>
        ))}
      </div>
    </div>
  )
}