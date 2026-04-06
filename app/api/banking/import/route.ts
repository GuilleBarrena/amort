import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

interface ImportRow {
  date: string        // ISO YYYY-MM-DD
  amount: number
  description: string
  currency?: string
  external_id?: string
  import_source?: string
  category?: string | null
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await req.json() as { rows: ImportRow[] }
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'Sin filas' }, { status: 400 })

  const records = rows.map(r => ({
    user_id:       user.id,
    external_id:   r.external_id   ?? null,
    import_source: r.import_source ?? null,
    amount:        r.amount,
    currency:      r.currency      ?? 'EUR',
    description:   r.description,
    date:          r.date,
    category:      r.category      ?? null,
  }))

  // CSV rows always have external_id; manual entries do not
  const withId    = records.filter(r => r.external_id)
  const withoutId = records.filter(r => !r.external_id)

  let imported = 0

  if (withId.length) {
    // ignoreDuplicates: true → conflict on (user_id, external_id) is silently discarded.
    // .select() returns only the rows that were actually inserted (not skipped).
    const { data, error } = await supabase
      .from('transactions')
      .upsert(withId, { onConflict: 'user_id,external_id', ignoreDuplicates: true })
      .select('id')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    imported += data?.length ?? 0
  }

  if (withoutId.length) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(withoutId)
      .select('id')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    imported += data?.length ?? 0
  }

  const skipped = records.length - imported
  return NextResponse.json({ imported, skipped })
}
