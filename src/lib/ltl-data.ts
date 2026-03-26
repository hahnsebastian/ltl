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

// ─── Vocabulary pools ───────────────────────────────────────────────────────
const scopes = [
  '@/src', '@/api', '@/db', '@/ui', '@/auth', '@docs', '@tests',
  '@/hooks', '@/store', '@/utils', '@/services', '@/config', '@/types',
  '@/models', '@/routes', '@/middleware', '@/components', '@/pages',
  '@/scripts', '@/infra', '@/ci', '@/deploy', '@/migrations', '@/schemas',
  '@/cache', '@/queue', '@/workers', '@/graphql', '@/grpc', '@/websocket',
  '@/k8s', '@/helm', '@/docker', '@/terraform', '@/lambda', '@/s3',
  '@/redis', '@/mongo', '@/elastic', '@/kafka', '@/rabbitmq', '@/grpc-web',
  '@/eth', '@/solana', '@/polkadot', '@/contract', '@/mint', '@/bridge',
  '@/unity', '@/unreal', '@/godot', '@/shader', '@/phys', '@/anim',
  '@/figma', '@/sketch', '@/layer', '@/token', '@/proto', '@/comp',
  '@/salesforce', '@/sap', '@/abap', '@/apex', '@/soql', '@/visualforce',
  '@/embedded', '@/iot', '@/firmware', '@/rtos', '@/driver', '@/kernel',
  '@/pen-test', '@/vuln', '@/threat', '@/audit', '@/siem', '@/soc',
  '@/quantum', '@/qcircuit', '@/qbit', '@/noise', '@/entangle', '@/qalgo',
  '@/llm-ops', '@/eval', '@/dataset', '@/fine-tune', '@/prompt', '@/agent',
]

const actions = [
  '!ref', '!sec', '!doc', '!opt', '!test', '!fix', '!rev', '!gen',
  '!audit', '!lint', '!migrate', '!scale', '!monitor', '!deploy',
  '!arch', '!debug', '!profile', '!bench', '!mock', '!seed',
  '!plan', '!review', '!clean', '!split', '!merge', '!wrap',
  '!abstract', '!cache', '!rate-limit', '!auth', '!validate',
  '!patch', '!trace', '!k8s', '!helm', '!dockerize', '!lambda-gen',
  '!mint', '!bridge', '!contract-audit', '!unity-gen', '!unreal-gen',
  '!figma-to-code', '!embedded-opt', '!quantum-sim', '!llm-ops-eval',
]

const personas = [
  '%SNR', '%ARC', '%UX', '%DBA', '%OPS', '%SEC', '%ML',
  '%FE', '%BE', '%FS', '%QA', '%PM', '%TW', '%DV',
  '%CLOUD', '%MOBILE', '%DATA', '%AI', '%PERF', '%CRE',
  '%SRE', '%CISO', '%CTO', '%VPE', '%EM', '%STAFF',
  '%WEB3', '%GAMEDEV', '%DESIGN', '%EMBEDDED', '%IOT',
  '%PENTESTER', '%QUANTUM', '%LLMOPS', '%SFDC', '%SAP',
]

const constraints = [
  '#dry', '#min', '#std', '#fast', '#safe', '#typed',
  '#acc', '#i18n', '#a11y', '#perf', '#solid', '#kiss',
  '#yagni', '#clean', '#immut', '#pure', '#async', '#sync',
  '#tdd', '#bdd', '#cqrs', '#event', '#rest', '#gql',
  '#atomic', '#idempotent', '#stateless', '#ha', '#resilient',
  '#gas-opt', '#no-reentrancy', '#low-latency', '#deterministic',
]

const outputs = [
  '>md', '>json', '>ts', '>py', '>sql', '>yaml', '>mdx',
  '>html', '>sh', '>go', '>rs', '>java', '>kt', '>swift',
  '>graphql', '>proto', '>toml', '>env', '>csv', '>xml',
  '>tf', '>helm', '>docker', '>k8s', '>mermaid', '>uml',
  '>sol', '>unity-csharp', '>unreal-cpp', '>abap', '>apex',
  '>qasm', '>onnx', '>safetensors',
]

const personaLabels: Record<string, string> = {
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
}

const actionInstructions: Record<string, (scope: string, persona: string, category: string) => string> = {
  '!ref':      (s,p,c) => `As a ${personaLabels[p] || p}, refactor ${s} in ${c}: apply DRY, extract reusable logic, and clarify naming.`,
  '!sec':      (s,p,c) => `As a ${personaLabels[p] || p}, security audit ${s}: identify injection, auth, and data exposure risks.`,
  '!doc':      (s,p,c) => `As a ${personaLabels[p] || p}, write complete docs for ${s}: setup, API specs, and integration guide.`,
  '!opt':      (s,p,c) => `As a ${personaLabels[p] || p}, optimize ${s}: profile bottlenecks, add caching, and reduce memory.`,
  '!test':     (s,p,c) => `As a ${personaLabels[p] || p}, write test suite for ${s}: unit, integration, and edge cases.`,
  '!fix':      (s,p,c) => `As a ${personaLabels[p] || p}, diagnose/fix bugs in ${s}: trace root causes and provide patched code.`,
  '!gen':      (s,p,c) => `As a ${personaLabels[p] || p}, generate production boilerplate for ${s}: apply ${c} best practices.`,
  '!audit':    (s,p,c) => `As a ${personaLabels[p] || p}, audit ${s} for compliance: identify risks and prioritize findings.`,
  '!arch':     (s,p,c) => `As a ${personaLabels[p] || p}, design architecture for ${s}: define data flow and scalability.`,
  '!mint':     (s,p,c) => `As a ${personaLabels[p] || p}, generate minting script for ${s}: handle metadata and gas optimization.`,
  '!bridge':   (s,p,c) => `As a ${personaLabels[p] || p}, design cross-chain bridge for ${s}: ensure finality and security.`,
  '!contract-audit': (s,p,c) => `As a ${personaLabels[p] || p}, audit smart contract ${s}: identify overflow and reentrancy.`,
  '!unity-gen': (s,p,c) => `As a ${personaLabels[p] || p}, generate Unity C# script for ${s}: handle physics and lifecycle.`,
  '!figma-to-code': (s,p,c) => `As a ${personaLabels[p] || p}, export ${s} from Figma: generate responsive UI code in ${c}.`,
  '!embedded-opt': (s,p,c) => `As a ${personaLabels[p] || p}, tune ${s} for embedded: minimize footprint and handle RTOS interrupts.`,
  '!quantum-sim': (s,p,c) => `As a ${personaLabels[p] || p}, simulate ${s} on QASM: handle decoherence and noise profiles.`,
  '!llm-ops-eval': (s,p,c) => `As a ${personaLabels[p] || p}, evaluate ${s} outputs: measure toxicity, hallucination, and accuracy.`,
}

