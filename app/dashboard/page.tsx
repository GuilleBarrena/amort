import { createClient } from '@/lib/supabase-server'
import type { Entry } from '@/lib/types'
import AppShell from '@/components/app/AppShell'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('entries').select('*').eq('user_id', user!.id).is('deleted_at', null).order('created_at', { ascending: false })

  const entries: Entry[] = data ?? []
  const userEmail = user?.email ?? ''
  const userName = (user?.user_metadata?.full_name as string | undefined) ?? ''

  return (
    <AppShell
      initialEntries={entries}
      userEmail={userEmail}
      userName={userName}
    />
  )
}
