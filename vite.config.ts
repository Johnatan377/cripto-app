
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CryptoFolio DeFi',
        short_name: 'CryptoFolio',
        description: 'Seu rastreador de portfólio DeFi definitivo.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo_cryptofolio_defi.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_cryptofolio_defi.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000
      }
    })
  ],
  server: {
    host: true, // Permite acesso via IP na rede local para testar no celular
    port: 5173,
  },
});
