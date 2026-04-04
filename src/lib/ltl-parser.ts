import { LTLProgram, Section } from './ltl-types'

export function parseLTL(source: string): LTLProgram {
  const program: LTLProgram = {
    persona: null,
    subject: null,
    variables: [],
    intent: { value: 'generate', modifiers: {} },
    constraints: [],
    structure: { mode: 'auto', sections: [], heading: 'default', style: 'prose' },
    scale: null,
    modifiers: [],
    templates: [],
    conditionals: [],
    loops: [],
    assertions: [],
    mode: 'main',
    debug: [],
    contextInject: []
  }

  const lines = source.split('\n')
  let currentSection: Section | null = null
  let currentTemplate: { name: string; params: string[]; body: string[] } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // ── PERSONA ───────────────────────────────────────────────
    if (line.startsWith('% ')) {
      program.persona = { value: line.slice(2).replace(/"/g, '').trim() }
      continue
    }
    if (program.persona && line.startsWith('#expertise:')) {
      program.persona.expertise = line.split(':')[1].trim()
      continue
    }
    if (program.persona && line.startsWith('#audience:')) {
      program.persona.audience = line.split(':')[1].trim()
      continue
    }

    // ── SUBJECT ───────────────────────────────────────────────
    if (line.startsWith('@subject:')) {
      const val = line.split(':')[1].trim()
      program.subject = { value: val, isVariable: val.startsWith('$') }
      continue
    }

    // ── VARIABLES ─────────────────────────────────────────────
    // $name = value {{input}} [a|b|c] ?
    const varMatch = line.match(/^\$(\w+)\s*=\s*(.*)$/)
    if (varMatch) {
      const name = varMatch[1]
      let rest = varMatch[2].trim()
      
      const isInput = rest.includes('{{input}}')
      rest = rest.replace('{{input}}', '').trim()
      
      const enumMatch = rest.match(/\[([^\]]+)\]/)
      const isEnum = !!enumMatch
      const enumOptions = enumMatch ? enumMatch[1].split('|').map(s => s.trim()) : undefined
      rest = rest.replace(/\[[^\]]+\]/, '').trim()
      
      const isRequired = rest.includes('?')
      rest = rest.replace('?', '').trim()
      
      program.variables.push({
        name,
        value: rest,
        isInput,
        isEnum,
        enumOptions,
        isRequired
      })
      continue
    }

    // ── INTENT ──────────────────────────────────────────────
    if (line.startsWith('!')) {
      // Avoid matching keywords like !foreach, !repeat, !assert
      const keywordMatch = line.match(/^!(foreach|repeat|assert|run)/)
      if (!keywordMatch) {
        program.intent.value = line.slice(1).split(/\s/)[0].trim()
        continue
      }
    }
    // intent modifiers indented $mod
    if (line.startsWith('$') && !line.includes('=')) {
      const modMatch = line.match(/^\$(\w+)\s*=\s*(.*)$/)
      if (!modMatch) { // Indented modifier like $a: value
        const parts = line.split(':')
        if (parts.length > 1) {
          const key = parts[0].slice(1).trim()
          const val = parts[1].trim()
          program.intent.modifiers[key] = val
          continue
        }
      }
    }

    // ── CONSTRAINTS ───────────────────────────────────────────
    if (line.startsWith('#no:')) {
      const val = line.split(':')[1].trim()
      const items = val.startsWith('[') ? val.slice(1, -1).split(',').map(s => s.trim()) : val
      if (currentSection) {
        currentSection.constraints.push({ kind: 'no', value: items })
      } else {
        program.constraints.push({ kind: 'no', value: items })
      }
      continue
    }
    if (line.startsWith('#must:')) {
      const val = line.split(':')[1].trim()
      const items = val.startsWith('[') ? val.slice(1, -1).split(',').map(s => s.trim()) : val
      if (currentSection) {
        currentSection.constraints.push({ kind: 'must', value: items })
      } else {
        program.constraints.push({ kind: 'must', value: items })
      }
      continue
    }
    if (line.startsWith('#per-section:')) {
      program.constraints.push({ kind: 'per-section', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('#locale:')) {
      program.constraints.push({ kind: 'locale', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('#audience:')) {
      program.constraints.push({ kind: 'audience', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('#hallucination:')) {
      program.constraints.push({ kind: 'hallucination', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('#multi-sample')) {
      program.constraints.push({ kind: 'multi-sample', value: 'true' })
      continue
    }
    if (line.startsWith('#longitudinal')) {
      program.constraints.push({ kind: 'longitudinal', value: 'true' })
      continue
    }

    // ── STRUCTURE & SECTIONS ──────────────────────────────────
    if (line.startsWith('>structure:')) {
      const mode = line.split(':')[1].trim() as any
      program.structure.mode = mode
      continue
    }
    if (line.startsWith('@section')) {
      const heading = line.match(/"([^"]+)"/)?.[1] || 'Untitled Section'
      currentSection = {
        heading,
        depth: 3,
        covers: [],
        constraints: []
      }
      program.structure.sections.push(currentSection)
      program.structure.mode = 'custom'
      continue
    }
    if (currentSection) {
      if (line.startsWith('>depth:')) {
        currentSection.depth = parseInt(line.split(':')[1].trim())
        continue
      }
      if (line.startsWith('>covers:')) {
        const val = line.split(':')[1].trim()
        currentSection.covers = val.startsWith('[') ? val.slice(1, -1).split(',').map(s => s.trim()) : [val]
        continue
      }
      if (line.startsWith('>end-with:')) {
        currentSection.endWith = line.split(':')[1].trim()
        continue
      }
      if (line.startsWith('>open-with:')) {
        currentSection.openWith = line.split(':')[1].trim()
        continue
      }
      if (line.startsWith('>length:')) {
        currentSection.lengthTarget = line.split(':')[1].trim()
        continue
      }
    }

    if (line.startsWith('>style:')) {
      program.structure.style = line.split(':')[1].trim()
      continue
    }
    if (line.startsWith('>heading:')) {
      program.structure.heading = line.split(':')[1].trim()
      continue
    }

    // ── SCALE ─────────────────────────────────────────────────
    if (line.startsWith('>scale:')) {
      const val = line.split(':')[1].trim()
      const options = val.startsWith('[') ? val.slice(1, -1).split('|').map(s => s.trim()) : [val]
      program.scale = { options, implicit: false }
      continue
    }
    if (line.startsWith('#scale-implicit')) {
      if (program.scale) program.scale.implicit = true
      continue
    }
    if (line.startsWith('#scale-explicit')) {
      if (program.scale) program.scale.implicit = false
      continue
    }

    // ── MODIFIERS ─────────────────────────────────────────────
    if (line.startsWith('>>register:')) {
      program.modifiers.push({ kind: 'register', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('>>style:')) {
      program.modifiers.push({ kind: 'style', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('>>pause:')) {
      program.modifiers.push({ kind: 'pause', value: line.split(':')[1].trim() })
      continue
    }
    if (line.startsWith('>>')) {
      program.mode = line.slice(2).trim()
      continue
    }

    // ── TEMPLATES ─────────────────────────────────────────────
    if (line.startsWith(':template')) {
      const match = line.match(/:template\s+(\w+)\s*(?:\(([^)]*)\))?/)
      if (match) {
        currentTemplate = {
          name: match[1],
          params: match[2] ? match[2].split(',').map(s => s.trim()) : [],
          body: []
        }
      }
      continue
    }
    if (line.startsWith(':end')) {
      if (currentTemplate) {
        program.templates.push({
          name: currentTemplate.name,
          params: currentTemplate.params,
          body: currentTemplate.body.join('\n')
        })
        currentTemplate = null
      }
      continue
    }
    if (currentTemplate) {
      currentTemplate.body.push(lines[i]) // Keep original indentation for body
      continue
    }

    // ── LOOPS ─────────────────────────────────────────────────
    if (line.startsWith('!foreach')) {
      const match = line.match(/!foreach\s+(\w+)\s+in\s+(\[.*\]|\$\w+)\s*->\s*(.*)/)
      if (match) {
        program.loops.push({
          iterator: match[1],
          collection: match[2],
          body: match[3]
        })
      }
      continue
    }
    if (line.startsWith('!repeat:')) {
      const match = line.match(/!repeat:(\d+)\s*->\s*(.*)/)
      if (match) {
        program.loops.push({
          iterator: 'i',
          collection: '',
          count: parseInt(match[1]),
          body: match[2]
        })
      }
      continue
    }

    // ── CONDITIONALS ──────────────────────────────────────────
    if (line.startsWith('?if')) {
      const match = line.match(/\?if\s+(.*)\s*->\s*(.*)/)
      const elseMatch = i + 1 < lines.length && lines[i+1].trim().startsWith('?else')
      if (match) {
        program.conditionals.push({
          condition: match[1].trim(),
          then: match[2].trim(),
          else: elseMatch ? lines[i+1].trim().replace(/^\?else\s*->\s*/, '').trim() : undefined
        })
        if (elseMatch) i++ // skip next line
      }
      continue
    }

    // ── ASSERTIONS ────────────────────────────────────────────
    if (line.startsWith('!assert')) {
      program.assertions.push({ condition: line.replace('!assert', '').trim() })
      continue
    }

    // ── CONTEXT INJECT ────────────────────────────────────────
    if (line.startsWith('<<')) {
      const parts = line.slice(2).split(':')
      if (parts.length >= 2) {
        program.contextInject.push({
          source: parts[0].trim(),
          value: parts.slice(1).join(':').trim()
        })
      }
      continue
    }

    // ── DEBUG ─────────────────────────────────────────────────
    if (line.startsWith('!!')) {
      program.debug.push(line.slice(2).trim())
      continue
    }
  }

  return program
}
