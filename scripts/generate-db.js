const fs = require('fs');
const path = require('path');

// [Vocabulary and Persona definitions same as previous step...]
const scopes = ['@/src', '@/api', '@/db', '@/ui', '@/auth', '@docs', '@tests', '@/hooks', '@/store', '@/utils', '@/services', '@/config', '@/types', '@/models', '@/routes', '@/middleware', '@/components', '@/pages', '@/scripts', '@/infra', '@/ci', '@/deploy', '@/migrations', '@/schemas', '@/cache', '@/queue', '@/workers', '@/graphql', '@/grpc', '@/websocket', '@/k8s', '@/helm', '@/docker', '@/terraform', '@/lambda', '@/s3', '@/redis', '@/mongo', '@/elastic', '@/kafka', '@/rabbitmq', '@/grpc-web', '@/eth', '@/solana', '@/polkadot', '@/contract', '@/mint', '@/bridge', '@/unity', '@/unreal', '@/godot', '@/shader', '@/phys', '@/anim', '@/figma', '@/sketch', '@/layer', '@/token', '@/proto', '@/comp', '@/salesforce', '@/sap', '@/abap', '@/apex', '@/soql', '@/visualforce', '@/embedded', '@/iot', '@/firmware', '@/rtos', '@/driver', '@/kernel', '@/pen-test', '@/vuln', '@/threat', '@/audit', '@/siem', '@/soc', '@/quantum', '@/qcircuit', '@/qbit', '@/noise', '@/entangle', '@/qalgo', '@/llm-ops', '@/eval', '@/dataset', '@/fine-tune', '@/prompt', '@/agent', '@/ar', '@/vr', '@/xr', '@/hmd', '@/spatial', '@/mesh', '@/edge', '@/wasm', '@/tiny-ml', '@/mcu', '@/fpga', '@/bio', '@/dna', '@/protein', '@/fold', '@/lab', '@/seq', '@/gov', '@/policy', '@/comp', '@/tax', '@/legal', '@/citizen', '@/space', '@/orbit', '@/telemetry', '@/payload', '@/sat', '@/rover'];
const actions = ['!ref', '!sec', '!doc', '!opt', '!test', '!fix', '!rev', '!gen', '!audit', '!lint', '!migrate', '!scale', '!monitor', '!deploy', '!arch', '!debug', '!profile', '!bench', '!mock', '!seed', '!plan', '!review', '!clean', '!split', '!merge', '!wrap', '!abstract', '!cache', '!rate-limit', '!auth', '!validate', '!patch', '!trace', '!k8s', '!helm', '!dockerize', '!lambda-gen', '!mint', '!bridge', '!contract-audit', '!unity-gen', '!unreal-gen', '!figma-to-code', '!embedded-opt', '!quantum-sim', '!llm-ops-eval', '!xr-mesh-gen', '!edge-opt', '!bio-seq-audit', '!gov-comp-ver', '!orbit-calc', '!reconstruct', '!simulate', '!evaluate', '!visualize', '!synthesize'];
const personas = ['%SNR', '%ARC', '%UX', '%DBA', '%OPS', '%SEC', '%ML', '%FE', '%BE', '%FS', '%QA', '%PM', '%TW', '%DV', '%CLOUD', '%MOBILE', '%DATA', '%AI', '%PERF', '%CRE', '%SRE', '%CISO', '%CTO', '%VPE', '%EM', '%STAFF', '%WEB3', '%GAMEDEV', '%DESIGN', '%EMBEDDED', '%IOT', '%PENTESTER', '%QUANTUM', '%LLMOPS', '%SFDC', '%SAP', '%XR', '%EDGE', '%BIO', '%GOV', '%SPACE'];
const constraints = ['#dry', '#min', '#std', '#fast', '#safe', '#typed', '#acc', '#i18n', '#a11y', '#perf', '#solid', '#kiss', '#yagni', '#clean', '#immut', '#pure', '#async', '#sync', '#tdd', '#bdd', '#cqrs', '#event', '#rest', '#gql', '#atomic', '#idempotent', '#stateless', '#ha', '#resilient', '#gas-opt', '#no-reentrancy', '#low-latency', '#deterministic', '#real-time', '#low-power', '#privacy', '#ethics', '#rad-hard'];
const outputs = ['>md', '>json', '>ts', '>py', '>sql', '>yaml', '>mdx', '>html', '>sh', '>go', '>rs', '>java', '>kt', '>swift', '>graphql', '>proto', '>toml', '>env', '>csv', '>xml', '>tf', '>helm', '>docker', '>k8s', '>mermaid', '>uml', '>sol', '>unity-csharp', '>unreal-cpp', '>abap', '>apex', '>qasm', '>onnx', '>safetensors', '>paj7', '>pda', '>pdb'];

// [Omit redundant code blocks for focus, use full generator as before...]
const personaLabels = {
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
};

