"use client"

import { useMemo, useState } from "react"
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
const peach = "#FFD7C7"

type StaffRole = "Manager" | "Check-In Staff" | "Host" | "Door Staff"

type StaffMember = {
  id: string
  name: string
  role: StaffRole
  status: "Active" | "Inactive"
  phone: string
  email: string
  assigned: string[]
  permissions: string[]
  lastActive: string
}

type ActivityItemType = {
  id: string
  title: string
  detail: string
  time: string
}

type StaffFormState = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: StaffRole
  assigned: string[]
}

const initialStaffMembers: StaffMember[] = [
  {
    id: "1",
    name: "Jasmine Cole",
    role: "Manager",
    status: "Active",
    phone: "(813) 555-0182",
    email: "jasmine@guestflow.app",
    assigned: ["LIV Tampa", "Sky Lounge", "VIP Entry"],
    permissions: ["Analytics", "Reservations", "Staff", "Check-In"],
    lastActive: "2 min ago",
  },
  {
    id: "2",
    name: "Marcus Reed",
    role: "Check-In Staff",
    status: "Active",
    phone: "(813) 555-0144",
    email: "marcus@guestflow.app",
    assigned: ["Front Door", "Pass Scanning"],
    permissions: ["Check-In", "Guest List"],
    lastActive: "11 min ago",
  },
  {
    id: "3",
    name: "Ariana Lopez",
    role: "Host",
    status: "Active",
    phone: "(813) 555-0127",
    email: "ariana@guestflow.app",
    assigned: ["Tables", "Floor Seating"],
    permissions: ["Reservations", "Guest List"],
    lastActive: "23 min ago",
  },
  {
    id: "4",
    name: "Devon Hayes",
    role: "Door Staff",
    status: "Inactive",
    phone: "(813) 555-0106",
    email: "devon@guestflow.app",
    assigned: ["Secondary Entry"],
    permissions: ["Check-In"],
    lastActive: "Yesterday",
  },
]

const initialRecentActivity: ActivityItemType[] = [
  {
    id: "a1",
    title: "Marcus Reed checked in 18 guests",
    detail: "Front Door • Saturday Miami Nights",
    time: "7:42 PM",
  },
  {
    id: "a2",
    title: "Jasmine Cole updated staff assignments",
    detail: "VIP Entry + Table Operations",
    time: "7:18 PM",
  },
  {
    id: "a3",
    title: "Ariana Lopez marked 6 tables as arrived",
    detail: "Sky Lounge • Main Floor",
    time: "6:54 PM",
  },
  {
    id: "a4",
    title: "Devon Hayes was set to inactive",
    detail: "Secondary Entry access removed",
    time: "Earlier today",
  },
]

const roleOptions: {
  value: StaffRole
  title: string
  description: string
}[] = [
  {
    value: "Manager",
    title: "Manager",
    description:
      "Oversees event operations, team access, and broader staff coordination.",
  },
  {
    value: "Check-In Staff",
    title: "Check-In Staff",
    description:
      "Handles pass scanning, guest entry validation, and check-in support.",
  },
  {
    value: "Host",
    title: "Host",
    description:
      "Assists with guest arrivals, reservations, tables, and floor seating.",
  },
  {
    value: "Door Staff",
    title: "Door Staff",
    description:
      "Supports controlled entry points and general access flow at the venue.",
  },
]

const assignmentOptions = [
  "LIV Tampa",
  "Sky Lounge",
  "VIP Entry",
  "Front Door",
  "Pass Scanning",
  "Tables",
  "Floor Seating",
  "Secondary Entry",
  "Guest List",
  "Main Floor",
]

const permissionMap: Record<StaffRole, string[]> = {
  Manager: ["Analytics", "Reservations", "Staff", "Check-In"],
  "Check-In Staff": ["Check-In", "Guest List"],
  Host: ["Reservations", "Guest List"],
  "Door Staff": ["Check-In"],
}

const emptyForm: StaffFormState = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "Check-In Staff",
  assigned: [],
}

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

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
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

