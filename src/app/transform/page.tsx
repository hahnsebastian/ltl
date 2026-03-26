'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function TransformPage() {
  const [copied, setCopied] = useState(false)

  const scoutingLTL = `LTL @scouting_report !rep %SNR_SCOUT #no-stats #narrative #fixed-headings >md`

  const handleCopy = () => {
    navigator.clipboard.writeText(scoutingLTL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-16 w-full flex-1">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-2">
            PROMPT_TRANSFORM <span className="text-ltl-grey/20 text-xl font-normal lowercase tracking-widest">v1.2</span>
          </h1>
          <p className="text-ltl-grey max-w-2xl text-sm italic border-l border-white/20 pl-4">
            Convert massive natural language payloads into deterministic LTL commands.
            Reduce token pressure while maintaining 100% semantic integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Natural Language Side */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold text-red-500/80 uppercase">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              ORIGINAL_PAYLOAD [1,450 TOKENS]
            </div>
            <div className="border border-white/10 p-6 bg-white/[0.02] text-[10px] leading-relaxed text-ltl-grey/50 italic h-[500px] overflow-y-auto scrollbar-hide">
              <p className="mb-4">{`"You are a scouting support analyst. Your task is to create a detailed player report for the following player: {{player_name}}. The report MUST follow the exact structure and headings shown below..."`}</p>
              <p className="mb-4">{`"For each main section (e.g., Relevant Player Context, Attacking, Defending, Conclusion), write a single, coherent, well-written paragraph. The report should read like a traditional scout’s report, focusing on what the player does and does not do..."`}</p>
              <p className="mb-4">{`"Do NOT include any raw statistics, numbers, or explicit data references (e.g., “completed X passes” or “won Y duels”). Do NOT list bullet points. Instead, write in a narrative style..."`}</p>
              <p className="mb-4">{`"Maintain the main headings exactly as shown: Relevant Player Context [...] Attacking (+attacking transition) [...] Defending (+defensive transition) [...] Conclusion [...] Grade: Select one grade A+ to D..."`}</p>
              <div className="mt-8 pt-4 border-t border-white/5 opacity-30">
                [... TRUNCATED FOR DISPLAY ...]
              </div>
            </div>
          </div>

          {/* LTL Side */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold text-green-500/80 uppercase">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LTL_COMPRESSED [8 TOKENS]
            </div>
            <div className="border border-white/20 p-8 md:p-12 bg-white/[0.03] flex flex-col items-center justify-center min-h-[500px] text-center relative group">
              <div className="absolute top-4 right-4 text-[7px] text-ltl-grey/20 tracking-widest font-bold">RATIO: 181.25:1</div>
              
              <code className="text-xl md:text-2xl text-blue-400 font-bold tracking-tight mb-8 break-all max-w-md">
                {scoutingLTL}
              </code>
              
              <button 
                onClick={handleCopy}
                className="px-8 py-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold tracking-[0.2em] uppercase"
              >
                {copied ? '[ COPIED_TO_CLIPBOARD ]' : '[ COPY_LTL_COMMAND ]'}
              </button>

              <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-[8px] tracking-[0.2em] font-bold text-ltl-grey/30 uppercase text-left">
                <div className="border-l border-blue-400/50 pl-2">@scouting_report<br/><span className="text-[6px] opacity-50 mt-1 block">SCOPE_LOCKED</span></div>
                <div className="border-l border-red-400/50 pl-2">!rep<br/><span className="text-[6px] opacity-50 mt-1 block">ACTION_SET:REPORT</span></div>
                <div className="border-l border-green-400/50 pl-2">%SNR_SCOUT<br/><span className="text-[6px] opacity-50 mt-1 block">PERSONA_CALIBRATED</span></div>
                <div className="border-l border-yellow-400/50 pl-2">#no-stats<br/><span className="text-[6px] opacity-50 mt-1 block">STRICT_CONSTRAINT</span></div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24 border-t border-white/10 pt-16">
          <h2 className="text-white uppercase tracking-widest text-lg mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-white text-3xl font-bold opacity-10 font-mono">01</div>
              <h3 className="text-white uppercase text-sm tracking-widest">Semantic Extraction</h3>
              <p className="text-ltl-grey/60 text-xs leading-relaxed">
                LTL strips away the conversational "surface" of a prompt and maps the core intent to a deterministic symbol-prefix system.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-white text-3xl font-bold opacity-10 font-mono">02</div>
              <h3 className="text-white uppercase text-sm tracking-widest">Constraint Mapping</h3>
              <p className="text-ltl-grey/60 text-xs leading-relaxed">
                Complex behavioral rules like "No bullet points" or "Well-written paragraphs" are compiled into simple #hashes defined in the global core.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-white text-3xl font-bold opacity-10 font-mono">03</div>
              <h3 className="text-white uppercase text-sm tracking-widest">Context Caching</h3>
              <p className="text-ltl-grey/60 text-xs leading-relaxed">
                Since the LTL specification is cached on the model's server, providing the command instantly triggers the full original behavioral set.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
