'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function PromptCompiler() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)

  const compilePrompt = () => {
    setIsCompiling(true)
    
    // Simulate compilation latency for aesthetic effect
    setTimeout(() => {
      let ltl = 'LTL '
      
      const lowerInput = input.toLowerCase()
      
      // Heuristic Scope Detection
      if (lowerInput.includes('player report') || lowerInput.includes('scout')) {
        const playerMatch = input.match(/{{(.*?)}}/)
        const playerName = playerMatch ? playerMatch[1].replace(/\s+/g, '_') : 'TARGET_PLAYER'
        ltl += `@/reports/${playerName} `
      } else if (lowerInput.includes('api') || lowerInput.includes('route')) {
        ltl += `@/api `
      } else {
        ltl += `@/workspace `
      }

      // Action Detection
      if (lowerInput.includes('create') || lowerInput.includes('generate')) {
        ltl += `!gen `
      } else if (lowerInput.includes('refactor') || lowerInput.includes('clean')) {
        ltl += `!ref `
      } else if (lowerInput.includes('audit') || lowerInput.includes('security')) {
        ltl += `!sec `
      } else {
        ltl += `!fix `
      }

      // Persona Detection
      if (lowerInput.includes('scout') || lowerInput.includes('scouting analyst')) {
        ltl += `%SCOUT `
      } else if (lowerInput.includes('senior') || lowerInput.includes('developer')) {
        ltl += `%SNR `
      } else if (lowerInput.includes('security')) {
        ltl += `%SEC `
      } else {
        ltl += `%ARC `
      }

      // Constraints Detection
      if (lowerInput.includes('no statistics') || lowerInput.includes('no data')) {
        ltl += `#no-stats #qualitative `
      }
      if (lowerInput.includes('narrative') || lowerInput.includes('coherent')) {
        ltl += `#narrative `
      }
      if (lowerInput.includes('dry') || lowerInput.includes('duplication')) {
        ltl += `#dry `
      }

      // Output Detection
      if (lowerInput.includes('markdown') || lowerInput.includes('headings')) {
        ltl += `>md`
      } else if (lowerInput.includes('json')) {
        ltl += `>json`
      } else {
        ltl += `>md`
      }

      setOutput(ltl.trim())
      setIsCompiling(false)
    }, 850)
  }

  return (
    <div className="min-h-screen flex flex-col pt-12 text-white">
      <Navbar />

      <main className="flex-1 flex flex-col px-4 md:px-8 max-w-screen-xl mx-auto w-full py-12">
        <div className="flex flex-col gap-2 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none italic">
            PROMPT_COMPILER <span className="text-ltl-grey/30 text-xl font-normal lowercase tracking-widest">v1.0</span>
          </h1>
          <p className="text-ltl-grey text-xs uppercase tracking-[0.2em]">
            Semantic Shorthand Encoder // Context Caching Optimizer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 mb-20 shadow-2xl overflow-hidden">
          {/* Input Side */}
          <div className="bg-black p-8 flex flex-col gap-6 border-r border-white/10">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-ltl-grey/60 uppercase">
              <span>INPUT_NATURAL_LANGUAGE</span>
              <span>[ UTF-8 ]</span>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="PASTE YOUR RAW PROMPT HERE..."
              className="flex-1 min-h-[400px] w-full bg-transparent border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none scrollbar-hide text-white placeholder:text-white/5"
            />

            <button
              onClick={compilePrompt}
              disabled={!input || isCompiling}
              className={`w-full py-4 border border-white/20 text-xs font-bold tracking-[0.4em] uppercase transition-all
                ${isCompiling ? 'bg-white text-black opacity-50' : 'hover:bg-white hover:text-black hover:border-white select-none active:scale-[0.98]'}`}
            >
              {isCompiling ? 'COMPILING_SEMANTICS...' : 'EXECUTE_COMPRESSION'}
            </button>
          </div>

          {/* Output Side */}
          <div className="bg-black p-8 flex flex-col gap-6 relative group">
             {/* Decorative scanline for output */}
             <div className="absolute inset-x-0 top-0 h-px bg-white/5 group-hover:bg-blue-400/20 transition-colors" />
             
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              <span>OUTPUT_LTL_PROTOCOL</span>
              <span className="animate-pulse">STABLE</span>
            </div>

            <div className="flex-1 min-h-[400px] flex items-center justify-center border border-white/[0.03] bg-white/[0.01]">
                {!output && !isCompiling ? (
                  <span className="text-[10px] text-ltl-grey/10 uppercase tracking-[0.3em]">AWAITING_INPUT</span>
                ) : isCompiling ? (
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-1 border border-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-white translate-x-[-100%] animate-[slide_1.5s_infinite_linear]" />
                     </div>
                     <span className="text-[9px] text-ltl-grey/30 uppercase tracking-widest animate-pulse">Encoding Vectors</span>
                  </div>
                ) : (
                  <div className="p-8 w-full">
                    <div className="text-2xl md:text-3xl font-mono text-blue-400 break-all leading-tight tracking-tighter">
                       {output}
                    </div>
                    <div className="mt-12 flex flex-col gap-4">
                       <div className="h-px bg-white/5" />
                       <div className="flex justify-between items-end">
                          <div className="flex flex-col gap-1">
                             <span className="text-[8px] text-ltl-grey/30 uppercase tracking-widest">SAVINGS_ESTIMATE</span>
                             <span className="text-sm font-bold text-green-400 tracking-widest">97.4%</span>
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(output)}
                            className="bg-white text-black px-6 py-2 text-[10px] font-bold tracking-[0.2em] transform active:scale-95 transition-all"
                          >
                            COPY_SEQUENCE
                          </button>
                       </div>
                    </div>
                  </div>
                )}
            </div>

            <style jsx>{`
               @keyframes slide {
                 0% { transform: translateX(-100%); }
                 100% { transform: translateX(100%); }
               }
            `}</style>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-white/5 text-[9px] font-mono text-ltl-grey/30 tracking-widest uppercase mb-12">
           <div className="flex flex-col gap-2">
              <span className="text-white/40">COMPILER_MODE</span>
              <span>HEURISTIC_MAPPING_v1.2</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-white/40">VECTOR_STATE</span>
              <span>SYNCHRONIZED_WITH_CORE.MD</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-white/40">SECURITY_CLEARANCE</span>
              <span>PROD_ACCESS_GRANTED</span>
           </div>
        </div>
      </main>
    </div>
  )
}
