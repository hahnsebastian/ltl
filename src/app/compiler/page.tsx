'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import { CreateWebWorkerMLCEngine, InitProgressReport, prebuiltAppConfig } from '@mlc-ai/web-llm'

const LTL_SYSTEM_PROMPT = `
You are an LTL (Less-Token-Language) compiler.
Convert any English natural language prompt into LTL syntax.
Output ONLY the LTL block. No explanation. No preamble. No markdown.

LTL SIGILS:
%"role"              persona / role — full role description
@subject: value      scope / subject of the task
$var = value         variable — use {{input}} for user-supplied values
$var = [a|b|c]       enum variable
!create              intent: write/generate/produce/draft
!explain             intent: explain/describe/clarify/define
!analyse             intent: analyse/evaluate/assess/review
!rewrite             intent: rewrite/rephrase/improve/edit
!summarise           intent: summarise/condense/shorten
!compare             intent: compare/contrast
!instruct            intent: step-by-step/how-to/guide
!evaluate            intent: grade/score/rate/rank
!brainstorm          intent: list/suggest/ideas/options
!generate            intent: default if unclear
#no: [x,y,z]         forbidden — one entry per distinct concept
#must: [x,y,z]       required — one entry per distinct concept
#per-section: N      structural rule applied to every section
>style: narrative    output style (narrative/bullets/table/code/prose)
>depth: N            1=sentence 2=short-para 3=full-para 4=exhaustive
>>register: formal   tone (formal/casual)
>structure:          section definitions (use when input has sections)
  @section "Exact Heading As Written"
    >depth: N
    >covers: [tag, tag, tag]
    >end-with: "closing instruction"
>scale: [A+|A|B|C|D] grading or rating scale
#scale-implicit      justification comes from narrative, not the grade
>>final
// original: Xtk | compressed: Ytk | saved: Z%

COMPRESSION RULES:
1. Strip all filler: please, make sure to, it is important that,
   ensure that, note that, keep in mind, in order to, I would like you to,
   feel free to, needless to say, basically, simply, just, essentially
2. Extract persona from "you are" / "act as" / "as a" sentences -> %
3. Extract subject from "for the following X:" / "about X" -> @subject
4. Map primary action verb to correct !intent
5. Every "do not / must not / never / avoid" -> #no entry
6. Every "must / always / ensure / required" -> #must entry
7. Deduplicate: same constraint stated multiple times = one entry
8. Detect section headings (Title Case lines, numbered sections,
   markdown headers, "provide a paragraph on X") -> @section blocks
9. For each section, extract key noun phrases as >covers tags:
   - remove articles and filler adjectives
   - hyphenate multi-word concepts
   - keep domain-specific terms verbatim
   - 3-8 tags per section
10. "Finish with X" / "End with X" -> >end-with: on that section
11. Standalone grade list (A/B/C, 1-5) after eval instruction -> >scale
12. Token count = word count × 1.33

OUTPUT FORMAT — always this order, omit empty blocks:
%"persona"
@subject: value
$variables
blank line
!intent
blank line
#no: [...]
#must: [...]
#format constraints
blank line
>>register (if found)
blank line
>structure:
  @section blocks (indented 2 spaces)
blank line
>scale (if found)
#scale-implicit (if found)
blank line
>>final
blank line
// original: Xtk | compressed: Ytk | saved: Z%
`

const MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC"

