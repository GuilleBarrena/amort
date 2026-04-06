'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Label from '@radix-ui/react-label'
import { createClient } from '@/lib/supabase-browser'
import styles from '../auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <div>
        <div className={styles.title}>Bienvenido de vuelta</div>
        <div className={styles.sub}>Entra para ver tu dashboard</div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.field}>
          <Label.Root htmlFor="login-email" className={styles.label}>Email</Label.Root>
          <input id="login-email" className={styles.input} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className={styles.field}>
          <Label.Root htmlFor="login-password" className={styles.label}>Contraseña</Label.Root>
          <input id="login-password" className={styles.input} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <div className={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className={styles.footerLink}>Crear cuenta gratis</Link>
      </div>
    </>
  )
}
