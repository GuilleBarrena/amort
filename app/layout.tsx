import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amort — Controla lo que gastas',
  description: 'Amortiza tus compras y controla tus suscripciones en un solo lugar.',
  applicationName: 'Amort',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Amort',
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#e8c94a' },
    { media: '(prefers-color-scheme: light)', color: '#b88a10' },
  ],
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Apply stored theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
