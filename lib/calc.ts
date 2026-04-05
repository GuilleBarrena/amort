import type { Entry, AmortCalc } from './types'

export function diffMonths(from: Date, to: Date): number {
  const y = to.getFullYear() - from.getFullYear()
  const m = to.getMonth() - from.getMonth()
  const d = to.getDate() - from.getDate()
  return Math.max(0, y * 12 + m + d / 30)
}

export function calcAmort(entry: Entry): AmortCalc {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const purchase = new Date(entry.date_str! + 'T00:00:00')
  const months = diffMonths(purchase, today)
  const amortized = Math.min(months * entry.monthly!, entry.price)
  const pct = (amortized / entry.price) * 100
  const virtualPrice = Math.max(0, entry.price - amortized)
  const monthsNeeded = entry.price / entry.monthly!
  const targetDate = new Date(purchase)
  targetDate.setMonth(targetDate.getMonth() + Math.floor(monthsNeeded))
  targetDate.setDate(targetDate.getDate() + Math.round((monthsNeeded % 1) * 30))
  return { months, amortized, pct, virtualPrice, targetDate, alreadyDone: amortized >= entry.price }
}

export function monthlyFromSub(entry: Entry): number {
  return entry.period === 'yearly' ? entry.price / 12 : entry.price
}

export function fmt(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
