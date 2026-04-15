'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const INSTALL_COMMAND = `git clone https://github.com/hahnsebastian/ltl.git && cd ltl && npm install`

export default function Home() {
  const [copied, setCopied] = useState(false)
  const revealCanvasRef = useRef<HTMLCanvasElement>(null)
  const heroOuterRef = useRef<HTMLDivElement>(null)
  
  const [drawMode, setDrawMode] = useState(false)
  const [brushSize, setBrushSize] = useState(36)
  const [showHint, setShowHint] = useState(true)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })

  const isDrawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const fillWhite = () => {
    const canvas = revealCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'destination-out'
  }

  useEffect(() => {
    const resize = () => {
      const canvas = revealCanvasRef.current
      const outer = heroOuterRef.current
      if (!canvas || !outer) return
      canvas.width = outer.offsetWidth
      canvas.height = outer.offsetHeight
      fillWhite()
      setHasDrawn(false)
    }
    window.addEventListener('resize', resize)
    setTimeout(resize, 0)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(t)
  }, [])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = revealCanvasRef.current
    if (!canvas) return [0, 0]
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e && e.touches.length > 0) {
      return [
        (e.touches[0].clientX - rect.left) * scaleX,
        (e.touches[0].clientY - rect.top) * scaleY
      ]
    }
    const pcEvent = e as React.PointerEvent<HTMLCanvasElement>
    return [
      (pcEvent.clientX - rect.left) * scaleX,
      (pcEvent.clientY - rect.top) * scaleY
    ]
  }

  const paint = (x: number, y: number, fromX: number, fromY: number) => {
    const canvas = revealCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(x, y)
    ctx.stroke()

    const g = ctx.createRadialGradient(x, y, 0, x, y, brushSize * 0.5)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, brushSize * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawMode) return
    isDrawingRef.current = true
    const [x, y] = getPos(e)
    lastPosRef.current = { x, y }
    paint(x, y, x, y)
    if (!hasDrawn) setHasDrawn(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawMode) return
    if ('clientX' in e) {
      setCursorPos({ x: (e as React.PointerEvent).clientX, y: (e as React.PointerEvent).clientY })
    } else if ('touches' in e && e.touches.length > 0) {
      setCursorPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
    if (!isDrawingRef.current) return
    const [x, y] = getPos(e)
    paint(x, y, lastPosRef.current.x, lastPosRef.current.y)
    lastPosRef.current = { x, y }
  }

  const handlePointerUp = () => {
    isDrawingRef.current = false
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col text-foreground bg-background">

      {/* HERO WRAPPER */}
      <div ref={heroOuterRef} className="relative w-full z-0 bg-background overflow-hidden border-b border-border">
        
        {/* Photo Background (Monet layer) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/monet/art-institute-of-chicago--LdzOeq7-IU-unsplash.jpg')" }}
        />

        {/* Reveal Canvas */}
        <canvas 
          ref={revealCanvasRef}
          className="absolute inset-0 z-10 w-full h-full"
          style={{
            pointerEvents: drawMode ? 'auto' : 'none',
            cursor: drawMode ? 'none' : 'default',
            touchAction: drawMode ? 'none' : 'auto'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={e => { handlePointerUp(); handlePointerMove(e); }}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Hero Content */}
        <main className="relative z-20 flex flex-col items-center justify-center px-4 md:px-8 max-w-[680px] mx-auto w-full text-center py-12 md:py-36 pointer-events-none">
          <div className={`my-12 md:my-[120px] flex flex-col items-center gap-6 md:gap-8 p-5 sm:p-8 md:p-12 rounded-[14px] sm:rounded-[20px] transition-all duration-700 w-full xl:w-[120%] ${(hasDrawn || drawMode) ? 'bg-background border border-border shadow-sm' : 'bg-transparent'}`}>
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-tight" style={{ textShadow: (hasDrawn || drawMode) ? "none" : "0 0 40px rgba(255,255,255,0.8)" }}>
              Reduce AI prompts
            </h1>
            <p className="text-[16px] md:text-lg text-muted-foreground font-normal leading-relaxed" style={{ textShadow: (hasDrawn || drawMode) ? "none" : "0 0 20px rgba(255,255,255,0.9)" }}>
              LTL is a high-density semantic shorthand for LLMs. Map verbose English to dense symbolic operators and transmit full agent instructions in seconds.
            </p>

            <div className="w-full flex flex-col items-center gap-3 pointer-events-auto mt-2 md:mt-0">
              <div
                className="flex items-center gap-2 sm:gap-3 bg-white border border-border rounded-md px-4 sm:px-5 py-3 sm:py-4 w-full group cursor-pointer hover:border-foreground transition-all shadow-sm"
                onClick={handleCopy}
              >
                <span className="text-muted-foreground select-none font-mono text-[13px] sm:text-sm">$</span>
                <code className="flex-1 text-[13px] sm:text-sm font-mono text-foreground text-left truncate">
                  {INSTALL_COMMAND}
                </code>
                <button
                  className="text-[11px] sm:text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-normal" style={{ textShadow: (hasDrawn || drawMode) ? "none" : "0 0 10px rgba(255,255,255,0.8)" }}>
                Paste in terminal to install LTL, or{' '}
                <Link href="https://github.com/hahnsebastian/ltl" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline font-medium">
                  view on GitHub
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* HUD: Custom Cursor */}
      {drawMode && (
        <div 
          className="fixed z-[9999] pointer-events-none rounded-full border-2 border-blue-600 bg-blue-600/15 transform -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-75"
          style={{ left: cursorPos.x, top: cursorPos.y, width: brushSize, height: brushSize }}
        />
      )}

      {/* HUD: Hint */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-white/90 backdrop-blur-md border border-border rounded-full px-4 py-1.5 z-50 transition-opacity duration-500 pointer-events-none ${(!showHint || drawMode) ? 'opacity-0' : 'opacity-100'}`}>
        Click the pencil to reveal what's hidden ✦
      </div>

      {/* HUD: Brush size controls */}
      <div className={`fixed bottom-[110px] right-8 z-50 flex flex-col items-center gap-3 transition-opacity duration-200 ${drawMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div onClick={() => setBrushSize(160)} className={`rounded-full bg-foreground cursor-pointer border-[2px] transition-transform hover:scale-110 flex-shrink-0 w-[42px] h-[42px] ${brushSize === 160 ? 'border-blue-600' : 'border-transparent'}`} />
        <div onClick={() => setBrushSize(60)} className={`rounded-full bg-foreground cursor-pointer border-[2px] transition-transform hover:scale-110 flex-shrink-0 w-[30px] h-[30px] ${brushSize === 60 ? 'border-blue-600' : 'border-transparent'}`} />
        <div onClick={() => setBrushSize(36)} className={`rounded-full bg-foreground cursor-pointer border-[2px] transition-transform hover:scale-110 flex-shrink-0 w-[20px] h-[20px] ${brushSize === 36 ? 'border-blue-600' : 'border-transparent'}`} />
        <div onClick={() => setBrushSize(16)} className={`rounded-full bg-foreground cursor-pointer border-[2px] transition-transform hover:scale-110 flex-shrink-0 w-[12px] h-[12px] ${brushSize === 16 ? 'border-blue-600' : 'border-transparent'}`} />
      </div>

      {/* HUD: Pencil Button */}
      <button 
        onClick={() => setDrawMode(!drawMode)}
        className={`fixed bottom-8 right-8 z-50 w-[52px] h-[52px] rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md hover:scale-110 ${drawMode ? 'bg-blue-600 text-white' : 'bg-foreground text-background'}`}
        title="Reveal hidden photo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
          <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
        </svg>
      </button>

      {/* HUD: Reset Button */}
      <button
        onClick={() => { fillWhite(); setHasDrawn(false); setShowHint(true); }}
        className={`fixed bottom-8 left-8 z-50 text-xs font-medium text-muted-foreground bg-white/90 backdrop-blur-md border border-border rounded-full px-4 py-1.5 cursor-pointer transition-all duration-300 hover:text-foreground hover:border-gray-400 shadow-sm ${hasDrawn ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        Reset
      </button>


      {/* Landing Content Sections */}
      <div className="mx-auto w-full max-w-[860px] px-8">
        
        {/* Part 1: How it works */}
        <section className="py-20">
          <h2 className="text-2xl font-medium mb-4 text-foreground tracking-tight">Load once. Compress everything.</h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-12">
            LTL uses a shared-dictionary model. Load ltl-core.md into your AI context once — then use compact sigil expressions in place of verbose natural language forever.
          </p>

          <div className="flex flex-col border border-border rounded-xl overflow-hidden mb-12">
            {[ 
              { num: '01', title: 'Load the core reference', desc: 'Load ltl-core.md once to register all 620+ sigil expansions.', code: 'curl ltl-beta.vercel.app/ltl-core.md' },
              { num: '02', title: 'Write compressed prompts', desc: 'Replace verbose instructions with high-density sigil expressions.', code: '%React.Senior @component #ts #a11y >code+jsdoc' },
              { num: '03', title: 'Decode, execute, save', desc: 'The model reconstructs full intent locally. Up to 94%+ token savings.', code: 'TCR = 1 − (11 / 193) = 94.3% compression' }
            ].map((step, i) => (
              <div key={i} className="flex flex-row border-b border-border last:border-b-0 group">
                <div className="w-[52px] shrink-0 border-r border-border font-mono text-xs text-muted-foreground flex items-center justify-center bg-background">
                  {step.num}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-2 bg-background">
                  <div className="text-[15px] font-medium text-foreground">{step.title}</div>
                  <div className="text-[14px] text-muted-foreground mb-1">{step.desc}</div>
                  <code className="bg-secondary border border-border rounded-[7px] font-mono text-[12px] px-3 py-2 w-fit text-foreground truncate max-w-full block">
                    {step.code}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
            <div className="bg-background p-6 flex flex-col h-full min-h-[300px]">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-6 block">Verbose — before LTL</span>
              <div className="font-mono text-[13px] text-muted-foreground leading-relaxed flex-1 mb-8">
                You are a senior React engineer.<br/>
                Please write a React component.<br/>
                You must use TypeScript.<br/>
                Ensure all code meets accessibility standards.<br/>
                Please write thorough tests for all features.<br/>
                The output should be only the code.<br/>
                Please include JSDoc comments for all functions.
              </div>
              <div className="border-t border-border pt-4 text-[11px] font-mono text-muted-foreground mt-auto">
                ~193 tokens
              </div>
            </div>
            <div className="bg-background p-6 flex flex-col h-full min-h-[300px]">
              <span className="text-[11px] uppercase tracking-widest text-[#16a34a] font-semibold mb-6 block">Compressed — after LTL</span>
              <div className="font-mono text-[14px] font-semibold text-foreground leading-relaxed flex-1 mb-8">
                %React.Senior<br/>
                @component<br/>
                #ts #a11y #test<br/>
                &gt;code+jsdoc
              </div>
              <div className="border-t border-border pt-4 text-[11px] font-mono text-[#16a34a] mt-auto">
                ~11 tokens · 94.3% saved
              </div>
            </div>
          </div>
        </section>

        {/* Part 2: Sigils */}
        <section className="py-20">
          <h2 className="text-2xl font-medium mb-4 text-foreground tracking-tight">A complete semantic grammar.</h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-12">
            LTL defines a comprehensive deterministic vocabulary. Replace natural language intuition with machine-readable operational sigils.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 mt-4">
            {[ 
              { sym: '$', name: 'Variables', desc: 'Bind hardcoded values, UI fields, enums, or dynamic inputs.' },
              { sym: '%', name: 'Persona', desc: 'Set the verbatim role, persona, and expertise context.' },
              { sym: '!', name: 'Intent', desc: 'Specify action directives, loops, and cognitive macros.' },
              { sym: '@', name: 'Domain', desc: 'Apply universal semantic vocabularies and context tags.' },
              { sym: '>', name: 'Output', desc: 'Shape the structure, format, depth, and evaluation scales.' },
              { sym: '#', name: 'Constraints', desc: 'Apply rigid rules, mandatory requirements, and boundaries.' },
              { sym: '[]', name: 'Literals', desc: 'Target identifiers and schema bounds with zero information loss.' },
              { sym: ':', name: 'Templates', desc: 'Encapsulate execution traces as reusable programs.' },
              { sym: '?', name: 'Conditionals', desc: 'Branch prompting paths dynamically based on active states.' },
              { sym: '->', name: 'Pipes', desc: 'Chain model operations, context filters, and data transitions.' },
              { sym: '>>', name: 'Modes', desc: 'Override engine execution behavior (draft, silent, stream).' },
              { sym: '!!', name: 'Debug & QA', desc: 'Expose reasoning traces, assert rules, and evaluate token costs.' }
            ].map((sigil, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="relative aspect-square border border-border rounded-[10px] hover:border-muted-foreground transition-colors overflow-hidden mb-4">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                    style={{ backgroundImage: `url('/monet/${i + 1}.png')` }} 
                  />
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                  <div className="absolute inset-0 p-4 sm:p-5 z-10">
                    <div className="font-mono text-[24px] leading-none font-bold text-white transition-transform duration-500 group-hover:scale-110 drop-shadow-md">{sigil.sym}</div>
                  </div>
                </div>
                <div className="px-1">
                  <div className="text-[15px] font-medium text-foreground mb-1">{sigil.name}</div>
                  <div className="text-[13px] text-muted-foreground leading-relaxed">{sigil.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Part 3: Features */}
        <section className="py-20 mb-12">
          <h2 className="text-2xl font-medium mb-4 text-foreground tracking-tight">Everything you need to compress at scale.</h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-12">
            LTL ships with a full registry, formal research, and open-source tooling.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[ 
              {
                icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
                title: 'Infinite Scrolling Atlas',
                desc: 'Real-time searchable database of 620+ domain-specific patterns spanning React, API design, Database, DevOps, and general-purpose domains.'
              },
              {
                icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
                title: 'Token Efficiency Tracking',
                desc: 'Visual estimation of token savings per pattern. Average compression exceeds 94%, with some patterns achieving a 17× verbose expansion factor.'
              },
              {
                icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>,
                title: 'Research White Paper',
                desc: 'Formal derivation of TCR and ESCR, the four-stage algorithmic architecture, and concrete implications for cost and latency in production LLM systems.'
              },
              {
                icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.65-6.35"></path></svg>,
                title: '100% Free & Open Source',
                desc: 'MIT licensed. Built on Next.js, TypeScript, and Tailwind CSS. Self-host the full registry or extend the sigil schema with your own custom patterns.'
              }
            ].map((feature, i) => (
              <div key={i} className="border border-border bg-background rounded-[10px] p-6 hover:border-muted-foreground transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[18px] h-[18px] bg-primary text-primary-foreground rounded-[4px] flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div className="text-[15px] font-medium text-foreground leading-tight">{feature.title}</div>
                </div>
                <div className="text-[14px] text-muted-foreground leading-relaxed">{feature.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}

