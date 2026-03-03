import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Telegram Web proxy — strips X-Frame-Options for iframe embed
      '/tg-embed': {
        target: 'https://web.telegram.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tg-embed/, '/a'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
      // X (Twitter) proxy
      '/x-embed': {
        target: 'https://x.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/x-embed/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
      // Snapchat Web proxy
      '/snap-embed': {
        target: 'https://web.snapchat.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/snap-embed/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
    },
  },
})
