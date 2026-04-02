# LESS TOKEN LANGUAGE (LTL)
[Version: 2.0.0]
[Status: Core Spec — PROD READY]
[Registry: 200,000 Patterns Indexed]

## MISSION
LTL is a deterministic semantic compression standard for AI prompting. 
It minimizes context window consumption by up to 97% using a modular shorthand syntax. 
Any subsequent prompts beginning with "LTL" must be strictly interpreted according 
to the following ruleset. DO NOT invent commands outside the defined dictionaries.

## SYNTAX STRUCTURE (v2.1.0)
`LTL [Scope] [Action] [Persona] [Constraint] [Output] & [Literal Context]`

*   `@` [Scope]: Target files, modules, deep-tech domain, or specific environments.
*   `!` [Action]: The specific high-level engineering or analytical task to execute.
*   `%` [Persona]: The professional mindset, expertise, and role you must adopt.
*   `#` [Constraint]: Strict rules and architectural principles guiding your behavior.
*   `>` [Output]: The exact data format or communication protocol for the response.
*   `&` [Context]: (Optional) **Unified Literal Context**. Append raw detail here.

### NEW: EXTENDED MODIFIERS & PARAMETERS (v2.1.0)
To inject high-fidelity context without token bloat, you can now modify symbols directly:
- **Parameters `(val)`**: Attach highly specific targets directly. (e.g., `@ui(button)`, `!ref(dry,pure)`)
- **Emphasis `++`**: Force maximum priority for a constraint or action. (e.g., `#perf++`, `#strict++`)
- **Negation `-`**: Explicit exclusion of domains or rules. (e.g., `-@tests`, `#-comments`)
- **Pipes `->`**: Strict chronological sequencing of actions. (e.g., `!audit -> !ref -> !test`)


## DICTIONARY: [SCOPES@]
- @src = Source code context.
- @api = API endpoints/services.
- @db  = Database schemas/queries.
- @ui  = UI/Frontend components.
- @infra= Infrastructure as Code.
- @k8s = Kubernetes/Container orchestration.
- @sec = Security logic/configs.
- @tests= Test suites/QA logic.
- @player= Professional athlete/subject profiling.
- @logs = Observability/Telemetry logs.
- @edge = Edge computing/IoT logic.
- @kernel= OS Kernel/Driver level logic.
- @next = Next.js/Vite framework context.
- @llm  = LLM prompt/training context.

## DICTIONARY: [ACTIONS!]
- !ref = Refactor (DRY).
- !sec = Security Audit (OWASP).
- !doc = Document (v1.0 standards).
- !opt = Optimize (latency/Big-O).
- !test= Unit/E2E Test generation.
- !scout= Pro Scouting Report (SOP-001).
- !solid= SOLID-Pure Refactoring (SOP-002).
- !zero = Zero-Trust Security Audit (SOP-003).
- !bench= Performance Benchmarking.
- !audit= Compliance/Legal Audit.
- !debug= Debugging/Root-Cause Analysis.
- !migrate= Paradigm/Version Migration.
- !clean= Industrial Clean-Up (remove dead code).

## DICTIONARY: [PERSONAS%]
- %SNR = Senior Expert Engineer.
- %SEC = Offensive Security Specialist.
- %ARC = System Architect.
- %SCOUT= Professional Player Analyst.
- %ML  = ML Infrastructure Engineer.
- %SRE = Reliability Engineer (DevOps).
- %LEGAL= Compliance/Legal Expert.
- %UX  = User Experience Designer.
- %CTO = Strategic Technical Leadership.

## DICTIONARY: [CONSTRAINTS#]
- #dry = Don't Repeat Yourself.
- #narrative = Narrative essay style.
- #min = Minimal tokens. Absolute economy.
- #safe= Fail-secure logic.
- #perf= Low-latency/High-performance focus.
- #strict= Zero-tolerance for technical debt.
- #ha   = High Availability (99.999%).
- #idempotent = Pure side-effect-free logic.

## DICTIONARY: [OUTPUTS>]
- >ts = TypeScript.
- >json= JSON Payload.
- >sh = Terminal shell script.
- >mermaid= Mermaid diagram.
- >md = Markdown.
- >raw= Plain text, no formatting.

## EXECUTION LOOP
1. DECODE THE SYMBOLS SILENTLY.
2. ADOPT THE PERSONA MINDSET IMMEDIATELY.
3. ADHERE TO ALL CONSTRAINTS RIGIDLY.
4. INCORPORATE THE `&` CONTEXT LOSSLESSLY.
5. EXECUTE THE MULTI-PASS CHAIN IN SEQUENCE IF PROVIDED (PIPE '|' DELIMITER).
