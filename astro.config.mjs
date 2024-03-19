import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, squooshImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import tasks from './src/utils/tasks';
import { ANALYTICS, SITE, SANITY } from './src/utils/config.ts';
import sanityIntegration from '@sanity/astro';
import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';
import react from '@astrojs/react';
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
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
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
    sentry(),
    spotlightjs(),
    react(),
  ],
  image: {
    service: squooshImageService(),
    domains: ['cdn.sanity.io'],
  },
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
