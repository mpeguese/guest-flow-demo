// app/admin/analytics/page.tsx
"use client"
import { usePathname, useRouter } from "next/navigation"

type KpiCardProps = {
  label: string
  value: string
  delta: string
  deltaPositive?: boolean
}

type LegendItemProps = {
  label: string
  value: string
  color: string
}

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
const peach = "#FFD7C7"
const softTrack = "rgba(15,23,42,0.08)"

const salesByDay = [
  { label: "Mon", value: 4200 },
  { label: "Tue", value: 3800 },
  { label: "Wed", value: 5100 },
  { label: "Thu", value: 6900 },
  { label: "Fri", value: 11200 },
  { label: "Sat", value: 14820 },
  { label: "Sun", value: 7600 },
]

const productMix = [
  { label: "Passes", value: 52, color: aqua },
  { label: "Tables", value: 31, color: coral },
  { label: "Add-ons", value: 17, color: sky },
]

const topPerformers = [
  { label: "VIP Skip-the-Line", value: 214, percent: 100 },
  { label: "Sky Lounge Table", value: 148, percent: 69 },
  { label: "General Admission", value: 129, percent: 60 },
  { label: "Cabana Deposit", value: 62, percent: 29 },
]

const tableRows = [
  {
    name: "Saturday Miami Nights",
    sold: 328,
    scanned: 284,
    revenue: "$6,420",
    rate: "87%",
    status: "Strong",
  },
  {
    name: "Sunday Rooftop Social",
    sold: 172,
    scanned: 120,
    revenue: "$3,180",
    rate: "70%",
    status: "Solid",
  },
  {
    name: "Friday After Dark",
    sold: 201,
    scanned: 144,
    revenue: "$4,080",
    rate: "72%",
    status: "Watch",
  },
  {
    name: "Latin Night Experience",
    sold: 122,
    scanned: 94,
    revenue: "$1,140",
    rate: "77%",
    status: "Strong",
  },
]

function KpiCard({
  label,
  value,
  delta,
  deltaPositive = true,
}: KpiCardProps) {
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
          fontSize: 32,
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
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 9px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.78)",
          border: `1px solid ${borderColor}`,
          color: deltaPositive ? "#0F9F87" : "#D9644A",
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.2,
          flexWrap: "wrap",
          maxWidth: "100%",
        }}
      >
        <span style={{ flexShrink: 0 }}>{deltaPositive ? "↑" : "↓"}</span>
        <span>{delta}</span>
      </div>
    </div>
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

