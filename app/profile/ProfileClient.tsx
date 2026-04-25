// app/profile/ProfileClient.tsx
"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import MobileShell from "@/app/components/booking/MobileShell"
import { supabase } from "../lib/supabase"

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

const AVATAR_BUCKET = "profile-images"

type ProfileRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

function splitStoredPhone(phone: string | null) {
  if (!phone) {
    return {
      countryCode: "+1",
      phoneNumber: "",
    }
  }

  const matchedCode = COUNTRY_CODES.find((code) => phone.startsWith(code.value))

  if (!matchedCode) {
    return {
      countryCode: "+1",
      phoneNumber: phone,
    }
  }

  return {
    countryCode: matchedCode.value,
    phoneNumber: phone.replace(matchedCode.value, "").trim(),
  }
}

function getFileExtension(file: File) {
  const nameParts = file.name.split(".")
  const extension = nameParts[nameParts.length - 1]?.toLowerCase()

  if (extension && extension.length <= 5) {
    return extension
  }

  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  if (file.type === "image/heic") return "heic"

  return "jpg"
}

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

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1.8 1.8 0 0 0 1.4-.67l.56-.7A1.8 1.8 0 0 1 11.06 4h1.88a1.8 1.8 0 0 1 1.4.63l.56.7A1.8 1.8 0 0 0 16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
      <circle cx="12" cy="12.3" r="3.6" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

export default function ProfileClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)


