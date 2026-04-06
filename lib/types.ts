export interface Entry {
  id: string
  user_id: string
  type: 'amort' | 'sub'
  name: string
  price: number
  // amort
  monthly?: number
  date_str?: string
  // sub
  icon?: string
  period?: 'monthly' | 'yearly'
  category?: string
  since?: string
  created_at: string
}

export interface AmortCalc {
  months: number
  amortized: number
  pct: number
  virtualPrice: number
  targetDate: Date
  alreadyDone: boolean
}

export interface BankConnection {
  id: string
  user_id: string
  requisition_id: string
  institution_id: string
  institution_name: string
  status: 'pending' | 'linked' | 'expired'
  account_ids: string[]
  created_at: string
  last_synced_at: string | null
}

export interface Transaction {
  id: string
  user_id: string
  connection_id: string
  external_id: string
  account_id: string
  amount: number
  currency: string
  description: string
  date: string
  category: string | null
  created_at: string
}

export const TX_CATEGORIES: Record<string, string> = {
  alimentacion: 'Alimentación',
  restaurantes: 'Restaurantes',
  transporte: 'Transporte',
  hogar: 'Hogar',
  ropa: 'Ropa',
  ocio: 'Ocio',
  viajes: 'Viajes',
  salud: 'Salud',
  educacion: 'Educación',
  seguros: 'Seguros',
  suscripciones: 'Suscripciones',
  nomina: 'Nómina',
  transferencia: 'Transferencia',
  otros: 'Otros',
}
