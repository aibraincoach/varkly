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
        ink: '#1f1f24',
        ground: '#f3f3f5',
        line: '#dedee3',
        panel: '#1a1a20',
        track: '#e2e2e7',
        muted: {
          1: '#5b5b66',
          2: '#6b6b76',
          3: '#8a8a94',
          4: '#9a9aa3',
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
