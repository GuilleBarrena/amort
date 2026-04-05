'use client'
import { useState } from 'react'
import type { Entry } from '@/lib/types'
import { monthlyFromSub, diffMonths, fmt } from '@/lib/calc'
import styles from './DashboardClient.module.css'

interface Props {
  entry: Entry
  onBack: () => void
  onClose: (closeType: 'sold' | 'cancelled', salePrice?: number, totalExpenses?: number) => Promise<void>
  onDelete: () => Promise<void>
  loading: boolean
  showToast: (msg: string) => void
}

export function CloseView({ entry, onBack, onClose, onDelete, loading, showToast }: Props) {
  const [salePrice, setSalePrice] = useState('')

  const isAmort = entry.type === 'amort'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const monthly = isAmort ? 0 : monthlyFromSub(entry)
  const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
  const monthsElapsed = since ? diffMonths(since, today) : 0
  const totalExpenses = isAmort ? 0 : monthsElapsed * monthly

  function handleConfirm() {
    if (isAmort) {
      if (!salePrice) { showToast('Introduce el precio de venta'); return }
      onClose('sold', parseFloat(salePrice))
    } else {
      onClose('cancelled', undefined, totalExpenses)
    }
  }

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{entry.name}</div>
      </div>

      <div className={styles.closeOptions}>
        <div className={styles.resultBlock}>
          <div className={styles.resultLetter}>A</div>
          <div>
            <div className={styles.resultLabel}>
              {isAmort ? 'Has vendido el artículo' : 'Has cancelado la suscripción'}
            </div>
            {isAmort ? (
              <>
                <div className={styles.resultNote} style={{ marginBottom: '0.8rem' }}>
                  Introduce el precio al que lo has vendido. Se registrará en tu historial.
                </div>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Precio de venta (€)"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                  style={{ marginBottom: '0.8rem' }}
                />
              </>
            ) : (
              <>
                <div className={styles.resultValue}>{fmt(totalExpenses)}</div>
                <div className={styles.resultNote}>
                  Total gastado en {monthsElapsed.toFixed(1)} meses de suscripción.
                </div>
              </>
            )}
            <button
              className={styles.btn}
              style={{ marginTop: isAmort ? 0 : '0.8rem' }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Guardando…' : isAmort ? 'Registrar venta' : 'Confirmar cancelación'}
            </button>
          </div>
        </div>

        <div className={styles.resultBlock}>
          <div className={`${styles.resultLetter} ${styles.mutedLetter}`}>B</div>
          <div>
            <div className={styles.resultLabel}>Creado por error</div>
            <div className={styles.resultNote}>
              Esta entrada se eliminará sin guardar ningún historial ni gasto.
            </div>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              style={{ marginTop: '0.8rem' }}
              onClick={onDelete}
              disabled={loading}
            >
              {loading ? 'Eliminando…' : 'Eliminar sin registrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
