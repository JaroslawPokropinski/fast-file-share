import { defineConfig } from 'vite';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';

const manifest: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  includeAssets: [],
  manifest: {
    short_name: 'ffs',
    name: 'Fast File Share',
    icons: [
      {
        src: 'favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
      {
        src: 'logo192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        src: 'logo512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    start_url: '.',
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
  },

  srcDir: 'src/service-worker',
  filename: 'sw.ts',
  strategies: 'injectManifest',
  // devOptions: {
  //   enabled: true,
  //   type: 'module',
  // },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), VitePWA(manifest)],
  resolve: {
    alias: {
      webtorrent: fileURLToPath(
        new URL('./node_modules/webtorrent/webtorrent.min.js', import.meta.url),
      ),
    },
  },
});
