// vite.config.ts
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src')
      },
      {
        find: '~',
        replacement: resolve(__dirname, 'src')
      }
    ]
  },
  // Configurazione Vite
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
    include: ['src/test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
})