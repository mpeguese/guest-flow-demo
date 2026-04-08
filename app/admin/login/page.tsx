"use client"

import Link from "next/link"
import type { CSSProperties } from "react"

export default function AdminLoginPage() {
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
      cursor: "pointer",
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

                    <div style={styles.form}>
                      <div style={styles.fieldWrap}>
                        <label style={styles.fieldLabel}>Email</label>
                        <input
                          type="email"
                          placeholder="manager@guestflow.com"
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
                        <input
                          type="password"
                          placeholder="Enter your password"
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
                          <input type="checkbox" defaultChecked />
                          Keep me signed in
                        </label>

                        <button style={styles.forgotBtn}>Forgot password?</button>
                      </div>

                      <button
                        style={{
                          ...styles.primaryBtn,
                          ...(isMobile
                            ? {
                                height: 54,
                                borderRadius: 16,
                              }
                            : null),
                        }}
                      >
                        Sign In
                      </button>
                    </div>

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