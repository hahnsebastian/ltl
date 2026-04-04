export interface Section {
  heading: string
  depth: number
  covers: string[]
  constraints: { kind: string; value: string | string[] }[]
  endWith?: string
  openWith?: string
  lengthTarget?: string
}

export interface LTLProgram {
  persona:      { value: string; expertise?: string; audience?: string } | null
  subject:      { value: string; isVariable: boolean } | null
  variables:    { name: string; value: string; isInput: boolean; isEnum: boolean; enumOptions?: string[]; isRequired: boolean }[]
  intent:       { value: string; modifiers: Record<string, string> }
  constraints:  { kind: string; value: string | string[] }[]
  structure:    { mode: 'auto'|'flat'|'custom'; sections: Section[]; heading: string; style: string }
  scale:        { options: string[]; implicit: boolean } | null
  modifiers:    { kind: string; value: string }[]
  templates:    { name: string; params: string[]; body: string }[]
  conditionals: { condition: string; then: string; else?: string }[]
  loops:        { iterator: string; collection: string; body: string; count?: number }[]
  assertions:   { condition: string }[]
  mode:         string
  debug:        string[]
  contextInject:{ source: string; value: string; scope?: string }[]
}

export interface RuntimeOptions {
  webllmEngine?: any
  onSectionStart?: (heading: string, index: number, total: number) => void
  onSectionComplete?: (heading: string, content: string) => void
  onProgress?: (percent: number) => void
}

export interface RuntimeResult {
  output: string
  sections: Record<string, string>
  tokensUsed: number
  executionLog: string[]
}
