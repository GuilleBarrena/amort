'use client'
import { useState, useEffect, useCallback } from 'react'
import type { BankConnection, Transaction } from '@/lib/types'
import { TX_CATEGORIES } from '@/lib/types'
import styles from './DashboardClient.module.css'

interface Props {
  onBack: () => void
  showToast: (msg: string) => void
}

type Screen = 'overview' | 'connect'

interface GCInstitution {
  id: string
  name: string
  logo: string
}

export function BankingView({ onBack, showToast }: Props) {
  const [screen, setScreen] = useState<Screen>('overview')
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [institutions, setInstitutions] = useState<GCInstitution[]>([])
  const [loadingConns, setLoadingConns] = useState(true)
  const [loadingTxs, setLoadingTxs] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [loadingInsts, setLoadingInsts] = useState(false)
  const [instSearch, setInstSearch] = useState('')
  const [connecting, setConnecting] = useState(false)

  const fetchConnections = useCallback(async () => {
    setLoadingConns(true)
    const res = await fetch('/api/banking/connections')
    const data = await res.json()
    setConnections(Array.isArray(data) ? data : [])
    setLoadingConns(false)
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoadingTxs(true)
    const res = await fetch('/api/transactions')
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoadingTxs(false)
  }, [])

  useEffect(() => {
    fetchConnections()
    fetchTransactions()
  }, [fetchConnections, fetchTransactions])

  // Handle ?banking_connected=1 redirect from OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('banking_connected')) {
      window.history.replaceState({}, '', window.location.pathname)
      showToast('Banco conectado correctamente')
      fetchConnections()
      fetchTransactions()
    }
    if (params.get('banking_error')) {
      window.history.replaceState({}, '', window.location.pathname)
      showToast('Error al conectar el banco')
    }
  }, [fetchConnections, fetchTransactions, showToast])

  async function openConnectScreen() {
    setScreen('connect')
    if (institutions.length) return
    setLoadingInsts(true)
    const res = await fetch('/api/banking/institutions')
    const data = await res.json()
    setInstitutions(Array.isArray(data) ? data : [])
    setLoadingInsts(false)
  }

  async function connectBank(institutionId: string) {
    setConnecting(true)
    const res = await fetch('/api/banking/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id: institutionId }),
    })
    const data = await res.json()
    if (data.redirect_url) {
      window.location.href = data.redirect_url
    } else {
      showToast('Error al iniciar la conexión')
      setConnecting(false)
    }
  }

  async function syncTransactions(connectionId?: string) {
    setSyncing(true)
    const body = connectionId ? { connection_id: connectionId } : {}
    const res = await fetch('/api/banking/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    await fetchTransactions()
    setSyncing(false)
    showToast(`${data.synced ?? 0} transacciones importadas`)
  }

  async function deleteConnection(id: string) {
    await fetch(`/api/banking/connections?id=${id}`, { method: 'DELETE' })
    setConnections(prev => prev.filter(c => c.id !== id))
    setTransactions(prev => prev.filter(t => t.connection_id !== id))
    showToast('Conexión eliminada')
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

  if (screen === 'connect') {
    const filtered = instSearch
      ? institutions.filter(i => i.name.toLowerCase().includes(instSearch.toLowerCase()))
      : institutions

    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.back} onClick={() => setScreen('overview')}>←</button>
          <div className={styles.detailTitle}>Conectar banco</div>
        </div>

        {loadingInsts ? (
          <div className={styles.empty}><div className={styles.emptyText}>Cargando bancos...</div></div>
        ) : (
          <>
            <input
              className={styles.input}
              placeholder="Buscar banco..."
              value={instSearch}
              onChange={e => setInstSearch(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <div className={styles.institutionList}>
              {filtered.slice(0, 40).map(inst => (
                <button
                  key={inst.id}
                  className={styles.institutionRow}
                  onClick={() => connectBank(inst.id)}
                  disabled={connecting}
                >
                  {inst.logo
                    ? <img src={inst.logo} alt="" className={styles.institutionLogo} />
                    : <div className={styles.institutionLogoPlaceholder}>🏦</div>
                  }
                  <span className={styles.institutionName}>{inst.name}</span>
                  <span className={styles.institutionArrow}>→</span>
                </button>
              ))}
              {!filtered.length && (
                <div className={styles.empty}><div className={styles.emptyText}>Sin resultados</div></div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // Group transactions by month for display
  const grouped: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    const key = tx.date.substring(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const linkedConnections = connections.filter(c => c.status === 'linked')
  const pendingConnections = connections.filter(c => c.status === 'pending')

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>Banca</div>
        <button className={styles.editBtn} onClick={openConnectScreen}>+ Banco</button>
      </div>

      {/* Connected banks */}
      {loadingConns ? null : (
        <>
          {pendingConnections.length > 0 && (
            <div className={styles.bankingNotice}>
              {pendingConnections.length} conexión(es) pendiente(s) de autorización bancaria
            </div>
          )}

          {linkedConnections.length > 0 && (
            <div style={{ marginBottom: '1.2rem' }}>
              {linkedConnections.map(conn => (
                <div key={conn.id} className={styles.connectionCard}>
                  <div className={styles.connectionInfo}>
                    <span className={styles.connectionName}>{conn.institution_name}</span>
                    <span className={styles.connectionMeta}>
                      {conn.last_synced_at
                        ? `Sync: ${new Date(conn.last_synced_at).toLocaleDateString('es-ES')}`
                        : 'Sin sincronizar'}
                    </span>
                  </div>
                  <div className={styles.connectionActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => syncTransactions(conn.id)}
                      disabled={syncing}
                    >
                      {syncing ? '...' : 'Sync'}
                    </button>
                    <button
                      className={styles.editBtn}
                      onClick={() => deleteConnection(conn.id)}
                      style={{ color: 'var(--red)', borderColor: 'rgba(232,90,74,0.35)' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {connections.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🏦</div>
              <div className={styles.emptyText}>
                Sin cuentas conectadas<br />Pulsa &quot;+ Banco&quot; para empezar
              </div>
            </div>
          )}
        </>
      )}

      {/* Transactions */}
      {loadingTxs ? null : transactions.length === 0 && connections.length > 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyText}>
            Sin transacciones — pulsa Sync para importar
          </div>
        </div>
      ) : (
        months.map(month => {
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
                <TransactionRow key={tx.id} tx={tx} onCategoryChange={updateCategory} />
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

function TransactionRow({
  tx,
  onCategoryChange,
}: {
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
        <span className={styles.txDate}>{new Date(tx.date + 'T00:00:00').toLocaleDateString('es-ES')}</span>
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
