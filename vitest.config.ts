import { defineConfig, mergeConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/test/**/*.test.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/astro/**'],
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/astro/**',
          '**/*.astro',
          '**/*.d.ts',
          '**/types/**',
          '**/test/**'
        ]
      }
    },
    plugins: [react()],
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
    }
  })
)