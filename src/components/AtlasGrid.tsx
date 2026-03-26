'use client'

import { useMemo, useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full text-ltl-grey/30 p-8 border border-white/5 animate-pulse">
        <span className="text-xl mb-2 tracking-[0.4em] uppercase">SYNCING_GLOBAL_CORE...</span>
        <span className="text-xs tracking-widest uppercase">SYNCHRONIZING_5000_PATTERNS_INSTANT</span>
      </div>
    )
  }

  if (filteredData.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full text-ltl-grey/30 p-8 border border-dashed border-white/5">
        <span className="text-xl mb-2 tracking-widest uppercase">ZERO_RESULTS</span>
        <span className="text-xs uppercase">ADJUST_QUERY</span>
      </div>
    )
  }

  // Row Renderer for Virtualized List
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredData[index]
    if (!item) return null

    return (
      <div style={style} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full h-full items-stretch text-[11px]">
          <div className="px-4 py-3 font-mono flex items-center border-r border-white/10 whitespace-nowrap overflow-hidden">
            <span className="text-ltl-grey/40 mr-2 shrink-0">LTL</span>
            <div className="flex items-center overflow-hidden">
                <span className="text-blue-400/90">{item.scope}</span>
                <span className="mx-1 text-red-400/90">{item.action}</span>
                <span className="text-green-400/90">{item.persona}</span>
                <span className="mx-1 text-yellow-400/90">{item.constraint}</span>
                <span className="text-purple-400/90">{item.output}</span>
            </div>
          </div>
          
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
    )
  }

  return (
    <div className="w-full flex flex-col bg-black overflow-hidden select-none border border-white/5">
      {/* Table Header */}
      <div className="h-10 border-b border-white/30 z-20 flex text-[9px] font-bold tracking-[0.2em] text-white uppercase bg-black">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full h-full items-center">
          <div className="px-4 border-r border-white/10 h-full flex items-center">LTL_COMMAND</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center">INSTRUCTION_SET</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center text-right justify-end">TOK_SAVED</div>
          <div className="px-4 border-r border-white/10 h-full flex items-center text-right justify-end">EFF_RATIO</div>
          <div className="px-4 h-full flex items-center text-right justify-end">ACTION</div>
        </div>
      </div>

      {/* Table Body - HIGH PERFORMANCE VIRTUALIZED SCROLL */}
      <div className="h-[70vh] w-full">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={filteredData.length}
              itemSize={48}
              width={width}
              className="scrollbar-hide"
              overscanCount={10}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>

      {/* Simple Status */}
      <div className="h-6 flex justify-between items-center px-4 text-[7px] text-ltl-grey/40 tracking-[0.25em] font-mono select-none bg-black border-t border-white/5">
        <div>REGISTRY_v1.2: {database.length} // ALL_RECORDS_ACTIVE: {filteredData.length} // LATENCY: 0.2ms</div>
        <div className="animate-pulse opacity-50 uppercase">VIRTUALIZATION_STABLE</div>
      </div>
    </div>
  )
}
