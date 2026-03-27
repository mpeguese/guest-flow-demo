// app/admin/login/page.tsx
"use client"

import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 46%, #FFF5E8 100%)",
        color: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: "1.02fr 0.98fr",
          gap: 28,
          alignItems: "stretch",
        }}
      >
        {/* Left Brand / Intro Panel */}
        <section
          style={{
            borderRadius: 34,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.18)",
            background:
              "linear-gradient(145deg, rgba(8,47,73,0.98) 0%, rgba(15,118,110,0.96) 52%, rgba(245,158,11,0.92) 100%)",
            boxShadow: "0 24px 80px rgba(15,23,42,0.12)",
            position: "relative",
            minHeight: 690,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 36%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 36,
              color: "#FFFFFF",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 999,
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(10px)",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                }}
              >
                GuestFlow Admin
              </div>

              <div
                style={{
                  marginTop: 26,
                  fontSize: 54,
                  lineHeight: 0.95,
                  fontWeight: 900,
                  letterSpacing: -1.8,
                  maxWidth: 520,
                }}
              >
                Run doors,
                <br />
                tables, and
                <br />
                guest flow.
              </div>

              <div
                style={{
                  marginTop: 20,
                  maxWidth: 500,
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                A premium operations portal for venue managers, door teams,
                hosts, and staff to monitor event activity in real time.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Live Operations",
                  value: "Tickets, tables, check-ins",
                },
                {
                  label: "Fast Validation",
                  value: "QR scan and manual lookup",
                },
                {
                  label: "Sales Visibility",
                  value: "Revenue, scans, exceptions",
                },
                {
                  label: "Staff Ready",
                  value: "Built for event nights",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 24,
                    padding: 18,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.72)",
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Login Panel */}
        <section
          style={{
            borderRadius: 34,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 24px 80px rgba(15,23,42,0.08)",
            padding: 34,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: 430,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "#0F172A",
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: -0.5,
                boxShadow: "0 14px 32px rgba(15,23,42,0.18)",
              }}
            >
              GF
            </div>

            <div
              style={{
                marginTop: 22,
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: -1.1,
                color: "#020617",
              }}
            >
              Welcome back
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 15,
                lineHeight: 1.6,
                color: "#64748B",
              }}
            >
              Sign in to access GuestFlow Admin and manage live venue
              operations.
            </div>

            <div style={{ marginTop: 26 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#64748B",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="manager@guestflow.com"
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.26)",
                  background: "#F8FAFC",
                  padding: "0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#64748B",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.26)",
                  background: "#F8FAFC",
                  padding: "0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  color: "#64748B",
                }}
              >
                <input type="checkbox" defaultChecked />
                Keep me signed in
              </label>

              <button
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#0F766E",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              style={{
                marginTop: 24,
                width: "100%",
                height: 58,
                borderRadius: 18,
                border: "none",
                background: "#0F172A",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 16px 36px rgba(15,23,42,0.16)",
              }}
            >
              Sign In
            </button>

            <Link
              href="/admin/dashboard"
              style={{
                marginTop: 14,
                width: "100%",
                height: 58,
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.24)",
                background: "#FFFFFF",
                color: "#0F172A",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              Demo Dashboard
            </Link>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  borderRadius: 20,
                  background: "#F8FAFC",
                  border: "1px solid rgba(148,163,184,0.16)",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: "#94A3B8",
                  }}
                >
                  Access
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Live Ops + Sales
                </div>
              </div>

              <div
                style={{
                  borderRadius: 20,
                  background: "#F8FAFC",
                  border: "1px solid rgba(148,163,184,0.16)",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: "#94A3B8",
                  }}
                >
                  Role
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Business Admin
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}