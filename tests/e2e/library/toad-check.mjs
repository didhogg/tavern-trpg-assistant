import { readFile, mkdir, cp, rm } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { startStatic } from './static.mjs'

const { server, url } = await startStatic({ port: 47340 })
const en = await readFile('/Users/xxx/Downloads/Tome of Adventure Design/Chapters 1-4/Matt Finch; Tome of Adventure Design (Revised).json', 'utf8')
const zh = await readFile('/Users/xxx/Downloads/Tome of Adventure Design/Chapters 1-4/Matt Finch; 冒险设计宝典（修订版）.json', 'utf8')
const profile = '/Users/xxx/tavern-trpg-assistant/work/toad-check-profile'
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
    const pe = await b.previewImport([{ name: 'toad-en.json', text: en }])
    out.en = pe.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, files: x.preview.files, notJson: x.preview.notJson, rejected: x.preview.rejected, authorErrors: x.preview.authorErrors, structure: x.preview.structure }))
    out.step = 'preview-zh'
    const pz = await b.previewImport([{ name: 'toad-zh.json', text: zh }])
    out.zh = pz.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, files: x.preview.files, notJson: x.preview.notJson, rejected: x.preview.rejected, authorErrors: x.preview.authorErrors, structure: x.preview.structure }))
    out.step = 'import'
    const imp = await b.importFiles([{ name: 'toad-zh.json', text: zh }, { name: 'toad-en.json', text: en }])
    out.import = imp.map((x) => ({ lang: x.lang, codeSet: x.codeSet, ok: x.result.ok, errors: x.result.errors ?? null }))
    await lib.brewQueue.settled()
    out.step = 'query'
    const zt = await lib.service.query('cn-brew', 'table')
    const et = await lib.service.query('en-brew', 'table')
    out.tables = { zh: zt.length, en: et.length, zhSample: zt[0]?.item?.name ?? null, enSample: et[0]?.item?.name ?? null }
  } catch (e) { out.error = String(e.stack ?? e) }
  return out
}, { en, zh })
console.log(JSON.stringify({ r, logs }, null, 1))
await ctx.close(); server.close()