function LegendItem({ label, value, color }: LegendItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "10px 12px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.72)",
        border: `1px solid ${borderColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: color,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 14,
            color: textSecondary,
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 14,
          color: textPrimary,
          fontWeight: 900,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function DonutCard({
  title,
  centerLabel,
  percent,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  tertiaryValue,
  tertiaryLabel,
  primaryGradientId,
  secondaryGradientId,
  primaryStart,
  primaryEnd,
  secondaryStart,
  secondaryEnd,
  primaryColor,
  secondaryColor,
  quickRead,
}: {
  title: string
  centerLabel: string
  percent: number
  primaryValue: number
  primaryLabel: string
  secondaryValue: number
  secondaryLabel: string
  tertiaryValue: number
  tertiaryLabel: string
  primaryGradientId: string
  secondaryGradientId: string
  primaryStart: string
  primaryEnd: string
  secondaryStart: string
  secondaryEnd: string
  primaryColor: string
  secondaryColor: string
  quickRead: string
}) {
  const radius = 72
  const stroke = 18
  const circumference = 2 * Math.PI * radius
  const primaryLength = (percent / 100) * circumference
  const secondaryLength = circumference - primaryLength

  return (
    <SectionCard title={title}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 300px) 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 260,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 220,
              height: 220,
            }}
          >
            <svg width="220" height="220" viewBox="0 0 220 220">
              <defs>
                <linearGradient id={primaryGradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={primaryStart} />
                  <stop offset="100%" stopColor={primaryEnd} />
                </linearGradient>
                <linearGradient id={secondaryGradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={secondaryStart} />
                  <stop offset="100%" stopColor={secondaryEnd} />
                </linearGradient>
              </defs>

              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(15,23,42,0.06)"
                strokeWidth={stroke}
              />

              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={`url(#${primaryGradientId})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
                strokeDasharray={`${primaryLength} ${circumference - primaryLength}`}
              />

              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={`url(#${secondaryGradientId})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                transform={`rotate(${(primaryLength / circumference) * 360 - 90} 110 110)`}
                strokeDasharray={`${secondaryLength} ${circumference - secondaryLength}`}
              />
            </svg>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: textSecondary,
                  marginBottom: 4,
                }}
              >
                {centerLabel}
              </div>
              <div
                style={{
                  fontSize: 38,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: textPrimary,
                  marginBottom: 6,
                }}
              >
                {percent}%
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: textSecondary,
                  fontWeight: 700,
                }}
              >
                Converted
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <LegendItem label={primaryLabel} value={`${primaryValue}`} color={primaryColor} />
          <LegendItem label={secondaryLabel} value={`${secondaryValue}`} color={secondaryColor} />
          <LegendItem label={tertiaryLabel} value={`${tertiaryValue}`} color={sky} />

          <div
            style={{
              marginTop: 6,
              padding: 14,
              borderRadius: 18,
              background: "rgba(255,255,255,0.76)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: labelText,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Quick Read
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: textPrimary,
                fontWeight: 600,
              }}
            >
              {quickRead}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function SalesBars() {
  const maxValue = Math.max(...salesByDay.map((d) => d.value))

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        height: 280,
        paddingTop: 10,
      }}
    >
      {salesByDay.map((item, index) => {
        const heightPct = (item.value / maxValue) * 100
        const isPeak = item.value === maxValue

        return (
          <div
            key={item.label}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: textSecondary,
                whiteSpace: "nowrap",
              }}
            >
              ${Math.round(item.value / 1000)}k
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: 46,
                height: `${Math.max(heightPct, 16)}%`,
                borderRadius: 20,
                background: isPeak
                  ? "linear-gradient(180deg, #FFB59E 0%, #FF8D7A 100%)"
                  : index % 2 === 0
                  ? "linear-gradient(180deg, #7CE7EA 0%, #17CFCF 100%)"
                  : "linear-gradient(180deg, #89C3FF 0%, #53A7FF 100%)",
                boxShadow: "0 10px 24px rgba(83,167,255,0.18)",
              }}
            />

            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: textPrimary,
              }}
            >
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProductMixBars() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          overflow: "hidden",
          borderRadius: 999,
          height: 20,
          marginBottom: 16,
          background: "rgba(15,23,42,0.05)",
        }}
      >
        {productMix.map((item) => (
          <div
            key={item.label}
            style={{
              width: `${item.value}%`,
              background: item.color,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        {productMix.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.72)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: item.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: textPrimary,
                  fontWeight: 800,
                }}
              >
                {item.label}
              </span>
            </div>

            <span
              style={{
                fontSize: 14,
                color: textSecondary,
                fontWeight: 800,
              }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerformersList() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {topPerformers.map((item, index) => (
        <div
          key={item.label}
          style={{
            padding: 14,
            borderRadius: 18,
            border: `1px solid ${borderColor}`,
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: textPrimary,
                  marginBottom: 3,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: textSecondary,
                  fontWeight: 700,
                }}
              >
                {item.value} sold
              </div>
            </div>

            <div
              style={{
                minWidth: 34,
                height: 34,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  index === 0
                    ? "rgba(23,207,207,0.14)"
                    : index === 1
                    ? "rgba(255,141,122,0.14)"
                    : "rgba(83,167,255,0.14)",
                color: index === 0 ? aqua : index === 1 ? coral : sky,
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              #{index + 1}
            </div>
          </div>

          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: softTrack,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${item.percent}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  index % 2 === 0
                    ? "linear-gradient(90deg, #17CFCF 0%, #53A7FF 100%)"
                    : "linear-gradient(90deg, #FF8D7A 0%, #FFD7C7 100%)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map = {
    Strong: {
      background: "rgba(16,185,129,0.12)",
      color: "#059669",
    },
    Solid: {
      background: "rgba(83,167,255,0.12)",
      color: "#2563EB",
    },
    Watch: {
      background: "rgba(255,141,122,0.14)",
      color: "#D9644A",
    },
  } as const

  const token = map[status as keyof typeof map] ?? map.Solid

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 10px",
        borderRadius: 999,
        background: token.background,
        color: token.color,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {status}
    </span>
  )
}

function FilterButton({ label, active = false, onClick, }: { label: string; active?: boolean; onClick?: () => void }) {
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

export default function SalesAnalyticsPage() {
    const router = useRouter()
    const pathname = usePathname()
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
              Sales Analytics
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
              Track sales, attendance, and performance with quick visual reads
              built for busy operators.
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
            <FilterButton label="Dashboard" onClick={() => router.push("/admin/dashboard")}/>
            <FilterButton label="Last 7 Days" />
            <FilterButton label="Last 30 Days" active />
            <FilterButton label="Export" />
          </div>
        </div>

        <div
          className="gf-kpi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <KpiCard label="Gross Revenue" value="$14,820" delta="+12.4% WoW" />
          <KpiCard label="Reservations Sold" value="823" delta="+8.1% WoW" />
          <KpiCard label="Guests Scanned" value="642" delta="+10.7% WoW" />
          <KpiCard label="Check-In Rate" value="78%" delta="+4.3% WoW" />
        </div>

        <div
          className="gf-conversion-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <DonutCard
            title="Ticket Conversion"
            centerLabel="Tickets"
            percent={78}
            primaryValue={823}
            primaryLabel="Sold"
            secondaryValue={642}
            secondaryLabel="Scanned"
            tertiaryValue={181}
            tertiaryLabel="Remaining"
            primaryGradientId="ticketGradientPrimary"
            secondaryGradientId="ticketGradientSecondary"
            primaryStart={aqua}
            primaryEnd={sky}
            secondaryStart={coral}
            secondaryEnd={peach}
            primaryColor={aqua}
            secondaryColor={coral}
            quickRead="Passes are converting well into actual attendance, with most purchased tickets being scanned successfully at entry."
          />

          <DonutCard
            title="Table Reservation Conversion"
            centerLabel="Tables"
            percent={74}
            primaryValue={42}
            primaryLabel="Reserved"
            secondaryValue={31}
            secondaryLabel="Arrived"
            tertiaryValue={11}
            tertiaryLabel="Pending"
            primaryGradientId="tableGradientPrimary"
            secondaryGradientId="tableGradientSecondary"
            primaryStart={coral}
            primaryEnd={peach}
            secondaryStart={aqua}
            secondaryEnd={sky}
            primaryColor={coral}
            secondaryColor={aqua}
            quickRead="Table activity is healthy tonight. Most reserved tables have arrived, with a smaller group still outstanding before peak hours."
          />
        </div>

        <div
          className="gf-lower-chart-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <SectionCard
            title="Sales by Day"
            subtitle="Quick visual read of booking volume"
          >
            <SalesBars />
          </SectionCard>

          <SectionCard
            title="Product Mix"
            subtitle="Where your bookings are coming from"
          >
            <ProductMixBars />
          </SectionCard>
        </div>

        <div
          className="gf-performer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <SectionCard
            title="Top Performing Items"
            subtitle="Best sellers across your current date range"
          >
            <PerformersList />
          </SectionCard>
        </div>

        <SectionCard
          title="Event Performance"
          subtitle="Detailed view by event and date"
          rightContent={
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <FilterButton label="All Events" active />
              <FilterButton label="Paid Only" />
            </div>
          }
        >
          <div
            style={{
              overflowX: "auto",
              borderRadius: 20,
              border: `1px solid ${borderColor}`,
              background: "rgba(255,255,255,0.74)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 860,
              }}
            >
              <thead>
                <tr>
                  {["Event", "Sold", "Scanned", "Revenue", "Check-In %", "Status"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "16px 18px",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.9,
                          color: labelText,
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.name}>
                    <td
                      style={{
                        padding: "18px",
                        fontSize: 15,
                        fontWeight: 900,
                        color: textPrimary,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "18px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: textPrimary,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {row.sold}
                    </td>
                    <td
                      style={{
                        padding: "18px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: textPrimary,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {row.scanned}
                    </td>
                    <td
                      style={{
                        padding: "18px",
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {row.revenue}
                    </td>
                    <td
                      style={{
                        padding: "18px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: textPrimary,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {row.rate}
                    </td>
                    <td
                      style={{
                        padding: "18px",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <style jsx>{`
        @media (max-width: 1160px) {
          .gf-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .gf-conversion-grid,
          .gf-lower-chart-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 900px) {
          .gf-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 820px) {
          .gf-conversion-grid :global(div[style*="minmax(220px, 300px) 1fr"]) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}