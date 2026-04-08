export interface Entry {
  id: string
  user_id: string
  type: 'amort' | 'sub' | 'income'
  name: string
  price: number
  // amort
  monthly?: number
  date_str?: string
  // sub / income
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

export const AMORT_CATEGORIES: Record<string, string> = {
  tecnologia:    'Tecnología',
  electrohogar:  'Electrohogar',
  vehiculo:      'Vehículo',
  audio_video:   'Audio / Vídeo',
  mobiliario:    'Mobiliario',
  herramientas:  'Herramientas',
  deporte:       'Deporte y salud',
  ropa_moda:     'Ropa y moda',
  ocio:          'Ocio',
  otros:         'Otros',
}

export const SUB_CATEGORIES: Record<string, string> = {
  streaming:       'Streaming (vídeo)',
  musica:          'Música',
  software:        'Software / Apps',
  nube:            'Nube / Almacenamiento',
  telefonia:       'Telefonía',
  internet:        'Internet en casa',
  seguro_coche:    'Seguro de coche',
  seguro_moto:     'Seguro de moto',
  seguro_hogar:    'Seguro de hogar',
  seguro_vida:     'Seguro de vida',
  seguro_salud:    'Seguro de salud',
  gimnasio:        'Gimnasio / Deporte',
  educacion:       'Educación',
  prensa:          'Prensa / Revistas',
  alarma:          'Alarma / Seguridad',
  otros:           'Otros',
}

export const INCOME_CATEGORIES: Record<string, string> = {
  nomina:     'Nómina',
  freelance:  'Freelance / Autónomo',
  alquiler:   'Alquiler',
  dividendos: 'Dividendos',
  pension:    'Pensión',
  ayuda:      'Subsidio / Ayuda',
  otros:      'Otros',
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
