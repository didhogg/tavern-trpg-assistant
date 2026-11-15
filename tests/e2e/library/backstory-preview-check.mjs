import { readFile, rm, cp } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { startStatic } from './static.mjs'

const { server, url } = await startStatic({ port: 47341 })
const file = '/Users/xxx/Downloads/Ultimate RPG Character Backstory 数据包/预览/OpenCode; 背景锻炉预览.json'
const text = await readFile(file, 'utf8')
const profile = '/Users/xxx/tavern-trpg-assistant/work/backstory-preview-profile'
await rm(profile, { recursive: true, force: true })
await cp('/Users/xxx/tavern-trpg-assistant/work/e2e-lib/profile-p3-1-chrome', profile, { recursive: true })
const ctx = await chromium.launchPersistentContext(profile, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const logs = []
page.on('console', (m) => { if (m.type() === 'error') logs.push('console: ' + m.text().slice(0, 500)) })
page.on('pageerror', (e) => logs.push('pageerror: ' + String(e.stack ?? e).slice(0, 800)))
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted }, null, { timeout: 120000 })
const r = await page.evaluate(async ({ text }) => {
  const out = { step: 'start' }
  try {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
    const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
    const b = lib.bilingual
    out.step = 'preview'
    const p = await b.previewImport([{ name: 'backstory-preview.json', text }])
    out.preview = p.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, files: x.preview.files, notJson: x.preview.notJson, rejected: x.preview.rejected, authorErrors: x.preview.authorErrors, structure: x.preview.structure }))
    out.step = 'import'
    const imp = await b.importFiles([{ name: 'backstory-preview.json', text }])
    out.import = imp.map((x) => ({ lang: x.lang, codeSet: x.codeSet, ok: x.result.ok, errors: x.result.errors ?? null }))
    await lib.brewQueue.settled()
    out.step = 'query'
    const t = await lib.service.query('cn-brew', 'table')
    const v = await lib.service.query('cn-brew', 'variantrule')
    out.tables = { count: t.length, names: t.map((x) => x.item?.name) }
    out.variantrules = { count: v.length, names: v.map((x) => x.item?.name) }
    out.step = 'render'
    const view = await lib.currentView()
    const frame = await lib.service.frameOf('cn', view)
    const sample = t[0]?.item
    if (sample) {
      const m = await frame.call('renderContent', sample, { tables: true })
      out.render = { hasTable: m.html.includes('<table'), len: m.html.length, snippet: m.html.slice(0, 380) }
    }
  } catch (e) { out.error = String(e.stack ?? e) }
  return out
}, { text })
console.log(JSON.stringify({ r, logs }, null, 1))
await ctx.close(); server.close()
