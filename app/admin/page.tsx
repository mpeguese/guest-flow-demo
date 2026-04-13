// app/admin/page.tsx
"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"

type IntentKey = "event" | "hybrid"

const OPTIONS: {
  key: IntentKey
  eyebrow: string
  title: string
  description: string
  href: string
  features: string[]
  imageUrl: string
  imageLabel: string
  accentTop: string
  accentBottom: string
}[] = [
  {
    key: "event",
    eyebrow: "Host Events",
    title: "Start with events",
    description:
      "Good for one-time events, recurring series, and promoter-led events.",
    href: "/admin/signup?intent=event",
    features: ["Ticketing", "Tables", "Guest flow"],
    imageUrl: "/images/admin-event.jpg",
    imageLabel: "Events",
    accentTop: "rgba(59,130,246,0.18)",
    accentBottom: "rgba(255,255,255,0.12)",
  },
  {
    key: "hybrid",
    eyebrow: "Hybrid",
    title: "Run full setup",
    description:
      "Good for teams managing events, maps, staff, and venue operations together.",
    href: "/admin/signup?intent=hybrid",
    features: ["Events", "Maps + zones", "Staff + Ops"],
    imageUrl: "/images/admin-hybrid.jpg",
    imageLabel: "Hybrid",
    accentTop: "rgba(251,191,36,0.18)",
    accentBottom: "rgba(244,114,182,0.12)",
  },
]

