"use client"

import { useState, useEffect, useRef } from 'react'
import { parseLTL } from '@/lib/ltl-parser'
import { executeLTL } from '@/lib/ltl-runtime'
import { RuntimeResult } from '@/lib/ltl-types'
import { validateLTL, ValidationResult } from '@/lib/ltl-validator'

export default function RuntimePage() {
  const [ltlCode, setLtlCode] = useState(`% "LTL Expert"
#expertise: Language Engineering
@subject: "Dynamic Execution"

$target = "World" {{input}}
$tone = "professional" [professional|casual|technical]

!explain
  $a: LTL Runtime
  $b: Traditional Interpreters

#must: [step-by-step, typescript-driven]
#no: [bloat, ambiguity]

>structure: custom
@section "Introduction"
  >depth: 2
  >covers: [purpose, architecture]
@section "Execution Flow"
  >depth: 3
  >covers: [variable-resolution, ai-calls]

!assert >must-include: [architecture]`)

  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'complete' | 'error'>('idle')
  const [log, setLog] = useState<string[]>([])
  const [sections, setSections] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState('')
  const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({
    target: 'World',
    tone: 'professional'
  })

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const program = parseLTL(ltlCode)
        const v = validateLTL(program)
        setValidation(v)
      } catch (err) {
        console.error('Parsing error:', err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [ltlCode])

  const handleRun = async () => {
    if (!validation?.valid) return

    setExecutionState('running')
    setLog([])
    setSections({})
    setOutput('')
    setProgress(0)
    setCurrentSection('')

    try {
      const program = parseLTL(ltlCode)
      const result = await executeLTL(program, {
        // Now purely using the provided webllm engine context if available
        
        onSectionStart: (heading, index, total) => {
          setCurrentSection(heading)
          setProgress(Math.round((index / total) * 90))
          setLog(prev => [...prev, `EXECUTING: @section "${heading}" (${index + 1}/${total})`])
        },

        onSectionComplete: (heading, content) => {
          setSections(prev => ({ ...prev, [heading]: content }))
          setLog(prev => [...prev, `COMPLETE: "${heading}"`])
          setOutput(prev => prev + `${heading}\n${content}\n\n`)
        },

        onProgress: (pct) => setProgress(pct)
      }, resolvedVariables)

      setOutput(result.output)
      setLog(result.executionLog)
      setExecutionState('complete')
    } catch (err: any) {
      setLog(prev => [...prev, `ERROR: ${err.message}`])
      setExecutionState('error')
    }
  }

  const canRun = validation?.valid && executionState !== 'running'

  return (
    <div className="flex-1 flex flex-col p-8 selection:bg-primary/10 bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LTL / <span className="text-primary font-black uppercase">Runtime</span></h1>
            <p className="text-xs text-muted-foreground mt-1 font-bold italic">Alpha Interpreter Engine</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={handleRun}
              disabled={!canRun}
              className={`px-6 py-2 rounded text-xs font-bold transition-all ${
                canRun 
                  ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {executionState === 'running' ? 'RUNNING...' : validation?.errors.length ? 'FIX ERRORS FIRST' : validation?.warnings.length ? 'RUN ⚠' : 'RUN'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor & Variables */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-black">
                  <span className="text-[10px] text-black font-bold">LTL Source</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                <textarea
                  value={ltlCode}
                  onChange={(e) => setLtlCode(e.target.value)}
                  className="w-full h-[500px] bg-transparent p-6 outline-none resize-none text-sm leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Validation Panel */}
            <div className="bg-white border border-black rounded-lg p-4 space-y-3">
              <h3 className="text-[10px] text-black font-bold px-1">Validation</h3>
              <div className="space-y-2">
                {validation?.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-950/20 border border-red-900/30 rounded">
                    <div className="text-red-400 text-xs font-bold flex items-center gap-2">
                      <span>✗ [{err.code}]</span>
                      <span className="font-normal opacity-80">{err.message}</span>
                    </div>
                    <div className="text-[10px] text-red-400/60 mt-1 ml-6">→ {err.fix}</div>
                  </div>
                ))}
                {validation?.warnings.map((warn, i) => (
                  <div key={i} className="p-3 bg-amber-950/20 border border-amber-900/30 rounded">
                    <div className="text-amber-400 text-xs font-bold flex items-center gap-2">
                      <span>⚠ [{warn.code}]</span>
                      <span className="font-normal opacity-80">{warn.message}</span>
                    </div>
                  </div>
                ))}
                {validation?.valid && validation.warnings.length === 0 && (
                  <div className="text-green-500 text-xs py-1 px-1 flex items-center gap-2">
                    <span>✓</span> VALID — ready to run
                  </div>
                )}
                {validation?.valid && validation.warnings.length > 0 && (
                  <div className="text-amber-500 text-xs py-1 px-1 flex items-center gap-2">
                    <span>⚠</span> VALID WITH WARNINGS — can run
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Execution & Output */}
          <div className="lg:col-span-5 space-y-6">
             {/* Progress & Log */}
             <div className="bg-white border border-black rounded-lg overflow-hidden flex flex-col h-[400px]">
                <div className="px-4 py-2 border-b border-black flex items-center justify-between">
                  <span className="text-[10px] text-black font-bold">Execution log</span>
                  {executionState === 'running' && (
                    <span className="text-[10px] text-purple-400 animate-pulse">{progress}% - {currentSection}</span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px]">
                  {log.length === 0 && <div className="text-zinc-700 italic">Engine idle... awaiting sequence.</div>}
                  {log.map((entry, i) => (
                    <div key={i} className={entry.startsWith('ERROR') ? 'text-red-400' : 'text-zinc-500'}>
                      <span className="text-zinc-700 mr-2">[{i.toString().padStart(2, '0')}]</span>
                      {entry}
                    </div>
                  ))}
                  {executionState === 'running' && <div className="animate-pulse inline-block w-2 h-3 bg-purple-500 ml-1"></div>}
                </div>
                {executionState === 'running' && (
                   <div className="h-1 bg-zinc-800">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                   </div>
                )}
             </div>

             {/* Dynamic Output Canvas */}
             <div className="bg-white border border-black rounded-lg overflow-hidden flex flex-col h-[480px]">
                <div className="px-4 py-2 border-b border-black flex items-center justify-between">
                  <span className="text-[10px] text-black font-bold">Resulting output</span>
                  <button className="text-[10px] text-black hover:underline transition-colors font-bold">Copy</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed prose prose-invert max-w-none">
                    {Object.entries(sections).map(([heading, content], i) => (
                      <div key={i} className="mb-6 last:mb-0">
                         <h3 className="text-black font-bold mb-2 text-xs border-l-2 border-purple-500 pl-3">{heading}</h3>
                         <div className="text-black">{content}</div>
                      </div>
                   ))}
                   {!Object.keys(sections).length && <div className="text-zinc-700 italic">No output yet. Run the sequence to generate.</div>}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
