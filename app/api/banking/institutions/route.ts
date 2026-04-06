import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { listInstitutions } from '@/lib/gocardless'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const institutions = await listInstitutions('es')
    return NextResponse.json(institutions)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
