// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';

import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://mahdisalem.com',
  output: 'static',

  i18n: {
    defaultLocale: 'fa',
    locales: ['fa', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [mdx(), sitemap(), keystatic(), react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['yjs'],
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    remarkPlugins: [remarkMermaid],
  },

  adapter: netlify(),
});