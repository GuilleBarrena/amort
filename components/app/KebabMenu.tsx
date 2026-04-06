'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './DashboardClient.module.css'

interface MenuItem {
  label: string
  description: string
  onClick: () => void
  danger?: boolean
}

interface Props {
  items: MenuItem[]
}

export function KebabMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={styles.kebab} ref={ref}>
      <button
        className={styles.kebabBtn}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        aria-label="Más opciones"
      >
        &#8942;
      </button>
      {open && (
        <div className={styles.kebabMenu}>
          {items.map(item => (
            <button
              key={item.label}
              className={`${styles.kebabItem} ${item.danger ? styles.kebabItemDanger : ''}`}
              onClick={e => { e.stopPropagation(); setOpen(false); item.onClick() }}
            >
              <span className={styles.kebabItemLabel}>{item.label}</span>
              <span className={styles.kebabItemDesc}>{item.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
