import Link from 'next/link'
import styles from './DashboardNav.module.css'

export default function DashboardNav() {
  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.logo}>A<span>mort</span></Link>
    </header>
  )
}
