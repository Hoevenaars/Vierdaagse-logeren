// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.vierdaagselogeren.nl',
  integrations: [sitemap()],
  redirects: {
    '/camping': '/campings',
    '/en/camping': '/en/campings',
    '/de/camping': '/de/campings',
  },
  i18n: {
    locales: ['nl', 'en', 'de'],
    defaultLocale: 'nl',
    routing: {
      prefixDefaultLocale: false, // NL blijft op /, EN/DE krijgen /en/ en /de/ prefix
    },
  },
});
