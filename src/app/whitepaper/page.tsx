'use client'

import React from 'react'
import Navbar from '@/components/Navbar'

export default function WhitePaper() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col pt-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-16 flex-1 w-full prose-ltl">
        <div className="border border-white/20 p-8 md:p-12 mb-12 bg-[#050505]">
          <h1 className="glitch-text text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase leading-none border-b border-white/20 pb-8 border-dashed">
            Less-Token-Language
            <span className="block text-xl text-white mt-4 font-normal tracking-wide">[The Token Compression Ratio Thesis]</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-400 mt-8 font-mono">
             <div>
               <strong>Version:</strong> v1.0.0-rc1<br/>
               <strong>Status:</strong> Draft / RFI<br/>
               <strong>Focus:</strong> Context Optimization
             </div>
             <div>
               <strong>Core Philosophy:</strong> DRY Prompting<br/>
               <strong>Primary Target:</strong> Gemini 3 (Pro/Flash)<br/>
               <strong>Compression Target:</strong> 94.8%
             </div>
          </div>
        </div>

        <section className="mb-12">
          <h2>Abstract</h2>
          <p>
            The fundamental bottleneck in modern LLM interaction is not compute latency, but <strong>Context Window Saturation</strong> and <strong>Token Input Costs</strong>. 
            As developers build more complex agentic systems, the sheer volume of instructions required to maintain rigorous engineering standards 
            consumes significant context budget—often degrading model recall (the "needle in a haystack" problem) while increasing API expenditure.
          </p>
          <p>
            <strong>Less-Token-Language (LTL)</strong> proposes a deterministic semantic compression standard for AI prompting. 
            By mapping rigorous engineering workflows to a terse, symbol-prefix vocabulary, LTL acts as a compiler layer between the human engineer and the AI agent.
          </p>
        </section>

        <section className="mb-12">
          <h2>Validation Layer: Target Models</h2>
          <p>
            LTL is designed for high-reasoning models with advanced instruction-following capabilities. The current specification is validated on:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
             <div className="border border-white/10 p-2 bg-white/5">Gemini 3 Pro</div>
             <div className="border border-white/10 p-2 bg-white/5">Gemini 3 Flash</div>
             <div className="border border-white/10 p-2 bg-white/5">Claude 3.7 Sonnet</div>
             <div className="border border-white/10 p-2 bg-white/5">Claude 3.5 Opus</div>
             <div className="border border-white/10 p-2 bg-white/5">GPT-5 (Omni)</div>
             <div className="border border-white/10 p-2 bg-white/5">GPT-4o / o1</div>
             <div className="border border-white/10 p-2 bg-white/5">o3-mini</div>
             <div className="border border-white/10 p-2 bg-white/5">Llama 4 (405B)</div>
             <div className="border border-white/10 p-2 bg-white/5">Mistral Large 3</div>
             <div className="border border-white/10 p-2 bg-white/5">Grok-3</div>
             <div className="border border-white/10 p-2 bg-white/5">DeepSeek V3</div>
          </div>
        </section>

        <section className="mb-12">
          <h2>The Mechanics of Token Compression</h2>
          <p>
             Consider a standard prompt used for refactoring:
          </p>
          <pre>
            <code className="text-white/40">
{`// Standard Payload (145 tokens)
"Please analyze the src/components directory. Act as a Senior Frontend 
Developer. Your task is to refactor all these components to ensure 
they follow the DRY principle, eliminate prop drilling, and use proper 
TypeScript generics. Finally, output the results as a Markdown summary 
with code blocks."`}
            </code>
          </pre>
          <p>
             With LTL, this exact same semantic intent is losslessly compressed into 8 tokens:
          </p>
          <pre>
            <code className="text-blue-400 font-bold">
              LTL @/components !ref %SNR #dry &gt;md
            </code>
          </pre>
          <h3>The Context Caching Advantage</h3>
          <p>
            The true power of LTL unlocks when combined with <strong>Context Caching</strong> (e.g., Gemini 3 / Gemini 1.5 Pro). 
            Instead of continually sending the vocabulary definitions in every prompt, the LTL Dictionary (ltl-core.md) is appended 
            to the system prompt <strong>once</strong> and cached. 
          </p>
          <p>
            All subsequent interactions leverage the cached instructions via brief LTL symbols. This reduces continuous token expenditure by ~94% and improves the model's focus on the actual task codebase rather than redundant behavioral instructions.
          </p>
        </section>

        <section className="mb-12">
          <h2>LTL v1.0 Syntax Definition</h2>
          <p>The language is built on five core primitive prefixes:</p>
          <ul>
            <li><strong>@ [Scope]:</strong> Defines the target file path, concept, or domain. <em>(e.g., @/api, @tests)</em></li>
            <li><strong>! [Action]:</strong> The specific operation to execute. <em>(e.g., !ref, !sec, !doc)</em></li>
            <li><strong>% [Persona]:</strong> The role the model must adopt. <em>(e.g., %SNR, %SEC)</em></li>
            <li><strong># [Constraint]:</strong> Engineering directives or constraints. <em>(e.g., #dry, #perf)</em></li>
            <li><strong>&gt; [Output]:</strong> The exact format of the returned data. <em>(e.g., &gt;ts, &gt;md)</em></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2>Implementation Guide</h2>
          <div className="border border-white/20 p-6 bg-white/5">
            <h3 className="!mt-0">Step 1: The Magic Link</h3>
            <p className="text-sm">Provide the core specification to your active AI session by prompting:</p>
            <pre className="!bg-black !border-white/30 text-[10px] tracking-tight">
              <code>Read and adopt the rules defined at: https://github.com/hahnsebastian/ltl/blob/main/public/ltl-core.md</code>
            </pre>
            
            <h3>Step 2: Execute Commands</h3>
            <p className="text-sm">Query your agent using LTL syntax exclusively:</p>
            <pre className="!bg-black !border-white/30 text-xs text-green-400">
              <code>LTL @/src/auth !sec %SEC #safe &gt;json</code>
            </pre>
          </div>
        </section>

      </main>
    </div>
  )
}
