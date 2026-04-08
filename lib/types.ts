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

export const ENTRY_CATEGORIES: Record<string, string> = {
  // Tecnología
  tecnologia:   'Tecnología',
  software:     'Software / Apps',
  nube:         'Nube / Almacenamiento',
  // Electrónica
  electrohogar: 'Electrohogar',
  audio_video:  'Audio / Vídeo',
  // Entretenimiento
  streaming:    'Streaming (vídeo)',
  musica:       'Música',
  prensa:       'Prensa / Revistas',
  ocio:         'Ocio',
  // Movilidad
  vehiculo:     'Vehículo',
  telefonia:    'Telefonía',
  internet:     'Internet en casa',
  // Hogar
  mobiliario:   'Mobiliario',
  herramientas: 'Herramientas',
  ropa_moda:    'Ropa y moda',
  alarma:       'Alarma / Seguridad',
  // Bienestar
  deporte:      'Deporte y salud',
  educacion:    'Educación',
  seguros:      'Seguros',
  otros:        'Otros',
  // Legacy — solo para mostrar entradas antiguas, no aparece en el formulario
  seguro_coche: 'Seguro de coche',
  seguro_moto:  'Seguro de moto',
  seguro_hogar: 'Seguro de hogar',
  seguro_vida:  'Seguro de vida',
  seguro_salud: 'Seguro de salud',
  gimnasio:     'Gimnasio / Deporte',
}

// Claves que se muestran en el formulario (sin las legacy)
export const ENTRY_CATEGORY_KEYS = [
  'tecnologia', 'software', 'nube', 'electrohogar', 'audio_video',
  'streaming', 'musica', 'prensa', 'ocio', 'vehiculo', 'telefonia',
  'internet', 'mobiliario', 'herramientas', 'ropa_moda', 'alarma',
  'deporte', 'educacion', 'seguros', 'otros',
] as const

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
