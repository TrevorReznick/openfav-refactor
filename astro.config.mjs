import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sentry from '@sentry/astro'
import spotlightjs from '@spotlightjs/astro'
import { fileURLToPath } from 'node:url'
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sentry(),
    spotlightjs()
  ],
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})