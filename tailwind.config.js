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
        background: '#090D16',
        surface: {
          DEFAULT: '#111827',
          elevated: '#1E293B',
          subtle: '#0F1626',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          DEFAULT: '#334155',
          active: '#10B981',
        },
        brand: {
          primary: '#10B981',
          hover: '#059669',
          accent: '#34D399',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        elevation: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -3px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}