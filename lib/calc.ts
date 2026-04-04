import type { AmortItem, AmortCalc, SubItem } from './types'

export function diffMonths(from: Date, to: Date): number {
  const y = to.getFullYear() - from.getFullYear()
  const m = to.getMonth() - from.getMonth()
  const d = to.getDate() - from.getDate()
  return Math.max(0, y * 12 + m + d / 30)
}

export function calcAmort(item: AmortItem): AmortCalc {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const purchase = new Date(item.date_str + 'T00:00:00')
  const months = diffMonths(purchase, today)
  const amortized = Math.min(months * item.monthly, item.price)
  const pct = (amortized / item.price) * 100
  const virtualPrice = Math.max(0, item.price - amortized)
  const monthsNeeded = item.price / item.monthly
  const targetDate = new Date(purchase)
  targetDate.setMonth(targetDate.getMonth() + Math.floor(monthsNeeded))
  targetDate.setDate(targetDate.getDate() + Math.round((monthsNeeded % 1) * 30))
  return { months, amortized, pct, virtualPrice, targetDate, alreadyDone: amortized >= item.price }
}

export function monthlyFromSub(sub: SubItem): number {
  return sub.period === 'yearly' ? sub.price / 12 : sub.price
}

export function fmt(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
