// 下载页（真实数据，断网）：官方资料按作者分类列出所有书 + 一键安装全部；自制目录有网才拉、断网给原因和重试；
// 冒险下载失败 → 警告环 + 横幅（带重试）；点重试再失败 → 警告环消失、只剩横幅（带重试）；横幅在书架 / 下载分区都看得到。
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

const groups = await page.locator('[data-testid="official-books"] details').count()
const books = await page.locator('[data-testid="official-books"] .trpg-shelf__row').count()
check('官方资料按作者分类列出所有书', groups > 3 && books > 50, `${groups} 组 ${books} 本`)
const topBtn = (await page.locator('[data-testid="official-card"] .lib-dlcard__top').innerText()).replace(/\s+/g, ' ')
check('官方资料有「一键安装全部」（已装好时显示已全部安装）', /一键安装全部|继续安装全部|已全部安装/.test(topBtn), topBtn)
check('不再有「全部规则书和数据」那一句', !(await page.locator('[data-testid="official-card"]').innerText()).includes('全部规则书和数据'), '')
// 断网：目录取不到。可能整个没取回（一条横幅）或中英文各一条取失败的横幅，每条都带重试；不再有要手动点的「载入目录」
const brewRetry = await page.locator('[data-testid="brew-catalog"] .lib-banner--warn button', { hasText: '重试' }).count()
check('断网：自制目录给原因并带重试（不是一个手动载入按钮）', brewRetry >= 1, String(brewRetry))
check('断网时下载页内容照常显示，没有被整页警告盖住', (await page.locator('[data-testid="official-card"]').count()) === 1, '')

// 冒险下载失败 → 环 + 横幅
// C 段起冒险并进「官方资料与冒险」一栏：先点类型「冒险」、展开第一组
await page.locator('[data-testid="kind-adventure"]').click()
await page.locator('[data-testid="official-card"] .lib-dlgrp__btn').first().click()
await page.locator('[data-testid="official-card"] .trpg-row button', { hasText: '下载' }).first().click()
await page.waitForSelector('[data-testid="download-banners"] [data-testid="download-retry"]', { timeout: 120000 })
await settle(page, 500)
const ring1 = await page.locator('[data-testid="lib-ring"]').getAttribute('data-state').catch(() => null)
check('第一次失败：警告环亮着，横幅带重试', ring1 === 'warn', String(ring1))
await page.screenshot({ path: `${shots}/2-first-failure.png` })
await page.locator('[data-testid="download-retry"]').first().click()
await page.waitForFunction(() => { const r = document.getElementById('trpg-assistant-root').shadowRoot; return r.querySelectorAll('[data-testid="download-retry"]').length === 1 && !r.querySelector('[data-testid="lib-ring"]') }, null, { timeout: 120000 })
await settle(page, 800)
const ring2 = await page.locator('[data-testid="lib-ring"]').count()
check('点重试再失败：警告环消失，横幅仍在且带重试', ring2 === 0 && (await page.locator('[data-testid="download-retry"]').count()) === 1, `ring ${ring2}`)
await page.screenshot({ path: `${shots}/3-second-failure.png` })
await page.getByRole('button', { name: '书架', exact: true }).click()
await settle(page, 400)
check('切到书架分区，失败横幅还在', (await page.locator('[data-testid="download-banners"]').count()) === 1, '')
await page.locator('[aria-label="关闭这条提示"]').first().click()
await settle(page, 300)
check('关掉横幅后不再显示', (await page.locator('[data-testid="download-banners"]').count()) === 0, '')
// 断网时作者程序联网读目录失败的报错（只出在小窗里）是预期的，不算
const realErrors = pageErrors.filter((m) => !/网络错误|Network error/.test(m))
check('页面没有未处理的错误', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
