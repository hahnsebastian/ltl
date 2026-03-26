'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SUPPORTED_LANGS } from '@/lib/translate'

interface NavbarProps {
  currentLang: string
  onLangChange: (lang: string) => void
  isTranslating: boolean
}

export default function Navbar({ currentLang, onLangChange, isTranslating }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:no-underline group">
          <span className="text-xs font-bold tracking-widest border border-white px-2 py-0.5 group-hover:bg-white group-hover:text-black transition-colors duration-150">
            LTL
          </span>
          <span className="text-xs tracking-widest uppercase text-white/60 hidden sm:inline">
            Less-Token-Language
          </span>
          <span className="text-xs text-white/30 hidden md:inline">v1.0</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0 text-xs tracking-wider">
          {[
            { href: '/', label: 'ATLAS' },
            { href: '/whitepaper', label: 'WHITE PAPER' },
            { href: '/ltl-core.md', label: 'LTL CORE' },
            { href: 'https://github.com/hahnsebastian/ltl.git', label: 'GITHUB', external: true },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              className="px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-r border-white/10 last:border-r-0"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="btn text-xs py-1.5 px-3 flex items-center gap-2"
              aria-label="Switch language"
              id="lang-switcher"
            >
              {isTranslating ? (
                <span className="cursor-blink">TRANSLATING_</span>
              ) : (
                <>
                  <span>{SUPPORTED_LANGS.find(l => l.code === currentLang)?.name ?? 'English'}</span>
                  <span className="text-white/40">▾</span>
                </>
              )}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-black border border-white z-50 w-40 max-h-64 overflow-y-auto">
                {SUPPORTED_LANGS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { onLangChange(lang.code); setLangOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-white hover:text-black transition-colors ${
                      currentLang === lang.code ? 'bg-white text-black' : ''
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
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
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white bg-black">
          {[
            { href: '/', label: 'ATLAS' },
            { href: '/whitepaper', label: 'WHITE PAPER' },
            { href: '/ltl-core.md', label: 'LTL CORE' },
            { href: 'https://github.com/hahnsebastian/ltl.git', label: 'GITHUB' },
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
