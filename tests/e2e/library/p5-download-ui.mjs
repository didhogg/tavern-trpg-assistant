// 下载页（真实资料，阻断外网）：作者书目可按书选择；下载失败后退出进度环，横幅可在书架和下载页继续查看。
// 用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-download-ui.mjs
import { cp, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5dl-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const shots = `${work}/p5-download-shots-${engineName}`
await rm(shots, { recursive: true, force: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库' }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
await page.getByRole('button', { name: '下载', exact: true }).click()
await page.waitForSelector('[data-testid="official-card"]')
await settle(page, 1500)
await page.screenshot({ path: `${shots}/1-download-tab.png` }).catch(async () => { await import('node:fs/promises').then((f) => f.mkdir(shots, { recursive: true })); await page.screenshot({ path: `${shots}/1-download-tab.png` }) })

const official = page.getByTestId('official-card')
const groups = official.locator('.lib-dlgrp__btn')
for (const group of await groups.all()) {
  if ((await group.getAttribute('aria-expanded')) === 'false') await group.click()
}
const books = await official.locator('.trpg-row').count()
check('官方资料按作者分类列出书和冒险', await groups.count() > 3 && books > 50, `${await groups.count()} 组 ${books} 项`)
check('按规则筛选、可多选，列表不依赖整套安装按钮', await official.getByRole('group', { name: '规则版本' }).count() === 1 && await page.getByTestId('official-card-multi').count() === 1, '')
check('断网时下载页内容照常显示', await official.count() === 1, '')

await official.locator('[data-testid="book-download"]:enabled').first().click()
await page.waitForSelector('[data-testid="download-banner"] [data-testid="download-retry"]', { timeout: 120000 })
await page.getByTestId('lib-ring').waitFor({ state: 'hidden', timeout: 15000 })
const ring1 = await page.getByTestId('lib-ring').count()
check('第一次失败：任务环消失，横幅带重试', ring1 === 0, String(ring1))
await page.screenshot({ path: `${shots}/2-first-failure.png` })
await page.locator('[data-testid="download-retry"]').first().click()
await page.waitForFunction(() => { const r = document.getElementById('trpg-assistant-root').shadowRoot; return r.querySelectorAll('[data-testid="download-retry"]').length === 1 && !r.querySelector('[data-testid="lib-ring"]') }, null, { timeout: 120000 })
await settle(page, 800)
const ring2 = await page.locator('[data-testid="lib-ring"]').count()
check('点重试再失败：没有下载环，横幅仍在且带重试', ring2 === 0 && (await page.locator('[data-testid="download-retry"]').count()) === 1, `ring ${ring2}`)
await page.screenshot({ path: `${shots}/3-second-failure.png` })
await page.getByRole('button', { name: '书架', exact: true }).click()
await settle(page, 400)
check('切到书架分区，失败横幅还在', (await page.locator('[data-testid="download-banner"]').count()) === 1, '')
// 中英一起下载：两种语言各自一条失败横幅，逐条关掉
for (let i = 0; i < 6 && await page.locator('[data-testid="download-banner"]:not(.trpg-toast-leave-active)').count(); i++) {
  await page.locator('[data-testid="download-banner"]:not(.trpg-toast-leave-active)').first().getByRole('button', { name: '关闭这条提示' }).click()
  await settle(page, 500)
}
check('关掉横幅后不再显示', (await page.locator('[data-testid="download-banner"]').count()) === 0, '')
// 断网时作者程序联网读目录失败的报错（只出在小窗里）是预期的，不算
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
