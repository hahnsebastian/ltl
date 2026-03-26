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
]

const actions = [
  '!ref', '!sec', '!doc', '!opt', '!test', '!fix', '!rev', '!gen',
  '!audit', '!lint', '!migrate', '!scale', '!monitor', '!deploy',
  '!arch', '!debug', '!profile', '!bench', '!mock', '!seed',
  '!plan', '!review', '!clean', '!split', '!merge', '!wrap',
  '!abstract', '!cache', '!rate-limit', '!auth', '!validate',
  '!patch', '!trace', '!k8s', '!helm', '!dockerize', '!lambda-gen',
]

const personas = [
  '%SNR', '%ARC', '%UX', '%DBA', '%OPS', '%SEC', '%ML',
  '%FE', '%BE', '%FS', '%QA', '%PM', '%TW', '%DV',
  '%CLOUD', '%MOBILE', '%DATA', '%AI', '%PERF', '%CRE',
  '%SRE', '%CISO', '%CTO', '%VPE', '%EM', '%STAFF',
]

const constraints = [
  '#dry', '#min', '#std', '#fast', '#safe', '#typed',
  '#acc', '#i18n', '#a11y', '#perf', '#solid', '#kiss',
  '#yagni', '#clean', '#immut', '#pure', '#async', '#sync',
  '#tdd', '#bdd', '#cqrs', '#event', '#rest', '#gql',
  '#atomic', '#idempotent', '#stateless', '#ha', '#resilient',
]

const outputs = [
  '>md', '>json', '>ts', '>py', '>sql', '>yaml', '>mdx',
  '>html', '>sh', '>go', '>rs', '>java', '>kt', '>swift',
  '>graphql', '>proto', '>toml', '>env', '>csv', '>xml',
  '>tf', '>helm', '>docker', '>k8s', '>mermaid', '>uml',
]

// ─── Category / template mappings ───────────────────────────────────────────
interface Template {
  category: string
  scope: string
  action: string
  persona: string
  constraint: string
  output: string
  instruction: string
  stdTokens: number
  ltlTokens: number
}

