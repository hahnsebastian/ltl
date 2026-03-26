'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-full bg-black border-t border-white/5 py-12 px-4 md:px-8 mt-auto select-none">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Branding & Copyright */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-white">
            LTL_REGISTRY // ATLAS_v1.1
          </div>
          <div className="text-[10px] text-ltl-grey font-mono tracking-wider">
            &copy; {currentYear} SEBASTIAN HAHN. ALL_RIGHTS_RESERVED.
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-md text-right md:text-left">
          <div className="text-[9px] font-bold text-ltl-grey/50 tracking-widest uppercase mb-1">
            DISCLAIMER_NOTICE
          </div>
          <p className="text-[9px] text-ltl-grey leading-relaxed italic border-l md:border-l-0 md:border-r border-white/10 pl-3 md:pl-0 md:pr-3">
            TOKEN_COMPRESSION_RATIO is an algorithmic estimation based on standard prompt-to-LTL mapping. 
            Actual performance and efficiency may vary depending on the target LLM architecture, 
            context window utilization, and specific instruction complexity.
          </p>
        </div>

        {/* System Diagnostics */}
        <div className="flex gap-6 font-mono text-[8px] text-ltl-grey/30 uppercase tracking-[0.2em]">
          <div className="flex flex-col items-end">
            <span>STATUS</span>
            <span className="text-white/40">OPERATIONAL</span>
          </div>
          <div className="flex flex-col items-end">
            <span>ENCRYPT</span>
            <span className="text-white/40">AES_256</span>
          </div>
          <div className="flex flex-col items-end">
            <span>LTL_ID</span>
            <span className="text-white/40">RC_GXM_99</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
