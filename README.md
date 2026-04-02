# LTL Registry & [Atlas](https://ltl-atlas.vercel.app)

A global registry, technical specification, and distribution platform for **Less-Token-Language (LTL)**.

## Core Features
- **Monochromatic & Brutalist Design**: Built with pure black (#000000) and pure white (#FFFFFF) for high contrast and modern aesthetics.
- **LTL Logic Core**: Implementation of the `@Scope`, `!Action`, `%Persona`, `#Constraint`, and `>Output` syntax.
- **Infinite Scrolling Atlas**: Real-time searchable database of 620+ LTL patterns covering React, API, Database, DevOps, and more.
- **Token Efficiency Tracking**: Visual estimation of token savings (averaging 94%+ compression).
- **LTL Magic Link**: Direct `ltl-core.md` reference for AI context loading.
- **FOSS Stack**: 100% Free and Open Source using Next.js, TypeScript, and Tailwind CSS.

## Architecture
- **Compiler Layer**: Programmatic generation of semantic patterns in `src/lib/ltl-data.ts`.
- **UI System**: Fixed-height native DOM scrolling optimized for high performance.
- **White Paper**: Formal document explaining the "Token Compression Ratio" and context caching integration.

## Getting Started
1. **Clone & Install**:
   ```bash
   git clone https://github.com/hahnsebastian/ltl.git
   cd ltl
   npm install
   ```
2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
3. **Load AI Context**:
   Provide your AI with the URL to `public/ltl-core.md` to start using shorthand commands.

## License
MIT (FOSS Compliance)
