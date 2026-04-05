import type { Entry } from '@/lib/types'
import { monthlyFromSub, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'

const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', seguros:'Seguros', otros:'Otros' }

interface Props {
  entry: Entry
  onBack: () => void
  onEdit: () => void
  onClose: () => void
}

export function SubDetail({ entry, onBack, onEdit, onClose }: Props) {
  const monthly = monthlyFromSub(entry)
  const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const months = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{entry.name}</div>
        <button className={styles.editBtn} onClick={onEdit}>Editar</button>
        <button className={styles.closeBtnHeader} onClick={onClose}>Cerrar</button>
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
        <div className={styles.metaCell}><div className={styles.metaLabel}>Categoría</div><div className={styles.metaVal}>{CAT_LABELS[entry.category!] || entry.category}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Desde</div><div className={styles.metaVal}>{since ? fmtDate(since) : '—'}</div></div>
      </div>
    </div>
  )
}
