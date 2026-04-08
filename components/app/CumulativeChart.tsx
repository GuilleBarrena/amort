'use client'

// Pure SVG cumulative spending/income chart.
// For amort: shows cumulative monthly amounts paid, with a horizontal line at the total price (amortization point).
// For sub/income: shows cumulative cost/income from start to today.

interface Props {
  startDate: Date        // when the entry started
  monthly: number        // monthly amount
  today: Date
  amortPrice?: number    // if set, draw a horizontal line at this value (amort point)
  color: string          // stroke color for the line
}

const W = 300
const H = 120
const PAD_L = 40
const PAD_T = 10
const PAD_R = 8
const PAD_B = 28
const CW = W - PAD_L - PAD_R
const CH = H - PAD_T - PAD_B

function niceMax(v: number): number {
  if (v <= 0) return 100
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return nice * mag
}

function fmtEur(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k'
  return v.toFixed(0)
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
    + (b.getDate() - a.getDate()) / 30
}

function addMonths(d: Date, m: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + m)
  return r
}

export function CumulativeChart({ startDate, monthly, today, amortPrice, color }: Props) {
  if (monthly <= 0) return null

  // Determine x-axis end: amort target date + 10% buffer, or today + 12m if no amort
  const monthsToAmort = amortPrice ? amortPrice / monthly : null
  const endDate = monthsToAmort
    ? addMonths(startDate, Math.ceil(monthsToAmort * 1.1 + 1))
    : addMonths(today, 6)

  const totalMonths = Math.max(monthsBetween(startDate, endDate), 1)
  const maxValue = niceMax(monthly * totalMonths)

  function toX(date: Date): number {
    const m = monthsBetween(startDate, date)
    return PAD_L + (m / totalMonths) * CW
  }
  function toY(value: number): number {
    return PAD_T + CH - (value / maxValue) * CH
  }

  // Build line path: straight line from (startDate,0) to (endDate, monthly*totalMonths)
  const x0 = PAD_L
  const y0 = toY(0)
  const x1 = PAD_L + CW
  const y1 = toY(monthly * totalMonths)

  // Today's position on the line
  const todayMonths = Math.max(0, monthsBetween(startDate, today))
  const todayValue = Math.min(monthly * todayMonths, monthly * totalMonths)
  const todayX = toX(today)
  const todayY = toY(todayValue)

  // Amort point
  const amortX = amortPrice ? toX(addMonths(startDate, monthsToAmort!)) : null
  const amortY = amortPrice ? toY(amortPrice) : null

  // Grid lines (3 horizontal)
  const gridValues = [maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue].map(v => Math.round(v))
  const uniqueGridVals = gridValues.filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)

  // X axis labels: start, today (if visible), end
  const startLabel = startDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
  const endLabel = endDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Grid lines */}
      {uniqueGridVals.map(v => (
        <g key={v}>
          <line
            x1={PAD_L} y1={toY(v)} x2={PAD_L + CW} y2={toY(v)}
            stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3"
          />
          <text x={PAD_L - 3} y={toY(v) + 3.5} textAnchor="end" fontSize="8" fill="var(--muted)">
            {fmtEur(v)}
          </text>
        </g>
      ))}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CH} stroke="var(--border)" strokeWidth="0.8" />
      <line x1={PAD_L} y1={PAD_T + CH} x2={PAD_L + CW} y2={PAD_T + CH} stroke="var(--border)" strokeWidth="0.8" />

      {/* Amort price horizontal line */}
      {amortPrice && amortY && (
        <>
          <line
            x1={PAD_L} y1={amortY} x2={PAD_L + CW} y2={amortY}
            stroke={color} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5"
          />
          <text x={PAD_L + CW + 2} y={amortY + 3.5} fontSize="7.5" fill={color} opacity="0.8">
            {fmtEur(amortPrice)}€
          </text>
        </>
      )}

      {/* Amort vertical line (target date) */}
      {amortX && amortY && (
        <line
          x1={amortX} y1={PAD_T} x2={amortX} y2={PAD_T + CH}
          stroke={color} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"
        />
      )}

      {/* Main cumulative line */}
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Area fill */}
      <polygon
        points={`${x0},${y0} ${x1},${y1} ${x1},${PAD_T + CH} ${x0},${PAD_T + CH}`}
        fill={color} opacity="0.08"
      />

      {/* Today marker */}
      {todayMonths >= 0 && todayMonths <= totalMonths && (
        <>
          <line
            x1={todayX} y1={PAD_T} x2={todayX} y2={PAD_T + CH}
            stroke="var(--text)" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.4"
          />
          <circle cx={todayX} cy={todayY} r="4" fill={color} stroke="var(--bg)" strokeWidth="1.5" />
          <text x={todayX} y={PAD_T + CH + 10} textAnchor="middle" fontSize="8" fill="var(--muted)">
            hoy
          </text>
        </>
      )}

      {/* X axis labels */}
      <text x={PAD_L} y={H - 3} textAnchor="start" fontSize="8" fill="var(--muted)">{startLabel}</text>
      <text x={PAD_L + CW} y={H - 3} textAnchor="end" fontSize="8" fill="var(--muted)">{endLabel}</text>
    </svg>
  )
}
