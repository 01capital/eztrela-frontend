/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brandGreen: {
          light: '#668f2a',
          DEFAULT: '#668f2a',
          dark: '#668f2a',
        },
        brandGray: {
          light: '#f5f5f5',
          DEFAULT: '#888888',
          dark: '#2f2f2f',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // ✅ Add this
  ],
}