useEffect(() => {
  let isMounted = true

  async function loadProfile() {
    setLoadingProfile(true)
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      if (!isMounted) return
      setErrorMessage(userError.message)
      setLoadingProfile(false)
      return
    }

    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, avatar_url, role, is_active, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>()

    if (!isMounted) return

    if (profileError) {
      setErrorMessage(profileError.message)
      setLoadingProfile(false)
      return
    }

    const userEmail = user.email || ""

    if (profile) {
      const phoneParts = splitStoredPhone(profile.phone)

      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || userEmail)
      setCountryCode(phoneParts.countryCode)
      setPhoneNumber(phoneParts.phoneNumber)
      setImagePreview(profile.avatar_url || "")
    } else {
      setFirstName((user.user_metadata?.first_name as string) || "")
      setLastName((user.user_metadata?.last_name as string) || "")
      setEmail(userEmail)
      setCountryCode("+1")
      setPhoneNumber("")
      setImagePreview("")
      setIsEditing(true)
    }

    setLoadingProfile(false)
  }

  loadProfile()

  return () => {
    isMounted = false
  }
}, [router])


  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  async function handleSave() {
  setSavingProfile(true)
  setSaveMessage("")
  setErrorMessage("")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    setErrorMessage(userError.message)
    setSavingProfile(false)
    return
  }

  if (!user) {
    router.push("/admin/login")
    return
  }

  const trimmedFirstName = firstName.trim()
  const trimmedLastName = lastName.trim()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedPhone = phoneNumber.trim()
  const fullPhone = trimmedPhone ? `${countryCode} ${trimmedPhone}` : null

  if (!trimmedFirstName) {
    setErrorMessage("First name is required.")
    setSavingProfile(false)
    return
  }

  if (!trimmedLastName) {
    setErrorMessage("Last name is required.")
    setSavingProfile(false)
    return
  }

  if (!trimmedEmail) {
    setErrorMessage("Email is required.")
    setSavingProfile(false)
    return
  }

  let nextAvatarUrl = imagePreview.startsWith("blob:") ? "" : imagePreview

  if (selectedImageFile) {
    const extension = getFileExtension(selectedImageFile)
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, selectedImageFile, {
        cacheControl: "3600",
        upsert: true,
        contentType: selectedImageFile.type,
      })

    if (uploadError) {
      setErrorMessage(uploadError.message)
      setSavingProfile(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath)

    nextAvatarUrl = publicUrlData.publicUrl
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      email: trimmedEmail,
      phone: fullPhone,
      avatar_url: nextAvatarUrl || null,
      marketing_opt_in: marketingOptIn,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    }
  )

  if (profileError) {
    setErrorMessage(profileError.message)
    setSavingProfile(false)
    return
  }

  setEmail(trimmedEmail)
  setImagePreview(nextAvatarUrl)
  setSelectedImageFile(null)
  setSaveMessage("Profile saved successfully.")
  setIsEditing(false)
  setSavingProfile(false)
}

  function handleProfileImageClick() {
    fileInputRef.current?.click()
  }

  // function handleChangePhotoClick() {
  //   fileInputRef.current?.click()
  // }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose a valid image file.")
      return
    }

    const maxSizeInMb = 5
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024

    if (file.size > maxSizeInBytes) {
      setErrorMessage(`Profile photo must be ${maxSizeInMb}MB or smaller.`)
      return
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    const nextUrl = URL.createObjectURL(file)

    setSelectedImageFile(file)
    setImagePreview(nextUrl)
    setSaveMessage("")
    setErrorMessage("")
  }

  const inputBaseStyle: React.CSSProperties = {
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
    opacity: isEditing ? 1 : 0.78,
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
            position: "relative",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

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
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: COLORS.textSoft,
                  maxWidth: 360,
                }}
              >
                Save your details to make reservations and retrieval easier in
                later steps.
              </p>
            </div>

            <div
              style={{
                marginTop: 22,
                padding: "20px 18px",
                borderRadius: 26,
                //border: `1px solid ${COLORS.borderSoft}`,
                //background: "rgba(255,255,255,0.72)",
                //boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                role="button"
                tabIndex={0}
                onClick={handleProfileImageClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleProfileImageClick()
                  }
                }}
                aria-label={imagePreview ? "Change profile photo" : "Upload profile photo"}
                title={imagePreview ? "Change profile photo" : "Upload profile photo"}
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 14,
                  border: `1.5px solid ${
                    imagePreview ? "rgba(14,165,233,0.22)" : COLORS.border
                  }`,
                  background: imagePreview
                    ? `url(${imagePreview}) center / cover no-repeat`
                    : "linear-gradient(180deg, rgba(224,242,254,0.92) 0%, rgba(240,249,255,0.96) 100%)",
                  boxShadow: "0 16px 34px rgba(15,23,42,0.12)",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  color: imagePreview ? "#FFFFFF" : COLORS.primaryHover,
                  padding: 0,
                  outline: "none",
                }}
              >
                {!imagePreview ? (
                  <CameraIcon />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.00) 35%, rgba(15,23,42,0.28) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {imagePreview ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsImageOpen(true)
                    }}
                    aria-label="Expand profile photo"
                    title="Expand profile photo"
                    style={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: "none",
                      background: "rgba(255,255,255,0.92)",
                      color: COLORS.text,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 8px 16px rgba(15,23,42,0.16)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <ExpandIcon />
                  </button>
                ) : null}
              </div>

                {/* <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: COLORS.textMuted,
                  }}
                >
                  Tap the circle to {imagePreview ? "view your photo" : "upload from your device"}.
                </div> */}
              </div>
            </div>

            <div
              style={{
                paddingTop: 18,
                display: "grid",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  {/* <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: COLORS.text,
                    }}
                  >
                    Profile details
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: COLORS.textMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {isEditing
                      ? "Update your details below."
                      : "Tap edit to update your existing profile."}
                  </div> */}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing((prev) => !prev)
                    setSaveMessage("")
                  }}
                  style={{
                    marginTop: 20,
                    minWidth: 108,
                    height: 42,
                    padding: "0 16px",
                    borderRadius: 999,
                    border: `1px solid ${isEditing ? "rgba(14,165,233,0.24)" : COLORS.border}`,
                    background: isEditing
                      ? "rgba(14,165,233,0.10)"
                      : "rgba(255,255,255,0.92)",
                    color: isEditing ? COLORS.primaryHover : COLORS.text,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(15,23,42,0.06)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isEditing ? "Done Editing" : "Edit Profile"}
                </button>
              </div>

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
                    readOnly={!isEditing}
                    style={inputBaseStyle}
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
                    readOnly={!isEditing}
                    style={inputBaseStyle}
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
                  readOnly={!isEditing}
                  style={inputBaseStyle}
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
                    disabled={!isEditing}
                    style={{
                      ...inputBaseStyle,
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      cursor: isEditing ? "pointer" : "default",
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
                    readOnly={!isEditing}
                    style={inputBaseStyle}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 14px",
                  borderRadius: 18,
                  //border: `1px solid ${COLORS.borderSoft}`,
                  //background: "rgba(255,255,255,0.78)",
                  //boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    accentColor: COLORS.primary,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: COLORS.text,
                    }}
                  >
                    Opt in to updates and offers
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: COLORS.textMuted,
                    }}
                  >
                    Receive reservation updates, special offers, and event-related
                    communications.
                  </div>
                </div>
              </label>

              {errorMessage ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid rgba(239,68,68,0.20)`,
                  background: COLORS.dangerSoft,
                  color: "#B91C1C",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            {saveMessage ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
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
                paddingTop: 40,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              }}
            >
              <button
                onClick={handleSave}
                disabled={savingProfile || loadingProfile}
                style={{
                  width: "100%",
                  height: 54,
                  border: "none",
                  borderRadius: 20,
                  background:
                    savingProfile || loadingProfile
                      ? "linear-gradient(180deg, #94A3B8 0%, #64748B 100%)"
                      : `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  cursor: savingProfile || loadingProfile ? "not-allowed" : "pointer",
                  boxShadow: "0 14px 28px rgba(14,165,233,0.24)",
                  opacity: savingProfile || loadingProfile ? 0.78 : 1,
                }}
              >
                {savingProfile ? "Saving..." : "Save & Continue"}
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

          {isImageOpen && imagePreview ? (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setIsImageOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(2,6,23,0.82)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 420,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsImageOpen(false)}
                  aria-label="Close profile photo"
                  title="Close profile photo"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "rgba(15,23,42,0.46)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1,
                    display: "grid",
                    placeItems: "center",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.24)",
                  }}
                >
                  ×
                </button>

                <img
                  src={imagePreview}
                  alt="Profile preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: 24,
                    objectFit: "cover",
                    maxHeight: "78vh",
                    boxShadow: "0 28px 70px rgba(0,0,0,0.36)",
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MobileShell>
  )
}