'use client'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
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
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={styles.kebabBtn} aria-label="Más opciones">&#8942;</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.kebabMenu} align="end" sideOffset={6}>
          {items.map(item => (
            <DropdownMenu.Item
              key={item.label}
              className={`${styles.kebabItem} ${item.danger ? styles.kebabItemDanger : ''}`}
              onSelect={item.onClick}
            >
              <span className={styles.kebabItemLabel}>{item.label}</span>
              <span className={styles.kebabItemDesc}>{item.description}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
