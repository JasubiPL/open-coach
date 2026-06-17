import next from '@open-coach/config-eslint/next';

export default [
  ...next,
  { ignores: ['.next/**', 'next-env.d.ts'] },
  // Scripts de Node (seed, etc.): exponen los globales de Node al linter.
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
];
