import type { Entry } from '@/lib/types'
import { monthlyFromIncome, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'
import { KebabMenu } from './KebabMenu'

interface Props {
  entry: Entry
  onBack: () => void
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
}

export function IncomeDetail({ entry, onBack, onEdit, onClose, onDelete }: Props) {
  const monthly = monthlyFromIncome(entry)
  const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const months = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{entry.name}</div>
        <KebabMenu items={[
          { label: 'Editar', description: 'Modificar datos del ingreso', onClick: onEdit },
          { label: 'Cerrar', description: 'Registrar fin de este ingreso', onClick: onClose },
          { label: 'Eliminar', description: 'Borrar por error, sin historial', onClick: onDelete, danger: true },
        ]} />
      </div>
      <div className={`${styles.subHero} ${styles.incomeHero}`}>
        <div className={styles.subHeroIcon}>{entry.icon}</div>
        <div className={`${styles.subHeroPrice} ${styles.incomeHeroPrice}`}>{fmt(monthly)}</div>
        <div className={styles.subHeroLbl}>al mes{entry.period === 'yearly' ? ' (facturado anual)' : ''}</div>
      </div>
      <div className={styles.subStats}>
        <div className={styles.subStat}><div className={styles.subStatVal}>{fmt(monthly * 12)}</div><div className={styles.subStatLbl}>Al año</div></div>
        <div className={styles.subStat}><div className={styles.subStatVal}>{since ? fmt(months * monthly) : '—'}</div><div className={styles.subStatLbl}>Total recibido</div></div>
        <div className={styles.subStat}><div className={styles.subStatVal}>{since ? months + ' m' : '—'}</div><div className={styles.subStatLbl}>Meses activo</div></div>
      </div>
      <div className={styles.metaGrid}>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Desde</div><div className={styles.metaVal}>{since ? fmtDate(since) : '—'}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Periodo</div><div className={styles.metaVal}>{entry.period === 'yearly' ? 'Anual' : 'Mensual'}</div></div>
      </div>
    </div>
  )
}
