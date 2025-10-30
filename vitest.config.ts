import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: [],
    globals: true,
    coverage: {
      reporter: ['text', 'json-summary'],
    },
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', '.next/**'],
  },
});
