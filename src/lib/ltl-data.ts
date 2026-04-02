export interface LTLEntry {
  id: number
  command: string
  category: string
  fullInstruction: string
  standardTokens: number
  ltlTokens: number
  efficiency: number
  scope: string
  action: string
  persona: string
  constraint: string
  output: string
  state?: string
}

// Global Category Registry (Static High-Fidelity)
export const CATEGORIES = [
  'Analytics: Scouting',
  'Engineering: Architecture',
  'Database: Management',
  'Frontend: Interface',
  'Security: Verification',
  'Quality: Validation',
  'DevOps: Systems',
  'DevOps: Infrastructure',
  'Web3: Blockchain',
  'Science: BioTech',
  'Science: Aerospace',
  'Science: Quantum',
  'Persona: Curated',
  'Engineering: Generic'
].sort()

export const personaLabels: Record<string, string> = {
  '%SNR': 'Senior Dev', '%ARC': 'Architect', '%ML': 'ML Engineer', '%SEC': 'Security Eng',
  '%AI': 'AI Engineer', '%DBA': 'DB Admin', '%UX': 'UX Designer', '%DATA': 'Data Engineer',
  '%SRE': 'SRE', '%ETHIC': 'AI Ethics', '%TUTOR': 'Tutor', '%SCOUT': 'Scouting Analyst'
}
