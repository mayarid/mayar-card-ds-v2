import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { docsManifest } from './scripts/docs-manifest-plugin.ts'

// GitHub Pages serves the site under /<repo>/.
const base = process.env.BASE_PATH ?? '/mayar-card-ds-v2/'

export default defineConfig({
  base,
  plugins: [
    // The router plugin must come before react().
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    docsManifest(fileURLToPath(new URL('.', import.meta.url))),
  ],
  resolve: {
    alias: {
      // Registry source uses the shadcn aliases, so copied code works as-is.
      '@/components/ui': fileURLToPath(new URL('./src/registry/ui', import.meta.url)),
      '@/lib': fileURLToPath(new URL('./src/registry/lib', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/registry/hooks', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // axe on full doc pages is slow on CI runners.
    testTimeout: 30000,
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
})
