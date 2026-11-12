// P5-5 §11.5：详情正文改用作者整条渲染（Chrome，真实中文资料副本）。
// 转生术的掷骰范围格子、整张表掷骰与命中高亮；传奇组怪物的巢穴动作 / 区域效应；卡牌牌面进图片标签；怪物头像进图片标签；背景里的表格。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-e-author-render.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 420000)
const profile = await mkdtemp(join(work, 'p5-t6-e-author-render-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(40000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  const active = () => page.locator('.trpg-modal__page:not(.is-under)')
  const close = () => page.getByRole('button', { name: '关闭', exact: true }).click()
  const open = async (name, kind, src) => {
    await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
    await page.getByLabel('搜索全部已开启的书').fill(name)
    await page.getByTestId('search-results').locator('button').filter({ has: page.getByText(name, { exact: true }) }).filter({ hasText: kind }).filter({ hasText: src ?? /./ }).first().click()
    await active().getByTestId('entry-author').waitFor()
  }
  const samples = await page.evaluate(async (P) => {
    const s = eval(P)._s.get('app').svc().backend.library.service
    const groups = await s.parsed('cn-official', 'legendaryGroup')
    const withLair = new Set(groups.items.filter((g) => g.lairActions && g.regionalEffects).map((g) => g.name))
    const mons = await s.parsed('cn-official', 'monster')
    const lg = mons.items.find((m) => m.legendaryGroup && withLair.has(m.legendaryGroup.name))
    const cards = await s.parsed('cn-official', 'card')
    const card = cards.items.find((c) => c.face)
    const tok = mons.items.find((m) => m.hasToken && !m.hasFluffImages)
    return { lg: lg.name, card: card.name, tok: tok?.name ?? null }
  }, P)
  result.info.samples = samples

  // 转生术：掷骰范围格子由作者画（01-04 …），不再是「暂时无法显示」
  await open('转生术', '法术', /\bPHB\b/)
  const body = active().getByTestId('entry-author')
  await body.getByTestId('author-table').first().waitFor()
  const txt = await body.innerText()
  ok('转生术的表：掷骰范围照作者显示 01-04，没有「暂时无法显示」', /01-04/.test(txt) && !/暂时无法显示/.test(await active().innerText()), txt.slice(0, 80))
  await active().getByTestId('roll-header').first().click()
  await active().getByTestId('roll-result').waitFor()
  const hitRow = await active().locator('[data-testid="author-table"] tbody tr[data-hit="true"]').count()
  const resultText = await active().getByTestId('roll-result').innerText()
  const rolled = Number(resultText.match(/掷出 (\d+)/)?.[1])
  const hitText = await active().locator('[data-testid="author-table"] tbody tr[data-hit="true"]').innerText()
  const [lo, hi] = hitText.match(/(\d+)(?:-(\d+))?/).slice(1).map((x, i, a) => Number(x ?? a[0]))
  ok('点【掷】：作者表格里命中行高亮且和掷出的数对得上，结果框不重复显示范围格子', hitRow === 1 && rolled >= lo && rolled <= hi && !/\{|"roll"/.test(resultText), { rolled, hitRow: hitText.replace(/\s+/g, ' '), result: resultText.replace(/\n/g, ' | ').slice(0, 80) })
  await page.screenshot({ path: join(profile, 'reincarnate.png') })
  await close()

  // 作者标的骰子（ve-roller）画成骰子标签，不留成普通文字
  await open('酸液飞溅', '法术')
  const dice = await active().getByTestId('entry-author').locator('.lib-dice').count()
  const leftover = await active().getByTestId('entry-author').locator('.ve-roller, .render-roller').count()
  ok('法术正文里的骰子是骰子标签（酸液飞溅）', dice >= 2 && leftover === 0, { dice, leftover })
  await page.screenshot({ path: join(profile, 'spell-dice.png') })
  await close()

  // 传奇组怪物：巢穴动作 / 区域效应由作者整条渲染带出
  await open(samples.lg, '怪物')
  const mtxt = await active().getByTestId('entry-author').innerText()
  ok('传奇组怪物：显示巢穴动作和区域效应（作者整条渲染）', /巢穴动作/.test(mtxt) && /区域效应/.test(mtxt), { name: samples.lg, len: mtxt.length })
  await page.screenshot({ path: join(profile, 'legendary.png') })
  await close()

  // 卡牌：牌面在卡牌自己的 face 字段 → 图片标签有图
  await open(samples.card, '卡牌')
  await active().getByRole('tab', { name: '图片' }).click()
  await page.waitForTimeout(800)
  const cardImgs = await active().locator('[role=tabpanel]:visible .lib-gallery > *').count()
  ok('卡牌：图片标签里有牌面', cardImgs >= 1, { card: samples.card, cardImgs })
  await page.screenshot({ path: join(profile, 'card-images.png') })
  await close()

  // 只有头像、没有背景图的怪物：图片标签里有头像
  if (samples.tok) {
    await open(samples.tok, '怪物')
    await active().getByRole('tab', { name: '图片' }).click()
    await page.waitForTimeout(800)
    const tokText = await active().locator('[role=tabpanel]:visible').innerText()
    ok('只有头像的怪物：图片标签里有头像', /头像/.test(tokText), { name: samples.tok, text: tokText.slice(0, 60) })
    await close()
  }
  // §12：带武器精通的自制武器（中文版精通名「削弱|XPHB」）能解析发布——以前解析前没装作者的物品参考表，报「Item mastery … not found」
  const mastery = await page.evaluate(async (P) => {
    const L = eval(P)._s.get('app').svc().backend.library
    const file = { _meta: { sources: [{ json: 'MasteryProbe', abbreviation: 'MP', full: 'MasteryProbe', authors: [] }] }, baseitem: [{ name: '精通测试剑', source: 'MasteryProbe', type: 'M', rarity: 'none', weaponCategory: 'martial', dmg1: '1d8', dmgType: 'S', weapon: true, mastery: ['削弱|XPHB'] }] }
    try { await L.service.brewImport('cn-brew', [{ name: 'MasteryProbe.json', text: JSON.stringify(file) }]); return { ok: true } } catch (e) { return { ok: false, error: String(e.message ?? e).slice(0, 160) } }
  }, P)
  ok('带武器精通的自制武器能装上（解析前先做作者物品页的准备）', mastery.ok, mastery)
  const real = result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e))
  ok('没有界面自己的页面错误（含「找不到物品类型 / 属性」）', real.length === 0, real)
} catch (e) {
  result.error = String(e?.stack ?? e)
  console.log('ERROR', result.error)
} finally {
  await writeFile(join(profile, 'result.json'), JSON.stringify(result, null, 1))
  console.log(profile)
  const fails = Object.values(result.checks).filter((v) => !v).length + (result.error ? 1 : 0)
  console.log(fails ? `FAIL ${fails}` : 'ALL PASS')
  await ctx.close(); server.close()
  process.exit(fails ? 1 : 0)
}
