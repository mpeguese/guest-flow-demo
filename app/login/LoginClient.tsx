// app/login/LoginClient.tsx
"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { supabase } from "../lib/supabase"

const COLORS = {
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",
  borderSoft: "#E6EEF2",
  primary: "#0EA5E9",
  primaryHover: "#0284C7",
  primarySoft: "#E0F2FE",
  accentSoft: "#DDF7F3",
  dangerSoft: "#FEE2E2",
} as const

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
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
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a17.56 17.56 0 0 1-2.05 3.04" />
      <path d="M6.61 6.61C3.78 8.47 2 12 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
      <path d="M3 3l18 18" />
    </svg>
  )
}

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next && next.startsWith("/") ? next : "/profile"
  }, [searchParams])

  const [mode, setMode] = useState<"sign-in" | "create">("sign-in")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 54,
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.92)",
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 700,
    padding: "0 14px",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSaving(true)
    setMessage("")
    setErrorMessage("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    if (!cleanEmail) {
      setErrorMessage("Email is required.")
      setSaving(false)
      return
    }

    if (!cleanPassword) {
      setErrorMessage("Password is required.")
      setSaving(false)
      return
    }

    if (mode === "create") {
      if (!cleanFirstName) {
        setErrorMessage("First name is required.")
        setSaving(false)
        return
      }

      if (!cleanLastName) {
        setErrorMessage("Last name is required.")
        setSaving(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            role: "customer",
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setSaving(false)
        return
      }

      const userId = data.user?.id

      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            first_name: cleanFirstName,
            last_name: cleanLastName,
            email: cleanEmail,
            role: "customer",
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        )

        if (profileError) {
          setErrorMessage(profileError.message)
          setSaving(false)
          return
        }
      }

      setMessage("Account created.")
      setSaving(false)
      router.push(nextPath)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    })

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    router.push(nextPath)
  }

  return (
    <MobileShell fullBleed>
      <div
        style={{
          minHeight: "100dvh",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)",
          color: COLORS.text,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: "0 auto",
            padding: "22px 16px calc(env(safe-area-inset-bottom, 0px) + 28px)",
            boxSizing: "border-box",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              borderRadius: 32,
              padding: "28px 20px",
              background: "rgba(255,255,255,0.72)",
              border: `1px solid ${COLORS.borderSoft}`,
              boxShadow: "0 24px 60px rgba(15,23,42,0.10)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                background:
                  "linear-gradient(180deg, rgba(224,242,254,0.92) 0%, rgba(240,249,255,0.96) 100%)",
                color: COLORS.primaryHover,
                display: "grid",
                placeItems: "center",
                marginBottom: 18,
                boxShadow: "0 16px 34px rgba(15,23,42,0.10)",
              }}
            >
              <ProfileIcon />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: -0.7,
                color: COLORS.text,
              }}
            >
              {mode === "create" ? "Create your profile" : "Welcome back"}
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color: COLORS.textSoft,
              }}
            >
              {mode === "create"
                ? "Create a customer profile to manage reservations and access tickets faster."
                : "Sign in to manage your profile, reservations, and tickets."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 22,
                padding: 4,
                borderRadius: 999,
                background: "rgba(241,245,249,0.82)",
                border: `1px solid ${COLORS.borderSoft}`,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("sign-in")
                  setMessage("")
                  setErrorMessage("")
                }}
                style={{
                  height: 40,
                  borderRadius: 999,
                  border: "none",
                  background: mode === "sign-in" ? "#FFFFFF" : "transparent",
                  color: mode === "sign-in" ? COLORS.text : COLORS.textMuted,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow:
                    mode === "sign-in"
                      ? "0 8px 18px rgba(15,23,42,0.08)"
                      : "none",
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("create")
                  setMessage("")
                  setErrorMessage("")
                }}
                style={{
                  height: 40,
                  borderRadius: 999,
                  border: "none",
                  background: mode === "create" ? "#FFFFFF" : "transparent",
                  color: mode === "create" ? COLORS.text : COLORS.textMuted,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow:
                    mode === "create"
                      ? "0 8px 18px rgba(15,23,42,0.08)"
                      : "none",
                }}
              >
                Create
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                {mode === "create" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <label style={{ display: "grid", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          color: COLORS.textMuted,
                        }}
                      >
                        FIRST NAME
                      </span>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First"
                        autoComplete="given-name"
                        style={inputStyle}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          color: COLORS.textMuted,
                        }}
                      >
                        LAST NAME
                      </span>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last"
                        autoComplete="family-name"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                ) : null}

                <label style={{ display: "grid", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      color: COLORS.textMuted,
                    }}
                  >
                    EMAIL
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    inputMode="email"
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 8 }}>
                    <span
                        style={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        color: COLORS.textMuted,
                        }}
                    >
                        PASSWORD
                    </span>

                    <div style={{ position: "relative" }}>
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete={mode === "create" ? "new-password" : "current-password"}
                        style={{
                            ...inputStyle,
                            paddingRight: 52,
                        }}
                        />

                        <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: 10,
                            transform: "translateY(-50%)",
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            border: "none",
                            background: "transparent",
                            color: COLORS.textMuted,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            padding: 0,
                        }}
                        >
                        <EyeIcon open={showPassword} />
                        </button>
                    </div>
                </label>

                {errorMessage ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid rgba(239,68,68,0.20)`,
                      background: COLORS.dangerSoft,
                      color: "#B91C1C",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {errorMessage}
                  </div>
                ) : null}

                {message ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid rgba(20,184,166,0.18)`,
                      background: COLORS.accentSoft,
                      color: "#0F766E",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: "100%",
                    height: 54,
                    marginTop: 4,
                    border: "none",
                    borderRadius: 20,
                    background: saving
                      ? "linear-gradient(180deg, #94A3B8 0%, #64748B 100%)"
                      : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 900,
                    letterSpacing: 0.2,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 14px 28px rgba(14,165,233,0.24)",
                    opacity: saving ? 0.78 : 1,
                  }}
                >
                  {saving
                    ? mode === "create"
                      ? "Creating..."
                      : "Signing in..."
                    : mode === "create"
                      ? "Create Account"
                      : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 20,
                    border: `1px solid ${COLORS.border}`,
                    background: "rgba(255,255,255,0.88)",
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: 850,
                    cursor: "pointer",
                    boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}


