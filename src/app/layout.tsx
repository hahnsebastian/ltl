import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'LTL Registry — Less-Token-Language Alpha Global Specification',
  description: 'The official registry for LTL rule sets. Compress AI prompts by up to 97%.',
  keywords: ['LTL', 'Less-Token-Language', 'AI prompts', 'token compression'],
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <CookieBanner />
        <Navbar />
        <div className="flex-1 flex flex-col pt-12">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
