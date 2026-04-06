'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Transaction } from '@/lib/types'
import { TX_CATEGORIES } from '@/lib/types'
import styles from './DashboardClient.module.css'

interface Props {
  onBack: () => void
  showToast: (msg: string) => void
}

// ── CSV parsing ──────────────────────────────────────────────────────────────

function detectDelimiter(sample: string): string {
  const counts = { ',': 0, ';': 0, '\t': 0 }
  for (const ch of sample.slice(0, 2000)) {
    if (ch in counts) counts[ch as keyof typeof counts]++
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseAmount(raw: string): number | null {
  // Handle European format: 1.234,56 → 1234.56 and plain -12,50 → -12.50
  const cleaned = raw
    .replace(/[€$£\s]/g, '')
    .replace(/\.(?=\d{3}[,])/g, '')  // remove thousands dot before comma decimal
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseDate(raw: string): string | null {
  // Try DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY
  const s = raw.trim()
  let m: RegExpMatchArray | null

  m = s.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`

  m = s.match(/^(\d{4})[/\-](\d{2})[/\-](\d{2})$/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`

  m = s.match(/^(\d{2})[/\-](\d{2})[/\-](\d{2})$/)
  if (m) {
    const yr = parseInt(m[3]) > 50 ? `19${m[3]}` : `20${m[3]}`
    return `${yr}-${m[2]}-${m[1]}`
  }

  return null
}

function looksLikeDate(values: string[]): boolean {
  const sample = values.filter(Boolean).slice(0, 10)
  return sample.filter(v => parseDate(v) !== null).length >= sample.length * 0.6
}

function looksLikeAmount(values: string[]): boolean {
  const sample = values.filter(Boolean).slice(0, 10)
  return sample.filter(v => parseAmount(v) !== null).length >= sample.length * 0.6
}

interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

function parseCSV(text: string): ParsedCSV {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  const delimiter = detectDelimiter(lines.slice(0, 3).join('\n'))
  const headers = parseCSVLine(lines[0], delimiter)
  const rows = lines.slice(1).map(l => parseCSVLine(l, delimiter))
  return { headers, rows }
}

interface ColumnMapping {
  dateCol: number
  amountCol: number
  descCol: number
  // Some banks split debit/credit into two columns
  creditCol: number | null
}

function autoDetect(headers: string[], rows: string[][]): ColumnMapping {
  const colValues = (i: number) => rows.map(r => r[i] ?? '').filter(Boolean)

  // Try header name hints first
  const hLower = headers.map(h => h.toLowerCase())

  const dateIdx = hLower.findIndex(h =>
    /fecha|date|dat|value/.test(h)
  )
  const amountIdx = hLower.findIndex(h =>
    /importe|amount|monto|valor|total|cargo|abono|beweging/.test(h) &&
    !/fecha|date/.test(h)
  )
  const creditIdx = hLower.findIndex((h, i) =>
    /abono|credit|haber/.test(h) && i !== amountIdx
  )
  const descIdx = hLower.findIndex(h =>
    /concepto|descripci|description|detail|omschrijving|remittance|comercio/.test(h)
  )

  // Fall back to content heuristics
  const dateCol = dateIdx >= 0 ? dateIdx
    : headers.findIndex((_, i) => looksLikeDate(colValues(i)))

  const amountCol = amountIdx >= 0 ? amountIdx
    : headers.findIndex((_, i) => i !== dateCol && looksLikeAmount(colValues(i)))

  const creditCol = creditIdx >= 0 ? creditIdx : null

  const descCol = descIdx >= 0 ? descIdx
    : headers.findIndex((_, i) => i !== dateCol && i !== amountCol && i !== creditCol)

  return { dateCol, amountCol, descCol, creditCol }
}

interface PreviewRow {
  date: string
  amount: number
  description: string
  ok: boolean
}

function buildPreview(rows: string[][], mapping: ColumnMapping): PreviewRow[] {
  return rows.slice(0, 5).map(row => {
    const rawDate = row[mapping.dateCol] ?? ''
    const rawAmt  = row[mapping.amountCol] ?? ''
    const rawDesc = row[mapping.descCol] ?? ''

    const date   = parseDate(rawDate)
    let amount   = parseAmount(rawAmt) ?? 0
    // If separate credit column has a value, use that as positive
    if (mapping.creditCol !== null) {
      const credit = parseAmount(row[mapping.creditCol] ?? '')
      if (credit && credit !== 0) amount = Math.abs(credit)
      else if (amount) amount = -Math.abs(amount)  // debit → negative
    }

    return { date: date ?? rawDate, amount, description: rawDesc, ok: !!date }
  })
}

function buildImportRows(
  rows: string[][],
  mapping: ColumnMapping,
  filename: string
): { date: string; amount: number; description: string; external_id: string; import_source: string }[] {
  const result = []
  for (const row of rows) {
    const rawDate = row[mapping.dateCol] ?? ''
    const rawAmt  = row[mapping.amountCol] ?? ''
    const rawDesc = row[mapping.descCol] ?? ''

    const date   = parseDate(rawDate)
    let amount   = parseAmount(rawAmt) ?? 0
    if (mapping.creditCol !== null) {
      const credit = parseAmount(row[mapping.creditCol] ?? '')
      if (credit && credit !== 0) amount = Math.abs(credit)
      else if (amount) amount = -Math.abs(amount)
    }

    if (!date) continue

    const description = rawDesc.trim()
    const external_id = `${date}|${amount.toFixed(2)}|${description.slice(0, 60)}`

    result.push({ date, amount, description, external_id, import_source: filename })
  }
  return result
}

// ── Component ────────────────────────────────────────────────────────────────

type Screen = 'list' | 'import'

export function BankingView({ onBack, showToast }: Props) {
  const [screen, setScreen]               = useState<Screen>('list')
  const [transactions, setTransactions]   = useState<Transaction[]>([])
  const [loadingTxs, setLoadingTxs]       = useState(true)
  const fileRef                           = useRef<HTMLInputElement>(null)

  // Import state
  const [parsed, setParsed]               = useState<ParsedCSV | null>(null)
  const [mapping, setMapping]             = useState<ColumnMapping | null>(null)
  const [filename, setFilename]           = useState('')
  const [importing, setImporting]         = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoadingTxs(true)
    const res = await fetch('/api/transactions')
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoadingTxs(false)
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  function handleFile(file: File) {
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const csv = parseCSV(text)
      if (csv.headers.length < 2 || csv.rows.length === 0) {
        showToast('No se pudo leer el archivo')
        return
      }
      const m = autoDetect(csv.headers, csv.rows)
      setParsed(csv)
      setMapping(m)
      setScreen('import')
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function confirmImport() {
    if (!parsed || !mapping) return
    setImporting(true)
    const rows = buildImportRows(parsed.rows, mapping, filename)
    if (rows.length === 0) { showToast('Sin filas válidas'); setImporting(false); return }

    const res = await fetch('/api/banking/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    })
    const data = await res.json()
    await fetchTransactions()
    setImporting(false)
    setParsed(null)
    setScreen('list')
    showToast(`${data.imported ?? rows.length} movimientos importados`)
  }

  async function updateCategory(id: string, category: string | null) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
    const updated = await res.json()
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
  }

  // ── Import screen ──
  if (screen === 'import' && parsed && mapping) {
    const preview = buildPreview(parsed.rows, mapping)
    const totalRows = parsed.rows.length

    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => { setScreen('list'); setParsed(null) }}>←</button>
          <div className={styles.detailTitle}>Importar CSV</div>
        </div>

        <div className={styles.importMeta}>
          <span className={styles.importFilename}>{filename}</span>
          <span className={styles.importCount}>{totalRows} filas</span>
        </div>

        {/* Column mapping */}
        <div className={styles.mappingGrid}>
          <div className={styles.mappingRow}>
            <span className={styles.mappingLabel}>Fecha</span>
            <select className={styles.mappingSelect}
              value={mapping.dateCol}
              onChange={e => setMapping({ ...mapping, dateCol: +e.target.value })}>
              {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
            </select>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingLabel}>Importe</span>
            <select className={styles.mappingSelect}
              value={mapping.amountCol}
              onChange={e => setMapping({ ...mapping, amountCol: +e.target.value })}>
              {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
            </select>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingLabel}>Abono (opcional)</span>
            <select className={styles.mappingSelect}
              value={mapping.creditCol ?? -1}
              onChange={e => setMapping({ ...mapping, creditCol: +e.target.value >= 0 ? +e.target.value : null })}>
              <option value={-1}>—</option>
              {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
            </select>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingLabel}>Descripción</span>
            <select className={styles.mappingSelect}
              value={mapping.descCol}
              onChange={e => setMapping({ ...mapping, descCol: +e.target.value })}>
              {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className={styles.sectionLabel}>Vista previa</div>
        {preview.map((row, i) => (
          <div key={i} className={`${styles.txRow} ${!row.ok ? styles.txRowError : ''}`}>
            <div className={styles.txMain}>
              <span className={styles.txDescription}>{row.description || '—'}</span>
              <span className={`${styles.txAmount} ${row.amount < 0 ? styles.red : styles.green}`}>
                {row.amount >= 0 ? '+' : ''}{row.amount.toFixed(2)} EUR
              </span>
            </div>
            <div className={styles.txMeta}>
              <span className={styles.txDate}>{row.date}</span>
              {!row.ok && <span style={{ fontSize: '0.52rem', color: 'var(--red)' }}>fecha inválida</span>}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '1.2rem' }}>
          <button className={styles.btn} onClick={confirmImport} disabled={importing}>
            {importing ? 'Importando…' : `Importar ${totalRows} movimientos`}
          </button>
        </div>
      </div>
    )
  }

  // ── List screen ──

  // Group transactions by month
  const grouped: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    const key = tx.date.substring(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>Movimientos</div>
        <button className={styles.editBtn} onClick={() => fileRef.current?.click()}>
          + Importar CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
      </div>

      {!loadingTxs && transactions.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏦</div>
          <div className={styles.emptyText}>
            Sin movimientos<br />
            Exporta el CSV de tu banco e impórtalo aquí
          </div>
          <button
            className={styles.btn}
            style={{ marginTop: '1.5rem' }}
            onClick={() => fileRef.current?.click()}
          >
            Seleccionar archivo
          </button>
        </div>
      )}

      {months.map(month => {
        const txs = grouped[month]
        const [year, m] = month.split('-')
        const label = new Date(+year, +m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        const total = txs.reduce((s, t) => s + t.amount, 0)

        return (
          <div key={month}>
            <div className={styles.sectionLabel} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{label}</span>
              <span style={{ color: total < 0 ? 'var(--red)' : 'var(--green)' }}>
                {total >= 0 ? '+' : ''}{total.toFixed(2)} {txs[0]?.currency}
              </span>
            </div>
            {txs.map(tx => (
              <TxRow key={tx.id} tx={tx} onCategoryChange={updateCategory} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function TxRow({ tx, onCategoryChange }: {
  tx: Transaction
  onCategoryChange: (id: string, category: string | null) => void
}) {
  const isDebit = tx.amount < 0
  return (
    <div className={styles.txRow}>
      <div className={styles.txMain}>
        <span className={styles.txDescription}>{tx.description || '—'}</span>
        <span className={`${styles.txAmount} ${isDebit ? styles.red : styles.green}`}>
          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
        </span>
      </div>
      <div className={styles.txMeta}>
        <span className={styles.txDate}>
          {new Date(tx.date + 'T00:00:00').toLocaleDateString('es-ES')}
        </span>
        <select
          className={styles.txCategorySelect}
          value={tx.category ?? ''}
          onChange={e => onCategoryChange(tx.id, e.target.value || null)}
        >
          <option value="">Sin categoría</option>
          {Object.entries(TX_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
