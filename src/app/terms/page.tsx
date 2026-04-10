import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="flex-1 bg-background text-foreground py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto prose-ltl">
        <h1>Terms of Service</h1>
        <p className="italic text-muted-foreground">Last updated: April 2026</p>
        
        <section className="mt-12">
          <h2>1. License</h2>
          <p>
            The Less-Token-Language (LTL) specification is provided under the MIT License. 
            You are free to use, modify, and distribute the core syntax for any commercial 
            or non-commercial purpose.
          </p>
        </section>

        <section className="mt-8">
          <h2>2. Use of Registry</h2>
          <p>
            The Atlas Registry is a community resource. While we strive for 100% uptime and 
            pattern accuracy, the specification is provided &quot;as is&quot; without warranty of 
            any kind.
          </p>
        </section>

        <section className="mt-8">
          <h2>3. Intellectual Property</h2>
          <p>
            LTL and the associated registry patterns are a collective effort to improve 
            semantic density for LLM interactions. No single entity claims exclusive 
            ownership of the resulting compressed prompts.
          </p>
        </section>

        <div className="mt-16 pt-8">
          <Link href="/" className="text-sm font-bold hover:underline">← Return Home</Link>
        </div>
      </div>
    </div>
  )
}
