'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import { CreateWebWorkerMLCEngine, InitProgressReport, prebuiltAppConfig } from '@mlc-ai/web-llm'
import { compressToLTL } from '@/lib/ltl-compiler'

const MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC"

export default function LTLCompilerPage() {
  const [nlInput, setNlInput] = useState('')
  const [ltlOutput, setLtlOutput] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [webGPUAvailable, setWebGPUAvailable] = useState<boolean | null>(null)
  const [badge, setBadge] = useState<string>('')
  
  // States: 0 = Init, 1 = Downloading (First visit), 2 = Loading from Cache, 3 = Ready
  const [appState, setAppState] = useState<0 | 1 | 2 | 3>(0)
  const [progress, setProgress] = useState(0)
  const [mbRemaining, setMbRemaining] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  const engineRef = useRef<any>(null)
  const [copied, setCopied] = useState(false)

  // Token counts
  const [stats, setStats] = useState({
    original: 0,
    compressed: 0,
    saved: 0
  })

  useEffect(() => {
    const checkWebGPU = async () => {
      if ('gpu' in navigator) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter()
          setWebGPUAvailable(!!adapter)
        } catch (e) {
          setWebGPUAvailable(false)
        }
      } else {
        setWebGPUAvailable(false)
      }
    }
    checkWebGPU()
  }, [])

  const isInitializing = useRef(false)
  const workerInstanceRef = useRef<Worker | null>(null)

  useEffect(() => {
    if (webGPUAvailable === false || isInitializing.current || engineRef.current) return
    isInitializing.current = true

    const initEngine = async () => {
      try {
        const worker = new Worker(new URL('../../worker/llm-worker.ts', import.meta.url))
        workerInstanceRef.current = worker

        const engine = await CreateWebWorkerMLCEngine(
          worker,
          MODEL_ID,
          {
            initProgressCallback: (payload: InitProgressReport) => {
              const text = payload.text || ''
              const progressVal = Math.round(payload.progress * 100)
              setProgress(progressVal)
              
              if (text.includes('Fetching') || text.includes('download')) {
                setAppState(prev => (prev === 0 || prev === 2 ? 1 : prev))
                const totalSizeMB = 2300
                const remainingMB = Math.max(0, Math.round(totalSizeMB * (1 - payload.progress)))
                setMbRemaining(remainingMB)
                setTimeRemaining(`~${Math.ceil(remainingMB / 5)}s`)
              } else if (text.includes('cache')) {
                setAppState(prev => (prev === 0 ? 2 : prev))
              }
            },
            appConfig: {
              ...prebuiltAppConfig,
              useIndexedDBCache: true
            },
            logLevel: "DEBUG"
          }
        )
        
        engineRef.current = engine
        setAppState(3)
      } catch (err: any) {
        console.error('Engine Init Error:', err)
        isInitializing.current = false
      }
    }

    initEngine()

    return () => {
      if (workerInstanceRef.current) {
        workerInstanceRef.current.terminate()
        workerInstanceRef.current = null
      }
      engineRef.current = null
      isInitializing.current = false
    }
  }, [webGPUAvailable])

  const VALID_LINE = /^(\s*(\/\/|%|@|\$|!|#|>|>>|<<|~|\?|:|!!|\|)|^$)/

  function stripAndValidate(raw: string, originalTokens: number): { ltl: string, stats: any } | null {
    // strip markdown fences
    let clean = raw
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/^```$/gm, '')
      .trim()

    // strip lines that don't start with a sigil
    const stripped = clean
      .split('\n')
      .filter(line => {
        const t = line.trim()
        if (!t) return true
        return VALID_LINE.test(line)
      })
      .join('\n')
      .trim()

    if (!stripped) return null

    // if more than 30% of lines were stripped, output is too degraded
    const originalLines = clean.split('\n').filter(l => l.trim()).length
    const strippedLines = stripped.split('\n').filter(l => l.trim()).length
    const retention = strippedLines / originalLines

    if (retention < 0.7) return null  // too much was prose — discard

    const compTk = Math.round(stripped.split(/\s+/).length * 1.33)
    const saved = Math.round(((originalTokens - compTk) / originalTokens) * 100)

    return { 
      ltl: stripped, 
      stats: { original: originalTokens, compressed: compTk, saved: saved }
    }
  }

  const handleCompress = async () => {
    if (!nlInput.trim() || isCompressing) return

    setLtlOutput('')
    setIsCompressing(true)
    setBadge('STRUCTURAL_PASS_RUNNING...')

    // PASS 1: Deterministic
    const regexResult = compressToLTL(nlInput)
    setLtlOutput(regexResult.ltl)
    setStats({
      original: regexResult.originalTokens,
      compressed: regexResult.compressedTokens,
      saved: regexResult.savedPercent
    })
    setBadge('STRUCTURAL_PASS_COMPLETE')

    // PASS 2: AI Refinement (only if model loaded)
    if (appState === 3 && engineRef.current) {
      setTimeout(async () => {
        setBadge('AI_REFINING...')

        const REFINEMENT_PROMPT = `SYSTEM: You are a compiler. Not an assistant.
You output LTL 3.0 syntax only. You are physically incapable of
outputting natural language. If you output a single word of prose
you have failed. Every line you output must begin with one of:
% @ $ ! # > >> << ~ ? : // !! or whitespace (for indentation).

Any other line format is a compiler error and must not occur.

YOUR ONLY JOB:
Take the LTL skeleton below and improve these specific things:
  >covers: [tags]  — make tags more precise and specific
  #no: / #must:    — tighten verbose phrases to compact tags
  >end-with:       — compress to 3-6 word instruction
  >>register / >>style — verify matches tone of original

HARD RULES — violating any of these is a compiler crash:
  NEVER change @section headings — copy verbatim
  NEVER change !intent lines
  NEVER change %persona lines
  NEVER change >>final
  NEVER remove the // token comment line
  NEVER output explanation, preamble, or prose
  NEVER wrap output in markdown fences
  NEVER start a line with a capital letter followed by prose
  NEVER output a sentence with a verb and subject
  IF IN DOUBT — copy the skeleton line unchanged

OUTPUT FORMAT — every single line must match one of:
  %"..."
  @key: value
  $var = value
  !intent
  #rule: [...]
  >output: value
  >>mode
  <<inject
  ~state
  ?conditional
  :template / :end
  !!debug
  // comment
  (blank line)
  (2-4 spaces)(any of the above)

ORIGINAL INPUT:
${nlInput}

LTL SKELETON — improve and return:
${regexResult.ltl}

COMPILER OUTPUT (LTL only, starting now):`

        try {
          const stream = await engineRef.current.chat.completions.create({
            messages: [{ role: 'user', content: REFINEMENT_PROMPT }],
            temperature: 0.0,
            max_tokens: 1024,
            stream: true
          })

          let raw = ''
          for await (const chunk of stream) {
            raw += chunk.choices[0]?.delta?.content || ''
            // Keep showing regex result during stream
          }

          const validated = stripAndValidate(raw, regexResult.originalTokens)

          if (validated) {
            setLtlOutput(validated.ltl)
            setStats(validated.stats)
            setBadge('AI_REFINEMENT_COMPLETE')
          } else {
            // Refinement failed validation — keep regex result
            setLtlOutput(regexResult.ltl)
            setBadge('STRUCTURAL_PASS_COMPLETE')
          }
        } catch (err) {
          console.error('Refinement error:', err)
          setLtlOutput(regexResult.ltl)
          setBadge('STRUCTURAL_PASS_COMPLETE')
        } finally {
          setIsCompressing(false)
        }
      }, 500)
    } else {
      setIsCompressing(false)
    }
  }

  const copyResult = () => {
    if (!ltlOutput) return
    navigator.clipboard.writeText(ltlOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightLTL = (text: string) => {
    return text.split('\n').map((line, i) => {
      let color = 'text-[#e7e5e5]'
      let bold = false
      let italic = false

      // Line-level coloring
      const trimmed = line.trim()
      if (trimmed.startsWith('%')) color = 'text-[#c084fc]'               // Persona
      else if (trimmed.startsWith('@')) color = 'text-[#60a5fa]'          // Scope
      else if (trimmed.startsWith('$')) color = 'text-[#22d3ee]'          // Variable
      else if (trimmed.startsWith('!')) color = 'text-[#fb923c]'          // Intent
      else if (trimmed.startsWith('#')) color = 'text-[#f87171]'          // Constraint
      else if (trimmed.startsWith('>>')) { color = 'text-white'; bold = true; } // Mode
      else if (trimmed.startsWith('>')) color = 'text-[#4ade80]'          // Output
      else if (trimmed.startsWith('//')) { color = 'text-[#52525b]'; italic = true; } // Comment
      else if (trimmed.startsWith(':')) { color = 'text-[#e879f9]'; bold = true; } // Template
      else if (trimmed.startsWith('?')) color = 'text-[#fbbf24]'          // Query
      else if (trimmed.startsWith('~')) color = 'text-[#34d399]'          // State
      else if (trimmed.startsWith('<<')) { color = 'text-[#22d3ee]'; italic = true; } // Inject
      else if (trimmed.startsWith('!!')) color = 'text-[#f43f5e]'         // Debug

      // Sub-token highlighting (pipes and logical operators)
      const parts = line.split(/(\->|&&|\|)/g)
      
      return (
        <div key={i} className={`min-h-[1.4em] ${color} ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}`}>
          {parts.map((p, j) => {
            if (p === '->' || p === '&&') return <span key={j} className="text-white/20 px-1">{p}</span>
            if (p === '|') return <span key={j} className="text-[#fb923c] px-0.5">{p}</span>
            return p
          })}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e7e5e5] flex flex-col pt-12 font-mono scrollbar-hide selection:bg-white/10">
      <Navbar />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-48px)]">
        
        {/* LEFT COLUMN: INPUT */}
        <section className="lg:col-span-6 border-r border-white/5 flex flex-col bg-[#0e0e0e] relative">
          <div className="p-4 border-b border-white/5 bg-[#151515] flex justify-between items-center h-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">NATURAL_LANGUAGE_INPUT</span>
            <span className="text-[10px] text-white/10 italic">INPUT: {stats.original}tk</span>
          </div>

          <div className="flex-1 flex flex-col p-8 gap-8">
            <textarea
              value={nlInput}
              onChange={e => setNlInput(e.target.value)}
              placeholder="Paste any English prompt..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed text-white/50 focus:text-white transition-all caret-white placeholder:text-white/10"
              spellCheck={false}
              disabled={isCompressing}
            />
            
            <button
              onClick={handleCompress}
              disabled={isCompressing || !nlInput.trim()}
              className={`w-full py-5 text-[12px] font-black uppercase tracking-[0.4em] transition-all active:scale-[0.98] select-none
                ${(isCompressing || !nlInput.trim()) 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-[#e7e5e5] text-black hover:bg-white'}`}
            >
              {isCompressing ? (
                <span className="flex items-center justify-center gap-2">
                  WORKING <span className="animate-pulse">_</span>
                </span>
              ) : 'COMPRESS'}
            </button>
          </div>

          {/* STATE 1 OVERLAY: FIRST TIME SETUP */}
          {appState === 1 && (
            <div className="absolute inset-x-8 inset-y-12 bg-black border border-white/10 z-50 flex flex-col p-12 justify-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-black tracking-tighter">FIRST_TIME_SETUP</h2>
                  <p className="text-white/40 text-[13px] leading-relaxed">
                    LTL downloads once to your browser (~2.3GB).<br />
                    After this, compression refinements load in seconds — offline, forever.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-500" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-black font-mono">
                     <span className="text-white">{progress}% — {mbRemaining}MB remaining</span>
                     <span className="text-white/30">{timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: OUTPUT */}
        <section className="lg:col-span-6 flex flex-col bg-[#111111] relative">
          <div className="p-4 border-b border-white/5 bg-[#1a1a1a] flex justify-between items-center h-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">LTL_OUTPUT</span>
            
            <div className="flex items-center gap-4">
               {badge && (
                 <span className="text-[9px] font-black px-2 py-0.5 bg-white/10 text-white leading-none flex items-center h-5">
                   {badge}
                 </span>
               )}

               <div className="h-4 w-px bg-white/10" />

               {webGPUAvailable === false ? (
                 <div className="flex items-center gap-2 text-[10px] font-black text-white/20 italic">
                   ○ BASIC_MODE
                 </div>
               ) : appState < 3 ? (
                 <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 italic">
                   {appState === 1 ? (
                     <><span className="animate-pulse">◌</span> DOWNLOADING ({progress}%)</>
                   ) : (
                     <>○ AI_AVAILABLE</>
                   )}
                 </div>
               ) : (
                 <div className="flex items-center gap-2 text-[10px] font-black text-white italic">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   ● AI_ACTIVE
                 </div>
               )}
            </div>
          </div>
          
          <div className="flex-1 relative group overflow-hidden bg-[#0d0d0d]">
            <div className="absolute inset-0 p-8 overflow-y-auto whitespace-pre font-mono text-[14px] leading-[22px]">
              {ltlOutput ? highlightLTL(ltlOutput) : (
                <div className="text-white/5 italic select-none">
                  READY_FOR_COMPRESSION_SEQUENCE...
                </div>
              )}
            </div>

            {ltlOutput && !isCompressing && (
              <div className="absolute bottom-8 right-8 flex flex-col items-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyResult}
                  className="px-12 py-3 bg-white/5 text-white text-[11px] font-black uppercase border border-white/10 hover:bg-white/10 transition-all tracking-widest"
                >
                  {copied ? 'COPIED' : 'COPY_LTL'}
                </button>
              </div>
            )}
          </div>

          <div className="h-16 border-t border-white/5 bg-[#151515] flex items-center px-8 justify-between">
             <div className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                INPUT: {stats.original}tk → LTL: {stats.compressed}tk → SAVED: {stats.saved}%
             </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  )
}
