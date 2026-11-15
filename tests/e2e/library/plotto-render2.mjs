import { chromium } from 'playwright-core'
import { startStatic } from './static.mjs'
const { server, url } = await startStatic({ port: 47342 })
const ctx = await chromium.launchPersistentContext('/Users/xxx/tavern-trpg-assistant/work/plotto-check-profile', { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted }, null, { timeout: 120000 })
const out = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const zt = await lib.service.query('cn-brew', 'table')
  const et = await lib.service.query('en-brew', 'table')
  const view = await lib.currentView()
  const zf = await lib.service.frameOf('cn', view)
  const ef = await lib.service.frameOf('en', view)
  const one = async (frame, item) => {
    const m = await frame.call('renderContent', item, { tables: false })
    return { name: item.name, hasTable: m.html.includes('<table'), hasLink: m.html.includes('<a ') || m.html.includes('href='), len: m.html.length, snippet: m.html.slice(0, 300) }
  }
  const zg = zt.find(x => x.item?.name === '普洛托转盘')?.item
  const zb = zt.find(x => x.item?.name === '普洛托 B-50 索引')?.item
  const eg = et.find(x => x.item?.name === 'Plotto Spinner')?.item
  const eb = et.find(x => x.item?.name === 'Plotto B-50 Index')?.item
  return {
    zh_spinner: zg ? await one(zf, zg) : null,
    zh_b50: zb ? await one(zf, zb) : null,
    en_spinner: eg ? await one(ef, eg) : null,
    en_b50: eb ? await one(ef, eb) : null,
  }
})
console.log(JSON.stringify(out, null, 1))
await ctx.close(); server.close()
