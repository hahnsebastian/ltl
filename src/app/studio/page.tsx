'use client'

import { useState, useMemo, useRef } from 'react'
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
      { re: /^%.*/, color: 'text-purple-600' },
      { re: /^@.*/, color: 'text-blue-600' },
      { re: /^\$.*/, color: 'text-cyan-600' },
      { re: /^!.*/, color: 'text-orange-600' },
      { re: /^#.*/, color: 'text-red-600' },
      { re: /^>.*/, color: 'text-green-600' },
      { re: /^>>.*/, color: 'text-black font-bold' },
      { re: /^\/\/.*/, color: 'text-black/40 italic' },
      { re: /->|&&/, color: 'text-black/20' },
    ]

    for (const rule of rules) {
      if (rule.re.test(line.trim())) {
        return <span className={rule.color}>{line}</span>
      }
    }
    return <span className="text-black/60">{line}</span>
  }

  return (
    <div className="flex-1 flex flex-col font-mono scrollbar-hide selection:bg-primary/10 bg-background text-foreground">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-48px)]">
        
        {/* LEFT: COMPRESSOR_INPUT */}
        <section className="lg:col-span-6 border-r border-border flex flex-col bg-background">
          <div className="p-4 border-b border-border bg-secondary flex justify-between items-center h-12">
            <span className="text-[10px] font-bold text-muted-foreground italic">Nl compressor input</span>
            <span className="text-[10px] text-muted-foreground italic font-bold">{nlInput.length} chars</span>
          </div>
          <div className="flex-1 flex flex-col p-8 gap-8">
            <textarea
              value={nlInput}
              onChange={e => setNlInput(e.target.value)}
              placeholder="Paste any natural language prompt..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed text-foreground focus:text-foreground transition-all caret-primary placeholder:text-muted-foreground font-medium"
              spellCheck={false}
            />
            <button
              onClick={handleCompress}
              className="w-full py-5 bg-primary text-primary-foreground text-[12px] font-black hover:bg-primary/90 transition-all active:scale-[0.98] select-none rounded-md"
            >
              Initialize compression
            </button>
          </div>
        </section>

        {/* RIGHT: COMPRESSION_OUTPUT */}
        <section className="lg:col-span-6 flex flex-col bg-secondary/30">
          <div className="p-4 border-b border-border bg-secondary flex justify-between items-center h-12">
            <span className="text-[10px] font-bold text-muted-foreground italic">Ltl compressed source</span>
            {compResult && (
              <div className="text-[10px] font-bold text-green-600 bg-green-600/5 px-3 py-1 border border-green-600/10 rounded-sm">
                Original: {compResult.originalTokens}tk → Ltl: {compResult.compressedTokens}tk → Saved: {compResult.savedPercent}%
              </div>
            )}
          </div>
          
          <div className="flex-1 relative group overflow-hidden bg-background m-4 border border-border rounded-md">
            <div className="absolute inset-0 p-8 overflow-y-auto whitespace-pre text-[14px] leading-[22px] font-medium font-mono text-foreground">
              {compResult ? compResult.ltl.split('\n').map((line, i) => (
                <div key={i}>{highlightLTL(line)}</div>
              )) : (
                <div className="text-muted-foreground italic select-none font-bold">Ready for compression sequence...</div>
              )}
            </div>

            {compResult && (
              <div className="absolute bottom-8 right-8 flex flex-col items-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyResult}
                  className="px-12 py-3 bg-primary text-primary-foreground text-[11px] font-bold border border-primary hover:bg-background hover:text-primary transition-all rounded-md"
                >
                  {copied ? 'Copied' : 'Copy instruction set'}
                </button>
              </div>
            )}
          </div>

          {/* INSPECTOR PREVIEW (COLLAPSIBLE-STYLE BOTTOM BAR) */}
          {compResult && (
            <div className="h-48 border-t border-border bg-secondary flex flex-col overflow-hidden">
               <div className="p-3 border-b border-border bg-black/5 text-[9px] font-bold text-muted-foreground px-6 py-2 uppercase tracking-tighter">State inspector preview</div>
               <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                  <div className="border-r border-border p-4 overflow-y-auto scrollbar-hide bg-background/50">
                    {Object.entries(previewAnalysis.variables).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center mb-2">
                        <span className="text-blue-600 text-[11px] font-bold">${k}</span>
                        <span className="text-muted-foreground text-[10px] italic font-bold">&quot;{v.value}&quot;</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 overflow-y-auto scrollbar-hide text-[11px] leading-relaxed italic text-muted-foreground font-medium">
                    {previewAnalysis.resolved}
                  </div>
               </div>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        textarea::placeholder { opacity: 0.4; }
      `}</style>
    </div>
  )
}
