// P6 单元 0b 从模板加入（真实插件界面 + 真实库 + 真实结算小窗）：新建 → 从模板加入 → 搜「地精」→ 看资料卡 → 放进敌人 ×3 → 加入列表 → 本次已加入 → 撤销 → 窄屏。
// 截图 work/p6-ui/shots-0b-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0a.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47321 })
const profile = `${work}/profile-p3-1-${engineName}` // 和 p6-people 共用：官方资料装过就不再下载
const shots = `${process.cwd()}/work/p6-ui/shots-0b-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役（走开局向导的后端入口）+ 真实建卡两人 ----
  const made = await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '人物列表测试', codeSet: 'cn' }))
    const be = app.svc().backend; const owner = camp.owner.ownerKey
    const { plan } = await h.pickChainEntries(await be.kernelSave.libraryOf(owner), 'barbarian')
    const items = ['race', 'background', 'class'].map((k) => plan[k].ref)
    await be.kernel.enter(owner)
    const a = await be.people.build(owner, { name: '盖尔', items }, { category: 'party', tags: ['学者'] })
    const b = await be.people.build(owner, { name: '矿工', items }, { category: 'enemy' })
    return { a: a.built.status, b: b.built.status, n: b.kernel?.actors.length }
  }, pinia)
  check('真实建卡两个人', made.a === 'complete' && made.b === 'complete' && made.n === 2, JSON.stringify(made))

  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('.pp-row .pp-name'); await settle(page, 600)
  await page.getByRole('button', { name: '新建', exact: true }).click()
  const items = await page.getByRole('menuitem').allTextContents()
  check('新建菜单只有做好的一项：从模板加入', items.length === 1 && /从模板加入/.test(items[0]), items.join('|'))
  await page.getByRole('menuitem', { name: /从模板加入/ }).click()
  await page.getByTestId('template-page').waitFor()
  await page.waitForSelector('[data-testid=tp-row]'); await settle(page, 800)
  await shot('01-template')
  check('模板列表列出库里的怪物', (await page.getByTestId('tp-row').count()) > 5)
  await page.getByTestId('tp-search').fill('Goblin'); await settle(page, 500)
  let names = await page.getByTestId('tp-row').locator('.lib-name').allTextContents()
  if (!names.length) { await page.getByTestId('tp-search').fill('地精'); await settle(page, 500); names = await page.getByTestId('tp-row').locator('.lib-name').allTextContents() }
  check('搜到地精', names.length >= 1, names.join('|'))
  check('右侧显示资料卡', (await page.getByTestId('tp-card').innerText()).length > 20)
  await page.getByTestId('tp-row').filter({ has: page.locator('.lib-name', { hasText: /^地精$/ }) }).first().click(); await settle(page, 800)
  await shot('02-search-card')
  // 放进敌人 ×3
  await page.getByRole('group', { name: '放进哪一类' }).getByRole('button', { name: '敌人' }).click()
  await page.getByRole('button', { name: '多一个' }).click(); await page.getByRole('button', { name: '多一个' }).click()
  await page.getByTestId('tp-add').click()
  await page.getByTestId('tp-added').waitFor(); await settle(page, 800)
  check('底栏显示「本次已加入：地精 ×3」', /地精 ×3/.test(await page.getByTestId('tp-added').innerText()), await page.getByTestId('tp-added').innerText())
  await shot('03-added')
  await page.getByTestId('tp-added').getByRole('button', { name: '撤销' }).click(); await settle(page, 1500)
  check('撤销后「本次已加入」没了', !(await page.locator('.tp-bar').innerText()).includes('×3'))
  await page.getByTestId('tp-add').click(); await page.getByTestId('tp-added').waitFor(); await settle(page, 800)
  await page.locator('.trpg-modal__close').click(); await settle(page, 800)
  await page.getByTestId('pp-tab-enemy').click(); await settle(page, 400)
  const en = await page.locator('.pp-row .pp-name b').allTextContents()
  check('敌人里是「地精 1 / 2 / 3」（库里的中文名按规则编号），数值是官方算好的', ['地精 1', '地精 2', '地精 3'].every((n) => en.includes(n)) && !en.some((n) => /Goblin/.test(n)) && !(await page.locator('.pp-hp__none').count()), en.join('|'))
  await shot('04-list-after')
  // 窄屏
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 600)
  await page.locator('.trpg-tabs').getByRole('button', { name: '人物' }).click(); await settle(page, 400)
  await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /从模板加入/ }).click()
  await page.getByTestId('template-page').waitFor(); await page.waitForSelector('[data-testid=tp-row]'); await settle(page, 800)
  await shot('05-narrow')
  check('窄屏：只有列表，没有并排资料卡，底栏有「看资料卡」', (await page.getByTestId('tp-card').count()) === 0 && (await page.getByRole('button', { name: '看资料卡' }).count()) === 1)
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
  await shot('99-crash').catch(() => undefined)
} finally {
  const bad = errors.filter((e) => !/gendata-nav-adventure-book-index|plutonium|net::ERR|Failed to load resource|requires usable window dimensions/.test(e))
  check('没有未解释的页面报错', bad.length === 0, bad.join(' | ').slice(0, 600))
  clearTimeout(killer); await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
