// app/lib/book-pass-data.ts
export type PassProduct = {
  id: string
  title: string
  subtitle: string
  price: number
  benefits: string[]
  imageSrc: string
  active: boolean
}

export const passProducts: PassProduct[] = [
  {
    id: "free-rsvp",
    title: "Free RSVP",
    subtitle: "Reserve your entry in advance",
    price: 0,
    benefits: [
      "Priority reservation list",
      "Mobile check-in ready",
      "Faster guest entry",
    ],
    imageSrc: "/images/tangra-interior.jpg",
    active: true,
  },
  {
    id: "general-entry",
    title: "General Entry",
    subtitle: "Pre-purchase and skip the line",
    price: 25,
    benefits: [
      "Skip-the-line access",
      "Guaranteed entry window",
      "Fast QR check-in",
    ],
    imageSrc: "/images/table-preview.jpg",
    active: true,
  },
  {
    id: "vip-entry",
    title: "V.I.P. Entry",
    subtitle: "Complimentary drink included",
    price: 50,
    benefits: [
      "V.I.P. access",
      "Guaranteed faster entry",
      "Fast QR check-in",
    ],
    imageSrc: "/images/table-preview.jpg",
    active: true,
  },
]

export function getPassProductById(id: string) {
  return passProducts.find((pass) => pass.id === id && pass.active)
}