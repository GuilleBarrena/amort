import { createClient } from '@/lib/supabase-server'
import { calcAmort, monthlyFromSub } from '@/lib/calc'
import type { Entry } from '@/lib/types'
import DashboardClient from '@/components/app/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('entries').select('*').eq('user_id', user!.id).is('deleted_at', null).order('created_at', { ascending: false })

  const entries: Entry[] = data ?? []

  // Totals only count active (not closed) entries
  const active = entries.filter(e => !e.closed_at)
  const amortEntries = active.filter(e => e.type === 'amort')
  const subEntries = active.filter(e => e.type === 'sub')
  const activeAmorts = amortEntries.filter(e => !calcAmort(e).alreadyDone)
  const amortMonthly = activeAmorts.reduce((s, e) => s + e.monthly!, 0)
  const subsMonthly = subEntries.reduce((s, e) => s + monthlyFromSub(e), 0)
  const totalPending = amortEntries.reduce((s, e) => s + calcAmort(e).virtualPrice, 0)

  return (
    <DashboardClient
      initialEntries={entries}
      totalMonthly={amortMonthly + subsMonthly}
      totalPending={totalPending}
    />
  )
}
