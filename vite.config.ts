/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/koppen-climate-map/' : '/',
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/public/tiles/**', '**/data/**', '**/koppen_geiger_tif/**'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
  },
});
