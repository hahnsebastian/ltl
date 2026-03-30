import React from 'react'
import Navbar from '@/components/Navbar'

export default function WhitePaper() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16 flex-1 w-full prose-ltl">
        <div className="border border-white/20 p-8 md:p-12 mb-12 bg-[#050505] flex flex-col gap-8">
          <h1 className="glitch-text text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase leading-none border-b border-white/20 pb-8 border-dashed">
            LTL ATLAS v2.0.0
            <span className="block text-xl text-white mt-4 font-normal tracking-wide">[The Unified Context Thesis]</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-ltl-grey font-mono bg-white/[0.02] p-8 border border-white/10">
             <div className="flex flex-col gap-2">
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Version</strong>
                 <span className="text-green-400">v2.0.0-STABLE</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Status</strong>
                 <span>PROD_ACTIVE [500,000 Patterns]</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Protocol</strong>
                 <span className="text-white/40">Unified Context & Chaining</span>
               </div>
             </div>
             <div className="flex flex-col gap-2">
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Compression</strong>
                 <span className="text-white font-bold">96.8% - 99.2%</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Primary Goal</strong>
                 <span>Zero-Token Context Caching</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <strong className="text-white uppercase tracking-widest text-[10px]">Compliance</strong>
                 <span className="text-yellow-400/80 italic">SOP-001/002/003 Ready</span>
               </div>
             </div>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-white uppercase tracking-widest text-lg mb-6 border-l-4 border-white pl-6">01_The v2.0 Shift: Unified Context</h2>
          <p className="text-ltl-grey leading-loose mb-6">
            LTL v2.0 simplifies the prompt engineering paradigm by introducing the <strong>&quot;Unified Context Operator&quot; (&amp;)</strong>. 
            Historically, prompt compression required a separation between deterministic shorthands and literal nuances. 
            v2.0 bridges this gap by formally embedding raw textual context directly into the command string.
          </p>
          <div className="bg-white/5 p-6 border border-white/10 font-mono text-xs mb-6">
             <div className="text-white/30 mb-2 uppercase tracking-widest text-[8px]">New_Syntax:</div>
             <span className="text-white font-bold">LTL [Scope] [Action] [Persona] [Constraint] [Output] <span className="text-green-400">&</span> [Nuanced Literal Data]</span>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-white uppercase tracking-widest text-lg mb-6 border-l-4 border-white pl-6">02_Multi-Pass Chaining</h2>
          <p className="text-ltl-grey leading-loose mb-6">
            The v2.0 engine enables <strong>Recursive Intent Extraction</strong>. 
            One natural language prompt can now generate a vertical <strong>Chain of LTL Steps</strong>. 
            This reduces information loss by converting secondary tasks (e.g., &quot;Refactor and then document&quot;) into 
            independent, optimized LTL triggers within the same payload.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-white uppercase tracking-widest text-lg mb-6 border-l-4 border-white pl-6">03_Dynamic Argument Precision</h2>
          <p className="text-ltl-grey leading-loose mb-6">
            By leveraging the <strong>[Symbol](Literal Value)</strong> syntax, LTL v2.0 targets 
            specific identifiers (Names, Versions, Paths) with surgical precision. 
            This allows LTL to remain a single-line command even when handling complex, non-indexable technical entities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
             <div className="border border-white/10 p-4">
                <div className="text-[10px] text-white/30 uppercase mb-2">Standard_Efficiency</div>
                <div className="text-2xl font-bold">96.8%</div>
             </div>
             <div className="border border-white/5 shadow-inner p-4 bg-white/[0.01]">
                <div className="text-[10px] text-white/30 uppercase mb-2">Chained_Fidelity</div>
                <div className="text-2xl font-bold text-green-400">100%</div>
             </div>
          </div>
        </section>

        <section className="border-t border-white/20 pt-16 flex flex-col gap-8 opacity-40">
           <div className="text-[10px] text-ltl-grey uppercase tracking-[0.3em] font-bold">
             [END_OF_THESIS_v2.0.0]
           </div>
        </section>
      </main>
    </div>
  )
}
