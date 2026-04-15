// app/admin/auth/accept-invite/AcceptInviteClient.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient, type Session } from "@supabase/supabase-js"

type StaffRole = "owner" | "manager" | "promoter" | "staff" | "security"

type AcceptInviteResponse = {
  success: boolean
  role?: StaffRole
  venueId?: string | null
  redirectTo?: string
  message?: string
  error?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export default function AcceptInviteClient() {
  const router = useRouter()
  const hasStartedRef = useRef(false)

  const [status, setStatus] = useState<
    "loading" | "finalizing" | "success" | "error"
  >("loading")
  const [message, setMessage] = useState(
    "Checking your invite and preparing your account."
  )
  const [error, setError] = useState("")

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    if (!supabaseClient) {
      setStatus("error")
      setError(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      )
      return
    }

    const supabase = supabaseClient

    let mounted = true
    let unsubscribed = false
    let unsubscribeAuthListener: (() => void) | null = null

    async function finalizeInvite(session: Session) {
      try {
        if (!mounted) return

        setStatus("finalizing")
        setMessage("Finalizing your venue access.")

        const accessToken = session.access_token
        if (!accessToken) {
          throw new Error("Missing access token after invite sign-in.")
        }

        const res = await fetch("/api/admin/staff/accept-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        })

        const data = (await res.json()) as AcceptInviteResponse

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to complete invite acceptance.")
        }

        if (!mounted) return

        setStatus("success")
        setMessage(data.message || "Invite accepted successfully.")

        const redirectTo = data.redirectTo || "/admin/scanner"

        window.setTimeout(() => {
          router.replace(redirectTo)
        }, 900)
      } catch (err) {
        if (!mounted) return
        setStatus("error")
        setError(
          err instanceof Error
            ? err.message
            : "We could not complete your invite."
        )
      }
    }

    async function boot() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          await finalizeInvite(session)
          return
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, nextSession) => {
            if (
              unsubscribed ||
              !nextSession ||
              (event !== "SIGNED_IN" &&
                event !== "TOKEN_REFRESHED" &&
                event !== "USER_UPDATED")
            ) {
              return
            }

            await finalizeInvite(nextSession)
          }
        )

        unsubscribeAuthListener = () => {
          authListener.subscription.unsubscribe()
        }

        window.setTimeout(async () => {
          if (!mounted || unsubscribed) return

          const {
            data: { session: delayedSession },
          } = await supabase.auth.getSession()

          if (delayedSession) {
            await finalizeInvite(delayedSession)
          } else if (mounted) {
            setStatus("error")
            setError(
              "No active invite session was found. Please reopen the invite email and click the link again."
            )
          }

          if (unsubscribeAuthListener) {
            unsubscribeAuthListener()
            unsubscribeAuthListener = null
          }
        }, 1800)
      } catch (err) {
        if (!mounted) return
        setStatus("error")
        setError(
          err instanceof Error ? err.message : "Failed to validate invite."
        )
      }
    }

    boot()

    return () => {
      mounted = false
      unsubscribed = true
      if (unsubscribeAuthListener) {
        unsubscribeAuthListener()
      }
    }
  }, [router])

  const styles = {
    page: {
      minHeight: "100dvh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: "24px 16px",
      display: "grid",
      placeItems: "center",
    } as React.CSSProperties,

    card: {
      width: "100%",
      maxWidth: 560,
      borderRadius: 28,
      background: "rgba(255,255,255,0.24)",
      border: "1px solid rgba(255,255,255,0.40)",
      boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      padding: "28px 22px",
      color: "#10243a",
      display: "grid",
      gap: 14,
    } as React.CSSProperties,

    title: {
      margin: 0,
      fontSize: 32,
      lineHeight: 1.05,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: "#0b1f33",
    } as React.CSSProperties,

    subtitle: {
      margin: 0,
      fontSize: 15,
      lineHeight: 1.6,
      color: "rgba(16,36,58,0.76)",
      fontWeight: 600,
    } as React.CSSProperties,

    statusBox: {
      borderRadius: 18,
      padding: "14px 16px",
      background: "rgba(255,255,255,0.28)",
      border: "1px solid rgba(255,255,255,0.42)",
      fontSize: 14,
      lineHeight: 1.6,
      fontWeight: 700,
      color: "#0f2940",
    } as React.CSSProperties,

    errorBox: {
      borderRadius: 18,
      padding: "14px 16px",
      background: "rgba(255,240,240,0.28)",
      border: "1px solid rgba(255,255,255,0.42)",
      fontSize: 14,
      lineHeight: 1.6,
      fontWeight: 700,
      color: "#991b1b",
    } as React.CSSProperties,

    spinnerWrap: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    } as React.CSSProperties,

    spinner: {
      width: 18,
      height: 18,
      borderRadius: 999,
      border: "2px solid rgba(15,41,64,0.18)",
      borderTopColor: "#0f2940",
      animation: "acceptInviteSpin 0.9s linear infinite",
      flexShrink: 0,
    } as React.CSSProperties,

    buttonRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap" as const,
      marginTop: 4,
    } as React.CSSProperties,

    button: {
      minHeight: 46,
      borderRadius: 16,
      border: "1px solid rgba(15,41,64,0.14)",
      background: "#0f2940",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 800,
      padding: "0 16px",
      cursor: "pointer",
      boxShadow: "0 12px 22px rgba(15,41,64,0.16)",
    } as React.CSSProperties,

    secondaryButton: {
      minHeight: 46,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.42)",
      background: "rgba(255,255,255,0.26)",
      color: "#0f2940",
      fontSize: 14,
      fontWeight: 800,
      padding: "0 16px",
      cursor: "pointer",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    } as React.CSSProperties,
  }

  return (
    <div style={styles.page}>
      <style jsx global>{`
        @keyframes acceptInviteSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div style={styles.card}>
        <h1 style={styles.title}>Accept Invite</h1>
        <p style={styles.subtitle}>
          We are confirming your venue access and sending you to the correct
          dashboard.
        </p>

        {(status === "loading" || status === "finalizing") && (
          <div style={styles.statusBox}>
            <div style={styles.spinnerWrap}>
              <div style={styles.spinner} />
              <div>{message}</div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div style={styles.statusBox}>{message}</div>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorBox}>{error}</div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                style={styles.button}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => router.replace("/admin/login")}
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}