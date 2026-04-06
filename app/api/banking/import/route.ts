import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

interface ImportRow {
  date: string        // ISO YYYY-MM-DD
  amount: number
  description: string
  currency?: string
  external_id?: string
  import_source?: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await req.json() as { rows: ImportRow[] }
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'Sin filas' }, { status: 400 })

  const records = rows.map(r => ({
    user_id: user.id,
    external_id: r.external_id ?? null,
    import_source: r.import_source ?? null,
    amount: r.amount,
    currency: r.currency ?? 'EUR',
    description: r.description,
    date: r.date,
  }))

  // Split into rows with and without external_id for proper upsert handling
  const withId    = records.filter(r => r.external_id)
  const withoutId = records.filter(r => !r.external_id)

  if (withId.length) {
    const { error } = await supabase
      .from('transactions')
      .upsert(withId, { onConflict: 'user_id,external_id', ignoreDuplicates: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (withoutId.length) {
    const { error } = await supabase
      .from('transactions')
      .insert(withoutId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ imported: records.length })
}
