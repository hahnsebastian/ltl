import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'LTL Registry — Less-Token-Language v1.0 Global Specification',
  description: 'The official registry for LTL rule sets. Compress AI prompts by up to 97%.',
  keywords: ['LTL', 'Less-Token-Language', 'AI prompts', 'token compression'],
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
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
