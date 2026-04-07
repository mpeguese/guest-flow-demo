// app/lib/booking-data.ts
export type VenueZoneType =
  | "table"
  | "bed"
  | "cabana"
  | "booth"
  | "sofa"
  | "vip"

export type ZoneStatus = "available" | "limited" | "booked"

export type VenueZone = {
  id: string
  name: string
  type: VenueZoneType
  //floor: "Rooftop"
  floor: string
  section: string
  capacityMin: number
  capacityMax: number
  price: number
  minSpend: number
  description: string
  perks?: string[]
  svgId: string
}

type ZoneAvailability = {
  zoneId: string
  status: ZoneStatus
}

const rooftopZones: VenueZone[] = [
  {
    id: "R1",
    name: "R1 Corner Lounge",
    type: "vip",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 4,
    capacityMax: 6,
    price: 295,
    minSpend: 700,
    description: "Premium corner lounge with a strong private feel and elevated rooftop energy.",
    perks: ["Corner placement", "Premium visibility", "Best for celebrations"],
    svgId: "R1",
  },
  {
    id: "R2",
    name: "R2 Bar Side Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 2,
    capacityMax: 6,
    price: 250,
    minSpend: 420,
    description: "Compact rooftop table positioned near the bar.",
    perks: ["Near bar", "Quick access", "Smaller-group fit"],
    svgId: "R2",
  },
  {
    id: "R3",
    name: "R3 Central Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 2,
    capacityMax: 6,
    price: 190,
    minSpend: 435,
    description: "Balanced rooftop table with easy circulation and strong visibility.",
    perks: ["Balanced location", "Clean sightline"],
    svgId: "R3",
  },
  {
    id: "R4",
    name: "R4 Exit Side Lounge",
    type: "sofa",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 3,
    capacityMax: 5,
    price: 215,
    minSpend: 500,
    description: "Lounge-style rooftop seating with a relaxed setup along the perimeter.",
    perks: ["Softer seating", "Open-air feel"],
    svgId: "R4",
  },
  {
    id: "R5",
    name: "R5 Buddah Corner Premium Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 3,
    capacityMax: 5,
    price: 225,
    minSpend: 525,
    description: "Popular right-side table with strong energy and direct view into the action.",
    perks: ["Strong view", "Great for groups"],
    svgId: "R5",
  },
  {
    id: "R6",
    name: "R6 Buddah VIP",
    type: "vip",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 4,
    capacityMax: 8,
    price: 310,
    minSpend: 740,
    description: "High-demand lower-right VIP placement with premium edge positioning.",
    perks: ["VIP feel", "Premium edge location", "Celebration-ready"],
    svgId: "R6",
  },
  {
    id: "R7",
    name: "R7 DJ View Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 3,
    capacityMax: 5,
    price: 240,
    minSpend: 560,
    description: "Strong table with direct visual energy from the DJ-side experience.",
    perks: ["DJ-facing energy", "Popular lower deck"],
    svgId: "R7",
  },
  {
    id: "R8",
    name: "R8 DJ Lounge",
    type: "sofa",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 3,
    capacityMax: 5,
    price: 210,
    minSpend: 490,
    description: "Comfortable lounge seating along the lower-left side of the rooftop.",
    perks: ["Relaxed setup", "Conversation-friendly"],
    svgId: "R8",
  },
  {
    id: "R9",
    name: "R9 Side Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 2,
    capacityMax: 6,
    price: 175,
    minSpend: 400,
    description: "Value-forward west-side rooftop table with good movement and easy entry.",
    perks: ["Value option", "Easy access"],
    svgId: "R9",
  },
  {
    id: "R10",
    name: "R10 Palm Side Table",
    type: "table",
    floor: "Rooftop",
    section: "Outer Edge",
    capacityMin: 2,
    capacityMax: 4,
    price: 180,
    minSpend: 410,
    description: "Compact rooftop table tucked near the upper-left palm tree and perimeter.",
    perks: ["Distinct setting", "Good for smaller groups"],
    svgId: "R10",
  },
  {
    id: "M1",
    name: "Center Lounge One",
    type: "sofa",
    floor: "Rooftop",
    section: "Middle",
    capacityMin: 2,
    capacityMax: 4,
    price: 255,
    minSpend: 600,
    description: "Center lounge seating with a social, visible, high-energy rooftop placement.",
    perks: ["Central energy", "Group-friendly"],
    svgId: "M1",
  },
  {
    id: "M2",
    name: "Center Lounge Two",
    type: "sofa",
    floor: "Rooftop",
    section: "Middle",
    capacityMin: 2,
    capacityMax: 4,
    price: 255,
    minSpend: 600,
    description: "Center lounge placement ideal for guests who want the rooftop experience all around them.",
    perks: ["Central placement", "Great for birthdays"],
    svgId: "M2",
  },
  {
    id: "M3",
    name: "Center Feature Table",
    type: "table",
    floor: "Rooftop",
    section: "Middle",
    capacityMin: 2,
    capacityMax: 4,
    price: 235,
    minSpend: 550,
    description: "A strong center-feature table with balanced access and premium visibility.",
    perks: ["Center feature", "Balanced flow"],
    svgId: "M3",
  },
]

export const venueZones: VenueZone[] = rooftopZones

const explicitAvailability: Record<string, ZoneAvailability[]> = {
  "2026-03-27": [
    { zoneId: "R1", status: "booked" },
    { zoneId: "R2", status: "available" },
    { zoneId: "R3", status: "limited" },
    { zoneId: "R4", status: "available" },
    { zoneId: "R5", status: "limited" },
    { zoneId: "R6", status: "booked" },
    { zoneId: "R7", status: "available" },
    { zoneId: "R8", status: "available" },
    { zoneId: "R9", status: "limited" },
    { zoneId: "R10", status: "available" },
    { zoneId: "M1", status: "booked" },
    { zoneId: "M2", status: "limited" },
    { zoneId: "M3", status: "available" },
  ],
  "2026-03-28": [
    { zoneId: "R1", status: "limited" },
    { zoneId: "R2", status: "available" },
    { zoneId: "R3", status: "available" },
    { zoneId: "R4", status: "booked" },
    { zoneId: "R5", status: "limited" },
    { zoneId: "R6", status: "available" },
    { zoneId: "R7", status: "available" },
    { zoneId: "R8", status: "booked" },
    { zoneId: "R9", status: "available" },
    { zoneId: "R10", status: "limited" },
    { zoneId: "M1", status: "available" },
    { zoneId: "M2", status: "booked" },
    { zoneId: "M3", status: "limited" },
  ],
  "2026-03-29": [
    { zoneId: "R1", status: "available" },
    { zoneId: "R2", status: "limited" },
    { zoneId: "R3", status: "booked" },
    { zoneId: "R4", status: "available" },
    { zoneId: "R5", status: "available" },
    { zoneId: "R6", status: "limited" },
    { zoneId: "R7", status: "booked" },
    { zoneId: "R8", status: "available" },
    { zoneId: "R9", status: "available" },
    { zoneId: "R10", status: "limited" },
    { zoneId: "M1", status: "available" },
    { zoneId: "M2", status: "limited" },
    { zoneId: "M3", status: "booked" },
  ],
}

function simpleHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getZoneStatus(date: string, zoneId: string): ZoneStatus {
  if (!date) return "available"

  const explicit = explicitAvailability[date]?.find((item) => item.zoneId === zoneId)
  if (explicit) return explicit.status

  const hash = simpleHash(`${date}-${zoneId}`)
  const roll = hash % 100

  if (roll < 68) return "available"
  if (roll < 88) return "limited"
  return "booked"
}