'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:no-underline group h-8">
          <Image src="/logo.png" alt="LTL Logo" width={24} height={24} className="object-contain" />
          <span className="text-sm text-foreground font-normal ml-1 hidden sm:inline group-hover:underline">
            Less-Token-Language
          </span>
          <span className="text-sm text-muted-foreground hidden md:inline font-normal">Alpha</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center text-sm h-full gap-8">
          {[
            { href: '/atlas', label: 'Atlas' },
            { href: '/compiler', label: 'Compiler' },
            { href: 'https://github.com/hahnsebastian/ltl/releases/tag/LTL_SYNTAX', label: 'Syntax' },
            { href: 'https://github.com/hahnsebastian/ltl', label: 'GitHub' },
          ].map(link => {
            const isExternal = link.href.startsWith('http');
            return (
              <Link
                key={link.label}
                href={link.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-center text-foreground hover:underline transition-all font-normal"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden py-1.5 px-3 text-xs font-bold text-foreground"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          {[
            { href: '/atlas', label: 'Atlas' },
            { href: '/compiler', label: 'Compiler' },
            { href: 'https://github.com/hahnsebastian/ltl/releases/tag/LTL_SYNTAX', label: 'Syntax' },
            { href: 'https://github.com/hahnsebastian/ltl', label: 'GitHub' },
          ].map(link => {
            const isExternal = link.href.startsWith('http');
            return (
              <Link
                key={link.label}
                href={link.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-4 text-xs hover:underline font-bold text-foreground"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  )
}
