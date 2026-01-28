const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ['dist', 'node_modules', '.github', 'types.generated.d.ts', '.astro/**', '**/.astro/**'],
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,astro}'],
  },
  ...compat.config({
    env: {
      node: true,
      es2022: true,
      browser: true,
    },
    extends: ['eslint:recommended', 'plugin:astro/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      tsconfigRootDir: __dirname,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
    overrides: [
      {
        files: ['*.js'],
        rules: {
          'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
        },
      },
      {
        files: ['*.astro'],
        parser: 'astro-eslint-parser',
        parserOptions: {
          parser: '@typescript-eslint/parser',
          extraFileExtensions: ['.astro'],
        },
        rules: {
          'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
          'no-unused-vars': ['error', { varsIgnorePattern: '^Props$' }],
        },
      },
      {
        files: ['*.ts'],
        parser: '@typescript-eslint/parser',
        extends: ['plugin:@typescript-eslint/recommended'],
        rules: {
          '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
          ],
          '@typescript-eslint/no-non-null-assertion': 'off',
        },
      },
      {
        // Define the configuration for `<script>` tag.
        // Script in `<script>` is assigned a virtual file name with the `.js` extension.
        files: ['**/*.astro/*.js', '*.astro/*.js'],
        parser: '@typescript-eslint/parser',
      },
    ],
  }),
];