export default function LTLCompilerPage() {
  const [nlInput, setNlInput] = useState('')
  const [ltlOutput, setLtlOutput] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [webGPUAvailable, setWebGPUAvailable] = useState<boolean | null>(null)
  
  // States: 0 = Init, 1 = Downloading (First visit), 2 = Loading from Cache, 3 = Ready
  const [appState, setAppState] = useState<0 | 1 | 2 | 3>(0)
  const [progress, setProgress] = useState(0)
  const [mbRemaining, setMbRemaining] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  const engineRef = useRef<any>(null)
  const [copied, setCopied] = useState(false)

  // Token counts
  const originalTokens = useMemo(() => {
    if (!nlInput.trim()) return 0
    return Math.round(nlInput.trim().split(/\s+/).length * 1.33)
  }, [nlInput])

  const compressedTokens = useMemo(() => {
    if (!ltlOutput.trim()) return 0
    return Math.round(ltlOutput.trim().split(/\s+/).length * 1.33)
  }, [ltlOutput])

  const savedPercent = useMemo(() => {
    if (originalTokens === 0) return 0
    return Math.max(0, Math.round(((originalTokens - compressedTokens) / originalTokens) * 100))
  }, [originalTokens, compressedTokens])

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

  const handleCompress = async () => {
    if (!engineRef.current || appState !== 3 || isCompressing || !nlInput.trim()) return

    setLtlOutput('')
    setIsCompressing(true)
    
    try {
      const stream = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: LTL_SYSTEM_PROMPT },
          { role: "user", content: nlInput }
        ],
        temperature: 0.1,
        max_tokens: 1024,
        stream: true
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ""
        setLtlOutput(prev => prev + content)
      }
    } catch (err: any) {
      console.error('Generation Error:', err)
    } finally {
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

      if (line.startsWith('%')) color = 'text-[#a78bfa]'
      else if (line.startsWith('@')) color = 'text-[#60a5fa]'
      else if (line.startsWith('$')) color = 'text-[#22d3ee]'
      else if (line.startsWith('!')) color = 'text-[#fb923c]'
      else if (line.startsWith('#')) color = 'text-[#f87171]'
      else if (line.startsWith('>>')) { color = 'text-white'; bold = true; }
      else if (line.startsWith('>')) color = 'text-[#4ade80]'
      else if (line.startsWith('//')) { color = 'text-[#6b7280]'; italic = true; }

      const parts = line.split(/(\->|&&)/g)
      
      return (
        <div key={i} className={`min-h-[1.4em] ${color} ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}`}>
          {parts.map((p, j) => (
            p === '->' || p === '&&' ? <span key={j} className="text-[#4b5563]">{p}</span> : p
          ))}
        </div>
      )
    })
  }

  if (webGPUAvailable === false) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-[#e7e5e5] flex flex-col font-mono">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full border border-white/10 p-12 bg-black/50 text-center space-y-6">
            <h1 className="text-xl font-black tracking-tighter text-red-500">WEBGPU_NOT_SUPPORTED</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Your browser does not support WebGPU.<br />
              Use Chrome or Edge on desktop for AI compression.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e7e5e5] flex flex-col pt-12 font-mono scrollbar-hide selection:bg-white/10">
      <Navbar />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-48px)]">
        
        {/* LEFT COLUMN: INPUT */}
        <section className="lg:col-span-6 border-r border-white/5 flex flex-col bg-[#0e0e0e] relative">
          <div className="p-4 border-b border-white/5 bg-[#151515] flex justify-between items-center h-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">NATURAL_LANGUAGE_INPUT</span>
            <span className="text-[10px] text-white/10 italic">INPUT: {originalTokens}tk</span>
          </div>

          <div className="flex-1 flex flex-col p-8 gap-8">
            <textarea
              value={nlInput}
              onChange={e => setNlInput(e.target.value)}
              placeholder="Paste any English prompt..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed text-white/50 focus:text-white transition-all caret-white placeholder:text-white/10"
              spellCheck={false}
              disabled={appState < 3 || isCompressing}
            />
            
            <button
              onClick={handleCompress}
              disabled={appState < 3 || isCompressing || !nlInput.trim()}
              className={`w-full py-5 text-[12px] font-black uppercase tracking-[0.4em] transition-all active:scale-[0.98] select-none
                ${(appState < 3 || isCompressing || !nlInput.trim()) 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-[#e7e5e5] text-black hover:bg-white'}`}
            >
              {isCompressing ? (
                <span className="flex items-center justify-center gap-2">
                  COMPRESSING <span className="animate-pulse">_</span>
                </span>
              ) : appState < 3 ? 'LOADING_MODEL...' : 'COMPRESS'}
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
                    After this, compression loads in seconds — offline, forever.
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
               {appState === 2 && (
                 <div className="flex items-center gap-2 text-[10px] font-black text-white/40 italic">
                   <div className="w-2 h-2 border border-white/20 border-t-white animate-spin" />
                   LOADING_MODEL_FROM_CACHE...
                 </div>
               )}
               {appState === 3 && (
                 <div className="flex items-center gap-2 text-[10px] font-black text-white italic">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                   MODEL_READY <span className="text-white/30">Phi-3.5-mini</span>
                 </div>
               )}
            </div>
          </div>
          
          <div className="flex-1 relative group overflow-hidden bg-[#0d0d0d]">
            <div className="absolute inset-0 p-8 overflow-y-auto whitespace-pre font-mono text-[14px] leading-[22px]">
              {ltlOutput ? highlightLTL(ltlOutput) : (
                <div className="text-white/5 italic select-none">
                  {isCompressing ? 'INITIALIZING_STREAM...' : 'READY_FOR_COMPRESSION_SEQUENCE...'}
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
                INPUT: {originalTokens}tk → LTL: {compressedTokens}tk → SAVED: {savedPercent}%
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
