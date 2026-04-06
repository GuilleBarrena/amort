'use client'
import { useState, useCallback } from 'react'
import type { Entry } from '@/lib/types'
import { calcAmort, monthlyFromSub, fmt, fmtDate } from '@/lib/calc'
import { BankingView } from './BankingView'
import styles from './DashboardClient.module.css'

const ICONS = ['📱','💻','🖥️','📷','🎮','🎧','📺','🎵','🏋️','📚','☁️','🔒','✉️','🏠','🚗','🌍','💊','🎨','📡','⚡','🍿','🎬','🛡️','🔧']
const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', otros:'Otros' }

type Filter = 'all' | 'amort' | 'sub'
type View = 'list' | 'add' | 'detail' | 'banking'

interface Props {
  initialEntries: Entry[]
  totalMonthly: number
  totalPending: number
}

export default function DashboardClient({ initialEntries, totalMonthly: initTotal, totalPending: initPending }: Props) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('list')
  const [formType, setFormType] = useState<'amort' | 'sub'>('amort')
  const [selected, setSelected] = useState<Entry | null>(null)
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
  const amortEntries = entries.filter(e => e.type === 'amort')
  const subEntries = entries.filter(e => e.type === 'sub')
  const activeAmorts = amortEntries.filter(e => !calcAmort(e).alreadyDone)
  const amortMonthly = activeAmorts.reduce((s, e) => s + e.monthly!, 0)
  const subsMonthly = subEntries.reduce((s, e) => s + monthlyFromSub(e), 0)
  const totalMonthly = amortMonthly + subsMonthly
  const totalPending = amortEntries.reduce((s, e) => s + calcAmort(e).virtualPrice, 0)

  function resetAmortForm() { setFName(''); setFPrice(''); setFMonthly(''); setFDate(new Date().toISOString().split('T')[0]) }
  function resetSubForm() { setSName(''); setSPrice(''); setSPeriod('monthly'); setSCategory('entretenimiento'); setSelectedIcon(ICONS[0]) }

  function goAdd(type: 'amort' | 'sub' = 'amort') {
    setFormType(type); resetAmortForm(); resetSubForm()
    setSelected(null); setView('add')
  }

  function editEntry(entry: Entry) {
    setSelected(entry); setFormType(entry.type)
    if (entry.type === 'amort') {
      setFName(entry.name); setFPrice(String(entry.price)); setFMonthly(String(entry.monthly)); setFDate(entry.date_str!)
    } else {
      setSName(entry.name); setSPrice(String(entry.price)); setSPeriod(entry.period!); setSCategory(entry.category!); setSelectedIcon(entry.icon!)
    }
    setView('add')
  }

  async function saveEntry() {
    const isAmort = formType === 'amort'
    if (isAmort && (!fName || !fPrice || !fMonthly || !fDate)) { showToast('Rellena todos los campos'); return }
    if (!isAmort && (!sName || !sPrice)) { showToast('Rellena nombre e importe'); return }

    setLoading(true)
    const body = isAmort
      ? { type: 'amort', name: fName, price: parseFloat(fPrice), monthly: parseFloat(fMonthly), date_str: fDate }
      : { type: 'sub', name: sName, icon: selectedIcon, price: parseFloat(sPrice), period: sPeriod, category: sCategory, since: new Date().toISOString().split('T')[0] }

    if (selected) {
      const res = await fetch(`/api/entries/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const updated = await res.json()
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
      showToast(isAmort ? 'Compra actualizada' : 'Suscripción actualizada')
    } else {
      const res = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setEntries(prev => [created, ...prev])
      showToast(isAmort ? 'Compra añadida' : 'Suscripción añadida')
    }
    setLoading(false); setView('list')
  }

  async function deleteEntry() {
    if (!selected || !confirm('¿Eliminar?')) return
    setLoading(true)
    await fetch(`/api/entries/${selected.id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== selected.id))
    showToast(selected.type === 'amort' ? 'Compra eliminada' : 'Suscripción eliminada')
    setLoading(false); setView('list')
  }

  // Build list
  const amortList = (filter !== 'sub') ? amortEntries.map(e => ({ entry: e, calc: calcAmort(e) })) : []
  const subList   = (filter !== 'amort') ? subEntries : []
  const active    = amortList.filter(e => !e.calc.alreadyDone).sort((a, b) => b.entry.monthly! - a.entry.monthly!)
  const sortedSubs = subList.slice().sort((a, b) => monthlyFromSub(b) - monthlyFromSub(a))
  const done      = amortList.filter(e => e.calc.alreadyDone)

  // ── BANKING VIEW ──
  if (view === 'banking') {
    return (
      <>
        <BankingView onBack={() => setView('list')} showToast={showToast} />
        {toast && <div className={styles.toast}>{toast}</div>}
      </>
    )
  }

  // ── DETAIL VIEW ──
  if (view === 'detail' && selected) {
    if (selected.type === 'amort') {
      const c = calcAmort(selected)
      const pct = Math.min(c.pct, 100)
      return (
        <div>
          <div className={styles.detailHeader}>
            <button className={styles.back} onClick={() => setView('list')}>←</button>
            <div className={styles.detailTitle}>{selected.name}</div>
            <button className={styles.editBtn} onClick={() => editEntry(selected)}>Editar</button>
          </div>
          <div className={styles.metaGrid}>
            <div className={styles.metaCell}><div className={styles.metaLabel}>Precio compra</div><div className={styles.metaVal}>{fmt(selected.price)}</div></div>
            <div className={styles.metaCell}><div className={styles.metaLabel}>Objetivo / mes</div><div className={styles.metaVal}>{fmt(selected.monthly!)}</div></div>
            <div className={styles.metaCell}><div className={styles.metaLabel}>Fecha compra</div><div className={styles.metaVal}>{fmtDate(new Date(selected.date_str! + 'T00:00:00'))}</div></div>
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
              <div className={styles.resultNote}>{c.alreadyDone ? `Cumplido el ${fmtDate(c.targetDate)}.` : `Faltan ~${Math.ceil(selected.price / selected.monthly! - c.months)} meses.`}</div>
            </div>
          </div>
          <div className={styles.resultBlock}>
            <div className={styles.resultLetter}>C</div>
            <div>
              <div className={styles.resultLabel}>Precio de venta virtual hoy</div>
              <div className={`${styles.resultValue} ${c.virtualPrice === 0 ? styles.green : ''}`}>{fmt(c.virtualPrice)}</div>
              <div className={styles.resultNote}>{c.virtualPrice === 0 ? 'Completamente amortizado.' : `${fmt(selected.price)} − ${fmt(c.amortized)} amortizados.`}</div>
            </div>
          </div>
          {toast && <div className={styles.toast}>{toast}</div>}
        </div>
      )
    }

    // sub detail
    const monthly = monthlyFromSub(selected)
    const since = selected.since ? new Date(selected.since + 'T00:00:00') : null
    const today = new Date(); today.setHours(0,0,0,0)
    const months = since ? Math.floor((today.getTime() - since.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setView('list')}>←</button>
          <div className={styles.detailTitle}>{selected.name}</div>
          <button className={styles.editBtn} onClick={() => editEntry(selected)}>Editar</button>
        </div>
        <div className={styles.subHero}>
          <div className={styles.subHeroIcon}>{selected.icon}</div>
          <div className={styles.subHeroPrice}>{fmt(monthly)}</div>
          <div className={styles.subHeroLbl}>al mes{selected.period === 'yearly' ? ' (facturado anual)' : ''}</div>
        </div>
        <div className={styles.subStats}>
          <div className={styles.subStat}><div className={styles.subStatVal}>{fmt(monthly * 12)}</div><div className={styles.subStatLbl}>Al año</div></div>
          <div className={styles.subStat}><div className={styles.subStatVal}>{since ? fmt(months * monthly) : '—'}</div><div className={styles.subStatLbl}>Total pagado</div></div>
          <div className={styles.subStat}><div className={styles.subStatVal}>{since ? months + ' m' : '—'}</div><div className={styles.subStatLbl}>Meses activa</div></div>
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Categoría</div><div className={styles.metaVal}>{CAT_LABELS[selected.category!] || selected.category}</div></div>
          <div className={styles.metaCell}><div className={styles.metaLabel}>Desde</div><div className={styles.metaVal}>{since ? fmtDate(since) : '—'}</div></div>
        </div>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteEntry} disabled={loading}>Eliminar suscripción</button>
        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    )
  }

  // ── ADD / EDIT VIEW ──
  if (view === 'add') {
    const isAmort = formType === 'amort'
    const isEditing = !!selected
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setView('list')}>←</button>
          <div className={styles.detailTitle}>{isEditing ? 'Editar' : 'Nuevo'}</div>
        </div>
        <div className={styles.typeToggle}>
          <button className={`${styles.typeBtn} ${isAmort ? styles.typeBtnAmort : ''}`} onClick={() => { setFormType('amort'); setSelected(null) }}>⚙ Compra</button>
          <button className={`${styles.typeBtn} ${!isAmort ? styles.typeBtnSub : ''}`} onClick={() => { setFormType('sub'); setSelected(null) }}>◉ Suscripción</button>
        </div>

        {isAmort ? (
          <div className={styles.form}>
            <div className={styles.field}><label className={styles.label}>Nombre</label><input className={styles.input} value={fName} onChange={e => setFName(e.target.value)} placeholder="MacBook, cámara…" /></div>
            <div className={styles.twoCol}>
              <div className={styles.field}><label className={styles.label}>Precio (€)</label><input className={styles.input} type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="1200" /></div>
              <div className={styles.field}><label className={styles.label}>Objetivo / mes (€)</label><input className={styles.input} type="number" value={fMonthly} onChange={e => setFMonthly(e.target.value)} placeholder="50" /></div>
            </div>
            <div className={styles.field}><label className={styles.label}>Fecha de compra</label><input className={styles.input} type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></div>
            <button className={styles.btn} onClick={saveEntry} disabled={loading}>{loading ? 'Guardando…' : 'Guardar compra'}</button>
            {isEditing && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteEntry} disabled={loading}>Eliminar</button>}
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
            <button className={`${styles.btn} ${styles.btnPurple}`} onClick={saveEntry} disabled={loading}>{loading ? 'Guardando…' : 'Guardar suscripción'}</button>
            {isEditing && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteEntry} disabled={loading}>Eliminar</button>}
          </div>
        )}
        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div>
      <div className={styles.summary}>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Total / mes</div>
          <div className={styles.summaryValue}>{fmt(totalMonthly)}</div>
        </div>
        <div className={styles.summaryCell}>
          <div className={styles.summaryLabel}>Pendiente total</div>
          <div className={`${styles.summaryValue} ${styles.red}`}>{amortEntries.length ? fmt(totalPending) : '—'}</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['all','amort','sub'] as Filter[]).map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todo' : f === 'amort' ? 'Compras' : 'Suscripciones'}
            </button>
          ))}
        </div>
        <button className={styles.bankingBtn} onClick={() => setView('banking')}>🏦 Banca</button>
        <button className={styles.addBtn} onClick={() => goAdd()}>+ Nuevo</button>
      </div>

      {(active.length + sortedSubs.length + done.length) === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◻</div>
          <div className={styles.emptyText}>Nada aquí todavía<br />Pulsa &quot;+ Nuevo&quot; para empezar</div>
        </div>
      ) : (
        <>
          {active.map(({ entry, calc: c }) => {
            const pct = Math.min(c.pct, 100)
            return (
              <div key={entry.id} className={styles.card} onClick={() => { setSelected(entry); setView('detail') }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardNameRow}><span className={styles.cardIcon}>⚙</span><span className={styles.cardName}>{entry.name}</span></div>
                  <div className={styles.cardBadges}>
                    <span className={`${styles.badge} ${styles.badgeAmort}`}>Compra</span>
                    {c.months < 1 ? <span className={`${styles.badge} ${styles.badgeEarly}`}>reciente</span>
                      : <span className={`${styles.badge} ${styles.badgePct}`}>{pct.toFixed(0)}%</span>}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div><div className={styles.statLabel}>Precio</div><div className={styles.statVal}>{fmt(entry.price)}</div></div>
                  <div><div className={styles.statLabel}>/ mes</div><div className={styles.statVal}>{fmt(entry.monthly!)}</div></div>
                  <div><div className={styles.statLabel}>Venta virtual</div><div className={styles.statVal}>{fmt(c.virtualPrice)}</div></div>
                </div>
                <div className={styles.bar}><div className={styles.barFill} style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}

          {sortedSubs.map(entry => {
            const monthly = monthlyFromSub(entry)
            const today = new Date(); today.setHours(0,0,0,0)
            const since = entry.since ? new Date(entry.since + 'T00:00:00') : null
            const mo = since ? Math.floor((today.getTime() - since.getTime()) / (1000*60*60*24*30)) : null
            return (
              <div key={entry.id} className={`${styles.card} ${styles.cardSub}`} onClick={() => { setSelected(entry); setView('detail') }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardNameRow}><span className={styles.cardIcon}>{entry.icon}</span><span className={styles.cardName}>{entry.name}</span></div>
                  <div className={styles.cardBadges}><span className={`${styles.badge} ${styles.badgeSub}`}>Suscripción</span></div>
                </div>
                <div className={styles.cardBody}>
                  <div><div className={styles.statLabel}>/ mes</div><div className={`${styles.statVal} ${styles.purple}`}>{fmt(monthly)}</div></div>
                  <div><div className={styles.statLabel}>/ año</div><div className={styles.statVal}>{fmt(monthly * 12)}</div></div>
                  <div><div className={styles.statLabel}>{mo !== null ? 'Meses activa' : 'Categoría'}</div><div className={styles.statVal}>{mo !== null ? mo + ' m' : CAT_LABELS[entry.category!]}</div></div>
                </div>
                <div className={styles.bar}><div className={`${styles.barFill} ${styles.barSub}`} style={{ width: '100%' }} /></div>
              </div>
            )
          })}

          {done.map(({ entry, calc: c }) => (
            <div key={entry.id} className={styles.card} onClick={() => { setSelected(entry); setView('detail') }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNameRow}><span className={styles.cardIcon}>⚙</span><span className={styles.cardName}>{entry.name}</span></div>
                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${styles.badgeAmort}`}>Compra</span>
                  <span className={`${styles.badge} ${styles.badgeDone}`}>✓ amortizado</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div><div className={styles.statLabel}>Precio</div><div className={styles.statVal}>{fmt(entry.price)}</div></div>
                <div><div className={styles.statLabel}>/ mes</div><div className={styles.statVal}>{fmt(entry.monthly!)}</div></div>
                <div><div className={styles.statLabel}>Venta virtual</div><div className={styles.statVal}>{fmt(c.virtualPrice)}</div></div>
              </div>
              <div className={styles.bar}><div className={`${styles.barFill} ${styles.barDone}`} style={{ width: '100%' }} /></div>
            </div>
          ))}
        </>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
