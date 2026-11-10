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
await page.waitForSelector('[data-testid="pack-table"] tbody tr', { timeout: 60000 })
const spellRows = await page.locator('[data-testid="pack-table"] tbody tr').count()
check('选「法术」后有行', spellRows > 10, String(spellRows))
await page.waitForSelector('[data-testid="pack-table"] tbody tr', { timeout: 60000 })
const heads = await page.locator('[data-testid="pack-table"] thead th').allInnerTexts()
check('法术表头来自作者列表页：名称 / 环阶 / 时间 / 学派 / 范围', ['名称', '环阶', '时间', '学派', '范围'].every((h) => heads.some((t) => t.includes(h))), JSON.stringify(heads))
check('能排序的列是可点的表头按钮', (await page.locator('[data-testid="pack-table"] .lib-th').count()) >= 4)
await shot('pack-spell-table')
await page.locator('[data-testid="pack-table"] .lib-th', { hasText: '环阶' }).click()
await settle(page, 800)
const firstLevels = await page.locator('[data-testid="pack-table"] tbody tr').evaluateAll((rows, i) => rows.slice(0, 12).map((r) => r.children[i].textContent), heads.findIndex((t) => t.includes('环阶')))
check('点「环阶」升序：最前面是戏法', firstLevels.every((t) => t.includes('戏法')), JSON.stringify(firstLevels))
await page.locator('[data-testid="pack-table"] .lib-th', { hasText: '环阶' }).click()
await settle(page, 800)
const topLevels = await page.locator('[data-testid="pack-table"] tbody tr').evaluateAll((rows, i) => rows.slice(0, 3).map((r) => r.children[i].textContent), heads.findIndex((t) => t.includes('环阶')))
check('再点降序：最前面是 9 环', topLevels.every((t) => t.includes('9')), JSON.stringify(topLevels))
// ---- 搜索 ----
await page.locator('[data-testid="pack-page"] input[type="search"]').fill('火球')
await settle(page, 400)
const hit = page.locator('[data-testid="pack-table"] tbody tr', { hasText: '火球术' }).first()
check('搜「火球」能找到火球术', (await hit.count()) === 1)
check('火球术那一行有学派「塑能」', (await hit.innerText()).includes('塑能'), await hit.innerText())
await hit.click()
await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
await settle(page, 1200)
const title = await page.locator('.trpg-modal__title').innerText()
check('弹窗内换成条目详情，标题是条目名', title.includes('火球术'), title)
check('只有一个弹窗（不叠加）', (await page.locator('.trpg-modal').count()) === 1)
const bodyText = await page.locator('[data-testid="entry-page"] .lib-dbody').innerText()
check('详情有正文（有"火"字且不是空）', bodyText.length > 40 && !bodyText.includes('这一条没有正文'), bodyText.slice(0, 60))
check('条目来源行有书的全名', (await page.locator('[data-testid="entry-page"] .lib-srcline').innerText()).includes('玩家手册'), await page.locator('[data-testid="entry-page"] .lib-srcline').innerText())
check('正文里没有残留的 {@ 标签', !bodyText.includes('{@'), bodyText.slice(0, 200))
check('详情壳有「本战役启用」开关（无战役不可用）与灰色的编辑按钮', (await page.locator('[data-testid="entry-page"] .trpg-switch').isDisabled()) && (await page.locator('[data-testid="entry-page"] button[aria-label^="编辑"]').isDisabled()))
await shot('entry-wide')
// ---- ‹ 返回：搜索词与药丸保留 ----
await page.locator('.trpg-modal__back').click()
await settle(page, 500)
check('‹ 返回后搜索词还在', (await page.locator('[data-testid="pack-page"] input[type="search"]').inputValue()) === '火球')
check('‹ 返回后药丸还是「法术」', (await page.locator('.lib-pills .trpg-pill[aria-pressed="true"]').innerText()).includes('法术'))
// ---- 术语跳转：找一条正文里有链接的法术，点链接，弹窗内再换一页，仍然只有一个弹窗 ----
const linked = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const rows = (await lib.service.query('cn-official', 'spell', { source: 'PHB' })).filter((x) => x.hash)
  for (const r of rows) if (/\{@(spell|condition|creature|item|skill|sense|class|race|action)\s/.test(JSON.stringify(r.item.entries))) return r.item.name
  return null
})
out.linkedSpell = linked
check('找到一条正文里有链接的法术', !!linked, String(linked))
if (linked) {
  await page.locator('[data-testid="pack-page"] input[type="search"]').fill(linked)
  await settle(page, 500)
  await page.locator('[data-testid="pack-table"] tbody tr', { hasText: linked }).first().click()
  await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
  await page.waitForSelector('[data-testid="entry-page"] .trpg-term', { timeout: 30000 }).catch(() => {})
  const terms = await page.locator('[data-testid="entry-page"] .trpg-term').count()
  check('正文里的链接渲染成下划线术语', terms > 0, String(terms))
  if (terms) {
    const before = await page.locator('.trpg-modal__title').innerText()
    await page.locator('[data-testid="entry-page"] .trpg-term').first().click()
    await page.waitForFunction((t) => document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-modal__title')?.textContent !== t && document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll('.trpg-modal__page').length === 3, before, { timeout: 30000 }).catch(() => {})
    await settle(page, 800)
    check('点术语：弹窗内再前进一页（三层），仍只有一个弹窗', (await page.locator('.trpg-modal').count()) === 1 && (await page.locator('.trpg-modal__page').count()) === 3)
    await page.locator('.trpg-modal__back').click()
    await settle(page, 400)
    check('‹ 返回一次回到上一条', (await page.locator('.trpg-modal__title').innerText()) === before)
  }
}
// ---- ✕ 一次整个退出 ----
await page.locator('.trpg-modal__close').click()
await settle(page, 500)
check('✕ 一次关掉整个弹窗', (await page.locator('.trpg-modal').count()) === 0)

// ---- 开一个战役：开关可用、点了即时生效且写进战役设置 ----
await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const pinia = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia
  const camp = pinia._s.get('campaign')
  await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '界面测试战役', codeSet: 'cn' }))
})
await settle(page, 1500)
await page.locator('.trpg-nav', { hasText: '首页' }).click()
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
await settle(page, 800)
check('有战役后：没有"先创建战役"提示', (await page.locator('.lib-banner', { hasText: '先创建战役' }).count()) === 0)
const sw0 = await page.locator('.trpg-shelf__row .trpg-switch').first().evaluate((e) => ({ on: e.getAttribute('aria-checked'), dis: e.disabled }))
check('有战役：开关可用', sw0.dis === false, JSON.stringify(sw0))
const row0 = page.locator('.trpg-shelf__row').first()
const nameBefore = await row0.locator('.lib-name').innerText()
const onBefore = await row0.locator('.trpg-switch').getAttribute('aria-checked')
await row0.locator('.trpg-switch').click()
await settle(page, 1500)
const row0b = page.locator('.trpg-shelf__row', { hasText: nameBefore }).first()
const onAfter = await row0b.locator('.trpg-switch').getAttribute('aria-checked')
check('点开关：状态翻转（即时生效，不出预览）', onAfter !== onBefore && (await page.locator('.trpg-modal').count()) === 0, `${onBefore} → ${onAfter}`)
await row0b.locator('.trpg-switch').click()
await settle(page, 1500)
check('再点一次：翻回去', (await page.locator('.trpg-shelf__row', { hasText: nameBefore }).first().locator('.trpg-switch').getAttribute('aria-checked')) === onBefore)
await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-list__row', { timeout: 120000 })
check('有战役：包弹窗头的开关可用', (await page.locator('.trpg-modal__head .trpg-switch').isDisabled()) === false)
await page.locator('.trpg-modal__close').click()
await settle(page, 400)


