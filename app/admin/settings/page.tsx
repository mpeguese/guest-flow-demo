"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const pageBackground =
  "linear-gradient(180deg, #FFFFFF 0%, #F7FBFC 54%, #FFF4E5 100%)"

const elevatedBackground =
  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,250,255,0.98) 100%)"

const elevatedShadow = "0 -24px 60px rgba(15,23,42,0.18)"

const textPrimary = "#0F172A"
const textSecondary = "#526077"
const labelText = "#64748B"
const borderColor = "rgba(148,163,184,0.16)"
const aqua = "#17CFCF"
const sky = "#53A7FF"
const coral = "#FF8D7A"

function TopButton({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: `1px solid ${active ? "rgba(83,167,255,0.28)" : borderColor}`,
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        borderRadius: 999,
        padding: "12px 16px",
        color: active ? textPrimary : textSecondary,
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  rightContent,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  rightContent?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        border: `1px solid ${borderColor}`,
        borderRadius: 28,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 14,
                color: textSecondary,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {rightContent}
      </div>

      {children}
    </div>
  )
}

function InputField({
  label,
  value,
  placeholder,
}: {
  label: string
  value?: string
  placeholder?: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: labelText,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <input
        defaultValue={value}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          height: 48,
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          background: "rgba(255,255,255,0.82)",
          padding: "0 14px",
          fontSize: 14,
          fontWeight: 700,
          color: textPrimary,
          outline: "none",
        }}
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: labelText,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <textarea
        defaultValue={value}
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          background: "rgba(255,255,255,0.82)",
          padding: "14px",
          fontSize: 14,
          fontWeight: 700,
          color: textPrimary,
          outline: "none",
          resize: "vertical",
          lineHeight: 1.5,
        }}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (next: string) => void
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: labelText,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          position: "relative",
        }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 48,
            boxSizing: "border-box",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            background: "rgba(255,255,255,0.82)",
            padding: "0 42px 0 14px",
            fontSize: 14,
            fontWeight: 700,
            color: textPrimary,
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            cursor: "pointer",
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: labelText,
            pointerEvents: "none",
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          ▾
        </span>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${borderColor}`,
        background: "rgba(255,255,255,0.76)",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "center",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: textPrimary,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: textSecondary,
            lineHeight: 1.45,
            fontWeight: 700,
            maxWidth: 560,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          width: 58,
          height: 32,
          borderRadius: 999,
          background: enabled
            ? "linear-gradient(90deg, #17CFCF 0%, #53A7FF 100%)"
            : "rgba(148,163,184,0.24)",
          position: "relative",
          flexShrink: 0,
          transition: "all 180ms ease",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            background: "#FFFFFF",
            position: "absolute",
            top: 4,
            left: enabled ? 30 : 4,
            boxShadow: "0 4px 14px rgba(15,23,42,0.16)",
            transition: "all 180ms ease",
          }}
        />
      </div>
    </button>
  )
}

function ColorPill({
  label,
  color,
  active = false,
}: {
  label: string
  color: string
  active?: boolean
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 18,
        border: `1px solid ${
          active ? "rgba(83,167,255,0.28)" : borderColor
        }`,
        background: "rgba(255,255,255,0.76)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: textPrimary,
        }}
      >
        {label}
      </span>
    </div>
  )
}
// REMOVE STATUS CARD
function StatusCard({
  label,
  value,
  helper,
  tone = "aqua",
}: {
  label: string
  value: string
  helper: string
  tone?: "aqua" | "sky" | "coral"
}) {
  const toneMap = {
    aqua: "linear-gradient(90deg, #17CFCF 0%, #53A7FF 100%)",
    sky: "linear-gradient(90deg, #53A7FF 0%, #93C5FD 100%)",
    coral: "linear-gradient(90deg, #FF8D7A 0%, #FFD7C7 100%)",
  } as const

  return (
    <div
      style={{
        background: elevatedBackground,
        boxShadow: elevatedShadow,
        border: `1px solid ${borderColor}`,
        borderRadius: 24,
        padding: 20,
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.9,
          textTransform: "uppercase",
          color: labelText,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 28,
          lineHeight: 1.05,
          fontWeight: 900,
          color: textPrimary,
          marginBottom: 10,
        }}
      >
        {value}
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "rgba(15,23,42,0.06)",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: toneMap[tone],
          }}
        />
      </div>

      <div
        style={{
          fontSize: 13,
          color: textSecondary,
          fontWeight: 700,
          lineHeight: 1.45,
        }}
      >
        {helper}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()

  const [bookingDefaults, setBookingDefaults] = useState({
    reservationHoldTime: "15 Minutes",
    maxGuestsPerOrder: "8 Guests",
    waitlist: "Enabled",
    defaultCheckInMode: "Scan + Confirm",
  })

  const [paymentSettings, setPaymentSettings] = useState({
    payoutAccount: "Connected • Stripe",
    feeHandling: "Pass Fees to Customer",
    tableDepositMode: "Deposit Required",
    refundWindow: "24 Hours Before Event",
  })

  const [securitySettings, setSecuritySettings] = useState({
    requireManagerApproval: true,
    autoExpireSessions: true,
    allowManualOverride: false,
  })

  const bookingOptions = useMemo(
    () => ({
      reservationHoldTime: [
        "10 Minutes",
        "15 Minutes",
        "20 Minutes",
        "30 Minutes",
      ],
      maxGuestsPerOrder: [
        "4 Guests",
        "6 Guests",
        "8 Guests",
        "10 Guests",
        "12 Guests",
      ],
      waitlist: ["Enabled", "Disabled", "Only For Tables"],
      defaultCheckInMode: [
        "Scan Only",
        "Scan + Confirm",
        "Manual Confirm",
        "Host Confirmed Arrival",
      ],
    }),
    []
  )

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: pageBackground,
        color: textPrimary,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1380,
          margin: "0 auto",
          padding: "28px 18px 48px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelText,
                marginBottom: 8,
              }}
            >
              GuestLyst Admin
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.04,
                fontWeight: 900,
                color: textPrimary,
              }}
            >
              Settings
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: textSecondary,
                maxWidth: 760,
              }}
            >
              Control organization details, booking rules, staff access, payment
              preferences, and branding across your GuestLyst admin experience.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <TopButton
              label="Dashboard"
              onClick={() => router.push("/admin/dashboard")}
            />
            <TopButton label="Discard Changes" />
            <TopButton label="Save Settings" active />
          </div>
        </div>

        <div
          className="gf-settings-kpis"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          {/* <StatusCard
            label="Business Profile"
            value="Configured"
            helper="Organization profile, support contact, and venue details are ready."
            tone="aqua"
          />
          <StatusCard
            label="Booking Rules"
            value="Live"
            helper="Reservation defaults and check-in logic are active for tonight."
            tone="sky"
          />
          <StatusCard
            label="Branding"
            value="Miami Theme"
            helper="Guest-facing surfaces are aligned with the current GuestLyst visual style."
            tone="coral"
          /> */}
        </div>

        <div
          className="gf-settings-main"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "start",
            }}
          >
            <SectionCard
              title="Organization"
              subtitle="Core business profile and contact settings"
            >
              <div
                className="gf-form-grid-two"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <InputField label="Business Name" value="LIV Tampa" />
                <InputField label="Support Email" value="support@livtampa.com" />
                <InputField label="Phone Number" value="(813) 555-0199" />
                <SelectField
                  label="Timezone"
                  value="America/New_York"
                  options={[
                    "America/New_York",
                    "America/Chicago",
                    "America/Denver",
                    "America/Los_Angeles",
                  ]}
                  onChange={() => {}}
                />
                <InputField label="City" value="Tampa" />
                <InputField label="State" value="Florida" />
              </div>
            </SectionCard>

            <SectionCard
              title="Booking Defaults"
              subtitle="Control how reservations and check-in behave by default"
            >
              <div
                className="gf-form-grid-two"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <SelectField
                  label="Reservation Hold Time"
                  value={bookingDefaults.reservationHoldTime}
                  options={bookingOptions.reservationHoldTime}
                  onChange={(next) =>
                    setBookingDefaults((prev) => ({
                      ...prev,
                      reservationHoldTime: next,
                    }))
                  }
                />

                <SelectField
                  label="Max Guests Per Order"
                  value={bookingDefaults.maxGuestsPerOrder}
                  options={bookingOptions.maxGuestsPerOrder}
                  onChange={(next) =>
                    setBookingDefaults((prev) => ({
                      ...prev,
                      maxGuestsPerOrder: next,
                    }))
                  }
                />

                <SelectField
                  label="Waitlist"
                  value={bookingDefaults.waitlist}
                  options={bookingOptions.waitlist}
                  onChange={(next) =>
                    setBookingDefaults((prev) => ({
                      ...prev,
                      waitlist: next,
                    }))
                  }
                />

                <SelectField
                  label="Default Check-In Mode"
                  value={bookingDefaults.defaultCheckInMode}
                  options={bookingOptions.defaultCheckInMode}
                  onChange={(next) =>
                    setBookingDefaults((prev) => ({
                      ...prev,
                      defaultCheckInMode: next,
                    }))
                  }
                />
              </div>

              <TextAreaField
                label="Guest Instructions"
                value="Please arrive with your mobile pass ready. Table reservations should check in with the host stand upon arrival."
              />
            </SectionCard>

            <SectionCard
              title="Payments"
              subtitle="Payout settings, fees, and reservation payment behavior"
            >
              <div
                className="gf-form-grid-two"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <SelectField
                label="Payout Account"
                value={paymentSettings.payoutAccount}
                options={[
                    "Connected • Stripe",
                    "Connected • Test Stripe",
                    "Manual Settlement",
                ]}
                onChange={(next) =>
                    setPaymentSettings((prev) => ({
                    ...prev,
                    payoutAccount: next,
                    }))
                }
                />

                <SelectField
                label="Fee Handling"
                value={paymentSettings.feeHandling}
                options={[
                    "Pass Fees to Customer",
                    "Absorb Fees",
                    "Split Fees 50/50",
                ]}
                onChange={(next) =>
                    setPaymentSettings((prev) => ({
                    ...prev,
                    feeHandling: next,
                    }))
                }
                />

                <SelectField
                label="Table Deposit Mode"
                value={paymentSettings.tableDepositMode}
                options={[
                    "Deposit Required",
                    "Full Prepayment",
                    "No Deposit Required",
                ]}
                onChange={(next) =>
                    setPaymentSettings((prev) => ({
                    ...prev,
                    tableDepositMode: next,
                    }))
                }
                />

                <SelectField
                label="Refund Window"
                value={paymentSettings.refundWindow}
                options={[
                    "No Refunds",
                    "24 Hours Before Event",
                    "48 Hours Before Event",
                    "72 Hours Before Event",
                ]}
                onChange={(next) =>
                    setPaymentSettings((prev) => ({
                    ...prev,
                    refundWindow: next,
                    }))
                }
                />
              </div>

              <TextAreaField
                label="Refund / Cancellation Policy"
                value="All pass sales are final unless the event is canceled. Table deposits may be refundable up to 24 hours prior to event start."
              />
            </SectionCard>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "start",
            }}
          >
            <SectionCard
              title="Staff & Security"
              subtitle="Portal access, session handling, and operator controls"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <ToggleRow
                  title="Require manager approval for staff changes"
                  description="Any role updates, assignment changes, or access removals require manager review before going live."
                  enabled={securitySettings.requireManagerApproval}
                  onToggle={() =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      requireManagerApproval: !prev.requireManagerApproval,
                    }))
                  }
                />
                <ToggleRow
                  title="Auto-expire inactive staff sessions"
                  description="Staff members who are inactive for extended periods are automatically signed out for security."
                  enabled={securitySettings.autoExpireSessions}
                  onToggle={() =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      autoExpireSessions: !prev.autoExpireSessions,
                    }))
                  }
                />
                <ToggleRow
                  title="Allow manual override at check-in"
                  description="Permits designated staff to manually validate reservations when scanning fails."
                  enabled={securitySettings.allowManualOverride}
                  onToggle={() =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      allowManualOverride: !prev.allowManualOverride,
                    }))
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Branding"
              subtitle="Visual styling for admin and guest-facing experiences"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <ColorPill label="Miami Aqua" color={aqua} active />
                <ColorPill label="Sky Blue" color={sky} />
                <ColorPill label="Coral Accent" color={coral} />
              </div>

              <TextAreaField
                label="Guest Confirmation Message"
                value="Your reservation is confirmed. Please have your mobile confirmation ready upon arrival for quick check-in."
              />
            </SectionCard>

            <SectionCard
              title="Preview Status"
              subtitle="Quick operational overview for demo and setup purposes"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.76)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: labelText,
                      marginBottom: 6,
                    }}
                  >
                    Active Business
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    LIV Tampa
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: textSecondary,
                      fontWeight: 700,
                    }}
                  >
                    2 live events tonight • door + table operations active
                  </div>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.76)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: labelText,
                      marginBottom: 6,
                    }}
                  >
                    Current Check-In Rule
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    {bookingDefaults.defaultCheckInMode}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: textSecondary,
                      fontWeight: 700,
                    }}
                  >
                    Manual override is{" "}
                    {securitySettings.allowManualOverride ? "enabled" : "disabled"}{" "}
                    for approved staff.
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1160px) {
          .gf-settings-kpis {
            grid-template-columns: 1fr !important;
          }

          .gf-settings-main {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .gf-form-grid-two {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}