'use client'

import { useState, useMemo, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { compressToLTL } from '@/lib/ltl-compiler'
import { resolveLTL2 } from '@/lib/ltl-engine'

export default function LTLHybridStudio() {
  const [nlInput, setNlInput] = useState(`You are a senior frontend engineer. Your task is to audit the performance of a React application.

Structure:
1. Component Analysis: Discuss state management and memoization.
2. Asset Optimization: Discuss images and bundle size.
3. Network Layer: Discuss fetch strategy and caching.

Do not use generic advice. Always provide code-level optimizations. Avoid mentions of Next.js unless specifically asked. Choose one grade from [A | B | C | D | E] to rate the app.`)
  const [compResult, setCompResult] = useState<{ltl: string, originalTokens: number, compressedTokens: number, savedPercent: number} | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCompress = () => {
    const res = compressToLTL(nlInput)
    setCompResult(res)
  }

  const copyResult = () => {
    if (!compResult) return
    navigator.clipboard.writeText(compResult.ltl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // State for the preview engine (using the compressed result if available)
  const previewAnalysis = useMemo(() => {
    return resolveLTL2(compResult?.ltl || '')
  }, [compResult])

  const highlightLTL = (line: string) => {
    const rules = [
      { re: /^%.*/, color: 'text-purple-400' },
      { re: /^@.*/, color: 'text-blue-400' },
      { re: /^\$.*/, color: 'text-cyan-400' },
      { re: /^!.*/, color: 'text-orange-400' },
      { re: /^#.*/, color: 'text-red-400' },
      { re: /^>.*/, color: 'text-green-400' },
      { re: /^>>.*/, color: 'text-white font-bold' },
      { re: /^\/\/.*/, color: 'text-white/40 italic' },
      { re: /->|&&/, color: 'text-white/20' },
    ]

    for (const rule of rules) {
      if (rule.re.test(line.trim())) {
        return <span className={rule.color}>{line}</span>
      }
    }
    return <span className="text-white/60">{line}</span>
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e7e5e5] flex flex-col pt-12 font-mono scrollbar-hide">
      <Navbar />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-48px)]">
        
        {/* LEFT: COMPRESSOR_INPUT */}
        <section className="lg:col-span-6 border-r border-white/5 flex flex-col bg-[#0e0e0e]">
          <div className="p-4 border-b border-white/5 bg-[#151515] flex justify-between items-center h-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">NL_COMPRESSOR_INPUT</span>
            <span className="text-[10px] text-white/10">{nlInput.length} CHARS</span>
          </div>
          <div className="flex-1 flex flex-col p-8 gap-8">
            <textarea
              value={nlInput}
              onChange={e => setNlInput(e.target.value)}
              placeholder="Paste any natural language prompt..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed text-white/50 focus:text-white transition-all caret-white selection:bg-white/10"
              spellCheck={false}
            />
            <button
              onClick={handleCompress}
              className="w-full py-5 bg-[#e7e5e5] text-black text-[12px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all active:scale-[0.98] select-none"
            >
              INITIALIZE_COMPRESSION
            </button>
          </div>
        </section>

        {/* RIGHT: COMPRESSION_OUTPUT */}
        <section className="lg:col-span-6 flex flex-col bg-[#111111]">
          <div className="p-4 border-b border-white/5 bg-[#1a1a1a] flex justify-between items-center h-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">LTL_COMPRESSED_SOURCE</span>
            {compResult && (
              <div className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1">
                ORIGINAL: {compResult.originalTokens}tk → LTL: {compResult.compressedTokens}tk → SAVED: {compResult.savedPercent}%
              </div>
            )}
          </div>
          
          <div className="flex-1 relative group overflow-hidden bg-[#0d0d0d]">
            <div className="absolute inset-0 p-8 overflow-y-auto whitespace-pre text-[14px] leading-[22px] font-medium font-mono">
              {compResult ? compResult.ltl.split('\n').map((line, i) => (
                <div key={i}>{highlightLTL(line)}</div>
              )) : (
                <div className="text-white/5 italic select-none">READY_FOR_COMPRESSION_SEQUENCE...</div>
              )}
            </div>

            {compResult && (
              <div className="absolute bottom-8 right-8 flex flex-col items-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyResult}
                  className="px-12 py-3 bg-white/5 text-white text-[11px] font-black uppercase border border-white/10 hover:bg-white/10 transition-all tracking-widest"
                >
                  {copied ? 'COPIED' : 'COPY_INSTRUCTION_SET'}
                </button>
              </div>
            )}
          </div>

          {/* INSPECTOR PREVIEW (COLLAPSIBLE-STYLE BOTTOM BAR) */}
          {compResult && (
            <div className="h-48 border-t border-white/5 bg-[#151515] flex flex-col overflow-hidden">
               <div className="p-3 border-b border-white/5 bg-black/20 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-6">STATE_INSPECTOR_PREVIEW</div>
               <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                  <div className="border-r border-white/5 p-4 overflow-y-auto scrollbar-hide">
                    {Object.entries(previewAnalysis.variables).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center mb-2">
                        <span className="text-cyan-400 text-[11px] font-black">${k}</span>
                        <span className="text-white/20 text-[10px] italic">"{v.value}"</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 overflow-y-auto scrollbar-hide opacity-30 text-[11px] leading-relaxed italic">
                    {previewAnalysis.resolved}
                  </div>
               </div>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        textarea::placeholder { opacity: 0.2; }
      `}</style>
    </div>
  )
}
