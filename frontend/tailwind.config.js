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
        primary: '#0D47A1',
        'primary-light': '#1565C0',
        'primary-dark': '#0A3882',
        secondary: '#FF9800',
        accent: '#4CAF50',
        background: '#F5F5F5',
        text: '#212121',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
