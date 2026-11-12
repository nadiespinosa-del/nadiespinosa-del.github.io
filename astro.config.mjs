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