function generateDatabase(): LTLEntry[] {
  const entries: LTLEntry[] = []
  let id = 1

  const categoryGroups: Record<string, string[]> = {
    'React':       ['@/components', '@/hooks', '@/ui', '@/pages', '@/store'],
    'API':         ['@/api', '@/routes', '@/middleware', '@/graphql', '@/grpc'],
    'Database':    ['@/db', '@/migrations', '@/schemas', '@/models', '@/cache'],
    'Security':    ['@/auth', '@/api', '@/src', '@/config', '@/middleware'],
    'DevOps':      ['@/infra', '@/ci', '@/deploy', '@/workers', '@/scripts'],
    'Kubernetes':  ['@/k8s', '@/helm', '@/docker', '@/pods', '@/nodes'],
    'Blockchain':  ['@/eth', '@/solana', '@/polkadot', '@/contract', '@/bridge'],
    'Game Dev':    ['@/unity', '@/unreal', '@/godot', '@/shader', '@/phys'],
    'Design':      ['@/figma', '@/sketch', '@/layer', '@/token', '@/proto'],
    'Embedded':    ['@/embedded', '@/iot', '@/firmware', '@/rtos', '@/driver'],
    'Infosec':     ['@/pen-test', '@/vuln', '@/threat', '@/audit', '@/siem'],
    'Quantum':     ['@/quantum', '@/qcircuit', '@/qbit', '@/noise', '@/algo'],
    'LLMOps':      ['@/llm-ops', '@/eval', '@/dataset', '@/fine-tune', '@/prompt'],
    'Salesforce':  ['@/salesforce', '@/apex', '@/soql', '@/visualforce', '@/flow'],
    'SAP':         ['@/sap', '@/abap', '@/hana', '@/fiori', '@/ui5'],
    'Cloud Native':['@/terraform', '@/lambda', '@/s3', '@/gateway', '@/sns'],
    'Data Eng':    ['@/spark', '@/flink', '@/hadoop', '@/dwh', '@/pipeline'],
    'Mobile':      ['@/src', '@/ui', '@/hooks', '@/services', '@/store'],
    'TypeScript':  ['@/types', '@/generics', '@/utils', '@/lib', '@/interfaces'],
    'Rust':        ['@/src', '@/lib', '@/bin', '@/tests', '@/benches'],
    'Python':      ['@/src', '@/models', '@/utils', '@/tests', '@/scripts'],
    'Go':          ['@/cmd', '@/pkg', '@/internal', '@/api', '@/web'],
    'FinTech':     ['@/ledger', '@/payment', '@/fraud', '@/kyc', '@/aml'],
    'E-commerce':  ['@/cart', '@/checkout', '@/catalog', '@/discount', '@/stock'],
    'HealthTech':  ['@/ehr', '@/hipaa', '@/telemed', '@/diag', '@/prescription'],
  }

  const targetCount = 2500
  let templateIndex = 0

  while (entries.length < targetCount) {
    const categoryNames = Object.keys(categoryGroups)
    const category = categoryNames[templateIndex % categoryNames.length]
    const scopeList = categoryGroups[category]
    const scope = scopeList[Math.floor(templateIndex / categoryNames.length) % scopeList.length]
    const action = actions[templateIndex % actions.length]
    const persona = personas[(templateIndex * 3) % personas.length]
    const constraint = constraints[(templateIndex * 7) % constraints.length]
    const output = outputs[(templateIndex * 5) % outputs.length]

    const instructionFn = actionInstructions[action] || actionInstructions['!ref']
    const instruction = instructionFn(scope, persona, category)
    const stdTokens = 150 + (templateIndex % 200)
    const ltlTokens = 8 + (templateIndex % 10)

    entries.push({
      id: id++,
      command: `LTL ${scope} ${action} ${persona} ${constraint} ${output}`,
      category,
      fullInstruction: instruction,
      standardTokens: stdTokens,
      ltlTokens,
      efficiency: Math.round((1 - ltlTokens / stdTokens) * 100),
      scope,
      action,
      persona,
      constraint,
      output,
    })

    templateIndex++
  }

  return entries
}

export const LTL_DATABASE: LTLEntry[] = generateDatabase()

export const CATEGORIES = Array.from(new Set(LTL_DATABASE.map(e => e.category))).sort()
export { personaLabels }
