import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { getAccountTransactions, getRequisition } from '@/lib/gocardless'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { connection_id } = body as { connection_id?: string }

  // Load connections to sync
  let query = supabase
    .from('bank_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'linked')

  if (connection_id) query = query.eq('id', connection_id)

  const { data: connections, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!connections?.length) return NextResponse.json({ synced: 0 })

  let synced = 0

  for (const conn of connections) {
    try {
      // Refresh account list in case it changed
      const requisition = await getRequisition(conn.requisition_id)
      const accountIds: string[] = requisition.accounts ?? conn.account_ids ?? []

      for (const accountId of accountIds) {
        const { booked } = await getAccountTransactions(accountId)

        for (const tx of booked) {
          const externalId = tx.transactionId ?? tx.internalTransactionId
          if (!externalId) continue

          const description =
            tx.creditorName ??
            tx.debtorName ??
            tx.remittanceInformationUnstructured ??
            tx.remittanceInformationStructured ??
            ''

          await supabase.from('transactions').upsert(
            {
              user_id: user.id,
              connection_id: conn.id,
              external_id: externalId,
              account_id: accountId,
              amount: parseFloat(tx.transactionAmount.amount),
              currency: tx.transactionAmount.currency,
              description,
              date: tx.bookingDate,
            },
            { onConflict: 'user_id,external_id', ignoreDuplicates: true }
          )
          synced++
        }
      }

      await supabase
        .from('bank_connections')
        .update({ last_synced_at: new Date().toISOString(), account_ids: accountIds })
        .eq('id', conn.id)
    } catch (err) {
      console.error(`Sync failed for connection ${conn.id}:`, err)
    }
  }

  return NextResponse.json({ synced })
}
