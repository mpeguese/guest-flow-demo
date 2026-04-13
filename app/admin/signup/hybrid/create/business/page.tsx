// app/admin/signup/hybrid/create/business/page.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type CSSProperties, type FormEvent } from "react"

export default function HybridBusinessPage() {
  const router = useRouter()

  const [businessName, setBusinessName] = useState("")
  const [venueName, setVenueName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push("/admin/signup/hybrid/create/map")
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: "22px 14px 28px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 760,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.08)",
      color: "#0f172a",
      fontSize: 19,
      fontWeight: 900,
      border: "1px solid rgba(255,255,255,0.22)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    panel: {
      borderRadius: 30,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.24), 0 18px 42px rgba(15,23,42,0.06)",
      padding: 24,
    },
    badge: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(15,118,110,0.05)",
      color: "#0f766e",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      border: "1px solid rgba(15,118,110,0.08)",
    },
    title: {
      marginTop: 18,
      fontSize: 42,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-1.2px",
      color: "#020617",
    },
    summary: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 1.65,
      color: "#475569",
      maxWidth: 560,
    },
    grid: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    full: {
      gridColumn: "1 / -1",
    },
    label: {
      display: "block",
      marginBottom: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    input: {
      width: "100%",
      height: 56,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.20)",
      background: "rgba(255,255,255,0.10)",
      padding: "0 16px",
      boxSizing: "border-box",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    textarea: {
      width: "100%",
      minHeight: 110,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.20)",
      background: "rgba(255,255,255,0.10)",
      padding: 16,
      boxSizing: "border-box",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      resize: "vertical" as const,
      fontFamily: "inherit",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    footer: {
      marginTop: 22,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    ghostBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 130,
      height: 52,
      borderRadius: 16,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.18)",
      color: "#0f172a",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 800,
    },
    primaryBtn: {
      minWidth: 160,
      height: 52,
      borderRadius: 16,
      border: "none",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
    },
  }

  return (
    <div style={styles.page}>
      <style jsx>{`
        @media (max-width: 700px) {
          .hybrid-business-grid {
            grid-template-columns: 1fr !important;
          }

          .hybrid-business-full {
            grid-column: auto !important;
          }

          .hybrid-business-title {
            font-size: 34px !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GF</div>

          <Link href="/admin/signup/hybrid/create" style={styles.backLink}>
            Back to Hybrid
          </Link>
        </div>

        <section style={styles.panel}>
          <div style={styles.badge}>Hybrid · Business</div>
          <div style={styles.title} className="hybrid-business-title">
            List your business
          </div>
          <div style={styles.summary}>
            Add the business and venue details that the rest of the Hybrid setup will attach to.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid} className="hybrid-business-grid">
              <div>
                <label style={styles.label}>Business Name</label>
                <input
                  style={styles.input}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="GuestFlow Hospitality Group"
                />
              </div>

              <div>
                <label style={styles.label}>Venue Name</label>
                <input
                  style={styles.input}
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Skyline Rooftop"
                />
              </div>

              <div>
                <label style={styles.label}>Business Type</label>
                <input
                  style={styles.input}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Nightclub, lounge, restaurant, festival..."
                />
              </div>

              <div>
                <label style={styles.label}>Contact Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ops@example.com"
                />
              </div>

              <div>
                <label style={styles.label}>Phone</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                />
              </div>

              <div style={styles.full} className="hybrid-business-full">
                <label style={styles.label}>Address</label>
                <textarea
                  style={styles.textarea}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Tampa, FL 33602"
                />
              </div>
            </div>

            <div style={styles.footer}>
              <Link href="/admin/signup/hybrid/create" style={styles.ghostBtn}>
                Back
              </Link>

              <button type="submit" style={styles.primaryBtn}>
                Continue to Map
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}