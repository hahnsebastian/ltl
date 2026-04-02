'use client'

import { useState, useMemo, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { 
  LTL_ACTIONS, LTL_PERSONAS, LTL_CONSTRAINTS, LTL_SCOPES, LTL_OUTPUTS,
  FILLER_PATTERNS, SEMANTIC_PATTERNS,
  compileLTL, compressLTL, findBestMatchInAtlas, AtlasEntry
} from '@/lib/ltl-engine'

export default function LTLStudio() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [atlasDb, setAtlasDb] = useState<AtlasEntry[]>([])
  const [loadingDb, setLoadingDb] = useState(true)

  // Load the 500k-pattern registry asynchronously (174MB handling)
  useEffect(() => {
    fetch('/ltl-database.json')
      .then(res => res.json())
      .then(data => {
        setAtlasDb(data.database)
        setLoadingDb(false)
      })
      .catch(() => setLoadingDb(false))
  }, [])

  const result = useMemo(() => {
    if (!input.trim()) return null
    const compiled = compileLTL(input)
    const compressed = compressLTL(input)
    const atlasMatch = atlasDb.length > 0 ? findBestMatchInAtlas(input, atlasDb) : null
    
    const origTokens = Math.ceil(input.split(/\s+/).length * 1.35)
    const ltlTokens = Math.ceil(compressed.split(/\s+/).length * 1.35)
    const efficiency = Math.round((1 - ltlTokens / Math.max(1, origTokens)) * 100 * 10) / 10

    return { compiled, compressed, atlasMatch, efficiency, origTokens, ltlTokens }
  }, [input, atlasDb])

  // Combined Master Reference List
  const masterCommands = useMemo(() => {
    const list: { type: string, command: string, description: string }[] = []
    
    // Add LTL Commands
    Object.entries(LTL_ACTIONS).forEach(([k, v]) => list.push({ type: 'Action (!)', command: k, description: v }))
    Object.entries(LTL_PERSONAS).forEach(([k, v]) => list.push({ type: 'Persona (%)', command: k, description: v }))
    Object.entries(LTL_SCOPES).forEach(([k, v]) => list.push({ type: 'Scope (@)', command: k, description: v }))
    Object.entries(LTL_CONSTRAINTS).forEach(([k, v]) => list.push({ type: 'Constraint (#)', command: k, description: v }))
    Object.entries(LTL_OUTPUTS).forEach(([k, v]) => list.push({ type: 'Output (>)', command: k, description: v }))
    
    // Add Compressor Rules (Sample representatives)
    SEMANTIC_PATTERNS.forEach(([re, repl, cat]) => {
      list.push({ type: `Compressor [${cat || 'Rule'}]`, command: re.toString(), description: `Replaces matching phrase with "${repl}"` })
    })

    return list.sort((a, b) => a.type.localeCompare(b.type) || a.command.localeCompare(b.command))
  }, [])

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input/Output Studio */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          
          <div className="border border-white/20 p-8 bg-[#050505] relative overflow-hidden group">
            {loadingDb && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden">
                <div className="h-full bg-white animate-scan-fast" />
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">LTL_STUDIO <span className="text-white/20 text-sm font-normal">v2.5_UNIFIED</span></h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Integrated Compiler & Regex Compression Engine // Atlas v1.7.0 Enabled
                </p>
              </div>
              <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold text-right">
                {loadingDb ? 'SYNCING_ATLAS_DATA...' : `${atlasDb.length} CORES_CONNECTED`}
              </div>
            </div>

            <div className="flex flex-col gap-4">
               <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">INPUT_PROMPT_PAYLOAD</label>
               <textarea 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="PASTE NATURAL LANGUAGE PROMPT HERE..."
                 className="w-full h-48 bg-black border border-white/20 p-6 text-sm focus:border-white transition-all text-white placeholder:text-white/5"
               />
            </div>

            {result && (
              <div className="mt-12 flex flex-col gap-12 animate-in fade-in slide-in-from-top-4 duration-500">
                
                {/* Global Atlas Match */}
                {result.atlasMatch && (
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-bold text-yellow-400 uppercase tracking-[0.2em] border-l-2 border-yellow-400 pl-4">ATLAS_REGISTRY_MATCH [HIGH_FIDELITY]</h3>
                       <span className="text-[9px] text-white/20 uppercase tracking-widest">Pattern DISCOVERED FROM 500,000 INDEX</span>
                     </div>
                     <div className="bg-white/5 border border-yellow-400/20 p-8 flex flex-col gap-6 relative group/item overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-[40px] leading-none pointer-events-none group-hover/item:opacity-20 transition-opacity">MATCH_CORE</div>
                        <div className="flex flex-col gap-3">
                           <div className="text-2xl md:text-3xl font-bold tracking-tight text-yellow-400">
                              {result.atlasMatch.command}
                           </div>
                           <p className="text-[10px] text-white/40 italic uppercase leading-relaxed max-w-2xl">
                              "{result.atlasMatch.fullInstruction}"
                           </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/10 pt-8">
                           <div className="flex flex-col gap-1">
                              <div className="text-[9px] uppercase tracking-widest text-yellow-400/60 font-bold">PRE_DEFINED_EFFICIENCY</div>
                              <div className="text-2xl font-bold text-white">
                                 {result.atlasMatch.efficiency}% <span className="text-[10px] text-white/20 ml-2 font-normal">TOK_SAVED: {result.atlasMatch.standardTokens - result.atlasMatch.ltlTokens}</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => copy(result.atlasMatch!.command)}
                             className="text-[11px] font-bold border-2 border-yellow-400/20 text-yellow-400 px-10 py-3 hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.05)]"
                           >
                              {copied ? '[ ATLAS_PAYLOAD_COPIED ]' : '[ COPY_ATLAS_COMMAND ]'}
                           </button>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[1px] bg-yellow-400/30 w-full animate-scan-slow opacity-20" />
                     </div>
                  </div>
                )}

                {/* LTL Symbols (Compiler) */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] border-l-2 border-blue-400 pl-4">LTL_SEMANTIC_SYMBOLS [DYNAMIC_CORE]</h3>
                     <span className="text-[9px] text-white/20 uppercase tracking-widest">Derived via Real-Time Semantic Analysis</span>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
                      <div className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">
                        {result.compiled?.primaryLTL}
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {Object.entries(result.compiled?.foundTokens || {}).map(([type, tokens]) => (
                           tokens.map(tok => (
                             <span key={tok} className="text-[10px] bg-white/10 px-2 py-1 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">
                               {tok}
                             </span>
                           ))
                         ))}
                      </div>
                   </div>
                </div>

                {/* Regex Shorthand (Compressor) */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-[11px] font-bold text-green-400 uppercase tracking-[0.2em] border-l-2 border-green-400 pl-4">REGEX_STRUCTURAL_SHORTHAND [DENSE_MAP]</h3>
                     <span className="text-[9px] text-white/20 uppercase tracking-widest">Optimized via Global Shorthand Dictionary</span>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-8 relative overflow-hidden">
                      <div className="text-xl md:text-2xl font-normal italic text-white/80 leading-relaxed font-sans border-l border-white/10 pl-6 z-10 relative">
                         {result.compressed}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/10 pt-8 z-10 relative">
                         <div className="flex flex-col gap-1">
                            <div className="text-[9px] uppercase tracking-widest text-green-400/60 font-bold">TOKEN_CRUSH_EFFICIENCY</div>
                            <div className="text-2xl font-bold text-green-400">
                               {result.efficiency}% <span className="text-[10px] text-white/20 ml-2 font-normal">REDUCED: {result.origTokens - result.ltlTokens} TOKENS</span>
                            </div>
                         </div>
                         <button 
                           onClick={() => copy(result.compressed)}
                           className="text-[11px] font-bold border-2 border-green-400/20 text-green-400 px-10 py-3 hover:bg-green-400 hover:text-black transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.05)]"
                         >
                            {copied ? '[ SHORTHAND_COPIED ]' : '[ COPY_SHORTHAND ]'}
                         </button>
                      </div>
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/20 animate-scan-mid" />
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Master Sorted Command List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="border border-white/10 h-[80vh] flex flex-col pt-6 bg-black relative">
            <h2 className="px-6 pb-4 text-[11px] font-bold text-white uppercase tracking-[0.3em] border-b border-white/10 flex items-center justify-between">
              MASTER_INDEX <span className="text-[8px] opacity-20 italic">v2.5_CORE</span>
            </h2>
            <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
              <div className="flex flex-col py-6 gap-6">
                {masterCommands.map((cmd, i) => (
                  <div key={i} className="group flex flex-col gap-1 border-l border-white/5 pl-4 hover:border-white transition-all cursor-pointer" onClick={() => setInput(prev => prev + ` ${cmd.command}`)}>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold font-mono group-hover:text-white transition-colors">{cmd.command}</span>
                       <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">{cmd.type}</span>
                    </div>
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors leading-relaxed uppercase">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white/5 text-[8px] text-white/20 text-center uppercase tracking-widest border-t border-white/10 font-bold">
              SYSTEM_READY {'//'} {masterCommands.length} CORE_PATTERNS {'//'} {atlasDb.length > 0 ? '500K_ATLAS_HOT' : 'ATLAS_SYNCING...'}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scan-slow {
          0% { transform: translateY(-300px); opacity: 0; }
          20% { opacity: 0.2; }
          80% { opacity: 0.2; }
          100% { transform: translateY(300px); opacity: 0; }
        }
        @keyframes scan-mid {
           0% { transform: translateY(-50px); opacity: 0; }
           50% { opacity: 0.5; }
           100% { transform: translateY(300px); opacity: 0; }
        }
        .animate-scan-fast { animation: scan-fast 1.5s linear infinite; }
        .animate-scan-slow { animation: scan-slow 10s linear infinite; }
        .animate-scan-mid { animation: scan-mid 4s linear infinite; }
      `}</style>
    </div>
  )
}
