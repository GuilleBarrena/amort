import { createClient } from '@/lib/supabase-server'
import { calcAmort, monthlyFromSub, fmt } from '@/lib/calc'
import type { AmortItem, SubItem } from '@/lib/types'
import DashboardClient from '@/components/app/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: items }, { data: subs }] = await Promise.all([
    supabase.from('items').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('subs').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])

  const safeItems: AmortItem[] = items ?? []
  const safeSubs: SubItem[] = subs ?? []

  // Compute summary on server
  const activeAmorts = safeItems.filter(it => !calcAmort(it).alreadyDone)
  const amortMonthly = activeAmorts.reduce((s, it) => s + it.monthly, 0)
  const subsMonthly = safeSubs.reduce((s, sub) => s + monthlyFromSub(sub), 0)
  const totalPending = safeItems.reduce((s, it) => s + calcAmort(it).virtualPrice, 0)

  return (
    <DashboardClient
      initialItems={safeItems}
      initialSubs={safeSubs}
      totalMonthly={amortMonthly + subsMonthly}
      totalPending={totalPending}
    />
  )
}
