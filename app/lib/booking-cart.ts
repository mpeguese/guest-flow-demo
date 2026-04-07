// app/lib/booking-cart.ts
"use client"

import { useEffect, useMemo, useState } from "react"

export type BookingCartItemType = "zone" | "pass"

export type BookingCartItem = {
  id: string

  // enhanced typing for mixed carts
  itemType?: BookingCartItemType
  productId?: string

  // preserved for existing zone logic / compatibility
  zoneId: string

  zoneName: string
  section: string
  date: string
  partySize: string
  session: string
  price: number
  imageSrc?: string

  reservationId?: string
  holdToken?: string
  expiresAt?: string
}

const STORAGE_KEY = "gf-booking-cart-v1"
const CART_EVENT = "gf-booking-cart-updated"

function isBrowser() {
  return typeof window !== "undefined"
}

function normalizeCartItem(item: BookingCartItem): BookingCartItem {
  const itemType =
    item.itemType ||
    (item.section === "Guest Entry Pass" || item.session === "entry" ? "pass" : "zone")

  const productId =
    item.productId ||
    (itemType === "pass" ? item.zoneId.split("-").slice(0, -1).join("-") || item.zoneId : item.zoneId)

  return {
    ...item,
    itemType,
    productId,
  }
}

function readCart(): BookingCartItem[] {
  if (!isBrowser()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => normalizeCartItem(item as BookingCartItem))
  } catch {
    return []
  }
}

function writeCart(items: BookingCartItem[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_EVENT))
}

function itemKey(
  item: Pick<BookingCartItem, "itemType" | "productId" | "zoneId" | "date" | "session" | "id">
) {
  if (item.itemType === "pass") {
    return item.id
  }

  return `${item.zoneId}__${item.date}__${item.session}`
}

export function addCartItem(item: BookingCartItem) {
  const normalizedItem = normalizeCartItem(item)
  const current = readCart()
  const exists = current.some(
    (existing) => itemKey(existing) === itemKey(normalizedItem)
  )

  if (exists) {
    return { added: false, items: current }
  }

  const next = [...current, normalizedItem]
  writeCart(next)
  return { added: true, items: next }
}

export function removeCartItem(id: string) {
  const next = readCart().filter((item) => item.id !== id)
  writeCart(next)
  return next
}

export function clearCartItems() {
  writeCart([])
}

export function useBookingCart() {
  const [items, setItems] = useState<BookingCartItem[]>([])

  useEffect(() => {
    setItems(readCart())

    const sync = () => setItems(readCart())

    window.addEventListener("storage", sync)
    window.addEventListener(CART_EVENT, sync)

    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(CART_EVENT, sync)
    }
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  )

  return {
    items,
    cartCount: items.length,
    subtotal,
    addItem: (item: BookingCartItem) => {
      const result = addCartItem(item)
      setItems(result.items)
      return result
    },
    removeItem: (id: string) => {
      const next = removeCartItem(id)
      setItems(next)
      return next
    },
    clearCart: () => {
      clearCartItems()
      setItems([])
    },
  }
}