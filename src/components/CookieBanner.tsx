'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ltl-cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ltl-cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[200] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-border rounded-md p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-bold text-foreground font-sans uppercase tracking-tight">Privacy Notice</span>
          </div>
          
          <p className="text-sm text-muted-foreground font-normal leading-relaxed">
            We use essential cookies and local storage to optimize the LTL Registry and Atlas performance. 
            No personal data is collected. By continuing, you agree to our <Link href="/privacy" className="text-foreground underline hover:no-underline font-medium">Privacy Policy</Link>.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-black text-white px-4 py-2.5 rounded-md text-sm font-sans font-bold hover:bg-black/90 transition-all border border-black"
            >
              Accept
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="flex-1 bg-secondary text-foreground px-4 py-2.5 rounded-md text-sm font-sans font-bold hover:bg-border transition-all border border-transparent"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
