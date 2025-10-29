
  import { defineConfig } from 'vite';
  import { reactRouter } from '@react-router/dev/vite';
  import { fileURLToPath } from 'node:url';
  import { dirname } from 'node:path';

  const __dirname = dirname(fileURLToPath(import.meta.url));

  export default defineConfig({
    plugins: [reactRouter()],
    resolve: {
      alias: {
        '@': `${__dirname}/app`,
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '/api'),
        },
        '/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/auth/, '/auth'),
        },
        '/data': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/data/, '/data'),
        },
      },
    },
  });