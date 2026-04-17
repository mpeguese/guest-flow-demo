// app/admin/signup/hybrid/create/business/page.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react"
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

function joinAddressParts(address?: string | null, city?: string | null, state?: string | null) {
  return [address, city, state].filter(Boolean).join(", ")
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  table: "businesses" | "venues",
  baseSlug: string,
  currentId?: string | null
) {
  let attempt = 0

  while (attempt < 10) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`

    let query = supabase.from(table).select("id").eq("slug", candidate).limit(10)

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const conflictingRows = (data || []).filter((row) => row.id !== currentId)

    if (conflictingRows.length === 0) {
      return candidate
    }

    attempt += 1
  }

  return `${baseSlug}-${Date.now()}`
}

type BusinessAdminRow = {
  business_id: string
  is_primary: boolean | null
  role: string | null
}

type BusinessRow = {
  id: string
  name: string | null
  slug: string | null
  business_type: string | null
  contact_email: string | null
  phone: string | null
  description: string | null
}

type VenueRow = {
  id: string
  name: string | null
  slug: string | null
  address: string | null
  city: string | null
  state: string | null
  description: string | null
  business_id: string | null
}

export default function HybridBusinessPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [venueId, setVenueId] = useState<string | null>(null)

  const [businessName, setBusinessName] = useState("")
  const [venueName, setVenueName] = useState("")
  const [businessType, setBusinessType] = useState("other")
  const [contactEmail, setContactEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")

  const [isBootLoading, setIsBootLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingFresh, setIsCreatingFresh] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  const loadExistingBusiness = useCallback(async () => {
    setIsBootLoading(true)
    setErrorMessage("")
    setInfoMessage("")

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
        setErrorMessage("You must be signed in to manage business details.")
        return
      }

      const { data: adminLinks, error: adminLinksError } = await supabase
        .from("business_admins")
        .select("business_id, is_primary, role")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })

      if (adminLinksError) {
        setErrorMessage(`Could not load business links: ${adminLinksError.message}`)
        return
      }

      const primaryLink = (adminLinks as BusinessAdminRow[] | null)?.[0] || null

      if (!primaryLink?.business_id) {
        setBusinessId(null)
        setVenueId(null)
        setBusinessName("")
        setVenueName("")
        setBusinessType("other")
        setContactEmail("")
        setPhone("")
        setAddress("")
        setDescription("")
        setInfoMessage("No business found yet. Enter details below to create your first business.")
        return
      }

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id, name, slug, business_type, contact_email, phone, description")
        .eq("id", primaryLink.business_id)
        .maybeSingle()

      if (businessError) {
        setErrorMessage(`Could not load business: ${businessError.message}`)
        return
      }

      if (!business) {
        setInfoMessage("Your business link exists, but the business record could not be found.")
        return
      }

      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select("id, name, slug, address, city, state, description, business_id")
        .eq("business_id", business.id)
        .order("created_at", { ascending: true })
        .limit(1)

      if (venuesError) {
        setErrorMessage(`Could not load venue: ${venuesError.message}`)
        return
      }

      const firstVenue = ((venues || []) as VenueRow[])[0] || null
      const businessRow = business as BusinessRow

      setBusinessId(businessRow.id)
      setVenueId(firstVenue?.id || null)

      setBusinessName(businessRow.name || "")
      setVenueName(firstVenue?.name || "")
      setBusinessType(businessRow.business_type || "other")
      setContactEmail(businessRow.contact_email || "")
      setPhone(businessRow.phone || "")
      setAddress(joinAddressParts(firstVenue?.address, firstVenue?.city, firstVenue?.state))
      setDescription(firstVenue?.description || businessRow.description || "")

      setInfoMessage(
        firstVenue
          ? "Your saved business details were loaded."
          : "Your business was loaded. Add the first venue details below."
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load existing business data."
      )
    } finally {
      setIsBootLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadExistingBusiness()
  }, [loadExistingBusiness])

  const resetForNewBusiness = () => {
    setBusinessId(null)
    setVenueId(null)
    setBusinessName("")
    setVenueName("")
    setBusinessType("other")
    setContactEmail("")
    setPhone("")
    setAddress("")
    setDescription("")
    setErrorMessage("")
    setInfoMessage("Enter the details for the next business.")
    setIsCreatingFresh(true)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting || isBootLoading) return

    setErrorMessage("")
    setInfoMessage("")

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
        setErrorMessage("You must be signed in to create or update a business.")
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

      const addressParts = splitAddressParts(trimmedAddress)

      let activeBusinessId = businessId
      let activeVenueId = venueId

      if (activeBusinessId) {
        const businessSlug = await ensureUniqueSlug(
          supabase,
          "businesses",
          businessBaseSlug,
          activeBusinessId
        )

        const { error: businessUpdateError } = await supabase
          .from("businesses")
          .update({
            name: trimmedBusinessName,
            slug: businessSlug,
            business_type: businessType,
            contact_email: trimmedContactEmail || null,
            phone: trimmedPhone || null,
            description: trimmedDescription || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeBusinessId)

        if (businessUpdateError) {
          setErrorMessage(`Could not update business: ${businessUpdateError.message}`)
          return
        }
      } else {
        const businessSlug = await ensureUniqueSlug(supabase, "businesses", businessBaseSlug)

        const { data: businessRow, error: businessInsertError } = await supabase
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

        if (businessInsertError) {
          setErrorMessage(`Could not create business: ${businessInsertError.message}`)
          return
        }

        activeBusinessId = businessRow.id
        setBusinessId(activeBusinessId)

        const { error: adminLinkError } = await supabase.from("business_admins").insert({
          business_id: activeBusinessId,
          user_id: user.id,
          role: "owner",
          is_primary: isCreatingFresh ? false : true,
          invited_by: user.id,
        })

        if (adminLinkError) {
          setErrorMessage(`Business created, but admin link failed: ${adminLinkError.message}`)
          return
        }
      }

      if (!activeBusinessId) {
        setErrorMessage("Business could not be created or located.")
        return
      }

      if (activeVenueId) {
        const venueSlug = await ensureUniqueSlug(supabase, "venues", venueBaseSlug, activeVenueId)

        const { error: venueUpdateError } = await supabase
          .from("venues")
          .update({
            name: trimmedVenueName,
            slug: venueSlug,
            address: addressParts.addressLine,
            city: addressParts.city,
            state: addressParts.state,
            description: trimmedDescription || null,
            business_id: activeBusinessId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeVenueId)

        if (venueUpdateError) {
          setErrorMessage(`Could not update venue: ${venueUpdateError.message}`)
          return
        }
      } else {
        const venueSlug = await ensureUniqueSlug(supabase, "venues", venueBaseSlug)

        const { data: venueRow, error: venueInsertError } = await supabase
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
            business_id: activeBusinessId,
          })
          .select("id")
          .single()

        if (venueInsertError) {
          setErrorMessage(`Could not create venue: ${venueInsertError.message}`)
          return
        }

        activeVenueId = venueRow.id
        setVenueId(activeVenueId)
      }

      setIsCreatingFresh(false)

      router.push(
        `/admin/signup/hybrid/create/map?venueId=${activeVenueId}&businessId=${activeBusinessId}`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the business."
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
    topActions: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      marginRight: 10
    },
    backLink: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0f766e",
      textDecoration: "none",
    },
    addBusinessBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 150,
      height: 42,
      borderRadius: 14,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.18)",
      color: "#0f172a",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 900,
      cursor: "pointer",
      padding: "0 14px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
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
    loadingBox: {
      marginTop: 22,
      borderRadius: 18,
      padding: "16px 18px",
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.22)",
      color: "#334155",
      fontSize: 14,
      fontWeight: 700,
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
    messageInfo: {
      marginTop: 18,
      borderRadius: 16,
      padding: "12px 14px",
      background: "rgba(15, 118, 110, 0.07)",
      border: "1px solid rgba(15, 118, 110, 0.14)",
      color: "#0f766e",
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
      cursor: isSubmitting || isBootLoading ? "not-allowed" : "pointer",
      opacity: isSubmitting || isBootLoading ? 0.7 : 1,
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

          <div style={styles.topActions}>
            <button type="button" style={styles.addBusinessBtn} onClick={resetForNewBusiness}>
              + Add Business
            </button>

            <Link href="/admin/signup/hybrid/create" style={styles.backLink}>
              Back to Setup
            </Link>
          </div>
        </div>

        <section style={styles.panel}>
          <div style={styles.badge}>Hybrid · Business</div>
          <div style={styles.title} className="hybrid-business-title">
            List your business
          </div>
          <div style={styles.summary}>
            Create or update your business details, attach the first venue, and continue into the map setup.
          </div>

          {isBootLoading ? (
            <div style={styles.loadingBox}>Loading your saved business details...</div>
          ) : (
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
              {infoMessage ? <div style={styles.messageInfo}>{infoMessage}</div> : null}

              <div style={styles.footer}>
                <Link href="/admin/signup/hybrid/create" style={styles.ghostBtn}>
                  Back
                </Link>

                <button type="submit" style={styles.primaryBtn} disabled={isSubmitting || isBootLoading}>
                  {isSubmitting ? "Saving..." : "Continue to Map"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}