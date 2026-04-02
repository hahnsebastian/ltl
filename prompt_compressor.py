#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════╗
║   PromptCompressor v1.0  —  Less-Token-Language (LTL) Engine        ║
║   Converts verbose AI prompts into dense, token-efficient LTL        ║
║   shorthand. Integrates with the 500,000-pattern LTL Registry.      ║
╚══════════════════════════════════════════════════════════════════════╝

Usage (CLI):
    python prompt_compressor.py "Please act as a senior developer and
      think step by step. Make sure to refactor the code and it is
      important that you keep things DRY. Thank you!"

Usage (Python API):
    from prompt_compressor import PromptCompressor
    pc = PromptCompressor()
    result = pc.compress("Please explain your logic step by step...")
    print(result.ltl)
"""

import re
import sys
import json
from dataclasses import dataclass, field
from typing import Optional

# ─────────────────────────────────────────────────────────────────────
#  LTL VOCABULARY  (mirrors scripts/generate-db.js v1.8.2)
# ─────────────────────────────────────────────────────────────────────

LTL_ACTIONS: dict[str, str] = {
    "!ref":       "Refactor / resolve logic-debt & optimise maintainability",
    "!sec":       "Security audit — XSS, SQLi, Auth flaws",
    "!doc":       "Document — internal architecture + API schemas",
    "!opt":       "Performance optimise — sub-ms focus",
    "!test":      "Write 100 % coverage suite (unit + E2E)",
    "!act":       "Execute technical operational payload",
    "!reason":    "Execute CoT reasoning / analysis",
    "!solve":     "Resolve industrial/technical challenge",
    "!react":     "ReAct: Thought → Action → Observe loop",
    "!scout":     "Professional Scouting Protocol (SOP-001)",
    "!extract":   "Parse & extract structured data losslessly",
    "!summarize": "Summarise with zero loss of technical detail",
    "!translate": "Translate logic to target syntax",
    "!audit":     "Rigorous compliance audit",
    "!scale":     "Design 10× scaling strategy",
    "!migrate":   "Migrate to new paradigm with full parity",
    "!bench":     "Benchmark against industry standards",
    "!solid":     "Pure-SOLID refactoring (SOP-002)",
    "!zero":      "Zero-Trust Security Verification (SOP-003)",
}

LTL_PERSONAS: dict[str, str] = {
    "%SNR":      "Senior Dev",
    "%ARC":      "Architect",
    "%ML":       "ML Engineer",
    "%SEC":      "Security Eng",
    "%AI":       "AI Engineer",
    "%DBA":      "DB Admin",
    "%UX":       "UX Designer",
    "%DATA":     "Data Engineer",
    "%SRE":      "SRE",
    "%ETHIC":    "AI Ethics",
    "%TUTOR":    "Tutor",
    "%SCOUT":    "Scouting Analyst",
    "%OPS":      "DevOps Eng",
    "%STAFF":    "Staff Engineer",
    "%CTO":      "CTO",
    "%VPE":      "VPE",
    "%WEB3":     "Web3 Eng",
    "%FINANCE":  "Financial Analyst",
    "%MEDIC":    "Physician",
    "%PENTESTER":"Pen-Tester",
}

LTL_CONSTRAINTS: dict[str, str] = {
    "#dry":         "Don't-Repeat-Yourself principle",
    "#min":         "Minimal / concise output",
    "#std":         "Standard quality",
    "#fast":        "Speed-optimised",
    "#safe":        "Safety-first",
    "#typed":       "Strict type safety",
    "#acc":         "Accuracy-critical",
    "#perf":        "Performance-critical",
    "#solid":       "SOLID principles",
    "#clean":       "Clean code standards",
    "#tdd":         "Test-Driven Development",
    "#cot":         "Chain-of-Thought reasoning",
    "#step":        "Step-by-step breakdown",
    "#detailed":    "Exhaustive detail",
    "#concise":     "Brief & concise",
    "#professional":"Professional tone",
    "#atomic":      "Atomic / single-responsibility",
    "#immutable":   "Immutable design",
    "#async":       "Async-first",
    "#i18n":        "Internationalisation-ready",
    "#a11y":        "Accessibility-compliant",
}

LTL_SCOPES: dict[str, str] = {
    "@/src":        "Source code",
    "@/api":        "API layer",
    "@/db":         "Database",
    "@/ui":         "User interface",
    "@/auth":       "Auth system",
    "@/tests":      "Test suite",
    "@/infra":      "Infrastructure",
    "@terminal":    "Terminal / Shell",
    "@browser":     "Browser",
    "@sql":         "SQL",
    "@python":      "Python",
    "@react":       "React",
    "@next":        "Next.js",
    "@docker":      "Docker",
    "@aws":         "AWS",
    "@agent":       "AI Agent",
}

LTL_OUTPUTS: dict[str, str] = {
    ">md":      "Markdown",
    ">json":    "JSON",
    ">ts":      "TypeScript",
    ">py":      "Python",
    ">sql":     "SQL",
    ">yaml":    "YAML",
    ">html":    "HTML",
    ">sh":      "Shell script",
    ">go":      "Go",
    ">mermaid": "Mermaid diagram",
}

# ─────────────────────────────────────────────────────────────────────
#  PHASE 1 — POLITENESS & FILLER ERASURE
#  Remove tokens that carry zero semantic payload.
# ─────────────────────────────────────────────────────────────────────

FILLER_PATTERNS: list[tuple[str, str]] = [
    # Polite openers / closers
    (r"\bplease\b[\s,]*",                                   ""),
    (r"\bthank\s+you\b[\s,.!]*",                            ""),
    (r"\bthanks\b[\s,.!]*",                                 ""),
    (r"\bif\s+you\s+don['']t\s+mind\b[\s,]*",              ""),
    (r"\bif\s+possible\b[\s,]*",                            ""),
    (r"\bwould\s+you\s+(?:be\s+able\s+to|mind)\b[\s,]*",   ""),
    (r"\bcould\s+you\s+(?:please\s+)?",                     ""),
    (r"\bI['']d\s+(?:really\s+)?(?:like|appreciate|love)\s+(?:it\s+if\s+(?:you\s+)?(?:could\s+)?)?", ""),
    (r"\bI\s+want\s+you\s+to\b[\s]*",                      ""),
    (r"\bI\s+need\s+you\s+to\b[\s]*",                      ""),
    (r"\bcan\s+you\s+(?:please\s+)?",                       ""),
    (r"\bwill\s+you\s+(?:please\s+)?",                      ""),
    (r"\bas\s+a\s+helpful\s+assistant\b[\s,]*",             ""),
    (r"\busing\s+your\s+expertise\b[\s,]*",                 ""),
    (r"\bin\s+your\s+expert\s+opinion\b[\s,]*",             ""),
    (r"\bfeel\s+free\s+to\b[\s]*",                         ""),
    (r"\bgo\s+ahead\s+and\b[\s]*",                         ""),
    (r"\bif\s+you\s+could\b[\s]*",                         ""),
]

# ─────────────────────────────────────────────────────────────────────
#  PHASE 2 — SEMANTIC COMPRESSION
#  Replace verbose phrasing with dense LTL tokens.
# ─────────────────────────────────────────────────────────────────────

SEMANTIC_PATTERNS: list[tuple[str, str]] = [

    # ── ROLE ASSIGNMENTS ──────────────────────────────────────────────
    (r"\bact\s+as\s+(?:an?\s+)?",                           "Role:"),
    (r"\byou\s+are\s+now\s+(?:an?\s+)?",                   "Role:"),
    (r"\bbehave\s+as\s+(?:an?\s+)?",                        "Role:"),
    (r"\bpretend\s+(?:to\s+be|you\s+are)\s+(?:an?\s+)?",   "Role:"),
    (r"\byou\s+(?:will\s+)?serve\s+as\s+(?:an?\s+)?",      "Role:"),
    (r"\byou\s+are\s+(?:an?\s+)?expert\s+",                 "Role:expert-"),

    # ── REASONING / CoT ───────────────────────────────────────────────
    (r"\bthink\s+(?:this\s+through\s+)?step[\s-]+by[\s-]+step\b",  "CoT:"),
    (r"\bexplain\s+your\s+(?:reasoning|logic|thought\s+process)\b","CoT:"),
    (r"\bwalk\s+(?:me\s+)?through\s+(?:your\s+)?(?:reasoning|thought process|logic)\b", "CoT:"),
    (r"\breason\s+through\s+(?:this|it)\b",                 "CoT:"),
    (r"\blet['']s\s+think\s+(?:about\s+this\s+)?(?:carefully|step\s+by\s+step)?\b", "CoT:"),
    (r"\bshow\s+your\s+work\b",                             "CoT:"),
    (r"\bbreak\s+(?:this\s+)?(?:down\s+)?(?:into\s+steps)?\b",     "CoT:"),

    # ── CONSTRAINT MARKERS ────────────────────────────────────────────
    (r"\b(?:make\s+sure\s+(?:to|that)?|ensure\s+(?:that)?)\b[\s]*",        "CRITICAL:"),
    (r"\bit\s+is\s+(?:absolutely\s+)?(?:important|essential|critical|crucial)\s+(?:that\s+)?", "CRITICAL:"),
    (r"\byou\s+must\b[\s]*",                                "CRITICAL:"),
    (r"\bdo\s+not\s+forget\s+to\b[\s]*",                   "CRITICAL:"),
    (r"\bbe\s+sure\s+to\b[\s]*",                            "CRITICAL:"),
    (r"\bnever\s+(?:ever\s+)?",                             "CONSTRAINT:never "),
    (r"\balways\b[\s]+(?=\w)",                              "CONSTRAINT:always "),

    # ── OUTPUT FORMAT MARKERS ─────────────────────────────────────────
    (r"\bprovide\s+(?:a\s+)?(?:your\s+)?(?:response\s+)?(?:in\s+)?(?:the\s+)?format\s+of\b[\s]*", "FMT:"),
    (r"\boutput\s+(?:should\s+be\s+)?(?:in\s+)?(?:the\s+format\s+of\s+)?",   "FMT:"),
    (r"\bformat\s+(?:your\s+)?(?:response\s+)?as\b[\s]*",  "FMT:"),
    (r"\bwrite\s+(?:this\s+)?(?:as\s+(?:a\s+)?)?(?:in\s+)?",               "FMT:"),
    (r"\brespond\s+(?:only\s+)?(?:in|with|using)\b[\s]*",  "FMT:"),

    # ── SCOPE / CONTEXT MARKERS ───────────────────────────────────────
    (r"\bin\s+the\s+context\s+of\b[\s]*",                  "CTX:"),
    (r"\bwith\s+respect\s+to\b[\s]*",                      "CTX:"),
    (r"\bregarding\b[\s]*",                                 "CTX:"),
    (r"\bwhen\s+it\s+comes\s+to\b[\s]*",                   "CTX:"),
    (r"\bfor\s+the\s+purpose\s+of\b[\s]*",                 "CTX:"),

    # ── QUALITY / ACCURACY MARKERS ────────────────────────────────────
    (r"\b(?:be\s+)?(?:as\s+)?(?:accurate|precise|exact|correct)\s+as\s+possible\b", "QUAL:precise"),
    (r"\bwith\s+(?:high\s+)?(?:accuracy|precision)\b",     "QUAL:precise"),
    (r"\babove\s+all\s+(?:else\s+)?(?:be|ensure|make\s+sure)?\b",         "PRIORITY:"),

    # ── PERSONA-SPECIFIC SHORTHAND (LTL Registry) ─────────────────────
    (r"\bsenior\s+(?:software\s+)?developer\b",             "%SNR"),
    (r"\bsoftware\s+architect\b",                           "%ARC"),
    (r"\bml\s+engineer\b",                                  "%ML"),
    (r"\bmachine\s+learning\s+engineer\b",                  "%ML"),
    (r"\bsecurity\s+engineer\b",                            "%SEC"),
    (r"\bai\s+engineer\b",                                  "%AI"),
    (r"\bdatabase\s+admin(?:istrator)?\b",                  "%DBA"),
    (r"\bux\s+designer\b",                                  "%UX"),
    (r"\bdata\s+engineer\b",                                "%DATA"),
    (r"\bsite\s+reliability\s+engineer\b",                  "%SRE"),
    (r"\bdevops\s+engineer\b",                              "%OPS"),
    (r"\bstaff\s+engineer\b",                               "%STAFF"),
    (r"\bpen[\s-]tester\b",                                 "%PENTESTER"),
    (r"\bfinancial\s+analyst\b",                            "%FINANCE"),
    (r"\bphysician\b",                                      "%MEDIC"),

    # ── COMMON ACTION VERB COMPRESSION ────────────────────────────────
    (r"\brefactor\s+(?:the\s+)?(?:following\s+)?(?:code|codebase|function|module)\b",  "!ref"),
    (r"\bperform\s+a\s+security\s+audit\b",                 "!sec"),
    (r"\bwrite\s+(?:a\s+)?(?:comprehensive\s+)?(?:full\s+)?test(?:s)?\b",              "!test"),
    (r"\boptimize\s+(?:for\s+)?performance\b",              "!opt"),
    (r"\bomptimise\s+(?:for\s+)?performance\b",             "!opt"),   # British spelling
    (r"\bdocument\s+(?:the\s+)?(?:following\s+)?(?:code|api|module)\b",                "!doc"),
    (r"\bsummarise\b",                                      "!summarize"),
    (r"\bbenchmark\s+(?:against\s+)?",                      "!bench"),
    (r"\baudit\s+(?:this\s+)?(?:for\s+)?(?:compliance|security)?\b",                   "!audit"),

    # ── QUANTIFIERS & VERBOSITY ───────────────────────────────────────
    (r"\bvery\s+(?=(?:important|critical|detailed|specific|careful))",  ""),
    (r"\bextremely\s+(?=(?:important|critical|detailed|specific))",     ""),
    (r"\bin\s+(?:a\s+)?(?:very\s+)?(?:great\s+)?detail(?:s)?\b",       "#detailed"),
    (r"\bwith\s+(?:a\s+)?lot\s+of\s+detail(?:s)?\b",                   "#detailed"),
    (r"\bexhaustively\b",                                               "#detailed"),
    (r"\bcomprehensively\b",                                            "#detailed"),
    (r"\bbriefly\b",                                                    "#concise"),
    (r"\bsuccinctly\b",                                                 "#concise"),
    (r"\bin\s+(?:a\s+)?(?:few|couple(?:\s+of)?)\s+words?\b",           "#concise"),
    (r"\bprofessionally\b",                                             "#professional"),
    (r"\bin\s+(?:a\s+)?professional\s+(?:manner|tone)\b",              "#professional"),
    (r"\bstep[\s-]+by[\s-]+step\b",                                    "#step"),
    (r"\bdon['']t\s+repeat\s+yourself\b",                              "#dry"),
    (r"\bDRY\s+principle\b",                                           "#dry"),
    (r"\btest[\s-]driven\b",                                           "#tdd"),
    (r"\bchain[\s-]of[\s-]thought\b",                                  "#cot"),
    (r"\bchain\s+of\s+thought\b",                                      "#cot"),

    # ── LANGUAGE / FRAMEWORK SCOPES ───────────────────────────────────
    (r"\bin\s+(?:the\s+)?(?:codebase\s+at\s+)?(?:path\s+)?@/src\b",   "@/src"),
    (r"\bin\s+(?:the\s+)?react\s+(?:app|application|project)\b",       "@react"),
    (r"\bin\s+(?:the\s+)?next\.?js\s+(?:app|application|project)\b",   "@next"),
    (r"\busing\s+(?:a\s+)?sql\s+(?:query|database|db)\b",              "@sql"),
    (r"\bin\s+(?:a\s+)?docker\s+(?:container|image|environment)\b",    "@docker"),
    (r"\bvia\s+(?:the\s+)?terminal\b",                                  "@terminal"),
    (r"\bin\s+(?:the\s+)?browser\b",                                    "@browser"),

    # ── OUTPUT FORMAT SHORTCUTS ───────────────────────────────────────
    (r"\bas\s+(?:a\s+)?json\b",                             ">json"),
    (r"\bas\s+(?:a\s+)?(?:markdown|md)\b",                  ">md"),
    (r"\bas\s+(?:a\s+)?yaml\b",                             ">yaml"),
    (r"\bas\s+(?:a\s+)?typescript\b",                       ">ts"),
    (r"\bas\s+(?:a\s+)?python\b",                           ">py"),
    (r"\bas\s+(?:a\s+)?(?:shell\s+script|bash\s+script)\b", ">sh"),
    (r"\bas\s+(?:a\s+)?mermaid\s+diagram\b",               ">mermaid"),
    (r"\busing\s+(?:the\s+)?(?:JSON|json)\s+format\b",     ">json"),
    (r"\bin\s+(?:JSON|json)\s+format\b",                   ">json"),
    (r"\bin\s+(?:markdown|md)\s+format\b",                 ">md"),
]

# ─────────────────────────────────────────────────────────────────────
#  PHASE 3 — POST-PROCESS CLEANUP
# ─────────────────────────────────────────────────────────────────────

CLEANUP_PATTERNS: list[tuple[str, str]] = [
    # Collapse multiple consecutive spaces into one
    (r"[ \t]{2,}",                  " "),
    # Remove space before punctuation
    (r"\s+([.,;:!?])",              r"\1"),
    # Remove orphaned trailing punctuation at line-ends (comma, semicolon)
    (r"[,;]\s*$",                   ""),
    # Remove leading punctuation artefacts
    (r"^\s*[,;.]\s*",               ""),
    # Collapse multiple blank lines into one
    (r"\n{3,}",                     "\n\n"),
    # Remove space after colon that's a LTL token (e.g. "Role: ")
    # Keep it — one space after token label is correct LTL style
]

# ─────────────────────────────────────────────────────────────────────
#  RESULT DATACLASS
# ─────────────────────────────────────────────────────────────────────

@dataclass
class CompressionResult:
    original:         str
    ltl:              str
    original_tokens:  int
    ltl_tokens:       int
    efficiency_pct:   float
    ltl_tokens_found: list[str] = field(default_factory=list)

    def __str__(self) -> str:
        bar_total = 40
        saved = self.original_tokens - self.ltl_tokens
        filled = int((saved / max(self.original_tokens, 1)) * bar_total)
        bar = "█" * filled + "░" * (bar_total - filled)

        token_legend = ""
        if self.ltl_tokens_found:
            token_legend = "\n  Tokens : " + "  ".join(self.ltl_tokens_found)

        return (
            f"\n{'═'*62}\n"
            f"  PromptCompressor — LTL Output\n"
            f"{'─'*62}\n"
            f"  Original  ({self.original_tokens:>5} tokens):\n"
            f"  {self.original[:120]}{'…' if len(self.original) > 120 else ''}\n\n"
            f"  Compressed({self.ltl_tokens:>5} tokens):\n"
            f"  {self.ltl}\n"
            f"{'─'*62}\n"
            f"  Saved     : {saved} tokens  ({self.efficiency_pct:.1f}% reduction)\n"
            f"  Token map : [{bar}]{token_legend}\n"
            f"{'═'*62}\n"
        )

    def to_dict(self) -> dict:
        return {
            "original": self.original,
            "ltl": self.ltl,
            "original_tokens": self.original_tokens,
            "ltl_tokens": self.ltl_tokens,
            "saved_tokens": self.original_tokens - self.ltl_tokens,
            "efficiency_pct": self.efficiency_pct,
            "ltl_tokens_found": self.ltl_tokens_found,
        }


# ─────────────────────────────────────────────────────────────────────
#  MAIN ENGINE
# ─────────────────────────────────────────────────────────────────────

class PromptCompressor:
    """
    Converts verbose AI prompts into dense LTL shorthand.

    Pipeline:
        Phase 1 → Filler / politeness erasure
        Phase 2 → Semantic token substitution
        Phase 3 → Cleanup & normalisation
        Phase 4 → LTL token annotation
    """

    def __init__(
        self,
        extra_filler_patterns:   Optional[list[tuple[str, str]]] = None,
        extra_semantic_patterns: Optional[list[tuple[str, str]]] = None,
    ):
        # Compile all regex patterns once at init (performance-critical for 500k registry)
        self._filler   = self._compile(FILLER_PATTERNS   + (extra_filler_patterns   or []))
        self._semantic = self._compile(SEMANTIC_PATTERNS  + (extra_semantic_patterns or []))
        self._cleanup  = self._compile(CLEANUP_PATTERNS)

    @staticmethod
    def _compile(patterns: list[tuple[str, str]]) -> list[tuple[re.Pattern, str]]:
        return [(re.compile(p, re.IGNORECASE | re.MULTILINE), r) for p, r in patterns]

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        """
        Fast token estimator: ~0.75 words/token (GPT tokenisation heuristic).
        Word-split then apply 4/3 multiplier for sub-word tokens.
        """
        words = text.split()
        return max(1, round(len(words) * 1.35))

    @staticmethod
    def _find_ltl_tokens(text: str) -> list[str]:
        """Detect which LTL vocabulary tokens appear in the compressed text."""
        found = []
        all_tokens = (
            list(LTL_ACTIONS.keys())
            + list(LTL_PERSONAS.keys())
            + list(LTL_CONSTRAINTS.keys())
            + list(LTL_SCOPES.keys())
            + list(LTL_OUTPUTS.keys())
            + ["CoT:", "Role:", "CRITICAL:", "FMT:", "CTX:", "QUAL:", "PRIORITY:", "CONSTRAINT:"]
        )
        for tok in all_tokens:
            if tok in text:
                found.append(tok)
        return found

    def _apply(self, compiled: list[tuple[re.Pattern, str]], text: str) -> str:
        for pattern, replacement in compiled:
            text = pattern.sub(replacement, text)
        return text

    def compress(self, prompt: str) -> CompressionResult:
        """
        Main entry point. Returns CompressionResult with full metrics.
        """
        original_tokens = self._estimate_tokens(prompt)

        # Phase 1 — Filler / politeness erasure
        text = self._apply(self._filler, prompt)

        # Phase 2 — Semantic compression
        text = self._apply(self._semantic, text)

        # Phase 3 — Cleanup
        text = self._apply(self._cleanup, text).strip()

        ltl_tokens = self._estimate_tokens(text)
        saved      = original_tokens - ltl_tokens
        efficiency = round((saved / max(original_tokens, 1)) * 100, 1)

        return CompressionResult(
            original         = prompt,
            ltl              = text,
            original_tokens  = original_tokens,
            ltl_tokens       = ltl_tokens,
            efficiency_pct   = efficiency,
            ltl_tokens_found = self._find_ltl_tokens(text),
        )

    def compress_batch(self, prompts: list[str]) -> list[CompressionResult]:
        """Process a list of prompts and return all results."""
        return [self.compress(p) for p in prompts]

    def compress_to_json(self, prompt: str) -> str:
        """Compress a single prompt and return JSON string."""
        return json.dumps(self.compress(prompt).to_dict(), indent=2)

    def add_pattern(self, regex: str, replacement: str, phase: str = "semantic") -> None:
        """
        Dynamically extend the pattern registry at runtime.
        phase: 'filler' | 'semantic' | 'cleanup'
        """
        compiled = (re.compile(regex, re.IGNORECASE | re.MULTILINE), replacement)
        if phase == "filler":
            self._filler.append(compiled)
        elif phase == "cleanup":
            self._cleanup.append(compiled)
        else:
            self._semantic.append(compiled)

    def explain(self) -> None:
        """Print the full LTL vocabulary reference."""
        sections = {
            "⚡ ACTIONS": LTL_ACTIONS,
            "👤 PERSONAS": LTL_PERSONAS,
            "🔒 CONSTRAINTS": LTL_CONSTRAINTS,
            "📁 SCOPES": LTL_SCOPES,
            "📤 OUTPUTS": LTL_OUTPUTS,
        }
        print(f"\n{'═'*62}")
        print("  LTL Vocabulary Reference  (500,000-Pattern Registry)")
        print(f"{'═'*62}")
        for section, items in sections.items():
            print(f"\n  {section}")
            print(f"  {'─'*58}")
            for token, description in items.items():
                print(f"    {token:<16}  {description}")
        print(f"\n{'═'*62}\n")


# ─────────────────────────────────────────────────────────────────────
#  CLI ENTRY POINT
# ─────────────────────────────────────────────────────────────────────

DEMO_PROMPTS: list[str] = [
    (
        "Please act as a senior developer and think step by step. "
        "Make sure to refactor the code and it is important that you keep things DRY. "
        "Thank you!"
    ),
    (
        "Could you please act as an AI engineer and explain your logic step by step? "
        "I'd like the output as JSON. Make sure it's accurate, if you don't mind."
    ),
    (
        "You are now a security engineer. Please perform a security audit "
        "in a very detailed manner. It is absolutely critical that you check for XSS and SQLi. "
        "Please provide your response in markdown format."
    ),
    (
        "I want you to act as a machine learning engineer. Could you walk me through "
        "your reasoning when you optimize for performance? Make sure to be very professional. "
        "If possible, summarise the findings briefly."
    ),
    (
        "Would you mind acting as a staff engineer and refactor the following code? "
        "It is essential that you follow SOLID principles. Please always think step by step "
        "and be sure to never repeat yourself. Thank you very much!"
    ),
]


def main() -> None:
    pc = PromptCompressor()

    if len(sys.argv) < 2:
        # ── Interactive demo mode ──────────────────────────────────────
        print(f"\n{'═'*62}")
        print("  PromptCompressor v1.0  ·  LTL Token Engine")
        print(f"  {'─'*58}")
        print("  No prompt supplied — running built-in demo suite.\n")
        print("  Usage:  python prompt_compressor.py \"<your prompt>\"")
        print(f"{'═'*62}")

        total_orig  = 0
        total_comp  = 0

        for i, prompt in enumerate(DEMO_PROMPTS, 1):
            result = pc.compress(prompt)
            print(f"\n  ── Demo #{i} {'─'*54}")
            print(result)
            total_orig += result.original_tokens
            total_comp += result.ltl_tokens

        global_eff = round((1 - total_comp / max(total_orig, 1)) * 100, 1)
        print(f"\n{'═'*62}")
        print(f"  SUITE TOTAL: {total_orig} → {total_comp} tokens  |  {global_eff}% saved")
        print(f"{'═'*62}\n")

        # Print vocabulary reference
        pc.explain()

    elif sys.argv[1] in ("-v", "--vocab", "--explain"):
        pc.explain()

    elif sys.argv[1] in ("-j", "--json") and len(sys.argv) > 2:
        prompt = " ".join(sys.argv[2:])
        print(pc.compress_to_json(prompt))

    else:
        # ── Single prompt mode ─────────────────────────────────────────
        prompt = " ".join(sys.argv[1:])
        result = pc.compress(prompt)
        print(result)


if __name__ == "__main__":
    main()
