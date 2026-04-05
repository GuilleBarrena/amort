'use client'
import { useState } from 'react'
import type { Entry } from '@/lib/types'
import styles from './DashboardClient.module.css'

const ICONS = ['📱','💻','🖥️','📷','🎮','🎧','📺','🎵','🏋️','📚','☁️','🔒','✉️','🏠','🚗','🌍','💊','🎨','📡','⚡','🍿','🎬','🛡️','🔧']
const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', seguros:'Seguros', otros:'Otros' }

interface Props {
  entry: Entry | null  // null = new entry
  onBack: () => void
  onSave: (body: object) => Promise<void>
  onRequestClose: (entry: Entry) => void
  loading: boolean
  showToast: (msg: string) => void
}

export function EntryForm({ entry, onBack, onSave, onRequestClose, loading, showToast }: Props) {
  const isEditing = !!entry
  const [formType, setFormType] = useState<'amort' | 'sub'>(entry?.type ?? 'amort')

  // Amort fields
  const [fName, setFName] = useState(entry?.type === 'amort' ? entry.name : '')
  const [fPrice, setFPrice] = useState(entry?.type === 'amort' ? String(entry.price) : '')
  const [fMonthly, setFMonthly] = useState(entry?.type === 'amort' ? String(entry.monthly) : '')
  const [fDate, setFDate] = useState(entry?.type === 'amort' ? entry.date_str! : new Date().toISOString().split('T')[0])

  // Sub fields
  const [sName, setSName] = useState(entry?.type === 'sub' ? entry.name : '')
  const [sPrice, setSPrice] = useState(entry?.type === 'sub' ? String(entry.price) : '')
  const [sPeriod, setSPeriod] = useState<'monthly' | 'yearly'>(entry?.type === 'sub' ? entry.period! : 'monthly')
  const [sCategory, setSCategory] = useState(entry?.type === 'sub' ? entry.category! : 'entretenimiento')
  const [selectedIcon, setSelectedIcon] = useState(entry?.type === 'sub' ? entry.icon! : ICONS[0])

  async function handleSave() {
    if (formType === 'amort') {
      if (!fName || !fPrice || !fMonthly || !fDate) { showToast('Rellena todos los campos'); return }
      await onSave({ type: 'amort', name: fName, price: parseFloat(fPrice), monthly: parseFloat(fMonthly), date_str: fDate })
    } else {
      if (!sName || !sPrice) { showToast('Rellena nombre e importe'); return }
      const since = entry?.type === 'sub' ? entry.since : new Date().toISOString().split('T')[0]
      await onSave({ type: 'sub', name: sName, icon: selectedIcon, price: parseFloat(sPrice), period: sPeriod, category: sCategory, since })
    }
  }

  const isAmort = formType === 'amort'

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{isEditing ? 'Editar' : 'Nuevo'}</div>
      </div>
      <div className={styles.typeToggle}>
        <button className={`${styles.typeBtn} ${isAmort ? styles.typeBtnAmort : ''}`} onClick={() => { setFormType('amort') }}>⚙ Compra</button>
        <button className={`${styles.typeBtn} ${!isAmort ? styles.typeBtnSub : ''}`} onClick={() => { setFormType('sub') }}>◉ Suscripción</button>
      </div>

      {isAmort ? (
        <div className={styles.form}>
          <div className={styles.field}><label className={styles.label}>Nombre</label><input className={styles.input} value={fName} onChange={e => setFName(e.target.value)} placeholder="MacBook, cámara…" /></div>
          <div className={styles.twoCol}>
            <div className={styles.field}><label className={styles.label}>Precio (€)</label><input className={styles.input} type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="1200" /></div>
            <div className={styles.field}><label className={styles.label}>Objetivo / mes (€)</label><input className={styles.input} type="number" value={fMonthly} onChange={e => setFMonthly(e.target.value)} placeholder="50" /></div>
          </div>
          <div className={styles.field}><label className={styles.label}>Fecha de compra</label><input className={styles.input} type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></div>
          <button className={styles.btn} onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar compra'}</button>
          {isEditing && entry && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onRequestClose(entry)} disabled={loading}>Cerrar entrada</button>}
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.field}><label className={styles.label}>Nombre</label><input className={styles.input} value={sName} onChange={e => setSName(e.target.value)} placeholder="Netflix, Spotify, móvil…" /></div>
          <div className={styles.field}>
            <label className={styles.label}>Icono</label>
            <div className={styles.iconPicker}>
              {ICONS.map(ic => (
                <div key={ic} className={`${styles.iconOpt} ${ic === selectedIcon ? styles.iconSelected : ''}`} onClick={() => setSelectedIcon(ic)}>{ic}</div>
              ))}
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}><label className={styles.label}>Importe (€)</label><input className={styles.input} type="number" value={sPrice} onChange={e => setSPrice(e.target.value)} placeholder="15.99" /></div>
            <div className={styles.field}><label className={styles.label}>Periodo</label>
              <select className={styles.input} value={sPeriod} onChange={e => setSPeriod(e.target.value as 'monthly' | 'yearly')}>
                <option value="monthly">Mensual</option><option value="yearly">Anual</option>
              </select>
            </div>
          </div>
          <div className={styles.field}><label className={styles.label}>Categoría</label>
            <select className={styles.input} value={sCategory} onChange={e => setSCategory(e.target.value)}>
              {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button className={`${styles.btn} ${styles.btnPurple}`} onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar suscripción'}</button>
          {isEditing && entry && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onRequestClose(entry)} disabled={loading}>Cerrar entrada</button>}
        </div>
      )}
    </div>
  )
}
