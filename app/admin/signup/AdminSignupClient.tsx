"use client"

import Link from "next/link"
import type { CSSProperties } from "react"

type SignupContent = {
  badge: string
  title: string
  subtitle: string
  summary: string
}

export default function AdminSignupClient({
  content,
}: {
  content: SignupContent
}) {
  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at top left, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 28%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0) 24%), linear-gradient(180deg, #f8fcff 0%, #eef8ff 46%, #fff5e8 100%)",
      padding: "28px 18px 34px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 760,
      margin: "0 auto",
    },
    card: {
      borderRadius: 34,
      border: "1px solid rgba(148, 163, 184, 0.16)",
      background: "rgba(255, 255, 255, 0.88)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
      padding: 34,
      overflow: "hidden",
      isolation: "isolate",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
    },
    gfMark: {
      width: 58,
      height: 58,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 20,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      boxShadow: "0 14px 32px rgba(15, 23, 42, 0.18)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    intentBadge: {
      marginTop: 22,
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "10px 16px",
      background: "rgba(15, 118, 110, 0.08)",
      border: "1px solid rgba(15, 118, 110, 0.12)",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.6px",
      textTransform: "uppercase",
      color: "#0f766e",
    },
    title: {
      marginTop: 18,
      fontSize: 38,
      lineHeight: 1,
      letterSpacing: "-1.2px",
      fontWeight: 900,
      color: "#020617",
    },
    subtitle: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: 800,
      color: "#0f172a",
    },
    summary: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 1.6,
      color: "#64748b",
      maxWidth: 520,
    },
    formGrid: {
      marginTop: 28,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    fieldWrapFull: {
      gridColumn: "1 / -1",
    },
    fieldLabel: {
      display: "block",
      marginBottom: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    fieldInput: {
      width: "100%",
      height: 56,
      borderRadius: 18,
      border: "1px solid rgba(148, 163, 184, 0.26)",
      background: "#f8fafc",
      padding: "0 16px",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      boxSizing: "border-box",
    },
    primaryBtn: {
      marginTop: 24,
      width: "100%",
      height: 58,
      borderRadius: 18,
      border: "none",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 15,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.16)",
    },
    intentNote: {
      marginTop: 22,
      borderRadius: 22,
      padding: 16,
      background: "#f8fafc",
      border: "1px solid rgba(148, 163, 184, 0.16)",
    },
    intentNoteLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#94a3b8",
    },
    intentNoteValue: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: 800,
      color: "#0f172a",
    },
    secondaryRow: {
      marginTop: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    muted: {
      fontSize: 14,
      color: "#64748b",
    },
    linkBtn: {
      fontSize: 14,
      fontWeight: 800,
      color: "#2563eb",
      textDecoration: "none",
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.card}>
          <div style={styles.topRow}>
            <div style={styles.gfMark}>GF</div>
            <Link href="/admin" style={styles.backLink}>
              Back
            </Link>
          </div>

          <div style={styles.intentBadge}>{content.badge}</div>

          <div style={styles.title}>{content.title}</div>
          <div style={styles.subtitle}>{content.subtitle}</div>
          <div style={styles.summary}>{content.summary}</div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.fieldLabel}>First Name</label>
              <input style={styles.fieldInput} type="text" placeholder="First name" />
            </div>

            <div>
              <label style={styles.fieldLabel}>Last Name</label>
              <input style={styles.fieldInput} type="text" placeholder="Last name" />
            </div>

            <div style={styles.fieldWrapFull}>
              <label style={styles.fieldLabel}>Email</label>
              <input style={styles.fieldInput} type="email" placeholder="you@example.com" />
            </div>

            <div style={styles.fieldWrapFull}>
              <label style={styles.fieldLabel}>Password</label>
              <input style={styles.fieldInput} type="password" placeholder="Create a password" />
            </div>
          </div>

          <button style={styles.primaryBtn}>Continue</button>

          <div style={styles.intentNote}>
            <div style={styles.intentNoteLabel}>Selected Path</div>
            <div style={styles.intentNoteValue}>{content.badge}</div>
          </div>

          <div style={styles.secondaryRow}>
            <div style={styles.muted}>
              Already have an account?{" "}
              <Link href="/admin/login" style={styles.linkBtn}>
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}