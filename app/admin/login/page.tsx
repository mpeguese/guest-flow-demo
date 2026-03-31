// app/admin/login/page.tsx
"use client"

import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <>
      <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            #f8fcff 0%,
            #eef8ff 46%,
            #fff5e8 100%
          );
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
        }

        .admin-login-shell {
          width: 100%;
          max-width: 1180px;
          display: grid;
          grid-template-columns: 1.02fr 0.98fr;
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
          min-height: 690px;
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
          margin-top: 20px;
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
          margin-top: 26px;
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

        .secondary-btn {
          margin-top: 14px;
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-sizing: border-box;
        }

        .login-meta {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .login-meta-card {
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.16);
          padding: 16px;
        }

        .login-meta-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .login-meta-value {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
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

          .login-meta {
            grid-template-columns: 1fr;
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
          .primary-btn,
          .secondary-btn {
            height: 54px;
            border-radius: 16px;
          }

          .login-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="admin-login-page">
        <div className="admin-login-shell">
          {/* Left Brand / Intro Panel */}
          <section className="intro-panel">
            <div className="intro-overlay" />

            <div className="intro-content">
              <div>
                <div className="intro-badge">GuestFlow Admin</div>

                <div className="intro-title">
                  Run doors,
                  <br />
                  tables, and
                  <br />
                  guest flow.
                </div>

                <div className="intro-copy">
                  A premium operations portal for venue managers, door teams,
                  hosts, and staff to monitor event activity in real time.
                </div>
              </div>

              <div className="intro-stats">
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
                  <div key={item.label} className="intro-stat">
                    <div className="intro-stat-label">{item.label}</div>
                    <div className="intro-stat-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Login Panel */}
          <section className="login-panel">
            <div className="login-inner">
              <div className="gf-mark">GF</div>

              <div className="login-title">Welcome back</div>

              <div className="login-copy">
                Sign in to access GuestFlow Admin and manage live venue
                operations.
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

              <Link href="/admin/dashboard" className="secondary-btn">
                Demo Dashboard
              </Link>

              <div className="login-meta">
                <div className="login-meta-card">
                  <div className="login-meta-label">Access</div>
                  <div className="login-meta-value">Live Ops + Sales</div>
                </div>

                <div className="login-meta-card">
                  <div className="login-meta-label">Role</div>
                  <div className="login-meta-value">Business Admin</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}