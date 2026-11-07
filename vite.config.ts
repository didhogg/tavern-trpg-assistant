import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production'), __APP_VERSION__: JSON.stringify(pkg.version) },
  build: {
    // frame / frame-early 是作者小窗页面（vendor/<套>/frame.html）引用的两段胶水；kernel-frame 是结算小窗（vendor/foundry/frame.html）的接线。
    lib: {
      entry: { index: 'src/main.ts', frame: 'src/library/runtime/frame/main.ts', 'frame-early': 'src/library/runtime/frame/early.ts', 'kernel-frame': 'src/rules/kernel/frame/main.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
  },
  test: { include: ['tests/unit/**/*.test.ts', 'tests/*.test.ts'], setupFiles: ['tests/helpers/setup.ts'] },
})
