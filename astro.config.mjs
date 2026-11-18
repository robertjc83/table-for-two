import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: replace with your real domain before launch (used for canonical URLs + sitemap + robots.txt)
export default defineConfig({
  site: 'https://dinner-for-two-tonight.netlify.app',
  integrations: [sitemap()],
});
