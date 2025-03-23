// vite.config.ts
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Configurazione Vite
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'], // Report in console e HTML
    },
    // Opzioni specifiche per Vitest
    include: ['src/test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    globals: true, // Abilita l'uso globale di `describe`, `it`, etc.
    environment: 'jsdom', // Usa `jsdom` per simulare un ambiente browser
    exclude: [...configDefaults.exclude, '**/e2e/**'], // Escludi cartelle specifiche
  },
})
