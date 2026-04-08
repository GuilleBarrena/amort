'use client'
import type { Entry } from '@/lib/types'
import { ENTRY_CATEGORIES } from '@/lib/types'
import { calcAmort, monthlyFromSub, monthlyFromIncome, fmt } from '@/lib/calc'
import styles from './MetricsTab.module.css'

interface Props {
  entries: Entry[]
}

/* ─── Donut chart ─────────────────────────────────────────── */
interface Segment {
  label: string
  value: number
  color: string
}

function DonutChart({ segments, centerLabel, centerValue }: {
  segments: Segment[]
  centerLabel: string
  centerValue: string
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = 52
  const strokeWidth = 20
  const size = 148
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let cumulative = 0
  const slices = segments
    .filter(s => s.value > 0)
    .map(seg => {
      const arc = (seg.value / total) * circumference
      const offset = circumference - cumulative
      cumulative += arc
      return { ...seg, arc, offset }
    })

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartSvgWrap}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {total > 0 && slices.map((slice, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.arc} ${circumference - slice.arc}`}
              strokeDashoffset={slice.offset}
            />
          ))}
        </svg>
        <div className={styles.chartCenter}>
          <div className={styles.chartCenterVal}>{centerValue}</div>
          <div className={styles.chartCenterLbl}>{centerLabel}</div>
        </div>
      </div>

      <div className={styles.legend}>
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: seg.color }} />
            <span className={styles.legendLabel}>{seg.label}</span>
            <span className={styles.legendVal}>{fmt(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Colores por categoría ───────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  tecnologia:   '#4a8ae8',
  software:     '#5b6ee1',
  nube:         '#4ab4e8',
  electrohogar: '#e8a04a',
  audio_video:  '#e87a4a',
  streaming:    '#e84a8a',
  musica:       '#b44ae8',
  prensa:       '#888888',
  ocio:         'var(--purple)',
  vehiculo:     '#4ae88a',
  telefonia:    '#4ae8c4',
  internet:     '#4ac8e8',
  mobiliario:   '#e8d44a',
  herramientas: '#d4884a',
  ropa_moda:    '#e84ab4',
  alarma:       '#e84a4a',
  deporte:      '#6ae84a',
  educacion:    '#4a6ee8',
  seguros:      '#e8c44a',
  otros:        '#aaaaaa',
  // legacy
  seguro_coche: '#e8c44a',
  seguro_moto:  '#d4b44a',
  seguro_hogar: '#c8a44a',
  seguro_vida:  '#b89444',
  seguro_salud: '#e84a4a',
  gimnasio:     '#6ae84a',
}

/* ─── Main component ──────────────────────────────────────── */
export default function MetricsTab({ entries }: Props) {
  const activeEntries = entries.filter(e => !e.closed_at)
  const amortEntries = activeEntries.filter(e => e.type === 'amort')
  const subEntries = activeEntries.filter(e => e.type === 'sub')
  const incomeEntries = activeEntries.filter(e => e.type === 'income')

  const activeAmorts = amortEntries.filter(e => !calcAmort(e).alreadyDone)
  const amortMonthly = activeAmorts.reduce((s, e) => s + e.monthly!, 0)
  const subMonthly = subEntries.reduce((s, e) => s + monthlyFromSub(e), 0)
  const totalMonthly = amortMonthly + subMonthly
  const totalIncome = incomeEntries.reduce((s, e) => s + monthlyFromIncome(e), 0)
  const ahorro = totalIncome - totalMonthly
  const totalPending = amortEntries.reduce((s, e) => s + calcAmort(e).virtualPrice, 0)

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, (ahorro / totalIncome) * 100)) : 0

  /* Top expenses (by monthly cost, all active non-income) */
  const allExpenses: { name: string; icon?: string; monthly: number; type: Entry['type'] }[] = [
    ...activeAmorts.map(e => ({ name: e.name, icon: e.icon, monthly: e.monthly!, type: e.type as Entry['type'] })),
    ...subEntries.map(e => ({ name: e.name, icon: e.icon, monthly: monthlyFromSub(e), type: e.type as Entry['type'] })),
  ].sort((a, b) => b.monthly - a.monthly).slice(0, 5)

  /* Category breakdown — per category, split by amort/sub */
  interface CatData { amort: number; sub: number }
  const catMap: Record<string, CatData> = {}

  activeAmorts.forEach(e => {
    const key = e.category ?? 'otros'
    if (!catMap[key]) catMap[key] = { amort: 0, sub: 0 }
    catMap[key].amort += e.monthly!
  })
  subEntries.forEach(e => {
    const key = e.category ?? 'otros'
    if (!catMap[key]) catMap[key] = { amort: 0, sub: 0 }
    catMap[key].sub += monthlyFromSub(e)
  })

  const catRows = Object.entries(catMap)
    .map(([key, { amort, sub }]) => ({
      key,
      label: ENTRY_CATEGORIES[key] ?? key,
      amort,
      sub,
      total: amort + sub,
      color: CATEGORY_COLORS[key] ?? '#888',
    }))
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)

  const maxCat = catRows[0]?.total ?? 0

  /* Donut segments — by category */
  const catSegments: Segment[] = catRows.map(r => ({
    label: r.label,
    value: r.total,
    color: r.color,
  }))

  const typeSegments: Segment[] = [
    { label: 'Compras', value: amortMonthly, color: 'var(--gold)' },
    { label: 'Suscripciones', value: subMonthly, color: 'var(--purple)' },
  ]

  const hasCategories = catRows.length > 0
  const chartSegments = hasCategories ? catSegments : typeSegments

  return (
    <div className={styles.root}>
      {/* Summary grid */}
      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Gastos / mes</div>
          <div className={`${styles.summaryValue} ${styles.red}`}>{fmt(totalMonthly)}</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Ingresos / mes</div>
          <div className={`${styles.summaryValue} ${styles.green}`}>{totalIncome > 0 ? fmt(totalIncome) : '—'}</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Ahorro / mes</div>
          <div className={`${styles.summaryValue} ${ahorro >= 0 ? styles.green : styles.red}`}>
            {totalIncome > 0 ? fmt(ahorro) : '—'}
          </div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Pendiente total</div>
          <div className={`${styles.summaryValue} ${styles.red}`}>{amortEntries.length ? fmt(totalPending) : '—'}</div>
        </div>
      </div>

      {/* Distribution donut */}
      {totalMonthly > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            {hasCategories ? 'Distribución por categoría' : 'Distribución de gastos'}
          </div>
          <DonutChart
            segments={chartSegments}
            centerLabel="/mes"
            centerValue={fmt(totalMonthly)}
          />
        </div>
      )}

      {/* Detailed category breakdown */}
      {catRows.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Desglose por categoría</div>
          <div className={styles.catList}>
            {catRows.map(r => (
              <div key={r.key} className={styles.catRow}>
                <div className={styles.catMeta}>
                  <span className={styles.catDot} style={{ background: r.color }} />
                  <span className={styles.catName}>{r.label}</span>
                  <span className={styles.catTotal}>{fmt(r.total)}</span>
                </div>
                <div className={styles.catBarTrack}>
                  <div
                    className={styles.catBarAmort}
                    style={{ width: `${(r.amort / maxCat) * 100}%` }}
                  />
                  <div
                    className={styles.catBarSub}
                    style={{ width: `${(r.sub / maxCat) * 100}%` }}
                  />
                </div>
                {(r.amort > 0 && r.sub > 0) && (
                  <div className={styles.catSplit}>
                    <span className={styles.catSplitAmort}>{fmt(r.amort)} compras</span>
                    <span className={styles.catSplitSep}>·</span>
                    <span className={styles.catSplitSub}>{fmt(r.sub)} suscripciones</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tipo split summary */}
          {amortMonthly > 0 && subMonthly > 0 && (
            <div className={styles.typeSplit}>
              <div className={styles.typeSplitItem}>
                <span className={styles.typeDot} style={{ background: 'var(--gold)' }} />
                <span className={styles.typeLabel}>Compras</span>
                <span className={styles.typeVal}>{fmt(amortMonthly)}</span>
                <span className={styles.typePct}>{((amortMonthly / totalMonthly) * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.typeSplitItem}>
                <span className={styles.typeDot} style={{ background: 'var(--purple)' }} />
                <span className={styles.typeLabel}>Suscripciones</span>
                <span className={styles.typeVal}>{fmt(subMonthly)}</span>
                <span className={styles.typePct}>{((subMonthly / totalMonthly) * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{activeAmorts.length}</div>
          <div className={styles.statLbl}>Compras activas</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{subEntries.length}</div>
          <div className={styles.statLbl}>Suscripciones</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{incomeEntries.length}</div>
          <div className={styles.statLbl}>Fuentes de ingreso</div>
        </div>
      </div>

      {/* Savings rate */}
      {totalIncome > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Tasa de ahorro</div>
          <div className={styles.savingsRow}>
            <span className={`${styles.savingsPct} ${ahorro >= 0 ? styles.green : styles.red}`}>
              {savingsRate.toFixed(0)}%
            </span>
            <span className={styles.savingsNote}>
              {ahorro >= 0
                ? `Ahorras ${fmt(ahorro)} de cada ${fmt(totalIncome)}`
                : `Gastas ${fmt(-ahorro)} más de lo que ingresas`}
            </span>
          </div>
          <div className={styles.savingsBar}>
            <div
              className={`${styles.savingsFill} ${ahorro >= 0 ? styles.savingsFillGreen : styles.savingsFillRed}`}
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>
      )}

      {/* Top expenses */}
      {allExpenses.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Mayores gastos mensuales</div>
          <div className={styles.topList}>
            {allExpenses.map((e, i) => (
              <div key={i} className={styles.topRow}>
                <span className={styles.topRank}>{i + 1}</span>
                <span className={styles.topIcon}>{e.icon ?? (e.type === 'amort' ? '📦' : '🔄')}</span>
                <span className={styles.topName}>{e.name}</span>
                <span className={`${styles.topVal} ${e.type === 'amort' ? styles.gold : styles.purple}`}>
                  {fmt(e.monthly)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coverage metric */}
      {totalPending > 0 && amortMonthly > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Tiempo hasta saldarse</div>
          <div className={styles.coverageRow}>
            <span className={styles.coverageVal}>
              {Math.ceil(totalPending / amortMonthly)} meses
            </span>
            <span className={styles.coverageNote}>
              a ritmo actual de {fmt(amortMonthly)}/mes en compras
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>Añade entradas para ver tus métricas</div>
        </div>
      )}
    </div>
  )
}
