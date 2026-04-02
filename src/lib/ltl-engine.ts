/**
 * LTL Unified Engine
 * Giga-Detail Refactorer + Full Specification Interpreter
 */

// ─────────────────────────────────────────────────────────────────────
//  VOCABULARY & DOMAIN TAGS
// ─────────────────────────────────────────────────────────────────────

export const LTL_DOMAIN_TAGS: Record<string, string[]> = {
  analysis: ['strengths', 'weaknesses', 'patterns', 'trends', 'anomalies', 'root-cause', 'context', 'implications', 'comparison', 'judgement', 'recommendation'],
  creative: ['tone', 'voice', 'structure', 'arc', 'tension', 'character', 'setting', 'pacing', 'imagery', 'theme', 'audience-fit', 'originality'],
  technical: ['architecture', 'implementation', 'edge-cases', 'performance', 'security', 'scalability', 'dependencies', 'tradeoffs', 'code-quality'],
  communication: ['intent', 'audience', 'clarity', 'persuasion', 'call-to-action', 'tone', 'formality', 'length', 'subject', 'greeting', 'sign-off'],
  instruction: ['prerequisites', 'steps', 'sequence', 'warnings', 'expected-output', 'error-handling', 'alternatives', 'summary'],
  evaluation: ['criteria', 'evidence', 'judgement', 'grade', 'recommendation', 'strengths', 'weaknesses', 'context', 'caveats'],
  research: ['background', 'methodology', 'findings', 'interpretation', 'limitations', 'implications', 'sources', 'gaps'],
  planning: ['goal', 'constraints', 'steps', 'timeline', 'resources', 'risks', 'dependencies', 'success-criteria', 'alternatives']
};

// ─────────────────────────────────────────────────────────────────────
//  GIGA-DETAIL REFACTORER
// ─────────────────────────────────────────────────────────────────────

