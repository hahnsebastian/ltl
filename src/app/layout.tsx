import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  metadataBase: new URL('https://ltl.chat'),
  title: 'LTL Registry — Less-Token-Language Official Specification',
  description: 'The official global registry for LTL (Less-Token-Language). Compress AI prompts by 96%+, reduce latency, and optimize LLM context usage with deterministic semantic shorthand.',
  keywords: [
    'LTL', 
    'Less-Token-Language', 
    'AI prompt engineering', 
    'token compression', 
    'LLM optimization', 
    'prompt compression', 
    'semantic shorthand', 
    'AI cost reduction', 
    'prompt registry',
    'AI efficiency',
    'NLP'
  ],
  authors: [{ name: 'LTL Foundation' }],
  openGraph: {
    title: 'LTL Registry — Less-Token-Language Official Specification',
    description: 'Compress AI prompts by 96%+ with LTL. The global registry for semantic shorthand.',
    url: 'https://ltl.chat',
    siteName: 'LTL Registry',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LTL Registry — Less-Token-Language',
    description: 'High-density semantic shorthand for LLMs. 96%+ token savings.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "LTL Registry",
                "description": "Global registry and specification for Less-Token-Language, a high-density semantic shorthand for LLM optimization.",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web",
                "url": "https://ltl.chat",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://ltl.chat/atlas?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "author": {
                  "@type": "Organization",
                  "name": "LTL Foundation"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://ltl.chat"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Atlas",
                    "item": "https://ltl.chat/atlas"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Studio",
                    "item": "https://ltl.chat/studio"
                  }
                ]
              }
            ])
          }}
        />
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
