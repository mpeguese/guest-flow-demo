"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"

const COLORS = {
  bg: "#FFFFFF",
  bgSoft: "#F7FBFC",
  bgWarm: "#FFF4E5",
  card: "#FFFFFF",
  cardSoft: "#F2FAFB",
  text: "#0F172A",
  textSoft: "#475569",
  textMuted: "#64748B",
  border: "#D9E8EC",
  borderSoft: "#E6EEF2",

  primary: "#0EA5E9",
  primaryHover: "#0284C7",
  primarySoft: "#E0F2FE",

  accent: "#14B8A6",
  accentSoft: "#DDF7F3",

  coral: "#FF7A59",
  coralSoft: "#FFE7E0",

  gold: "#F59E0B",
  goldSoft: "#FEF3C7",

  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
} as const

const COUNTRY_CODES = [
  { label: "US +1", value: "+1" },
  { label: "CA +1", value: "+1" },
  { label: "UK +44", value: "+44" },
  { label: "MX +52", value: "+52" },
  { label: "JM +1-876", value: "+1-876" },
]

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.207 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.849 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.849 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.348 4.337-17.694 10.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.14 35.091 26.715 36 24 36c-5.186 0-9.626-3.332-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571h.001l6.19 5.238C36.971 39.217 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  )
}

export default function ProfileClient() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [saveMessage, setSaveMessage] = useState("")

  function handleSave() {
    setSaveMessage("Profile details saved locally for this session.")
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
            padding: "14px 14px calc(env(safe-area-inset-bottom, 0px) + 28px)",
            boxSizing: "border-box",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              paddingTop: 4,
              paddingBottom: 14,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,251,252,0.92) 78%, rgba(247,251,252,0) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                title="Go back"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.86)",
                  color: COLORS.text,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: "0 10px 22px rgba(15,23,42,0.10)",
                }}
              >
                <BackIcon />
              </button>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 50,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.78)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 14px 28px rgba(15,23,42,0.12)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: COLORS.primarySoft,
                    color: COLORS.primaryHover,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ProfileIcon />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: COLORS.textMuted,
                    }}
                  >
                    PROFILE
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              paddingTop: 6,
            }}
          >
            <div
              style={{
                padding: "8px 2px 0",
              }}
            >
              {/* <h1
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: -0.8,
                  color: COLORS.text,
                }}
              >
                Your profile
              </h1> */}

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: COLORS.textSoft,
                  maxWidth: 360,
                }}
              >
                Save your details to make reservations and retrieval easier
                in later steps.
              </p>
            </div>

            <div
              style={{
                paddingTop: 22,
                display: "grid",
                gap: 18,
              }}
            >
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
                    placeholder="First name"
                    autoComplete="given-name"
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 5,
                      border: `1px solid ${COLORS.border}`,
                      background: "rgba(255,255,255,0.92)",
                      color: COLORS.text,
                      fontSize: 16,
                      fontWeight: 700,
                      padding: "0 14px",
                      outline: "none",
                      boxSizing: "border-box",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}
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
                    placeholder="Last name"
                    autoComplete="family-name"
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 5,
                      border: `1px solid ${COLORS.border}`,
                      background: "rgba(255,255,255,0.92)",
                      color: COLORS.text,
                      fontSize: 16,
                      fontWeight: 700,
                      padding: "0 14px",
                      outline: "none",
                      boxSizing: "border-box",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}
                  />
                </label>
              </div>

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
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: 5,
                    border: `1px solid ${COLORS.border}`,
                    background: "rgba(255,255,255,0.92)",
                    color: COLORS.text,
                    fontSize: 16,
                    fontWeight: 700,
                    padding: "0 14px",
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                  }}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
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
                    CODE
                  </span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 5,
                      border: `1px solid ${COLORS.border}`,
                      background: "rgba(255,255,255,0.92)",
                      color: COLORS.text,
                      fontSize: 16,
                      fontWeight: 700,
                      padding: "0 14px",
                      outline: "none",
                      boxSizing: "border-box",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}
                  >
                    {COUNTRY_CODES.map((code) => (
                      <option key={`${code.label}-${code.value}`} value={code.value}>
                        {code.label}
                      </option>
                    ))}
                  </select>
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
                    PHONE NUMBER
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    autoComplete="tel-national"
                    inputMode="tel"
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 5,
                      border: `1px solid ${COLORS.border}`,
                      background: "rgba(255,255,255,0.92)",
                      color: COLORS.text,
                      fontSize: 16,
                      fontWeight: 700,
                      padding: "0 14px",
                      outline: "none",
                      boxSizing: "border-box",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}
                  />
                </label>
              </div>

              {saveMessage ? (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 5,
                    border: `1px solid rgba(20,184,166,0.18)`,
                    background: COLORS.accentSoft,
                    color: "#0F766E",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {saveMessage}
                </div>
              ) : null}
            </div>

            <div
              style={{
                //marginTop: "auto",
                paddingTop: 40,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              }}
            >
              <button
                onClick={handleSave}
                style={{
                  width: "100%",
                  height: 54,
                  border: "none",
                  borderRadius: 20,
                  background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  cursor: "pointer",
                  boxShadow: "0 14px 28px rgba(14,165,233,0.24)",
                }}
              >
                Save & Continue
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 22,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: "rgba(100,116,139,0.18)",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    color: COLORS.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  OR CONTINUE WITH
                </div>
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: "rgba(100,116,139,0.18)",
                  }}
                />
              </div>

              <button
                type="button"
                aria-label="Continue with Google"
                title="Continue with Google"
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 20,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(255,255,255,0.92)",
                  color: COLORS.text,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                aria-label="Continue with Apple"
                title="Continue with Apple"
                style={{
                    width: "100%",
                    height: 54,
                    marginTop: 12,
                    borderRadius: 20,
                    border: `1px solid ${COLORS.border}`,
                    background: "rgba(255,255,255,0.92)",
                    color: COLORS.text,
                    fontSize: 15.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
                }}
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M16.37 12.09c.02 2.13 1.87 2.84 1.89 2.85-.02.05-.29 1-.95 1.98-.57.84-1.17 1.67-2.1 1.69-.92.02-1.22-.54-2.28-.54-1.06 0-1.39.52-2.26.56-.89.03-1.57-.89-2.15-1.72-1.18-1.71-2.08-4.83-.87-6.94.6-1.05 1.67-1.71 2.82-1.73.88-.02 1.71.59 2.28.59.56 0 1.61-.73 2.72-.62.47.02 1.79.19 2.64 1.43-.07.04-1.58.92-1.56 2.45Zm-1.92-4.52c.48-.58.81-1.39.72-2.2-.69.03-1.53.46-2.03 1.04-.45.52-.84 1.34-.73 2.13.77.06 1.56-.39 2.04-.97Z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}