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
]

const actions = [
  '!ref', '!sec', '!doc', '!opt', '!test', '!fix', '!rev', '!gen',
  '!audit', '!lint', '!migrate', '!scale', '!monitor', '!deploy',
  '!arch', '!debug', '!profile', '!bench', '!mock', '!seed',
  '!plan', '!review', '!clean', '!split', '!merge', '!wrap',
  '!abstract', '!cache', '!rate-limit', '!auth', '!validate',
]

const personas = [
  '%SNR', '%ARC', '%UX', '%DBA', '%OPS', '%SEC', '%ML',
  '%FE', '%BE', '%FS', '%QA', '%PM', '%TW', '%DV',
  '%CLOUD', '%MOBILE', '%DATA', '%AI', '%PERF', '%CRE',
]

const constraints = [
  '#dry', '#min', '#std', '#fast', '#safe', '#typed',
  '#acc', '#i18n', '#a11y', '#perf', '#solid', '#kiss',
  '#yagni', '#clean', '#immut', '#pure', '#async', '#sync',
  '#tdd', '#bdd', '#cqrs', '#event', '#rest', '#gql',
]

const outputs = [
  '>md', '>json', '>ts', '>py', '>sql', '>yaml', '>mdx',
  '>html', '>sh', '>go', '>rs', '>java', '>kt', '>swift',
  '>graphql', '>proto', '>toml', '>env', '>csv', '>xml',
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
  // React / Frontend
  { category:'React', scope:'@/components', action:'!ref', persona:'%FE', constraint:'#dry', output:'>ts', instruction:'Refactor all React components in /components to use composable hooks, eliminate prop drilling, apply DRY principles, and ensure strict TypeScript types throughout.', stdTokens:210, ltlTokens:12 },
  { category:'React', scope:'@/hooks', action:'!gen', persona:'%FE', constraint:'#typed', output:'>ts', instruction:'Generate reusable custom React hooks for data fetching, debouncing, local storage sync, and window resize with full TypeScript generics.', stdTokens:195, ltlTokens:11 },
  { category:'React', scope:'@/ui', action:'!opt', persona:'%UX', constraint:'#perf', output:'>ts', instruction:'Optimize UI rendering performance by memoizing expensive components, implementing virtual scrolling for large lists, and auditing unnecessary re-renders.', stdTokens:230, ltlTokens:12 },
  { category:'React', scope:'@/pages', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>ts', instruction:'Audit all page-level components for XSS vulnerabilities, unsafe dangerouslySetInnerHTML usage, missing CSRF tokens, and open redirect risks.', stdTokens:205, ltlTokens:12 },
  { category:'React', scope:'@/components', action:'!doc', persona:'%TW', constraint:'#std', output:'>md', instruction:'Document every public component with JSDoc, usage examples, prop tables, accessibility notes, and Storybook story file links.', stdTokens:180, ltlTokens:10 },
  { category:'React', scope:'@/store', action:'!arch', persona:'%ARC', constraint:'#solid', output:'>ts', instruction:'Architect a global state management solution using Zustand or Redux Toolkit that follows SOLID principles with typed slices and selectors.', stdTokens:220, ltlTokens:12 },
  { category:'React', scope:'@/components', action:'!test', persona:'%QA', constraint:'#tdd', output:'>ts', instruction:'Write comprehensive unit and integration tests for all components using React Testing Library and Vitest following TDD principles.', stdTokens:198, ltlTokens:11 },
  { category:'React', scope:'@/ui', action:'!a11y', persona:'%UX', constraint:'#a11y', output:'>md', instruction:'Perform a full accessibility audit of the UI layer, fix ARIA roles, keyboard navigation, color contrast ratios, and screen reader compatibility.', stdTokens:210, ltlTokens:11 },

  // API
  { category:'API', scope:'@/api', action:'!sec', persona:'%SNR', constraint:'#safe', output:'>ts', instruction:'Perform a complete security audit of all API endpoints: validate inputs with Zod, add rate limiting, enforce JWT expiry, prevent SQL injection, and add CORS policies.', stdTokens:240, ltlTokens:13 },
  { category:'API', scope:'@/routes', action:'!ref', persona:'%BE', constraint:'#dry', output:'>ts', instruction:'Refactor all API route handlers to remove duplicated logic, extract middleware, normalize error responses, and apply consistent HTTP status codes.', stdTokens:215, ltlTokens:12 },
  { category:'API', scope:'@/api', action:'!doc', persona:'%TW', constraint:'#std', output:'>yaml', instruction:'Generate a fully compliant OpenAPI 3.1 specification document for all REST endpoints with request/response schemas, example payloads, and auth requirements.', stdTokens:225, ltlTokens:12 },
  { category:'API', scope:'@/middleware', action:'!gen', persona:'%BE', constraint:'#async', output:'>ts', instruction:'Generate async middleware chain for request logging, authentication verification, rate limiting, request correlation IDs, and graceful error propagation.', stdTokens:218, ltlTokens:12 },
  { category:'API', scope:'@/api', action:'!rate-limit', persona:'%OPS', constraint:'#perf', output:'>ts', instruction:'Implement tiered rate limiting using Redis with sliding window algorithm, apply per-user and per-IP limits, and return correct Retry-After headers.', stdTokens:230, ltlTokens:12 },
  { category:'API', scope:'@/graphql', action:'!arch', persona:'%ARC', constraint:'#gql', output:'>graphql', instruction:'Design a federated GraphQL schema with proper type definitions, resolvers, N+1 prevention using DataLoader, and field-level authorization directives.', stdTokens:245, ltlTokens:13 },
  { category:'API', scope:'@/api', action:'!version', persona:'%SNR', constraint:'#std', output:'>ts', instruction:'Implement API versioning strategy using URL path prefix, maintain backward compatibility, and generate migration guides between v1, v2, and v3.', stdTokens:200, ltlTokens:11 },
  { category:'API', scope:'@/grpc', action:'!gen', persona:'%BE', constraint:'#typed', output:'>proto', instruction:'Generate Protocol Buffer definitions and gRPC service stubs for all internal microservice communication with proper error codes and streaming support.', stdTokens:220, ltlTokens:12 },

  // Database
  { category:'Database', scope:'@/db', action:'!opt', persona:'%DBA', constraint:'#perf', output:'>sql', instruction:'Analyze all slow queries, add missing composite indexes, rewrite N+1 patterns as JOINs, partition large tables, and enable connection pooling via PgBouncer.', stdTokens:255, ltlTokens:13 },
  { category:'Database', scope:'@/migrations', action:'!gen', persona:'%DBA', constraint:'#safe', output:'>sql', instruction:'Generate zero-downtime database migration scripts with up/down rollback support, column renaming via shadow tables, and pre/post migration validation checks.', stdTokens:240, ltlTokens:13 },
  { category:'Database', scope:'@/schemas', action:'!doc', persona:'%TW', constraint:'#std', output:'>md', instruction:'Document the complete database schema with entity relationship diagrams, column descriptions, foreign key constraints, index rationale, and example queries.', stdTokens:215, ltlTokens:12 },
  { category:'Database', scope:'@/db', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>sql', instruction:'Audit database security: implement row-level security, revoke overprivileged roles, encrypt PII columns, add audit log triggers, and enforce SSL connections.', stdTokens:245, ltlTokens:13 },
  { category:'Database', scope:'@/models', action:'!ref', persona:'%DBA', constraint:'#dry', output:'>ts', instruction:'Refactor ORM model definitions to remove duplication, add missing validations, enforce soft-delete patterns, and align naming conventions with SQL schema.', stdTokens:220, ltlTokens:12 },
  { category:'Database', scope:'@/cache', action:'!arch', persona:'%ARC', constraint:'#perf', output:'>ts', instruction:'Design a multi-layer caching strategy using Redis for hot data, CDN for static assets, and in-memory LRU for frequent lookups with proper TTL and invalidation logic.', stdTokens:240, ltlTokens:13 },
  { category:'Database', scope:'@/db', action:'!seed', persona:'%DBA', constraint:'#tdd', output:'>ts', instruction:'Generate realistic seed data scripts for all tables, create factory functions for test fixtures, and add seeding commands to CI pipeline for fresh environments.', stdTokens:210, ltlTokens:12 },
  { category:'Database', scope:'@/migrations', action:'!audit', persona:'%DBA', constraint:'#safe', output:'>md', instruction:'Audit all existing migration history for data loss risks, irreversible operations, missing rollback logic, and conflicts between concurrent migration branches.', stdTokens:228, ltlTokens:12 },

  // Security
  { category:'Security', scope:'@/auth', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>ts', instruction:'Audit authentication system: enforce MFA, rotate JWT secret keys, implement secure token storage, add session hijacking detection, and log all auth events.', stdTokens:245, ltlTokens:13 },
  { category:'Security', scope:'@/api', action:'!audit', persona:'%SEC', constraint:'#safe', output:'>md', instruction:'Perform OWASP Top-10 security audit across all API surfaces, document vulnerabilities with CVSS scores, and provide remediation steps prioritized by severity.', stdTokens:250, ltlTokens:13 },
  { category:'Security', scope:'@/src', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>md', instruction:'Run static application security testing across the entire codebase, identify secrets accidentally committed, and enforce pre-commit hooks to prevent future leaks.', stdTokens:240, ltlTokens:13 },
  { category:'Security', scope:'@/middleware', action:'!auth', persona:'%SEC', constraint:'#safe', output:'>ts', instruction:'Implement OAuth 2.0 + PKCE flow, add refresh token rotation, enforce strict scopes, bind tokens to device fingerprint, and implement logout-everywhere functionality.', stdTokens:248, ltlTokens:13 },
  { category:'Security', scope:'@/config', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>env', instruction:'Audit all environment variables, move secrets to vault, enforce least privilege for service accounts, and generate .env.example with placeholder documentation.', stdTokens:220, ltlTokens:12 },

  // DevOps / Infra
  { category:'DevOps', scope:'@/infra', action:'!arch', persona:'%CLOUD', constraint:'#std', output:'>yaml', instruction:'Design cloud infrastructure with Terraform: multi-region deployment, auto-scaling groups, private VPC, WAF, CDN, and disaster recovery with RPO < 1 hour.', stdTokens:260, ltlTokens:13 },
  { category:'DevOps', scope:'@/ci', action:'!gen', persona:'%OPS', constraint:'#fast', output:'>yaml', instruction:'Generate GitHub Actions CI pipeline with parallelized test stages, Docker layer caching, semantic versioning, and automated deployment to staging on PR merge.', stdTokens:240, ltlTokens:13 },
  { category:'DevOps', scope:'@/deploy', action:'!opt', persona:'%OPS', constraint:'#perf', output:'>sh', instruction:'Optimize Docker build pipeline: implement multi-stage builds, minimize layer count, use distroless base images, and reduce final image size by at least 60%.', stdTokens:228, ltlTokens:12 },
  { category:'DevOps', scope:'@/infra', action:'!monitor', persona:'%OPS', constraint:'#std', output:'>yaml', instruction:'Set up observability stack with Prometheus metrics, Grafana dashboards, structured JSON logging, distributed tracing via OpenTelemetry, and PagerDuty alerts.', stdTokens:248, ltlTokens:13 },
  { category:'DevOps', scope:'@/ci', action:'!sec', persona:'%SEC', constraint:'#safe', output:'>yaml', instruction:'Harden CI/CD pipeline: pin action versions, scan Docker images with Trivy, enforce SBOM generation, require signed commits, and add secret scanning.', stdTokens:235, ltlTokens:13 },
  { category:'DevOps', scope:'@/deploy', action:'!scale', persona:'%CLOUD', constraint:'#perf', output:'>yaml', instruction:'Implement Kubernetes HPA and VPA, configure pod disruption budgets, add topology spread constraints for multi-zone HA, and tune JVM/Node heap limits.', stdTokens:248, ltlTokens:13 },
  { category:'DevOps', scope:'@/workers', action:'!gen', persona:'%BE', constraint:'#async', output:'>ts', instruction:'Generate background job workers with BullMQ: implement priority queues, dead-letter queues, retry backoff strategies, and job progress reporting via WebSocket.', stdTokens:238, ltlTokens:13 },

  // Testing
  { category:'Testing', scope:'@tests', action:'!gen', persona:'%QA', constraint:'#tdd', output:'>ts', instruction:'Generate end-to-end test suite using Playwright: cover critical user journeys, add visual regression tests, mock external APIs, and integrate with CI reporting.', stdTokens:230, ltlTokens:12 },
  { category:'Testing', scope:'@tests', action:'!bench', persona:'%PERF', constraint:'#perf', output:'>ts', instruction:'Create performance benchmark suite using Artillery: define load profiles, set SLO thresholds, test cold-start latency, and generate detailed HTML reports.', stdTokens:225, ltlTokens:12 },
  { category:'Testing', scope:'@/services', action:'!mock', persona:'%QA', constraint:'#tdd', output:'>ts', instruction:'Generate comprehensive mock implementations for all external services using MSW, covering happy paths, error scenarios, network failures, and timeouts.', stdTokens:218, ltlTokens:12 },
  { category:'Testing', scope:'@tests', action:'!rev', persona:'%QA', constraint:'#std', output:'>md', instruction:'Review test coverage report, identify untested code paths, enforce 80% line coverage threshold, and generate a test improvement plan sorted by risk.', stdTokens:210, ltlTokens:11 },

  // Documentation
  { category:'Docs', scope:'@docs', action:'!doc', persona:'%TW', constraint:'#std', output:'>md', instruction:'Write comprehensive developer documentation: getting started guide, API reference, architecture decision records, contribution guidelines, and troubleshooting FAQ.', stdTokens:220, ltlTokens:12 },
  { category:'Docs', scope:'@docs', action:'!gen', persona:'%TW', constraint:'#i18n', output:'>mdx', instruction:'Generate multilingual documentation site with MDX, auto-generate API reference from TypeScript types, add live code sandboxes, and deploy to GitHub Pages.', stdTokens:235, ltlTokens:13 },

  // Performance
  { category:'Performance', scope:'@/src', action:'!profile', persona:'%PERF', constraint:'#perf', output:'>md', instruction:'Profile application performance with Clinic.js and Lighthouse: identify CPU hotspots, memory leaks, render-blocking resources, and generate optimization report.', stdTokens:238, ltlTokens:13 },
  { category:'Performance', scope:'@/ui', action:'!opt', persona:'%PERF', constraint:'#perf', output:'>ts', instruction:'Optimize Core Web Vitals: implement code splitting, preload critical fonts, defer non-critical scripts, compress images with WebP/AVIF, and add resource hints.', stdTokens:230, ltlTokens:12 },

  // ML/AI
  { category:'ML/AI', scope:'@/models', action:'!arch', persona:'%ML', constraint:'#typed', output:'>py', instruction:'Design ML pipeline architecture: feature engineering, model training with MLflow tracking, A/B testing framework, shadow deployment strategy, and monitoring for drift.', stdTokens:255, ltlTokens:13 },
  { category:'ML/AI', scope:'@/services', action:'!gen', persona:'%AI', constraint:'#async', output:'>py', instruction:'Generate async inference service wrapper with batching, request queuing, model versioning, GPU memory management, and Prometheus metrics for latency tracking.', stdTokens:248, ltlTokens:13 },

  // Mobile
  { category:'Mobile', scope:'@/src', action:'!ref', persona:'%MOBILE', constraint:'#perf', output:'>ts', instruction:'Refactor React Native app: migrate to New Architecture (Fabric + TurboModules), optimize bundle size with Metro, and implement lazy screen loading.', stdTokens:228, ltlTokens:12 },
  { category:'Mobile', scope:'@/ui', action:'!a11y', persona:'%MOBILE', constraint:'#a11y', output:'>ts', instruction:'Audit mobile accessibility: fix VoiceOver/TalkBack labels, ensure touch target sizes, support Dynamic Type, and test with Switch Control navigation.', stdTokens:220, ltlTokens:12 },

  // Cloud
  { category:'Cloud', scope:'@/infra', action:'!cost', persona:'%CLOUD', constraint:'#min', output:'>yaml', instruction:'Audit cloud spend using AWS Cost Explorer, right-size underutilized instances, migrate to Spot/Graviton where applicable, and implement budget alerts.', stdTokens:238, ltlTokens:13 },
  { category:'Cloud', scope:'@/infra', action:'!sec', persona:'%CLOUD', constraint:'#safe', output:'>yaml', instruction:'Apply CIS benchmark hardening to AWS accounts: enable CloudTrail, GuardDuty, Security Hub, enforce SCPs, and implement automated remediation for findings.', stdTokens:248, ltlTokens:13 },
]

// ─── Variant expanders ────────────────────────────────────────────────────────
const actionVariants: Record<string, string[]> = {
  '!ref':    ['Refactor', 'Restructure', 'Reorganize', 'Rewrite'],
  '!sec':    ['Security audit', 'Pen-test', 'Harden', 'Vulnerability scan'],
  '!doc':    ['Document', 'Write docs for', 'Generate reference for', 'Annotate'],
  '!opt':    ['Optimize', 'Tune performance of', 'Improve efficiency of', 'Speed up'],
  '!test':   ['Write tests for', 'Cover with TDD', 'Add test suite to', 'Spec out'],
  '!fix':    ['Fix bugs in', 'Patch issues in', 'Debug', 'Repair'],
  '!gen':    ['Generate', 'Scaffold', 'Create boilerplate for', 'Bootstrap'],
  '!audit':  ['Audit', 'Review', 'Inspect', 'Analyze'],
  '!arch':   ['Architect', 'Design system for', 'Plan architecture of', 'Model'],
  '!migrate':['Migrate', 'Port', 'Upgrade', 'Transition'],
  '!scale':  ['Scale', 'Make horizontally scalable', 'Distribute', 'Load-balance'],
  '!monitor':['Monitor', 'Add observability to', 'Instrument', 'Set up alerts for'],
  '!deploy': ['Deploy', 'Release', 'Publish', 'Ship'],
  '!clean':  ['Clean up', 'Remove dead code from', 'Prune', 'Tidy'],
  '!bench':  ['Benchmark', 'Measure throughput of', 'Load-test', 'Profile latency of'],
  '!mock':   ['Mock', 'Stub out', 'Fake', 'Simulate'],
  '!lint':   ['Lint', 'Enforce style rules in', 'Auto-format', 'Run static analysis on'],
  '!plan':   ['Plan', 'Define roadmap for', 'Spec out', 'Break down'],
  '!cache':  ['Add caching to', 'Cache strategy for', 'Memoize', 'Implement cache layer'],
  '!review': ['Code review', 'Peer review', 'Critique', 'Give feedback on'],
  '!auth':   ['Implement auth in', 'Add authentication to', 'Secure with OAuth', 'Gate'],
  '!validate':['Validate', 'Add schema validation to', 'Type-check', 'Sanitize inputs in'],
  '!abstract':['Abstract', 'Extract interface from', 'Decouple', 'Modularize'],
  '!seed':   ['Seed data for', 'Generate fixtures for', 'Populate', 'Bootstrap data in'],
  '!rate-limit':['Rate-limit', 'Throttle', 'Add quotas to', 'Protect with limits'],
  '!debug':  ['Debug', 'Trace issues in', 'Add logging to', 'Diagnose'],
  '!profile':['Profile', 'Measure CPU usage of', 'Heap-analyze', 'Flame-graph'],
  '!split':  ['Split', 'Decouple', 'Separate concerns in', 'Modularize'],
  '!wrap':   ['Wrap', 'Add adapter layer to', 'Create facade for', 'Proxy'],
  '!merge':  ['Merge', 'Consolidate', 'Unify', 'Combine'],
}

const personaLabels: Record<string, string> = {
  '%SNR': 'Senior Dev', '%ARC': 'Architect', '%UX': 'UX Designer',
  '%DBA': 'DB Admin', '%OPS': 'DevOps Eng', '%SEC': 'Security Eng',
  '%ML': 'ML Engineer', '%FE': 'Frontend Dev', '%BE': 'Backend Dev',
  '%FS': 'Full-Stack Dev', '%QA': 'QA Engineer', '%PM': 'Product Manager',
  '%TW': 'Tech Writer', '%DV': 'DevRel', '%CLOUD': 'Cloud Architect',
  '%MOBILE': 'Mobile Dev', '%DATA': 'Data Engineer', '%AI': 'AI Engineer',
  '%PERF': 'Perf Engineer', '%CRE': 'CRE',
}

const constraintLabels: Record<string, string> = {
  '#dry': 'No Repeats', '#min': 'Minimal', '#std': 'Standards', '#fast': 'Fast',
  '#safe': 'Safe', '#typed': 'Typed', '#acc': 'Accurate', '#i18n': 'i18n',
  '#a11y': 'Accessible', '#perf': 'Performance', '#solid': 'SOLID', '#kiss': 'KISS',
  '#yagni': 'YAGNI', '#clean': 'Clean Code', '#immut': 'Immutable', '#pure': 'Pure Fn',
  '#async': 'Async', '#sync': 'Sync', '#tdd': 'TDD', '#bdd': 'BDD',
  '#cqrs': 'CQRS', '#event': 'Event-Driven', '#rest': 'REST', '#gql': 'GraphQL',
}

// ─── Database generator ───────────────────────────────────────────────────────
function generateDatabase(): LTLEntry[] {
  const entries: LTLEntry[] = []
  let id = 1

  // First: use all templates directly
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

  // Then: generate permutations until we reach 600+
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
    'WebSocket':   ['@/websocket', '@/events', '@/gateway', '@/handlers', '@/rooms'],
    'Queue':       ['@/queue', '@/workers', '@/jobs', '@/handlers', '@/dlq'],
    'TypeScript':  ['@/types', '@/interfaces', '@/generics', '@/utils', '@/lib'],
    'SQL':         ['@/db', '@/queries', '@/procedures', '@/views', '@/triggers'],
    'Node.js':     ['@/server', '@/services', '@/utils', '@/config', '@/scripts'],
    'Go':          ['@/cmd', '@/pkg', '@/internal', '@/api', '@/services'],
    'Python':      ['@/src', '@/models', '@/utils', '@/tests', '@/scripts'],
    'Rust':        ['@/src', '@/lib', '@/bin', '@/tests', '@/benches'],
    'Java':        ['@/src', '@/service', '@/repository', '@/controller', '@/config'],
  }

  const actionInstructions: Record<string, (scope: string, persona: string, category: string) => string> = {
    '!ref':      (s,p,c) => `As a ${personaLabels[p] || p}, refactor ${s} in the ${c} domain: apply DRY principle, extract reusable abstractions, remove dead code, and improve naming clarity throughout the module.`,
    '!sec':      (s,p,c) => `As a ${personaLabels[p] || p}, perform a comprehensive security audit on ${s}: identify injection vulnerabilities, weak authentication flows, insecure dependencies, and data exposure risks.`,
    '!doc':      (s,p,c) => `As a ${personaLabels[p] || p}, write complete documentation for ${s}: include overview, setup instructions, API reference, examples, error codes, and integration guide.`,
    '!opt':      (s,p,c) => `As a ${personaLabels[p] || p}, optimize ${s} for maximum performance: profile bottlenecks, implement caching where appropriate, reduce memory allocations, and set measurable SLO targets.`,
    '!test':     (s,p,c) => `As a ${personaLabels[p] || p}, write a complete test suite for ${s}: unit tests, integration tests, edge cases, negative scenarios, and mutation testing coverage.`,
    '!fix':      (s,p,c) => `As a ${personaLabels[p] || p}, diagnose and fix all known bugs in ${s}: trace root causes, add regression tests, and document the fix rationale.`,
    '!gen':      (s,p,c) => `As a ${personaLabels[p] || p}, generate production-ready boilerplate for ${s}: apply best practices for the ${c} domain, add configuration, and include README.`,
    '!audit':    (s,p,c) => `As a ${personaLabels[p] || p}, audit ${s} thoroughly: check compliance with ${c} standards, identify risks, and produce a prioritized findings report with CVSS scoring.`,
    '!arch':     (s,p,c) => `As a ${personaLabels[p] || p}, design the architecture for ${s}: define component boundaries, data flow, failure modes, scalability strategy, and produce an ADR document.`,
    '!migrate':  (s,p,c) => `As a ${personaLabels[p] || p}, create a safe migration plan for ${s}: zero-downtime steps, rollback procedures, data validation checkpoints, and communication plan.`,
    '!scale':    (s,p,c) => `As a ${personaLabels[p] || p}, make ${s} horizontally scalable: implement stateless design, add queue-based decoupling, distribute load, and define auto-scaling policies.`,
    '!monitor':  (s,p,c) => `As a ${personaLabels[p] || p}, instrument ${s} with full observability: add structured logs, metrics with Prometheus, distributed traces with OTEL, and alerting rules.`,
    '!deploy':   (s,p,c) => `As a ${personaLabels[p] || p}, create a deployment pipeline for ${s}: blue/green strategy, health checks, rollback triggers, environment promotion, and post-deploy smoke tests.`,
    '!clean':    (s,p,c) => `As a ${personaLabels[p] || p}, clean up technical debt in ${s}: remove deprecated APIs, delete dead code, update outdated dependencies, and enforce coding standards.`,
    '!bench':    (s,p,c) => `As a ${personaLabels[p] || p}, create benchmarks for ${s}: measure p50/p95/p99 latencies, throughput under load, memory usage trends, and compare against SLO targets.`,
    '!mock':     (s,p,c) => `As a ${personaLabels[p] || p}, create mock/stub implementations for ${s}: cover success, error, timeout, and partial failure scenarios for deterministic testing.`,
    '!lint':     (s,p,c) => `As a ${personaLabels[p] || p}, configure and apply linting to ${s}: enforce style rules, catch common antipatterns, auto-fix where safe, and integrate with pre-commit hooks.`,
    '!plan':     (s,p,c) => `As a ${personaLabels[p] || p}, create a detailed execution plan for ${s}: break work into milestones, estimate effort, identify risks, and define acceptance criteria.`,
    '!cache':    (s,p,c) => `As a ${personaLabels[p] || p}, design and implement caching strategy for ${s}: choose appropriate cache layers (L1/L2/CDN), set TTLs, handle invalidation, and measure hit rates.`,
    '!review':   (s,p,c) => `As a ${personaLabels[p] || p}, perform a thorough code review of ${s}: evaluate logic correctness, security, performance, readability, and test coverage. Provide actionable feedback.`,
    '!auth':     (s,p,c) => `As a ${personaLabels[p] || p}, implement authentication and authorization in ${s}: use industry-standard protocols, enforce least-privilege access, and add comprehensive audit logging.`,
    '!validate': (s,p,c) => `As a ${personaLabels[p] || p}, add comprehensive input validation to ${s}: enforce schema constraints, sanitize user input, return structured errors, and add fuzz testing.`,
    '!abstract': (s,p,c) => `As a ${personaLabels[p] || p}, extract reusable abstractions from ${s}: identify repeated patterns, define clean interfaces, apply dependency inversion, and document new contracts.`,
    '!seed':     (s,p,c) => `As a ${personaLabels[p] || p}, generate seed data and fixture factories for ${s}: realistic data volumes, referential integrity, deterministic IDs for testing, and CSV/JSON exports.`,
    '!debug':    (s,p,c) => `As a ${personaLabels[p] || p}, debug ${s}: add strategic logging, enable verbose tracing, reproduce issues in isolation, identify root cause, and add regression guard.`,
    '!profile':  (s,p,c) => `As a ${personaLabels[p] || p}, profile ${s}: capture CPU flame graphs, memory heap snapshots, identify GC pressure, and produce optimization recommendations.`,
    '!split':    (s,p,c) => `As a ${personaLabels[p] || p}, decompose ${s} into focused modules: identify single-responsibility boundaries, define contracts between modules, and create migration path.`,
    '!wrap':     (s,p,c) => `As a ${personaLabels[p] || p}, create an adapter/facade for ${s}: abstract implementation details, provide stable public API, handle versioning, and add type-safe wrappers.`,
    '!merge':    (s,p,c) => `As a ${personaLabels[p] || p}, consolidate duplicated implementations in ${s}: identify overlap, unify under a single well-tested module, and update all consumers.`,
    '!rate-limit':(s,p,c) => `As a ${personaLabels[p] || p}, implement rate limiting in ${s}: sliding window algorithm, per-user and per-IP quotas, Redis-backed state, exponential backoff, and 429 responses.`,
  }

  const targetCount = 620
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
    const stdTokens = 180 + (templateIndex % 80)
    const ltlTokens = 9 + (templateIndex % 5)

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
export const SCOPES      = Array.from(new Set(LTL_DATABASE.map(e => e.scope))).sort()
export const ACTIONS     = Array.from(new Set(LTL_DATABASE.map(e => e.action))).sort()
export const PERSONAS    = Array.from(new Set(LTL_DATABASE.map(e => e.persona))).sort()

export { personaLabels, constraintLabels }
