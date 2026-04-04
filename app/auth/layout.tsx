import Link from 'next/link'
import styles from './auth.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>A<span>mort</span></Link>
        {children}
      </div>
    </div>
  )
}
