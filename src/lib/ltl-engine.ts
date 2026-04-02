/**
 * LTL Unified Engine v2.5.0
 * Combines Regex-based Compression and Keyword-based Compilation
 */

// ─────────────────────────────────────────────────────────────────────
//  DICTIONARIES & VOCABULARY
// ─────────────────────────────────────────────────────────────────────

export const LTL_ACTIONS: Record<string, string> = {
  '!ref': 'Refactor / resolve logic-debt & optimise maintainability',
  '!sec': 'Security audit — XSS, SQLi, Auth flaws',
  '!doc': 'Document — internal architecture + API schemas',
  '!opt': 'Performance optimise — sub-ms focus',
  '!test': 'Write 100% coverage suite (unit + E2E)',
  '!act': 'Execute technical operational payload',
  '!reason': 'Execute CoT reasoning / analysis',
  '!solve': 'Resolve industrial/technical challenge',
  '!react': 'ReAct: Thought → Action → Observe loop',
  '!scout': 'Professional Scouting Protocol (SOP-001)',
  '!extract': 'Parse & extract structured data losslessly',
  '!summarize': 'Summarise with zero loss of technical detail',
  '!translate': 'Translate logic to target syntax',
  '!audit': 'Rigorous compliance audit',
  '!scale': 'Design 10× scaling strategy',
  '!migrate': 'Migrate to new paradigm with full parity',
  '!bench': 'Benchmark against industry standards',
  '!solid': 'Pure-SOLID refactoring (SOP-002)',
  '!zero': 'Zero-Trust Security Verification (SOP-003)',
  '!debug': 'Debugging / Root-Cause Analysis',
  '!clean': 'Industrial Clean-Up (remove dead code)',
}

export const LTL_PERSONAS: Record<string, string> = {
  '%SNR': 'Senior Dev', '%ARC': 'Architect', '%ML': 'ML Engineer',
  '%SEC': 'Security Eng', '%AI': 'AI Engineer', '%DBA': 'DB Admin',
  '%UX': 'UX Designer', '%DATA': 'Data Engineer', '%SRE': 'SRE',
  '%ETHIC': 'AI Ethics', '%TUTOR': 'Tutor', '%SCOUT': 'Scouting Analyst',
  '%OPS': 'DevOps Eng', '%STAFF': 'Staff Engineer', '%CTO': 'CTO',
  '%VPE': 'VPE', '%WEB3': 'Web3 Eng', '%FINANCE': 'Financial Analyst',
  '%MEDIC': 'Physician', '%PENTESTER': 'Pen-Tester',
}

export const LTL_CONSTRAINTS: Record<string, string> = {
  '#dry': "Don't-Repeat-Yourself principle", '#min': 'Minimal / concise output',
  '#std': 'Standard quality', '#fast': 'Speed-optimised', '#safe': 'Safety-first',
  '#typed': 'Strict type safety', '#acc': 'Accuracy-critical', '#perf': 'Performance-critical',
  '#solid': 'SOLID principles', '#clean': 'Clean code standards', '#tdd': 'Test-Driven Development',
  '#cot': 'Chain-of-Thought reasoning', '#step': 'Step-by-step breakdown',
  '#detailed': 'Exhaustive detail', '#concise': 'Brief & concise',
  '#professional': 'Professional tone', '#atomic': 'Atomic / single-responsibility',
  '#immutable': 'Immutable design', '#async': 'Async-first',
  '#i18n': 'Internationalisation-ready', '#a11y': 'Accessibility-compliant',
  '#ha': 'High Availability (99.999%)', '#idempotent': 'Pure side-effect-free logic',
  '#strict': 'Zero-tolerance for technical debt', '#narrative': 'Narrative / Flowing style',
}

export const LTL_SCOPES: Record<string, string> = {
  '@/src': 'Source code', '@/api': 'API layer', '@/db': 'Database',
  '@/ui': 'User interface', '@/auth': 'Auth system', '@/tests': 'Test suite',
  '@/infra': 'Infrastructure', '@terminal': 'Terminal / Shell', '@browser': 'Browser',
  '@sql': 'SQL', '@python': 'Python', '@react': 'React', '@next': 'Next.js',
  '@docker': 'Docker', '@aws': 'AWS', '@agent': 'AI Agent', '@logs': 'Logs / Telemetry',
  '@edge': 'Edge / IoT', '@llm': 'LLM context', '@javascript': 'JS Context',
}

export const LTL_OUTPUTS: Record<string, string> = {
  '>md': 'Markdown', '>json': 'JSON', '>ts': 'TypeScript', '>py': 'Python',
  '>sql': 'SQL', '>yaml': 'YAML', '>html': 'HTML', '>sh': 'Shell script',
  '>go': 'Go', '>mermaid': 'Mermaid diagram', '>raw': 'Plain Text', '>csv': 'CSV',
}

// ─────────────────────────────────────────────────────────────────────
//  COMPRESSOR REGEX RULES
// ─────────────────────────────────────────────────────────────────────

type PatternPair = [RegExp, string, string?] // Regex, Replacement, Category?

