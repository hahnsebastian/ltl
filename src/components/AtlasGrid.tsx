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
      <div className="flex flex-col items-center justify-center h-[400px] w-full text-white/20 p-8 border border-dashed border-white/20">
        <span className="text-xl mb-2 tracking-widest uppercase">zero_results_error</span>
        <span className="text-xs uppercase opacity-50">modify_filters_to_proceed</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-black overflow-hidden select-none border-t border-white">
      {/* Table Header */}
      <div className="h-10 border-b-2 border-white z-20 flex text-[9px] font-bold tracking-[0.25em] text-white uppercase sticky top-0 bg-black">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full h-full items-center">
          <div className="px-4 border-r border-white h-full flex items-center">LTL_CMND</div>
          <div className="px-4 border-r border-white h-full flex items-center">INSTRUCTION_SET</div>
          <div className="px-4 border-r border-white h-full flex items-center text-right justify-end font-black">TOK_SAVED</div>
          <div className="px-4 border-r border-white h-full flex items-center text-right justify-end font-black">EFFICIENCY</div>
          <div className="px-4 h-full flex items-center text-right justify-end font-black bg-white text-black">ACTION</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide">
        {filteredData.map((item) => (
          <div key={item.id} className="border-b border-white hover:bg-white/[0.03] transition-colors group">
            <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] w-full min-h-[56px] items-stretch text-[11px]">
              
              {/* Command */}
              <div className="px-4 py-3 font-mono border-r border-white flex flex-wrap gap-x-2 items-center">
                <span className="text-white/20 tracking-tighter">LTL</span>
                <span className="text-blue-400 font-bold">{item.scope}</span>
                <span className="text-red-400 font-bold">{item.action}</span>
                <span className="text-green-400 font-bold">{item.persona}</span>
                <span className="text-yellow-400 font-bold">{item.constraint}</span>
                <span className="text-purple-400 font-bold">{item.output}</span>
              </div>

              {/* Instruction */}
              <div className="px-4 py-3 text-white/60 leading-relaxed border-r border-white flex items-center bg-white/[0.01]">
                {item.fullInstruction}
              </div>

              {/* Tokens */}
              <div className="px-4 py-3 text-right flex items-center justify-end font-mono border-r border-white bg-black group-hover:bg-white group-hover:text-black transition-colors">
                <span className="line-through mr-2 opacity-20 text-[9px]">{item.standardTokens}</span>
                <span className="font-bold">{item.ltlTokens}</span>
              </div>

              {/* Efficiency */}
              <div className="px-4 py-3 text-right flex items-center justify-end border-r border-white bg-black group-hover:bg-white group-hover:text-black transition-colors">
                <span className="font-black text-xs">
                  {item.efficiency}%
                </span>
              </div>
              
              {/* Action */}
              <div className="px-4 py-3 text-right flex items-center justify-end bg-black">
                <button 
                  className="text-[9px] border-2 border-white px-3 py-1 bg-white text-black hover:bg-black hover:text-white transition-all uppercase font-black tracking-widest shadow-[4px_4px_0px_white] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
      <div className="h-6 flex justify-between items-center px-4 text-[8px] text-white/40 tracking-[0.3em] font-mono select-none uppercase border-t border-white mt-1">
        <div>DB_IDX: {LTL_DATABASE.length} // FILTERED: {filteredData.length}</div>
        <div className="animate-pulse flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          SYSTEM_STABLE // LIVE_DATA_FEED
        </div>
      </div>
    </div>
  )
}
