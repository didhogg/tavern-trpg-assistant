// P5 库界面第 1 批的真实浏览器验证：书架（官方 / 自制分开、无战役全部关）、点包 → 居中弹窗（宽）/ 底部抽屉（窄）、
// 类别药丸 + 搜索 + 排序、点条目 → 弹窗内换页 → ‹ 返回保留搜索词。用已装好中英官方数据的资料夹副本，不联网。
// 用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-ui-1.mjs
import { writeFile, cp, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5ui-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const shotDir = `${work}/p5-ui-shots-${engineName}`
await rm(shotDir, { recursive: true, force: true })
const out = {}
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
await page.locator('.trpg-ball').click()
await settle(page, 600)
const shot = async (name) => { await page.screenshot({ path: `${shotDir}/${name}.png` }); out.shots = [...(out.shots ?? []), `${shotDir}/${name}.png`] }

// ---- 进库页 ----
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 60000 }).catch(async (e) => {
  await page.screenshot({ path: `${shotDir}/FAIL-shelf.png` })
  console.log('书架没出现：', await page.locator('.trpg-content').innerText(), pageErrors)
  throw e
})
await settle(page, 400)
check('库页打开，标题是「库」', (await page.locator('.trpg-head__title').innerText()) === '库')
check('书架分「官方」块', (await page.locator('.lib-sec', { hasText: '官方' }).count()) >= 1)
const rowCount = await page.locator('.trpg-shelf__row').count()
check('书架有已下载的书', rowCount > 0, String(rowCount))
const switches = await page.locator('.trpg-shelf__row .trpg-switch').evaluateAll((els) => els.map((e) => ({ on: e.getAttribute('aria-checked'), dis: e.disabled })))
check('无战役：所有书显示为关、开关不可用（R60）', switches.length > 0 && switches.every((s) => s.on === 'false' && s.dis), JSON.stringify(switches.slice(0, 3)))
check('无战役有一句提示', (await page.locator('.lib-banner', { hasText: '先创建战役' }).count()) === 1)
await shot('shelf-wide')

// ---- 点包 → 居中弹窗 ----
const phb = page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first()
check('书架里有《玩家手册》', (await phb.count()) === 1)
await phb.click()
await page.waitForSelector('[data-testid="pack-page"] .lib-list__row', { timeout: 180000 })
await settle(page, 500)
check('弹窗是 sheet 变体', (await page.locator('.trpg-modal').getAttribute('data-variant')) === 'sheet')
const card = await page.locator('.trpg-modal__card').boundingBox()
const win = await page.locator('.trpg-window').boundingBox()
check('宽屏：弹窗居中浮在窗口上', Math.abs(card.x + card.width / 2 - (win.x + win.width / 2)) < 6, JSON.stringify({ card, win }))
check('弹窗里有搜索框与类别药丸', (await page.locator('[data-testid="pack-page"] input[type="search"]').count()) === 1 && (await page.locator('.lib-pills .trpg-pill').count()) > 2)
check('药丸里有「法术」', (await page.locator('.lib-pills .trpg-pill', { hasText: '法术' }).count()) === 1)
check('没有"书目来源"勾选', (await page.locator('[data-testid="pack-page"] .trpg-check').count()) === 0)
check('每行用灰字标来源', (await page.locator('.lib-list__row .lib-src').first().innerText()).length > 0)
await shot('pack-wide')

// ---- 选法术药丸 → 排序列来自后端 ----
await page.locator('.lib-pills .trpg-pill', { hasText: '法术' }).click()
await settle(page, 600)
const spellRows = await page.locator('.lib-list__row').count()
check('选「法术」后有行', spellRows > 10, String(spellRows))
check('法术有排序下拉（列来自后端）', (await page.locator('.lib-sortbar').count()) === 1)
// ---- 搜索 ----
await page.locator('[data-testid="pack-page"] input[type="search"]').fill('火球')
await settle(page, 400)
const hit = page.locator('.lib-list__row .lib-name', { hasText: '火球术' }).first()
check('搜「火球」能找到火球术', (await hit.count()) === 1)
await hit.click()
await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
await settle(page, 1200)
const title = await page.locator('.trpg-modal__title').innerText()
check('弹窗内换成条目详情，标题是条目名', title.includes('火球术'), title)
check('只有一个弹窗（不叠加）', (await page.locator('.trpg-modal').count()) === 1)
const bodyText = await page.locator('[data-testid="entry-page"] .lib-dbody').innerText()
check('详情有正文（有"火"字且不是空）', bodyText.length > 40 && !bodyText.includes('这一条没有正文'), bodyText.slice(0, 60))
check('正文里没有残留的 {@ 标签', !bodyText.includes('{@'), bodyText.slice(0, 200))
check('详情壳有「本战役启用」开关（无战役不可用）与灰色的编辑按钮', (await page.locator('[data-testid="entry-page"] .trpg-switch').isDisabled()) && (await page.locator('[data-testid="entry-page"] button[aria-label^="编辑"]').isDisabled()))
await shot('entry-wide')
// ---- ‹ 返回：搜索词与药丸保留 ----
await page.locator('.trpg-modal__back').click()
await settle(page, 500)
check('‹ 返回后搜索词还在', (await page.locator('[data-testid="pack-page"] input[type="search"]').inputValue()) === '火球')
check('‹ 返回后药丸还是「法术」', (await page.locator('.lib-pills .trpg-pill[aria-pressed="true"]').innerText()).includes('法术'))
// ---- 术语跳转：点正文里的链接，弹窗内再换一页，仍然只有一个弹窗 ----
await hit.click()
await page.waitForSelector('[data-testid="entry-page"] .trpg-term', { timeout: 60000 }).catch(() => {})
const terms = await page.locator('[data-testid="entry-page"] .trpg-term').count()
out.terms = terms
if (terms) {
  await page.locator('[data-testid="entry-page"] .trpg-term').first().click()
  await settle(page, 1500)
  check('点术语：弹窗内再前进一页，仍只有一个弹窗', (await page.locator('.trpg-modal').count()) === 1 && (await page.locator('.trpg-modal__page').count()) === 3)
}
// ---- ✕ 一次整个退出 ----
await page.locator('.trpg-modal__close').click()
await settle(page, 500)
check('✕ 一次关掉整个弹窗', (await page.locator('.trpg-modal').count()) === 0)

// ---- 窄屏：底部抽屉 ----
await page.setViewportSize({ width: 390, height: 800 })
await settle(page, 600)
await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-list__row', { timeout: 120000 })
await settle(page, 500)
const narrowCard = await page.locator('.trpg-modal__card').boundingBox()
const narrowWin = await page.locator('.trpg-window').boundingBox()
check('窄屏：弹窗贴底部、约 88% 高（底部抽屉）', Math.abs(narrowCard.y + narrowCard.height - (narrowWin.y + narrowWin.height)) < 4 && narrowCard.height / narrowWin.height > 0.8 && narrowCard.height / narrowWin.height < 0.95, JSON.stringify({ narrowCard, narrowWin }))
await shot('pack-narrow')

out.pageErrors = pageErrors
out.failures = failures.length
await writeFile(`${work}/p5-ui-1-${engineName}.json`, JSON.stringify(out, null, 2))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'PASS', pageErrors.length ? `（页面报错 ${pageErrors.length} 条）` : '')
process.exit(failures.length ? 1 : 0)
