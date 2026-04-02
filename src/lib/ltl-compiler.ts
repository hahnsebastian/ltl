/**
 * LTL Universal Compiler (NLP-Powered)
 * Using 'compromise' for high-fidelity instruction extraction
 * No API calls, runs entirely in the browser.
 */

import nlp from 'compromise'

export interface CompressionResult {
  ltl: string
  originalTokens: number
  compressedTokens: number
  savedPercent: number
}

export function compressToLTL(input: string): CompressionResult {
  if (!input.trim()) return { ltl: '', originalTokens: 0, compressedTokens: 0, savedPercent: 0 };

  const getTokens = (txt: string) => Math.round(txt.trim().split(/\s+/).length * 1.33);
  const originalTokens = getTokens(input);

  // ─── PRE-PASS: FILLER STRIP ───────────────────────────────────────
  const doc = nlp(input)
  doc.remove('(please|make sure to|it is important that|ensure that)')
  doc.remove('(note that|keep in mind|as mentioned|in order to)')
  doc.remove('(I would like you to|I want you to|feel free to|do not hesitate to)')
  doc.remove('(needless to say|it goes without saying|as a reminder)')
  doc.remove('(basically|simply|just|essentially|obviously|clearly)')
  const cleaned = doc.text()

  // ─── PASS 1: PERSONA ──────────────────────────────────────────────
  let personaLine = "";
  const pM = cleaned.match(/\b(?:you are an?|act as an?|as an?|your role is)\s+([^.!?,\n]+)/i);
  if (pM) {
    const role = pM[1].trim();
    const roleNouns = nlp(role).nouns().out('array');
    personaLine = `%"${role}"`;
    if (role.toLowerCase().includes("expertise") || role.toLowerCase().includes("senior")) {
      personaLine += ` #expertise: "${roleNouns.join(' ')}"`;
    }
  }

  // ─── PASS 2: SUBJECT & SCOPE ──────────────────────────────────────
  let subjectLine = "";
  let variableLine = "";
  
  const subM = cleaned.match(/for (?:the following )?(\w+):/i);
  if (subM) {
    variableLine = `$${subM[1]} = {{input}}`;
    subjectLine = `@subject: $${subM[1]}`;
  } else {
    const aboutM = cleaned.match(/about (.+?)[\.\n,]/i) || cleaned.match(/regarding (.+?)[\.\n,]/i);
    if (aboutM) subjectLine = `@subject: "${aboutM[1].trim()}"`;
    else {
      const properNouns = nlp(cleaned).match('#ProperNoun+').out('array');
      if (properNouns.length > 0) subjectLine = `@subject: "${properNouns[0]}"`;
    }
  }

  // ─── PASS 3: INTENT ───────────────────────────────────────────────
  let intentLine = "!intent: generate";
  const firstTwo = nlp(cleaned).sentences().slice(0, 2).out('text');
  const verbs = nlp(firstTwo).verbs().out('array').map(v => v.toLowerCase());

  const iMap: Record<string, string[]> = {
    create: ['write', 'create', 'generate', 'produce', 'draft', 'compose'],
    explain: ['explain', 'describe', 'clarify', 'define', 'elaborate'],
    analyse: ['analyse', 'analyze', 'evaluate', 'assess', 'review'],
    rewrite: ['rewrite', 'rephrase', 'improve', 'edit', 'refine', 'fix'],
    summarise: ['summarise', 'summarize', 'condense', 'shorten', 'distil'],
    compare: ['compare', 'contrast'],
    translate: ['translate', 'convert'],
    brainstorm: ['list', 'brainstorm', 'suggest'],
    evaluate: ['grade', 'score', 'rate', 'rank', 'judge'],
    instruct: ['guide', 'instruct', 'step']
  };

  for (const [key, list] of Object.entries(iMap)) {
    if (list.some((v: string) => verbs.some((gv: string) => gv.includes(v)))) {
      intentLine = `!intent: ${key}`;
      break;
    }
  }

  // ─── PASS 4: CONSTRAINTS ──────────────────────────────────────────
  const globalNo: Set<string> = new Set();
  const globalMust: Set<string> = new Set();
  const formats: Set<string> = new Set();
  const langDoc = nlp(cleaned);
  const sentences = langDoc.sentences().out('array');

  sentences.forEach((s: string) => {
    const low = s.toLowerCase();
    
    // Prohibitions
    const pTriggers = ["do not", "don't", "must not", "never", "avoid", "without", "exclude", "omit"];
    pTriggers.forEach(t => {
      const re = new RegExp(`${t}\\s+(.+)`, 'i');
      const m = s.match(re);
      if (m) {
        const noun = nlp(m[1]).nouns().first().out('text');
        if (noun) globalNo.add(noun.toLowerCase().replace(/\s+/g, '-'));
      }
    });

    // Requirements
    const rTriggers = ["must", "always", "ensure", "required", "need to", "have to"];
    rTriggers.forEach(t => {
        const re = new RegExp(`${t}\\s+(.+)`, 'i');
        const m = s.match(re);
        if (m) {
          const noun = nlp(m[1]).nouns().first().out('text');
          if (noun) globalMust.add(noun.toLowerCase().replace(/\s+/g, '-'));
        }
    });

    // Format
    if (low.includes("single paragraph")) formats.add("#per-section: 1-paragraph");
    if (low.includes("bullet point")) formats.add(">style: bullets");
    if (low.includes("narrative style")) formats.add(">style: narrative");
    if (low.includes("numbered list")) formats.add(">style: numbered");
    if (low.includes("formal tone") || low.includes("professional tone")) formats.add(">>register: formal");
    if (low.includes("casual") || low.includes("conversational")) formats.add(">>register: casual");
    if (low.includes("no statistics") || low.includes("no numbers")) { globalNo.add("statistics"); globalNo.add("numbers"); }
  });

  // ─── PASS 5: STRUCTURE ────────────────────────────────────────────
  const sections: any[] = [];
  const boundaries = [
    /^[A-Z][A-Za-z\s\(\+\)]{2,50}$/gm,
    /^#{1,3} .+/gm,
    /^\d+\. .{2,50}$/gm
  ];

  let lastIdx = 0;
  let matches: any[] = [];
  boundaries.forEach(re => {
    let m;
    while((m = re.exec(cleaned)) !== null) matches.push({ idx: m.index, heading: m[0].trim() });
  });
  matches.sort((a,b) => a.idx - b.idx);

  matches.forEach((m, i) => {
    const start = m.idx + m.heading.length;
    const end = matches[i+1]?.idx || cleaned.length;
    const desc = cleaned.substring(start, end).trim();
    if (!desc) return;

    const sDoc = nlp(desc);
    const nps = sDoc.match('#Adjective? #Noun+ (#Preposition #Noun+)?').out('array');
    const ges = sDoc.match('#Gerund #Noun*').out('array');
    let tags = Array.from(new Set([...nps, ...ges]))
      .map(t => t.toLowerCase()
        .replace(/\b(a|an|the|various|different|multiple|specific|certain|relevant|things|aspects|elements|factors|ways|types|forms)\b/gi, '')
        .trim()
        .replace(/\s+/g, '-'))
      .filter(t => t.length > 2)
      .slice(0, 8);

    if (tags.length < 3) tags = sDoc.nouns().out('array').map((n: string) => n.toLowerCase().replace(/\s+/g, '-')).slice(0, 5);

    let depth = ">depth: 3";
    const sc = sDoc.sentences().out('array').length;
    if (sc === 1) depth = ">depth: 2";
    if (sc >= 4) depth = ">depth: 3";
    if (desc.match(/exhaustive|detailed|thorough/i)) depth = ">depth: 4";
    if (desc.match(/brief|short|one sentence/i)) depth = ">depth: 1";

    const endW = desc.match(/(?:finish|end|conclude|close) with\s+(.+)/i);

    sections.push({
      heading: m.heading,
      depth,
      covers: Array.from(new Set(tags)),
      endWith: endW ? endW[1].trim() : null
    });
  });

  // ─── PASS 6 & 7: SCALE & MODIFIERS ────────────────────────────────
  let scaleLine = "";
  const scaleM = cleaned.match(/(?:select|choose|grade|options?)(?:\s+one)?(?:\s+(?:from|of))?[:\s]+\[?(.*?)\]?/i);
  if (scaleM) scaleLine = `>scale: [${scaleM[1].replace(/,/g, ' | ')}]`;
  if (cleaned.match(/do not justify|implicit|justification.*implicit/i)) {
    if (scaleLine) scaleLine += "\n#scale-implicit";
  }

  const mods: string[] = [];
  const locMatch = cleaned.match(/\bin (german|french|spanish|italian|portuguese)\b/i);
  if (locMatch) mods.push(`#locale: ${locMatch[1].substring(0, 2).toUpperCase()}`);
  if (cleaned.match(/don.t (make|fabricate|invent)|only facts/i)) mods.push("#hallucination: flag");
  if (cleaned.match(/multiple (matches|examples|samples|cases)/i)) mods.push("#multi-sample: true");
  if (cleaned.match(/across (matches|sessions|games|observations)/i)) mods.push("#longitudinal: true");

  // ─── ASSEMBLY ─────────────────────────────────────────────────────
  const o: string[] = [];
  if (personaLine) o.push(personaLine);
  if (subjectLine) o.push(subjectLine);
  if (variableLine) o.push(variableLine);
  if (o.length > 0) o.push("");
  o.push(intentLine);
  o.push("");
  if (globalNo.size > 0) o.push(`#no: [${Array.from(globalNo).join(', ')}]`);
  if (globalMust.size > 0) o.push(`#must: [${Array.from(globalMust).join(', ')}]`);
  formats.forEach(f => o.push(f));
  mods.forEach(m => o.push(m));
  
  if (sections.length > 0) {
    o.push("");
    o.push(">structure:");
    sections.forEach(s => {
      o.push(`  @section "${s.heading}"`);
      o.push(`    ${s.depth}`);
      if (s.covers.length > 0) o.push(`    >covers: [${s.covers.join(', ')}]`);
      if (s.endWith) o.push(`    >end-with: "${s.endWith}"`);
    });
  } else {
    o.push("");
    o.push(">structure: auto");
  }

  if (scaleLine) { o.push(""); o.push(scaleLine); }
  o.push("");
  o.push(">>final");

  const finalLtl = o.join("\n").replace(/\n\n+/g, "\n\n").trim();
  const compressedTokens = getTokens(finalLtl);

  return {
    ltl: finalLtl,
    originalTokens,
    compressedTokens,
    savedPercent: Math.max(0, Math.round((1 - compressedTokens / originalTokens) * 100))
  };
}
