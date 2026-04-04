'use client'
import { useState, useCallback } from 'react'
import type { AmortItem, SubItem } from '@/lib/types'
import { calcAmort, monthlyFromSub, fmt, fmtDate } from '@/lib/calc'
import styles from './DashboardClient.module.css'

const ICONS = ['📱','💻','🖥️','📷','🎮','🎧','📺','🎵','🏋️','📚','☁️','🔒','✉️','🏠','🚗','🌍','💊','🎨','📡','⚡','🍿','🎬','🛡️','🔧']
const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', otros:'Otros' }

type Filter = 'all' | 'amort' | 'sub'
type View = 'list' | 'add' | 'edit-amort' | 'edit-sub' | 'detail-amort' | 'detail-sub'

interface Props {
  initialItems: AmortItem[]
  initialSubs: SubItem[]
  totalMonthly: number
  totalPending: number
}

export default function DashboardClient({ initialItems, initialSubs, totalMonthly: initTotal, totalPending: initPending }: Props) {
  const [items, setItems] = useState<AmortItem[]>(initialItems)
  const [subs, setSubs] = useState<SubItem[]>(initialSubs)
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('list')
  const [formType, setFormType] = useState<'amort' | 'sub'>('amort')
  const [selectedItem, setSelectedItem] = useState<AmortItem | null>(null)
  const [selectedSub, setSelectedSub] = useState<SubItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])

  // Form state - amort
  const [fName, setFName] = useState('')
  const [fPrice, setFPrice] = useState('')
  const [fMonthly, setFMonthly] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])

  // Form state - sub
  const [sName, setSName] = useState('')
  const [sPrice, setSPrice] = useState('')
  const [sPeriod, setSPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [sCategory, setSCategory] = useState('entretenimiento')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  // Computed totals
  const activeAmorts = items.filter(it => !calcAmort(it).alreadyDone)
  const amortMonthly = activeAmorts.reduce((s, it) => s + it.monthly, 0)
  const subsMonthly = subs.reduce((s, sub) => s + monthlyFromSub(sub), 0)
  const totalMonthly = amortMonthly + subsMonthly
  const totalPending = items.reduce((s, it) => s + calcAmort(it).virtualPrice, 0)

  // Reset forms
  function resetAmortForm() { setFName(''); setFPrice(''); setFMonthly(''); setFDate(new Date().toISOString().split('T')[0]) }
  function resetSubForm() { setSName(''); setSPrice(''); setSPeriod('monthly'); setSCategory('entretenimiento'); setSelectedIcon(ICONS[0]) }

  function goAdd(type: 'amort' | 'sub' = 'amort') {
    setFormType(type); resetAmortForm(); resetSubForm()
    setSelectedItem(null); setSelectedSub(null)
    setView('add')
  }

  // AMORT CRUD
  async function saveAmort() {
    if (!fName || !fPrice || !fMonthly || !fDate) { showToast('Rellena todos los campos'); return }
    setLoading(true)
    const body = { name: fName, price: parseFloat(fPrice), monthly: parseFloat(fMonthly), date_str: fDate }
    if (selectedItem) {
      const res = await fetch(`/api/items/${selectedItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const updated = await res.json()
      setItems(prev => prev.map(it => it.id === updated.id ? updated : it))
      showToast('Compra actualizada')
    } else {
      const res = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setItems(prev => [created, ...prev])
      showToast('Compra añadida')
    }
    setLoading(false); setView('list')
  }

  async function deleteAmort() {
    if (!selectedItem || !confirm('¿Eliminar esta compra?')) return
    setLoading(true)
    await fetch(`/api/items/${selectedItem.id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(it => it.id !== selectedItem.id))
    showToast('Compra eliminada'); setLoading(false); setView('list')
  }

  // SUB CRUD
  async function saveSub() {
    if (!sName || !sPrice) { showToast('Rellena nombre e importe'); return }
    setLoading(true)
    const body = { name: sName, icon: selectedIcon, price: parseFloat(sPrice), period: sPeriod, category: sCategory, since: new Date().toISOString().split('T')[0] }
    if (selectedSub) {
      const res = await fetch(`/api/subs/${selectedSub.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const updated = await res.json()
      setSubs(prev => prev.map(s => s.id === updated.id ? updated : s))
      showToast('Suscripción actualizada')
    } else {
      const res = await fetch('/api/subs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setSubs(prev => [created, ...prev])
      showToast('Suscripción añadida')
    }
    setLoading(false); setView('list')
  }

  async function deleteSub() {
    if (!selectedSub || !confirm('¿Eliminar esta suscripción?')) return
    setLoading(true)
    await fetch(`/api/subs/${selectedSub.id}`, { method: 'DELETE' })
    setSubs(prev => prev.filter(s => s.id !== selectedSub.id))
    showToast('Suscripción eliminada'); setLoading(false); setView('list')
  }

  // Open detail
  function openAmort(item: AmortItem) { setSelectedItem(item); setView('detail-amort') }
  function openSub(sub: SubItem) { setSelectedSub(sub); setView('detail-sub') }

  function editAmort(item: AmortItem) {
    setSelectedItem(item); setFormType('amort')
    setFName(item.name); setFPrice(String(item.price)); setFMonthly(String(item.monthly)); setFDate(item.date_str)
    setView('add')
  }

  function editSub(sub: SubItem) {
    setSelectedSub(sub); setFormType('sub')
    setSName(sub.name); setSPrice(String(sub.price)); setSPeriod(sub.period); setSCategory(sub.category); setSelectedIcon(sub.icon)
    setView('add')
  }

  // Build list
  const amortEntries = (filter !== 'sub') ? items.map(item => ({ type: 'amort' as const, data: item, calc: calcAmort(item) })) : []
  const subEntries   = (filter !== 'amort') ? subs.map(sub => ({ type: 'sub' as const, data: sub })) : []
  const active = amortEntries.filter(e => !e.calc.alreadyDone).sort((a,b) => b.data.monthly - a.data.monthly)
  const subList = subEntries.sort((a,b) => monthlyFromSub(b.data) - monthlyFromSub(a.data))
  const done   = amortEntries.filter(e => e.calc.alreadyDone)
  const allEntries = [...active, ...subList, ...done]

  // ── RENDER ──
  if (view === 'detail-amort' && selectedItem) {
    const c = calcAmort(selectedItem)
    const pct = Math.min(c.pct, 100)
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setView('list')}>←</button>
          <div className={styles.detailTitle}>{selectedItem.name}</div>
          <button className={styles.editBtn} onClick={() => editAmort(selectedItem)}>Editar</button>
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Precio compra</div><div className={styles.metaVal}>{fmt(selectedItem.price)}</div></div>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Objetivo / mes</div><div className={styles.metaVal}>{fmt(selectedItem.monthly)}</div></div>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Fecha compra</div><div className={styles.metaVal}>{fmtDate(new Date(selectedItem.date_str + 'T00:00:00'))}</div></div>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Meses</div><div className={styles.metaVal}>{c.months.toFixed(1)} m</div></div>
        </div>
        <div className={styles.resultBlock}>
          <div className={styles.resultLetter}>A</div>
          <div>
            <div className={styles.resultLabel}>Amortización hasta hoy</div>
            <div className={styles.resultValue}>{fmt(c.amortized)}</div>
            <div className={styles.resultNote}>{c.months.toFixed(1)} meses · {c.pct.toFixed(1)}% del total</div>
            <div className={styles.progressBar}><div className={`${styles.progressFill} ${c.alreadyDone ? styles.done : ''}`} style={{ width: `${pct}%` }} /></div>
            <div className={`${styles.progressPct} ${c.alreadyDone ? styles.done : ''}`}>{c.alreadyDone ? '✓ totalmente amortizado' : `${pct.toFixed(1)}% amortizado`}</div>
          </div>
        </div>
        <div className={styles.resultBlock}>
          <div className={styles.resultLetter}>B</div>
          <div>
            <div className={styles.resultLabel}>Fecha objetivo cumplido</div>
            <div className={`${styles.resultValue} ${c.alreadyDone ? styles.green : ''}`}>{c.alreadyDone ? '✓ Ya alcanzado' : fmtDate(c.targetDate)}</div>
            <div className={styles.resultNote}>{c.alreadyDone ? `Cumplido el ${fmtDate(c.targetDate)}.` : `Faltan ~${Math.ceil(selectedItem.price / selectedItem.monthly - c.months)} meses.`}</div>
          </div>
        </div>
        <div className={styles.resultBlock}>
          <div className={styles.resultLetter}>C</div>
          <div>
            <div className={styles.resultLabel}>Precio de venta virtual hoy</div>
            <div className={`${styles.resultValue} ${c.virtualPrice === 0 ? styles.green : ''}`}>{fmt(c.virtualPrice)}</div>
            <div className={styles.resultNote}>{c.virtualPrice === 0 ? 'Completamente amortizado.' : `${fmt(selectedItem.price)} − ${fmt(c.amortized)} amortizados.`}</div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'detail-sub' && selectedSub) {
    const monthly = monthlyFromSub(selectedSub)
    const since = selectedSub.since ? new Date(selectedSub.since + 'T00:00:00') : null
    const today = new Date(); today.setHours(0,0,0,0)
    const months = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setView('list')}>←</button>
          <div className={styles.detailTitle}>{selectedSub.name}</div>
          <button className={styles.editBtn} onClick={() => editSub(selectedSub)}>Editar</button>
        </div>
        <div className={styles.subHero}>
          <div className={styles.subHeroIcon}>{selectedSub.icon}</div>
          <div className={styles.subHeroPrice}>{fmt(monthly)}</div>
          <div className={styles.subHeroLbl}>al mes{selectedSub.period === 'yearly' ? ' (facturado anual)' : ''}</div>
        </div>
        <div className={styles.subStats}>
          <div className={styles.subStat}><div className={styles.subStatVal}>{fmt(monthly * 12)}</div><div className={styles.subStatLbl}>Al año</div></div>
          <div className={styles.subStat}><div className={styles.subStatVal}>{since ? fmt(months * monthly) : '—'}</div><div className={styles.subStatLbl}>Total pagado</div></div>
          <div className={styles.subStat}><div className={styles.subStatVal}>{since ? months + ' m' : '—'}</div><div className={styles.subStatLbl}>Meses activa</div></div>
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Categoría</div><div className={styles.metaVal}>{CAT_LABELS[selectedSub.category] || selectedSub.category}</div></div>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Desde</div><div className={styles.metaVal}>{since ? fmtDate(since) : '—'}</div></div>
        </div>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteSub} disabled={loading}>Eliminar suscripción</button>
      </div>
    )
  }

  if (view === 'add') {
    const isAmort = formType === 'amort'
    const isEditing = isAmort ? !!selectedItem : !!selectedSub
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setView('list')}>←</button>
          <div className={styles.detailTitle}>{isEditing ? 'Editar' : 'Nuevo'}</div>
        </div>
        <div className={styles.typeToggle}>
          <button className={`${styles.typeBtn} ${isAmort ? styles.typeBtnAmort : ''}`} onClick={() => { setFormType('amort'); setSelectedSub(null) }}>⚙ Compra</button>
          <button className={`${styles.typeBtn} ${!isAmort ? styles.typeBtnSub : ''}`} onClick={() => { setFormType('sub'); setSelectedItem(null) }}>◉ Suscripción</button>
        </div>

        {isAmort ? (
          <div className={styles.form}>
            <div className={styles.field}><label className={styles.label}>Nombre</label><input className={styles.input} value={fName} onChange={e => setFName(e.target.value)} placeholder="MacBook, cámara…" /></div>
            <div className={styles.twoCol}>
              <div className={styles.field}><label className={styles.label}>Precio (€)</label><input className={styles.input} type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="1200" /></div>
              <div className={styles.field}><label className={styles.label}>Objetivo / mes (€)</label><input className={styles.input} type="number" value={fMonthly} onChange={e => setFMonthly(e.target.value)} placeholder="50" /></div>
            </div>
            <div className={styles.field}><label className={styles.label}>Fecha de compra</label><input className={styles.input} type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></div>
            <button className={styles.btn} onClick={saveAmort} disabled={loading}>{loading ? 'Guardando…' : 'Guardar compra'}</button>
            {isEditing && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteAmort} disabled={loading}>Eliminar</button>}
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
            <button className={`${styles.btn} ${styles.btnPurple}`} onClick={saveSub} disabled={loading}>{loading ? 'Guardando…' : 'Guardar suscripción'}</button>
            {isEditing && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteSub} disabled={loading}>Eliminar</button>}
          </div>
        )}
      </div>
    )
  }

  // LIST VIEW
  return (
    <div>
      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Total / mes</div>
          <div className={styles.summaryValue}>{fmt(totalMonthly)}</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Pendiente total</div>
          <div className={`${styles.summaryValue} ${styles.red}`}>{items.length ? fmt(totalPending) : '—'}</div>
        </div>
      </div>

      {/* Filter + Add */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['all','amort','sub'] as Filter[]).map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todo' : f === 'amort' ? 'Compras' : 'Suscripciones'}
            </button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => goAdd()}>+ Nuevo</button>
      </div>

      {/* List */}
      {allEntries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◻</div>
          <div className={styles.emptyText}>Nada aquí todavía<br />Pulsa "+ Nuevo" para empezar</div>
        </div>
      ) : allEntries.map(entry => {
        if (entry.type === 'amort') {
          const { data: item, calc: c } = entry
          const pct = Math.min(c.pct, 100)
          return (
            <div key={item.id} className={styles.card} onClick={() => openAmort(item)}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNameRow}><span className={styles.cardIcon}>⚙</span><span className={styles.cardName}>{item.name}</span></div>
                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${styles.badgeAmort}`}>Compra</span>
                  {c.alreadyDone ? <span className={`${styles.badge} ${styles.badgeDone}`}>✓ amortizado</span>
                    : c.months < 1 ? <span className={`${styles.badge} ${styles.badgeEarly}`}>reciente</span>
                    : <span className={`${styles.badge} ${styles.badgePct}`}>{pct.toFixed(0)}%</span>}
                </div>
              </div>
              <div className={styles.cardBody}>
                <div><div className={styles.statLabel}>Precio</div><div className={styles.statVal}>{fmt(item.price)}</div></div>
                <div><div className={styles.statLabel}>/ mes</div><div className={styles.statVal}>{fmt(item.monthly)}</div></div>
                <div><div className={styles.statLabel}>Venta virtual</div><div className={styles.statVal}>{fmt(c.virtualPrice)}</div></div>
              </div>
              <div className={styles.bar}><div className={`${styles.barFill} ${c.alreadyDone ? styles.barDone : ''}`} style={{ width: `${pct}%` }} /></div>
            </div>
          )
        } else {
          const { data: sub } = entry
          const monthly = monthlyFromSub(sub)
          const today = new Date(); today.setHours(0,0,0,0)
          const since = sub.since ? new Date(sub.since + 'T00:00:00') : null
          const mo = since ? Math.floor((today.getTime() - since.getTime()) / (1000*60*60*24*30)) : null
          return (
            <div key={sub.id} className={`${styles.card} ${styles.cardSub}`} onClick={() => openSub(sub)}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNameRow}><span className={styles.cardIcon}>{sub.icon}</span><span className={styles.cardName}>{sub.name}</span></div>
                <div className={styles.cardBadges}><span className={`${styles.badge} ${styles.badgeSub}`}>Suscripción</span></div>
              </div>
              <div className={styles.cardBody}>
                <div><div className={styles.statLabel}>/ mes</div><div className={`${styles.statVal} ${styles.purple}`}>{fmt(monthly)}</div></div>
                <div><div className={styles.statLabel}>/ año</div><div className={styles.statVal}>{fmt(monthly * 12)}</div></div>
                <div><div className={styles.statLabel}>{mo !== null ? 'Meses activa' : 'Categoría'}</div><div className={styles.statVal}>{mo !== null ? mo + ' m' : CAT_LABELS[sub.category]}</div></div>
              </div>
              <div className={styles.bar}><div className={`${styles.barFill} ${styles.barSub}`} style={{ width: '100%' }} /></div>
            </div>
          )
        }
      })}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
