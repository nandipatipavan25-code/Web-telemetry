/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070C16',
          900: '#0B1220', // Main dark workspace
          850: '#111B2E', // Dark sidebar
          800: '#162238', // Dark card surface
          750: '#1D2B42', // Dark secondary surface / inner containers
          700: '#2B3B53', // Dark border
          600: '#475569'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
