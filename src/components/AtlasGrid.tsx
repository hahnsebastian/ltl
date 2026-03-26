import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { LTL_DATABASE } from '@/lib/ltl-data'

interface AtlasGridProps {
  searchQuery: string
  activeCategory: string | null
}

export default function AtlasGrid({ searchQuery, activeCategory }: AtlasGridProps) {
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
      <div className="flex flex-col items-center justify-center h-[400px] w-full text-ltl-grey/10 p-8 border border-dashed border-white/5">
        <span className="text-xl mb-2 tracking-widest uppercase">ZERO_RESULTS</span>
        <span className="text-xs opacity-50 uppercase">ADJUST_QUERY</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-black overflow-hidden select-none">
      {/* Table Header */}
      <div className="h-10 border-b border-white z-20 flex text-[9px] font-bold tracking-[0.2em] text-ltl-grey uppercase sticky top-0 bg-black">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full h-full items-center">
          <div className="px-4 border-r border-white/5 h-full flex items-center">LTL_COMMAND</div>
          <div className="px-4 border-r border-white/5 h-full flex items-center">INSTRUCTION_SET</div>
          <div className="px-4 border-r border-white/5 h-full flex items-center text-right justify-end">TOK_SAVED</div>
          <div className="px-4 border-r border-white/5 h-full flex items-center text-right justify-end">EFF_RATIO</div>
          <div className="px-4 h-full flex items-center text-right justify-end">ACTION</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide">
        {filteredData.map((item) => (
          <div key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
            <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full min-h-[52px] items-stretch text-[11px]">
              
              {/* Command */}
              <div className="px-4 py-3 font-mono flex items-center border-r border-white/5 whitespace-nowrap overflow-hidden">
                <span className="text-ltl-grey/20 mr-2">LTL</span>
                <span className="text-blue-400/80">{item.scope}</span>
                <span className="mx-1 text-red-400/80">{item.action}</span>
                <span className="text-green-400/80">{item.persona}</span>
                <span className="mx-1 text-yellow-400/80">{item.constraint}</span>
                <span className="text-purple-400/80">{item.output}</span>
              </div>

              {/* Instruction */}
              <div className="px-4 py-3 text-ltl-grey/40 leading-relaxed border-r border-white/5 flex items-center italic overflow-hidden">
                <span className="truncate">{item.fullInstruction}</span>
              </div>

              {/* Tokens */}
              <div className="px-4 py-3 text-right flex items-center justify-end font-mono border-r border-white/5">
                <span className="line-through mr-2 text-ltl-grey/15 text-[9px]">{item.standardTokens}</span>
                <span className="text-white/80 font-bold">{item.ltlTokens}</span>
              </div>

              {/* Efficiency */}
              <div className="px-4 py-3 text-right flex items-center justify-end border-r border-white/5">
                <span className="text-ltl-grey/60 font-medium tracking-tighter">
                  {item.efficiency}%
                </span>
              </div>
              
              {/* Action */}
              <div className="px-4 py-3 text-right flex items-center justify-end">
                <button 
                  className="text-[8px] border border-white/10 px-2 py-1 hover:bg-white hover:text-black hover:border-white transition-all opacity-0 group-hover:opacity-100 uppercase font-bold tracking-widest text-white/50"
                  onClick={() => navigator.clipboard.writeText(item.command)}
                >
                  COPY
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Simple Status */}
      <div className="h-6 flex justify-between items-center px-4 text-[7px] text-ltl-grey/15 tracking-[0.25em] font-mono select-none">
        <div>DB_IDX_v1.0: {LTL_DATABASE.length} {'//'} FILTERED: {filteredData.length}</div>
        <div className="animate-pulse opacity-50 uppercase">STABLE</div>
      </div>
    </div>
  )
}
