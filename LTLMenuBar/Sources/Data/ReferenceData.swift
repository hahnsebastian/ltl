import Foundation

struct LTLReferenceItem: Identifiable, Hashable {
    let id = UUID()
    let syntax: String
    let name: String
    let description: String
    let example: String
}

struct LTLSection: Identifiable {
    let id = UUID()
    let title: String
    let items: [LTLReferenceItem]
}

struct ReferenceData {
    static let sections: [LTLSection] = [
        LTLSection(title: "Sigils", items: [
            LTLReferenceItem(syntax: "@", name: "Scope", description: "Defines the domain, subject, or context of the prompt.", example: "@domain:finance"),
            LTLReferenceItem(syntax: "!", name: "Action", description: "Specifies a direct command or intent.", example: "!intent:summarise"),
            LTLReferenceItem(syntax: "%", name: "Persona", description: "Sets the persona or role the AI should adopt.", example: "%\"Senior Architect\""),
            LTLReferenceItem(syntax: "#", name: "Constraint", description: "Defines negative or positive constraints.", example: "#no:repetition"),
            LTLReferenceItem(syntax: ">", name: "Structure", description: "Directs the output format, style, or length.", example: ">format:table"),
            LTLReferenceItem(syntax: "~", name: "Estimation", description: "Requests an estimation or heuristic value.", example: "~token-count"),
            LTLReferenceItem(syntax: "?", name: "Input/Logic", description: "Used for variables or conditional logic.", example: "$var = ?"),
            LTLReferenceItem(syntax: "->", name: "Pipe", description: "Flows output into another filter or format.", example: "-> |filter"),
            LTLReferenceItem(syntax: "&&", name: "Chain", description: "Combines multiple actions or constraints.", example: "!action1 && !action2"),
            LTLReferenceItem(syntax: "//", name: "Comment", description: "Inline or block comments (ignored by engine).", example: "// This is a comment"),
            LTLReferenceItem(syntax: "<<", name: "Inject", description: "Injects external context or file content.", example: "<< [path](/src/main.rs)"),
            LTLReferenceItem(syntax: ">>", name: "Execution", description: "Sets the execution mode (draft, stream, etc.).", example: ">>stream"),
            LTLReferenceItem(syntax: "$", name: "Variable", description: "Declares or references a variable.", example: "$topic = \"AI\""),
            LTLReferenceItem(syntax: ":", name: "Template", description: "Defines or ends a template block.", example: ":template name(...)"),
            LTLReferenceItem(syntax: "!run", name: "Execute Template", description: "Runs a previously defined template.", example: "!run myTemplate"),
            LTLReferenceItem(syntax: "!meta", name: "Metadata", description: "Defines metadata for the LTL prompt.", example: "!meta version: 2.0"),
            LTLReferenceItem(syntax: "!!", name: "Debug", description: "Execution debug or QA directives.", example: "!!trace"),
            LTLReferenceItem(syntax: "!assert", name: "Assertion", description: "Validates a condition during execution.", example: "!assert length < 500"),
            LTLReferenceItem(syntax: "&", name: "Reference", description: "References a block or section.", example: "&section1")
        ]),
        LTLSection(title: "Variables", items: [
            LTLReferenceItem(syntax: "$var = value", name: "Direct Assignment", description: "Assigns a literal value to a variable.", example: "$model = \"GPT-4\""),
            LTLReferenceItem(syntax: "$var = {{input}}", name: "Template Input", description: "Placeholder for runtime input.", example: "$user = {{name}}"),
            LTLReferenceItem(syntax: "$var = [optA | optB]", name: "Option Selection", description: "Defines a list of possible values.", example: "$color = [red | blue]"),
            LTLReferenceItem(syntax: "$var = ?", name: "User Prompt", description: "Requests input from the user during assembly.", example: "$api_key = ?"),
            LTLReferenceItem(syntax: "$var = null", name: "Nullification", description: "Clears or sets a variable to null.", example: "$temp = null")
        ]),
        LTLSection(title: "Persona & Scope", items: [
            LTLReferenceItem(syntax: "%\"string\"", name: "Explicit Persona", description: "Sets a custom persona string.", example: "%\"Cybersecurity Expert\""),
            LTLReferenceItem(syntax: "%auto", name: "Auto Persona", description: "AI selects the most appropriate persona.", example: "%auto"),
            LTLReferenceItem(syntax: "@domain:", name: "Domain Scope", description: "Sets the broad field of knowledge.", example: "@domain:technical"),
            LTLReferenceItem(syntax: "@subject:", name: "Subject Scope", description: "Sets the specific topic.", example: "@subject:rust-ownership"),
            LTLReferenceItem(syntax: "@context:", name: "Context Scope", description: "Sets the background context.", example: "@context:legacy-migration")
        ]),
        LTLSection(title: "Intent Tags", items: [
            LTLReferenceItem(syntax: "!intent:explain", name: "Explain", description: "Clarify a concept.", example: "!intent:explain"),
            LTLReferenceItem(syntax: "!intent:create", name: "Create", description: "Generate new content.", example: "!intent:create"),
            LTLReferenceItem(syntax: "!intent:analyse", name: "Analyse", description: "Deep dive into data/logic.", example: "!intent:analyse"),
            LTLReferenceItem(syntax: "!intent:rewrite", name: "Rewrite", description: "Modify existing text.", example: "!intent:rewrite"),
            LTLReferenceItem(syntax: "!intent:compare", name: "Compare", description: "Find differences/similarities.", example: "!intent:compare"),
            LTLReferenceItem(syntax: "!intent:instruct", name: "Instruct", description: "Provide step-by-step guidance.", example: "!intent:instruct"),
            LTLReferenceItem(syntax: "!intent:summarise", name: "Summarise", description: "Condense information.", example: "!intent:summarise"),
            LTLReferenceItem(syntax: "!intent:evaluate", name: "Evaluate", description: "Assess quality or value.", example: "!intent:evaluate"),
            LTLReferenceItem(syntax: "!intent:brainstorm", name: "Brainstorm", description: "Generate multiple ideas.", example: "!intent:brainstorm"),
            LTLReferenceItem(syntax: "!intent:converse", name: "Converse", description: "Natural chat interaction.", example: "!intent:converse"),
            LTLReferenceItem(syntax: "!intent:extract", name: "Extract", description: "Pull specific data points.", example: "!intent:extract"),
            LTLReferenceItem(syntax: "!intent:translate", name: "Translate", description: "Change language or format.", example: "!intent:translate"),
            LTLReferenceItem(syntax: "!intent:auto", name: "Auto Intent", description: "AI determines the best intent.", example: "!intent:auto")
        ]),
        LTLSection(title: "Domain Tags", items: [
            LTLReferenceItem(syntax: "@analysis", name: "Analysis", description: "Expand with analytic vocabulary.", example: "@analysis"),
            LTLReferenceItem(syntax: "@creative", name: "Creative", description: "Expand with creative vocabulary.", example: "@creative"),
            LTLReferenceItem(syntax: "@technical", name: "Technical", description: "Expand with technical vocabulary.", example: "@technical"),
            LTLReferenceItem(syntax: "@communication", name: "Communication", description: "Expand with communication vocabulary.", example: "@communication"),
            LTLReferenceItem(syntax: "@evaluation", name: "Evaluation", description: "Expand with evaluation vocabulary.", example: "@evaluation")
        ]),
        LTLSection(title: "Structure & Output", items: [
            LTLReferenceItem(syntax: ">structure:", name: "Structure", description: "Define logical flow.", example: ">structure:pyramid"),
            LTLReferenceItem(syntax: ">heading:", name: "Heading", description: "Specify header style.", example: ">heading:minimal"),
            LTLReferenceItem(syntax: ">style:", name: "Style", description: "Set the prose style.", example: ">style:brutalist"),
            LTLReferenceItem(syntax: ">voice:", name: "Voice", description: "Set the tone of voice.", example: ">voice:authoritative"),
            LTLReferenceItem(syntax: ">length:", name: "Length", description: "Constraint on output size.", example: ">length:short"),
            LTLReferenceItem(syntax: ">format:", name: "Format", description: "Set the output format.", example: ">format:json"),
            LTLReferenceItem(syntax: ">must-include:", name: "Must Include", description: "Required elements.", example: ">must-include:benchmarks"),
            LTLReferenceItem(syntax: ">must-exclude:", name: "Must Exclude", description: "Forbidden elements.", example: ">must-exclude:jargon")
        ]),
        LTLSection(title: "Constraints", items: [
            LTLReferenceItem(syntax: "#no:", name: "Negative Constraint", description: "What to avoid.", example: "#no:preamble"),
            LTLReferenceItem(syntax: "#must:", name: "Positive Constraint", description: "What is required.", example: "#must:code-snippets"),
            LTLReferenceItem(syntax: "#per-section:", name: "Per Section", description: "Rules for each section.", example: "#per-section:one-diagram"),
            LTLReferenceItem(syntax: "#no-repetition:", name: "No Repetition", description: "Avoid repeating ideas.", example: "#no-repetition"),
            LTLReferenceItem(syntax: "#language:", name: "Language", description: "Specify target language.", example: "#language:german"),
            LTLReferenceItem(syntax: "#audience:", name: "Audience", description: "Define the target reader.", example: "#audience:executives")
        ]),
        LTLSection(title: "Logic", items: [
            LTLReferenceItem(syntax: ":template name(...) ... :end", name: "Template", description: "Define reusable blocks.", example: ":template card(title) >style:bold :end"),
            LTLReferenceItem(syntax: "?if / ?elif / ?else", name: "Conditionals", description: "Logical branching.", example: "?if $debug !!trace ?else >>silent"),
            LTLReferenceItem(syntax: "!foreach", name: "Foreach Loop", description: "Iterate over a list.", example: "!foreach $item in $list"),
            LTLReferenceItem(syntax: "!repeat:N", name: "Repeat Loop", description: "Repeat a block N times.", example: "!repeat:3"),
            LTLReferenceItem(syntax: "-> |filter", name: "Pipes", description: "Process output further.", example: "-> |json-validate")
        ]),
        LTLSection(title: "Execution Modes", items: [
            LTLReferenceItem(syntax: ">>draft", name: "Draft", description: "Fast, low-fidelity output.", example: ">>draft"),
            LTLReferenceItem(syntax: ">>final", name: "Final", description: "High-fidelity, polished output.", example: ">>final"),
            LTLReferenceItem(syntax: ">>diff", name: "Diff", description: "Show changes between versions.", example: ">>diff"),
            LTLReferenceItem(syntax: ">>stream", name: "Stream", description: "Real-time incremental output.", example: ">>stream"),
            LTLReferenceItem(syntax: ">>silent", name: "Silent", description: "Process without UI output.", example: ">>silent"),
            LTLReferenceItem(syntax: ">>compress", name: "Compress", description: "Aggressive token reduction.", example: ">>compress")
        ]),
        LTLSection(title: "Debug & QA", items: [
            LTLReferenceItem(syntax: "!!trace", name: "Trace", description: "Show execution steps.", example: "!!trace"),
            LTLReferenceItem(syntax: "!!tokens", name: "Tokens", description: "Show token usage breakdown.", example: "!!tokens"),
            LTLReferenceItem(syntax: "!!validate", name: "Validate", description: "Run schema validation.", example: "!!validate"),
            LTLReferenceItem(syntax: "!!why", name: "Rationale", description: "Explain AI reasoning.", example: "!!why")
        ]),
        LTLSection(title: "Auto-Parser Patterns", items: [
            LTLReferenceItem(syntax: "\"as a ...\"", name: "Role Mapping", description: "Maps to % Persona.", example: "\"as a dev\" -> %dev"),
            LTLReferenceItem(syntax: "\"write a ...\"", name: "Action Mapping", description: "Maps to !intent:create.", example: "\"write a post\" -> !intent:create"),
            LTLReferenceItem(syntax: "\"don't use ...\"", name: "No Mapping", description: "Maps to #no:.", example: "\"don't use jargon\" -> #no:jargon"),
            LTLReferenceItem(syntax: "\"in the style of ...\"", name: "Style Mapping", description: "Maps to >style:.", example: "\"in the style of Hemingway\" -> >style:hemingway")
        ]),
        LTLSection(title: "Literal Matchers", items: [
            LTLReferenceItem(syntax: "[path](...)", name: "Path", description: "Reference local or remote files.", example: "[path](/etc/config.yaml)"),
            LTLReferenceItem(syntax: "[semver](...)", name: "SemVer", description: "Match version strings.", example: "[semver](^1.2.0)"),
            LTLReferenceItem(syntax: "[url](...)", name: "URL", description: "External web resource.", example: "[url](https://ltl.spec)"),
            LTLReferenceItem(syntax: "[id](...)", name: "Identifier", description: "Unique database or object ID.", example: "[id](uuid-v4-...)"),
            LTLReferenceItem(syntax: "[raw](...)", name: "Raw Data", description: "Unprocessed string literal.", example: "[raw](binary_data...)")
        ])
    ]
    
    static let domainExpansions: [String: [String]] = [
        "@analysis": ["quantify", "correlate", "extrapolate", "variance", "outlier", "heuristic", "bias-check", "systemic"],
        "@creative": ["evocative", "nonlinear", "metaphorical", "visceral", "liminal", "avant-garde", "resonance"],
        "@technical": ["idempotent", "stateless", "concurrency", "optimization", "latency", "schema", "abstraction", "refactor"],
        "@communication": ["concise", "empathetic", "persuasive", "clarity", "context-aware", "tonal-alignment", "active-listening"],
        "@evaluation": ["efficacy", "compliance", "benchmark", "rigor", "alignment", "fidelity", "robustness", "vulnerability"]
    ]
}
