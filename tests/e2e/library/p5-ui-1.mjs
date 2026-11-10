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
const failedReq = []
page.on('requestfailed', (r) => failedReq.push(r.url().slice(0, 140)))
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
// 作者程序装自制包时会去 GitHub 取来源索引（依赖 / 来源信息），所以放行 GitHub / jsDelivr，其余外网仍断开
await page.route((u) => !u.href.startsWith(url), (route) => (/github|jsdelivr|kiwee\.top/.test(route.request().url()) && !process.env.OFFLINE ? route.continue() : route.abort()))
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
check('火球术详情有摘要行（作者列表页的列：环阶 / 学派…）', (await page.locator('[data-testid="entry-summary"]').innerText()).includes('塑能'), await page.locator('[data-testid="entry-summary"]').innerText().catch(() => '无'))
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

// ---- 书架 ⋯：管理 / 存入我的库 / 卸载 ----
const moreOf = (name) => page.locator('.trpg-shelf__row', { hasText: name }).first().locator('.trpg-more')
await moreOf('玩家手册').click()
const menuItems = await page.locator('.trpg-dropdown__item').allInnerTexts()
check('⋯ 菜单有 管理 / 存入我的库 / 卸载官方资料（危险项在最后）', menuItems.length === 3 && menuItems[0].includes('管理') && menuItems[1].includes('存入我的库') && menuItems[2].includes('卸载'), JSON.stringify(menuItems))
await page.locator('.trpg-dropdown__item', { hasText: '管理' }).click()
await page.waitForSelector('[data-testid="manage-page"]')
await settle(page, 800)
check('管理页：停用项目 / 被编辑·覆盖 两个标签，没有时说明', (await page.locator('[data-testid="manage-page"] .trpg-seg button').count()) === 2 && (await page.locator('[data-testid="manage-page"]', { hasText: '没有停用的条目' }).count()) === 1)
await page.locator('.trpg-modal__close').click()
await settle(page, 300)
// 卸载：只点开确认页看影响，然后取消（不真的删官方资料）
await moreOf('玩家手册').click()
await page.locator('.trpg-dropdown__item', { hasText: '卸载' }).click()
await page.waitForSelector('.trpg-confirm')
await settle(page, 600)
const confirmText = await page.locator('.trpg-confirm').innerText()
check('卸载确认页：写明整套官方资料会删除 + 战役 / 存档影响', confirmText.includes('整套官方资料') && /战役|存档|用到/.test(confirmText), confirmText.slice(0, 160))
check('确认页是弹窗里的一页，只有一个弹窗', (await page.locator('.trpg-modal').count()) === 1)
await page.locator('.trpg-confirm button', { hasText: '取消' }).click()
await settle(page, 500)
check('取消后弹窗关闭，书还在', (await page.locator('.trpg-modal').count()) === 0 && (await page.locator('.trpg-shelf__row', { hasText: '玩家手册' }).count()) > 0)

