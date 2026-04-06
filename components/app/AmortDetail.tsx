import * as Progress from '@radix-ui/react-progress'
import type { Entry } from '@/lib/types'
import { calcAmort, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'
import { KebabMenu } from './KebabMenu'

interface Props {
  entry: Entry
  onBack: () => void
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
}

export function AmortDetail({ entry, onBack, onEdit, onClose, onDelete }: Props) {
  const c = calcAmort(entry)
  const pct = Math.min(c.pct, 100)

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{entry.name}</div>
        <KebabMenu items={[
          { label: 'Editar', description: 'Modificar datos de la compra', onClick: onEdit },
          { label: 'Cerrar', description: 'Registrar venta o baja con historial', onClick: onClose },
          { label: 'Eliminar', description: 'Borrar por error, sin guardar historial', onClick: onDelete, danger: true },
        ]} />
      </div>
      <div className={styles.metaGrid}>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Precio compra</div><div className={styles.metaVal}>{fmt(entry.price)}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Objetivo / mes</div><div className={styles.metaVal}>{fmt(entry.monthly!)}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Fecha compra</div><div className={styles.metaVal}>{fmtDate(new Date(entry.date_str! + 'T00:00:00'))}</div></div>
        <div className={styles.metaCell}><div className={styles.metaLabel}>Meses</div><div className={styles.metaVal}>{c.months.toFixed(1)} m</div></div>
      </div>
      <div className={styles.resultBlock}>
        <div className={styles.resultLetter}>A</div>
        <div>
          <div className={styles.resultLabel}>Amortización hasta hoy</div>
          <div className={styles.resultValue}>{fmt(c.amortized)}</div>
          <div className={styles.resultNote}>{c.months.toFixed(1)} meses · {c.pct.toFixed(1)}% del total</div>
          <Progress.Root className={styles.progressBar} value={pct} max={100}>
            <Progress.Indicator
              className={`${styles.progressFill} ${c.alreadyDone ? styles.done : ''}`}
              style={{ width: `${pct}%` }}
            />
          </Progress.Root>
          <div className={`${styles.progressPct} ${c.alreadyDone ? styles.done : ''}`}>{c.alreadyDone ? '✓ totalmente amortizado' : `${pct.toFixed(1)}% amortizado`}</div>
        </div>
      </div>
      <div className={styles.resultBlock}>
        <div className={styles.resultLetter}>B</div>
        <div>
          <div className={styles.resultLabel}>Fecha objetivo cumplido</div>
          <div className={`${styles.resultValue} ${c.alreadyDone ? styles.green : ''}`}>{c.alreadyDone ? '✓ Ya alcanzado' : fmtDate(c.targetDate)}</div>
          <div className={styles.resultNote}>{c.alreadyDone ? `Cumplido el ${fmtDate(c.targetDate)}.` : `Faltan ~${Math.ceil(entry.price / entry.monthly! - c.months)} meses.`}</div>
        </div>
      </div>
      <div className={styles.resultBlock}>
        <div className={styles.resultLetter}>C</div>
        <div>
          <div className={styles.resultLabel}>Precio de venta virtual hoy</div>
          <div className={`${styles.resultValue} ${c.virtualPrice === 0 ? styles.green : ''}`}>{fmt(c.virtualPrice)}</div>
          <div className={styles.resultNote}>{c.virtualPrice === 0 ? 'Completamente amortizado.' : `${fmt(entry.price)} − ${fmt(c.amortized)} amortizados.`}</div>
        </div>
      </div>
    </div>
  )
}
