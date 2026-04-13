// app/admin/login/reset/page.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { createClient } from "@/app/lib/supabase/client"

export default function AdminResetRequestPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const queryEmail = params.get("email") || ""
    if (queryEmail) setEmail(queryEmail)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMessage("")
    setSuccessMessage("")

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.")
      return
    }

    setIsSubmitting(true)

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/login/update-password`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage(
        "Reset email sent. Check your inbox and open the link to create a new password."
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the reset email."

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
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
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "rgba(255,255,255,0.92)",
      textDecoration: "none",
    },
    headingBlock: {
      marginTop: 30,
      maxWidth: 720,
    },
    title: {
      fontSize: 56,
      lineHeight: 0.95,
      letterSpacing: "-2px",
      fontWeight: 950,
      color: "#ffffff",
      margin: 0,
    },
    copy: {
      marginTop: 18,
      maxWidth: 560,
      fontSize: 17,
      lineHeight: 1.7,
      color: "rgba(255,255,255,0.88)",
    },
    cardWrap: {
      marginTop: 34,
      width: "100%",
      maxWidth: 560,
    },
    card: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 30,
      padding: 22,
      background:
        "linear-gradient(180deg, rgba(59,130,246,0.14) 0%, rgba(255,255,255,0.10) 100%)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 18px 44px rgba(15, 23, 42, 0.14)",
      isolation: "isolate",
    },
    cardTitle: {
      margin: 0,
      fontSize: 30,
      lineHeight: 1.02,
      fontWeight: 950,
      letterSpacing: "-0.9px",
      color: "#ffffff",
    },
    cardCopy: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 1.66,
      color: "rgba(255,255,255,0.82)",
      maxWidth: 420,
    },
    form: {
      marginTop: 22,
      display: "grid",
      gap: 16,
    },
    fieldWrap: {
      display: "grid",
      gap: 8,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.72)",
    },
    fieldInput: {
      width: "100%",
      height: 58,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "0 16px",
      fontSize: 15,
      fontWeight: 600,
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
    },
    messageError: {
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(239, 68, 68, 0.14)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.5,
    },
    messageSuccess: {
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(15, 118, 110, 0.18)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.5,
    },
    primaryBtn: {
      width: "100%",
      height: 58,
      borderRadius: 18,
      border: "none",
      background: "rgba(255, 255, 255, 0.96)",
      color: "#0f172a",
      fontSize: 15,
      fontWeight: 900,
      letterSpacing: "-0.2px",
      cursor: isSubmitting ? "not-allowed" : "pointer",
      opacity: isSubmitting ? 0.72 : 1,
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.14)",
    },
    secondaryRow: {
      marginTop: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    secondaryLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#93c5fd",
      textDecoration: "none",
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.topRow}>
            <div style={styles.badge}>GuestFlow Admin</div>
            <Link href="/admin/login" style={styles.backLink}>
              Back to sign in
            </Link>
          </div>

          <div style={styles.headingBlock}>
            <h1 style={styles.title}>
              Reset your
              <br />
              admin password.
            </h1>

            <div style={styles.copy}>
              Enter your email and we will send you a secure link to create a new password.
            </div>
          </div>

          <div style={styles.cardWrap}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Send reset email</h2>
              <div style={styles.cardCopy}>
                Use the same admin email address you sign in with.
              </div>

              <form style={styles.form} onSubmit={handleSubmit}>
                <div style={styles.fieldWrap}>
                  <label style={styles.fieldLabel}>Email</label>
                  <input
                    type="email"
                    placeholder="manager@guestflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    style={styles.fieldInput}
                  />
                </div>

                {errorMessage ? (
                  <div style={styles.messageError}>{errorMessage}</div>
                ) : null}

                {successMessage ? (
                  <div style={styles.messageSuccess}>{successMessage}</div>
                ) : null}

                <button type="submit" style={styles.primaryBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div style={styles.secondaryRow}>
                <Link href="/admin/login" style={styles.secondaryLink}>
                  Return to sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}