// ---- 全库数据搜索（弹窗 + 书目范围勾选栏）----
await page.locator('[data-testid="open-search"]').click()
await page.waitForSelector('[data-testid="search-page"]')
await settle(page, 400)
check('搜索弹窗也是 sheet，标题「全库数据搜索」', (await page.locator('.trpg-modal').getAttribute('data-variant')) === 'sheet' && (await page.locator('.trpg-modal__title').innerText()) === '全库数据搜索')
check('书目范围默认折叠', !(await page.locator('[data-testid="search-books"]').evaluate((e) => e.open)))
await page.locator('[data-testid="search-page"] input[type="search"]').fill('火球术')
await page.waitForSelector('[data-testid="search-results"] .lib-list__row', { timeout: 120000 })
await settle(page, 400)
const hitsN = await page.locator('[data-testid="search-results"] .lib-list__row').count()
const firstNames = await page.locator('[data-testid="search-results"] .lib-name').allInnerTexts()
out.searchSample = firstNames.slice(0, 5)
check('搜「火球术」有结果且名字对', hitsN > 0 && firstNames.some((n) => n.includes('火球术')), JSON.stringify(firstNames.slice(0, 5)))
check('结果行有类别徽章与灰字来源', (await page.locator('[data-testid="search-results"] .lib-list__row .trpg-badge').first().innerText()).length > 0 && (await page.locator('[data-testid="search-results"] .lib-src').first().innerText()).length > 0)
await page.locator('[data-testid="search-books"] summary').click()
await settle(page, 400)
check('展开书目范围：列出已开启的书并带勾选', (await page.locator('[data-testid="search-books"] .trpg-check').count()) > 0)
const checked = await page.locator('[data-testid="search-books"] summary small').innerText()
// 取消勾选玩家手册 → 火球术（PHB）被屏蔽
await page.locator('[data-testid="search-books"] .trpg-check', { hasText: '玩家手册' }).first().click()
await settle(page, 400)
const afterN = await page.locator('[data-testid="search-results"] .lib-list__row').count().catch(() => 0)
check('取消勾选一本书：命中减少，出现"已屏蔽"提示', afterN < hitsN && (await page.locator('.lib-banner', { hasText: '已屏蔽' }).count()) === 1, `${hitsN} → ${afterN}，${checked}`)
await page.locator('[data-testid="search-books"] button', { hasText: '全选' }).first().click()
await settle(page, 300)
await page.locator('[data-testid="search-results"] .lib-list__row', { hasText: '火球术' }).first().click()
await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
check('点结果：弹窗内换成详情', (await page.locator('.trpg-modal__title').innerText()).includes('火球术'))
await page.locator('.trpg-modal__back').click()
await settle(page, 400)
check('‹ 返回后搜索词和结果还在', (await page.locator('[data-testid="search-page"] input[type="search"]').inputValue()) === '火球术' && (await page.locator('[data-testid="search-results"] .lib-list__row').count()) > 0)
await page.locator('.trpg-modal__close').click()
await settle(page, 300)
// 折叠状态记住：再开一次仍是展开
await page.locator('[data-testid="open-search"]').click()
await page.waitForSelector('[data-testid="search-page"]')
await settle(page, 400)
check('折叠状态被记住（上次展开了，这次还是展开）', await page.locator('[data-testid="search-books"]').evaluate((e) => e.open))
await page.locator('[data-testid="search-books"] summary').click()
await settle(page, 300)
await page.locator('.trpg-modal__close').click()
await settle(page, 300)

