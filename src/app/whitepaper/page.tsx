import React from 'react'
import Navbar from '@/components/Navbar'

// Note: Removed 'use client' to make this a Server Component for instant loading.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-ltl-grey mt-8 font-mono">
             <div>
               <strong>Version:</strong> v1.2.0-rc1<br/>
               <strong>Status:</strong> Global Registry Active<br/>
               <strong>Focus:</strong> Deep-Tech Context Optimization
             </div>
             <div>
               <strong>Core Philosophy:</strong> DRY Prompting<br/>
               <strong>Primary Target:</strong> Gemini 3 (Pro/Flash)<br/>
               <strong>Compression Target:</strong> 94.8%
             </div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-white uppercase tracking-widest text-lg mb-4">Abstract</h2>
          <p className="text-ltl-grey leading-relaxed">
            The fundamental bottleneck in modern LLM interaction is not compute latency, but <strong>Context Window Saturation</strong> and <strong>Token Input Costs</strong>. 
            As developers build more complex agentic systems, the sheer volume of instructions required to maintain rigorous engineering standards 
            consumes significant context budget—often degrading model recall (the "needle in a haystack" problem) while increasing API expenditure.
          </p>
          <p className="text-ltl-grey mt-4 leading-relaxed">
            <strong>Less-Token-Language (LTL)</strong> proposes a deterministic semantic compression standard for AI prompting. 
            By mapping rigorous engineering workflows to a terse, symbol-prefix vocabulary, LTL acts as a compiler layer between the human engineer and the AI agent.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-white uppercase tracking-widest text-lg mb-4">Validation Layer: Target Models</h2>
          <p className="text-ltl-grey mb-6">
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
             <div className="border border-white/10 p-2 bg-white/5">Llama 4 (Full)</div>
             <div className="border border-white/10 p-2 bg-white/5">Mistral Large 3</div>
             <div className="border border-white/10 p-2 bg-white/5">Grok-3</div>
             <div className="border border-white/10 p-2 bg-white/5">DeepSeek V3</div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-white uppercase tracking-widest text-lg mb-4">The Mechanics of Token Compression</h2>
          <p className="text-ltl-grey mb-4">
             Consider a standard prompt used for refactoring:
          </p>
          <pre className="p-4 bg-white/[0.02] border border-white/5 text-[11px] mb-6">
            <code className="text-ltl-grey">
{`// Standard Payload (145 tokens)
"Please analyze the src/components directory. Act as a Senior Frontend 
Developer. Your task is to refactor all these components to ensure 
they follow the DRY principle, eliminate prop drilling, and use proper 
TypeScript generics. Finally, output the results as a Markdown summary 
with code blocks."`}
            </code>
          </pre>
          <p className="text-ltl-grey mb-4">
             With LTL, this exact same semantic intent is losslessly compressed into 8 tokens:
          </p>
          <pre className="p-4 bg-white/[0.02] border border-white/5 text-[11px] mb-6">
            <code className="text-blue-400 font-bold">
              LTL @/components !ref %SNR #dry &gt;md
            </code>
          </pre>
          <h3 className="text-white uppercase tracking-tight text-md mb-2 mt-8">The Context Caching Advantage</h3>
          <p className="text-ltl-grey leading-relaxed">
            The true power of LTL unlocks when combined with <strong>Context Caching</strong> (e.g., Gemini 3 / Gemini 1.5 Pro). 
            Instead of continually sending the vocabulary definitions in every prompt, the LTL Dictionary (ltl-core.md) is appended 
            to the system prompt <strong>once</strong> and cached. 
          </p>
          <p className="text-ltl-grey mt-4 leading-relaxed">
            All subsequent interactions leverage the cached instructions via brief LTL symbols. This reduces continuous token expenditure by ~94% and improves the model's focus on the actual task codebase rather than redundant behavioral instructions.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-white uppercase tracking-widest text-lg mb-4">LTL v1.2 Syntax Definition</h2>
          <p className="text-ltl-grey mb-4 text-sm uppercase font-bold tracking-tight">The language is built on five core primitive prefixes:</p>
          <ul className="list-none space-y-4 p-0">
            <li className="border-l-2 border-blue-400/50 pl-4 py-1">
              <strong className="text-white tracking-widest block mb-1">@ [Scope]</strong>
              <span className="text-xs text-ltl-grey">Defines the target file path, concept, or domain limiters. (e.g., @/api, @tests, @/k8s)</span>
            </li>
            <li className="border-l-2 border-red-400/50 pl-4 py-1">
              <strong className="text-white tracking-widest block mb-1">! [Action]</strong>
              <span className="text-xs text-ltl-grey">The specific operation/task to execute. (e.g., !ref, !sec, !arch, !patch)</span>
            </li>
            <li className="border-l-2 border-green-400/50 pl-4 py-1">
              <strong className="text-white tracking-widest block mb-1">% [Persona]</strong>
              <span className="text-xs text-ltl-grey">The role the model must adopt. (e.g., %SNR, %SEC, %SRE, %SPACE)</span>
            </li>
            <li className="border-l-2 border-yellow-400/50 pl-4 py-1">
              <strong className="text-white tracking-widest block mb-1"># [Constraint]</strong>
              <span className="text-xs text-ltl-grey">Strict engineering directives or constraints. (e.g., #dry, #perf, #low-latency)</span>
            </li>
            <li className="border-l-2 border-purple-400/50 pl-4 py-1">
              <strong className="text-white tracking-widest block mb-1">&gt; [Output]</strong>
              <span className="text-xs text-ltl-grey">The exact format of the returned data. (e.g., &gt;ts, &gt;md, &gt;k8s, &gt;qasm)</span>
            </li>
          </ul>
        </section>

        <section className="mb-24">
          <h2 className="text-white uppercase tracking-widest text-lg mb-4">Implementation Guide</h2>
          <div className="border border-white/10 p-6 md:p-8 bg-white/[0.01]">
            <h3 className="!mt-0 text-white uppercase text-sm mb-4">Step 1: The Magic Link</h3>
            <p className="text-xs text-ltl-grey mb-4">Provide the core specification to your active AI session by prompting:</p>
            <pre className="!bg-black border border-white/5 p-4 text-[10px] tracking-tight mb-8">
              <code className="text-white/80">Read and adopt the rules defined at: https://github.com/hahnsebastian/ltl/blob/main/public/ltl-core.md</code>
            </pre>
            
            <h3 className="text-white uppercase text-sm mb-4">Step 2: Execute Commands</h3>
            <p className="text-xs text-ltl-grey mb-4">Query your agent using LTL syntax exclusively:</p>
            <pre className="!bg-black border border-white/5 p-4 text-xs">
              <code className="text-green-400">LTL @/src/auth !sec %SEC #safe &gt;json</code>
            </pre>
          </div>
        </section>


      </main>
    </div>
  )
}
