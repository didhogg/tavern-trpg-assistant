// B2-1 验证：插件在模拟宿主页里正常启动，作者两套程序在隐藏小窗里启动，
// 作者全局对象都在、宿主页的内置对象没被改。Chrome 与 WebKit 各跑一遍。
// "作者要读数据文件而找不到"（数据取数出口在 B2-2 接管）单独列出，不算 B2-1 失败；其余任何报错都算失败。
import { mkdir, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, requests, url } = await startStatic()
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]
const reports = []
try {
  for (const [name, type, options] of engines) {
    if (process.env.ENGINE && process.env.ENGINE !== name) continue
    const browser = await type.launch(options)
    const report = { engine: name, pageErrors: [], external: [] }
    try {
      const page = await browser.newPage()
      page.setDefaultTimeout(120000)
      page.on('pageerror', (e) => report.pageErrors.push(e.stack))
      page.on('request', (r) => { if (!r.url().startsWith(url)) report.external.push(r.url()) })
      await page.goto(url)
      await page.waitForFunction(() => {
        const host = document.querySelector('#trpg-assistant-root')
        const app = [...(host?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean)
        return app?.config.globalProperties.$pinia._s.get('app')?.booted
      })
      report.pluginBooted = true
      const result = await page.evaluate(async () => {
        const protos = () => [Object, Array, String, Number, Boolean, Function, Promise].map((c) => Object.getOwnPropertyNames(c.prototype).sort())
        const before = JSON.stringify(protos())
        const { startFrames } = await import('/work/e2e-lib/harness.js')
        const frames = await startFrames(['cn', 'en'])
        return { frames, hostPrototypesUnchanged: before === JSON.stringify(protos()) }
      })
      Object.assign(report, result)
      const isDataRequest = (e) => /(JSON 请求出错|Error during JSON request)\S*\s*status=404/.test(e)
      report.waitingForB22 = report.pageErrors.filter(isDataRequest)
      report.otherErrors = report.pageErrors.filter((e) => !isDataRequest(e))
      report.passed = report.pluginBooted && report.hostPrototypesUnchanged && !report.otherErrors.length && report.frames.every((f) => !f.errors.length && Object.values(f.present).every(Boolean))
    } catch (error) {
      report.fatal = error.stack
      report.passed = false
    } finally {
      await browser.close()
    }
    reports.push(report)
    console.log(JSON.stringify({ engine: name, passed: report.passed, fatal: report.fatal, otherErrors: report.otherErrors, waitingForB22: report.waitingForB22?.length, external: report.external, frames: report.frames?.map((f) => ({ codeSet: f.codeSet, version: f.authorVersion, ms: f.ms, missing: Object.entries(f.present).filter(([, v]) => !v).map(([k]) => k), errors: f.errors })) }, null, 1))
  }
} finally {
  server.close()
  const missing = requests.filter((r) => r.status === 404).map((r) => r.path)
  await writeFile(`${work}/b2-1.json`, JSON.stringify({ reports, localMissing: [...new Set(missing)] }, null, 2))
  console.log(`本地 404：${JSON.stringify([...new Set(missing)])}`)
}
if (reports.some((r) => !r.passed)) process.exitCode = 1
