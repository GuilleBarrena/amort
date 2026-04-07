export interface Entry {
  id: string
  user_id: string
  type: 'amort' | 'sub' | 'income'
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
  // close / delete
  deleted_at?: string
  closed_at?: string
  close_type?: 'sold' | 'cancelled'
  sale_price?: number
  total_expenses?: number
}

export interface AmortCalc {
  months: number
  amortized: number
  pct: number
  virtualPrice: number
  targetDate: Date
  alreadyDone: boolean
}

export interface Transaction {
  id: string
  user_id: string
  external_id: string | null
  import_source: string | null
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
