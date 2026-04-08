'use client'
import styles from './AppNav.module.css'

export type AppTab = 'metrics' | 'gastos' | 'inversiones' | 'cuenta'

const TABS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'metrics',
    label: 'Métricas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" />
        <rect x="10" y="6" width="4" height="15" />
        <rect x="17" y="3" width="4" height="18" />
      </svg>
    ),
  },
  {
    id: 'gastos',
    label: 'Gastos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="3" cy="6" r="0.5" fill="currentColor" />
        <circle cx="3" cy="12" r="0.5" fill="currentColor" />
        <circle cx="3" cy="18" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'inversiones',
    label: 'Inversiones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: 'cuenta',
    label: 'Cuenta',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export default function AppNav({ activeTab, onTabChange }: Props) {
  return (
    <>
      <nav className={styles.sidebar}>
        <div className={styles.items}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.item} ${activeTab === tab.id ? styles.itemActive : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.itemIcon}>{tab.icon}</span>
              <span className={styles.itemLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className={styles.bottomBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.bottomItem} ${activeTab === tab.id ? styles.bottomItemActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.bottomIcon}>{tab.icon}</span>
            <span className={styles.bottomLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
