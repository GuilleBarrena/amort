export interface AmortItem {
  id: string
  user_id: string
  name: string
  price: number
  monthly: number
  date_str: string
  created_at: string
}

export interface SubItem {
  id: string
  user_id: string
  name: string
  icon: string
  price: number
  period: 'monthly' | 'yearly'
  category: string
  since: string
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
