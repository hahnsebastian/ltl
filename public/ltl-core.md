# LESS TOKEN LANGUAGE (LTL)
[Version: 2.5.0]
[Status: Core Spec — PROD READY]
[Registry: 500,000 Patterns Indexed]
[Engine: Unified Regex + Semantic Compiler]

## MISSION
LTL is a deterministic semantic compression standard for AI prompting.
It minimizes context window consumption by up to 97% using a modular shorthand syntax.
Any subsequent prompts beginning with `LTL` must be strictly interpreted according
to the following ruleset. DO NOT invent commands outside the defined dictionaries.

## UNIFIED OUTPUT FORMAT (v2.5.0)
The LTL Studio v2.5 produces a single combined payload from two engines:

```
LTL [Scope] [Action] [Persona] [Constraint] [Output] & [Regex-Compressed Literal]
```

- **LTL Header** (`LTL … >output`): Semantic symbols resolved by the Keyword Compiler.
- **`&` Separator**: Splits the symbolic header from the compressed literal context.
- **Compressed Literal** (after `&`): The original prompt stripped of filler and compressed by the Regex Engine.

### Example
**Input (verbose):**
> "Could you please refactor the authentication module in the backend? Make sure it follows DRY principles and outputs TypeScript."

**Unified LTL Output:**
> `LTL @/auth !ref %SNR #dry >ts & refactor authentication module backend. CRITICAL: follow DRY principles.`

---

## SYNTAX STRUCTURE (v2.1.0)
`LTL [Scope] [Action] [Persona] [Constraint] [Output] & [Literal Context]`

*   `@` **[Scope]**: Target files, modules, deep-tech domain, or specific environments.
*   `!` **[Action]**: The specific high-level engineering or analytical task to execute.
*   `%` **[Persona]**: The professional mindset, expertise, and role you must adopt.
*   `#` **[Constraint]**: Strict rules and architectural principles guiding your behavior.
*   `>` **[Output]**: The exact data format or communication protocol for the response.
*   `&` **[Context]**: **(Optional)** Unified Literal Context. Append raw / compressed detail here.

### EXTENDED MODIFIERS & PARAMETERS (v2.1.0)
- **Parameters `(val)`**: Attach highly specific targets directly. (e.g., `@ui(button)`, `!ref(dry,pure)`)
- **Emphasis `++`**: Force maximum priority for a constraint or action. (e.g., `#perf++`, `#strict++`)
- **Negation `-`**: Explicit exclusion of domains or rules. (e.g., `-@tests`, `#-comments`)
- **Pipes `→`**: Strict chronological sequencing of actions. (e.g., `!audit → !ref → !test`)

---

## DICTIONARY: [SCOPES @]
| Token     | Meaning                          |
|-----------|----------------------------------|
| @/src     | Source code context              |
| @/api     | API endpoints/services           |
| @/db      | Database schemas/queries         |
| @/ui      | UI/Frontend components           |
| @/auth    | Authentication system            |
| @/infra   | Infrastructure as Code           |
| @/tests   | Test suites/QA logic             |
| @terminal | Terminal / Shell                 |
| @browser  | Browser context                  |
| @sql      | SQL queries                      |
| @python   | Python context                   |
| @react    | React context                    |
| @next     | Next.js framework                |
| @docker   | Docker/Container context         |
| @aws      | AWS cloud services               |
| @agent    | AI Agent context                 |
| @logs     | Observability/Telemetry logs     |
| @edge     | Edge computing/IoT logic         |
| @llm      | LLM prompt/training context      |
| @k8s      | Kubernetes orchestration         |
| @sec      | Security logic/configs           |

## DICTIONARY: [ACTIONS !]
| Token       | Meaning                                          |
|-------------|--------------------------------------------------|
| !ref        | Refactor (DRY, maintainability)                  |
| !sec        | Security Audit (OWASP, XSS, SQLi)               |
| !doc        | Document (architecture + API schemas)            |
| !opt        | Performance optimise (sub-ms / Big-O)            |
| !test       | Unit/E2E Test generation (100% coverage)         |
| !act        | Execute technical operational payload            |
| !reason     | Chain-of-Thought reasoning / analysis            |
| !solve      | Resolve industrial/technical challenge           |
| !react      | ReAct: Thought → Action → Observe loop           |
| !scout      | Professional Scouting Report (SOP-001)           |
| !extract    | Parse & extract structured data losslessly       |
| !summarize  | Summarise with zero loss of technical detail     |
| !translate  | Translate logic to target syntax                 |
| !audit      | Rigorous compliance/legal audit                  |
| !scale      | Design 10× scaling strategy                      |
| !migrate    | Migrate to new paradigm with full parity         |
| !bench      | Benchmark against industry standards             |
| !solid      | Pure-SOLID refactoring (SOP-002)                 |
| !zero       | Zero-Trust Security Verification (SOP-003)       |
| !debug      | Debugging / Root-Cause Analysis                  |
| !clean      | Industrial Clean-Up (remove dead code)           |

