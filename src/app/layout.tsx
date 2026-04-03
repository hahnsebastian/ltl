import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'LTL Registry — Less-Token-Language v2.0.0 Global Specification',
  description: 'The official registry for LTL rule sets. Compress AI prompts by up to 97%.',
  keywords: ['LTL', 'Less-Token-Language', 'AI prompts', 'token compression'],
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="bg-black text-white font-mono antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <div className="scanline-overlay" aria-hidden="true" />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
