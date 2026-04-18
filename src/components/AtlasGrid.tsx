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
  const [userInteracted, setUserInteracted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (isMobile && !userInteracted) return

    fetch('/ltl-database.json')
      .then(res => res.json())
      .then(data => {
        setDatabase(data.database)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userInteracted, isMobile])

  if (isMobile && !userInteracted) {
    return (
      <div 
        onClick={() => setUserInteracted(true)}
        className="flex flex-col items-center justify-center h-[400px] w-full text-foreground p-8 border border-dashed border-border rounded-md bg-white cursor-pointer hover:bg-secondary transition-all group"
      >
        <div className="w-12 h-12 mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        </div>
        <span className="text-lg mb-2 font-bold tracking-tight">Load Atlas Patterns</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">500k Domain-specific sigils (~12MB)</span>
      </div>
    )
  }

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

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.command.toLowerCase().includes(q) || 
        item.fullInstruction.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    }

    return result
  }, [searchQuery, activeCategory, database])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full text-foreground p-8 border border-border animate-pulse bg-white rounded-md">
        <span className="text-xl mb-2 tracking-tight">Syncing global core...</span>
        <span className="text-xs tracking-tight">Synchronizing 500k domain-specific patterns</span>
      </div>
    )
  }

  if (filteredData.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full text-foreground p-8 border border-dashed border-border rounded-md bg-white">
        <span className="text-xl mb-2 tracking-tight">Zero results</span>
        <span className="text-xs">Adjust query</span>
      </div>
    )
  }

  // Row Renderer for Virtualized List
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredData[index]
    if (!item) return null

    return (
      <div style={style} className="border-b border-border hover:bg-secondary transition-colors group">
        <div className="grid grid-cols-[80px_1.5fr_2fr_120px_100px_80px] w-full h-full items-stretch text-[11px]">
          <div className="px-2 py-3 font-mono flex items-center justify-center border-r border-border text-foreground">
            {index + 1}
          </div>
          <div className="px-4 py-3 font-mono flex items-center border-r border-border whitespace-nowrap overflow-hidden">
            <span className="text-muted-foreground mr-2 shrink-0">Ltl</span>
            <div className="flex items-center overflow-hidden">
                <span className="text-blue-600 font-bold">{item.scope}</span>
                <span className="mx-1 text-red-600 font-bold">{item.action}</span>
                <span className="text-green-600 font-bold">{item.persona}</span>
                <span className="mx-1 text-yellow-600 font-bold">{item.constraint}</span>
                <span className="text-purple-600 font-bold">{item.output}</span>
            </div>
          </div>
          
          <div className="px-4 py-3 text-foreground leading-relaxed border-r border-border flex items-center italic overflow-hidden">
            <span className="truncate">{item.fullInstruction}</span>
          </div>

          <div className="px-4 py-3 text-right flex items-center justify-end font-mono border-r border-border">
            <span className="line-through mr-2 text-muted-foreground text-[9px]">{item.standardTokens}</span>
            <span className="text-foreground font-bold">{item.ltlTokens}</span>
          </div>
          <div className="px-4 py-3 text-right flex items-center justify-end border-r border-border">
            <span className="text-foreground font-bold tracking-tighter">{item.efficiency}%</span>
          </div>
          <div className="px-4 py-3 text-right flex items-center justify-end">
            <button 
              className="text-[8px] bg-primary text-primary-foreground px-2 py-1 hover:bg-primary/90 transition-all opacity-0 group-hover:opacity-100 font-bold rounded"
              onClick={() => navigator.clipboard.writeText(item.command)}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden select-none border border-border rounded-md">
      <div className="overflow-x-auto w-full scrollbar-hide">
        <div className="min-w-[800px] flex flex-col w-full">
          {/* Table Header */}
          <div className="h-10 border-b border-border z-20 flex text-xs font-sans font-bold text-muted-foreground bg-white">
            <div className="grid grid-cols-[80px_1.5fr_2fr_120px_100px_80px] w-full h-full items-center">
              <div className="px-2 border-r border-border h-full flex items-center justify-center">Id</div>
              <div className="px-4 border-r border-border h-full flex items-center">LTL command</div>
              <div className="px-4 border-r border-border h-full flex items-center">Instruction set</div>
              <div className="px-4 border-r border-border h-full flex items-center text-right justify-end">Tok saved</div>
              <div className="px-4 border-r border-border h-full flex items-center text-right justify-end">Eff ratio</div>
              <div className="px-4 h-full flex items-center text-right justify-end">Action</div>
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
        </div>
      </div>

      {/* Simple Status */}
      <div className="h-6 flex justify-between items-center px-4 text-[7px] text-muted-foreground font-mono select-none bg-white border-t border-border">
        <div>Registry Alpha: {database.length} {'//'} All records active: {filteredData.length} {'//'} Latency: 0.1ms</div>
        <div className="animate-pulse opacity-50">Data virtualization 500k stable</div>
      </div>
    </div>
  )

}
