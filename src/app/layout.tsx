import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'LTL Registry — Less-Token-Language v1.1 Global Specification',
  description: 'The official registry for LTL rule sets. Compress AI prompts by up to 97%.',
  keywords: ['LTL', 'Less-Token-Language', 'AI prompts', 'token compression'],
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="bg-black text-white font-mono antialiased min-h-screen flex flex-col">
        <div className="scanline-overlay" aria-hidden="true" />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
