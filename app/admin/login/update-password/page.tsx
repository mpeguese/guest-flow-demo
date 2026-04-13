"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { createClient } from "@/app/lib/supabase/client"

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 16a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-3.17 4.31" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.77 9.77 0 0 0 4.39-1.02" />
    </svg>
  )
}

export default function AdminUpdatePasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()

      if (mounted && data.session) {
        setIsReady(true)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === "PASSWORD_RECOVERY" || session) {
        setIsReady(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMessage("")
    setSuccessMessage("")

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage("Password updated. Redirecting to sign in...")
      router.push("/admin/login?reset=1")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your password."

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
    passwordWrap: {
      position: "relative",
      width: "100%",
    },
    passwordInput: {
      width: "100%",
      height: 58,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "0 54px 0 16px",
      fontSize: 15,
      fontWeight: 600,
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    },
    eyeButton: {
      position: "absolute",
      top: "50%",
      right: 12,
      transform: "translateY(-50%)",
      width: 34,
      height: 34,
      padding: 0,
      border: "none",
      background: "transparent",
      boxShadow: "none",
      color: "#ffffff",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
      outline: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
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
    infoCard: {
      marginTop: 18,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "#ffffff",
      fontSize: 14,
      lineHeight: 1.6,
    },
    secondaryLink: {
      marginTop: 18,
      display: "inline-block",
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
              Create your
              <br />
              new password.
            </h1>

            <div style={styles.copy}>
              Choose a new password for your GuestFlow Admin account.
            </div>
          </div>

          <div style={styles.cardWrap}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Update password</h2>
              <div style={styles.cardCopy}>
                Use at least 8 characters and choose something secure.
              </div>

              {!isReady ? (
                <>
                  <div style={styles.infoCard}>
                    Open this page from the password reset link in your email. Once the recovery
                    session is active, the new password form will work here.
                  </div>

                  <Link href="/admin/login/reset" style={styles.secondaryLink}>
                    Send another reset email
                  </Link>
                </>
              ) : (
                <form style={styles.form} onSubmit={handleSubmit}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.fieldLabel}>New Password</label>
                    <div style={styles.passwordWrap}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        style={styles.passwordInput}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.fieldWrap}>
                    <label style={styles.fieldLabel}>Confirm Password</label>
                    <div style={styles.passwordWrap}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        style={styles.passwordInput}
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={styles.eyeButton}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  {errorMessage ? (
                    <div style={styles.messageError}>{errorMessage}</div>
                  ) : null}

                  {successMessage ? (
                    <div style={styles.messageSuccess}>{successMessage}</div>
                  ) : null}

                  <button type="submit" style={styles.primaryBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Save New Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}