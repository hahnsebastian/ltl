'use client'

import { useMemo, useState, useEffect } from 'react'
import Fuse from 'fuse.js'

interface LTLEntry {
  id: number
  command: string
  category: string
  fullInstruction: string
  standardTokens: number
  ltlTokens: number
  efficiency: number
  scope: string
  action: string
  persona: string
  constraint: string
  output: string
}

interface AtlasGridProps {
  searchQuery: string
  activeCategory: string | null
}

export default function AtlasGrid({ searchQuery, activeCategory }: AtlasGridProps) {
  const [database, setDatabase] = useState<LTLEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(50)

  useEffect(() => {
    fetch('/ltl-database.json')
      .then(res => res.json())
      .then(data => {
        setDatabase(data.database)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fuse = useMemo(() => {
    if (database.length === 0) return null
    return new Fuse(database, {
      keys: ['command', 'fullInstruction', 'category', 'scope', 'action', 'persona'],
      threshold: 0.3,
    })
  }, [database])

  const filteredData = useMemo(() => {
    if (database.length === 0) return []
    let result = database

    if (activeCategory) {
      result = result.filter(item => item.category === activeCategory)
    }

    if (searchQuery && fuse) {
      result = fuse.search(searchQuery).map(res => res.item)
    }

    return result
  }, [searchQuery, activeCategory, database, fuse])

  useEffect(() => {
    setVisibleCount(50)
  }, [searchQuery, activeCategory])

  const paginatedData = useMemo(() => filteredData.slice(0, visibleCount), [filteredData, visibleCount])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full text-ltl-grey/30 p-8 border border-white/5 animate-pulse">
        <span className="text-xl mb-2 tracking-[0.4em] uppercase">LOADING_CORE_REGISTRY...</span>
        <span className="text-xs tracking-widest uppercase">SYNCHRONIZING_5000_PATTERNS</span>
      </div>
    )
  }

  if (filteredData.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full text-ltl-grey/30 p-8 border border-dashed border-white/5">
        <span className="text-xl mb-2 tracking-widest uppercase">ZERO_RESULTS</span>
        <span className="text-xs uppercase">ADJUST_QUERY</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-black overflow-hidden select-none border-t border-white/5">
      {/* Table Header */}
      <div className="h-10 border-b border-white/30 z-20 flex text-[9px] font-bold tracking-[0.2em] text-white uppercase sticky top-0 bg-black">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full h-full items-center">
          <div className="px-4 border-r border-white/10 h-full flex items-center">LTL_COMMAND</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center">INSTRUCTION_SET</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center text-right justify-end">TOK_SAVED</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center text-right justify-end">EFF_RATIO</div>
          <div className="px-4 h-full flex items-center text-right justify-end">ACTION</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[70vh] overflow-y-auto scrollbar-hide pb-20">
        {paginatedData.map((item) => (
          <div key={item.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group">
            <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full min-h-[52px] items-stretch text-[11px]">
              <div className="px-4 py-3 font-mono flex items-center border-r border-white/10 whitespace-nowrap overflow-hidden">
                <span className="text-ltl-grey/40 mr-2">LTL</span>
                <span className="text-blue-400/90">{item.scope}</span>
                <span className="mx-1 text-red-400/90">{item.action}</span>
                <span className="text-green-400/90">{item.persona}</span>
                <span className="mx-1 text-yellow-400/90">{item.constraint}</span>
                <span className="text-purple-400/90">{item.output}</span>
              </div>
              
              {/* Instruction - SOLID GREY for readability */}
              <div className="px-4 py-3 text-ltl-grey leading-relaxed border-r border-white/10 flex items-center italic overflow-hidden">
                <span className="truncate">{item.fullInstruction}</span>
              </div>

              <div className="px-4 py-3 text-right flex items-center justify-end font-mono border-r border-white/10">
                <span className="line-through mr-2 text-ltl-grey/20 text-[9px]">{item.standardTokens}</span>
                <span className="text-white/90 font-bold">{item.ltlTokens}</span>
              </div>
              <div className="px-4 py-3 text-right flex items-center justify-end border-r border-white/10">
                <span className="text-ltl-grey font-medium tracking-tighter">{item.efficiency}%</span>
              </div>
              <div className="px-4 py-3 text-right flex items-center justify-end">
                <button 
                  className="text-[8px] border border-white/20 px-2 py-1 hover:bg-white hover:text-black hover:border-white transition-all opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest text-white/70"
                  onClick={() => navigator.clipboard.writeText(item.command)}
                >
                  COPY
                </button>
              </div>
            </div>
          </div>
        ))}

        {visibleCount < filteredData.length && (
          <div className="p-8 flex justify-center border-t border-white/10">
            <button 
              onClick={() => setVisibleCount(prev => prev + 100)}
              className="px-6 py-2 border border-white/30 text-[10px] tracking-widest hover:bg-white hover:text-black transition-all font-bold uppercase text-white/80"
            >
              LOAD_MORE_RECORDS [{filteredData.length - visibleCount} REMAINING]
            </button>
          </div>
        )}
      </div>

      {/* Simple Status */}
      <div className="h-6 flex justify-between items-center px-4 text-[7px] text-ltl-grey/40 tracking-[0.25em] font-mono select-none bg-black">
        <div>DATABASE_v1.2: {database.length} // VISIBLE: {paginatedData.length} // FILTERED: {filteredData.length}</div>
        <div className="animate-pulse opacity-50 uppercase">PERFORMANCE_STABLE</div>
      </div>
    </div>
  )
}
