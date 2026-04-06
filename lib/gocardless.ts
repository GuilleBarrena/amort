const BASE = 'https://bankaccountdata.gocardless.com/api/v2'

// Module-level token cache (valid for 24h; fine for a single-instance personal app)
let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch(`${BASE}/token/new/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret_id: process.env.GOCARDLESS_SECRET_ID!,
      secret_key: process.env.GOCARDLESS_SECRET_KEY!,
    }),
  })
  if (!res.ok) throw new Error(`GoCardless auth failed: ${res.status}`)
  const data = await res.json()
  cachedToken = data.access as string
  // access_expires is in seconds; subtract 60s buffer
  tokenExpiry = Date.now() + (data.access_expires - 60) * 1000
  return cachedToken
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GoCardless ${options?.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export interface GCInstitution {
  id: string
  name: string
  bic: string
  logo: string
  countries: string[]
}

export interface GCRequisition {
  id: string
  status: string
  link: string
  accounts: string[]
}

export interface GCTransaction {
  transactionId?: string
  internalTransactionId?: string
  bookingDate: string
  valueDate?: string
  transactionAmount: { amount: string; currency: string }
  creditorName?: string
  debtorName?: string
  remittanceInformationUnstructured?: string
  remittanceInformationStructured?: string
}

export async function listInstitutions(country = 'es'): Promise<GCInstitution[]> {
  return api<GCInstitution[]>(`/institutions/?country=${country}`)
}

export async function createRequisition(params: {
  institution_id: string
  redirect: string
  reference: string
}): Promise<GCRequisition> {
  return api<GCRequisition>('/requisitions/', {
    method: 'POST',
    body: JSON.stringify({
      redirect: params.redirect,
      institution_id: params.institution_id,
      reference: params.reference,
      language: 'ES',
    }),
  })
}

export async function getRequisition(id: string): Promise<GCRequisition> {
  return api<GCRequisition>(`/requisitions/${id}/`)
}

export async function getAccountTransactions(accountId: string): Promise<{
  booked: GCTransaction[]
  pending: GCTransaction[]
}> {
  const data = await api<{ transactions: { booked: GCTransaction[]; pending?: GCTransaction[] } }>(
    `/accounts/${accountId}/transactions/`
  )
  return {
    booked: data.transactions.booked ?? [],
    pending: data.transactions.pending ?? [],
  }
}
