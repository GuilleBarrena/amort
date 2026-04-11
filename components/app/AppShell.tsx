'use client'
import { useState } from 'react'
import type { Entry } from '@/lib/types'
import AppNav, { type AppTab } from './AppNav'
import DashboardClient from './DashboardClient'
import MetricsTab from './MetricsTab'
import InvestmentsTab from './InvestmentsTab'
import AccountTab from './AccountTab'
import WalletTab from './WalletTab'
import styles from './AppShell.module.css'

interface Props {
  initialEntries: Entry[]
  userEmail: string
  userName: string
}

export default function AppShell({ initialEntries, userEmail, userName }: Props) {
  const [tab, setTab] = useState<AppTab>('metrics')

  return (
    <div className={styles.body}>
      <AppNav activeTab={tab} onTabChange={setTab} />
      <div className={styles.content}>
        {tab === 'metrics'    && <MetricsTab entries={initialEntries} />}
        {tab === 'gastos'     && <DashboardClient initialEntries={initialEntries} />}
        {tab === 'inversiones' && <InvestmentsTab />}
        {tab === 'wallet'     && <WalletTab />}
        {tab === 'cuenta'     && <AccountTab userEmail={userEmail} userName={userName} />}
      </div>
    </div>
  )
}