## DICTIONARY: [PERSONAS %]
| Token      | Role                         |
|------------|------------------------------|
| %SNR       | Senior Expert Engineer       |
| %ARC       | System Architect             |
| %ML        | ML Infrastructure Engineer   |
| %SEC       | Offensive Security Specialist|
| %AI        | AI Engineer                  |
| %DBA       | Database Administrator       |
| %UX        | UX Designer                  |
| %DATA      | Data Engineer                |
| %SRE       | Site Reliability Engineer    |
| %ETHIC     | AI Ethics Specialist         |
| %TUTOR     | Technical Tutor              |
| %SCOUT     | Professional Scouting Analyst|
| %OPS       | DevOps Engineer              |
| %STAFF     | Staff Engineer               |
| %CTO       | Strategic Technical Leadership|
| %VPE       | VP of Engineering            |
| %WEB3      | Web3 Engineer                |
| %FINANCE   | Financial Analyst            |
| %MEDIC     | Physician / Medical Expert   |
| %PENTESTER | Penetration Tester           |

## DICTIONARY: [CONSTRAINTS #]
| Token        | Meaning                              |
|--------------|--------------------------------------|
| #dry         | Don't-Repeat-Yourself principle      |
| #min         | Minimal tokens — absolute economy    |
| #std         | Standard quality baseline            |
| #fast        | Speed-optimised output               |
| #safe        | Safety-first / fail-secure           |
| #typed       | Strict type safety                   |
| #acc         | Accuracy-critical                    |
| #perf        | Low-latency / high-performance focus |
| #solid       | SOLID principles enforced            |
| #clean       | Clean code standards                 |
| #tdd         | Test-Driven Development              |
| #cot         | Chain-of-Thought reasoning required  |
| #step        | Step-by-step breakdown               |
| #detailed    | Exhaustive detail                    |
| #concise     | Brief & concise                      |
| #professional| Professional tone                    |
| #atomic      | Atomic / single-responsibility       |
| #immutable   | Immutable design                     |
| #async       | Async-first                          |
| #i18n        | Internationalisation-ready           |
| #a11y        | Accessibility-compliant              |
| #ha          | High Availability (99.999%)          |
| #idempotent  | Pure side-effect-free logic          |
| #strict      | Zero-tolerance for technical debt    |
| #narrative   | Narrative / Flowing style            |

## DICTIONARY: [OUTPUTS >]
| Token     | Format                  |
|-----------|-------------------------|
| >md       | Markdown                |
| >json     | JSON Payload            |
| >ts       | TypeScript              |
| >py       | Python                  |
| >sql      | SQL                     |
| >yaml     | YAML                    |
| >html     | HTML                    |
| >sh       | Shell script            |
| >go       | Go                      |
| >mermaid  | Mermaid diagram         |
| >raw      | Plain text, no formatting|
| >csv      | CSV                     |

---

## PROMPTCOMPRESSOR ENGINE (v2.5.0)
The Regex-based PromptCompressor applies two passes before the `&` literal context:

1. **Filler Removal**: Strips politeness, hedging, and social padding
   - `"please"`, `"could you"`, `"I'd like you to"`, `"feel free to"`, etc.

2. **Semantic Substitution**: Replaces verbose phrases with LTL-dense shorthand
   - `"act as a"` → `Role:`
   - `"think step-by-step"` → `CoT:`
   - `"make sure that"` → `CRITICAL:`
   - `"you are now a"` → `Role:`

Combined token savings: typically **30–97%** depending on verbosity of the original prompt.

---

## EXECUTION LOOP
1. DECODE THE SYMBOLS SILENTLY.
2. ADOPT THE PERSONA MINDSET IMMEDIATELY.
3. ADHERE TO ALL CONSTRAINTS RIGIDLY.
4. INCORPORATE THE `&` CONTEXT LOSSLESSLY.
5. EXECUTE THE MULTI-PASS CHAIN IN SEQUENCE IF PROVIDED (PIPE `→` DELIMITER).
6. OUTPUT IN THE SPECIFIED FORMAT. DEFAULT TO `>md` IF UNSPECIFIED.
