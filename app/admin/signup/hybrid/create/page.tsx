// app/admin/signup/hybrid/create/page.tsx
import Link from "next/link"
import type { CSSProperties } from "react"

export default function SignupHybridCreatePage() {
  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100dvh",
      background:
        "radial-gradient(circle at top left, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 26%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0) 22%), linear-gradient(180deg, #f8fcff 0%, #eef8ff 48%, #fff8ee 100%)",
      padding: "18px 14px 28px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
    },
    shell: {
      width: "100%",
      maxWidth: 760,
      margin: "0 auto",
    },
    panel: {
      borderRadius: 34,
      background: "rgba(255,255,255,0.60)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      boxShadow: "0 18px 52px rgba(15,23,42,0.09)",
      padding: "clamp(22px, 4vw, 36px)",
    },
    badge: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(15,118,110,0.08)",
      color: "#0f766e",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
    },
    title: {
      marginTop: 18,
      fontSize: "clamp(32px, 6vw, 48px)",
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-1.4px",
      color: "#020617",
    },
    summary: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 1.7,
      color: "#475569",
      maxWidth: 560,
    },
    link: {
      display: "inline-flex",
      marginTop: 20,
      textDecoration: "none",
      color: "#2563eb",
      fontSize: 14,
      fontWeight: 800,
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.panel}>
          <div style={styles.badge}>Signup · Hybrid</div>
          <div style={styles.title}>Hybrid onboarding route is ready.</div>
          <div style={styles.summary}>
            This placeholder keeps the path structure clean while we focus on perfecting the
            event flow first. We can build hybrid onboarding here next using the same design
            system and responsiveness rules.
          </div>

          <Link href="/admin/signup?intent=hybrid" style={styles.link}>
            Back to hybrid signup
          </Link>
        </section>
      </div>
    </div>
  )
}