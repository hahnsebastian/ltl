'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-full bg-white py-8 px-4 md:px-8 mt-auto select-none">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-normal text-muted-foreground">
        
        {/* Left: Copyright */}
        <div className="text-sm text-muted-foreground font-medium">
          &copy; {currentYear} Sebastian Hahn
        </div>

        {/* Right: Links */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          <Link href="/atlas" className="hover:text-foreground transition-colors">Atlas</Link>
          <Link href="/compiler" className="hover:text-foreground transition-colors">Compiler</Link>
          <Link href="https://github.com/hahnsebastian/ltl" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</Link>
          <Link href="https://x.com/SebstianHhn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">X (Twitter)</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>

      </div>
    </footer>
  )
}

