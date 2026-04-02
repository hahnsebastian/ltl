#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════╗
║   PromptCompressor v3.0  —  Less-Token-Language (LTL) Engine        ║
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
#  LTL VOCABULARY  (mirrors src/lib/ltl-engine.ts v3.0.0)
# ─────────────────────────────────────────────────────────────────────

LTL_ACTIONS: dict[str, str] = {
    "!ref":       "Refactor / resolve logic-debt & optimise maintainability",
    "!sec":       "Security audit — OWASP, XSS, SQLi, Auth flaws",
    "!doc":       "Document — internal architecture + API schemas",
    "!opt":       "Performance optimise — sub-ms focus",
    "!test":      "Write 100% coverage suite (unit + E2E)",
    "!act":       "Execute technical operational payload",
    "!reason":    "Chain-of-Thought reasoning / analysis",
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
    "!debug":     "Debugging / Root-Cause Analysis",
    "!clean":     "Industrial Clean-Up (remove dead code)",
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
    "#ha":          "High Availability (99.999%)",
    "#idempotent":  "Pure side-effect-free logic",
    "#strict":      "Zero-tolerance for technical debt",
    "#narrative":   "Narrative / Flowing style",
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
    "@logs":        "Logs / Telemetry",
    "@edge":        "Edge / IoT",
    "@llm":         "LLM context",
    "@k8s":         "Kubernetes",
    "@sec":         "Security logic",
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
    ">raw":     "Plain Text",
    ">csv":     "CSV",
}

LTL_STATES: dict[str, str] = {
    "~ok":      "Nominal / success state",
    "~done":    "Task completed",
    "~err":     "Error / failure state",
    "~wip":     "Work in progress",
    "~block":   "Blocked / waiting",
    "~stale":   "Outdated / needs refresh",
    "~hot":     "Active / live",
    "~cold":    "Inactive / paused",
}

# ─────────────────────────────────────────────────────────────────────
#  PHASE 1 — POLITENESS & FILLER ERASURE
# ─────────────────────────────────────────────────────────────────────

FILLER_PATTERNS: list[tuple[str, str]] = [
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
]

# ─────────────────────────────────────────────────────────────────────
#  PHASE 2 — SEMANTIC COMPRESSION
# ─────────────────────────────────────────────────────────────────────

SEMANTIC_PATTERNS: list[tuple[str, str]] = [
    # Role
    (r"\bact\s+as\s+(?:an?\s+)?",                           "Role:"),
    (r"\byou\s+are\s+now\s+(?:an?\s+)?",                   "Role:"),
    (r"\bbehave\s+as\s+(?:an?\s+)?",                        "Role:"),
    # CoT
    (r"\bthink\s+(?:this\s+through\s+)?step[\s-]+by[\s-]+step\b",  "CoT:"),
    (r"\bexplain\s+your\s+(?:reasoning|logic|thought\s+process)\b", "CoT:"),
    (r"\bwalk\s+(?:me\s+)?through\s+(?:your\s+)?(?:reasoning|thought process|logic)\b", "CoT:"),
    # Constraints
    (r"\b(?:make\s+sure\s+(?:to|that)?|ensure\s+(?:that)?)\b[\s]*",        "CRITICAL:"),
    (r"\bit\s+is\s+(?:absolutely\s+)?(?:important|essential|critical|crucial)\s+(?:that\s+)?", "CRITICAL:"),
    # State
    (r"\bis\s+(?:currently\s+)?(?:broken|failing|down|crashed)\b", "~err"),
    (r"\bis\s+(?:currently\s+)?(?:working|live|active|running)\b", "~ok"),
    (r"\bis\s+(?:currently\s+)?(?:in\s+progress|being\s+built|wip)\b", "~wip"),
    (r"\bis\s+(?:currently\s+)?(?:blocked|waiting|pending)\b", "~block"),
]

# ─────────────────────────────────────────────────────────────────────
#  PHASE 3 — POST-PROCESS CLEANUP
# ─────────────────────────────────────────────────────────────────────

CLEANUP_PATTERNS: list[tuple[str, str]] = [
    (r"[ \t]{2,}",                  " "),
    (r"\s+([.,;:!?])",              r"\1"),
    (r"[,;]\s*$",                   ""),
    (r"^\s*[,;.]\s*",               ""),
    (r"\n{3,}",                     "\n\n"),
]

