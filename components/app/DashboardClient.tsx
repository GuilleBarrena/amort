'use client'
import { useState, useCallback } from 'react'
import * as Toast from '@radix-ui/react-toast'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { Entry } from '@/lib/types'
import { calcAmort, monthlyFromSub, fmt } from '@/lib/calc'
import { EntryCard } from './EntryCard'
import { AmortDetail } from './AmortDetail'
import { SubDetail } from './SubDetail'
import { EntryForm } from './EntryForm'
import { CloseView } from './CloseView'
import styles from './DashboardClient.module.css'

type Filter = 'all' | 'amort' | 'sub'
type View = 'list' | 'add' | 'detail' | 'close'

interface Props {
  initialEntries: Entry[]
  totalMonthly: number
  totalPending: number
}

export default function DashboardClient({ initialEntries }: Props) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  const activeEntries = entries.filter(e => !e.closed_at)
  const closedEntries = entries.filter(e => !!e.closed_at)

  const amortEntries = activeEntries.filter(e => e.type === 'amort')
  const subEntries = activeEntries.filter(e => e.type === 'sub')
  const activeAmorts = amortEntries.filter(e => !calcAmort(e).alreadyDone)
  const totalMonthly = activeAmorts.reduce((s, e) => s + e.monthly!, 0) + subEntries.reduce((s, e) => s + monthlyFromSub(e), 0)
  const totalPending = amortEntries.reduce((s, e) => s + calcAmort(e).virtualPrice, 0)

  function openDetail(entry: Entry) { setSelected(entry); setView('detail') }
  function openEdit(entry: Entry) { setSelected(entry); setView('add') }
  function openClose(entry: Entry) { setSelected(entry); setView('close') }
  function openAdd() { setSelected(null); setView('add') }

  async function saveEntry(body: object) {
    setLoading(true)
    const isAmort = (body as { type: string }).type === 'amort'
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

  async function closeEntry(closeType: 'sold' | 'cancelled', salePriceVal?: number, totalExpenses?: number) {
    if (!selected) return
    setLoading(true)
    const body: Record<string, unknown> = { close_type: closeType }
    if (salePriceVal !== undefined) body.sale_price = salePriceVal
    if (totalExpenses !== undefined) body.total_expenses = totalExpenses

    const res = await fetch(`/api/entries/${selected.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const updated = await res.json()
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    showToast(closeType === 'sold' ? 'Venta registrada' : 'Suscripción cancelada')
    setLoading(false); setView('list')
  }

  async function deleteEntry() {
    if (!selected) return
    setLoading(true)
    await fetch(`/api/entries/${selected.id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== selected.id))
    showToast('Entrada eliminada')
    setLoading(false); setView('list')
  }

  const amortList = (filter !== 'sub') ? amortEntries.map(e => ({ entry: e, calc: calcAmort(e) })) : []
  const subList = (filter !== 'amort') ? subEntries.slice().sort((a, b) => monthlyFromSub(b) - monthlyFromSub(a)) : []
  const active = amortList.filter(e => !e.calc.alreadyDone).sort((a, b) => b.entry.monthly! - a.entry.monthly!)
  const done = amortList.filter(e => e.calc.alreadyDone)
  const historial = closedEntries.filter(e => filter === 'all' || e.type === filter)

  function renderView() {
    if (view === 'close' && selected) {
      return (
        <CloseView
          entry={selected}
          onBack={() => setView('detail')}
          onClose={closeEntry}
          onDelete={deleteEntry}
          loading={loading}
          showToast={showToast}
        />
      )
    }

    if (view === 'detail' && selected) {
      const sharedProps = {
        entry: selected,
        onBack: () => setView('list'),
        onEdit: () => openEdit(selected),
        onClose: () => openClose(selected),
        onDelete: deleteEntry,
      }
      return selected.type === 'amort'
        ? <AmortDetail {...sharedProps} />
        : <SubDetail {...sharedProps} />
    }

    if (view === 'add') {
      return (
        <EntryForm
          entry={selected}
          onBack={() => setView('list')}
          onSave={saveEntry}
          onRequestClose={openClose}
          loading={loading}
          showToast={showToast}
        />
      )
    }

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
          <ToggleGroup.Root
            type="single"
            value={filter}
            onValueChange={(v) => { if (v) setFilter(v as Filter) }}
            className={styles.filters}
          >
            {(['all', 'amort', 'sub'] as Filter[]).map(f => (
              <ToggleGroup.Item
                key={f}
                value={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              >
                {f === 'all' ? 'Todo' : f === 'amort' ? 'Compras' : 'Suscripciones'}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
          <button className={styles.addBtn} onClick={openAdd}>+ Nuevo</button>
        </div>

        {(active.length + subList.length + done.length + historial.length) === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◻</div>
            <div className={styles.emptyText}>Nada aquí todavía<br />Pulsa &quot;+ Nuevo&quot; para empezar</div>
          </div>
        ) : (
          <>
            {active.map(({ entry }) => <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />)}
            {subList.map(entry => <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />)}
            {done.map(({ entry }) => <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />)}
            {historial.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Historial</div>
                {historial.map(entry => <EntryCard key={entry.id} entry={entry} />)}
              </>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <Toast.Provider swipeDirection="down" duration={2200}>
      {renderView()}
      <Toast.Root
        open={!!toast}
        onOpenChange={(open) => { if (!open) setToast('') }}
        className={styles.toast}
      >
        <Toast.Description>{toast}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className={styles.toastViewport} />
    </Toast.Provider>
  )
}
