// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://vierdaagselogeren.nl',
  integrations: [sitemap()],
  i18n: {
    locales: ['nl', 'en', 'de'],
    defaultLocale: 'nl',
    routing: {
      prefixDefaultLocale: false, // NL blijft op /, EN/DE krijgen /en/ en /de/ prefix
    },
  },
});
