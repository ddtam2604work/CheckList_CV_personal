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
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          200: '#cedcd3',
          300: '#abc4b4',
          400: '#83a691',
          500: '#5f876f',
          600: '#4a6d57',
          700: '#3c5746',
          800: '#32463a',
          900: '#2a3b31',
          950: '#15201a',
        },
        slate: {
          750: '#243044',
          850: '#162032',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-sage': '0 0 20px -3px rgba(95, 135, 111, 0.35)',
      }
    },
  },
  plugins: [],
}
