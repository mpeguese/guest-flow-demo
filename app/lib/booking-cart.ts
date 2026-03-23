// app/lib/booking-cart.ts
"use client"

import { useEffect, useMemo, useState } from "react"

export type BookingCartItem = {
  id: string
  zoneId: string
  zoneName: string
  section: string
  date: string
  partySize: string
  session: string
  price: number
  imageSrc?: string
}

const STORAGE_KEY = "vv-booking-cart-v1"
const CART_EVENT = "vv-booking-cart-updated"

function isBrowser() {
  return typeof window !== "undefined"
}

function readCart(): BookingCartItem[] {
  if (!isBrowser()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(items: BookingCartItem[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_EVENT))
}

function itemKey(item: Pick<BookingCartItem, "zoneId" | "date" | "session">) {
  return `${item.zoneId}__${item.date}__${item.session}`
}

export function addCartItem(item: BookingCartItem) {
  const current = readCart()
  const exists = current.some(
    (existing) => itemKey(existing) === itemKey(item)
  )

  if (exists) {
    return { added: false, items: current }
  }

  const next = [...current, item]
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