const actionInstructions = {
  '!ref':      (s,p,c) => `As a ${personaLabels[p] || p}, refactor ${s} in ${c}: resolve debt, optimize naming.`,
  '!sec':      (s,p,c) => `As a ${personaLabels[p] || p}, security audit ${s}: identify vuln and data risks.`,
  '!doc':      (s,p,c) => `As a ${personaLabels[p] || p}, write internal docs for ${s}: explain logic and usage.`,
  '!opt':      (s,p,c) => `As a ${personaLabels[p] || p}, optimize ${s}: maximize throughput and minimize latency.`,
  '!test':     (s,p,c) => `As a ${personaLabels[p] || p}, write test suite for ${s}: unit and edge coverage.`,
  '!fix':      (s,p,c) => `As a ${personaLabels[p] || p}, diagnose/fix bugs in ${s}: trace root causes.`,
  '!gen':      (s,p,c) => `As a ${personaLabels[p] || p}, generate production boilerplate for ${s}: follow standards.`,
  '!audit':    (s,p,c) => `As a ${personaLabels[p] || p}, audit ${s} for compliance: produce findings report.`,
  '!arch':     (s,p,c) => `As a ${personaLabels[p] || p}, design architecture for ${s}: define system boundaries.`,
  '!patch':    (s,p,c) => `As a ${personaLabels[p] || p}, apply critical patch to ${s}.`,
  '!trace':    (s,p,c) => `As a ${personaLabels[p] || p}, trace execution flow in ${s}.`,
};

function generateDatabase() {
  const entries = [];
  let id = 1;
  const categoryGroups = {
    'React': ['@/components', '@/hooks', '@/ui', '@/pages', '@/store'],
    'API': ['@/api', '@/routes', '@/middleware', '@/graphql', '@/grpc'],
    'Database': ['@/db', '@/migrations', '@/schemas', '@/models', '@/cache'],
    'Security': ['@/auth', '@/api', '@/src', '@/config', '@/middleware'],
    'DevOps': ['@/infra', '@/ci', '@/deploy', '@/workers', '@/scripts'],
    'Kubernetes': ['@/k8s', '@/helm', '@/docker', '@/pods', '@/nodes'],
    'Blockchain': ['@/eth', '@/solana', '@/polkadot', '@/contract', '@/bridge'],
    'Game Dev': ['@/unity', '@/unreal', '@/godot', '@/shader', '@/phys'],
    'XR/Spatial': ['@/ar', '@/vr', '@/xr', '@/hmd', '@/spatial', '@/mesh'],
    'Edge Compute': ['@/edge', '@/wasm', '@/tiny-ml', '@/mcu', '@/fpga'],
    'BioTech': ['@/bio', '@/dna', '@/protein', '@/fold', '@/lab', '@/seq'],
    'GovTech': ['@/gov', '@/policy', '@/comp', '@/tax', '@/legal', '@/citizen'],
    'SpaceTech': ['@/space', '@/orbit', '@/telemetry', '@/payload', '@/sat', '@/rover'],
    'Embedded': ['@/embedded', '@/iot', '@/firmware', '@/rtos', '@/driver'],
    'Infosec': ['@/pen-test', '@/vuln', '@/threat', '@/audit', '@/siem'],
    'Quantum': ['@/quantum', '@/qcircuit', '@/qbit', '@/noise', '@/algo'],
    'LLMOps': ['@/llm-ops', '@/eval', '@/dataset', '@/fine-tune', '@/prompt'],
    'Salesforce': ['@/salesforce', '@/apex', '@/soql', '@/visualforce', '@/flow'],
    'SAP': ['@/sap', '@/abap', '@/hana', '@/fiori', '@/ui5'],
    'Tesla / Auto': ['@/ecu', '@/can', '@/autopilot', '@/radar', '@/vision'],
    'Finance': ['@/ledger', '@/payment', '@/fraud', '@/kyc', '@/aml'],
    'Energy': ['@/grid', '@/smart-meter', '@/load', '@/solar', '@/storage'],
    'Robotics': ['@/ros', '@/lidar', '@/motor', '@/kinematics', '@/slam'],
  };

  const targetCount = 5000;
  let templateIndex = 0;
  while (entries.length < targetCount) {
    const categoryNames = Object.keys(categoryGroups);
    const category = categoryNames[templateIndex % categoryNames.length];
    const scopeList = categoryGroups[category];
    const scope = scopeList[Math.floor(templateIndex / categoryNames.length) % scopeList.length];
    const action = actions[templateIndex % actions.length];
    const persona = personas[(templateIndex * 3) % personas.length];
    const constraint = constraints[(templateIndex * 7) % constraints.length];
    const output = outputs[(templateIndex * 5) % outputs.length];
    const instructionFn = actionInstructions[action] || actionInstructions['!ref'];
    entries.push({
      id: id++,
      command: `LTL ${scope} ${action} ${persona} ${constraint} ${output}`,
      category,
      fullInstruction: instructionFn(scope, persona, category),
      standardTokens: 120 + (templateIndex % 250),
      ltlTokens: 7 + (templateIndex % 12),
      efficiency: Math.round((1 - (7 + (templateIndex % 12)) / (120 + (templateIndex % 250))) * 100),
      scope, action, persona, constraint, output
    });
    templateIndex++;
  }
  return entries;
}

const db = generateDatabase();
const categories = Array.from(new Set(db.map(e => e.category))).sort();

// Root public folder
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

fs.writeFileSync(path.join(publicDir, 'ltl-database.json'), JSON.stringify({ database: db, categories, personaLabels }));
console.log('Successfully generated public/ltl-database.json with 5,000 entries');