// ---- 我的库：导入一个作者格式文件 → 预览 → 导入 → 出现在列表 → 导出 → 删除 ----
await page.locator('.lib-top .trpg-seg button', { hasText: '我的库' }).click()
await page.waitForSelector('[data-testid="mylib-tab"]')
check('我的库：新建条目按钮是灰的（P5.5）', await page.locator('[data-testid="mylib-tab"] button', { hasText: '新建条目' }).isDisabled())
const brewJson = JSON.stringify({ _meta: { sources: [{ json: 'P5UITEST', abbreviation: 'P5T', full: '界面测试小包', authors: ['测试'], convertedBy: ['测试'], version: '1.0.0' }], dateAdded: 1700000000, dateLastModified: 1700000000 }, spell: [{ name: '界面测试法术', source: 'P5UITEST', level: 1, school: 'A', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'feet', amount: 30 } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['这是界面测试用的法术。'] }] })
await page.getByTestId('mylib-file').setInputFiles({ name: 'p5-ui-test.json', mimeType: 'application/json', buffer: Buffer.from(brewJson) })
await page.waitForSelector('.trpg-confirm', { timeout: 120000 })
const preview = await page.locator('.trpg-confirm').innerText()
check('导入预览：列出文件、新增条数', /界面测试|p5-ui-test/.test(preview) && preview.includes('新增'), preview.slice(0, 200))
await page.locator('.trpg-confirm button', { hasText: '确认导入' }).click()
await page.waitForSelector('[data-testid="mylib-list"] .trpg-row', { timeout: 60000 }).catch(async (e) => { console.log('导入没成功；失败的请求：', failedReq.slice(0, 8), pageErrors.slice(0, 4), await page.locator('.trpg-toasts').innerText().catch(() => '')); throw e })
await settle(page, 800)
check('导入后出现在我的库列表', (await page.locator('[data-testid="mylib-list"] .trpg-row', { hasText: '界面测试小包' }).count()) === 1)
await page.locator('.lib-top .trpg-seg button', { hasText: '书架' }).click()
await settle(page, 800)
check('导入的包不在书架里（书架只放下载来的）', (await page.locator('.trpg-shelf__row', { hasText: '界面测试小包' }).count()) === 0)
await page.locator('.lib-top .trpg-seg button', { hasText: '我的库' }).click()
await settle(page, 500)
const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)
await page.locator('[data-testid="mylib-list"] .trpg-row', { hasText: '界面测试小包' }).locator('button', { hasText: '导出' }).click()
const got = await dl
check('导出：浏览器收到 .json 文件', !!got && (got.suggestedFilename() || '').endsWith('.json'), got ? got.suggestedFilename() : '无下载')
await page.locator('[data-testid="mylib-list"] .trpg-row', { hasText: '界面测试小包' }).locator('.trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '删除' }).click()
await page.waitForSelector('.trpg-confirm')
await page.locator('.trpg-confirm button', { hasText: '确认删除' }).click()
await settle(page, 1500)
check('删除后列表里没有了', (await page.locator('[data-testid="mylib-list"] .trpg-row', { hasText: '界面测试小包' }).count()) === 0)
await page.locator('.lib-top .trpg-seg button', { hasText: '书架' }).click()
await settle(page, 400)

// ---- 书阅读器：包里的"书"类别条目 → 阅读器；目录 / 切章 / 章内术语 ----
await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1200)
check('玩家手册包里有「书」药丸（书是一类条目，不在外壳上放按钮）', (await page.locator('.lib-pills .trpg-pill', { hasText: '书' }).count()) >= 1 && (await page.locator('.trpg-modal__head button', { hasText: '阅读' }).count()) === 0)
await page.locator('.lib-pills .trpg-pill', { hasText: /^书/ }).first().click()
await page.getByTestId('book-row').first().click()
await page.waitForSelector('[data-testid="reader-body"] .lib-dbody', { timeout: 120000 })
await settle(page, 1500)
const chap0 = await page.locator('.lib-rbar .lib-name').innerText()
const text0 = await page.locator('[data-testid="reader-body"]').innerText()
check('阅读器：显示第一章正文', chap0.length > 0 && text0.length > 200, `${chap0} / ${text0.length} 字`)
check('阅读器正文没有残留 {@ 标签', !text0.includes('{@'))
await page.getByTestId('reader-toc').click()
await settle(page, 400)
const tocN = await page.locator('[data-testid="reader-toc-list"] button').count()
check('点【目录】：左侧列出章节', tocN > 5, String(tocN))
await page.locator('[data-testid="reader-toc-list"] button').nth(2).click()
await settle(page, 1200)
check('点目录里的章节：切到那一章', (await page.locator('.lib-rbar .lib-name').innerText()) !== chap0)
await page.getByRole('button', { name: '下一章' }).click()
await settle(page, 800)
check('下一章 / 上一章可用，且只有一个弹窗', (await page.locator('.trpg-modal').count()) === 1)
await shot('reader')
await page.locator('.trpg-modal__close').click()
await settle(page, 300)

// ---- 种族：亚种全部直接列出（不用下拉）----
await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1000)
await page.locator('.lib-pills .trpg-pill', { hasText: /^种族/ }).first().click()
await page.waitForSelector('[data-testid="pack-table"] tbody tr', { timeout: 60000 })
await page.locator('[data-testid="pack-page"] input[type="search"]').fill('精灵')
await settle(page, 500)
await page.locator('[data-testid="pack-table"] tbody tr', { hasText: /^精灵/ }).first().click().catch(() => {})
await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
await settle(page, 2000)
const subN = await page.locator('[data-testid="subrace"]').count()
out.subraces = subN
check('精灵页：亚种直接全部列出，没有下拉', subN >= 2 && (await page.locator('[data-testid="entry-page"] .trpg-select-trigger').count()) === 0, String(subN))
await page.locator('.trpg-modal__close').click()
await settle(page, 300)

