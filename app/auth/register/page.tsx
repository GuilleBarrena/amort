'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Label from '@radix-ui/react-label'
import { createClient } from '@/lib/supabase-browser'
import styles from '../auth.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <div>
        <div className={styles.title}>Crear cuenta</div>
        <div className={styles.sub}>Gratis, sin tarjeta, sin límites</div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.field}>
          <Label.Root htmlFor="reg-email" className={styles.label}>Email</Label.Root>
          <input id="reg-email" className={styles.input} type="email" required value={email}
            onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className={styles.field}>
          <Label.Root htmlFor="reg-password" className={styles.label}>Contraseña</Label.Root>
          <input id="reg-password" className={styles.input} type="password" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
        </div>
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <div className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className={styles.footerLink}>Entrar</Link>
      </div>
    </>
  )
}
