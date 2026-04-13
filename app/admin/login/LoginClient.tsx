// app/admin/LoginClient.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { createClient } from "@/app/lib/supabase/client"

type AppRole = "customer" | "venue_admin" | "promoter" | "staff" | "super_admin"

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

function getRouteForRole(role: AppRole) {
  switch (role) {
    case "venue_admin":
      return "/admin/signup/hybrid/create"
    case "promoter":
      return "/admin/signup/event/create"
    case "staff":
      return "/admin/dashboard"
    case "super_admin":
      return "/admin/dashboard"
    case "customer":
    default:
      return "/"
  }
}

export default function LoginClient() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const created = params.get("created")
    const reset = params.get("reset")
    const queryEmail = params.get("email") || ""

    if (queryEmail) {
      setEmail(queryEmail)
    }

    if (created === "1") {
      setSuccessMessage("Account created. Sign in to continue.")
    } else if (reset === "1") {
      setSuccessMessage("Password updated. Sign in with your new password.")
    }
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

    if (!password) {
      setErrorMessage("Please enter your password.")
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      if (!data.user) {
        setErrorMessage("Login succeeded, but no user was returned.")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        setErrorMessage(`Signed in, but profile lookup failed: ${profileError.message}`)
        return
      }

      if (!profile) {
        setErrorMessage("Signed in, but no matching profile record was found.")
        return
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        setErrorMessage("This account is inactive. Please contact support.")
        return
      }

      const route = getRouteForRole(profile.role as AppRole)
      router.push(route)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while signing in."

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim()
    const target = trimmedEmail
      ? `/admin/login/reset?email=${encodeURIComponent(trimmedEmail)}`
      : "/admin/login/reset"

    router.push(target)
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
    orbOne: {
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
    },
    orbTwo: {
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
    },
    orbThree: {
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
      fontSize: 62,
      lineHeight: 0.93,
      letterSpacing: "-2.2px",
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
    loginWrap: {
      marginTop: 34,
      width: "100%",
      maxWidth: 560,
    },
    loginCard: {
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
    loginCardOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.01) 56%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 18%)",
      pointerEvents: "none",
    },
    loginInner: {
      position: "relative",
      zIndex: 1,
    },
    loginTitle: {
      margin: 0,
      fontSize: 30,
      lineHeight: 1.02,
      fontWeight: 950,
      letterSpacing: "-0.9px",
      color: "#ffffff",
    },
    loginCopy: {
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
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
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
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.10)",
      color: "#090909",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },
    helperRow: {
      marginTop: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
    },
    keepSignedIn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontSize: 14,
      color: "rgba(255,255,255,0.78)",
    },
    forgotBtn: {
      border: "none",
      background: "transparent",
      padding: 0,
      fontSize: 14,
      fontWeight: 800,
      color: "#93c5fd",
      cursor: "pointer",
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
      marginTop: 4,
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
    muted: {
      fontSize: 14,
      color: "rgba(255,255,255,0.74)",
    },
    secondaryLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#93c5fd",
      textDecoration: "none",
    },
    footerPills: {
      marginTop: 26,
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
  }

  const isMobile = false

  return (
    <div style={styles.page}>
      <div style={styles.pageOverlay} />
      <div style={styles.orbOne} />
      <div style={styles.orbTwo} />
      <div style={styles.orbThree} />

      <div style={styles.shell}>
        <section
          style={{
            ...styles.hero,
            ...(isMobile
              ? {
                  minHeight: "calc(100vh - 24px)",
                  borderRadius: 22,
                  padding: "18px 14px 14px",
                }
              : null),
          }}
        >
          <div style={styles.heroLights} />
          <div style={styles.heroFlow} />
          <div style={styles.heroGrid} />

          <div style={styles.heroContent}>
            <div>
              <div
                style={{
                  ...styles.topRow,
                  ...(isMobile
                    ? {
                        alignItems: "flex-start",
                        flexDirection: "column",
                      }
                    : null),
                }}
              >
                <div style={styles.badge}>GuestFlow Admin</div>

                <Link href="/admin" style={styles.backLink}>
                  Back
                </Link>
              </div>

              <div style={styles.headingBlock}>
                <h1
                  style={{
                    ...styles.title,
                    ...(isMobile
                      ? {
                          fontSize: 34,
                          lineHeight: 1,
                          letterSpacing: "-1px",
                        }
                      : null),
                  }}
                >
                  Back to your
                  <br />
                  live operation.
                </h1>

                <div
                  style={{
                    ...styles.copy,
                    ...(isMobile
                      ? {
                          fontSize: 14,
                          lineHeight: 1.62,
                        }
                      : null),
                  }}
                >
                  Sign in to manage events, tables, check-ins, staff activity,
                  and nightly flow.
                </div>
              </div>

              <div
                style={{
                  ...styles.loginWrap,
                  ...(isMobile ? { marginTop: 24, maxWidth: "100%" } : null),
                }}
              >
                <div
                  style={{
                    ...styles.loginCard,
                    ...(isMobile
                      ? {
                          borderRadius: 22,
                          padding: 14,
                        }
                      : null),
                  }}
                >
                  <div style={styles.loginCardOverlay} />

                  <div style={styles.loginInner}>
                    <h2
                      style={{
                        ...styles.loginTitle,
                        ...(isMobile ? { fontSize: 24 } : null),
                      }}
                    >
                      Sign in
                    </h2>

                    <div style={styles.loginCopy}>
                      Access your GuestFlow Admin workspace.
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
                          style={{
                            ...styles.fieldInput,
                            ...(isMobile
                              ? {
                                  height: 54,
                                  borderRadius: 16,
                                }
                              : null),
                          }}
                        />
                      </div>

                      <div style={styles.fieldWrap}>
                        <label style={styles.fieldLabel}>Password</label>
                        <div style={styles.passwordWrap}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            style={{
                              ...styles.passwordInput,
                              ...(isMobile
                                ? {
                                    height: 54,
                                    borderRadius: 16,
                                  }
                                : null),
                            }}
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

                      {errorMessage ? (
                        <div style={styles.messageError}>{errorMessage}</div>
                      ) : null}

                      {successMessage ? (
                        <div style={styles.messageSuccess}>{successMessage}</div>
                      ) : null}

                      <div
                        style={{
                          ...styles.helperRow,
                          ...(isMobile
                            ? {
                                alignItems: "flex-start",
                                flexDirection: "column",
                              }
                            : null),
                        }}
                      >
                        <label style={styles.keepSignedIn}>
                          <input
                            type="checkbox"
                            checked={keepSignedIn}
                            onChange={(e) => setKeepSignedIn(e.target.checked)}
                          />
                          Keep me signed in
                        </label>

                        <button
                          type="button"
                          style={styles.forgotBtn}
                          onClick={handleForgotPassword}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        style={{
                          ...styles.primaryBtn,
                          ...(isMobile
                            ? {
                                height: 54,
                                borderRadius: 16,
                              }
                            : null),
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                      </button>
                    </form>

                    <div
                      style={{
                        ...styles.secondaryRow,
                        ...(isMobile
                          ? {
                              alignItems: "flex-start",
                              flexDirection: "column",
                            }
                          : null),
                      }}
                    >
                      <div style={styles.muted}>New to GuestFlow Admin?</div>

                      <Link href="/admin" style={styles.secondaryLink}>
                        Start setup
                      </Link>
                    </div>

                    <div style={styles.footerPills}>
                      <div style={styles.pill}>Live operations</div>
                      <div style={styles.pill}>Tickets + tables</div>
                      <div style={styles.pill}>Maps + sections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}