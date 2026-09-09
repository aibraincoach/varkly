/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'on-ink': 'rgb(var(--on-ink) / <alpha-value>)',
        'ink-hover': 'rgb(var(--ink-hover) / <alpha-value>)',
        ground: 'rgb(var(--ground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-2': 'rgb(var(--line-2) / <alpha-value>)',
        body: 'rgb(var(--body) / <alpha-value>)',
        track: 'rgb(var(--track) / <alpha-value>)',
        box: 'rgb(var(--box) / <alpha-value>)',
        panel: '#1a1a20',
        muted: {
          1: 'rgb(var(--muted-1) / <alpha-value>)',
          2: 'rgb(var(--muted-2) / <alpha-value>)',
          3: 'rgb(var(--muted-3) / <alpha-value>)',
          4: 'rgb(var(--muted-4) / <alpha-value>)',
        },
        vark: {
          v: '#af52de',
          a: '#0071e3',
          r: '#34c759',
          k: '#ff9f0a',
        },
      },
      screens: {
        panels: '1100px',
      },
    },
  },
  plugins: [],
};
