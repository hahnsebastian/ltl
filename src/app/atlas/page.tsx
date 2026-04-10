'use client'

import { useState } from 'react'
import AtlasGrid from '@/components/AtlasGrid'
import { CATEGORIES } from '@/lib/ltl-data'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="flex-1 flex flex-col text-foreground bg-background">
      <main className="flex-1 flex flex-col px-4 md:px-8 max-w-screen-2xl mx-auto w-full gap-8">
        {/* Header Hero */}
        <div className="pt-8 pb-4 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 relative">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4">
                LTL Atlas
              </h1>
            </div>

            <div className="flex gap-10 font-sans text-xs bg-white p-6 border border-border rounded-md backdrop-blur-sm group hover:border-foreground transition-all">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground mb-1 group-hover:text-foreground transition-colors font-bold uppercase tracking-tight">Compression Ratio</span>
                <span className="text-3xl font-bold text-foreground tracking-tighter">96.8%</span>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground mb-1 group-hover:text-foreground transition-colors font-bold uppercase tracking-tight">Pattern Registry</span>
                <span className="text-3xl font-bold text-foreground tracking-tighter">500,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Toolbar */}
        <div className="flex flex-col gap-4 z-10">
          <div className="relative group max-w-2xl">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white appearance-none border-none px-10 py-3 text-sm font-sans rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all placeholder:text-muted-foreground text-foreground border border-border"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-[8px] font-bold tracking-tight transition-all px-2 py-1"
                onClick={() => setSearchQuery('')}
              >
                [ Reset ]
              </button>
            )}
          </div>

          {/* Category Tabs - HIGH READABILITY */}
          <div className="flex flex-wrap gap-2 pt-1 transition-all">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 text-sm font-sans font-normal transition-all rounded-md border border-border ${!activeCategory ? 'bg-black text-white' : 'bg-white text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-3 py-1.5 text-sm font-sans font-normal transition-all rounded-md border border-border ${activeCategory === cat ? 'bg-black text-white' : 'bg-white text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
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
