import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production'), __APP_VERSION__: JSON.stringify(pkg.version) },
  build: {
    lib: { entry: 'src/main.ts', formats: ['es'], fileName: () => 'index.js' },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
  },
  test: { include: ['tests/**/*.test.ts'], setupFiles: ['tests/helpers/setup.ts'] },
})
