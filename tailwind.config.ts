import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--foreground)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#171717",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#171717",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-border': 'pulseBorder 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'var(--border)' },
          '50%': { borderColor: 'var(--foreground)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
