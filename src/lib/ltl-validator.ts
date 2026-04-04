import { LTLProgram } from './ltl-types'

export interface ValidationResult {
  valid: boolean
  errors: { code: string; message: string; fix: string }[]
  warnings: { code: string; message: string }[]
}

export function validateLTL(program: LTLProgram): ValidationResult {
  const errors: { code: string; message: string; fix: string }[] = []
  const warnings: { code: string; message: string }[] = []

  // ── HARD ERRORS — block execution ─────────────────────────

  // unbound required variables
  program.variables
    .filter(v => v.isRequired)
    .forEach(v => {
      // In a real scenario, we check if it has a value in resolvedVariables or a default
      if (!v.value && !v.isInput) {
        errors.push({
          code: 'UNBOUND_VARIABLE',
          message: `$${v.name} is required but has no value`,
          fix: `Provide a value for $${v.name} in the variable inputs panel`
        })
      }
    })

  // custom structure with no sections
  if (program.structure.mode === 'custom'
   && program.structure.sections.length === 0)
    errors.push({
      code: 'EMPTY_STRUCTURE',
      message: '>structure: declared with no @section blocks',
      fix: 'Add at least one @section or change to >structure: auto'
    })

  // sections with no covers
  program.structure.sections
    .filter(s => s.covers.length === 0)
    .forEach(s => errors.push({
      code: 'MISSING_COVERS',
      message: `@section "${s.heading}" has no >covers tags`,
      fix: `Add >covers: [tag, tag, tag] under @section "${s.heading}"`
    }))

  // invalid depth values
  program.structure.sections
    .filter(s => s.depth < 1 || s.depth > 4)
    .forEach(s => errors.push({
      code: 'INVALID_DEPTH',
      message: `@section "${s.heading}" has >depth: ${s.depth} — must be 1, 2, 3, or 4`,
      fix: `Change to >depth: 1, 2, 3, or 4`
    }))

  // unknown intent
  const validIntents = ['create','explain','analyse','rewrite','summarise',
    'compare','translate','brainstorm','evaluate','instruct','generate','dialogue']
  if (!validIntents.includes(program.intent.value))
    errors.push({
      code: 'INVALID_INTENT',
      message: `!${program.intent.value} is not a valid LTL intent`,
      fix: `Use one of: ${validIntents.map(i => '!' + i).join(', ')}`
    })

  // ── WARNINGS — allow execution but flag ───────────────────

  // compare without subjects
  if (program.intent.value === 'compare'
   && (!program.intent.modifiers.a || !program.intent.modifiers.b))
    warnings.push({
      code: 'COMPARE_NO_SUBJECTS',
      message: '!compare works best with $a = X and $b = Y modifiers'
    })

  // evaluate without scale
  if (program.intent.value === 'evaluate' && !program.scale)
    warnings.push({
      code: 'EVALUATE_NO_SCALE',
      message: '!evaluate has no >scale — no grade will be produced'
    })

  // no constraints on open-ended intent
  if (['create','generate'].includes(program.intent.value)
   && program.constraints.length === 0)
    warnings.push({
      code: 'NO_CONSTRAINTS',
      message: 'No #no or #must constraints — AI output will be unconstrained'
    })

  // many deep sections (performance warning)
  const deepSections = program.structure.sections.filter(s => s.depth === 4)
  if (deepSections.length > 3)
    warnings.push({
      code: 'EXPENSIVE_DEPTH',
      message: `${deepSections.length} sections at >depth:4 — output will be very long and slow`
    })

  // scale without intent to evaluate
  if (program.scale && !['evaluate','create','generate','analyse']
    .includes(program.intent.value))
    warnings.push({
      code: 'SCALE_MISMATCH',
      message: `>scale is unusual with !${program.intent.value}`
    })

  // input variables not yet filled
  const unfilled = program.variables.filter(v => v.isInput)
  if (unfilled.length > 0)
    warnings.push({
      code: 'INPUT_REQUIRED',
      message: `${unfilled.length} variable(s) need user input before running: ${unfilled.map(v => '$'+v.name).join(', ')}`
    })

  return { valid: errors.length === 0, errors, warnings }
}
