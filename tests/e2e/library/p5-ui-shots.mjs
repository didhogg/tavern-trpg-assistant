// P5 库界面截图集：宽（1280×800，窗口 960×640）和窄（390×800）两套，覆盖所有页面。用已装好官方数据的资料夹副本，开一个测试战役。
// 用法：SKIP_BUILD=1 ENGINE=chrome node tests/e2e/library/p5-ui-shots.mjs ；截图在 work/e2e-lib/p5-shots-<engine>/{wide,narrow}/
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5shots-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const dir = `${work}/p5-shots-${engineName}`
await rm(dir, { recursive: true, force: true })
await mkdir(`${dir}/wide`, { recursive: true })
await mkdir(`${dir}/narrow`, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
await page.route((u) => !u.href.startsWith(url), (r) => (/github|jsdelivr|kiwee\.top/.test(r.request().url()) && !process.env.OFFLINE ? r.continue() : r.abort()))
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const pinia = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia
  const camp = pinia._s.get('campaign')
  await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '截图战役', codeSet: 'cn' }))
})
await settle(page, 1500)

const list = []
let label = 'wide'
const shot = async (name) => { await settle(page, 400); await page.screenshot({ path: `${dir}/${label}/${name}.png` }); if (label === 'wide') list.push(name) }
const nav = async (n) => { await page.locator('.trpg-window nav, .trpg-tabs').getByRole('button', { name: n }).first().click(); await settle(page, 500) }
const lib = async () => { await nav('库'); await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 }); await settle(page, 600) }
const close = async () => { if (await page.locator('.trpg-modal').count()) { await page.locator('.trpg-modal__close').click(); await settle(page, 400) } }
const openBook = async (name, pill) => { await page.locator('.trpg-shelf__row .lib-name', { hasText: name }).first().click(); await page.waitForSelector('[data-testid="pack-page"] .lib-pills'); await settle(page, 1500); if (pill) { await page.locator('.lib-pills .trpg-pill', { hasText: pill }).first().click(); await settle(page, 1200) } }

async function pass() {
await lib(); await shot('01-shelf')
await openBook('玩家手册'); await shot('02-pack-all')
await page.locator('.lib-pills .trpg-pill', { hasText: /^法术/ }).first().click(); await page.waitForSelector('[data-testid="pack-table"] tbody tr'); await settle(page, 800); await shot('03-pack-spell-table')
await page.locator('[data-testid="pack-page"] input[type="search"]').fill('火球'); await settle(page, 500)
await page.locator('[data-testid="pack-table"] tbody tr', { hasText: '火球术' }).first().click(); await page.waitForSelector('[data-testid="entry-page"] .lib-dbody'); await settle(page, 2500); await shot('04-entry-spell')
await close()
await openBook('玩家手册', /^职业/); await page.locator('[data-testid="pack-page"] .lib-list__row', { hasText: '法师' }).first().click(); await page.waitForSelector('[data-testid="class-view"]'); await settle(page, 2500); await shot('05-class')
await close()
await openBook('怪物图鉴', /^怪物/); await page.locator('[data-testid="pack-table"] tbody tr').first().click(); await page.waitForSelector('[data-testid="entry-statblock"]'); await settle(page, 2000); await shot('06-monster')
await close()
await openBook('玩家手册', /^物品/); await page.locator('[data-testid="pack-page"] input[type="search"]').fill('板甲'); await settle(page, 500)
await page.locator('[data-testid="pack-table"] tbody tr', { hasText: /^板甲/ }).first().click(); await page.waitForSelector('[data-testid="entry-page"] .lib-dbody'); await settle(page, 2500); await shot('07-item-variants')
await close()
await openBook('玩家手册', /^书/); await page.getByTestId('book-row').first().click(); await page.waitForSelector('[data-testid="reader-body"] .lib-dbody'); await settle(page, 1500); await page.getByTestId('reader-toc').click(); await settle(page, 500); await shot('08-reader-toc')
await close()
await page.locator('[data-testid="open-search"]').click(); await page.waitForSelector('[data-testid="search-page"]')
await page.locator('[data-testid="search-page"] input[type="search"]').fill('火球'); await page.waitForSelector('[data-testid="search-results"] .lib-list__row'); await settle(page, 500); await shot('09-search')
await page.locator('[data-testid="search-books"] summary').click(); await settle(page, 400); await shot('10-search-books')
await page.locator('[data-testid="search-books"] summary').click(); await close()
await page.getByTestId('open-bulk').click(); await page.waitForSelector('[data-testid="bulk-page"] .trpg-check'); await settle(page, 400); await shot('11-bulk'); await close()
await page.locator('.trpg-shelf__row .trpg-more').first().click(); await page.locator('.trpg-dropdown__item', { hasText: '管理' }).click(); await page.waitForSelector('[data-testid="manage-page"]'); await settle(page, 600); await shot('12-manage'); await close()
await page.locator('.trpg-shelf__row .trpg-more').first().click(); await page.locator('.trpg-dropdown__item', { hasText: '卸载' }).click(); await page.waitForSelector('.trpg-confirm'); await settle(page, 600); await shot('13-uninstall-confirm')
await page.locator('.trpg-confirm button', { hasText: '取消' }).click(); await settle(page, 400)
await page.locator('.lib-top .trpg-seg button', { hasText: '我的库' }).click(); await settle(page, 700); await shot('14-mylib')
await page.locator('.lib-top .trpg-seg button', { hasText: '下载' }).click(); await page.waitForSelector('[data-testid="official-card"]'); await settle(page, 800); await shot('15-download')
await nav('设置'); await page.getByTestId('settings-library').click(); await page.waitForSelector('[data-testid="lib-prefs"]'); await settle(page, 500); await shot('16-settings-prefs')
await page.locator('.lib-top .trpg-seg button', { hasText: '全局编辑' }).click(); await settle(page, 800); await shot('17-settings-edits')
await page.locator('.lib-top .trpg-seg button', { hasText: '日志' }).click(); await page.waitForSelector('[data-testid="lib-logs"] .lib-sumline', { timeout: 60000 }); await settle(page, 600); await shot('18-settings-logs')
}
label = 'wide'
await pass()
await page.setViewportSize({ width: 390, height: 800 })
await settle(page, 800)
label = 'narrow'
await pass()
await writeFile(`${dir}/list.json`, JSON.stringify(list))
await ctx.close(); server.close()
console.log('截图 →', dir, list.length, '组')
