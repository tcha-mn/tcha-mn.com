import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import tasks from './src/utils/tasks.mjs';
import { ANALYTICS, SITE, SANITY } from './src/utils/config.ts';
import sanityIntegration from '@sanity/astro';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

const CURRENT_THEATRE_SEASON = '2024-2025';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const whenExternalScripts = (items = []) =>
  ANALYTICS.vendors.googleAnalytics.id && ANALYTICS.vendors.googleAnalytics.partytown
    ? Array.isArray(items)
      ? items.map((item) => item())
      : [items()]
    : [];

// https://astro.build/config
export default defineConfig({
  site: SITE.site,
  base: SITE.base,
  trailingSlash: SITE.trailingSlash ? 'always' : 'ignore',
  output: 'static',
  integrations: [
    sitemap(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'advertising',
          'approval',
          'business-contact',
          'currency-exchange',
          'database',
          'document',
          'gallery',
          'template',
          'voice-presentation',
        ],
      },
    }),
    ...whenExternalScripts(() =>
      partytown({
        config: {
          forward: ['dataLayer.push'],
        },
      })
    ),
    tasks(),
    sanityIntegration(SANITY),
    react(),
  ],
  redirects: {
    '/cinderella': '/theatre/2024-2025/2024-cinderella/',
    '/event/annie-jr/': '/theatre/2023-2024/',
    '/event/les-mis-play/': '/theatre/2023-2024/',
    '/theatre/': `/theatre/${CURRENT_THEATRE_SEASON}/`,
  },
  image: {
    domains: ['cdn.sanity.io'],
  },
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },

    plugins: [tailwindcss()],
  },
});