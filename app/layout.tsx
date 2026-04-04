import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amort — Controla lo que gastas',
  description: 'Amortiza tus compras y controla tus suscripciones en un solo lugar.',
  themeColor: '#0d0d0d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
