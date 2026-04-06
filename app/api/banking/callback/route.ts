import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { getRequisition } from '@/lib/gocardless'

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!ref) return NextResponse.redirect(`${appUrl}/dashboard?banking_error=missing_ref`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  try {
    const requisition = await getRequisition(ref)
    const status = requisition.status === 'LN' ? 'linked' : 'pending'

    await supabase
      .from('bank_connections')
      .update({
        status,
        account_ids: requisition.accounts ?? [],
      })
      .eq('requisition_id', ref)
      .eq('user_id', user.id)

    return NextResponse.redirect(`${appUrl}/dashboard?banking_connected=1`)
  } catch (err) {
    console.error('Banking callback error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard?banking_error=callback_failed`)
  }
}
