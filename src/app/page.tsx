'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AtlasGrid from '@/components/AtlasGrid'
import { CATEGORIES } from '@/lib/ltl-data'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col pt-12">
      <Navbar />

      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-2xl mx-auto w-full gap-6">
        {/* Header Hero */}
        <div className="flex flex-col gap-4 border border-white p-6 md:p-8 relative overflow-hidden bg-black">
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-white/20 -mt-16 -mr-16 rotate-45 transform pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                LTL ATLAS <span className="text-white/20 text-xl">v1.0</span>
              </h1>
              <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                The global registry and technical specification for Less-Token-Language.
                A structured shorthand syntax designed to compress AI prompt instructions by up to 97%,
                reducing context window bloat and API costs via context caching.
              </p>
            </div>

            <div className="flex gap-6 font-mono text-xs border border-white/20 p-4 bg-white/5 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-white/40">AVG. COMPRESSION</span>
                <span className="text-2xl font-bold">94.8%</span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-end">
                <span className="text-white/40">REGISTERED PATTERNS</span>
                <span className="text-2xl font-bold">620</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 z-10">
          {/* Search */}
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">{'>'}</span>
            <input
              type="text"
              placeholder="SEARCH [ex: !ref, %SNR, OAuth, React, SQL, security...]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white px-8 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs px-2 py-1"
                onClick={() => setSearchQuery('')}
              >
                ✕ CLEAR
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${!activeCategory ? 'bg-white text-black' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}
            >
              ALL (620)
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors ${activeCategory === cat ? 'bg-white text-black' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Atlas Data Grid */}
        <div className="flex-1 w-full">
          <AtlasGrid searchQuery={searchQuery} activeCategory={activeCategory} />
        </div>
      </main>
    </div>
  )
}
