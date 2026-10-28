import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    lib: { entry: 'src/main.ts', formats: ['es'], fileName: () => 'index.js' },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
  },
  test: { include: ['tests/**/*.test.ts'] },
})
