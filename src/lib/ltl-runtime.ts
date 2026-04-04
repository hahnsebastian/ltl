import { parseLTL } from './ltl-parser'
import { Section, LTLProgram, RuntimeOptions, RuntimeResult } from './ltl-types'

export async function executeLTL(
  program: LTLProgram,
  options: RuntimeOptions,
  resolvedVariables?: Record<string, string>
): Promise<RuntimeResult> {

  const log: string[] = []
  const sectionOutputs: Record<string, string> = {}
  let totalTokens = 0

  // ── 1. RESOLVE VARIABLES ───────────────────────────────────
  // All variable resolution happens here in TypeScript.
  // The AI never sees a $var — only the resolved value.

  const vars: Record<string, string> = {}
  program.variables.forEach(v => {
    if (resolvedVariables?.[v.name]) {
      vars[v.name] = resolvedVariables[v.name]
    } else if (!v.isInput && !v.isRequired) {
      vars[v.name] = v.isEnum ? (v.enumOptions?.[0] || v.value) : v.value
    }
    log.push(`VAR: $${v.name} = ${vars[v.name] ?? '(awaiting input)'}`)
  })

  function resolveValue(val: string): string {
    return val.replace(/\$(\w+)/g, (_, name) => vars[name] || `$${name}`)
  }

  // ── 2. RESOLVE SUBJECT ─────────────────────────────────────

  const rawSubject = program.subject?.value || ''
  const subject = rawSubject.startsWith('$')
    ? (vars[rawSubject.slice(1)] || rawSubject)
    : rawSubject

  // ── 3. EVALUATE CONDITIONALS ───────────────────────────────
  // All branching logic runs in TypeScript before AI is called.

  const activeConditionals: string[] = []
  program.conditionals.forEach(cond => {
    const m = cond.condition.match(/^\$(\w+)\s*(==|!=)\s*"?([^"]+)"?$/)
    if (m) {
      const [_, varName, op, expected] = m
      const actual = vars[varName] || ''
      const pass = op === '==' ? actual === expected : actual !== expected
      if (pass) activeConditionals.push(cond.then)
      else if (cond.else) activeConditionals.push(cond.else)
      log.push(`CONDITIONAL: $${varName} ${op} "${expected}" → ${pass ? 'THEN' : 'ELSE'}`)
    }
  })

  // ── 4. EXECUTE LOOPS ───────────────────────────────────────
  // Loop expansion runs in TypeScript.
  // Each iteration becomes a resolved section for the AI.

  const loopSections: Section[] = []
  program.loops.forEach(loop => {
    if (loop.count) {
      log.push(`LOOP: !repeat ${loop.count} times`)
      // repeat is handled at section level — skip here
      return
    }
    if (loop.collection.startsWith('[')) {
      const items = loop.collection.slice(1,-1).split(',').map(s => s.trim())
      log.push(`LOOP: ${loop.iterator} over [${items.join(', ')}]`)
      items.forEach(item => {
        const resolvedBody = loop.body.replace(
          new RegExp('\\' + loop.iterator, 'g'), item
        )
        loopSections.push({
          heading: item,
          depth: 3,
          covers: [resolvedBody],
          constraints: []
        })
        log.push(`  ITERATION: ${item}`)
      })
    }
  })

  // ── 5. RESOLVE TEMPLATE IF !run ───────────────────────────
  // Templates are resolved in TypeScript before execution.

  async function runTemplate(name: string, tvars: Record<string,string>) {
    const template = program.templates.find(t => t.name === name)
    if (!template) {
      log.push(`TEMPLATE ERROR: "${name}" not found`)
      return
    }
    log.push(`TEMPLATE: running "${name}" with vars ${JSON.stringify(tvars)}`)
    let body = template.body
    Object.entries(tvars).forEach(([k,v]) => {
      body = body.replace(new RegExp('\\$' + k, 'g'), v)
    })
    const subProgram = parseLTL(body)
    const subResult = await executeLTL(subProgram, options, tvars)
    Object.assign(sectionOutputs, subResult.sections)
    log.push(...subResult.executionLog)
  }

  // ── 6. BUILD GLOBAL CONTEXT ────────────────────────────────
  // All constraints are injected programmatically.
  // The AI receives resolved English instructions, not LTL.

  function buildGlobalContext(): string {
    const parts: string[] = []

    if (program.persona) {
      parts.push(`You are ${resolveValue(program.persona.value)}.`)
      if (program.persona.expertise)
        parts.push(`Your expertise: ${program.persona.expertise}.`)
      if (program.persona.audience)
        parts.push(`Audience: ${program.persona.audience}.`)
    }

    const noItems = program.constraints
      .filter(c => c.kind === 'no')
      .flatMap(c => Array.isArray(c.value) ? c.value : [c.value])
    if (noItems.length)
      parts.push(`Never include: ${noItems.join(', ')}.`)

    const mustItems = program.constraints
      .filter(c => c.kind === 'must')
      .flatMap(c => Array.isArray(c.value) ? c.value : [c.value])
    if (mustItems.length)
      parts.push(`Always include: ${mustItems.join(', ')}.`)

    const perSection = program.constraints.find(c => c.kind === 'per-section')
    if (perSection) parts.push(`Format per section: ${perSection.value}.`)

    const register = program.modifiers.find(m => m.kind === 'register')
    if (register) parts.push(`Tone: ${register.value}.`)

    const styleMod = program.modifiers.find(m => m.kind === 'style')
    if (styleMod && !styleMod.value.startsWith('+') && !styleMod.value.startsWith('-'))
      parts.push(`Style: ${styleMod.value}.`)

    const locale = program.constraints.find(c => c.kind === 'locale')
    if (locale) parts.push(`Language: ${locale.value}.`)

    const audience = program.constraints.find(c => c.kind === 'audience')
    if (audience && !program.persona?.audience)
      parts.push(`Audience: ${audience.value}.`)

    const hallucination = program.constraints.find(c => c.kind === 'hallucination')
    if (hallucination?.value === 'flag')
      parts.push('Mark uncertain claims with [UNVERIFIED].')
    if (hallucination?.value === 'block')
      parts.push('Only state facts you are certain of.')

    if (program.structure.style && !['auto','prose'].includes(program.structure.style))
      parts.push(`Output style: ${program.structure.style}.`)

    return parts.filter(Boolean).join(' ')
  }

  // ── 7. DEPTH → INSTRUCTION ─────────────────────────────────

  function depthInstruction(depth: number, intent: string): string {
    const map: Record<string, Record<number, string>> = {
      create:    { 1:'Write one concise sentence.', 2:'Write one short paragraph.', 3:'Write one full well-crafted paragraph.', 4:'Write a thorough multi-paragraph section.' },
      explain:   { 1:'Give a one-sentence definition.', 2:'Write a brief 3-4 sentence explanation.', 3:'Write a clear complete explanation with examples.', 4:'Write an exhaustive explanation covering all angles.' },
      analyse:   { 1:'State the key finding in one sentence.', 2:'Write a brief analytical summary.', 3:'Write a thorough analytical paragraph with reasoning.', 4:'Write a deep multi-angle analysis.' },
      rewrite:   { 1:'Rewrite in one sentence.', 2:'Rewrite as a short paragraph.', 3:'Rewrite as a full polished paragraph.', 4:'Rewrite as a fully restructured version.' },
      summarise: { 1:'Summarise in one sentence.', 2:'Summarise in 3-4 sentences.', 3:'Write a complete summary paragraph.', 4:'Write a comprehensive summary covering all key points.' },
      compare:   { 1:'State the key difference in one sentence.', 2:'Compare briefly in 3-4 sentences.', 3:'Write a balanced comparison paragraph.', 4:'Write an exhaustive comparison across all dimensions.' },
      instruct:  { 1:'Give the key step in one sentence.', 2:'Describe this step in 2-3 sentences.', 3:'Write clear complete instructions for this step.', 4:'Write an exhaustive guide with examples and caveats.' },
      evaluate:  { 1:'State the verdict in one sentence.', 2:'Give a brief evaluation in 3-4 sentences.', 3:'Write a complete evaluative paragraph.', 4:'Write an exhaustive evaluation with criteria and judgement.' },
      brainstorm:{ 1:'Give one idea.', 2:'Give 3-5 brief ideas.', 3:'Give a well-developed set of ideas with rationale.', 4:'Give an exhaustive set of ideas with full reasoning.' },
      translate: { 1:'Translate concisely.', 2:'Translate with brief context.', 3:'Translate fully and accurately.', 4:'Translate with full context, alternatives, and notes.' },
      generate:  { 1:'Write one concise sentence.', 2:'Write one short paragraph.', 3:'Write one full paragraph.', 4:'Write an exhaustive detailed response.' }
    }
    return map[intent]?.[depth] ?? map.generate?.[3] ?? 'Write an exhaustive detailed response.'
  }

  // ── 8. BUILD SECTION PROMPT ────────────────────────────────
  // This is the key function. The AI receives a fully resolved,
  // minimal English prompt — no LTL, no ambiguity, no drift.

  function buildSectionPrompt(
    section: Section,
    globalContext: string,
    previous: Record<string, string>
  ): string {
    const parts: string[] = []

    if (globalContext) parts.push(globalContext)
    parts.push(depthInstruction(section.depth, program.intent.value))

    if (subject) parts.push(`Subject: ${resolveValue(subject)}.`)

    if (section.covers.length) {
      const covers = section.covers.map(t => t.replace(/-/g,' ')).join(', ')
      parts.push(`Cover these aspects: ${covers}.`)
    }

    // intent framing
    const intentFraming: Record<string, string> = {
      create:    'Produce original, well-crafted content.',
      explain:   'Be clear and accessible. Use concrete examples.',
      analyse:   'Be precise and evidence-based. Avoid vague generalisations.',
      rewrite:   'Preserve meaning. Improve clarity and flow.',
      summarise: 'Be concise. Capture all key points without padding.',
      compare:   'Be balanced. Give equal weight to both sides.',
      instruct:  'Be practical and sequential.',
      evaluate:  'Be objective. Ground judgements in observable evidence.',
      brainstorm:'Be creative and generative. Variety over perfection.',
      translate: 'Prioritise meaning over literal translation.',
      generate:  'Be purposeful and direct.'
    }
    const framing = intentFraming[program.intent.value]
    if (framing) parts.push(framing)

    // intent-specific resolved values
    if (program.intent.value === 'compare') {
      const a = vars[program.intent.modifiers.a?.replace('$','')] || program.intent.modifiers.a
      const b = vars[program.intent.modifiers.b?.replace('$','')] || program.intent.modifiers.b
      if (a && b) parts.push(`Comparing: "${a}" vs "${b}".`)
    }

    if (program.intent.value === 'brainstorm' && program.intent.modifiers.n)
      parts.push(`Generate exactly ${program.intent.modifiers.n} options.`)

    if (program.intent.value === 'translate' && program.intent.modifiers.to)
      parts.push(`Translate into: ${program.intent.modifiers.to}.`)

    if (program.intent.value === 'instruct') {
      const idx = program.structure.sections.indexOf(section as any)
      const total = program.structure.sections.length
      if (idx >= 0) parts.push(`This is step ${idx+1} of ${total}.`)
    }

    // section-level constraints (injected programmatically)
    const sNo = section.constraints
      .filter(c => c.kind === 'no')
      .flatMap(c => Array.isArray(c.value) ? c.value : [c.value])
    if (sNo.length) parts.push(`Do not mention: ${sNo.join(', ')}.`)

    const sMust = section.constraints
      .filter(c => c.kind === 'must')
      .flatMap(c => Array.isArray(c.value) ? c.value : [c.value])
    if (sMust.length) parts.push(`Must include: ${sMust.join(', ')}.`)

    // longitudinal / multi-sample modifiers
    if (program.constraints.find(c => c.kind === 'multi-sample'))
      parts.push('Base analysis on patterns across multiple samples.')
    if (program.constraints.find(c => c.kind === 'longitudinal'))
      parts.push('Describe recurring patterns and trends over time.')

    // open/close instructions
    if (section.openWith)
      parts.push(`Begin with: ${section.openWith.replace(/-/g,' ')}.`)
    if (section.endWith)
      parts.push(`End with: ${section.endWith.replace(/-/g,' ')}.`)
    if (section.lengthTarget)
      parts.push(`Target length: ${section.lengthTarget}.`)

    // coherence across sections
    if (Object.keys(previous).length > 0)
      parts.push('Maintain consistent tone and style with previous sections.')

    return parts.filter(Boolean).join(' ')
  }

  // ── 9. SYSTEM PROMPT ───────────────────────────────────────

  function buildSystemPrompt(): string {
    const intentSystem: Record<string, string> = {
      create:    'You are a skilled writer. Produce original purposeful content.',
      explain:   'You are a clear communicator. Make complex things simple without losing accuracy.',
      analyse:   'You are a precise analyst. Draw evidence-based conclusions.',
      rewrite:   'You are an editor. Improve clarity and style while preserving meaning.',
      summarise: 'You are a concise summariser. Capture everything essential. Cut everything that is not.',
      compare:   'You are an objective analyst. Weigh both sides fairly.',
      instruct:  'You are a technical writer. Be precise, sequential, and practical.',
      evaluate:  'You are a fair evaluator. Base every judgement on observable evidence.',
      brainstorm:'You are a creative generator. Produce varied, imaginative, useful ideas.',
      translate: 'You are an accurate translator. Prioritise meaning and natural flow.',
      generate:  'You are a capable assistant. Produce high-quality purposeful output.'
    }
    return [
      'You write exactly what is asked.',
      'No preamble. No "Here is...". No "Certainly!". Output only the content itself.',
      intentSystem[program.intent.value] || intentSystem.generate
    ].join(' ')
  }

  // ── 10. CALL AI ────────────────────────────────────────────

  async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (options.webllmEngine) {
      const res = await options.webllmEngine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        stream: false
      })
      return res.choices[0].message.content || ''
    }

    throw new Error('No AI engine available (Local WebLLM required).')
  }

  // ── 11. INFER SECTIONS FOR AUTO MODE ──────────────────────

  function inferSections(): Section[] {
    const intentSections: Record<string, Section[]> = {
      create:    [{ heading:'Content', depth:3, covers:['main-content','narrative','purpose'], constraints:[] }],
      explain:   [
        { heading:'Overview', depth:2, covers:['definition','core-concept','context'], constraints:[] },
        { heading:'How It Works', depth:3, covers:['mechanism','process','key-components'], constraints:[] },
        { heading:'Why It Matters', depth:2, covers:['significance','applications','implications'], constraints:[] }
      ],
      analyse:   [
        { heading:'Context', depth:2, covers:['background','scope','framing'], constraints:[] },
        { heading:'Analysis', depth:3, covers:['findings','patterns','evidence','reasoning'], constraints:[] },
        { heading:'Implications', depth:2, covers:['conclusions','significance','recommendations'], constraints:[] }
      ],
      rewrite:   [{ heading:'Rewritten Content', depth:3, covers:['improved-clarity','refined-tone','preserved-meaning'], constraints:[] }],
      summarise: [{ heading:'Summary', depth:3, covers:['key-points','main-arguments','conclusions'], constraints:[] }],
      compare:   [
        { heading: vars[program.intent.modifiers.a?.replace('$','') || ''] || program.intent.modifiers.a || 'Option A', depth:3, covers:['strengths','weaknesses','characteristics'], constraints:[] },
        { heading: vars[program.intent.modifiers.b?.replace('$','') || ''] || program.intent.modifiers.b || 'Option B', depth:3, covers:['strengths','weaknesses','characteristics'], constraints:[] },
        { heading:'Verdict', depth:2, covers:['recommendation','key-differences','best-use-case'], constraints:[] }
      ],
      instruct:  [
        { heading:'Prerequisites', depth:2, covers:['requirements','setup','assumptions'], constraints:[] },
        { heading:'Steps', depth:3, covers:['sequence','actions','expected-output'], constraints:[] },
        { heading:'Troubleshooting', depth:2, covers:['common-errors','fixes','edge-cases'], constraints:[] }
      ],
      evaluate:  [
        { heading:'Strengths', depth:3, covers:['positives','what-works','standout-qualities'], constraints:[] },
        { heading:'Weaknesses', depth:3, covers:['limitations','gaps','what-fails'], constraints:[] },
        { heading:'Verdict', depth:2, covers:['overall-judgement','recommendation','suitability'], constraints:[] }
      ],
      brainstorm:[{ heading:'Ideas', depth:3, covers:['options','variations','approaches'], constraints:[] }],
      translate: [{ heading:'Translation', depth:3, covers:['accurate-meaning','natural-flow','context'], constraints:[] }],
      generate:  [{ heading:'Output', depth:3, covers:['main-content','purpose','completeness'], constraints:[] }]
    }
    return intentSections[program.intent.value] || intentSections.generate
  }

  // ── 12. EXECUTE SECTION BY SECTION ────────────────────────
  // This is the core loop. TypeScript drives it.
  // The AI only ever writes one section at a time.

  const globalContext = buildGlobalContext()
  const systemPrompt = buildSystemPrompt()

  const sections: Section[] = [
    ...(program.structure.mode === 'auto' ? inferSections() : program.structure.sections),
    ...loopSections
  ]

  const previous: Record<string, string> = {}

  for (let idx = 0; idx < sections.length; idx++) {
    const section = sections[idx]

    options.onSectionStart?.(section.heading, idx, sections.length)
    options.onProgress?.(Math.round((idx / sections.length) * 85))
    log.push(`EXECUTING: @section "${section.heading}" (${idx+1}/${sections.length})`)

    const sectionPrompt = buildSectionPrompt(section, globalContext, previous)
    log.push(`PROMPT: ${sectionPrompt.slice(0, 120)}...`)

    const content = await callAI(systemPrompt, sectionPrompt)

    sectionOutputs[section.heading] = content
    previous[section.heading] = content
    totalTokens += Math.round(content.split(/\s+/).length * 1.33)

    options.onSectionComplete?.(section.heading, content)
    log.push(`COMPLETE: "${section.heading}" — ${content.split(/\s+/).length} words`)
  }

  // ── 13. EXECUTE SCALE ──────────────────────────────────────

  let scaleOutput = ''
  if (program.scale) {
    log.push('EXECUTING: >scale')
    const allContent = Object.entries(sectionOutputs)
      .map(([h,c]) => `${h}:\n${c}`).join('\n\n')
    const scalePrompt = [
      globalContext,
      'Based on the content below select exactly one from:',
      program.scale.options.join(' / ') + '.',
      program.scale.implicit
        ? 'Output only the selected option. No explanation.'
        : 'Output the option then one sentence of justification.',
      '\nContent:\n' + allContent
    ].filter(Boolean).join(' ')

    scaleOutput = await callAI('You select a grade or rating. No preamble.', scalePrompt)
    log.push(`SCALE: ${scaleOutput.trim()}`)
  }

  // ── 14. RUN ASSERTIONS ─────────────────────────────────────
  // Assertions are evaluated in TypeScript against the output.

  program.assertions.forEach(assertion => {
    const cond = assertion.condition
    let pass = false
    const incM = cond.match(/>must-include:\s*\[([^\]]+)\]/)
    const excM = cond.match(/>must-exclude:\s*\[([^\]]+)\]/)
    if (incM) {
      const terms = incM[1].split(',').map(s => s.trim().replace(/-/g,' '))
      const allContent = Object.values(sectionOutputs).join(' ').toLowerCase()
      pass = terms.every(t => allContent.includes(t.toLowerCase()))
    }
    if (excM) {
      const terms = excM[1].split(',').map(s => s.trim().replace(/-/g,' '))
      const allContent = Object.values(sectionOutputs).join(' ').toLowerCase()
      pass = terms.every(t => !allContent.includes(t.toLowerCase()))
    }
    log.push(`ASSERT ${cond}: ${pass ? '✓ PASS' : '✗ FAIL'}`)
  })

  // ── 15. ASSEMBLE OUTPUT ────────────────────────────────────
  // TypeScript assembles the final output.
  // Not the AI.

  const useHeadings = program.structure.heading !== 'none'
  let output = ''

  sections.forEach(section => {
    const content = sectionOutputs[section.heading] || ''
    output += useHeadings
      ? `${section.heading}\n${content}\n\n`
      : `${content}\n\n`
  })

  if (scaleOutput)
    output += (useHeadings ? 'Grade\n' : '') + scaleOutput.trim() + '\n'

  options.onProgress?.(100)

  return {
    output: output.trim(),
    sections: sectionOutputs,
    tokensUsed: totalTokens,
    executionLog: log
  }
}
