import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'not-genshin-true';
const isCiPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isCiPages ? `/${repoName}/` : '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
  },
});