const templates: Template[] = [
  { category:'React', scope:'@/components', action:'!ref', persona:'%FE', constraint:'#dry', output:'>ts', instruction:'Refactor all React components in /components to use composable hooks, eliminate prop drilling, apply DRY principles, and ensure strict TypeScript types throughout.', stdTokens:210, ltlTokens:12 },
  { category:'React', scope:'@/hooks', action:'!gen', persona:'%FE', constraint:'#typed', output:'>ts', instruction:'Generate reusable custom React hooks for data fetching, debouncing, local storage sync, and window resize with full TypeScript generics.', stdTokens:195, ltlTokens:11 },
  { category:'API', scope:'@/api', action:'!sec', persona:'%SNR', constraint:'#safe', output:'>ts', instruction:'Perform a complete security audit of all API endpoints: validate inputs with Zod, add rate limiting, enforce JWT expiry, prevent SQL injection, and add CORS policies.', stdTokens:240, ltlTokens:13 },
  { category:'Database', scope:'@/db', action:'!opt', persona:'%DBA', constraint:'#perf', output:'>sql', instruction:'Analyze all slow queries, add missing composite indexes, rewrite N+1 patterns as JOINs, partition large tables, and enable connection pooling via PgBouncer.', stdTokens:255, ltlTokens:13 },
  { category:'Security', scope:'@/auth', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>ts', instruction:'Audit authentication system: enforce MFA, rotate JWT secret keys, implement secure token storage, add session hijacking detection, and log all auth events.', stdTokens:245, ltlTokens:13 },
  { category:'DevOps', scope:'@/infra', action:'!arch', persona:'%CLOUD', constraint:'#std', output:'>yaml', instruction:'Design cloud infrastructure with Terraform: multi-region deployment, auto-scaling groups, private VPC, WAF, CDN, and disaster recovery with RPO < 1 hour.', stdTokens:260, ltlTokens:13 },
  { category:'Kubernetes', scope:'@/k8s', action:'!arch', persona:'%SRE', constraint:'#ha', output:'>yaml', instruction:'Design a high-availability Kubernetes cluster layout with multi-zone node pools, pod disruption budgets, anti-affinity rules, and cluster autoscaler configuration.', stdTokens:275, ltlTokens:14 },
  { category:'System Design', scope:'@/infra', action:'!arch', persona:'%ARC', constraint:'#resilient', output:'>mermaid', instruction:'Architect a globally distributed system with event-driven consistency, fallback regions, read replicas, and circuit breakers for all external services.', stdTokens:285, ltlTokens:15 },
]

const personaLabels: Record<string, string> = {
  '%SNR': 'Senior Dev', '%ARC': 'Architect', '%UX': 'UX Designer',
  '%DBA': 'DB Admin', '%OPS': 'DevOps Eng', '%SEC': 'Security Eng',
  '%ML': 'ML Engineer', '%FE': 'Frontend Dev', '%BE': 'Backend Dev',
  '%FS': 'Full-Stack Dev', '%QA': 'QA Engineer', '%PM': 'Product Manager',
  '%TW': 'Tech Writer', '%DV': 'DevRel', '%CLOUD': 'Cloud Architect',
  '%MOBILE': 'Mobile Dev', '%DATA': 'Data Engineer', '%AI': 'AI Engineer',
  '%PERF': 'Perf Engineer', '%CRE': 'CRE', '%SRE': 'SRE',
  '%CISO': 'CISO', '%CTO': 'CTO', '%VPE': 'VP Eng', '%EM': 'Eng Manager', '%STAFF': 'Staff Eng',
}

const constraintLabels: Record<string, string> = {
  '#dry': 'No Repeats', '#min': 'Minimal', '#std': 'Standards', '#fast': 'Fast',
  '#safe': 'Safe', '#typed': 'Typed', '#acc': 'Accurate', '#i18n': 'i18n',
  '#a11y': 'Accessible', '#perf': 'Performance', '#solid': 'SOLID', '#kiss': 'KISS',
  '#yagni': 'YAGNI', '#clean': 'Clean Code', '#immut': 'Immutable', '#pure': 'Pure Fn',
  '#async': 'Async', '#sync': 'Sync', '#tdd': 'TDD', '#bdd': 'BDD',
  '#cqrs': 'CQRS', '#event': 'Event-Driven', '#rest': 'REST', '#gql': 'GraphQL',
  '#atomic': 'Atomic', '#idempotent': 'Idempotent', '#stateless': 'Stateless', '#ha': 'High Avail', '#resilient': 'Resilient',
}

const actionInstructions: Record<string, (scope: string, persona: string, category: string) => string> = {
  '!ref':      (s,p,c) => `As a ${personaLabels[p] || p}, refactor ${s} in the ${c} domain: apply DRY principle, extract abstractions, and improve naming clarity.`,
  '!sec':      (s,p,c) => `As a ${personaLabels[p] || p}, perform security audit on ${s}: identify injections, weak auth, and data exposure risks.`,
  '!doc':      (s,p,c) => `As a ${personaLabels[p] || p}, write complete documentation for ${s}: setup, API specs, examples, and integration guide.`,
  '!opt':      (s,p,c) => `As a ${personaLabels[p] || p}, optimize ${s} for performance: profile bottlenecks, add caching, and reduce memory.`,
  '!test':     (s,p,c) => `As a ${personaLabels[p] || p}, write test suite for ${s}: unit, integration, edge cases, and mutation tests.`,
  '!fix':      (s,p,c) => `As a ${personaLabels[p] || p}, diagnose and fix bugs in ${s}: trace root causes and provide patched code.`,
  '!gen':      (s,p,c) => `As a ${personaLabels[p] || p}, generate production boilerplate for ${s}: apply best practices for ${c} domain.`,
  '!audit':    (s,p,c) => `As a ${personaLabels[p] || p}, audit ${s} for compliance: identify risks and produce prioritized findings report.`,
  '!arch':     (s,p,c) => `As a ${personaLabels[p] || p}, design architecture for ${s}: define boundaries, data flow, and scalability.`,
  '!migrate':  (s,p,c) => `As a ${personaLabels[p] || p}, create migration plan for ${s}: zero-downtime, rollbacks, and validation checkpoints.`,
  '!scale':    (s,p,c) => `As a ${personaLabels[p] || p}, scale ${s}: implement stateless design, decoupling, and load balancing.`,
  '!monitor':  (s,p,c) => `As a ${personaLabels[p] || p}, instrument ${s}: add structured logs, Prometheus metrics, and OTEL traces.`,
  '!deploy':   (s,p,c) => `As a ${personaLabels[p] || p}, create deployment pipeline for ${s}: blue/green strategy, health checks, and rollbacks.`,
  '!clean':    (s,p,c) => `As a ${personaLabels[p] || p}, clean debt in ${s}: remove deprecated APIs and update outdated dependencies.`,
  '!bench':    (s,p,c) => `As a ${personaLabels[p] || p}, create benchmarks for ${s}: measure p99 latencies and throughput under load.`,
  '!mock':     (s,p,c) => `As a ${personaLabels[p] || p}, create mock implementations for ${s}: cover success, error, and timeout scenarios.`,
  '!patch':    (s,p,c) => `As a ${personaLabels[p] || p}, apply critical security patch to ${s}: isolate fix and add regression guard.`,
  '!trace':    (s,p,c) => `As a ${personaLabels[p] || p}, trace execution flow in ${s}: identify latency hotspots across microservice boundaries.`,
}

function generateDatabase(): LTLEntry[] {
  const entries: LTLEntry[] = []
  let id = 1

  // Templates
  for (const t of templates) {
    entries.push({
      id: id++,
      command: `LTL ${t.scope} ${t.action} ${t.persona} ${t.constraint} ${t.output}`,
      category: t.category,
      fullInstruction: t.instruction,
      standardTokens: t.stdTokens,
      ltlTokens: t.ltlTokens,
      efficiency: Math.round((1 - t.ltlTokens / t.stdTokens) * 100),
      scope: t.scope,
      action: t.action,
      persona: t.persona,
      constraint: t.constraint,
      output: t.output,
    })
  }

  const categoryGroups: Record<string, string[]> = {
    'React':       ['@/components', '@/hooks', '@/ui', '@/pages', '@/store'],
    'API':         ['@/api', '@/routes', '@/middleware', '@/graphql', '@/grpc'],
    'Database':    ['@/db', '@/migrations', '@/schemas', '@/models', '@/cache'],
    'Security':    ['@/auth', '@/api', '@/src', '@/config', '@/middleware'],
    'DevOps':      ['@/infra', '@/ci', '@/deploy', '@/workers', '@/scripts'],
    'Testing':     ['@tests', '@/services', '@/components', '@/api', '@/hooks'],
    'Docs':        ['@docs', '@/api', '@/components', '@/infra', '@/schemas'],
    'Performance': ['@/src', '@/ui', '@/api', '@/db', '@/cache'],
    'ML/AI':       ['@/models', '@/services', '@/data', '@/pipeline', '@/eval'],
    'Mobile':      ['@/src', '@/ui', '@/hooks', '@/services', '@/store'],
    'Cloud':       ['@/infra', '@/deploy', '@/ci', '@/config', '@/scripts'],
    'Kubernetes':  ['@/k8s', '@/helm', '@/docker', '@/pods', '@/nodes'],
    'System Design':['@/infra', '@/api', '@/db', '@/cache', '@/shards'],
    'TypeScript':  ['@/types', '@/generics', '@/utils', '@/lib', '@/interfaces'],
    'Go':          ['@/cmd', '@/pkg', '@/internal', '@/api', '@/web'],
    'Rust':        ['@/src', '@/lib', '@/bin', '@/tests', '@/benches'],
    'Python':      ['@/src', '@/models', '@/utils', '@/tests', '@/scripts'],
    'Java':        ['@/src', '@/service', '@/repository', '@/controller', '@/config'],
    'C#':          ['@/src', '@/services', '@/models', '@/data', '@/app'],
    'Swift':       ['@/src', '@/views', '@/viewmodels', '@/models', '@/storage'],
    'Kotlin':      ['@/src', '@/ui', '@/domain', '@/data', '@/di'],
    'Redis':       ['@/redis', '@/cache', '@/pubsub', '@/lua', '@/sentinel'],
    'Kafka':       ['@/kafka', '@/producers', '@/consumers', '@/topics', '@/streams'],
  }

  const targetCount = 1250
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
    const stdTokens = 180 + (templateIndex % 120)
    const ltlTokens = 9 + (templateIndex % 8)

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
export { personaLabels, constraintLabels }
