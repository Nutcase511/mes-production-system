import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: env.AIRIOT_API_TARGET ? {
          '/rest': {
            target: env.AIRIOT_API_TARGET,
            changeOrigin: true,
            secure: false,
            // SDK 内部拼接 /rest/ + /core/... 会产生双斜杠，在这里统一修复
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq) => {
                if (proxyReq.path && proxyReq.path.includes('//')) {
                  proxyReq.path = proxyReq.path.replace(/\/\//g, '/');
                }
              });
            }
          }
        } : undefined
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: [
          {
            find: '@',
            replacement: path.resolve(__dirname, './src'),
          },
          {
            find: 'kesi-ui',
            replacement: path.resolve(__dirname, 'node_modules/kesi-ui/src'),
          },
        ],
        dedupe: ['react', 'react-dom', '@radix-ui/react-checkbox', '@radix-ui/react-dialog',
          '@radix-ui/react-select', '@radix-ui/react-switch', '@radix-ui/react-tabs',
          '@radix-ui/react-label', '@radix-ui/react-slot'],
      }
    };
});