// ---- 怪物数值块 / 物品摘要行 ----
await page.locator('.trpg-shelf__row .lib-name', { hasText: '怪物图鉴' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1200)
await page.locator('.lib-pills .trpg-pill', { hasText: /^怪物/ }).first().click()
await page.waitForSelector('[data-testid="pack-table"] tbody tr', { timeout: 60000 })
await page.locator('[data-testid="pack-table"] tbody tr').first().click()
await page.waitForSelector('[data-testid="entry-page"] .lib-dbody', { timeout: 60000 })
await settle(page, 1500)
const sb = await page.locator('[data-testid="entry-statblock"]').innerText().catch(() => '')
check('怪物详情有数值块：防御 / 生命 / 速度', ['防御', '生命', '速度'].every((k) => sb.includes(k)), sb.slice(0, 120))
check('怪物详情有六维', (await page.locator('.lib-abil > div').count()) === 6)
check('怪物详情有「动作」等分节', (await page.locator('[data-testid="entry-page"] h3', { hasText: /动作|特性/ }).count()) >= 1)
await shot('monster')
await page.locator('.trpg-modal__close').click()
await settle(page, 300)

// ---- 随机表：表头骰子标签 → 命中行高亮 + 表下结果框（不出横幅）→ 复制 / 填入酒馆输入框 ----
const rollName = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const fr = await lib.service.frameOf('cn')
  const rows = await lib.service.query('cn-official', 'table', {})
  const seen = new Set()
  for (const r of rows.slice(0, 400)) {
    const nm = r.item.name ?? r.item.caption
    if (!nm || seen.has(nm) || !/[\u4e00-\u9fa5]/.test(nm)) continue
    seen.add(nm)
    if ((await fr.call('tableRow', r.item, 1)).rollable && rows.filter((x) => (x.item.name ?? x.item.caption) === nm).length === 1) return nm
  }
  return null
})
out.rollTableName = rollName
check('找到一张能掷的随机表', !!rollName, String(rollName))
if (rollName) {
  await page.locator('[data-testid="open-search"]').click()
  await page.waitForSelector('[data-testid="search-page"]')
  await page.locator('[data-testid="search-page"] input[type="search"]').fill(rollName)
  await page.waitForSelector('[data-testid="search-results"] .lib-list__row', { timeout: 120000 })
  await page.locator('[data-testid="search-results"] .lib-list__row', { hasText: '表格' }).first().click().catch(async () => { await page.locator('[data-testid="search-results"] .lib-list__row').first().click() })
  await page.waitForSelector('[data-testid="entry-page"] [data-testid="roll-header"]', { timeout: 30000 }).catch(async (e) => { console.log('没找到掷骰标签；页面：', (await page.locator('.trpg-modal').innerText()).slice(0, 400)); await shot('roll-fail'); throw e })
  const toastsBefore = await page.locator('.trpg-toast').count()
  await page.getByTestId('roll-header').first().click()
  await page.waitForSelector('[data-testid="roll-result"] [data-testid="roll-text"]', { timeout: 30000 })
  await settle(page, 500)
  const rt = await page.getByTestId('roll-text').innerText()
  check('表内掷：表格下面出结果框「掷出 n：…」', /^掷出/.test(rt), rt.slice(0, 80))
  check('命中行高亮', (await page.locator('.lib-rtable tr[data-hit="true"]').count()) >= 1)
  check('表内掷不出横幅', (await page.locator('.trpg-toast').count()) === toastsBefore)
  await page.getByTestId('roll-fill').first().click()
  await settle(page, 400)
  check('点【填入酒馆输入框】：按钮变「已填入」或明说没填成', (await page.getByTestId('roll-fill').first().innerText()).includes('已填入') || (await page.locator('[data-testid="roll-result"]', { hasText: '没能完成' }).count()) === 1)
  check('结果框里有两个按钮：复制文字 / 填入酒馆输入框', (await page.getByTestId('roll-copy').count()) === 1 && (await page.getByTestId('roll-fill').count()) === 1)
  await shot('roll-table')
  await page.locator('.trpg-modal__close').click()
  await settle(page, 300)
}