@dataclass
class CompressionResult:
    original:         str
    ltl_header:       str
    compressed:       str
    original_tokens:  int
    ltl_tokens:       int
    efficiency_pct:   float
    tokens_found:     dict[str, list[str]] = field(default_factory=dict)

    @property
    def unified_payload(self) -> str:
        return f"{self.ltl_header} & {self.compressed}"

    def __str__(self) -> str:
        bar_total = 40
        saved = self.original_tokens - self.ltl_tokens
        filled = int((saved / max(self.original_tokens, 1)) * bar_total)
        bar = "█" * filled + "░" * (bar_total - filled)

        return (
            f"\n{'═'*62}\n"
            f"  PromptCompressor v3.0 — Unified LTL Payload\n"
            f"{'─'*62}\n"
            f"  Original   ({self.original_tokens:>5} tkw):\n"
            f"  {self.original[:100]}...\n\n"
            f"  Unified LTL Payload:\n"
            f"  {self.unified_payload}\n"
            f"{'─'*62}\n"
            f"  Tokens Found: {', '.join([t for sub in self.tokens_found.values() for t in sub])}\n"
            f"  Efficiency  : {self.efficiency_pct:.1f}% reduction\n"
            f"  Token Map   : [{bar}]\n"
            f"{'═'*62}\n"
        )

    def to_dict(self) -> dict:
        return {
            "original": self.original,
            "ltl_header": self.ltl_header,
            "compressed": self.compressed,
            "unified_payload": self.unified_payload,
            "metrics": {
                "original_tokens": self.original_tokens,
                "ltl_tokens": self.ltl_tokens,
                "efficiency": self.efficiency_pct
            }
        }

class PromptCompressor:
    def __init__(self):
        self._filler   = self._compile(FILLER_PATTERNS)
        self._semantic = self._compile(SEMANTIC_PATTERNS)
        self._cleanup  = self._compile(CLEANUP_PATTERNS)

    @staticmethod
    def _compile(patterns: list[tuple[str, str]]) -> list[tuple[re.Pattern, str]]:
        return [(re.compile(p, re.IGNORECASE | re.MULTILINE), r) for p, r in patterns]

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        return max(1, round(len(text.split()) * 1.35))

    def _apply(self, compiled: list[tuple[re.Pattern, str]], text: str) -> str:
        for pattern, replacement in compiled:
            text = pattern.sub(replacement, text)
        return text

    def _extract_header(self, text: str) -> tuple[str, dict[str, list[str]]]:
        found = { "scope": [], "action": [], "persona": [], "constraint": [], "output": [], "state": [] }
        text_lower = text.lower()
        
        mapping = [
            (LTL_SCOPES, "scope"), (LTL_ACTIONS, "action"), (LTL_PERSONAS, "persona"),
            (LTL_CONSTRAINTS, "constraint"), (LTL_OUTPUTS, "output"), (LTL_STATES, "state")
        ]
        
        for dict_obj, key in mapping:
            for token, desc in dict_obj.items():
                if token.lower() in text_lower or any(word in text_lower for word in desc.lower().split() if len(word) > 3):
                    if token not in found[key]:
                        found[key].append(token)

        header = f"LTL {found['scope'][0] if found['scope'] else '@agent'} " \
                 f"{found['action'][0] if found['action'] else '!act'} " \
                 f"{found['persona'][0] if found['persona'] else '%SNR'} " \
                 f"{found['constraint'][0] if found['constraint'] else '#std'} " \
                 f"{found['output'][0] if found['output'] else '>md'}"
        if found["state"]:
            header += f" {found['state'][0]}"
            
        return header, found

    def compress(self, prompt: str) -> CompressionResult:
        orig_tokens = self._estimate_tokens(prompt)
        
        # Header Extraction (Compiler logic)
        header, tokens_found = self._extract_header(prompt)
        
        # Literal Compression (Regex logic)
        comp = self._apply(self._filler, prompt)
        comp = self._apply(self._semantic, comp)
        comp = self._apply(self._cleanup, comp).strip()
        
        ltl_tokens = self._estimate_tokens(header + " & " + comp)
        efficiency = round((1 - ltl_tokens / max(orig_tokens, 1)) * 100, 1)
        
        return CompressionResult(
            original=prompt,
            ltl_header=header,
            compressed=comp,
            original_tokens=orig_tokens,
            ltl_tokens=ltl_tokens,
            efficiency_pct=efficiency,
            tokens_found=tokens_found
        )

def main():
    pc = PromptCompressor()
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        print(pc.compress(prompt))
    else:
        demo = "Please act as a senior developer and think step by step. Make sure to refactor the code and it is important that you keep things DRY. Thank you!"
        print(pc.compress(demo))

if __name__ == "__main__":
    main()
