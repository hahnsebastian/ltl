import { memo, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { LTL_DATABASE, LTLEntry } from '@/lib/ltl-data'

interface AtlasGridProps {
  searchQuery: string
  activeCategory: string | null
  currentLang: string
}

export default function AtlasGrid({ searchQuery, activeCategory, currentLang }: AtlasGridProps) {
  const fuse = useMemo(() => new Fuse(LTL_DATABASE, {
    keys: ['command', 'fullInstruction', 'category', 'scope', 'action', 'persona'],
    threshold: 0.3,
  }), [])

  const filteredData = useMemo(() => {
    let result = LTL_DATABASE

    if (activeCategory) {
      result = result.filter(item => item.category === activeCategory)
    }

    if (searchQuery) {
      result = fuse.search(searchQuery).map(res => res.item)
    }

    return result
  }, [searchQuery, activeCategory, fuse])

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full text-white/50 p-8 border border-dashed border-white/20">
        <span className="text-2xl mb-2">0 RESULTS FOUND</span>
        <span className="text-sm">ADJUST YOUR QUERY PARAMETERS</span>
      </div>
    )
  }

  return (
    <div className="h-[600px] md:h-[700px] w-full border border-white relative flex flex-col bg-black/50">
      {/* Header */}
      <div className="h-10 border-b border-white bg-black z-20 flex text-xs font-bold tracking-widest text-white/50 uppercase sticky top-0">
        <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[1.5fr_2fr_120px_100px_80px] gap-4 w-full h-full px-4 items-center">
          <div>LTL COMMAND</div>
          <div>INSTRUCTION PAYLOAD</div>
          <div className="text-right hidden sm:block">TOKENS</div>
          <div className="text-right hidden sm:block">EFFICIENCY</div>
          <div className="text-right hidden sm:block">ACTION</div>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-w-max sm:min-w-0">
          {filteredData.map((item, index) => (
            <div key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
              <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[1.5fr_2fr_120px_100px_80px] gap-4 px-4 py-3 min-h-[64px] items-center text-xs md:text-sm">
                
                {/* Command */}
                <div className="font-bold font-mono">
                  <span className="text-white/40">LTL</span>{' '}
                  <span className="text-blue-400">{item.scope}</span>{' '}
                  <span className="text-red-400">{item.action}</span>{' '}
                  <span className="text-green-400">{item.persona}</span>{' '}
                  <span className="text-yellow-400">{item.constraint}</span>{' '}
                  <span className="text-purple-400">{item.output}</span>
                </div>

                {/* Instruction */}
                <div className="text-white/70 truncate whitespace-normal sm:whitespace-nowrap sm:overflow-hidden" title={item.fullInstruction}>
                  {currentLang === 'en' ? item.fullInstruction : `[${currentLang.toUpperCase()}]: ${item.fullInstruction}`}
                </div>

                {/* Tokens */}
                <div className="text-right text-white/50 font-mono hidden sm:block">
                  <span className="line-through mr-2">{item.standardTokens}</span>
                  <span className="text-white font-bold">{item.ltlTokens}</span>
                </div>

                {/* Efficiency */}
                <div className="text-right hidden sm:block">
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold border ${
                    item.efficiency > 95 ? 'border-green-500 text-green-500' :
                    item.efficiency > 92 ? 'border-blue-500 text-blue-500' :
                    'border-white/50 text-white'
                  }`}>
                    {item.efficiency}% SAVED
                  </span>
                </div>
                
                {/* Action */}
                <div className="text-right hidden sm:block">
                  <button 
                    className="text-[10px] btn opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    onClick={() => navigator.clipboard.writeText(item.command)}
                  >
                    COPY
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-white/20 bg-black/90 flex justify-between items-center px-4 text-[10px] text-white/40 tracking-widest font-mono z-10 pointer-events-none sticky bottom-0">
        <div>TOTAL RECORDS: <span className="text-white">{LTL_DATABASE.length}</span></div>
        <div>FILTERED: <span className="text-white">{filteredData.length}</span></div>
        <div>RENDER MODE: <span className="text-green-500">NATIVE DOM (FREE TIER)</span></div>
      </div>
    </div>
  )
}
