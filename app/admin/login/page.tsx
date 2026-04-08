// app/admin/login/page.tsx
"use client"

import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <>
      <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 28%),
            radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0) 24%),
            linear-gradient(180deg, #f8fcff 0%, #eef8ff 46%, #fff5e8 100%);
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          box-sizing: border-box;
        }

        .admin-login-shell {
          width: 100%;
          max-width: 1140px;
          display: grid;
          grid-template-columns: 1fr 0.98fr;
          gap: 28px;
          align-items: stretch;
        }

        .intro-panel {
          order: 1;
          border-radius: 34px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: linear-gradient(
            145deg,
            rgba(8, 47, 73, 0.98) 0%,
            rgba(15, 118, 110, 0.96) 52%,
            rgba(245, 158, 11, 0.92) 100%
          );
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
          position: relative;
          min-height: 680px;
        }

        .intro-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at top right,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0) 36%
          );
          pointer-events: none;
        }

        .intro-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px;
          color: #ffffff;
        }

        .intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .intro-title {
          margin-top: 26px;
          font-size: 54px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -1.8px;
          max-width: 520px;
        }

        .intro-copy {
          margin-top: 18px;
          max-width: 500px;
          font-size: 17px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.88);
        }

        .intro-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .intro-stat {
          border-radius: 24px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(12px);
        }

        .intro-stat-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 8px;
        }

        .intro-stat-value {
          font-size: 15px;
          font-weight: 800;
          line-height: 1.4;
        }

        .login-panel {
          order: 2;
          border-radius: 34px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-inner {
          max-width: 430px;
          width: 100%;
          margin: 0 auto;
        }

        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .gf-mark {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: #0f172a;
          color: #ffffff;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.5px;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
        }

        .back-link {
          font-size: 14px;
          font-weight: 800;
          color: #0f766e;
          text-decoration: none;
        }

        .login-title {
          margin-top: 22px;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -1.1px;
          color: #020617;
        }

        .login-copy {
          margin-top: 10px;
          font-size: 15px;
          line-height: 1.6;
          color: #64748b;
        }

        .field-wrap {
          margin-top: 24px;
        }

        .field-wrap + .field-wrap {
          margin-top: 18px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #64748b;
        }

        .field-input {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.26);
          background: #f8fafc;
          padding: 0 16px;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
        }

        .field-input:focus {
          border-color: rgba(15, 118, 110, 0.42);
          box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.08);
        }

        .login-row {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .keep-signed-in {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #64748b;
        }

        .forgot-btn {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 14px;
          font-weight: 800;
          color: #0f766e;
          cursor: pointer;
        }

        .primary-btn {
          margin-top: 24px;
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
        }

        .secondary-row {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .secondary-link {
          font-size: 14px;
          font-weight: 800;
          color: #0f766e;
          text-decoration: none;
        }

        .muted {
          font-size: 14px;
          color: #64748b;
        }

        @media (max-width: 980px) {
          .admin-login-page {
            align-items: flex-start;
            padding: 20px 14px 28px;
          }

          .admin-login-shell {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .login-panel {
            order: 1;
            border-radius: 26px;
            padding: 24px 18px;
          }

          .intro-panel {
            order: 2;
            min-height: auto;
            border-radius: 26px;
          }

          .intro-content {
            padding: 24px 20px;
            gap: 28px;
          }

          .intro-title {
            font-size: 38px;
            line-height: 0.98;
            letter-spacing: -1.2px;
            max-width: none;
          }

          .intro-copy {
            max-width: none;
            font-size: 15px;
            line-height: 1.6;
          }

          .intro-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .login-title {
            font-size: 30px;
            letter-spacing: -0.9px;
          }
        }

        @media (max-width: 560px) {
          .admin-login-page {
            padding: 14px 12px 20px;
          }

          .login-panel,
          .intro-panel {
            border-radius: 22px;
          }

          .login-panel {
            padding: 18px 14px;
          }

          .intro-content {
            padding: 18px 14px;
          }

          .gf-mark {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            font-size: 18px;
          }

          .login-title {
            margin-top: 18px;
            font-size: 28px;
          }

          .intro-title {
            margin-top: 20px;
            font-size: 32px;
            line-height: 1;
          }

          .field-input,
          .primary-btn {
            height: 54px;
            border-radius: 16px;
          }

          .login-row,
          .secondary-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="admin-login-page">
        <div className="admin-login-shell">
          <section className="intro-panel">
            <div className="intro-overlay" />

            <div className="intro-content">
              <div>
                <div className="intro-badge">GuestFlow Admin</div>

                <div className="intro-title">
                  Back to
                  <br />
                  your live
                  <br />
                  operation.
                </div>

                <div className="intro-copy">
                  Sign in to manage events, tables, check-ins, staff activity,
                  and nightly flow.
                </div>
              </div>

              <div className="intro-stats">
                {[
                  {
                    label: "Live Ops",
                    value: "Doors, tables, and guest flow",
                  },
                  {
                    label: "Check-In",
                    value: "Fast scan and lookup",
                  },
                  {
                    label: "Visibility",
                    value: "Sales, scans, and exceptions",
                  },
                  {
                    label: "Built For",
                    value: "Nightly venue operations",
                  },
                ].map((item) => (
                  <div key={item.label} className="intro-stat">
                    <div className="intro-stat-label">{item.label}</div>
                    <div className="intro-stat-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-inner">
              <div className="top-row">
                <div className="gf-mark">GF</div>
                <Link href="/admin" className="back-link">
                  Back
                </Link>
              </div>

              <div className="login-title">Sign in</div>

              <div className="login-copy">
                Access your GuestFlow Admin workspace.
              </div>

              <div className="field-wrap">
                <label className="field-label">Email</label>
                <input
                  type="email"
                  placeholder="manager@guestflow.com"
                  className="field-input"
                />
              </div>

              <div className="field-wrap">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="field-input"
                />
              </div>

              <div className="login-row">
                <label className="keep-signed-in">
                  <input type="checkbox" defaultChecked />
                  Keep me signed in
                </label>

                <button className="forgot-btn">Forgot password?</button>
              </div>

              <button className="primary-btn">Sign In</button>

              <div className="secondary-row">
                <div className="muted">New to GuestFlow Admin?</div>
                <Link href="/admin" className="secondary-link">
                  Start setup
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}