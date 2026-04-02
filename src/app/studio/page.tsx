'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/ltl-database.json')
      .then(res => res.json())
      .then(data => { setAtlasDb(data.database); setLoadingDb(false) })
      .catch(() => setLoadingDb(false))
  }, [])

  const result = useMemo(() => {
    if (!input.trim()) return null
    const compiled = compileLTL(input)
    const compressed = compressLTL(input)
    const atlasMatch = atlasDb.length > 0 ? findBestMatchInAtlas(input, atlasDb) : null

    const origTokens = Math.ceil(input.split(/\s+/).length * 1.35)
    const ltlTokens  = Math.ceil(compressed.split(/\s+/).length * 1.35)
    const efficiency = Math.round((1 - ltlTokens / Math.max(1, origTokens)) * 100 * 10) / 10

    // Build the unified single-output payload:
    // LTL <scope> <action> <persona> <constraint> <output> & <regex-compressed literal>
    const ltlHeader = compiled?.primaryLTL ?? `LTL @agent !act %SNR #std >md`
    const unifiedOutput = `${ltlHeader} & ${compressed}`

    return { compiled, compressed, atlasMatch, efficiency, origTokens, ltlTokens, ltlHeader, unifiedOutput }
  }, [input, atlasDb])

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Master command list for cheatsheet
  const masterCommands = useMemo(() => {
    const list: { type: string; command: string; description: string }[] = []
    Object.entries(LTL_ACTIONS).forEach(([k, v])      => list.push({ type: '!action',     command: k, description: v }))
    Object.entries(LTL_PERSONAS).forEach(([k, v])     => list.push({ type: '%persona',    command: k, description: v }))
    Object.entries(LTL_SCOPES).forEach(([k, v])       => list.push({ type: '@scope',      command: k, description: v }))
    Object.entries(LTL_CONSTRAINTS).forEach(([k, v])  => list.push({ type: '#constraint', command: k, description: v }))
    Object.entries(LTL_OUTPUTS).forEach(([k, v])      => list.push({ type: '>output',     command: k, description: v }))
    return list.sort((a, b) => a.type.localeCompare(b.type) || a.command.localeCompare(b.command))
  }, [])

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col pt-12" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <Navbar />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto w-full px-6 pt-14 pb-0">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-[9px] tracking-[0.35em] text-white/20 uppercase mb-2">
              LTL — Less Token Language · v2.5 Unified Engine
            </p>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
              <span className="text-white">LTL</span>
              <span className="text-white/15">_</span>
              <span className="text-white">STUDIO</span>
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-[0.25em] text-white/20 uppercase">
              {loadingDb ? (
                <span className="text-yellow-400/60 animate-pulse">SYNCING ATLAS…</span>
              ) : (
                <span className="text-green-400/60">{atlasDb.length > 0 ? `${atlasDb.length.toLocaleString()} ATLAS CORES ONLINE` : 'BUILT-IN ENGINE READY'}</span>
              )}
            </div>
            <div className="text-[9px] tracking-[0.15em] text-white/10 uppercase mt-1">
              REGEX + LTL → UNIFIED OUTPUT
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN GRID ──────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT COL: INPUT + OUTPUT ────────────────────────── */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {/* INPUT */}
          <div className="relative group">
            {loadingDb && (
              <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden z-10">
                <div className="h-full bg-white/60 animate-scan-x" />
              </div>
            )}
            <label className="block text-[9px] tracking-[0.3em] text-white/25 uppercase mb-3">
              INPUT // NATURAL LANGUAGE PROMPT
            </label>
            <textarea
              id="ltl-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={7}
              placeholder={"Paste your verbose prompt here. The engine will compress it and map it to LTL symbols in real-time…"}
              className="w-full bg-black/60 border border-white/10 focus:border-white/40 outline-none resize-none p-5 text-sm text-white/80 placeholder:text-white/10 transition-all duration-200 leading-relaxed"
            />
            {input && (
              <div className="absolute bottom-4 right-4 text-[8px] text-white/15 uppercase tracking-widest">
                {Math.ceil(input.split(/\s+/).length * 1.35)} TOKENS
              </div>
            )}
          </div>

          {/* OUTPUT — combined */}
          {result && (
            <div className="flex flex-col gap-0 animate-in fade-in slide-in-from-top-3 duration-400" ref={outputRef}>
              <label className="text-[9px] tracking-[0.3em] text-white/25 uppercase mb-3">
                OUTPUT // UNIFIED LTL PAYLOAD
              </label>

              {/* Main payload box */}
              <div className="border border-white/20 bg-black relative overflow-hidden group/out">
                {/* Scan line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 overflow-hidden pointer-events-none">
                  <div className="h-full bg-white/30 animate-scan-x" />
                </div>

                {/* Payload text */}
                <div className="p-6 pb-4">
                  {/* LTL semantic header highlighted */}
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-4">
                    {/* Decompose the LTL header into tokens for color coding */}
                    {result.ltlHeader.split(/\s+/).map((tok, i) => {
                      let color = 'text-white/30'
                      if (tok === 'LTL')       color = 'text-white font-black'
                      else if (tok.startsWith('@')) color = 'text-cyan-400 font-bold'
                      else if (tok.startsWith('!')) color = 'text-purple-400 font-bold'
                      else if (tok.startsWith('%')) color = 'text-yellow-300 font-bold'
                      else if (tok.startsWith('#')) color = 'text-orange-400 font-bold'
                      else if (tok.startsWith('>')) color = 'text-green-400 font-bold'
                      return (
                        <span key={i} className={`text-xl md:text-2xl tracking-tight ${color}`}>
                          {tok}
                        </span>
                      )
                    })}
                    <span className="text-xl md:text-2xl text-white/20 font-light">&amp;</span>
                    <span className="text-xl md:text-2xl text-white/50 font-normal italic" style={{ fontFamily: 'inherit' }}>
                      {result.compressed}
                    </span>
                  </div>

                  {/* Token breakdown pills */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.compiled?.foundTokens && Object.entries(result.compiled.foundTokens).map(([type, tokens]) =>
                      (tokens as string[]).map(tok => {
                        let accent = 'border-white/10 text-white/30'
                        if (type === 'scope')      accent = 'border-cyan-400/30 text-cyan-400/60'
                        if (type === 'action')     accent = 'border-purple-400/30 text-purple-400/60'
                        if (type === 'persona')    accent = 'border-yellow-300/30 text-yellow-300/60'
                        if (type === 'constraint') accent = 'border-orange-400/30 text-orange-400/60'
                        if (type === 'output')     accent = 'border-green-400/30 text-green-400/60'
                        return (
                          <span key={tok} className={`text-[9px] font-bold border px-2 py-0.5 uppercase tracking-wider ${accent}`}>
                            {tok}
                          </span>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Stats + Copy bar */}
                <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-white/[0.02]">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[8px] text-white/20 uppercase tracking-widest">ORIGINAL</div>
                      <div className="text-sm font-bold text-white/40">{result.origTokens} <span className="text-[9px] font-normal">TOK</span></div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/20 uppercase tracking-widest">COMPRESSED</div>
                      <div className="text-sm font-bold text-white/60">{result.ltlTokens} <span className="text-[9px] font-normal">TOK</span></div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/20 uppercase tracking-widest">SAVED</div>
                      <div className={`text-sm font-bold ${result.efficiency > 0 ? 'text-green-400' : 'text-white/30'}`}>
                        {result.efficiency > 0 ? `−${result.efficiency}%` : '0%'}
                      </div>
                    </div>
                  </div>
                  <button
                    id="copy-unified-output"
                    onClick={() => copy(result.unifiedOutput)}
                    className="text-[10px] font-bold border border-white/20 text-white/60 px-6 py-2 hover:bg-white hover:text-black hover:border-white transition-all duration-150 uppercase tracking-widest"
                  >
                    {copied ? '✓ COPIED' : 'COPY OUTPUT'}
                  </button>
                </div>
              </div>

              {/* Atlas match (if found) */}
              {result.atlasMatch && (
                <div className="mt-4 border border-yellow-400/15 bg-black/60 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-yellow-400/60" />
                    <span className="text-[9px] text-yellow-400/60 uppercase tracking-[0.25em] font-bold">ATLAS REGISTRY MATCH</span>
                    <span className="text-[8px] text-white/15 uppercase tracking-widest ml-auto">500K PATTERN INDEX</span>
                  </div>
                  <div className="text-base font-bold text-yellow-300 tracking-tight">{result.atlasMatch.command}</div>
                  <p className="text-[10px] text-white/30 italic leading-relaxed">"{result.atlasMatch.fullInstruction}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] text-yellow-400/40 uppercase tracking-widest">
                      Pre-indexed efficiency: {result.atlasMatch.efficiency}% · saved {result.atlasMatch.standardTokens - result.atlasMatch.ltlTokens} tok
                    </span>
                    <button
                      onClick={() => copy(result.atlasMatch!.command)}
                      className="text-[9px] border border-yellow-400/20 text-yellow-400/60 px-4 py-1.5 hover:bg-yellow-400/10 transition-all uppercase tracking-widest"
                    >
                      COPY ATLAS CMD
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && (
            <div className="border border-white/5 bg-black/30 p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[200px]">
              <div className="text-[10px] text-white/10 uppercase tracking-[0.4em]">
                → Awaiting Input
              </div>
              <p className="text-[10px] text-white/8 max-w-sm leading-loose uppercase tracking-wider">
                Type or paste any natural language prompt above. The engine will compress it with regex rules and map it to LTL semantic symbols — producing a single unified shorthand payload.
              </p>
            </div>
          )}

          {/* Syntax legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-white/5 border border-white/5 mt-2">
            {[
              { prefix: 'LTL', label: 'Header', color: 'text-white' },
              { prefix: '@scope', label: 'Context', color: 'text-cyan-400' },
              { prefix: '!action', label: 'Task', color: 'text-purple-400' },
              { prefix: '%persona', label: 'Role', color: 'text-yellow-300' },
              { prefix: '#constraint', label: 'Rule', color: 'text-orange-400' },
            ].map(({ prefix, label, color }) => (
              <div key={prefix} className="bg-black px-4 py-3 flex flex-col gap-1">
                <span className={`text-xs font-bold ${color}`}>{prefix}</span>
                <span className="text-[9px] text-white/20 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── RIGHT COL: CHEATSHEET ───────────────────────────── */}
        <aside className="lg:col-span-4 flex flex-col">
          <label className="text-[9px] tracking-[0.3em] text-white/25 uppercase mb-3">
            CHEATSHEET // CLICK TO INSERT
          </label>
          <div className="flex-1 border border-white/10 bg-black flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'none' }}>
              {/* Group by type */}
              {['@scope', '!action', '%persona', '#constraint', '>output'].map(typeKey => {
                const items = masterCommands.filter(c => c.type === typeKey)
                const colors: Record<string, string> = {
                  '@scope': 'text-cyan-400 border-cyan-400/30',
                  '!action': 'text-purple-400 border-purple-400/30',
                  '%persona': 'text-yellow-300 border-yellow-300/30',
                  '#constraint': 'text-orange-400 border-orange-400/30',
                  '>output': 'text-green-400 border-green-400/30',
                }
                const c = colors[typeKey] || 'text-white border-white/20'
                return (
                  <div key={typeKey} className="mb-2">
                    <div className={`px-5 py-2 text-[8px] font-bold uppercase tracking-[0.3em] border-b ${c} opacity-60`}>
                      {typeKey}
                    </div>
                    {items.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(prev => prev + (prev ? ' ' : '') + cmd.command)}
                        className="w-full text-left px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors group/cmd border-b border-white/[0.03]"
                      >
                        <span className={`text-xs font-bold group-hover/cmd:brightness-125 transition-all ${c.split(' ')[0]}`}>
                          {cmd.command}
                        </span>
                        <span className="text-[9px] text-white/20 text-right leading-snug truncate max-w-[160px]">
                          {cmd.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-3 border-t border-white/5 text-[8px] text-white/10 uppercase tracking-widest bg-white/[0.01] text-center">
              {masterCommands.length} PRIMITIVES · {atlasDb.length > 0 ? '500K ATLAS HOT' : 'ATLAS SYNCING'}
            </div>
          </div>
        </aside>
      </main>

      <style jsx global>{`
        @keyframes scan-x {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-scan-x { animation: scan-x 2.5s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
