/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: '#0D0E11',
        charcoal: '#16181D',
        surface: '#121419',
        'surface-elevated': '#1C1F26',
        'surface-highlight': '#242832',
        ivory: '#F7F7F3',
        lime: {
          DEFAULT: '#D4FF00',
          hover: '#B8DE00',
          muted: 'rgba(212, 255, 0, 0.12)',
          border: 'rgba(212, 255, 0, 0.25)',
        },
        borderMuted: 'rgba(255, 255, 255, 0.10)',
        borderSubtle: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(212, 255, 0, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(212, 255, 0, 0.35)' },
        },
      },
    },
  },
  plugins: [],
}
