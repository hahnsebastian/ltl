'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AtlasGrid from '@/components/AtlasGrid'
import { CATEGORIES } from '@/lib/ltl-data'
import { useTranslation } from '@/lib/translate'
import { motion } from 'framer-motion'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const { currentLang, isTranslating, translate, error } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col pt-12">
      <Navbar currentLang={currentLang} onLangChange={(l) => translate([], l)} isTranslating={isTranslating} />
      
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-2xl mx-auto w-full gap-6">
        {/* Header Hero */}
        <div className="flex flex-col gap-4 border border-white p-6 md:p-8 relative overflow-hidden bg-black noise">
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-white/20 -mt-16 -mr-16 rotate-45 transform pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in glitch-hover relative inline-block">
                LTL ATLAS <span className="text-white/20 absolute -right-8 top-0 text-xl">v1.0</span>
              </h1>
              <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                The global registry and technical specification for Less-Token-Language.
                A highly optimized, structured shorthand syntax designed to compress AI prompt instructions by up to 97%, resulting in faster inference, reduced context window bloat, and lower API costs via context caching mechanics.
              </p>
            </div>
            
            <div className="flex gap-4 font-mono text-xs border border-white/20 p-4 bg-white/5 backdrop-blur-sm">
               <div className="flex flex-col items-end">
                 <span className="text-white/40">AVG. COMPRESSION</span>
                 <span className="text-2xl font-bold text-green-400">94.8%</span>
               </div>
               <div className="w-px bg-white/20" />
               <div className="flex flex-col items-end">
                 <span className="text-white/40">REGISTERED PATTERNS</span>
                 <span className="text-2xl font-bold">620</span>
               </div>
            </div>
          </div>
          
          {error && <div className="mt-4 text-red-500 text-xs font-bold font-mono bg-red-500/10 p-2 border border-red-500/20">{error}</div>}
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-col gap-4 z-10">
          {/* Search Box */}
          <div className="relative w-full group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">{'>'}</span>
            <input 
              type="text" 
              placeholder="SEARCH VOCABULARY [ex: !ref, %SNR, OAuth, React, SQL]" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white px-8 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white transition-all peer"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white font-bold px-2 py-1 bg-white/10"
                onClick={() => setSearchQuery('')}
              >
                ✕ CLEAR
              </button>
            )}
            <div className="absolute inset-0 border border-white/0 peer-focus:border-white/50 scale-[1.01] -z-10 transition-transform pointer-events-none" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full">
            <button 
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${!activeCategory ? 'bg-white text-black' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}
            >
              ALL
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors ${activeCategory === cat ? 'bg-white text-black' : 'border-white/30 text-white/70 hover:border-white hover:text-white'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Atlas Data Grid */}
        <div className="flex-1 w-full flex flex-col border border-white/30 bg-black/40 backdrop-blur-sm z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
           <AtlasGrid searchQuery={searchQuery} activeCategory={activeCategory} currentLang={currentLang} />
        </div>
      </main>
    </div>
  )
}