export function compressToLTL(input: string): string {
  if (!input.trim()) return "";
  const originalTokens = Math.ceil(input.trim().split(/\s+/).length * 1.33);

  let p = ""; // Persona
  let a = ""; // Action
  let s = ""; // Subject
  let clean = input;

  // Cleanup
  const erasures = [/\bplease\b/gi, /\bthank\s+you\b/gi, /\bbriefly\b/gi, /\bi\s+want\s+you\s+to\b/gi];
  erasures.forEach(re => clean = clean.replace(re, ''));

  // Persona
  const pM = clean.match(/\b(?:you are an?|act as an?|role:)\s+([^.!?,\n]+)/i);
  if (pM) p = `%"${pM[1].trim()}"`;

  // Subject
  const sM = clean.match(/\b(?:for|regarding|about|context:)\s+(?:the\s+)?(?:following\s+)?([^.!\n:]+)/i);
  if (sM) s = sM[1].trim();

  // Action
  const aM = clean.match(/\b(?:your task is to|create|evaluate|analyse|write|generate|to)\s+([^.!?,\n]+)/i);
  if (aM) a = `!${aM[1].trim().split(/\s+/).slice(0, 2).join("-").toLowerCase()}`;

  // Variables (Deep Enum Discovery)
  const vars: string[] = [];
  vars.push(`$subject = "${s || 'auto'}"`);
  if (clean.toLowerCase().includes("tone")) vars.push(`$tone = [formal | casual | technical | narrative]`);
  if (clean.toLowerCase().includes("format") || clean.toLowerCase().includes("markdown") || clean.toLowerCase().includes("json")) vars.push(`$format = [prose | markdown | json | bullet | table | code]`);
  vars.push(`$depth = [1 | 2 | 3 | 4]`);
  if (clean.toLowerCase().includes("language") || clean.toLowerCase().includes("german") || clean.toLowerCase().includes("spanish")) vars.push(`$lang = [EN | DE | FR | ES]`);
  if (clean.toLowerCase().includes("audience")) vars.push(`$audience = [expert | general | beginner | executive]`);

  // Intent & Domain Analysis
  let intent = "auto";
  let domain = "auto";
  if (clean.toLowerCase().includes("explain")) { intent = "explain"; domain = "technical"; }
  if (clean.toLowerCase().includes("analyse") || clean.toLowerCase().includes("scout")) { intent = "analyse"; domain = "analysis"; }
  if (clean.toLowerCase().includes("evaluate") || clean.toLowerCase().includes("grade")) { intent = "evaluate"; domain = "evaluation"; }
  if (clean.toLowerCase().includes("create") || clean.toLowerCase().includes("report")) { intent = "create"; domain = "creative"; }
  if (clean.toLowerCase().includes("code") || clean.toLowerCase().includes("technical")) domain = "technical";

  // Structure Discovery (Detailed @section blocks)
  const structure: Array<{ name: string, tags: string[] }> = [];
  const listMatch = clean.match(/^[\s]*[-*•1-9][.)]?\s+([^\n:]+)(?::\s*([^\n.]+))?/gm);
  
  if (listMatch) {
    listMatch.forEach(item => {
      const cleanItem = item.replace(/^[\s]*[-*•1-9][.)]?\s+/, '').trim();
      const parts = cleanItem.split(':');
      const name = parts[0].trim();
      
      // Smart tag enrichment from domain vocab
      let tags = parts[1]?.split(/[,&]/).map(x => x.trim()) || [];
      const bestDomainTags = LTL_DOMAIN_TAGS[domain] || [];
      if (tags.length < 3) tags = [...tags, ...bestDomainTags.slice(0, 4 - tags.length)];
      
      if (name.length < 50) structure.push({ name, tags: Array.from(new Set(tags)) });
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  //  GENERATE GIGA-DETAIL LTL SOURCE
  // ─────────────────────────────────────────────────────────────────────
  const o: string[] = [];
  o.push("// LTL GIGA-DETAIL Workspace");
  o.push(vars.join("\n"));
  o.push(`\n!intent: ${intent} @domain: ${domain}`);
  o.push(p ? p : `%auto`);
  o.push(`@subject: $subject`);
  
  if (clean.toLowerCase().includes("grade") || clean.toLowerCase().includes("score")) {
     o.push(`>scale: [A+ | A | B | C | D | E]`);
     o.push(`#scale-implicit`);
  }

  o.push(`\n>structure: custom`);
  structure.forEach(sec => {
    o.push(`  @section "${sec.name}"`);
    o.push(`    >depth: 4 && >covers: [${sec.tags.join(', ')}]`);
    o.push(`    #no-repetition && #narrative-style`);
    if (clean.toLowerCase().includes("bullet")) o.push(`    #no: [bullets]`);
  });

  if (intent === "analyse") {
    o.push(`\n// Quality Suite`);
    o.push(`!assert >must-include: [strengths, weaknesses, judgement, recommendation]`);
    o.push(`!assert >format: [markdown]`);
  }

  o.push(`\n>>final !!tokens !!validate !!trace`);

  const body = o.join("\n").trim();
  const cT = Math.ceil(body.split(/\s+/).filter(x => x.length > 0).length * 1.33);
  return body + `\n\n// original: ${originalTokens}tk | LTL: ${cT}tk | gains: +${Math.max(0, Math.round((1-cT/originalTokens)*100))}%`;
}

// ─────────────────────────────────────────────────────────────────────
//  INTERPRETER (Complete Specification)
// ─────────────────────────────────────────────────────────────────────

export interface LTLAnalysis {
  resolved: string;
  variables: Record<string, { value: string; isBound: boolean; enum?: string[]; isRequired?: boolean; isOptional?: boolean }>;
  templates: Record<string, string>;
  loops: Array<{ item: string; list: string[]; action: string }>;
  assertions: string[];
  mode: string;
  pipes: string[];
  depth: string;
  intent: string;
  domain: string;
  persona: string;
  constraints: { no: string[], must: string[], rules: string[] };
  outputRules: { length?: string, format?: string, include: string[], exclude: string[] };
  sections: Array<{ name: string; heading?: string; depth?: string; covers?: string[]; tone?: string; length?: string; constraints: string[] }>;
  agents: Record<string, string>;
  debug: string[];
  injections: Array<{ type: string, source: string, target?: string }>;
}

export function resolveLTL2(input: string): LTLAnalysis {
  const variables: Record<string, any> = {};
  const templates: Record<string, string> = {};
  const assertions: string[] = [];
  const agents: Record<string, string> = {};
  const outputRules: any = { include: [], exclude: [] };
  const constraints: any = { no: [], must: [], rules: [] };
  const sections: any[] = [];
  const debug: string[] = [];
  const injections: any[] = [];
  const loops: any[] = [];
  const pipes: string[] = [];
  
  let mode = "final";
  let depth = "3";
  let intent = "auto";
  let domain = "auto";
  let persona = "auto";

  const lines = input.split('\n');
  let currentT: string | null = null;
  let tBody: string[] = [];
  let currentS: any = null;

  for (let line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('//')) continue;

    const vM = t.match(/^\$(\w+)\s*=\s*(.+)$/);
    if (vM) {
      const name = vM[1];
      const val = vM[2].split('//')[0].trim();
      if (val === '?') variables[name] = { value: '', isRequired: true, isBound: false };
      else if (val.startsWith('[') && val.endsWith(']')) variables[name] = { value: val.slice(1, -1).split('|')[0].trim(), enum: val.slice(1, -1).split('|').map(s => s.trim()), isBound: false };
      else variables[name] = { value: val.replace(/\{\{|\}\}/g, ''), isBound: val.includes('{{') };
      continue;
    }

    if (t.startsWith(':template ')) {
      currentT = t.split(/\s+/)[1].split('(')[0];
      tBody = [];
      continue;
    }
    if (t === ':end' && currentT) {
      templates[currentT] = tBody.join('\n');
      currentT = null;
      continue;
    }
    if (currentT) { tBody.push(line); continue; }

    if (t.startsWith('@section ')) {
      currentS = { name: t.substring(9).replace(/"/g, ''), constraints: [], covers: [], depth: depth };
      sections.push(currentS);
      continue;
    }

    if (t.startsWith('>depth:')) {
      const d = t.split(':')[1].trim().split(' ')[0];
      if (currentS) currentS.depth = d; else depth = d;
      continue;
    }
    if (t.startsWith('>covers:')) {
      const tags = t.match(/\[(.*)\]/)?.[1].split(',').map(s => s.trim()) || [];
      if (currentS) currentS.covers = tags;
      continue;
    }
    if (t.startsWith('#no:')) {
      const items = t.match(/\[(.*)\]/)?.[1].split(',').map(s => s.trim()) || [];
      constraints.no.push(...items);
      continue;
    }
    if (t.startsWith('%')) persona = t.substring(1).replace(/"/g, '');
    if (t.startsWith('!intent:')) intent = t.split(':')[1].trim();
    if (t.startsWith('@domain:')) domain = t.split(':')[1].trim();
    if (t.startsWith('>>')) mode = t.substring(2);
    if (t.startsWith('!!')) debug.push(t.substring(2));
    if (t.startsWith('!assert ')) assertions.push(t.substring(8));
  }

  let res = input;
  Object.entries(variables).forEach(([k, v]) => {
    res = res.replace(new RegExp(`\\$${k}`, 'g'), v.value);
  });

  return { 
    resolved: res, variables, templates, assertions, mode, intent, domain, persona, 
    sections, agents, debug, outputRules, constraints, pipes, depth, injections, loops 
  };
}

// RESTORE DISCOVERY HELPERS
export interface AtlasEntry { id: number; command: string; category: string; fullInstruction: string; }
export function findBestMatchInAtlas(input: string, database: AtlasEntry[]): AtlasEntry | null {
  if (!input || !database.length) return null;
  const q = input.toLowerCase();
  let b: AtlasEntry | null = null;
  let m = -1;
  for (let i = 0; i < Math.min(database.length, 10000); i++) {
    const e = database[i];
    const ins = e.fullInstruction.toLowerCase();
    let s = 0;
    if (ins.includes(q)) s += 10;
    q.split(/\s+/).filter(w => w.length > 4).forEach(w => { if (ins.includes(w)) s += 1; });
    if (s > m) { m = s; b = e; }
  }
  return m > 2 ? b : null;
}
export function discoverPatterns(input: string, database: AtlasEntry[]): string[] {
  const su: string[] = [];
  const ch = input.split(/[.!?\n]+/).filter(c => c.length > 15);
  ch.forEach(c => {
    const ma = findBestMatchInAtlas(c, database);
    if (ma && !su.includes(ma.command)) su.push(ma.command);
  });
  return su.slice(0, 5);
}

export function compileLTL(input: string) {
  if (!input.trim()) return { foundTokens: { scope: [], action: [], persona: [], constraint: [], output: [], state: [] }, usedWords: new Set<string>() };
  const wt = input.toLowerCase();
  const fT: any = { scope: [], action: [], persona: [], constraint: [], output: [], state: [] };
  const uW = new Set<string>();
  const mapping = [
    { dict: {'@api':'API', '@db':'DB', '@llm':'LLM'}, type: 'scope' },
    { dict: {'!ref':'Ref', '!scout':'Scout'}, type: 'action' },
    { dict: {'%SNR':'Senior', '%ARC':'Arch'}, type: 'persona' },
  ];
  for (const { dict, type } of mapping) {
    for (const [key, desc] of Object.entries(dict)) {
      if (wt.includes(key.toLowerCase()) || desc.toLowerCase().split(/\s+/).some(w => w.length > 4 && wt.includes(w))) {
        fT[type].push(key);
        uW.add(key.replace(/[^a-z0-9]/gi, '').toLowerCase());
      }
    }
  }
  return { foundTokens: fT, usedWords: uW };
}
