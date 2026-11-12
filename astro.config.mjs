// Configuración de Astro para Camino de Azahar.
// - i18n: español (por defecto), portugués de Brasil e inglés, siempre con prefijo (/es/, /pt/, /en/).
// - Tailwind CSS 4 se integra como plugin de Vite.
// - "site" es la dirección publicada en GitHub Pages; se usa para URLs canónicas y sitemap.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nadiespinosa-del.github.io',
  trailingSlash: 'always',
  // La versión para escuelas de Camino de Azahar pasó a VÍA Educa: las direcciones viejas redirigen a la nueva
  redirects: {
    '/es/experiencias/camino-de-azahar/grupos-y-escuelas': '/es/via-educa/camino-de-azahar/',
    '/pt/experiencias/camino-de-azahar/grupos-e-escolas': '/pt/via-educa/camino-de-azahar/',
    '/en/experiences/camino-de-azahar/groups-and-schools': '/en/via-educa/camino-de-azahar/',
  },
  integrations: [
    // Sitemap XML: excluye la página interna del sistema de diseño
    sitemap({ filter: (pagina) => !pagina.includes('/sistema/') }),
  ],
  i18n: {
    locales: ['es', 'pt', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: true,
      // La raíz "/" redirige a /es/ desde src/pages/index.astro.
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // La escena 3D (Three.js) es pesada a propósito: decisión de diseño aprobada.
    build: { chunkSizeWarningLimit: 900 },
  },
});
