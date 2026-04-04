import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardNav from '@/components/app/DashboardNav'
import styles from './dashboard.module.css'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className={styles.shell}>
      <DashboardNav userEmail={user.email ?? ''} />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
