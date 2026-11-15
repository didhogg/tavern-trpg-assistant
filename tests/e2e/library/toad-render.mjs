import { cp, rm, readFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { startStatic } from './static.mjs'
const { server, url } = await startStatic({ port: 47340 })
const profile = '/Users/xxx/tavern-trpg-assistant/work/toad-render-profile'
await rm(profile, { recursive: true, force: true })
await cp('/Users/xxx/tavern-trpg-assistant/work/toad-check-profile', profile, { recursive: true })
const ctx = await chromium.launchPersistentContext(profile, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const logs = []
page.on('pageerror', e => logs.push(String(e.stack ?? e).slice(0, 500)))
page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 500)) })
await page.goto(url)
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`, null, { timeout: 120000 })
const pkg = JSON.parse(await readFile('/Users/xxx/Downloads/Tome of Adventure Design/Chapters 1-4/Matt Finch; Tome of Adventure Design (Revised).json', 'utf8'))
const t1 = pkg.table.find(t => t.caption && t.caption.startsWith('Table 1-1A-1'))
const t2 = pkg.table.find(t => t.caption && t.caption.startsWith('Table 2-1:'))
const t3 = pkg.table.find(t => t.caption && t.caption.startsWith('Table 3-170:'))
const out = await page.evaluate(async ({ P, t1, t2, t3 }) => {
  const stores = eval(P)
  const app = stores._s.get('app')
  const lib = app.svc().backend.library
  const view = await lib.currentView()
  const frame = await lib.service.frameOf('cn', view)
  const one = async (t) => {
    try {
      const m = await frame.call('renderContent', t, { tables: false })
      return { hasTable: m.html.includes('<table'), html: m.html.slice(0, 300), len: m.html.length }
    } catch (e) { return { error: String(e.stack ?? e).slice(0, 500) } }
  }
  const t1no = { ...t1 }; delete t1no.type
  const oneEntries = async (txt) => {
    try {
      const m = await frame.call('renderContent', { type: 'entries', entries: [txt] }, { tables: false })
      return { html: m.html.slice(0, 500), len: m.html.length, links: m.links?.length }
    } catch (e) { return { error: String(e.stack ?? e).slice(0, 500) } }
  }
  return { t1: await one(t1), t1no: await one(t1no), t2: await one(t2), t3sub: t3?.tables?.[0] ? await one(t3.tables[0]) : null, t3group: t3 ? await one(t3) : null,
    tag: await oneEntries('{@table Tome of Adventure Design (Revised); Table 2-1: Monster Categories*|TomeOfAdventureDesign}'),
    tagzh: await oneEntries('{@table 冒险设计宝典（修订版）；表 2-1：怪物类别|TomeOfAdventureDesign}') }
}, { P, t1, t2, t3 })
console.log(JSON.stringify({ out, logs }, null, 1))
await ctx.close(); server.close()
