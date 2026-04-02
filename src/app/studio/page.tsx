'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import {
  resolveLTL2, compressToLTL, compileLTL, discoverPatterns
} from '@/lib/ltl-engine'

export default function LTLHybridStudio() {
  const [importInput, setImportInput] = useState(`You are a scouting support analyst. Your task is to create a player report for the following player: Soufiane El Faouzi.

The report MUST follow the exact structure and headings shown below. For each main section, write exactly one coherent paragraph in a narrative scouting style. Do not use statistics, numbers, or bullet points in the descriptions.

Structure:
- Relevant Player Context: Discuss position, formations, tactical role, and zones.
- Attacking (+attacking transition): Discuss runs, receiving, touch, passing, and box presence.
- Defending (+defensive transition): Discuss pressing, duels, tracking, and recovery.
- Conclusion: Discuss strengths, weaknesses, role-type and Premier League suitability.
- Grade: Select one grade from [A+, A, B, C, D] with implicit justification.

If the player is Premier League caliber, ensure to emphasize role-type suitability. Use a traditional scout's voice: precise and no filler.`)
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [atlasDb, setAtlasDb] = useState<any[]>([])
  const [loadingDb, setLoadingDb] = useState(true)
  const [validationFailures, setValidationFailures] = useState<string[]>([])
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const importTextareaRef = useRef<HTMLTextAreaElement>(null)
  const importHighlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/ltl-database.json')
      .then(res => res.json())
      .then(data => { setAtlasDb(data.database); setLoadingDb(false) })
      .catch(() => setLoadingDb(false))
  }, [])

  const result = useMemo(() => {
    return resolveLTL2(input)
  }, [input])

  const importResult = useMemo(() => {
    if (!importInput.trim()) return null
    return compileLTL(importInput)
  }, [importInput])

  const suggestions = useMemo(() => {
    if (!importInput || atlasDb.length === 0) return []
    return discoverPatterns(importInput, atlasDb)
  }, [importInput, atlasDb])

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runImport = () => {
    if (!importInput.trim()) return
    const ltlCode = compressToLTL(importInput)
    setInput(ltlCode)
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>, target: React.RefObject<HTMLDivElement | null>) => {
    if (target.current) {
      target.current.scrollTop = e.currentTarget.scrollTop
      target.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  const highlightLTL = (line: string) => {
    const rules = [
      { re: /\/\/.*$/, color: 'text-white/20 italic' },
      { re: /\$\w+/, color: 'text-cyan-400' },
      { re: />depth:\d+/, color: 'text-green-400 font-black' },
      { re: /\?if|\?else|\?elif/, color: 'text-yellow-300 font-bold' },
      { re: /!foreach|!run/, color: 'text-orange-400' },
      { re: /:template|:end/, color: 'text-purple-400 font-black' },
      { re: /!!\w+/, color: 'text-red-500 font-black' },
      { re: />>\w+/, color: 'text-white font-black' },
      { re: /@[\w-]+/, color: 'text-cyan-300 font-black' },
      { re: /![A-Za-z]+:/, color: 'text-purple-400 font-black underline' },
      { re: /#[^\s]+/, color: 'text-orange-400 font-bold' },
      { re: />[^\s]+/, color: 'text-green-400 font-bold' },
      { re: /\[.*\|.*\]/, color: 'text-yellow-200 opacity-60' },
    ]

    let tokens = line.split(/(\s+)/)
    return (
      <>
        {tokens.map((token, i) => {
          let color = 'text-white/60'
          for (const rule of rules) {
            if (rule.re.test(token)) {
              color = rule.color
              break
            }
          }
          return <span key={i} className={color}>{token}</span>
        })}
      </>
    )
  }

  const highlightNL = useMemo(() => {
    if (!importInput || !importResult) return importInput
    const usedWords = importResult.usedWords
    const tokens = importInput.split(/(\s+)/)
    
    return tokens.map((token, i) => {
      const clean = token.toLowerCase().replace(/[^a-z0-9]/gi, '')
      if (usedWords.has(clean) || ['you', 'task', 'following', 'player', 'scout', 'attacking', 'defending', 'context', 'report'].includes(clean)) {
        return <mark key={i} className="bg-white/10 text-white rounded-sm inline-block px-0.5 tracking-tighter">{token}</mark>
      }
      return <span key={i} className="opacity-0">{token}</span>
    })
  }, [importInput, importResult])

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col pt-12 font-mono scrollbar-hide">
      <Navbar />

      <header className="px-4 pt-12 pb-4 border-b border-white/5 bg-black flex flex-col items-center">
        <div className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-center px-4">
             <div className="flex gap-4 items-center">
                <span className="text-[11px] font-black tracking-[0.4em] text-white/40 uppercase italic">/ PROMPT_IDE // CORE</span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">{loadingDb ? 'CALIBRATING CORE' : 'ATLAS_ONLINE'}</span>
                {input && (
                  <>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-[10px] bg-green-500/10 text-green-500/80 px-3 py-1 font-black tracking-[0.2em] border border-green-500/20">THRIFT_Gains: +{Math.max(0, Math.round((1 - (Math.ceil(input.split(/\s+/).length * 1.33) / Math.ceil(importInput.split(/\s+/).length * 1.33))) * 100))}%</span>
                  </>
                )}
             </div>
             <div className="flex gap-6 items-center">
                <button onClick={() => { setInput(''); setImportInput('') }} className="text-[10px] opacity-20 hover:opacity-100 transition-opacity uppercase tracking-widest font-black">X_WIPE</button>
                <button 
                  onClick={runImport}
                  disabled={!importInput.trim()}
                  className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:invert transition-all active:scale-[0.98]"
                >
                  INITIALIZE_PROMPT
                </button>
             </div>
          </div>
          
          <div className="relative flex flex-col border border-white/10 bg-white/[0.01] focus-within:border-white/20 transition-all group overflow-hidden h-[180px]">
             <div 
               ref={importHighlightRef}
               className="absolute inset-0 p-6 pr-4 text-base font-normal whitespace-pre-wrap pointer-events-none overflow-hidden text-transparent select-none leading-relaxed tracking-tight italic"
             >
               {highlightNL}
             </div>

             <textarea 
               ref={importTextareaRef}
               value={importInput}
               onChange={e => setImportInput(e.target.value)}
               onScroll={(e) => handleScroll(e, importHighlightRef)}
               placeholder="Drop natural language prompt here to discover LTL shorthands from the Atlas..."
               className="absolute inset-0 bg-transparent border-none outline-none p-6 pr-4 text-base font-normal text-white/40 placeholder:text-white/5 resize-none leading-relaxed tracking-tight italic overflow-y-auto caret-white"
               spellCheck={false}
             />
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-0 overflow-hidden h-[calc(100vh-250px)]">
        
        {/* PANEL 1: LTL_SOURCE */}
        <section className="lg:col-span-4 border-r border-white/5 flex flex-col relative overflow-hidden h-full">
          <div className="p-2 border-b border-white/5 bg-black flex justify-between items-center px-6">
            <span className="text-[10px] font-black tracking-widest uppercase text-white/30 italic">LTL_SOURCE</span>
            <span className="text-[9px] text-white/10 uppercase font-black">{Math.ceil(input.split(/\s+/).length * 1.33)} TK</span>
          </div>
          
          <div className="flex-1 relative bg-[#050505] overflow-hidden">
             <div className="absolute left-6 top-0 w-8 text-right pr-6 py-5 text-[10px] text-white/5 select-none pointer-events-none font-bold">
              {input.split('\n').map((_, i) => <div key={i} className="h-[24px] leading-[24px]">{i + 1}</div>)}
            </div>

            <div className="relative ml-20 py-5 h-full">
              <div ref={highlightRef} className="absolute inset-0 px-2 pointer-events-none whitespace-pre text-[14px] font-medium leading-[24px] py-5 overflow-hidden">
                {input.split('\n').map((line, i) => (
                  <div key={i} className="min-h-[24px] leading-[24px]"> {highlightLTL(line)} </div>
                ))}
              </div>

              <textarea
                ref={editorRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onScroll={(e) => handleScroll(e, highlightRef)}
                className="block w-full bg-transparent border-none outline-none resize-none px-2 text-[14px] font-medium leading-[24px] text-transparent caret-white selection:bg-white/10 whitespace-pre overflow-hidden h-full"
                spellCheck={false}
              />
            </div>
          </div>
        </section>

        {/* RIGHT SIDE CONTAINER */}
        <section className="lg:col-span-6 flex flex-col h-full overflow-hidden bg-black">
          <div className="flex-1 grid grid-rows-2 h-full overflow-hidden">
             
             <div className="grid grid-cols-2 border-b border-white/5 overflow-hidden">
                <div className="border-r border-white/5 flex flex-col overflow-hidden bg-black">
                  <div className="p-2 border-b border-white/5 bg-black text-[10px] font-black tracking-widest uppercase px-6 italic text-white/30">STATE_INSPECTOR</div>
                  <div className="flex-1 p-5 overflow-y-auto scrollbar-hide">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                      <tr className="border-b border-white/10 text-white/10">
                        <th className="pb-2 font-normal uppercase tracking-widest">NS</th>
                        <th className="pb-2 font-normal uppercase tracking-widest text-right">BINDING / ENUM</th>
                      </tr>
                      </thead>
                      <tbody>
                      {Object.entries(result.variables).map(([key, data]) => (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 text-cyan-400 font-black opacity-80">${key}</td>
                          <td className="py-2 text-right">
                             {data.enum ? (
                               <div className="flex gap-2 justify-end">
                                 {data.enum.map((v, i) => (
                                   <span key={i} className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-white/40 uppercase font-black">{v}</span>
                                 ))}
                               </div>
                             ) : (
                               <span className="opacity-30 italic font-sans">{data.value}</span>
                             )}
                          </td>
                        </tr>
                      ))}
                      {Object.entries(result.agents).map(([name, role]) => (
                        <tr key={name} className="border-b border-white/5">
                           <td className="py-2 text-purple-400 font-black">%agent[{name}]</td>
                           <td className="py-2 text-right opacity-30 italic">{role}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col overflow-hidden bg-black">
                  <div className="p-2 border-b border-white/5 bg-black text-[10px] font-black tracking-widest uppercase px-6 italic text-white/30">PATTERN_REGISTRY</div>
                  <div className="flex-1 p-5 overflow-y-auto scrollbar-hide space-y-4">
                    {/* Atlas Discoveries */}
                    {suggestions.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <div className="text-[9px] font-black text-white/10 tracking-[0.3em] uppercase underline underline-offset-4">ATLAS_DISCOVERIES</div>
                        {suggestions.map((s, i) => (
                          <div key={i} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-[10px] font-black cursor-pointer hover:bg-white/10 transition-all font-mono">
                            {s}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sections Visualization */}
                    {result.sections.length > 0 && (
                      <div className="space-y-4">
                         <div className="text-[9px] font-black text-white/10 tracking-[0.3em] uppercase">Structural Sections</div>
                         {result.sections.map((s, i) => (
                            <div key={i} className="border-l border-white/10 pl-3 py-1 bg-white/[0.01]">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black text-white/60 tracking-tighter uppercase">@{s.name}</span>
                                  <span className="text-[8px] bg-green-500/10 text-green-500/60 px-1 font-black">D{s.depth || 3}</span>
                               </div>
                               <div className="flex flex-wrap gap-1">
                                  {s.covers?.map((tag, j) => (
                                    <span key={j} className="text-[8px] text-white/20 hover:text-white/40 cursor-default">#{tag}</span>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
             </div>

             <div className="flex flex-col overflow-hidden bg-[#000000]">
                <div className="p-2 border-b border-white/5 bg-black flex justify-between items-center px-6">
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/30 italic">OUTPUT_PREVIEW</span>
                  <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">{Math.ceil(result.resolved.split(/\s+/).length * 1.33)} TK</span>
                  </div>
                </div>
                <div className="flex-1 p-10 overflow-y-auto whitespace-pre-wrap text-[16px] text-white/50 leading-relaxed font-sans scrollbar-hide selection:bg-white selection:text-black italic">
                  {result.resolved}
                </div>
                <div className="p-5 border-t border-white/5 bg-black flex justify-end">
                   <button 
                    onClick={() => copy(result.resolved)}
                    className="px-16 py-3 bg-white text-black text-[11px] font-black uppercase hover:invert transition-all tracking-[0.4em] active:scale-[0.98]"
                  >
                    {copied ? '✓_READY' : 'COPY_INSTRUCTION_SET'}
                  </button>
                </div>
             </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        mark { color: transparent; }
        textarea { tab-size: 2; }
      `}</style>
    </div>
  )
}
