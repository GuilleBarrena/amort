import type { Entry } from '@/lib/types'
import { ENTRY_CATEGORIES } from '@/lib/types'
import { monthlyFromSub, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'
import { KebabMenu } from './KebabMenu'
import { CumulativeChart } from './CumulativeChart'

interface Props {
  entry: Entry
  onBack: () => void
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
}

export function SubDetail({ entry, onBack, onEdit, onClose, onDelete }: Props) {
  const monthly = monthlyFromSub(entry)
  const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const months = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{entry.name}</div>
        <KebabMenu items={[
          { label: 'Editar', description: 'Modificar datos de la suscripción', onClick: onEdit },
          { label: 'Cerrar', description: 'Registrar cancelación con historial', onClick: onClose },
          { label: 'Eliminar', description: 'Borrar por error, sin guardar historial', onClick: onDelete, danger: true },
        ]} />
      </div>
      <div className={styles.subHero}>
        <div className={styles.subHeroIcon}>{entry.icon}</div>
        <div className={styles.subHeroPrice}>{fmt(monthly)}</div>
        <div className={styles.subHeroLbl}>al mes{entry.period === 'yearly' ? ' (facturado anual)' : ''}</div>
      </div>
      <div className={styles.subStats}>
        <div className={styles.subStat}><div className={styles.subStatVal}>{fmt(monthly * 12)}</div><div className={styles.subStatLbl}>Al año</div></div>
        <div className={styles.subStat}><div className={styles.subStatVal}>{since ? fmt(months * monthly) : '—'}</div><div className={styles.subStatLbl}>Total pagado</div></div>
        <div className={styles.subStat}><div className={styles.subStatVal}>{since ? months + ' m' : '—'}</div><div className={styles.subStatLbl}>Meses activa</div></div>
      </div>
      <div className={styles.metaGrid}>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Categoría</div><div className={styles.metaVal}>{ENTRY_CATEGORIES[entry.category!] ?? entry.category}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Desde</div><div className={styles.metaVal}>{since ? fmtDate(since) : '—'}</div></div>
      </div>
      {since && (
        <div className={styles.chartBlock}>
          <div className={styles.chartTitle}>Coste acumulado</div>
          <CumulativeChart
            startDate={since}
            monthly={monthly}
            today={today}
            color="var(--purple)"
          />
        </div>
      )}
    </div>
  )
}
