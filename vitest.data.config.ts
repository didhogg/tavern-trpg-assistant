import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

export default defineConfig({
  define: { 'process.env.NODE_ENV': JSON.stringify('production'), __APP_VERSION__: JSON.stringify(pkg.version) },
  test: { include: ['tests/data/**/*.test.ts'], setupFiles: ['tests/helpers/setup.ts'], maxWorkers: 4 },
})
