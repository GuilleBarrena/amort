'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ThemeToggle } from './ThemeToggle'
import styles from './DashboardNav.module.css'

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.logo}>A<span>mort</span></Link>
      <div className={styles.right}>
        <span className={styles.email}>{userEmail}</span>
        <ThemeToggle />
        <button className={styles.logout} onClick={logout}>Salir</button>
      </div>
    </header>
  )
}
