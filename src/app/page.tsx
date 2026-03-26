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

      <main className="flex-1 flex flex-col px-4 md:px-8 max-w-screen-2xl mx-auto w-full gap-8">
        {/* Header Hero */}
        <div className="pt-8 pb-4 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 relative">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 uppercase">
                LTL ATLAS <span className="text-ltl-grey/20 text-xl font-normal lowercase tracking-widest">v1.0</span>
              </h1>
              <p className="text-xs md:text-sm text-ltl-grey/60 max-w-2xl leading-relaxed italic border-l border-white/5 pl-4">
                The global registry and technical specification for Less-Token-Language.
                A structured shorthand syntax designed to compress AI prompt instructions by up to 97%,
                reducing context window bloat and API costs via context caching.
              </p>
            </div>

            <div className="flex gap-10 font-mono text-[9px] uppercase tracking-[0.2em] bg-black/50 p-6 border border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all">
              <div className="flex flex-col items-end">
                <span className="text-ltl-grey/30 mb-1 group-hover:text-ltl-grey/40 transition-colors">COMPRESSION_RATIO</span>
                <span className="text-3xl font-bold text-white tracking-tighter">94.8%</span>
              </div>
              <div className="w-px bg-white/5" />
              <div className="flex flex-col items-end">
                <span className="text-ltl-grey/30 mb-1 group-hover:text-ltl-grey/40 transition-colors">PATTERN_REGISTRY</span>
                <span className="text-3xl font-bold text-white tracking-tighter">5,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Toolbar */}
        <div className="flex flex-col gap-4 z-10">
          <div className="relative group">
            <input
              type="text"
              placeholder="SEARCH VOCABULARY [ACTION, PERSONA, SCOPE, ETC...]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border-b border-white/5 py-3 text-xs font-mono focus:outline-none focus:border-white/20 transition-all uppercase tracking-[0.2em] placeholder:text-ltl-grey/10"
            />
            {searchQuery && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 text-ltl-grey/30 hover:text-white text-[8px] font-bold tracking-widest transition-all"
                onClick={() => setSearchQuery('')}
              >
                [ RESET_SEARCH ]
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 transition-all">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 text-[9px] font-bold transition-all uppercase tracking-[0.15em] ${!activeCategory ? 'bg-white text-black' : 'text-ltl-grey/30 hover:text-white/40'}`}
            >
              ALL
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-3 py-1 text-[9px] font-bold transition-all uppercase tracking-[0.15em] ${activeCategory === cat ? 'bg-white text-black' : 'text-ltl-grey/30 hover:text-white/40'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Atlas Data Grid */}
        <div className="flex-1 w-full mt-2">
           <AtlasGrid searchQuery={searchQuery} activeCategory={activeCategory} />
        </div>
      </main>
    </div>
  )
}
