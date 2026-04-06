import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { createRequisition, listInstitutions } from '@/lib/gocardless'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { institution_id } = await req.json()
  if (!institution_id) return NextResponse.json({ error: 'institution_id requerido' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUrl = `${appUrl}/api/banking/callback`

  try {
    // Resolve institution name
    const institutions = await listInstitutions('es')
    const institution = institutions.find(i => i.id === institution_id)
    const institutionName = institution?.name ?? institution_id

    const requisition = await createRequisition({
      institution_id,
      redirect: redirectUrl,
      reference: `${user.id}-${Date.now()}`,
    })

    // Store pending connection
    await supabase.from('bank_connections').insert({
      user_id: user.id,
      requisition_id: requisition.id,
      institution_id,
      institution_name: institutionName,
      status: 'pending',
    })

    return NextResponse.json({ redirect_url: requisition.link })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
