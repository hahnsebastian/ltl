'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'

export default function LTLCompiler() {
  const [input, setInput] = useState('')
  const [copiedSuccess, setCopiedSuccess] = useState(false)

  const ltlResult = useMemo(() => {
    if (!input.trim()) return null

    let workingText = input.toLowerCase()
    const ltlChain: string[] = []
    const usedWords = new Set<string>()

    // Stopwords to remove from residual context for MAXIMUM compression
    const stopwords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'for', 'of', 'and', 'or', 'with', 'by', 'at', 'from', 'as', 'please', 'can', 'you', 'my', 'your', 'i', 'the', 'this', 'that', 'it', 'some', 'any', 'all', 'must', 'should', 'would', 'exact', 'maintain', 'following', 'shows', 'below', 'include', 'instead', 'writing', 'describing', 'focusing', 'existing', 'professional', 'traditionals', 'matches', 'observed', 'games', ' Tendencies', ' Habits', ' Strengths', ' Weaknesses', ' Matches', ' Match', ' MATCH', ' MATCHES']);

    // Common term shorthands for Context Minification
    const contextualShorthands: Record<string, string> = {
      'refactor': 'ref', 'security': 'sec', 'documentation': 'doc', 'optimization': 'opt', 'testing': 'test',
      'summarize': 'sum', 'analytical': 'analyt', 'professional': 'pro', 'narrative': 'narr',
      'performance': 'perf', 'tendencies': 'tend', 'habits': 'hab', 'strengths': 'str', 'weaknesses': 'weak',
      'scouting': 'scout', 'player': 'plr', 'context': 'ctx', 'attacking': 'atk', 'defending': 'def',
      'conclusion': 'conc', 'grade': 'grd', 'headings': 'hdgs', 'match': 'mtch', 'matches': 'mtch'
    };

    // Keyword dictionary (v2.0.0 Expanded)
    const keywords = {
      scopes: [
        { key: '@logs', matches: ['logs', 'telemetry', 'observability', 'error log', 'trace'] },
        { key: '@next', matches: ['next.js', 'nextjs', 'pages router', 'app router', 'ssr', 'ssg'] },
        { key: '@edge', matches: ['edge', 'lambda@edge', 'cloudflare worker', 'iot', 'gateway'] },
        { key: '@llm', matches: ['llm', 'prompt', 'training', 'inference', 'embedding', 'rag'] },
        { key: '@terminal', matches: ['terminal', 'shell', 'bash', 'zsh', 'cli'] },
        { key: '@browser', matches: ['browser', 'chrome', 'safari', 'firefox', 'web view'] },
        { key: '@excel', matches: ['excel', 'sheet', 'csv', 'table', 'spreadsheet'] },
        { key: '@javascript', matches: ['javascript', 'console', 'nodejs', 'npm', 'js'] },
        { key: '@python', matches: ['python', 'pip', 'py', 'django', 'flask'] },
        { key: '@sql', matches: ['sql', 'database', 'postgres', 'mysql', 'db', 'query'] },
        { key: '@react', matches: ['react', 'component', 'hook', 'jsx', 'tsx'] },
        { key: '@api', matches: ['api', 'endpoint', 'rest', 'graphql', 'grpc'] },
        { key: '@ui', matches: ['ui', 'tailwind', 'css', 'design system'] },
        { key: '@player', matches: ['scout', 'player', 'scouting', 'performance profile', 'football', 'soccer'] }
      ],
      actions: [
        { key: '!bench', matches: ['benchmark', 'latency test', 'throughput', 'load test'] },
        { key: '!debug', matches: ['debug', 'fix', 'trace', 'root cause', 'troubleshoot'] },
        { key: '!audit', matches: ['audit', 'compliance', 'legal check', 'policy'] },
        { key: '!migrate', matches: ['migrate', 'upgrade', 'transform code', 'port'] },
        { key: '!scout', matches: ['scout', 'player report', 'scouting report', 'analytical report', 'grading'] },
        { key: '!ref', matches: ['refactor', 'clean', 'rewrite', 'improve', 'dry'] },
        { key: '!sec', matches: ['security', 'audit', 'vulnerability', 'owasp', 'penetration', 'pentest'] },
        { key: '!opt', matches: ['optimize', 'performance', 'faster', 'latency', 'bottleneck'] },
        { key: '!test', matches: ['test', 'coverage', 'unit', 'debugging'] },
        { key: '!summarize', matches: ['summarize', 'summary', 'brief', 'overview'] },
        { key: '!reason', matches: ['reason', 'step-by-step', 'thought', 'cot', 'logic'] },
        { key: '!doc', matches: ['document', 'readme', 'api spec', 'commenting'] }
      ],
      personas: [
        { key: '%CTO', matches: ['cto', 'strategic', 'leadership', 'vision', 'roadmap'] },
        { key: '%SRE', matches: ['sre', 'reliability', 'on-call', 'uptime', 'infrastructure'] },
        { key: '%LEGAL', matches: ['legal', 'lawyer', 'compliance officer', 'gdpr'] },
        { key: '%SCOUT', matches: ['scout', 'analyst', 'football scout', 'performance monitor'] },
        { key: '%SEC', matches: ['security', 'hacker', 'pentest', 'whitehat'] },
        { key: '%ARC', matches: ['architect', 'system design', 'structural'] },
        { key: '%ML', matches: ['ml', 'intelligence', 'llm', 'ai', 'data science'] },
        { key: '%SNR', matches: ['senior', 'expert', 'lead', 'dev', 'professional'] }
      ],
      constraints: [
        { key: '#strict', matches: ['strict', 'zero debt', 'no compromises', 'hard rule'] },
        { key: '#ha', matches: ['high availability', 'failover', 'redundancy', 'uptime'] },
        { key: '#idempotent', matches: ['idempotent', 'pure', 'stateless', 'side-effect free'] },
        { key: '#narrative', matches: ['scouting', 'narrative', 'flowing', 'essay', 'paragraph'] },
        { key: '#min', matches: ['concise', 'no explain', 'short', 'brief', 'minimal'] },
        { key: '#safe', matches: ['safe', 'secure', 'fail-secure', 'sanitize'] },
        { key: '#perf', matches: ['performant', 'latency', 'low level'] },
        { key: '#std', matches: ['standard', 'default', 'regular'] }
      ],
      outputs: [
        { key: '>raw', matches: ['raw', 'no formatting', 'plain text', 'txt'] },
        { key: '>json', matches: ['json', 'object', 'api payload'] },
        { key: '>ts', matches: ['typescript', '.ts', 'interface', 'type definition'] },
        { key: '>sh', matches: ['sh', 'terminal output', 'bash script'] },
        { key: '>csv', matches: ['csv', 'table', 'excel output'] },
        { key: '>mermaid', matches: ['mermaid', 'diagram', 'flowchart'] },
        { key: '>md', matches: ['markdown', 'summary', 'text', 'doc'] }
      ]
    }

    // MULTI-PASS LTL EXTRACTION
    let continueMatching = true
    while (continueMatching) {
      let currentScope = null; let currentAction = null; let currentPersona = null; let currentConstraint = null; let currentOutput = null
      let matchedAny = false
      for (const scopeObj of keywords.scopes) {
        for (const m of scopeObj.matches) { if (workingText.includes(m)) {
            currentScope = scopeObj.key
            m.split(/\s+/).forEach(w => usedWords.add(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
            workingText = workingText.replace(m, ''); matchedAny = true; break
      } } if (currentScope) break }
      for (const actionObj of keywords.actions) {
        for (const m of actionObj.matches) { if (workingText.includes(m)) {
            currentAction = actionObj.key
            m.split(/\s+/).forEach(w => usedWords.add(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
            workingText = workingText.replace(m, ''); matchedAny = true; break
      } } if (currentAction) break }
      for (const personaObj of keywords.personas) {
        for (const m of personaObj.matches) { if (workingText.includes(m)) {
            currentPersona = personaObj.key
            m.split(/\s+/).forEach(w => usedWords.add(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
            workingText = workingText.replace(m, ''); matchedAny = true; break
      } } if (currentPersona) break }
      for (const constObj of keywords.constraints) {
        for (const m of constObj.matches) { if (workingText.includes(m)) {
            currentConstraint = constObj.key
            m.split(/\s+/).forEach(w => usedWords.add(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
            workingText = workingText.replace(m, ''); matchedAny = true; break
      } } if (currentConstraint) break }
      for (const outObj of keywords.outputs) {
        for (const m of outObj.matches) { if (workingText.includes(m)) {
            currentOutput = outObj.key
            m.split(/\s+/).forEach(w => usedWords.add(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
            workingText = workingText.replace(m, ''); matchedAny = true; break
      } } if (currentOutput) break }
      if (matchedAny) {
        ltlChain.push(`LTL ${currentScope || '@agent'} ${currentAction || '!act'} ${currentPersona || '%SNR'} ${currentConstraint || '#std'} ${currentOutput || '>md'}`)
      } else { continueMatching = false }
      if (ltlChain.length > 5) break 
    }

    // CONTEXT MINIFICATION (The Token Killer)
    const originalWords = input.split(/(\s+)/)
    const leftOverParts: string[] = []
    const highlightedSource = originalWords.map((word, i) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!cleanWord) return <span key={i}>{word}</span>
      const isUsed = usedWords.has(cleanWord)
      if (!isUsed) leftOverParts.push(word)
      return (
        <span key={i} className={isUsed ? 'text-white font-bold opacity-100 underline decoration-white/20' : 'text-red-500/60 line-through opacity-40'}>
          {word}
        </span>
      )
    })

    const minifiedContext = leftOverParts
      .join('')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopwords.has(w)) // Strip stopwords & noise
      .map(w => contextualShorthands[w] || w) // Use contextual shorthands
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const hasMinContext = minifiedContext.length > 0
    const fullUnifiedChain = ltlChain.map((cmd) => {
       return hasMinContext ? `${cmd} & ${minifiedContext}` : cmd
    }).join('\n')

    const stTokens = Math.ceil(input.split(' ').length * 1.35)
    // ltlTokens calculation: commands (8 each) + minified context words
    const ltlTokens = ltlChain.length * 8 + (hasMinContext ? (minifiedContext.split(' ').length) : 0)
    const efficiency = Math.round((1 - (ltlTokens / Math.max(ltlTokens, stTokens))) * 100 * 10) / 10

    return { 
      fullUnifiedChain, 
      stTokens, ltlTokens, efficiency, 
      ltlChain, allDefined: ltlChain.length > 0, 
      highlightedSource, hasMinContext, minifiedContext
    }
  }, [input])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSuccess(true)
    setTimeout(() => setCopiedSuccess(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 flex-1 w-full flex flex-col gap-12">
        <div className="border border-white/20 p-8 md:p-12 bg-[#050505] flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none mb-4">
                LTL_COMPILER <span className="text-ltl-grey/30 text-xl font-normal lowercase tracking-widest italic">v2.1.0</span>
              </h1>
              <p className="text-xs text-ltl-grey uppercase tracking-widest opacity-60">
                Token-Optimized Context Minification Engine
              </p>
            </div>
            <div className="text-[10px] text-ltl-grey font-bold flex gap-4 uppercase tracking-[0.2em] border-l border-white/20 pl-4">
              <span>ALGO: DELTA_COMPRESSION</span>
              <span className="text-blue-400">STATUS: PROD</span>
            </div>
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
            <div className="flex flex-col gap-12 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">SEMANTIC_AUDIT_VIEW [WORD_STATUS]</label>
                <div className="p-6 bg-white/[0.02] border border-white/10 text-xs leading-loose font-mono whitespace-pre-wrap tracking-wide">
                   {ltlResult.highlightedSource}
                </div>
                <div className="text-[8px] text-ltl-grey/40 uppercase tracking-[0.2em] flex gap-4 mt-2">
                   <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-white underline decoration-white/20" /> MAPPED_TO_SYMBOL</div>
                   <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500/60 line-through" /> MINIFIED_OUT_OF_CONTEXT</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                 <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">MINIFIED_LTL_OUTPUT [v2.1_TOKEN_CRUSH]</label>
                 <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-8 group min-h-[250px] justify-between">
                    <div className="flex flex-col gap-6">
                       {ltlResult.ltlChain.map((cmd, idx) => (
                          <div key={idx} className="flex flex-col gap-3 group/item border-l-2 border-white/10 pl-6 py-2 hover:border-white transition-all">
                             <div className="text-[10px] font-bold text-white/30 tracking-[0.3em]">STEP_{idx + 1}</div>
                             <div className="flex flex-wrap text-lg md:text-2xl font-bold tracking-tight">
                                {cmd.split(' ').map((p, i) => (
                                   <span key={i} className="mr-2">{p}</span>
                                ))}
                                {ltlResult.hasMinContext && (
                                   <div className="flex items-center gap-3">
                                     <span className="text-ltl-grey/30">& </span>
                                     <span className="text-green-400 italic text-sm md:text-lg font-normal break-all line-clamp-2">
                                       {ltlResult.minifiedContext}
                                     </span>
                                   </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-t border-white/10 pt-8 mt-4">
                       <div className="flex flex-col gap-1">
                          <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-40">TOKEN_CRUSH_EFFICIENCY</div>
                          <div className="text-2xl font-bold text-green-400">{ltlResult.efficiency}% <span className="text-[10px] text-ltl-grey uppercase font-normal ml-2">MAX_SAVING</span></div>
                       </div>
                       
                       <button 
                         disabled={!ltlResult.allDefined}
                         onClick={() => copy(ltlResult.fullUnifiedChain)}
                         className={`text-xs font-bold border-2 px-8 py-3 transition-all uppercase tracking-widest ${ltlResult.allDefined ? 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'border-red-500/20 text-red-500/40 cursor-not-allowed'}`}
                       >
                         {copiedSuccess ? '[ 2.1_PROTO_COPIED! ]' : '[ COPY_MINIFIED_COMMAND ]'}
                       </button>
                    </div>
                 </div>
              </div>

           </div>
          )}
        </div>

        <section className="mt-12 opacity-60 border border-white/10 p-8 bg-white/[0.01]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col gap-4">
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">v2.1_Minification_Logic</h4>
                 <ul className="text-[10px] text-ltl-grey font-mono space-y-2 uppercase leading-relaxed">
                    <li>- [STOPWORDS] Stripping "the", "and", "please", etc.</li>
                    <li>- [DELTA_ENCODING] Replaces "refactor" with "ref", "scouting" with "scout".</li>
                    <li>- [DENSITY] Multi-pass extraction + Context Minification targets 99%+ efficiency.</li>
                 </ul>
              </div>
              <div className="flex flex-col gap-4">
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Architectural_Vanguard</h4>
                 <p className="text-[9px] text-ltl-grey font-mono leading-relaxed uppercase">
                    CONTEXT MINIFICATION TREATS THE "&" PAYLOAD AS A COMPRESSED DELTA STREAM. 
                    BY REMOVING SEMANTIC NOISE AND COMPACTING RESIDUAL TECHNICAL TERMS, WE MINIMIZE TOKEN CONSUMPTION WHILE RETAINING THE CORE NUANCE OF THE LLM'S INSTRUCTION SET.
                 </p>
              </div>
           </div>
        </section>
      </main>
    </div>
  )
}