export default function AdminEntryPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const activeOption = useMemo(() => OPTIONS[activeIndex], [activeIndex])

  function scrollToIndex(index: number) {
    const scroller = scrollerRef.current
    if (!scroller) return

    const clamped = Math.max(0, Math.min(index, OPTIONS.length - 1))
    scroller.scrollTo({
      left: scroller.clientWidth * clamped,
      behavior: "smooth",
    })
    setActiveIndex(clamped)
  }

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller) return
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      background:
        "radial-gradient(circle at top left, rgba(56, 189, 248, 0.14) 0%, rgba(56, 189, 248, 0) 24%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.14) 0%, rgba(251, 191, 36, 0) 22%), linear-gradient(145deg, #0c1e3a 0%, #252978 34%, #6e359d 66%, #ec70be 100%)",
      padding: "22px 14px 26px",
      boxSizing: "border-box",
    },
    pageOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 20% 14%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 18%)",
      pointerEvents: "none",
    },
    shell: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: 980,
      margin: "0 auto",
    },
    hero: {
      position: "relative",
      minHeight: "calc(100vh - 44px)",
      borderRadius: 36,
      overflow: "hidden",
      background:
        "linear-gradient(145deg, rgba(12, 30, 58, 0.94) 0%, rgba(37, 41, 120, 0.92) 34%, rgba(110, 53, 157, 0.9) 66%, rgba(236, 112, 190, 0.86) 100%)",
      padding: "38px 34px 32px",
      boxSizing: "border-box",
      boxShadow: "0 34px 90px rgba(15, 23, 42, 0.18)",
    },
    heroLights: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 82% 14%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 16%), radial-gradient(circle at 78% 76%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 18% 84%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 24%)",
      pointerEvents: "none",
    },
    heroFlow: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 20% 100%, rgba(168, 85, 247, 0.34) 0%, rgba(168, 85, 247, 0) 40%), radial-gradient(ellipse at 82% 18%, rgba(59, 130, 246, 0.34) 0%, rgba(59, 130, 246, 0) 34%), radial-gradient(ellipse at 58% 58%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 24%)",
      pointerEvents: "none",
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "36px 36px",
      opacity: 0.1,
      pointerEvents: "none",
    },
    heroContent: {
      position: "relative",
      zIndex: 1,
      minHeight: "calc(100vh - 108px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    heroTop: {
      maxWidth: 740,
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      width: "fit-content",
      borderRadius: 999,
      padding: "10px 16px",
      background: "rgba(255,255,255,0.12)",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.8px",
      textTransform: "uppercase",
      color: "#ffffff",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },
    title: {
      marginTop: 26,
      maxWidth: 720,
      fontSize: 66,
      lineHeight: 0.93,
      letterSpacing: "-2.3px",
      fontWeight: 950,
      color: "#ffffff",
    },
    copy: {
      marginTop: 18,
      maxWidth: 540,
      fontSize: 17,
      lineHeight: 1.7,
      color: "rgba(255,255,255,0.88)",
    },
    pills: {
      marginTop: 22,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.11)",
      fontSize: 12,
      fontWeight: 800,
      color: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
    overlayWrap: {
      marginTop: 34,
      width: "100%",
      maxWidth: 540,
    },
    track: {
      display: "flex",
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      touchAction: "pan-x",
      overscrollBehaviorX: "contain",
    },
    slide: {
      minWidth: "100%",
      scrollSnapAlign: "start",
      boxSizing: "border-box",
    },
    glassInner: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    imageFrame: {
      position: "relative",
      height: 250,
      borderRadius: 24,
      overflow: "hidden",
      background: "rgba(255,255,255,0.1)",
      boxShadow: "0 16px 34px rgba(15, 23, 42, 0.14)",
    },
    imageFill: {
      position: "absolute",
      inset: 0,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transform: "scale(1.02)",
    },
    imageOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, rgba(2,6,23,0.06) 0%, rgba(2,6,23,0.38) 100%), radial-gradient(circle at top right, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 28%)",
    },
    imageLabel: {
      position: "absolute",
      left: 18,
      bottom: 16,
      fontSize: 28,
      lineHeight: 1,
      fontWeight: 950,
      letterSpacing: "-0.8px",
      color: "#ffffff",
      textShadow: "0 8px 18px rgba(0,0,0,0.22)",
    },
    contentPanel: {
      position: "relative",
      marginTop: 22,
      padding: "0 2px 84px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    slideTitle: {
      marginTop: 8,
      fontSize: 31,
      lineHeight: 1.02,
      fontWeight: 950,
      letterSpacing: "-0.9px",
      color: "#ffffff",
    },
    slideCopy: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 1.66,
      color: "rgba(255,255,255,0.82)",
      maxWidth: 360,
    },
    featureList: {
      marginTop: 20,
      display: "grid",
      gap: 0,
    },
    featureRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 50,
      borderTop: "1px solid rgba(255,255,255,0.12)",
      color: "#ffffff",
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: "-0.1px",
    },
    cardFooter: {
      position: "absolute",
      right: 2,
      bottom: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    nextBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 132,
      height: 50,
      borderRadius: 18,
      background: "rgba(255, 255, 255, 0.96)",
      color: "#0f172a",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: "-0.2px",
      boxShadow: "0 10px 22px rgba(15, 23, 42, 0.14)",
    },
    dots: {
      marginTop: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      border: "none",
      background: "rgba(255,255,255,0.34)",
      cursor: "pointer",
    },
    dotActive: {
      background: "#ffffff",
      boxShadow: "0 0 0 5px rgba(255,255,255,0.12)",
    },
    footerRow: {
      marginTop: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    footerMuted: {
      fontSize: 14,
      color: "rgba(255,255,255,0.76)",
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageOverlay} />

      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          top: 32,
          right: -70,
          borderRadius: 999,
          filter: "blur(52px)",
          pointerEvents: "none",
          opacity: 0.72,
          background: "rgba(59, 130, 246, 0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          bottom: 24,
          left: -60,
          borderRadius: 999,
          filter: "blur(52px)",
          pointerEvents: "none",
          opacity: 0.72,
          background: "rgba(244, 114, 182, 0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 999,
          filter: "blur(52px)",
          pointerEvents: "none",
          opacity: 0.72,
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroLights} />
          <div style={styles.heroFlow} />
          <div style={styles.heroGrid} />

          <div style={styles.heroContent}>
            <div style={styles.heroTop}>
              <div style={styles.topRow}>
                <div style={styles.badge}>GuestFlow Admin</div>
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  Already have an account?
                  <Link href="/admin/login" style={{ fontWeight: 800, color: "#2563eb" }}>
                    Sign in
                  </Link>
                </div>
              </div>

              <div style={styles.title}>
                Premium event operations,
                <br />
                built to move.
              </div>

              <div style={styles.copy}>
                Choose a fast event path or a full hybrid setup.
              </div>

              <div style={styles.pills}>
                <div style={styles.pill}>Live operations</div>
                <div style={styles.pill}>Tickets + tables</div>
                <div style={styles.pill}>Maps + zones</div>
                <div style={styles.pill}>Analytics</div>
              </div>

              <div style={styles.overlayWrap}>
                <div ref={scrollerRef} style={styles.track} onScroll={handleScroll}>
                  {OPTIONS.map((option) => (
                    <div key={option.key} style={styles.slide}>
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          minHeight: 520,
                          borderRadius: 30,
                          padding: 18,
                          background: `linear-gradient(180deg, ${option.accentTop} 0%, ${option.accentBottom} 100%)`,
                          backdropFilter: "blur(22px)",
                          WebkitBackdropFilter: "blur(22px)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          display: "flex",
                          flexDirection: "column",
                          isolation: "isolate",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.01) 56%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 18%)",
                            pointerEvents: "none",
                          }}
                        />

                        <div style={styles.glassInner}>
                          <div style={styles.imageFrame}>
                            <div
                              style={{
                                ...styles.imageFill,
                                backgroundImage: `url(${option.imageUrl})`,
                              }}
                            />
                            <div style={styles.imageOverlay} />
                            <div style={styles.imageLabel}>{option.imageLabel}</div>
                          </div>

                          <div style={styles.contentPanel}>
                            <div style={styles.slideTitle}>{option.title}</div>
                            <div style={styles.slideCopy}>{option.description}</div>

                            <div style={styles.featureList}>
                              {option.features.map((feature, featureIndex) => (
                                <div
                                  key={feature}
                                  style={{
                                    ...styles.featureRow,
                                    ...(featureIndex === option.features.length - 1
                                      ? { borderBottom: "1px solid rgba(255,255,255,0.12)" }
                                      : null),
                                  }}
                                >
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            <div style={styles.cardFooter}>
                              <Link href={option.href} style={styles.nextBtn}>
                                Continue Setup
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.dots} role="tablist" aria-label="Setup path selection">
                  {OPTIONS.map((option, index) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => scrollToIndex(index)}
                      aria-label={`Show ${option.eyebrow}`}
                      aria-pressed={index === activeIndex}
                      style={{
                        ...styles.dot,
                        ...(index === activeIndex ? styles.dotActive : null),
                      }}
                    />
                  ))}
                </div>

                <div style={styles.footerRow}>
                  <div style={styles.footerMuted}>Selected: {activeOption.eyebrow}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}