import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { close_type, sale_price, total_expenses } = body

  if (!close_type || !['sold', 'cancelled'].includes(close_type))
    return NextResponse.json({ error: 'Invalid close_type' }, { status: 400 })

  const { data, error } = await supabase
    .from('entries')
    .update({
      closed_at: new Date().toISOString(),
      close_type,
      sale_price: sale_price ?? null,
      total_expenses: total_expenses ?? null,
    })
    .eq('id', params.id).eq('user_id', user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
