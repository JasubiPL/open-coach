import type { Config } from 'tailwindcss';

// Tema oscuro como base + acento vibrante (ver brief / sistema de diseño).
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#A3E635', // verde lima
          foreground: '#0A0A0A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
