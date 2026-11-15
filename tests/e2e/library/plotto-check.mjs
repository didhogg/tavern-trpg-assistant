import { readFile, rm, cp } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { startStatic } from './static.mjs'

const { server, url } = await startStatic({ port: 47341 })
const base = '/Users/xxx/Downloads/Plotto/Plotto 数据包/'
const en = await readFile(base + 'William Wallace Cook; Plotto - The Master Book of All Plots.json', 'utf8')
const zh = await readFile(base + 'William Wallace Cook; 普洛托：所有情节的大师书.json', 'utf8')
const profile = '/Users/xxx/tavern-trpg-assistant/work/plotto-check-profile'
await rm(profile, { recursive: true, force: true })
await cp('/Users/xxx/tavern-trpg-assistant/work/e2e-lib/profile-p3-1-chrome', profile, { recursive: true })
const ctx = await chromium.launchPersistentContext(profile, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const logs = []
page.on('console', (m) => { if (m.type() === 'error') logs.push('console: ' + m.text().slice(0, 500)) })
page.on('pageerror', (e) => logs.push('pageerror: ' + String(e.stack ?? e).slice(0, 800)))
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted }, null, { timeout: 120000 })
const r = await page.evaluate(async ({ en, zh }) => {
  const out = { step: 'start' }
  try {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
    const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
    const b = lib.bilingual
    out.step = 'preview-en'
    const pe = await b.previewImport([{ name: 'plotto-en.json', text: en }])
    out.en = pe.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, files: x.preview.files, notJson: x.preview.notJson, rejected: x.preview.rejected, authorErrors: x.preview.authorErrors, structure: x.preview.structure }))
    out.step = 'preview-zh'
    const pz = await b.previewImport([{ name: 'plotto-zh.json', text: zh }])
    out.zh = pz.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, files: x.preview.files, notJson: x.preview.notJson, rejected: x.preview.rejected, authorErrors: x.preview.authorErrors, structure: x.preview.structure }))
    out.step = 'import'
    const imp = await b.importFiles([{ name: 'plotto-zh.json', text: zh }, { name: 'plotto-en.json', text: en }])
    out.import = imp.map((x) => ({ lang: x.lang, codeSet: x.codeSet, ok: x.result.ok, errors: x.result.errors ?? null }))
    await lib.brewQueue.settled()
    out.step = 'query'
    const zt = await lib.service.query('cn-brew', 'table')
    const et = await lib.service.query('en-brew', 'table')
    out.tables = { zh: zt.length, en: et.length, zhSample: zt[0]?.item?.name ?? null, enSample: et[0]?.item?.name ?? null }
    out.step = 'render'
    const view = await lib.currentView()
    const frame = await lib.service.frameOf('cn', view)
    const sample = zt.find((x) => x.item?.name === '普洛托 1a')?.item
    if (sample) {
      const m = await frame.call('renderContent', sample, { tables: false })
      out.render = { hasTable: m.html.includes('<table'), len: m.html.length, snippet: m.html.slice(0, 220) }
    }
  } catch (e) { out.error = String(e.stack ?? e) }
  return out
}, { en, zh })
console.log(JSON.stringify({ r, logs }, null, 1))
await ctx.close(); server.close()
