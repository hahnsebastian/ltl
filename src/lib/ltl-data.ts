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
}

// Static limited list for quick UI rendering before JSON sync
export const CATEGORIES = [
  'React', 'API', 'Database', 'Security', 'DevOps', 'Blockchain', 'Game Dev', 
  'XR/Spatial', 'Edge Compute', 'BioTech', 'GovTech', 'SpaceTech', 'Embedded', 
  'Infosec', 'Quantum', 'LLMOps', 'Salesforce', 'SAP', 'Tesla / Auto', 'Finance', 
  'Energy', 'Robotics'
].sort()

export const personaLabels: Record<string, string> = {
  '%SNR': 'Senior Dev', '%ARC': 'Architect', '%UX': 'UX Designer',
  '%DBA': 'DB Admin', '%OPS': 'DevOps Eng', '%SEC': 'Security Eng',
  '%ML': 'ML Engineer', '%FE': 'Frontend Dev', '%BE': 'Backend Dev',
  '%FS': 'Full-Stack Dev', '%QA': 'QA Engineer', '%PM': 'Product Manager',
  '%TW': 'Tech Writer', '%DV': 'DevRel', '%CLOUD': 'Cloud Architect',
  '%MOBILE': 'Mobile Dev', '%DATA': 'Data Engineer', '%AI': 'AI Engineer',
  '%PERF': 'Perf Engineer', '%SRE': 'SRE', '%CISO': 'CISO',
  '%WEB3': 'Web3 Eng', '%GAMEDEV': 'Game Dev', '%DESIGN': 'Design Eng',
  '%EMBEDDED': 'Embedded Eng', '%IOT': 'IoT Specialist',
  '%PENTESTER': 'Pen-Tester', '%QUANTUM': 'Quantum Eng', '%LLMOPS': 'LLMOps Eng',
  '%SFDC': 'SFDC Dev', '%SAP': 'SAP Consultant',
  '%XR': 'XR Developer', '%EDGE': 'Edge Eng', '%BIO': 'Bioinformatician',
  '%GOV': 'Compliance Eng', '%SPACE': 'Aerospace Eng',
}
