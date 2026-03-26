'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:no-underline group h-8">
          <img src="/logo.png" alt="LTL Logo" className="h-[24px] object-contain filter invert" />
          <span className="text-xs tracking-widest uppercase text-white font-bold ml-1 hidden sm:inline">
            Less-Token-Language
          </span>
          <span className="text-xs text-white/30 hidden md:inline">v1.0</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center text-xs tracking-wider h-full">
          {[
            { href: '/', label: 'ATLAS' },
            { href: '/whitepaper', label: 'WHITE PAPER' },
            { href: '/transform', label: 'TRANSFORM' },
            { href: '/ltl-core.md', label: 'LTL CORE' },
            { href: 'https://github.com/hahnsebastian/ltl', label: 'GITHUB', external: true },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="px-4 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors border-r border-white/10 last:border-r-0 font-bold"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden btn py-1.5 px-3 text-xs"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white bg-black">
          {[
            { href: '/', label: 'ATLAS' },
            { href: '/whitepaper', label: 'WHITE PAPER' },
            { href: '/transform', label: 'TRANSFORM' },
            { href: '/ltl-core.md', label: 'LTL CORE' },
            { href: 'https://github.com/hahnsebastian/ltl', label: 'GITHUB' },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-xs tracking-wider border-b border-white/10 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
