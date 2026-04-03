# LESS TOKEN LANGUAGE (LTL)
[Status: Core Spec — INDUSTRIAL GRADE]
[Engine: LTL Specification Interpreter]

## MISSION
LTL is a deterministic prompt programming language designed to maximize semantic density and instructional fidelity. It bridges the gap between natural language intuition and machine-readable logic.

---

## 1. THE SIGILS
| Sigil | Name | Description |
|---|---|---|
| `@` | Scope | Domain / context / section boundary |
| `!` | Action | Imperative operation |
| `%` | Persona | Role, voice, agent definition |
| `#` | Constraint | Hard rule — forbidden or required |
| `>` | Output | Shape, format, length, structure of response |
| `~` | State | Current condition, session state |
| `?` | Query/Branch | Ambiguity flag, conditional, try/catch |
| `->` | Flow | Sequential step, pipeline, chain |
| `&&` | Combine | Parallel, additive, simultaneous |
| `//` | Comment | Internal note, never rendered |
| `<<` | Inject | Context input — text, file, url, data, prior |
| `>>` | Mode/Style | Output mode, style directive, register |
| `$` | Variable | Declared value, user input binding, enum |
| `:` | Template | Block declaration |
| `!run` | Execute | Run a named template |
| `!meta` | Self-ref | LTL operating on itself |
| `!!` | Debug | Trace, validate, diff, explain |
| `!assert` | Quality | Validation rule / Quality gate assertion |
| `&` | Context | Unified Context Operator — binds raw literal data |

---

## 2. LITERAL PRECISION
To target specific identifiers with zero information loss, use the `[Symbol](Literal)` syntax:
```ltl
@subject: [path]("/usr/bin/local")
$version = [semver]("v2.1.4-beta")
%persona: [expert](MLOps)
```
| Matcher | Description |
|---|---|
| `[path]` | File or directory path |
| `[semver]` | Semantic versioning |
| `[url]` | Universal Resource Locator |
| `[id]` | Unique identifier / UUID |
| `[raw]` | Verbatim string literal |

---

## 3. THE PROGRAMMING LAYER

### VARIABLES ($)
```ltl
$var = value                    // hardcoded
$var = {{input}}                // bound to user input field
$var = [optionA | optionB]      // enum — user picks from dropdown
$var = ?                        // required, must be filled before run
$var = null                     // optional, skip if empty
```

### PERSONA & SCOPE (%)
```ltl
%"string"                       // verbatim role instruction
%auto                           // infer best persona from @domain
@domain: value                  // sets context domain
@domain: auto                   // infer from subject
@subject: $var                  // binds subject to variable
@context: "string"              // additional background the AI needs
```

### INTENT DETECTION (!)
```ltl
!intent: explain                // explain a concept
!intent: create                 // generate new content
!intent: analyse                // analyse existing content
!intent: rewrite                // transform existing content
!intent: compare                // compare two or more things
!intent: instruct               // step-by-step instructions
!intent: summarise              // condense existing content
!intent: evaluate               // judge / score / grade
!intent: brainstorm             // generate options / ideas
!intent: converse               // open-ended dialogue
!intent: extract                // pull structured data from text
!intent: translate              // language or format conversion
!intent: auto                   // infer from prompt
```

### DOMAIN TAGS (@)
```ltl
// Universal tag vocabularies:
@analysis -> strengths, weaknesses, patterns, trends, anomalies, root-cause, context, implications
@creative -> tone, voice, structure, arc, tension, character, setting, pacing, imagery
@technical -> architecture, implementation, edge-cases, performance, security, scalability
@communication -> intent, audience, clarity, persuasion, tone, formality, length
@evaluation -> criteria, evidence, judgement, grade, recommendation
```

### STRUCTURE (>)
```ltl
>structure: auto                // infer sections from intent + domain
>structure: flat                // no sections, single continuous output
>structure: custom              // use explicit @section blocks below

>structure:
  @section "Exact Heading"
    >depth:N                    // 1=sentence 2=short para 3=full para 4=exhaustive
    >covers: [tag, tag, tag]    // what this section must address
    >tone: $tone                // override tone for this section
    >length: ~Nw                // word count
    #constraint
    ?if $var == x -> >depth:4

>heading: [exact | auto | none]
>style: [narrative | structured | bullets | table | code | mixed | auto]
>voice: ["description" | auto]
```

### CONSTRAINTS (#)
```ltl
#no: [x, y, z]                  // globally forbidden
#must: [x, y, z]                // globally required
#per-section: N-paragraph       // structure rule
#no-repetition: across-sections
#language: $lang                // output language
#audience: $audience            // calibrate complexity
```

### OUTPUT RULES (>)
```ltl
>length: [~Nw | ~Nw total | auto]
>format: $format                // prose / markdown / json / bullet / table / code
>must-include: [x, y, z]
>must-exclude: [x, y, z]
```

### SCALES & GRADES (>)
```ltl
>scale: [A+ | A | B | C | D]    // select-one grade
>scale: [1 | 2 | 3 | 4 | 5]
>scale: $var
#scale-implicit                 // no inline justification
#scale-explicit                 // require justification
```

---

## 3. ADVANCED LOGIC

### TEMPLATES (:)
```ltl
:template name ($var1, $var2, ...)
  // full LTL program
:end

!run name $var1=value           // run with bindings
!run auto                       // infer best template
```

### CONDITIONALS (?)
```ltl
?if $var == value  -> !action
?if $depth >= 3    -> >must-include: [recommendation]
?else              -> !action
?elif $var == x    -> !action
```

### LOOPS (!)
```ltl
!foreach @section in >structure -> |>depth:$depth && |#constraint
!foreach $item in [a, b, c]    -> !action
!repeat:N -> !refine
```

### PIPES (->)
```ltl
!action -> |filter #constraint -> |format >output
```

---

## 4. EXECUTION MODES (>>)
```ltl
>>draft     // fast, rough
>>final     // complete and polished
>>diff      // show delta
>>stream    // section by section
>>silent    // reasoning only
>>compress  // output in LTL syntax
```

---

## 5. DEBUG & QA (!!)
```ltl
!!trace     // show reasoning
!!tokens    // token count
!!validate  // check !assert rules
!!why       // explain logic
```

---

## 6. AUTO-PARSER PATTERNS
| NL Pattern | LTL Construct |
|---|---|
| "You are a X" | `%"X"` |
| "Your task is to X" | `!intent + !action` |
| "For the following X" | `<<text + @subject` |
| "Do not X" | `#no: [X]` |
| "In the style of X" | `>>style: "X"` |
| "Show me then continue" | `>>pause: after @section` |
| "Check your work" | `!!validate && !refine` |
