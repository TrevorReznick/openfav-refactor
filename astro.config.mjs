// @ts-check
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    tailwind(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'bookmark',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
          'workflow'
        ],
      },
    })
  ],
  adapter: vercel()
})