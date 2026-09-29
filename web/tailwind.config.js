/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: { 950: '#160f1c', 900: '#1e1326', 850: '#241731', 800: '#2c1d3a', 700: '#3d2a4f' },
        blush: { 100: '#fbdce8', 200: '#f7b9d0', 300: '#f194b8', 400: '#e9759f', 500: '#dd5f8c' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
