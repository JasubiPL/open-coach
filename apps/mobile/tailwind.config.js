/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#A3E635', foreground: '#0A0A0A' },
      },
    },
  },
  plugins: [],
};
