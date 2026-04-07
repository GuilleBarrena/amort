'use client'
import { useState, useCallback } from 'react'
import * as Toast from '@radix-ui/react-toast'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { Entry } from '@/lib/types'
import { calcAmort, monthlyFromSub, monthlyFromIncome, fmt } from '@/lib/calc'
import { EntryCard } from './EntryCard'
import { AmortDetail } from './AmortDetail'
import { SubDetail } from './SubDetail'
import { IncomeDetail } from './IncomeDetail'
import { EntryForm } from './EntryForm'
import { CloseView } from './CloseView'
import { BankingView } from './BankingView'
import styles from './DashboardClient.module.css'

type Filter = 'all' | 'amort' | 'sub' | 'income'
type View = 'list' | 'add' | 'detail' | 'close' | 'banking'

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
  const incomeEntries = activeEntries.filter(e => e.type === 'income')
  const activeAmorts = amortEntries.filter(e => !calcAmort(e).alreadyDone)
  const totalMonthly = activeAmorts.reduce((s, e) => s + e.monthly!, 0) + subEntries.reduce((s, e) => s + monthlyFromSub(e), 0)
  const totalIncome = incomeEntries.reduce((s, e) => s + monthlyFromIncome(e), 0)
  const ahorro = totalIncome - totalMonthly
  const totalPending = amortEntries.reduce((s, e) => s + calcAmort(e).virtualPrice, 0)

  function openDetail(entry: Entry) { setSelected(entry); setView('detail') }
  function openEdit(entry: Entry)   { setSelected(entry); setView('add') }
  function openClose(entry: Entry)  { setSelected(entry); setView('close') }
  function openAdd()                { setSelected(null);  setView('add') }

  async function saveEntry(body: object) {
    setLoading(true)
    const t = (body as { type: string }).type
    if (selected) {
      const res = await fetch(`/api/entries/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const updated = await res.json()
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
      showToast(t === 'amort' ? 'Compra actualizada' : t === 'income' ? 'Ingreso actualizado' : 'Suscripción actualizada')
    } else {
      const res = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setEntries(prev => [created, ...prev])
      showToast(t === 'amort' ? 'Compra añadida' : t === 'income' ? 'Ingreso añadido' : 'Suscripción añadida')
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
    showToast(closeType === 'sold' ? 'Venta registrada' : selected.type === 'income' ? 'Ingreso cerrado' : 'Suscripción cancelada')
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

  const amortList   = (filter === 'all' || filter === 'amort') ? amortEntries.map(e => ({ entry: e, calc: calcAmort(e) })) : []
  const subList     = (filter === 'all' || filter === 'sub') ? subEntries.slice().sort((a, b) => monthlyFromSub(b) - monthlyFromSub(a)) : []
  const incomeList  = (filter === 'all' || filter === 'income') ? incomeEntries.slice().sort((a, b) => monthlyFromIncome(b) - monthlyFromIncome(a)) : []
  const active      = amortList.filter(e => !e.calc.alreadyDone).sort((a, b) => b.entry.monthly! - a.entry.monthly!)
  const done        = amortList.filter(e => e.calc.alreadyDone)
  const historial   = closedEntries.filter(e => filter === 'all' || e.type === filter)

  function renderView() {
    if (view === 'banking') {
      return <BankingView onBack={() => setView('list')} showToast={showToast} />
    }

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
      if (selected.type === 'amort') return <AmortDetail {...sharedProps} />
      if (selected.type === 'income') return <IncomeDetail {...sharedProps} />
      return <SubDetail {...sharedProps} />
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

    // LIST VIEW
    return (
      <div>
        <div className={styles.summary}>
          <div className={styles.summaryCell}>
            <div className={styles.summaryLabel}>Gastos / mes</div>
            <div className={`${styles.summaryValue} ${styles.red}`}>{fmt(totalMonthly)}</div>
          </div>
          <div className={styles.summaryCell}>
            <div className={styles.summaryLabel}>Ingresos / mes</div>
            <div className={`${styles.summaryValue} ${styles.green}`}>{totalIncome > 0 ? fmt(totalIncome) : '—'}</div>
          </div>
          <div className={styles.summaryCell}>
            <div className={styles.summaryLabel}>Ahorro / mes</div>
            <div className={`${styles.summaryValue} ${ahorro >= 0 ? styles.green : styles.red}`}>{totalIncome > 0 ? fmt(ahorro) : '—'}</div>
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
            {(['all', 'amort', 'sub', 'income'] as Filter[]).map(f => (
              <ToggleGroup.Item
                key={f}
                value={f}
                className={`${styles.filterBtn} ${filter === f ? (f === 'income' ? styles.filterActiveIncome : styles.filterActive) : ''}`}
              >
                {f === 'all' ? 'Todo' : f === 'amort' ? 'Compras' : f === 'income' ? 'Ingresos' : 'Suscripciones'}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
          <button className={styles.bankingBtn} onClick={() => setView('banking')}>🏦</button>
          <button className={styles.addBtn} onClick={openAdd}>+ Nuevo</button>
        </div>

        {(active.length + subList.length + incomeList.length + done.length + historial.length) === 0 ? (
          <div className={styles.emptyOptions}>
            <button className={styles.emptyOption} onClick={() => setView('banking')}>
              <span className={styles.emptyOptionIcon}>📂</span>
              <span className={styles.emptyOptionTitle}>Importar desde CSV</span>
              <span className={styles.emptyOptionDesc}>
                Exporta el historial de tu banco y súbelo aquí. Amort detecta las columnas automáticamente y elimina duplicados.
              </span>
            </button>
            <button className={styles.emptyOption} onClick={openAdd}>
              <span className={styles.emptyOptionIcon}>✏️</span>
              <span className={styles.emptyOptionTitle}>Añadir entrada manual</span>
              <span className={styles.emptyOptionDesc}>
                Añade una compra, suscripción o ingreso recurrente para empezar a controlar tus finanzas.
              </span>
            </button>
          </div>
        ) : (
          <>
            {incomeList.map(entry => <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />)}
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
