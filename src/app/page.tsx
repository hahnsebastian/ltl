'use client'

import { useState } from 'react'
import Link from 'next/link'

const INSTALL_COMMAND = `git clone https://github.com/hahnsebastian/ltl.git && cd ltl && npm install`

export default function Home() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col text-foreground bg-background">

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 max-w-screen-sm mx-auto w-full text-center gap-8 py-24 md:py-36">
        <h1 className="text-2xl md:text-5xl font-medium tracking-tight text-foreground leading-tight">
          Reduce AI prompts
        </h1>
        <p className="text-lg md:text-lg text-muted-foreground font-normal leading-relaxed">
          LTL is a high-density semantic shorthand for LLMs. Map verbose English to dense symbolic operators and transmit full agent instructions in seconds.
        </p>

        {/* Install Command */}
        <div className="w-full flex flex-col items-center gap-3">
          <div
            className="flex items-center gap-3 bg-white border border-border rounded-md px-5 py-4 w-full group cursor-pointer hover:border-foreground transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            onClick={handleCopy}
          >
            <span className="text-muted-foreground select-none font-mono text-sm">$</span>
            <code className="flex-1 text-sm font-mono text-foreground text-left truncate">
              {INSTALL_COMMAND}
            </code>
            <button
              className="text-xs font-sans font-normal text-muted-foreground hover:text-foreground transition-colors shrink-0"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-normal">
            Paste in terminal to install LTL, or{' '}
            <Link href="https://github.com/hahnsebastian/ltl" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline font-medium">
              view on GitHub
            </Link>
          </p>
        </div>
      </main>

    </div>
  )
}

