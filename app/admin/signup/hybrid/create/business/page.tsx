// app/admin/signup/hybrid/create/business/page.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { createClient } from "@/app/lib/supabase/client"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function splitAddressParts(rawAddress: string) {
  const parts = rawAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    return {
      addressLine: parts[0],
      city: parts[1],
      state: parts[2].split(" ")[0] || "FL",
    }
  }

  if (parts.length === 2) {
    return {
      addressLine: parts[0],
      city: parts[1],
      state: "FL",
    }
  }

  return {
    addressLine: rawAddress.trim(),
    city: "Tampa",
    state: "FL",
  }
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  table: "businesses" | "venues",
  baseSlug: string
) {
  let attempt = 0

  while (attempt < 10) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`

    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .limit(1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return candidate
    }

    attempt += 1
  }

  return `${baseSlug}-${Date.now()}`
}

export default function HybridBusinessPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [businessName, setBusinessName] = useState("")
  const [venueName, setVenueName] = useState("")
  const [businessType, setBusinessType] = useState("other")
  const [contactEmail, setContactEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMessage("")

    const trimmedBusinessName = businessName.trim()
    const trimmedVenueName = venueName.trim()
    const trimmedContactEmail = contactEmail.trim().toLowerCase()
    const trimmedPhone = phone.trim()
    const trimmedAddress = address.trim()
    const trimmedDescription = description.trim()

    if (!trimmedBusinessName) {
      setErrorMessage("Please enter a business name.")
      return
    }

    if (!trimmedVenueName) {
      setErrorMessage("Please enter a venue name.")
      return
    }

    if (!trimmedAddress) {
      setErrorMessage("Please enter the venue address.")
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setErrorMessage(userError.message)
        return
      }

      if (!user) {
        setErrorMessage("You must be signed in to create a business.")
        return
      }

      const businessBaseSlug = slugify(trimmedBusinessName)
      const venueBaseSlug = slugify(trimmedVenueName)

      if (!businessBaseSlug) {
        setErrorMessage("Please enter a valid business name.")
        return
      }

      if (!venueBaseSlug) {
        setErrorMessage("Please enter a valid venue name.")
        return
      }

      const businessSlug = await ensureUniqueSlug(supabase, "businesses", businessBaseSlug)
      const venueSlug = await ensureUniqueSlug(supabase, "venues", venueBaseSlug)

      const addressParts = splitAddressParts(trimmedAddress)

      const { data: businessRow, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: trimmedBusinessName,
          slug: businessSlug,
          business_type: businessType,
          contact_email: trimmedContactEmail || null,
          phone: trimmedPhone || null,
          description: trimmedDescription || null,
          created_by: user.id,
          active_status: true,
        })
        .select("id")
        .single()

      if (businessError) {
        setErrorMessage(`Could not create business: ${businessError.message}`)
        return
      }

      const { data: adminLinkErrorCheck, error: adminLinkError } = await supabase
        .from("business_admins")
        .insert({
          business_id: businessRow.id,
          user_id: user.id,
          role: "owner",
          is_primary: true,
          invited_by: user.id,
        })
        .select("id")
        .single()

      if (adminLinkError) {
        setErrorMessage(`Business created, but admin link failed: ${adminLinkError.message}`)
        return
      }

      if (!adminLinkErrorCheck) {
        setErrorMessage("Business created, but admin link was not returned.")
        return
      }

      const { data: venueRow, error: venueError } = await supabase
        .from("venues")
        .insert({
          name: trimmedVenueName,
          slug: venueSlug,
          address: addressParts.addressLine,
          city: addressParts.city,
          state: addressParts.state,
          description: trimmedDescription || null,
          active_status: true,
          timezone: "America/New_York",
          created_by: user.id,
          business_id: businessRow.id,
        })
        .select("id")
        .single()

      if (venueError) {
        setErrorMessage(`Business created, but venue failed: ${venueError.message}`)
        return
      }

      router.push(
        `/admin/signup/hybrid/create/map?venueId=${venueRow.id}&businessId=${businessRow.id}`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the business."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #eaecc6, #2bc0e4)",
      padding: "22px 14px 28px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: 760,
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    },
    gfMark: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.08)",
      color: "#0f172a",
      fontSize: 19,
      fontWeight: 900,
      border: "1px solid rgba(255,255,255,0.22)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    panel: {
      borderRadius: 30,
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.24), 0 18px 42px rgba(15,23,42,0.06)",
      padding: 24,
    },
    badge: {
      display: "inline-flex",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(15,118,110,0.05)",
      color: "#0f766e",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      border: "1px solid rgba(15,118,110,0.08)",
    },
    title: {
      marginTop: 18,
      fontSize: 42,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "-1.2px",
      color: "#020617",
    },
    summary: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 1.65,
      color: "#475569",
      maxWidth: 560,
    },
    grid: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    full: {
      gridColumn: "1 / -1",
    },
    label: {
      display: "block",
      marginBottom: 8,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "#64748b",
    },
    input: {
      width: "100%",
      height: 56,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.20)",
      background: "rgba(255,255,255,0.10)",
      padding: "0 16px",
      boxSizing: "border-box",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    select: {
      width: "100%",
      height: 56,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.20)",
      background: "rgba(255,255,255,0.10)",
      padding: "0 16px",
      boxSizing: "border-box",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    textarea: {
      width: "100%",
      minHeight: 110,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.20)",
      background: "rgba(255,255,255,0.10)",
      padding: 16,
      boxSizing: "border-box",
      fontSize: 15,
      fontWeight: 600,
      color: "#0f172a",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    },
    messageError: {
      marginTop: 18,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.18)",
      color: "#b91c1c",
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.5,
    },
    footer: {
      marginTop: 22,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    ghostBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 130,
      height: 52,
      borderRadius: 16,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.18)",
      color: "#0f172a",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 800,
    },
    primaryBtn: {
      minWidth: 180,
      height: 52,
      borderRadius: 16,
      border: "none",
      background: "#0f172a",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      cursor: isSubmitting ? "not-allowed" : "pointer",
      opacity: isSubmitting ? 0.7 : 1,
      boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
    },
  }

  return (
    <div style={styles.page}>
      <style jsx>{`
        @media (max-width: 700px) {
          .hybrid-business-grid {
            grid-template-columns: 1fr !important;
          }

          .hybrid-business-full {
            grid-column: auto !important;
          }

          .hybrid-business-title {
            font-size: 34px !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.gfMark}>GF</div>

          <Link href="/admin/signup/hybrid/create" style={styles.backLink}>
            Back to Hybrid
          </Link>
        </div>

        <section style={styles.panel}>
          <div style={styles.badge}>Hybrid · Business</div>
          <div style={styles.title} className="hybrid-business-title">
            List your business
          </div>
          <div style={styles.summary}>
            Create the business first, then attach the first venue and continue into the map setup.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid} className="hybrid-business-grid">
              <div>
                <label style={styles.label}>Business Name</label>
                <input
                  style={styles.input}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="GuestFlow Hospitality Group"
                />
              </div>

              <div>
                <label style={styles.label}>Venue Name</label>
                <input
                  style={styles.input}
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Skyline Rooftop"
                />
              </div>

              <div>
                <label style={styles.label}>Business Type</label>
                <select
                  style={styles.select}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="other">Other</option>
                  <option value="nightclub">Nightclub</option>
                  <option value="bar">Bar</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="lounge">Lounge</option>
                  <option value="festival">Festival</option>
                  <option value="event_space">Event Space</option>
                  <option value="hospitality_group">Hospitality Group</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Contact Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ops@example.com"
                />
              </div>

              <div>
                <label style={styles.label}>Phone</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                />
              </div>

              <div style={styles.full} className="hybrid-business-full">
                <label style={styles.label}>Venue Address</label>
                <input
                  style={styles.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Tampa, FL 33602"
                />
              </div>

              <div style={styles.full} className="hybrid-business-full">
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes about the business or venue."
                />
              </div>
            </div>

            {errorMessage ? <div style={styles.messageError}>{errorMessage}</div> : null}

            <div style={styles.footer}>
              <Link href="/admin/signup/hybrid/create" style={styles.ghostBtn}>
                Back
              </Link>

              <button type="submit" style={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Continue to Map"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}