function RoleBadge({ role }: { role: string }) {
  const tokens: Record<string, { background: string; color: string }> = {
    Manager: {
      background: "rgba(23,207,207,0.14)",
      color: "#0E9F9F",
    },
    "Check-In Staff": {
      background: "rgba(83,167,255,0.14)",
      color: "#2563EB",
    },
    Host: {
      background: "rgba(255,141,122,0.14)",
      color: "#D9644A",
    },
    "Door Staff": {
      background: "rgba(255,215,199,0.7)",
      color: "#B45309",
    },
  }

  const token = tokens[role] ?? {
    background: "rgba(83,167,255,0.14)",
    color: "#2563EB",
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        borderRadius: 999,
        background: token.background,
        color: token.color,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "Active"

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: active ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.16)",
        color: active ? "#059669" : "#64748B",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: active ? "#10B981" : "#94A3B8",
          display: "inline-block",
        }}
      />
      {status}
    </span>
  )
}

function Tag({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "aqua" | "sky" | "coral"
}) {
  const styleMap = {
    neutral: {
      background: "rgba(255,255,255,0.78)",
      color: textSecondary,
      border: `1px solid ${borderColor}`,
    },
    aqua: {
      background: "rgba(23,207,207,0.12)",
      color: "#0E9F9F",
      border: "1px solid rgba(23,207,207,0.18)",
    },
    sky: {
      background: "rgba(83,167,255,0.12)",
      color: "#2563EB",
      border: "1px solid rgba(83,167,255,0.18)",
    },
    coral: {
      background: "rgba(255,141,122,0.14)",
      color: "#D9644A",
      border: "1px solid rgba(255,141,122,0.18)",
    },
  } as const

  const token = styleMap[tone]

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
        border: token.border,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  )
}

