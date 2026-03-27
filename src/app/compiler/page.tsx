'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'

export default function LTLCompiler() {
  const [input, setInput] = useState('')

  const ltlResult = useMemo(() => {
    if (!input.trim()) return null

    const t = input.toLowerCase()
    
    // 1. Derive Scope
    let scope: string | null = null
    if (t.includes('terminal') || t.includes('shell')) scope = '@terminal'
    else if (t.includes('browser')) scope = '@browser'
    else if (t.includes('excel') || t.includes('sheet')) scope = '@excel'
    else if (t.includes('javascript') || t.includes('console')) scope = '@javascript'
    else if (t.includes('python')) scope = '@python'
    else if (t.includes('sql') || t.includes('database')) scope = '@sql'
    else if (t.includes('react')) scope = '@react'
    else if (t.includes('solidity') || t.includes('blockchain') || t.includes('ethereum')) scope = '@eth'
    else if (t.includes('unity')) scope = '@unity'
    else if (t.includes('linux')) scope = '@linux'
    else if (t.includes('docker') || t.includes('container')) scope = '@docker'
    else if (t.includes('test') || t.includes('/tests')) scope = '@tests'
    else if (t.includes('api') || t.includes('/api')) scope = '@api'
    else if (t.includes('ui') || t.includes('/components')) scope = '@ui'
    else if (t.includes('scout') || t.includes('player')) scope = '@player'

    // 2. Derive Action
    let action: string | null = null
    if (t.includes('scout') || t.includes('player report') || t.includes('scouting report')) action = '!scout'
    else if (t.includes('refactor') || t.includes('clean') || t.includes('rewrite')) action = '!ref'
    else if (t.includes('security') || t.includes('audit') || t.includes('vulnerability')) action = '!sec'
    else if (t.includes('optimize') || t.includes('performance') || t.includes('faster')) action = '!opt'
    else if (t.includes('test') || t.includes('coverage')) action = '!test'
    else if (t.includes('summarize')) action = '!summarize'
    else if (t.includes('extract')) action = '!extract'
    else if (t.includes('translate')) action = '!translate'
    else if (t.includes('reason') || t.includes('step-by-step')) action = '!reason'
    else if (t.includes('agent') || t.includes('loop')) action = '!react'
    else if (t.includes('document')) action = '!doc'

    // 3. Derive Persona
    let persona: string | null = null
    if (t.includes('scout')) persona = '%SCOUT'
    else if (t.includes('security') || t.includes('hacker') || t.includes('pentest')) persona = '%SEC'
    else if (t.includes('architect') || t.includes('structure')) persona = '%ARC'
    else if (t.includes('ml') || t.includes('intelligence') || t.includes('llm')) persona = '%ML'
    else if (t.includes('data') || t.includes('analytics')) persona = '%DATA'
    else if (t.includes('ux') || t.includes('design')) persona = '%UX'
    else if (t.includes('sre') || t.includes('infra') || t.includes('ops')) persona = '%SRE'
    else if (t.includes('academic') || t.includes('tutor') || t.includes('teacher')) persona = '%TUTOR'
    else if (t.includes('senior') || t.includes('expert') || t.includes('dev')) persona = '%SNR'

    // 4. Derive Constraint
    let constraint: string | null = null
    if (t.includes('scout') || t.includes('narrative')) constraint = '#narrative'
    else if (t.includes('concise') || t.includes('no explain') || t.includes('short')) constraint = '#min'
    else if (t.includes('creative') || t.includes('elegant') || t.includes('beautiful')) constraint = '#creative'
    else if (t.includes('professional') || t.includes('rigorous') || t.includes('standard')) constraint = '#professional'
    else if (t.includes('dry') || t.includes('duplicate')) constraint = '#dry'
    else if (t.includes('high availability') || t.includes('uptime')) constraint = '#ha'
    else if (t.includes('performant') || t.includes('latency')) constraint = '#perf'
    else if (t.includes('standard') || t.includes('default')) constraint = '#std'

    // 5. Derive Output
    let output: string | null = null
    if (t.includes('json')) output = '>json'
    else if (t.includes('typescript') || t.includes('.ts')) output = '>ts'
    else if (t.includes('sh') || t.includes('terminal output')) output = '>sh'
    else if (t.includes('csv') || t.includes('table')) output = '>csv'
    else if (t.includes('python') || t.includes('.py')) output = '>py'
    else if (t.includes('mermaid') || t.includes('diagram')) output = '>mermaid'
    else if (t.includes('markdown') || t.includes('summary')) output = '>md'

    const allDefined = !!(scope && action && persona && constraint && output)
    const command = `LTL ${scope || '[UNDEFINED]'} ${action || '[UNDEFINED]'} ${persona || '[UNDEFINED]'} ${constraint || '[UNDEFINED]'} ${output || '[UNDEFINED]'}`
    const stTokens = Math.ceil(input.split(' ').length * 1.35)
    const ltlTokens = 8
    const efficiency = Math.round((1 - (ltlTokens / Math.max(ltlTokens, stTokens))) * 100 * 10) / 10

    return { command, stTokens, ltlTokens, efficiency, scope, action, persona, constraint, output, allDefined }
  }, [input])

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 flex-1 w-full flex flex-col gap-12">
        <div className="border border-white/20 p-8 md:p-12 bg-[#050505] flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none mb-4">
              LTL_COMPILER <span className="text-ltl-grey/30 text-xl font-normal lowercase tracking-widest italic">v1.2</span>
            </h1>
            <p className="text-xs text-ltl-grey uppercase tracking-widest opacity-60">
              Deterministic Semantic Transformer: English Prompt → LTL Shorthand
            </p>
          </div>

          <div className="flex flex-col gap-4">
             <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">INTELLIGENT_INPUT</label>
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="PASTE YOUR DETAILED NATURAL LANGUAGE PROMPT HERE..."
               className="w-full h-48 bg-black border border-white/20 p-6 text-sm focus:outline-none focus:border-white/50 transition-all font-mono leading-relaxed placeholder:text-ltl-grey/10 text-white"
             />
          </div>

          {ltlResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">OPTIMIZED_LTL_COMMAND</label>
                   <div className="bg-white/5 border border-white/10 p-6 flex flex-col gap-4 group">
                      <div className="text-xl md:text-2xl font-bold tracking-tight break-all leading-tight">
                        <span className="text-ltl-grey/40">LTL</span>{' '}
                        <span className={ltlResult.scope ? 'text-blue-400' : 'text-red-500 underline decoration-dotted'}>{ltlResult.scope || '[MISSING_SCOPE]'}</span>{' '}
                        <span className={ltlResult.action ? 'text-red-400' : 'text-red-500 underline decoration-dotted'}>{ltlResult.action || '[MISSING_ACTION]'}</span>{' '}
                        <span className={ltlResult.persona ? 'text-green-400' : 'text-red-500 underline decoration-dotted'}>{ltlResult.persona || '[MISSING_PERSONA]'}</span>{' '}
                        <span className={ltlResult.constraint ? 'text-yellow-400' : 'text-red-500 underline decoration-dotted'}>{ltlResult.constraint || '[MISSING_CONSTRAINT]'}</span>{' '}
                        <span className={ltlResult.output ? 'text-purple-400' : 'text-red-500 underline decoration-dotted'}>{ltlResult.output || '[MISSING_OUTPUT]'}</span>
                      </div>
                      
                      {!ltlResult.allDefined && (
                        <div className="text-[9px] text-red-500 tracking-widest font-bold flex items-center gap-2">
                           <span>⚠ SEMANTIC_INCOMPLETENESS_DETECTED</span>
                           <span className="hidden sm:inline opacity-50 font-normal">{'//'} INSUFFICIENT DATA IN SOURCE PROMPT</span>
                        </div>
                      )}

                      <button 
                        disabled={!ltlResult.allDefined}
                        onClick={() => navigator.clipboard.writeText(ltlResult.command)}
                        className={`self-start text-[8px] font-bold border px-3 py-1 transition-all uppercase tracking-widest ${ltlResult.allDefined ? 'border-white/20 hover:bg-white hover:text-black hover:border-white' : 'border-red-500/20 text-red-500/40 cursor-not-allowed'}`}
                      >
                        [ {ltlResult.allDefined ? 'COPY_TO_CONTEXT' : 'INCOMPLETE_SPEC'} ]
                      </button>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">EFFICIENCY_TELEMETRY</label>
                   <div className="grid grid-cols-3 gap-4 h-full">
                      <div className="border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-center items-center">
                        <span className="text-[8px] text-ltl-grey/50 uppercase mb-1">RAW</span>
                        <span className="text-xl font-bold">{ltlResult.stTokens}</span>
                      </div>
                      <div className="border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-center items-center">
                        <span className="text-[8px] text-ltl-grey/50 uppercase mb-1">LTL</span>
                        <span className="text-xl font-bold">{ltlResult.ltlTokens}</span>
                      </div>
                      <div className="border border-white/10 bg-white/5 p-4 flex flex-col justify-center items-center">
                        <span className="text-[8px] text-green-400/80 uppercase mb-1">SAVED</span>
                        <span className="text-xl font-bold text-green-400">{ltlResult.efficiency}%</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-12 opacity-50">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[9px] font-mono leading-relaxed uppercase tracking-widest text-ltl-grey">
              <div>
                [001] THE COMPILER MAPS SEMANTIC INTENT TO A DETERMINISTIC SYMBOL DICTIONARY. 
                RED INDICATORS SIGNAL AREAS WHERE SOURCE PROMPT AMBIGUITY PREVENTS LOSSLESS TRANSFORMATION.
              </div>
              <div>
                [002] ALL TRANSFORMATIONS ARE EXECUTED ON-DEVICE. NO DATA LEAVES YOUR LOCAL DOMAIN. 
                LTL IS DESIGNED FOR ZERO-LATENCY PROMPT ENGINEERING.
              </div>
              <div>
                [003] FOR MAXIMUM EFFICIENCY, PROVIDE CONTEXTUAL CLUES (e.g. "Security Audit" OR "Refactor React Components").
              </div>
           </div>
        </section>
      </main>
    </div>
  )
}
