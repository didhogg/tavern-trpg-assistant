// 下载页自制目录行的【中】【En】标签要跟真实可用语言走（驾驶员 2026-11-14 截图反馈；设计依据 P5-0 D-5：只有一个可选时另一个变灰）。
// 三种行：只有英文 / 只有中文 / 中英都有。断言真实渲染出来的样式（不是只看数据属性）：没有的那一边 = 空心 + 灰 + 划线 + 提示文字，有的那一边 = 实心。
// 用法：node tests/e2e/library/p61-brew-lang-chips.mjs（SKIP_BUILD=1 跳过构建；ENGINE=webkit 跑 WebKit）。截图在 work/p61-shots/。
// 基础资料夹 profile-p3-1-* 的官方数据按端口存，端口 47342 已确认有数据（见 p58 文件头）；外网全部拦掉，目录行由测试直接放进目录 store。
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/../p61-shots`
await mkdir(shots, { recursive: true })
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const profile = `${work}/profile-p61-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 160)))
await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
await page.goto(url)
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"]')
await page.locator('.trpg-seg button', { hasText: '下载' }).first().click()
await page.waitForSelector('[data-testid="brew-catalog"]')
await settle(page, 1500)
await page.evaluate(([P]) => {
  const cat = eval(P)._s.get('brewcatalog')
  const f = (name) => ({ urlDownload: `https://fixtures.example.test/${encodeURIComponent(name)}`, path: `x/${name}`, name, sources: [] })
  cat.rows = [
    { zh: null, en: f('Middle Finger of Vecna; Channeler.json'), status: 'en-only' },
    { zh: f('测试作者; 只有中文的包.json'), en: null, status: 'zh-only' },
    { zh: f('Laserllama; 专长合集.json'), en: f('Laserllama; Compendium of Feats.json'), status: 'paired' },
  ]
}, [P])
await settle(page, 400)

const rows = await page.evaluate(() => {
  const root = document.querySelector('#trpg-assistant-root').shadowRoot
  return [...root.querySelectorAll('[data-testid="brew-list"] .trpg-row')].map((row) => ({
    title: row.querySelector('.trpg-row__title')?.textContent?.trim() ?? '',
    meta: row.querySelector('.trpg-row__meta')?.textContent?.trim() ?? '',
    chips: [...row.querySelectorAll('.trpg-row__end .trpg-badge')].filter((b) => /^(中|En)$/.test(b.textContent.trim())).map((b) => {
      const cs = getComputedStyle(b)
      return { text: b.textContent.trim(), off: b.getAttribute('data-off'), title: b.getAttribute('title'), aria: b.getAttribute('aria-label'), role: b.getAttribute('role'), line: cs.textDecorationLine, bg: cs.backgroundColor, color: cs.color }
    }),
  }))
})
await page.locator('[data-testid="brew-list"]').first().screenshot({ path: `${shots}/chips-${engineName}.png` })
console.log(JSON.stringify(rows, null, 1))

const row = (needle) => rows.find((r) => r.title.includes(needle))
const chip = (r, text) => r?.chips.find((c) => c.text === text)
const isOff = (c) => c?.off === 'true' && c.line.includes('line-through') && c.bg === 'rgba(0, 0, 0, 0)'
const isOn = (c) => c?.off === 'false' && !c.line.includes('line-through') && c.bg !== 'rgba(0, 0, 0, 0)'
const en = row('Channeler'), zh = row('只有中文'), both = row('Laserllama; 专长合集') ?? row('专长合集')
check('三种行都显示出来了，每行都有【中】【En】两个位置', !!en && !!zh && !!both && [en, zh, both].every((r) => r.chips.length === 2), JSON.stringify(rows.map((r) => [r.title, r.chips.length])))
check('只有英文：【En】实心，【中】空心 + 灰 + 划线', isOn(chip(en, 'En')) && isOff(chip(en, '中')), JSON.stringify(en?.chips))
check('只有中文：【中】实心，【En】空心 + 灰 + 划线', isOn(chip(zh, '中')) && isOff(chip(zh, 'En')), JSON.stringify(zh?.chips))
check('中英都有：两个都实心', isOn(chip(both, '中')) && isOn(chip(both, 'En')), JSON.stringify(both?.chips))
check('不只靠颜色：没有的那一边有“没有中文版 / 没有英文版”的提示和读屏文字，有的那一边写“有…”', chip(en, '中')?.title === '没有中文版' && chip(en, '中')?.aria === '没有中文版' && chip(en, 'En')?.title === '有英文版' && chip(zh, 'En')?.title === '没有英文版' && chip(both, '中')?.aria === '有中文版' && chip(en, '中')?.role === 'img', JSON.stringify([chip(en, '中'), chip(zh, 'En')]))
check('“只有英文 / 只有中文”那行文字和标签说的一致（没有再出现标签都亮着但文字说只有一种的情况）', en?.meta.includes('只有英文') && zh?.meta.includes('只有中文') && !both?.meta.includes('只有'), JSON.stringify(rows.map((r) => r.meta)))
check('页面没有未处理的错误（断网预期的除外）', errors.filter((m) => !/gendata-nav|Network|网络|404|Failed to load/.test(m)).length === 0, errors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
await rm(profile, { recursive: true, force: true })
console.log(failures.length ? `FAIL ${failures.length}（截图 ${shots}/chips-${engineName}.png）` : `ALL PASS（截图 ${shots}/chips-${engineName}.png）`)
process.exit(failures.length ? 1 : 0)
