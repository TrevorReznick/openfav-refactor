import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

import tailwind from '@astrojs/tailwind'

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  integrations: [react(), tailwind({
    applyBaseStyles: false,
  }), sentry(), spotlightjs()],

  adapter: vercel(),
})