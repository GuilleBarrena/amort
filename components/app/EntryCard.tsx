import * as Progress from '@radix-ui/react-progress'
import type { Entry } from '@/lib/types'
import { calcAmort, monthlyFromSub, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'

const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', seguros:'Seguros', otros:'Otros' }

interface Props {
  entry: Entry
  onClick?: () => void
}

export function EntryCard({ entry, onClick }: Props) {
  if (entry.closed_at) {
    const isSold = entry.close_type === 'sold'
    return (
      <div className={`${styles.card} ${styles.cardClosed}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardNameRow}>
            <span className={styles.cardIcon}>{entry.type === 'sub' ? entry.icon : '⚙'}</span>
            <span className={styles.cardName}>{entry.name}</span>
          </div>
          <div className={styles.cardBadges}>
            <span className={`${styles.badge} ${entry.type === 'amort' ? styles.badgeAmort : styles.badgeSub}`}>
              {entry.type === 'amort' ? 'Compra' : 'Suscripción'}
            </span>
            <span className={`${styles.badge} ${isSold ? styles.badgeSold : styles.badgeCancelled}`}>
              {isSold ? 'Vendido' : 'Cancelada'}
            </span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div><div className={styles.statLabel}>Precio orig.</div><div className={styles.statVal}>{fmt(entry.price)}</div></div>
          {isSold
            ? <div><div className={styles.statLabel}>Vendido por</div><div className={`${styles.statVal} ${styles.green}`}>{entry.sale_price != null ? fmt(entry.sale_price) : '—'}</div></div>
            : <div><div className={styles.statLabel}>Total gastado</div><div className={`${styles.statVal} ${styles.red}`}>{entry.total_expenses != null ? fmt(entry.total_expenses) : '—'}</div></div>
          }
          <div><div className={styles.statLabel}>Cerrado</div><div className={styles.statVal}>{fmtDate(new Date(entry.closed_at))}</div></div>
        </div>
        <Progress.Root className={styles.bar} value={100} max={100}>
          <Progress.Indicator className={`${styles.barFill} ${styles.barClosed}`} style={{ width: '100%' }} />
        </Progress.Root>
      </div>
    )
  }

  if (entry.type === 'amort') {
    const c = calcAmort(entry)
    const pct = Math.min(c.pct, 100)
    return (
      <div className={styles.card} onClick={onClick}>
        <div className={styles.cardHeader}>
          <div className={styles.cardNameRow}><span className={styles.cardIcon}>⚙</span><span className={styles.cardName}>{entry.name}</span></div>
          <div className={styles.cardBadges}>
            <span className={`${styles.badge} ${styles.badgeAmort}`}>Compra</span>
            {c.alreadyDone
              ? <span className={`${styles.badge} ${styles.badgeDone}`}>✓ amortizado</span>
              : c.months < 1
                ? <span className={`${styles.badge} ${styles.badgeEarly}`}>reciente</span>
                : <span className={`${styles.badge} ${styles.badgePct}`}>{pct.toFixed(0)}%</span>
            }
          </div>
        </div>
        <div className={styles.cardBody}>
          <div><div className={styles.statLabel}>Precio</div><div className={styles.statVal}>{fmt(entry.price)}</div></div>
          <div><div className={styles.statLabel}>/ mes</div><div className={styles.statVal}>{fmt(entry.monthly!)}</div></div>
          <div><div className={styles.statLabel}>Venta virtual</div><div className={styles.statVal}>{fmt(c.virtualPrice)}</div></div>
        </div>
        <Progress.Root className={styles.bar} value={pct} max={100}>
          <Progress.Indicator
            className={`${styles.barFill} ${c.alreadyDone ? styles.barDone : ''}`}
            style={{ width: `${pct}%` }}
          />
        </Progress.Root>
      </div>
    )
  }

  const monthly = monthlyFromSub(entry)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
  const mo = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : null
  return (
    <div className={`${styles.card} ${styles.cardSub}`} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.cardNameRow}><span className={styles.cardIcon}>{entry.icon}</span><span className={styles.cardName}>{entry.name}</span></div>
        <div className={styles.cardBadges}><span className={`${styles.badge} ${styles.badgeSub}`}>Suscripción</span></div>
      </div>
      <div className={styles.cardBody}>
        <div><div className={styles.statLabel}>/ mes</div><div className={`${styles.statVal} ${styles.purple}`}>{fmt(monthly)}</div></div>
        <div><div className={styles.statLabel}>/ año</div><div className={styles.statVal}>{fmt(monthly * 12)}</div></div>
        <div><div className={styles.statLabel}>{mo !== null ? 'Meses activa' : 'Categoría'}</div><div className={styles.statVal}>{mo !== null ? mo + ' m' : CAT_LABELS[entry.category!]}</div></div>
      </div>
      <Progress.Root className={styles.bar} value={100} max={100}>
        <Progress.Indicator className={`${styles.barFill} ${styles.barSub}`} style={{ width: '100%' }} />
      </Progress.Root>
    </div>
  )
}
