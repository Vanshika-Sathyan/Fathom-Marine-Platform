/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a1628', 800: '#0d1f3c', 700: '#122850' },
        marine: { 500: '#0ea5e9', 400: '#38bdf8', 300: '#7dd3fc' }
      }
    }
  },
  plugins: []
};

