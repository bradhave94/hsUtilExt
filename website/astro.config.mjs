import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  integrations: [tailwind()],
  routes: [
    {
      path: '/api/templates/change',
      method: 'POST',
      handler: 'src/pages/api/templates/change.ts',
    },
    {
      path: '/api/pages/restore',
      method: 'POST',
      handler: 'src/pages/api/pages/restore.ts',
    },,
    {
      path: '/api/pages/update-batch',
      method: 'POST',
      handler: 'src/pages/api/pages/update-batch.ts',
    },
  ],
});