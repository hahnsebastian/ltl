import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-background text-foreground py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto prose-ltl">
        <h1>Privacy Policy</h1>
        <p className="italic text-muted-foreground">Last updated: April 2026</p>
        
        <section className="mt-12">
          <h2>1. Data Collection</h2>
          <p>
            The LTL Registry is designed with privacy as a core principle. We do not collect personal 
            identifiable information (PII) through the main specification pages or the Atlas registry. 
            The local compiler and runtime engines execute entirely within your browser environment.
          </p>
        </section>

        <section className="mt-8">
          <h2>2. Third-Party Services</h2>
          <p>
            We use <Link href="https://vercel.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline font-medium">Vercel</Link> for hosting and analytics to understand usage patterns of the specification. 
            <Link href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-foreground underline font-medium">GitHub</Link> is used for source control and release management. Please refer to their respective 
            privacy policies for details on how they handle technical data.
          </p>
        </section>

        <section className="mt-8">
          <h2>3. Cookies</h2>
          <p>
            We do not use tracking cookies. Local storage may be used by the browser to cache 
            LTL pattern datasets for offline performance in the Atlas and Studio modules.
          </p>
        </section>

        <div className="mt-16 pt-8">
          <Link href="/" className="text-sm font-bold hover:underline">← Return Home</Link>
        </div>
      </div>
    </div>
  )
}
