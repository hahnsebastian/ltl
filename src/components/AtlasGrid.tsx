import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { LTL_DATABASE, LTLEntry } from '@/lib/ltl-data'

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
      <div className="flex flex-col items-center justify-center h-[500px] w-full text-white/50 p-8 border border-dashed border-white/20">
        <span className="text-2xl mb-2 tracking-widest">ZERO RESULTS</span>
        <span className="text-sm">ADJUST QUERY PARAMETERS</span>
      </div>
    )
  }

  return (
    <div className="w-full border border-white flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white bg-black z-20 flex text-[10px] font-bold tracking-widest text-white/50 uppercase sticky top-0">
        <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] gap-4 w-full h-full px-4 items-center">
          <div>LTL_COMMAND</div>
          <div>INSTRUCTION_PAYLOAD</div>
          <div className="text-right">TOKENS</div>
          <div className="text-right">EFFICIENCY</div>
          <div className="text-right">ACTION</div>
        </div>
      </div>

      {/* Main List */}
      <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
        {filteredData.map((item) => (
          <div key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
            <div className="grid grid-cols-[1.5fr_2fr_120px_100px_80px] gap-4 px-4 py-4 min-h-[64px] items-center text-xs">
              
              {/* Command - COLORS ADDED HERE */}
              <div className="font-bold font-mono">
                <span className="text-white/40">LTL</span>{' '}
                <span className="text-blue-400">{item.scope}</span>{' '}
                <span className="text-red-400">{item.action}</span>{' '}
                <span className="text-green-400">{item.persona}</span>{' '}
                <span className="text-yellow-400">{item.constraint}</span>{' '}
                <span className="text-purple-400">{item.output}</span>
              </div>

              {/* Instruction */}
              <div className="text-white/70 whitespace-normal leading-relaxed pr-4">
                {item.fullInstruction}
              </div>

              {/* Tokens */}
              <div className="text-right text-white/50 font-mono">
                <span className="line-through mr-2 opacity-30">{item.standardTokens}</span>
                <span className="text-white font-bold">{item.ltlTokens}</span>
              </div>

              {/* Efficiency */}
              <div className="text-right">
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold border border-white text-white">
                  {item.efficiency}%_SAVED
                </span>
              </div>
              
              {/* Action */}
              <div className="text-right">
                <button 
                  className="text-[9px] hover:bg-white hover:text-black border border-white px-2 py-1 transition-all opacity-0 group-hover:opacity-100"
                  onClick={() => navigator.clipboard.writeText(item.command)}
                >
                  COPY
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="h-8 border-t border-white/20 bg-black flex justify-between items-center px-4 text-[9px] text-white/40 tracking-widest font-mono">
        <div className="flex gap-4">
          <div>RECORDS: <span className="text-white">{LTL_DATABASE.length}</span></div>
          <div>VIEW: <span className="text-white">{filteredData.length}</span></div>
        </div>
        <div>ST_MODE: <span className="text-white">ULTRA_FAST</span></div>
      </div>
    </div>
  )
}
