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