// ---- 下载页：官方资料已装、冒险列表 ----
await page.locator('.lib-top button', { hasText: '下载' }).click()
await page.waitForSelector('[data-testid="download-tab"]')
await page.waitForSelector('[data-testid="official-card"]', { timeout: 60000 })
await settle(page, 800)
check('下载页：官方资料显示「已安装」', (await page.locator('[data-testid="official-card"] .trpg-badge', { hasText: '已安装' }).count()) === 1)
const advN = await page.locator('[data-testid="adventure-list"] .trpg-row').count()
out.adventureRows = advN
check('下载页：列出冒险，已装的标「已装」', advN > 5)
check('自制包区说明稍后开放（不假装能用）', (await page.locator('[data-testid="download-tab"]', { hasText: '稍后开放' }).count()) === 1)
await shot('download-wide')
await page.locator('.lib-top button', { hasText: '书架' }).click()
await settle(page, 400)

// ---- 设置 → 库：偏好（立即生效）、日志 ----
await page.locator('.trpg-window nav').getByRole('button', { name: '设置' }).click()
await page.getByTestId('settings-library').click()
await page.waitForSelector('[data-testid="lib-prefs"]')
check('设置里有「库」栏目，偏好有分类方式 / 默认层级 / 两个开关', (await page.locator('[data-testid="lib-prefs"] .trpg-settings__row').count()) === 4)
await page.locator('[data-testid="lib-prefs"] .trpg-seg button', { hasText: '书或冒险' }).click()
await settle(page, 600)
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
const groupNames = await page.locator('.trpg-shelf__sum').allInnerTexts()
check('分类方式改成「书或冒险」：书架立刻按它分组', groupNames.some((t) => t.startsWith('书')) && !groupNames.some((t) => t.startsWith('核心')), JSON.stringify(groupNames))
await page.locator('.trpg-window nav').getByRole('button', { name: '设置' }).click()
await page.getByTestId('settings-library').click()
await page.locator('[data-testid="lib-prefs"] .trpg-seg button', { hasText: '作者分组' }).click()
await settle(page, 400)
await page.locator('.lib-top .trpg-seg button', { hasText: '日志' }).click()
await page.waitForSelector('[data-testid="lib-logs"] .lib-sumline', { timeout: 60000 })
check('日志页有汇总与复制 / 导出按钮', (await page.locator('[data-testid="lib-logs"] button', { hasText: '复制全部日志' }).count()) === 1 && (await page.locator('[data-testid="lib-logs"] button', { hasText: '导出' }).count()) === 1)
await page.locator('.lib-top .trpg-seg button', { hasText: '全局编辑' }).click()
await settle(page, 800)
check('全局编辑 / 覆盖页能打开（没有时说明还没有）', (await page.locator('[data-testid="lib-edits"]').count()) === 1)
await shot('lib-settings')
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await settle(page, 400)

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