// ---- 表外掷：正文里的表格链接旁有骰子标签，点了出横幅（已复制 + 填入酒馆输入框）----
const outside = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const fr = await lib.service.frameOf('cn')
  for (const prop of ['variantrule', 'background', 'item', 'feat']) {
    const rows = await lib.service.query('cn-official', prop, {})
    for (const r of rows.slice(0, 600)) {
      const m = /\{@table ([^}|]+)(\|[^}]*)?\}/.exec(JSON.stringify(r.item.entries ?? ''))
      if (!m) continue
      const tag = await lib.links.resolveTag('cn', '@table', m[0].slice(8, -1))
      const loc = tag?.located
      if (!loc) continue
      const st = await lib.scoped.storedItem({ set: loc.set, prop: loc.prop, hash: loc.hash })
      if (st && (await fr.call('tableRow', st.item, 1)).rollable) return { prop, name: r.item.name, hash: r.hash }
    }
  }
  return null
})
out.outsideTable = outside
if (outside) {
  await page.locator('[data-testid="open-search"]').click()
  await page.waitForSelector('[data-testid="search-page"]')
  await page.locator('[data-testid="search-page"] input[type="search"]').fill(outside.name)
  await page.waitForSelector('[data-testid="search-results"] .lib-list__row', { timeout: 120000 })
  await page.locator('[data-testid="search-results"] .lib-list__row', { hasText: outside.name }).first().click()
  await page.waitForSelector('[data-testid="roll-outside"]', { timeout: 30000 }).catch(() => {})
  const hasDice = (await page.getByTestId('roll-outside').count()) > 0
  check('正文里的表格链接旁有骰子标签（可掷的表）', hasDice, JSON.stringify(outside))
  if (hasDice) {
    await page.getByTestId('roll-outside').first().click()
    await page.waitForSelector('.trpg-toast', { timeout: 15000 })
    const t = await page.locator('.trpg-toast').first().innerText()
    check('表外掷出横幅：已复制 + [填入酒馆输入框]', /剪贴板/.test(t) && /填入酒馆输入框/.test(t), t.slice(0, 100))
  }
  await page.locator('.trpg-modal__close').click()
  await settle(page, 300)
}

// ---- 职业页：职业表 + 按等级特性 + 子职业下拉 ----
await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1000)
await page.locator('.lib-pills .trpg-pill', { hasText: /^职业\d|^职业 / }).first().click().catch(async () => { await page.locator('.lib-pills .trpg-pill', { hasText: '职业' }).first().click() })
await page.waitForSelector('[data-testid="pack-page"] .lib-list__row', { timeout: 60000 })
check('职业没有作者列表列：显示名称 + 灰字来源的简单列表（不显示排序）', (await page.locator('[data-testid="pack-table"]').count()) === 0)
await page.locator('[data-testid="pack-page"] input[type="search"]').fill('法师')
await settle(page, 400)
await page.locator('[data-testid="pack-page"] .lib-list__row', { hasText: '法师' }).first().click()
await page.waitForSelector('[data-testid="class-view"]', { timeout: 30000 }).catch(async (e) => { console.log('职业页没出来：', (await page.locator('.trpg-modal').innerText()).slice(0, 300)); await shot('class-fail'); throw e })
await settle(page, 2000)
check('职业页：有职业表（等级 / 特性 / 作者额外列）20 行', (await page.locator('[data-testid="class-table"] tbody tr').count()) === 20 && (await page.locator('[data-testid="class-table"] thead th').count()) >= 3)
check('职业页：按等级的特性（折叠，前三级展开）', (await page.locator('[data-testid="feature-level"]').count()) >= 5 && (await page.locator('[data-testid="feature-level"][open]').count()) >= 1)
check('职业页：子职业下拉同页切换', (await page.locator('[data-testid="class-view"] .trpg-select-trigger').count()) === 1)
await shot('class')
await page.locator('.trpg-modal__close').click()
await settle(page, 300)

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
out.failedRequests = failedReq.slice(0, 12)
out.failures = failures.length
await writeFile(`${work}/p5-ui-1-${engineName}.json`, JSON.stringify(out, null, 2))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'PASS', pageErrors.length ? `（页面报错 ${pageErrors.length} 条）` : '')
process.exit(failures.length ? 1 : 0)
