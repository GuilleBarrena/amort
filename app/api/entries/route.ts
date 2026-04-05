import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('entries').select('*').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, name, price, monthly, date_str, icon, period, category, since } = body

  if (!type || !name || !price)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (type === 'amort' && (!monthly || !date_str))
    return NextResponse.json({ error: 'Missing amort fields' }, { status: 400 })
  if (type === 'sub' && !period)
    return NextResponse.json({ error: 'Missing sub fields' }, { status: 400 })

  const { data, error } = await supabase
    .from('entries')
    .insert({ user_id: user.id, type, name, price, monthly, date_str, icon, period, category, since })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