function StaffCard({
  member,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  member: StaffMember
  onEdit: (member: StaffMember) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
}) {
  const {
    id,
    name,
    role,
    status,
    phone,
    email,
    assigned,
    permissions,
    lastActive,
  } = member

  const inactive = status === "Inactive"

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 22,
        padding: 18,
        background: "rgba(255,255,255,0.78)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <RoleBadge role={role} />
            <StatusBadge status={status} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(member)}
            style={{
              appearance: "none",
              border: `1px solid ${borderColor}`,
              background: elevatedBackground,
              borderRadius: 999,
              padding: "10px 14px",
              color: textPrimary,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Edit Staff
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(id)}
            style={{
              appearance: "none",
              border: `1px solid ${
                inactive ? "rgba(16,185,129,0.22)" : "rgba(255,141,122,0.22)"
              }`,
              background: inactive
                ? "rgba(16,185,129,0.08)"
                : "rgba(255,141,122,0.10)",
              borderRadius: 999,
              padding: "10px 14px",
              color: inactive ? "#059669" : "#D9644A",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {inactive ? "Activate" : "Deactivate"}
          </button>

          {inactive ? (
            <button
              type="button"
              onClick={() => onDelete(id)}
              style={{
                appearance: "none",
                border: "1px solid rgba(239,68,68,0.22)",
                background: "rgba(239,68,68,0.10)",
                borderRadius: 999,
                padding: "10px 14px",
                color: "#DC2626",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
        className="gf-staff-meta"
      >
        <div
          style={{
            borderRadius: 16,
            padding: 12,
            background: "rgba(255,255,255,0.82)",
            border: `1px solid ${borderColor}`,
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
            Contact
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: textPrimary,
              marginBottom: 4,
              wordBreak: "break-word",
            }}
          >
            {phone}
          </div>
          <div
            style={{
              fontSize: 13,
              color: textSecondary,
              fontWeight: 700,
              wordBreak: "break-word",
            }}
          >
            {email}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: 12,
            background: "rgba(255,255,255,0.82)",
            border: `1px solid ${borderColor}`,
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
            Last Active
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: textPrimary,
              marginBottom: 4,
            }}
          >
            {lastActive}
          </div>
          <div
            style={{
              fontSize: 13,
              color: textSecondary,
              fontWeight: 700,
            }}
          >
            Most recent admin activity
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
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
          Assignments
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {assigned.map((item, index) => (
            <Tag
              key={item}
              label={item}
              tone={index % 3 === 0 ? "aqua" : index % 3 === 1 ? "sky" : "coral"}
            />
          ))}
        </div>
      </div>

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
          Permissions
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {permissions.map((item) => (
            <Tag key={item} label={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivityItem({
  title,
  detail,
  time,
}: {
  title: string
  detail: string
  time: string
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: "rgba(255,255,255,0.76)",
        border: `1px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: textPrimary,
            lineHeight: 1.35,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: labelText,
            whiteSpace: "nowrap",
          }}
        >
          {time}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: textSecondary,
          fontWeight: 700,
          lineHeight: 1.45,
        }}
      >
        {detail}
      </div>
    </div>
  )
}

function StaffModal({
  open,
  mode,
  form,
  onClose,
  onChange,
  onRoleChange,
  onAssignmentToggle,
  onSave,
}: {
  open: boolean
  mode: "add" | "edit"
  form: StaffFormState
  onClose: () => void
  onChange: (field: keyof StaffFormState, value: string | string[]) => void
  onRoleChange: (role: StaffRole) => void
  onAssignmentToggle: (assignment: string) => void
  onSave: () => void
}) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.52)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "92dvh",
          overflowY: "auto",
          borderRadius: 28,
          background: elevatedBackground,
          boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
          border: `1px solid ${borderColor}`,
          padding: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: labelText,
                marginBottom: 8,
              }}
            >
              GuestFlow Admin
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.08,
                fontWeight: 900,
                color: textPrimary,
              }}
            >
              {mode === "add" ? "Add Staff" : "Edit Staff"}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.5,
                color: textSecondary,
                maxWidth: 560,
              }}
            >
              Set staff role, assignment coverage, and contact access details.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              appearance: "none",
              border: `1px solid ${borderColor}`,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 999,
              width: 40,
              height: 40,
              color: textPrimary,
              fontWeight: 900,
              fontSize: 18,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
          className="gf-modal-name-grid"
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: labelText,
                marginBottom: 8,
              }}
            >
              First Name
            </div>
            <input
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              placeholder="Enter first name"
              style={inputStyle}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: labelText,
                marginBottom: 8,
              }}
            >
              Last Name
            </div>
            <input
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              placeholder="Enter last name"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: labelText,
              marginBottom: 8,
            }}
          >
            Email
          </div>
          <input
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Enter email address"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: labelText,
              marginBottom: 10,
            }}
          >
            Role
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {roleOptions.map((option) => {
              const selected = form.role === option.value

              return (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: 18,
                    border: selected
                      ? "1px solid rgba(83,167,255,0.24)"
                      : `1px solid ${borderColor}`,
                    background: selected
                      ? "rgba(83,167,255,0.08)"
                      : "rgba(255,255,255,0.84)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="staff-role"
                    checked={selected}
                    onChange={() => onRoleChange(option.value)}
                    style={{
                      marginTop: 2,
                      accentColor: sky,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {option.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: textSecondary,
                        lineHeight: 1.45,
                      }}
                    >
                      {option.description}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: labelText,
              marginBottom: 10,
            }}
          >
            Assignments
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {assignmentOptions.map((assignment) => {
              const selected = form.assigned.includes(assignment)

              return (
                <button
                  key={assignment}
                  type="button"
                  onClick={() => onAssignmentToggle(assignment)}
                  style={{
                    appearance: "none",
                    border: selected
                      ? "1px solid rgba(83,167,255,0.22)"
                      : `1px solid ${borderColor}`,
                    background: selected
                      ? "rgba(83,167,255,0.10)"
                      : "rgba(255,255,255,0.82)",
                    color: selected ? "#2563EB" : textSecondary,
                    borderRadius: 999,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {assignment}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              appearance: "none",
              border: `1px solid ${borderColor}`,
              background: "rgba(255,255,255,0.84)",
              color: textPrimary,
              borderRadius: 999,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            style={{
              appearance: "none",
              border: "1px solid rgba(83,167,255,0.22)",
              background: `linear-gradient(90deg, ${aqua} 0%, ${sky} 100%)`,
              color: "#FFFFFF",
              borderRadius: 999,
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 14,
  border: `1px solid ${borderColor}`,
  outline: "none",
  fontSize: 14,
  fontWeight: 700,
  color: textPrimary,
  background: "rgba(255,255,255,0.9)",
  boxSizing: "border-box",
}

export default function StaffPage() {
  const router = useRouter()

  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>(initialStaffMembers)
  const [recentActivity, setRecentActivity] =
    useState<ActivityItemType[]>(initialRecentActivity)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [form, setForm] = useState<StaffFormState>(emptyForm)
  const [roleFilter, setRoleFilter] = useState<"All Roles" | "Managers" | "Check-In">(
    "All Roles"
  )

  const activeCount = staffMembers.filter(
    (member) => member.status === "Active"
  ).length
  const inactiveCount = staffMembers.length - activeCount

  const filteredStaffMembers = useMemo(() => {
    if (roleFilter === "Managers") {
      return staffMembers.filter((member) => member.role === "Manager")
    }

    if (roleFilter === "Check-In") {
      return staffMembers.filter((member) => member.role === "Check-In Staff")
    }

    return staffMembers
  }, [roleFilter, staffMembers])

  const roleCounts = useMemo(() => {
    const managers = staffMembers.filter((m) => m.role === "Manager").length
    const checkIn = staffMembers.filter((m) => m.role === "Check-In Staff").length
    const hosts = staffMembers.filter((m) => m.role === "Host").length
    const door = staffMembers.filter((m) => m.role === "Door Staff").length
    const total = staffMembers.length || 1

    return {
      managers,
      checkIn,
      hosts,
      door,
      managersPct: `${(managers / total) * 100}%`,
      checkInPct: `${(checkIn / total) * 100}%`,
      hostsPct: `${(hosts / total) * 100}%`,
      doorPct: `${(door / total) * 100}%`,
    }
  }, [staffMembers])

  function openAddModal() {
    setModalMode("add")
    setForm(emptyForm)
    setModalOpen(true)
  }

  function getFirstLast(name: string) {
    const parts = name.trim().split(/\s+/)
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    }
  }

  function openEditModal(member: StaffMember) {
    const { firstName, lastName } = getFirstLast(member.name)

    setModalMode("edit")
    setForm({
      id: member.id,
      firstName,
      lastName,
      email: member.email,
      role: member.role,
      assigned: member.assigned,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setForm(emptyForm)
  }

  function setFormField(field: keyof StaffFormState, value: string | string[]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function setRole(role: StaffRole) {
    setForm((current) => ({
      ...current,
      role,
    }))
  }

  function toggleAssignment(assignment: string) {
    setForm((current) => {
      const exists = current.assigned.includes(assignment)

      return {
        ...current,
        assigned: exists
          ? current.assigned.filter((item) => item !== assignment)
          : [...current.assigned, assignment],
      }
    })
  }

  function addActivity(title: string, detail: string, time = "Just now") {
    setRecentActivity((current) => [
      {
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title,
        detail,
        time,
      },
      ...current.slice(0, 7),
    ])
  }

  function saveStaff() {
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()

    if (!firstName || !lastName || !email) return

    const fullName = `${firstName} ${lastName}`.trim()
    const permissions = permissionMap[form.role]

    if (modalMode === "add") {
      const newMember: StaffMember = {
        id: `s_${Date.now()}`,
        name: fullName,
        role: form.role,
        status: "Active",
        phone: "(813) 555-0100",
        email,
        assigned: form.assigned,
        permissions,
        lastActive: "Just now",
      }

      setStaffMembers((current) => [newMember, ...current])
      addActivity(
        `${fullName} was added to staff`,
        `${form.role} • ${form.assigned.length ? form.assigned.join(" + ") : "No assignments yet"}`
      )
    } else {
      setStaffMembers((current) =>
        current.map((member) =>
          member.id === form.id
            ? {
                ...member,
                name: fullName,
                email,
                role: form.role,
                assigned: form.assigned,
                permissions,
              }
            : member
        )
      )

      addActivity(
        `${fullName} staff profile was updated`,
        `${form.role} • ${form.assigned.length ? form.assigned.join(" + ") : "No assignments set"}`
      )
    }

    closeModal()
  }

  function toggleStatus(id: string) {
    setStaffMembers((current) =>
      current.map((member) => {
        if (member.id !== id) return member

        const nextStatus = member.status === "Active" ? "Inactive" : "Active"

        addActivity(
          `${member.name} was set to ${nextStatus.toLowerCase()}`,
          `${member.role} • ${
            nextStatus === "Inactive"
              ? "Portal access paused"
              : "Portal access restored"
          }`
        )

        return {
          ...member,
          status: nextStatus,
          lastActive:
            nextStatus === "Inactive" ? member.lastActive : "Just now",
        }
      })
    )
  }

  function deleteStaff(id: string) {
    const target = staffMembers.find((member) => member.id === id)
    if (!target || target.status !== "Inactive") return

    setStaffMembers((current) => current.filter((member) => member.id !== id))
    addActivity(
      `${target.name} was deleted from staff`,
      `${target.role} • Inactive profile removed`
    )
  }

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
              GuestFlow Admin
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
              Staff
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
              Manage team access, assignments, and operational activity across
              check-in, tables, and floor operations.
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
            <TopButton label="Active Staff" active />
            <TopButton label="Add Staff" onClick={openAddModal} />
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
          <KpiCard
            label="Total Staff"
            value={`${staffMembers.length}`}
            helper="Current team members with portal access"
          />
          <KpiCard
            label="Active Tonight"
            value={`${activeCount}`}
            helper="Currently enabled for operations and check-in"
          />
          <KpiCard
            label="Inactive"
            value={`${inactiveCount}`}
            helper="Staff accounts paused or removed from tonight’s shift"
          />
          <KpiCard
            label="Assigned Zones"
            value={`${new Set(staffMembers.flatMap((m) => m.assigned)).size}`}
            helper="Doors, tables, VIP areas, and floor positions in use"
          />
        </div>

        <div
          className="gf-staff-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <SectionCard
            title="Staff Roster"
            subtitle="Role-based access and active assignments"
            rightContent={
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <TopButton
                  label="All Roles"
                  active={roleFilter === "All Roles"}
                  onClick={() => setRoleFilter("All Roles")}
                />
                <TopButton
                  label="Managers"
                  active={roleFilter === "Managers"}
                  onClick={() => setRoleFilter("Managers")}
                />
                <TopButton
                  label="Check-In"
                  active={roleFilter === "Check-In"}
                  onClick={() => setRoleFilter("Check-In")}
                />
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              {filteredStaffMembers.map((member) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  onEdit={openEditModal}
                  onToggleStatus={toggleStatus}
                  onDelete={deleteStaff}
                />
              ))}
            </div>
          </SectionCard>

          <div
            style={{
              display: "grid",
              gap: 18,
              alignContent: "start",
            }}
          >
            <SectionCard
              title="Role Snapshot"
              subtitle="Quick distribution of responsibilities"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      Managers
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      {roleCounts.managers}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: roleCounts.managersPct,
                        height: "100%",
                        background: `linear-gradient(90deg, ${aqua} 0%, ${sky} 100%)`,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      Check-In Staff
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      {roleCounts.checkIn}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: roleCounts.checkInPct,
                        height: "100%",
                        background: `linear-gradient(90deg, ${sky} 0%, ${aqua} 100%)`,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      Hosts / Floor
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      {roleCounts.hosts}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: roleCounts.hostsPct,
                        height: "100%",
                        background: `linear-gradient(90deg, ${coral} 0%, ${peach} 100%)`,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      Door Staff
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: textPrimary,
                      }}
                    >
                      {roleCounts.door}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: roleCounts.doorPct,
                        height: "100%",
                        background: `linear-gradient(90deg, ${peach} 0%, ${coral} 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Recent Activity"
              subtitle="Latest staff actions and updates"
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {recentActivity.map((item) => (
                  <ActivityItem key={item.id} {...item} />
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <StaffModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        onClose={closeModal}
        onChange={setFormField}
        onRoleChange={setRole}
        onAssignmentToggle={toggleAssignment}
        onSave={saveStaff}
      />

      <style jsx>{`
        @media (max-width: 1160px) {
          .gf-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .gf-staff-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 900px) {
          .gf-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .gf-staff-meta {
            grid-template-columns: 1fr !important;
          }

          .gf-modal-name-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}