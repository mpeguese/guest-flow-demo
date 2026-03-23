"use client"

type AreaSelectionModalProps = {
  open: boolean
  onClose: () => void
  onAddToCart: () => void
  onCheckout: () => void
  zoneName: string
  sectionName: string
  dateLabel: string
  partySizeLabel: string
  sessionLabel: string
  videoSrc: string
  posterSrc?: string
}

const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F7FBFC",
  card: "#FFFFFF",
  cardSoft: "#F2FAFB",
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",

  primary: "#0EA5E9",
  primaryHover: "#0284C7",
  primarySoft: "#E0F2FE",

  accent: "#14B8A6",
  accentSoft: "#DDF7F3",

  coral: "#FF7A59",
  coralSoft: "#FFE7E0",
}

export default function AreaSelectionModal({
  open,
  onClose,
  onAddToCart,
  onCheckout,
  zoneName,
  sectionName,
  dateLabel,
  partySizeLabel,
  sessionLabel,
  videoSrc,
  posterSrc,
}: AreaSelectionModalProps) {
  if (!open) return null

  const productImageSrc = "/images/table-preview.jpg"

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 24%, rgba(15,23,42,0.22) 72%, rgba(15,23,42,0.48) 100%)",
        }}
      />

      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 42,
          height: 42,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.44)",
          background: "rgba(255,255,255,0.74)",
          color: COLORS.text,
          fontSize: 22,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 18px rgba(15,23,42,0.12)",
        }}
      >
        ×
      </button>

      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 112,
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.84)",
            border: "1px solid rgba(255,255,255,0.92)",
            color: COLORS.text,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            marginBottom: 14,
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 18px rgba(15,23,42,0.10)",
          }}
        >
          Selected area
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "92px 1fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.82)",
              boxShadow: "0 16px 28px rgba(15,23,42,0.16)",
              backdropFilter: "blur(10px)",
              flexShrink: 0,
            }}
          >
            <img
              src={productImageSrc}
              alt={`${zoneName} seating preview`}
              onError={(e) => {
                const target = e.currentTarget
                target.src = "/images/table-preview.jpg"
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -1,
                color: "#fff",
                textShadow: "0 8px 22px rgba(0,0,0,0.20)",
              }}
            >
              {zoneName}
            </h2>

            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.96)",
              }}
            >
              {sectionName}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.82)",
                maxWidth: 340,
              }}
            >
              A quick preview of the table/lounge setup so guests can clearly see what
              they are reserving.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 16,
          }}
        >
          {[dateLabel, partySizeLabel, sessionLabel].map((item) => (
            <div
              key={item}
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.84)",
                border: "1px solid rgba(255,255,255,0.92)",
                color: COLORS.text,
                fontSize: 13,
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 16px rgba(15,23,42,0.10)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: 12,
          borderRadius: 24,
          background: "rgba(255,255,255,0.76)",
          border: "1px solid rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 18px 38px rgba(15,23,42,0.18)",
        }}
      >
        <button
          onClick={onAddToCart}
          style={{
            height: 54,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            background: COLORS.card,
            color: COLORS.text,
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Add to cart
        </button>

        <button
          onClick={onCheckout}
          style={{
            height: 54,
            border: "none",
            borderRadius: 18,
            background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
            color: "#FFFFFF",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 12px 24px rgba(14,165,233,0.24)",
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}