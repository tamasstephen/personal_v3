import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'site.bundle.js'] },
  js.configs.recommended,
  { files: ['**/*.js', '**/*.mjs'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
