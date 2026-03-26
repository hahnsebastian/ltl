import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LTL Registry — Less-Token-Language v1.0 Global Specification',
  description: 'The official registry for LTL rule sets. Compress AI prompts by up to 97%.',
  keywords: ['LTL', 'Less-Token-Language', 'AI prompts', 'token compression'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white font-mono antialiased">
        <div className="scanline-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
