import nlp from 'compromise'

export interface LTLResult {
  ltl: string
  originalTokens: number
  compressedTokens: number
  savedPercent: number
}

export function compressToLTL(input: string): LTLResult {

  const originalTokens = Math.round(
    input.trim().split(/\s+/).length * 1.33
  )

  // ── PRE-PASS: FILLER STRIP ─────────────────────────────────

  const FILLER = [
    /\bplease\b/gi,
    /\bmake sure to\b/gi,
    /\bit is important that\b/gi,
    /\bensure that\b/gi,
    /\bnote that\b/gi,
    /\bkeep in mind\b/gi,
    /\bin order to\b/gi,
    /\bI would like you to\b/gi,
    /\bI want you to\b/gi,
    /\byour job is to\b/gi,
    /\bfeel free to\b/gi,
    /\bdo not hesitate to\b/gi,
    /\bas a reminder\b/gi,
    /\bonce again\b/gi,
    /\bneedless to say\b/gi,
    /\bit goes without saying\b/gi,
    /\bbasically\b/gi,
    /\bsimply\b/gi,
    /\bessentially\b/gi,
    /\bobviously\b/gi,
    /\bclearly\b/gi,
    /\bas mentioned\b/gi,
    /\byou should\b/gi,
  ]
  let cleaned = input
  FILLER.forEach(f => { cleaned = cleaned.replace(f, '') })
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()

  // ── PASS 1: PERSONA ────────────────────────────────────────

  let persona = ''
  let expertise = ''
  let audienceFromPersona = ''

  const personaPatterns = [
    /you are an? (.+?)(?:\.|,|\n|who |with )/i,
    /act as an? (.+?)(?:\.|,|\n)/i,
    /as an? (.+?)(?:,|\.|your)/i,
    /your role is (?:to be )?(.+?)(?:\.|,|\n)/i,
    /pretend (?:to be |you are )an? (.+?)(?:\.|,|\n)/i,
  ]
  for (const p of personaPatterns) {
    const m = cleaned.match(p)
    if (m) {
      persona = m[1].trim()
      const whoMatch = persona.match(/^(.+?) who (.+)$/)
      if (whoMatch) persona = `${whoMatch[1].trim()} who ${whoMatch[2].trim()}`
      const expertMatch = cleaned.match(/with (?:expertise|speciality) in (.+?)(?:\.|,|\n)/i)
      if (expertMatch) expertise = expertMatch[1].trim()
      const audMatch = cleaned.match(/explaining to (?:a )?(.+?)(?:\.|,|\n)/i)
      if (audMatch) audienceFromPersona = audMatch[1].trim()
      break
    }
  }

  // ── PASS 2: SUBJECT & SCOPE ────────────────────────────────

  let subject = ''
  let subjectVar = ''
  let scope = ''

  const subjPatterns: [RegExp, 'var'|'subject'|'scope'][] = [
    [/for the following (\w+):\s*(.+?)(?:\.|,|\n)/i, 'var'],
    [/about (.+?)(?:\.|,|\n)/i, 'subject'],
    [/regarding (.+?)(?:\.|,|\n)/i, 'subject'],
    [/on the topic of (.+?)(?:\.|,|\n)/i, 'subject'],
    [/for (.+?)(?:\.|,|\n)/i, 'scope'],
  ]
  for (const [p, type] of subjPatterns) {
    const m = cleaned.match(p)
    if (m) {
      if (type === 'var') { subjectVar = m[1].trim(); subject = `$${subjectVar}` }
      else if (type === 'subject') subject = m[1].trim()
      else if (type === 'scope') scope = m[1].trim()
      break
    }
  }
  if (!subject) {
    const entities = nlp(cleaned).match('#ProperNoun+').out('array') as any[]
    if (entities.length) subject = entities[0]
  }

  // ── PASS 3: INTENT ─────────────────────────────────────────

  let intent = '!generate'
  let intentMods: string[] = []

  const firstTwo = nlp(cleaned).sentences().slice(0, 2).out('text') as any
  const verbs = nlp(firstTwo).verbs().out('array') as any[]
  const verbStr = verbs.join(' ').toLowerCase()

  if (/write|create|generate|produce|draft|compose|build|design/.test(verbStr)) intent = '!create'
  else if (/explain|describe|clarify|define|elaborate/.test(verbStr)) intent = '!explain'
  else if (/analys|analyz|evaluat|assess|review|examine|critique/.test(verbStr)) intent = '!analyse'
  else if (/rewrite|rephrase|improve|edit|refine|fix|correct|enhance/.test(verbStr)) intent = '!rewrite'
  else if (/summaris|summariz|condense|shorten|distil|compress/.test(verbStr)) intent = '!summarise'
  else if (/compare|contrast/.test(verbStr)) intent = '!compare'
  else if (/translat|convert/.test(verbStr)) intent = '!translate'
  else if (/list|brainstorm|suggest/.test(verbStr)) intent = '!brainstorm'
  else if (/grade|score|rate|rank|judge/.test(verbStr)) intent = '!evaluate'
  else if (/guide|instruct/.test(verbStr) && /step/.test(cleaned.toLowerCase())) intent = '!instruct'

  if (/step.by.step|step-by-step/i.test(cleaned)) intent = '!instruct'

  const nMatch = cleaned.match(/give me (\d+)/i)
  if (nMatch) intentMods.push(`  $n = ${nMatch[1]}`)

  const compareMatch = cleaned.match(/compare (.+?) (?:and|vs|versus) (.+?)(?:\.|,|\n)/i)
  if (compareMatch) {
    intent = '!compare'
    intentMods.push(`  $a = ${compareMatch[1].trim()}`)
    intentMods.push(`  $b = ${compareMatch[2].trim()}`)
  }

  const translateMatch = cleaned.match(/translate (?:to|into) (.+?)(?:\.|,|\n)/i)
  if (translateMatch) intentMods.push(`  $to = ${translateMatch[1].trim()}`)

  const mutateMatch = cleaned.match(/same as (?:before|last time) but (.+?)(?:\.|,|\n)/i)
  if (mutateMatch) intentMods.push(`!mutate: ${mutateMatch[1].trim()}`)

  const dialogueMatch = cleaned.match(/(?:roleplay|dialogue between|act as both) (.+?) and (.+?)(?:\.|,|\n)/i)
  let dialogueLine = ''
  if (dialogueMatch) {
    intent = '!dialogue'
    dialogueLine = `!dialogue: [%agent[A]: "${dialogueMatch[1].trim()}", %agent[B]: "${dialogueMatch[2].trim()}"]`
  }

  // ── PASS 4: VARIABLES ──────────────────────────────────────

  const variables: string[] = []

  if (subjectVar) variables.push(`$${subjectVar} = {{input}}`)

  const varPatterns: [RegExp, string][] = [
    [/for a (.+?) audience/i, 'audience'],
    [/in ([A-Z][a-z]+) language/i, 'lang'],
    [/in the style of (.+?)(?:\.|,|\n)/i, 'style'],
    [/(?:under|exactly|max|maximum|minimum) (\d+) words/i, 'length'],
  ]
  varPatterns.forEach(([p, name]) => {
    const m = cleaned.match(p)
    if (m) variables.push(`$${name} = ${name === 'style' ? `"${m[1].trim()}"` : m[1].trim()}`)
  })

  const enumMatch = cleaned.match(/\[([a-zA-Z\s]+\|[a-zA-Z\s\|]+)\]/g)
  if (enumMatch) {
    enumMatch.forEach((e, i) => variables.push(`$option${i+1} = ${e}`))
  }

  // ── PASS 5: CONSTRAINTS ────────────────────────────────────

  const noItems: string[] = []
  const mustItems: string[] = []
  const formatLines: string[] = []
  const modifierLines: string[] = []

  const sentences = nlp(cleaned).sentences().out('array') as any[]

  sentences.forEach(sentence => {
    // prohibitions
    const prohibTriggers = [
      /\b(?:do not|don't|must not|never|avoid|without|exclude|omit|refrain from)\b(.{3,60})/gi
    ]
    prohibTriggers.forEach(trigger => {
      let m
      while ((m = trigger.exec(sentence)) !== null) {
        const remainder = m[1]
        let tag = (nlp(remainder).nouns().first().out('text') as any).trim()
        if (!tag) tag = remainder.trim().split(/\s+/).slice(0,3).join('-')
        tag = tag.toLowerCase()
          .replace(/\b(a|an|the|any|all|raw|explicit|real)\b/g, '')
          .replace(/\s+/g, '-').replace(/-+/g, '-').trim()
        if (tag && tag.length > 2) noItems.push(tag)
      }
    })

    // requirements
    const reqTriggers = [
      /\b(?:must|always|ensure|required|need to|have to|it is essential)\b(.{3,60})/gi
    ]
    reqTriggers.forEach(trigger => {
      let m
      while ((m = trigger.exec(sentence)) !== null) {
        const remainder = m[1]
        let tag = (nlp(remainder).nouns().first().out('text') as any).trim()
        if (!tag) tag = remainder.trim().split(/\s+/).slice(0,3).join('-')
        tag = tag.toLowerCase()
          .replace(/\b(a|an|the|any|all)\b/g, '')
          .replace(/\s+/g, '-').replace(/-+/g, '-').trim()
        if (tag && tag.length > 2) mustItems.push(tag)
      }
    })
  })

  // format
  if (/single paragraph|one paragraph per/i.test(cleaned))
    formatLines.push('#per-section: 1-paragraph')
  const sentCountMatch = cleaned.match(/(\d+) sentences? per/i)
  if (sentCountMatch) formatLines.push(`#per-section: ${sentCountMatch[1]}-sentences`)
  if (/no bullet points?/i.test(cleaned)) noItems.push('bullet-points')
  if (/no lists?/i.test(cleaned)) noItems.push('lists')
  if (/no statistics?|no numbers?/i.test(cleaned)) { noItems.push('statistics'); noItems.push('numbers') }
  if (/no headings?/i.test(cleaned)) noItems.push('headings')

  let styleRule = ''
  if (/narrative style/i.test(cleaned)) styleRule = '>style: narrative'
  else if (/bullet points?/i.test(cleaned) && !/no bullet/i.test(cleaned)) styleRule = '>style: bullets'
  else if (/numbered list/i.test(cleaned)) styleRule = '>style: numbered'
  else if (/as a table/i.test(cleaned)) styleRule = '>style: table'
  else if (/code only|just code/i.test(cleaned)) styleRule = '>style: code'
  else if (/in prose/i.test(cleaned)) styleRule = '>style: prose'
  if (styleRule) formatLines.push(styleRule)

  // modifiers
  let register = ''
  if (/formal|professional tone/i.test(cleaned)) register = '>>register: formal'
  else if (/casual|conversational/i.test(cleaned)) register = '>>register: casual'

  let styleMode = ''
  if (/in the style of (.+?)(?:\.|,|\n)/i.test(cleaned)) {
    const sm = cleaned.match(/in the style of (.+?)(?:\.|,|\n)/i)
    if (sm) styleMode = `>>style: "${sm[1].trim()}"`
  }
  const styleShiftMatch = cleaned.match(/make it (?:more |less )(.+?)(?:\.|,|\n)/i)
  if (styleShiftMatch) {
    const dir = /more/.test(cleaned) ? '+' : '-'
    styleMode = `>>style: ${dir}${styleShiftMatch[1].trim()}`
  }

  const localeMap: Record<string,string> = {
    german:'DE', french:'FR', spanish:'ES', italian:'IT', portuguese:'PT'
  }
  Object.entries(localeMap).forEach(([lang, code]) => {
    if (new RegExp(`in ${lang}`, 'i').test(cleaned))
      modifierLines.push(`#locale: ${code}`)
  })

  if (/don.t (?:make up|fabricate|invent)|only (?:real )?facts/i.test(cleaned))
    modifierLines.push('#hallucination: flag')
  if (/check your work|verify|validate output/i.test(cleaned))
    modifierLines.push('!!validate')
  if (/multiple (?:matches|examples|samples|cases|games)/i.test(cleaned))
    modifierLines.push('#multi-sample: true')
  if (/across (?:matches|sessions|games)|over time|recurring/i.test(cleaned))
    modifierLines.push('#longitudinal: true')

  let contextInject = ''
  if (/based on (?:the )?(?:text|content) (?:below|above|I.ll paste)/i.test(cleaned))
    contextInject = '<<text: {{paste}}'
  if (/using the (?:file|document) (?:I provide|I.ll upload)/i.test(cleaned))
    contextInject = '<<file: {{upload}}'

  let pauseLine = ''
  if (/show me (?:then|and then) continue/i.test(cleaned))
    pauseLine = '>>pause: after @section'

  let refineLine = ''
  const refineMatch = cleaned.match(/(?:keep going|refine) until (.+?)(?:\.|,|\n)/i)
  if (refineMatch) refineLine = `!refine: until ${refineMatch[1].trim()}`

  let audienceLine = ''
  if (audienceFromPersona) audienceLine = `#audience: "${audienceFromPersona}"`
  else {
    const audMatch = cleaned.match(/for a (.+?) audience/i)
    if (audMatch && !variables.find(v => v.startsWith('$audience')))
      audienceLine = `#audience: "${audMatch[1].trim()}"`
  }

  // dedup constraints
  const uniqueNo = [...new Set(noItems.filter(Boolean))]
  const uniqueMust = [...new Set(mustItems.filter(Boolean))]

  // ── PASS 6: STRUCTURE DETECTION ───────────────────────────

  interface Section {
    heading: string
    depth: number
    covers: string[]
    constraints: string[]
    endWith: string
  }

  const sections: Section[] = []

  const GENERIC_WORDS = new Set([
    'a','an','the','their','its','this','that','these','those',
    'various','different','multiple','specific','certain','relevant',
    'appropriate','effective','important','overall','general',
    'typical','usual','common','key','main','things','aspects',
    'elements','factors','ways','types','forms','level','degree',
    'extent','nature','kind','sort','information','details',
    'examples','instances','cases','areas','points','items'
  ])

  function extractCovers(description: string): string[] {
    const doc = nlp(description)
    const nounPhrases = doc.match('#Adjective? #Noun+ (#Preposition #Noun+)?')
      .out('array') as any[]
    const gerunds = doc.match('#Gerund #Noun*').out('array') as any[]
    const combined = [...nounPhrases, ...gerunds]
    const tags = combined
      .map(phrase =>
        phrase.toLowerCase()
          .replace(/\b(a|an|the|their|its|this|that|these|those)\b/g, '')
          .replace(/\s+/g, '-').replace(/-+/g,'-').replace(/^-|-$/g,'').trim()
      )
      .filter(tag => {
        if (!tag || tag.length < 3) return false
        const words = tag.split('-')
        const allGeneric = words.every((w: string) => GENERIC_WORDS.has(w))
        return !allGeneric
      })
    const scored = [...new Set(tags)]
      .map(tag => ({
        tag,
        score: tag.includes('-') ? 2 : (GENERIC_WORDS.has(tag) ? -1 : 0)
      }))
      .sort((a,b) => b.score - a.score)
      .map(x => x.tag)
    if (scored.length >= 3) return scored.slice(0, 8)
    const fallback = (nlp(description).nouns().out('array') as any[])
      .map((n: string) => n.toLowerCase().replace(/\s+/g,'-'))
      .filter((n: string) => !GENERIC_WORDS.has(n) && n.length > 2)
    return [...new Set([...scored, ...fallback])].slice(0, 8)
  }

  function detectDepth(description: string): number {
    if (/exhaustive|detailed|thorough|comprehensive/i.test(description)) return 4
    if (/brief|short|one sentence/i.test(description)) return 1
    const count = (nlp(description).sentences().out('array') as any[]).length
    if (count >= 4) return 3
    if (count >= 2) return 3
    return 2
  }

  function extractSectionConstraints(description: string): string[] {
    const sc: string[] = []
    const prohibMatch = description.match(/\b(?:do not|don't|never|avoid|without)\b (.{3,40})/gi)
    if (prohibMatch) prohibMatch.forEach(m => {
      const tag = m.replace(/\b(?:do not|don't|never|avoid|without)\b/i,'').trim()
        .split(/\s+/).slice(0,3).join('-').toLowerCase()
      if (tag) sc.push(`#no: ${tag}`)
    })
    const reqMatch = description.match(/\b(?:must|always|ensure)\b (.{3,40})/gi)
    if (reqMatch) reqMatch.forEach(m => {
      const tag = m.replace(/\b(?:must|always|ensure)\b/i,'').trim()
        .split(/\s+/).slice(0,3).join('-').toLowerCase()
      if (tag) sc.push(`#must: ${tag}`)
    })
    return sc
  }

  // detect section boundaries
  const boundaryPatterns = [
    /^#{1,3} (.+)$/gm,
    /^([A-Z][A-Za-z\s\(\+\)\-]{2,60})$(?!\n[a-z])/gm,
    /^(\d+\.|[A-Z]\.) (.+)$/gm,
  ]

  let boundaries: Array<{index: number, heading: string}> = []

  boundaryPatterns.forEach(p => {
    let m
    const re = new RegExp(p.source, p.flags)
    while ((m = re.exec(input)) !== null) {
      const heading = (m[2] || m[1]).trim()
      if (heading.split(' ').length <= 8 && !boundaries.find(b => b.heading === heading)) {
        boundaries.push({ index: m.index, heading })
      }
    }
  })

  // also detect \"provide a paragraph on X\"
  const provideRe = /provide a (?:single )?(?:paragraph|section|analysis) (?:on|about|for|describing) (.+?)(?:\.|,|\n)/gi
  let pm
  while ((pm = provideRe.exec(input)) !== null) {
    boundaries.push({ index: pm.index, heading: pm[1].trim() })
  }

  boundaries.sort((a,b) => a.index - b.index)
  boundaries = boundaries.filter((b,i) => {
    if (i === 0) return true
    return b.index - boundaries[i-1].index > 20
  })

  if (boundaries.length >= 2) {
    boundaries.forEach((boundary, i) => {
      const start = boundary.index + boundary.heading.length
      const end = boundaries[i+1] ? boundaries[i+1].index : input.length
      const description = input.slice(start, end).trim()

      const endWithMatch = description.match(
        /(?:finish|end|conclude|close) with (.+?)(?:\.|$)/i
      )
      const endWith = endWithMatch
        ? endWithMatch[1].trim().split(/\s+/).slice(0,6).join('-')
        : ''

      sections.push({
        heading: boundary.heading,
        depth: detectDepth(description),
        covers: extractCovers(description),
        constraints: extractSectionConstraints(description),
        endWith
      })
    })
  }

  // ── PASS 7: SCALE DETECTION ────────────────────────────────

  let scale = ''
  let scaleImplicit = false
  let scaleExplicit = false

  const scalePatterns = [
    /select (?:one )?(?:from|of)[:\s]+(.+)/i,
    /choose from[:\s]+(.+)/i,
    /grade[:\s]+(.+)/i,
    /options?[:\s]+(.+)/i,
  ]
  for (const p of scalePatterns) {
    const m = cleaned.match(p)
    if (m) {
      const opts = m[1].trim()
        .split(/[\n,]/).map(s => s.trim()).filter(s => s.length <= 4)
      if (opts.length >= 2) { scale = `[${opts.join('|')}]`; break }
    }
  }
  // standalone letter/grade list
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
  const gradeLines = lines.filter(l => /^[A-D][+\-]?$|^\d$/.test(l))
  if (gradeLines.length >= 3 && !scale)
    scale = `[${gradeLines.join('|')}]`

  if (/do not justify|implicit|justification.*implicit/i.test(cleaned))
    scaleImplicit = true
  if (/justify.*grade|explain.*grade/i.test(cleaned))
    scaleExplicit = true

  // ── PASS 8: ADVANCED PATTERNS ──────────────────────────────

  let templateWrap = false
  let templateName = ''
  let templateVars: string[] = []

  if (/for any|for each|for every/i.test(cleaned)) {
    const tm = cleaned.match(/for (?:any|each|every) (\w+)/i)
    if (tm) {
      templateWrap = true
      templateName = intent.replace('!','')
      templateVars = [`$${tm[1].toLowerCase()}`]
    }
  }

  let pipeLine = ''
  if (/then (?:format|filter|clean)/i.test(cleaned))
    pipeLine = '  -> |filter #constraint -> |format >output'

  let fallbackLine = ''
  if (/if (?:that )?(?:doesn.t work|fails)/i.test(cleaned))
    fallbackLine = '?fallback: >>draft'

  // ── ASSEMBLY ───────────────────────────────────────────────

  const parts: string[] = []

  // persona
  if (persona) {
    parts.push(`%\"${persona}\"`)
    if (expertise) parts.push(`  #expertise: \"${expertise}\"`)
    if (audienceFromPersona) parts.push(`  #audience: \"${audienceFromPersona}\"`)
  }

  // scope
  if (subject) parts.push(`@subject: ${subject}`)
  if (scope && !subject) parts.push(`@scope: ${scope}`)
  if (contextInject) parts.push(contextInject)

  // variables
  variables.forEach(v => parts.push(v))

  // blank
  if (parts.length) parts.push('')

  // intent
  if (dialogueLine) parts.push(dialogueLine)
  else parts.push(intent)
  intentMods.forEach(m => parts.push(m))

  // blank
  parts.push('')

  // constraints
  if (uniqueNo.length) {
    uniqueNo.length <= 4
      ? parts.push(`#no: [${uniqueNo.join(', ')}]`)
      : uniqueNo.forEach(n => parts.push(`#no: ${n}`))
  }
  if (uniqueMust.length) {
    uniqueMust.length <= 4
      ? parts.push(`#must: [${uniqueMust.join(', ')}]`)
      : uniqueMust.forEach(m => parts.push(`#must: ${m}`))
  }
  formatLines.forEach(f => parts.push(f))
  if (audienceLine) parts.push(audienceLine)
  modifierLines.forEach(m => parts.push(m))

  // register / style
  if (register || styleMode) {
    parts.push('')
    if (register) parts.push(register)
    if (styleMode) parts.push(styleMode)
  }

  // pause / refine
  if (pauseLine) parts.push(pauseLine)
  if (refineLine) parts.push(refineLine)

  // blank
  parts.push('')

  // structure
  if (sections.length) {
    parts.push('>structure:')
    sections.forEach(s => {
      parts.push(`  @section \"${s.heading}\"`)
      parts.push(`    >depth: ${s.depth}`)
      if (s.covers.length)
        parts.push(`    >covers: [${s.covers.join(', ')}]`)
      s.constraints.forEach(c => parts.push(`    ${c}`))
      if (s.endWith) parts.push(`    >end-with: \"${s.endWith}\"`)
    })
  } else {
    parts.push('>structure: auto')
  }

  // scale
  if (scale) {
    parts.push('')
    parts.push(`>scale: ${scale}`)
    if (scaleImplicit) parts.push('#scale-implicit')
    if (scaleExplicit) parts.push('#scale-explicit')
  }

  // dialogue
  if (dialogueLine && intent !== '!dialogue') parts.push(dialogueLine)

  // pipe / fallback
  if (pipeLine) parts.push(pipeLine)
  if (fallbackLine) parts.push(fallbackLine)

  // validate
  if (modifierLines.includes('!!validate')) {
    // already added above, skip
  }

  // blank
  parts.push('')

  // mode
  parts.push('>>final')

  // template wrap
  let body = parts.join('\n')
  if (templateWrap) {
    body = `:template ${templateName} (${templateVars.join(', ')})\n`
      + body.split('\n').map(l => `  ${l}`).join('\n')
      + `\n:end\n\n!run ${templateName}`
  }

  // token delta
  const compressedTokens = Math.round(
    body.trim().split(/\s+/).length * 1.33
  )
  const savedPercent = Math.round(
    ((originalTokens - compressedTokens) / originalTokens) * 100
  )
  body += `\n\n// original: ${originalTokens}tk | compressed: ${compressedTokens}tk | saved: ${savedPercent}%`

  // ── QUALITY GATE ───────────────────────────────────────────

  // 1. every section has covers >= 3
  // (already handled in extractCovers fallback)

  // 2. if no covers could be extracted at all, add note
  sections.forEach(s => {
    if (!s.covers.length) {
      body = body.replace(
        `  @section \"${s.heading}\"\n    >depth: ${s.depth}`,
        `  @section \"${s.heading}\"\n    >depth: ${s.depth}\n    >covers: ?[could-not-extract-tags]`
      )
    }
  })

  return {
    ltl: body,
    originalTokens,
    compressedTokens,
    savedPercent
  }
}