export const FILLER_PATTERNS: PatternPair[] = [
  [/\bplease\b[\s,]*/gi, ''],
  [/\bthank\s+you\b[\s,.!]*/gi, ''],
  [/\bthanks\b[\s,.!]*/gi, ''],
  [/\bif\s+you\s+don['']t\s+mind\b[\s,]*/gi, ''],
  [/\bif\s+possible\b[\s,]*/gi, ''],
  [/\bwould\s+you\s+(?:be\s+able\s+to|mind)\b[\s,]*/gi, ''],
  [/\bcould\s+you\s+(?:please\s+)?/gi, ''],
  [/\bI['']d\s+(?:really\s+)?(?:like|appreciate|love)\s+(?:it\s+if\s+(?:you\s+)?(?:could\s+)?)?/gi, ''],
  [/\bI\s+want\s+you\s+to\b[\s]*/gi, ''],
  [/\bI\s+need\s+you\s+to\b[\s]*/gi, ''],
  [/\bcan\s+you\s+(?:please\s+)?/gi, ''],
  [/\bwill\s+you\s+(?:please\s+)?/gi, ''],
  [/\bas\s+a\s+helpful\s+assistant\b[\s,]*/gi, ''],
  [/\busing\s+your\s+expertise\b[\s,]*/gi, ''],
  [/\bin\s+your\s+expert\s+opinion\b[\s,]*/gi, ''],
  [/\bfeel\s+free\s+to\b[\s]*/gi, ''],
  [/\bgo\s+ahead\s+and\b[\s]*/gi, ''],
]

export const SEMANTIC_PATTERNS: PatternPair[] = [
  // Role
  [/\bact\s+as\s+(?:an?\s+)?/gi, 'Role:', 'Role Assignment'],
  [/\byou\s+are\s+now\s+(?:an?\s+)?/gi, 'Role:', 'Role Assignment'],
  [/\bbehave\s+as\s+(?:an?\s+)?/gi, 'Role:', 'Role Assignment'],
  // CoT
  [/\bthink\s+(?:this\s+through\s+)?step[\s-]+by[\s-]+step\b/gi, 'CoT:', 'Reasoning'],
  [/\bexplain\s+your\s+(?:reasoning|logic|thought\s+process)\b/gi, 'CoT:', 'Reasoning'],
  [/\bwalk\s+(?:me\s+)?through\s+(?:your\s+)?(?:reasoning|thought process|logic)\b/gi, 'CoT:', 'Reasoning'],
  // Constraints
  [/\b(?:make\s+sure\s+(?:to|that)?|ensure\s+(?:that)?)[\s]*/gi, 'CRITICAL:', 'Constraint'],
  [/\bit\s+is\s+(?:absolutely\s+)?(?:important|essential|critical|crucial)\s+(?:that\s+)?/gi, 'CRITICAL:', 'Constraint'],
]

// ─────────────────────────────────────────────────────────────────────
//  ENGINE LOGIC
// ─────────────────────────────────────────────────────────────────────

export function compileLTL(input: string) {
  if (!input.trim()) return null

  const workingText = input.toLowerCase()
  const foundTokens: { scope: string[], action: string[], persona: string[], constraint: string[], output: string[] } = {
    scope: [], action: [], persona: [], constraint: [], output: []
  }
  const usedWords = new Set<string>()

  const mapping = [
    { dict: LTL_SCOPES, type: 'scope' as const, prefix: '@' },
    { dict: LTL_ACTIONS, type: 'action' as const, prefix: '!' },
    { dict: LTL_PERSONAS, type: 'persona' as const, prefix: '%' },
    { dict: LTL_CONSTRAINTS, type: 'constraint' as const, prefix: '#' },
    { dict: LTL_OUTPUTS, type: 'output' as const, prefix: '>' }
  ]

  for (const { dict, type, prefix } of mapping) {
    for (const [key, desc] of Object.entries(dict)) {
      const token = key.toLowerCase()
      const descLower = desc.toLowerCase()
      
      // Match token directly OR important words in description
      const hasToken = workingText.includes(token)
      const hasDescMatch = descLower.split(/\s+/).some(word => word.length > 3 && workingText.includes(word))

      if (hasToken || hasDescMatch) {
         if (!foundTokens[type].includes(key)) {
           foundTokens[type].push(key)
           usedWords.add(token.replace(/[^a-z0-9]/gi, ''))
         }
      }
    }
  }

  // Construct a single primary LTL command from found tokens
  const primaryLTL = `LTL ${foundTokens.scope[0] || '@agent'} ${foundTokens.action[0] || '!act'} ${foundTokens.persona[0] || '%SNR'} ${foundTokens.constraint[0] || '#std'} ${foundTokens.output[0] || '>md'}`

  return { primaryLTL, foundTokens, usedWords }
}

export interface AtlasEntry {
  id: number;
  command: string;
  category: string;
  fullInstruction: string;
  standardTokens: number;
  ltlTokens: number;
  efficiency: number;
}

export function findBestMatchInAtlas(input: string, database: AtlasEntry[]): AtlasEntry | null {
  if (!input || database.length === 0) return null;
  
  const queryWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let bestMatch: AtlasEntry | null = null;
  let maxScore = -1;

  // Faster matching: Check top 10k or random sample to avoid browser hang
  // or focus on direct keyword collisions in instructions.
  for (let i = 0; i < Math.min(database.length, 25000); i++) {
    const entry = database[i];
    const instruction = entry.fullInstruction.toLowerCase();
    let score = 0;
    
    queryWords.forEach(word => {
      if (instruction.includes(word)) score += 1;
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  return maxScore > 0 ? bestMatch : null;
}

export function compressLTL(prompt: string) {
  let text = prompt
  // Apply filler removal
  FILLER_PATTERNS.forEach(([re, repl]) => {
    text = text.replace(re, repl)
  })
  // Apply semantic replacement
  SEMANTIC_PATTERNS.forEach(([re, repl]) => {
    text = text.replace(re, repl)
  })
  
  // Cleanup
  text = text.replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/[,;]\s*$/gm, '')
    .trim()

  return text
}
