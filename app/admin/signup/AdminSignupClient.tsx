// app/admin/signup/AdminSignupClient.tsx
// app/admin/signup/AdminSignupClient.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react"
import { createClient } from "@/app/lib/supabase/client"

type SignupContent = {
  badge: string
  title: string
  subtitle: string
  summary: string
}

type IntentType = "event" | "hybrid"

function getIntentFromSearch(search: string): IntentType {
  const params = new URLSearchParams(search)
  const rawIntent = (params.get("intent") || "").trim().toLowerCase()

  if (rawIntent === "hybrid") return "hybrid"
  return "event"
}

function getIntentRoute(intent: IntentType) {
  switch (intent) {
    case "hybrid":
      return "/admin/signup/hybrid/create"
    case "event":
    default:
      return "/admin/signup/event/create"
  }
}

function makeBusinessSlug(value: string) {
  return value
    .trim()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

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

export default function AdminSignupClient({
  content,
}: {
  content: SignupContent
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [intent, setIntent] = useState<IntentType>("event")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    setIntent(getIntentFromSearch(window.location.search))
  }, [])

  const isEventIntent = intent === "event"

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMessage("")
    setSuccessMessage("")

    const currentIntent =
      typeof window !== "undefined"
        ? getIntentFromSearch(window.location.search)
        : intent

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedBusinessName = businessName.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedFirstName) {
      setErrorMessage("Please enter your first name.")
      return
    }

    if (!trimmedLastName) {
      setErrorMessage("Please enter your last name.")
      return
    }

    if (currentIntent === "event" && !trimmedBusinessName) {
      setErrorMessage("Please enter your business or organizer name.")
      return
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const profileRole = currentIntent === "hybrid" ? "venue_admin" : "promoter"
      const route = getIntentRoute(currentIntent)

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            signup_intent: currentIntent,
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      if (!data.user) {
        setErrorMessage("Signup completed without a user record. Please try again.")
        return
      }

      const profilePayload = {
        id: data.user.id,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: data.user.email ?? trimmedEmail,
        role: profileRole,
        is_active: true,
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })

      if (profileError) {
        setErrorMessage(
          `Your auth account was created, but your profile could not be initialized: ${profileError.message}`
        )
        return
      }

      if (currentIntent === "event") {
        const businessSlug = makeBusinessSlug(trimmedBusinessName)

        if (!businessSlug) {
          setErrorMessage("Please enter a valid business or organizer name.")
          return
        }

        const { data: existingBusinessLink, error: existingBusinessLinkError } =
          await supabase
            .from("business_admins")
            .select("business_id")
            .eq("user_id", data.user.id)
            .order("is_primary", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (existingBusinessLinkError) {
          setErrorMessage(
            `Your account was created, but we could not check your business setup: ${existingBusinessLinkError.message}`
          )
          return
        }

        if (!existingBusinessLink?.business_id) {
          const { data: business, error: businessError } = await supabase
            .from("businesses")
            .insert({
              name: trimmedBusinessName,
              slug: businessSlug,
              legal_name: trimmedBusinessName,
              business_type: "other",
              contact_email: trimmedEmail,
              created_by: data.user.id,
            })
            .select("id")
            .single()

          if (businessError) {
            setErrorMessage(
              `Your account was created, but your business could not be initialized: ${businessError.message}`
            )
            return
          }

          const { error: businessAdminError } = await supabase
            .from("business_admins")
            .insert({
              business_id: business.id,
              user_id: data.user.id,
              is_primary: true,
            })

          if (businessAdminError) {
            setErrorMessage(
              `Your account and business were created, but your admin access could not be linked: ${businessAdminError.message}`
            )
            return
          }
        }
      }

      if (data.session) {
        setSuccessMessage("Account created. Redirecting...")
        router.push(route)
        return
      }

      setErrorMessage(
        "Your account and profile were created, but no active session was returned. Check your Supabase email confirmation settings."
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at top left, rgba(56, 189, 248, 0.14) 0%, rgba(56, 189, 248, 0) 24%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.14) 0%, rgba(251, 191, 36, 0) 22%), linear-gradient(145deg, #0c1e3a 0%, #252978 34%, #6e359d 66%, #ec70be 100%)",
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
    helperText: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 1.45,
      color: "#64748b",
    },
    passwordWrap: {
      position: "relative",
      width: "100%",
    },
    passwordInput: {
      width: "100%",
      height: 56,
      borderRadius: 18,
      border: "1px solid rgba(148, 163, 184, 0.26)",
      background: "#f8fafc",
      padding: "0 52px 0 16px",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      boxSizing: "border-box",
    },
    eyeButton: {
      position: "absolute",
      top: "50%",
      right: 12,
      transform: "translateY(-50%)",
      width: 34,
      height: 34,
      borderRadius: 12,
      border: "1px solid rgba(148, 163, 184, 0.20)",
      background: "rgba(255,255,255,0.72)",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "#475569",
    },
    messageError: {
      marginTop: 18,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.18)",
      color: "#b91c1c",
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.5,
    },
    messageSuccess: {
      marginTop: 18,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(15, 118, 110, 0.08)",
      border: "1px solid rgba(15, 118, 110, 0.18)",
      color: "#0f766e",
      fontSize: 14,
      fontWeight: 700,
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
      cursor: isSubmitting ? "not-allowed" : "pointer",
      opacity: isSubmitting ? 0.7 : 1,
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
      <style jsx>{`
        @media (max-width: 640px) {
          .admin-signup-card {
            padding: 24px !important;
            border-radius: 28px !important;
          }

          .admin-signup-title {
            font-size: 32px !important;
          }

          .admin-signup-subtitle {
            font-size: 16px !important;
          }

          .admin-signup-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .admin-signup-full {
            grid-column: auto !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={styles.card} className="admin-signup-card">
          <div style={styles.topRow}>
            <div style={styles.gfMark}>GL</div>
            <Link href="/admin" style={styles.backLink}>
              Back
            </Link>
          </div>

          <div style={styles.intentBadge}>{content.badge}</div>

          <div style={styles.title} className="admin-signup-title">
            {content.title}
          </div>
          <div style={styles.subtitle} className="admin-signup-subtitle">
            {content.subtitle}
          </div>
          <div style={styles.summary}>{content.summary}</div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid} className="admin-signup-grid">
              <div>
                <label style={styles.fieldLabel}>First Name</label>
                <input
                  style={styles.fieldInput}
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Last Name</label>
                <input
                  style={styles.fieldInput}
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>

              {isEventIntent ? (
                <div style={styles.fieldWrapFull} className="admin-signup-full">
                  <label style={styles.fieldLabel}>Business / Organizer Name</label>
                  <input
                    style={styles.fieldInput}
                    type="text"
                    placeholder="Your LLC, DBA, promoter name, or event brand"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    autoComplete="organization"
                  />
                  <div style={styles.helperText}>
                    This is used for event ownership, payments, scanner access, and
                    analytics.
                  </div>
                </div>
              ) : null}

              <div style={styles.fieldWrapFull} className="admin-signup-full">
                <label style={styles.fieldLabel}>Email</label>
                <input
                  style={styles.fieldInput}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div style={styles.fieldWrapFull} className="admin-signup-full">
                <label style={styles.fieldLabel}>Password</label>

                <div style={styles.passwordWrap}>
                  <input
                    style={styles.passwordInput}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
            </div>

            {errorMessage ? (
              <div style={styles.messageError}>{errorMessage}</div>
            ) : null}

            {successMessage ? (
              <div style={styles.messageSuccess}>{successMessage}</div>
            ) : null}

            <button type="submit" style={styles.primaryBtn} disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Continue"}
            </button>
          </form>

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