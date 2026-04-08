'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ThemeToggle } from './ThemeToggle'
import styles from './AccountTab.module.css'

interface Props {
  userEmail: string
  userName: string
}

export default function AccountTab({ userEmail, userName }: Props) {
  const router = useRouter()
  const [name, setName] = useState(userName)
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')

  const [logoutLoading, setLogoutLoading] = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setNameLoading(true)
    setNameMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setNameLoading(false)
    setNameMsg(error ? 'Error al guardar' : 'Nombre actualizado')
    setTimeout(() => setNameMsg(''), 3000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError('')
    setPwdMsg('')
    if (newPwd.length < 6) { setPwdError('La contraseña debe tener al menos 6 caracteres'); return }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return }
    setPwdLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdLoading(false)
    if (error) {
      setPwdError(error.message)
    } else {
      setPwdMsg('Contraseña actualizada')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      setTimeout(() => setPwdMsg(''), 3000)
    }
  }

  async function logout() {
    setLogoutLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className={styles.root}>
      {/* Profile info */}
      <div className={styles.profile}>
        <div className={styles.avatar}>
          {(name || userEmail).charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.profileName}>{name || '—'}</div>
          <div className={styles.profileEmail}>{userEmail}</div>
        </div>
      </div>

      {/* Change name */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Nombre</div>
        <form onSubmit={saveName} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />
          <button className={styles.btn} type="submit" disabled={nameLoading || !name.trim()}>
            {nameLoading ? 'Guardando…' : 'Guardar'}
          </button>
          {nameMsg && <div className={styles.msg}>{nameMsg}</div>}
        </form>
      </div>

      {/* Change password */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Contraseña</div>
        <form onSubmit={savePassword} className={styles.form}>
          <input
            className={styles.input}
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
          />
          <input
            className={styles.input}
            type="password"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
          />
          {pwdError && <div className={styles.error}>{pwdError}</div>}
          {pwdMsg && <div className={styles.msg}>{pwdMsg}</div>}
          <button className={styles.btn} type="submit" disabled={pwdLoading || !newPwd || !confirmPwd}>
            {pwdLoading ? 'Cambiando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Apariencia</div>
        <div className={styles.themeRow}>
          <div>
            <div className={styles.themeLabel}>Tema</div>
            <div className={styles.themeDesc}>Alterna entre modo oscuro y claro</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Danger zone */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Sesión</div>
        <button
          className={styles.logoutBtn}
          onClick={logout}
          disabled={logoutLoading}
        >
          {logoutLoading ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}
