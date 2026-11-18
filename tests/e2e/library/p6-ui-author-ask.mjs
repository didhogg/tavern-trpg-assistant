// P6 建卡作者窗口桥 · 整个建卡页（驾驶员 2026-11-18：全部作者小窗一个格式接，搬到建卡页右边）：2014 人类 → 侍僧 → 牧师 → 创建。
// 作者开的每个窗口都整个搬到那件条目右边「它要你做的选择」里（插件主题），玩家直接点作者窗口里的控件；答完收成打勾的标题。
// 旧注释（来源模板）：P6 人物（一）额外选择按组选（真实插件界面 + 真实库 + 真实结算小窗）：2024 人类 + 2024 战士 → 专长这一步出现两个组名标签（起源专长 / 战斗风格，组名后端给）→ 点标签切换、每组各选 1 → 完成页没有专长待填 → 创建 → 人物身上两个专长；窄屏标签不撑破。
// 截图 work/p6-ui/shots-0c-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0c-groups.mjs
import { rm, mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

const dist = process.env.P6_TEST_DIST
if (!dist && !process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-author-ask') // 克隆干净底座（npm run e2e:base 造），跑完自动删（KEEP_PROFILE=1 保留）
const dark = process.env.DARK === '1' // DARK=1：整条流程在深色下走一遍，截图放 shots-0c-*-dark
const shots = `${process.cwd()}/work/p6-ui/shots-author-ask-${engineName}${dark ? '-dark' : ''}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, 8 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
if (dark) await page.emulateMedia({ colorScheme: 'dark' })
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  if (dist) await ctx.route(u => u.href.startsWith(url) && (/^\/dist\//.test(u.pathname) || u.pathname.endsWith('/harness.js')), async route => {
    const path = new URL(route.request().url()).pathname
    await route.fulfill({ body: await readFile(join(dist, path.startsWith('/dist/') ? path.slice(6) : 'harness.js')), contentType: 'application/javascript' })
  })
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役（走开局向导的后端入口），不预先建人 ----
  const made = await page.evaluate(async (P) => {
    for (const id of ['cn-official', 'en-official']) { const h0 = await import('/work/e2e-lib/harness.js'); const a = await h0.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h0.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    const backend = app.svc().backend
    if (backend.texts !== backend.library.service.texts) throw Error('总后端和库业务没有共用同一取字服务')
    const labels = (await backend.texts.values('cn', [['spell', 'item']], 'category'))[0]
    if (!labels?.spell || !labels?.item || !/[㐀-鿿]/.test(labels.spell)) throw Error('库分类未通过公共取字服务')
    const fields = await backend.library.custom.fields('cn', 'spell')
    if (!JSON.stringify(fields).includes('"action":"动作"')) throw Error('编辑器候选值未通过公共取字服务')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '建卡测试', codeSet: 'cn' }))
    await app.svc().backend.kernel.enter(camp.owner.ownerKey)
    return true
  }, pinia)
  check('开了真实战役', made === true)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)
  const openWizard = async () => { await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /分步建卡/ }).click(); await page.getByTestId('wizard-page').waitFor() }
  const next = async () => { await page.getByTestId('wz-next').click(); await settle(page, 400) }


  const pick = async (searchText, re, src) => {
    await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-search').fill(searchText); await settle(page, 500)
    await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: re }) }).filter({ has: page.locator('.lib-src', { hasText: src }) }).first().click()
    await page.getByTestId('wz-choose').click(); await settle(page, 600)
  }
  const win = () => page.getByTestId('wz-author-window').first()
  const waitWin = () => page.getByTestId('wz-author-ask').first().waitFor({ timeout: 120000 })
  const busy = () => page.evaluate((P) => eval(P)._s.get('wizard').author.busy, pinia)
  /** 像玩家一样在作者窗口里点作者的确定类按钮（还没手动答的窗口）。窗口刚好换掉时下一轮再看。 */
  const pressDefault = async () => {
    const clicked = await page.evaluate(() => {
      const root = document.querySelector('#trpg-assistant-root').shadowRoot
      const host = root.querySelector('[data-testid=wz-author-window]')
      const inner = host?.shadowRoot
      if (!inner) return null
      const buttons = [...inner.querySelectorAll('button')]
      const b = buttons.find((x) => /^(OK|Yes|Confirm|Use Default|Import|Save|Submit)$/i.test(x.textContent.trim())) ?? inner.querySelector('.ve-btn-primary')
      b?.click()
      return b ? b.textContent.trim() : `没有确定类按钮：${buttons.map((x) => x.textContent.trim()).join(' | ').slice(0, 300)}`
    })
    await settle(page, 700)
    return clicked
  }
  const drain = async (maxN = 20) => { for (let i = 0; i < maxN; i++) { if (!(await page.getByTestId('wz-author-ask').count())) { if (!(await busy())) return; await settle(page, 800); continue } await pressDefault() } }

  await openWizard(); await settle(page, 800)
  await page.getByTestId('wz-name').fill('整页牧师'); await next()
  await pick('人类', /^人类$/, /^PHB$/)
  await waitWin(); await settle(page, 600)
  check('选了种族：作者的第一个窗口整个搬到右边「它要你做的选择」里', (await page.getByTestId('wz-right').getByTestId('wz-author-window').count()) === 1)
  await shot('01-race-first-window')
  await win().locator('button').filter({ hasText: 'Yes' }).first().click(); await settle(page, 900)
  await waitWin()
  const boxes = win().locator('input[type=checkbox]')
  check('第二个作者窗口（选语言）在同一个位置出现，作者自己的勾选框能点', (await boxes.count()) > 5)
  await shot('02-race-languages')
  await boxes.nth(1).check({ force: true }); await settle(page, 300)
  await shot('03-race-picked')
  await win().locator('button').filter({ hasText: /^\s*OK\s*$/ }).first().click()
  await page.waitForFunction((P) => !eval(P)._s.get('wizard').author.busy, pinia, { timeout: 120000 }); await settle(page, 600)
  check('种族导入完：作者窗口都收成打勾的标题', (await page.getByTestId('wz-author-ask').count()) === 0 && (await page.getByTestId('wz-asked').locator('li').count()) >= 2)
  await shot('04-race-done')
  await next()
  await pick('侍僧', /^侍僧$/, /^PHB$/)
  await waitWin(); await settle(page, 600)
  await shot('05-background-window')
  // 背景的作者窗口各种各样（特性、技能、语言工具、个性特征、装备）：一个格式全部搬过来；找到个性特征 / 装备窗口时各截一张
  const seen = []
  for (let i = 0; i < 20; i++) {
    if (!(await page.getByTestId('wz-author-ask').count())) { if (!(await busy())) break; await settle(page, 800); continue }
    const title = (await page.getByTestId('wz-author-ask').first().locator('b').first().innerText()).trim()
    if (!seen.includes(title)) { seen.push(title); if (/Characteristics|Equipment/.test(title)) { await win().scrollIntoViewIfNeeded(); await shot(`06-bg-${seen.length}`) } }
    await pressDefault()
  }
  check('背景的作者窗口都经同一个格式答完（不分种类）', seen.length >= 3, seen.join(' | '))
  await next()
  await pick('牧师', /^牧师$/, /^PHB$/)
  await waitWin(); await settle(page, 600)
  await win().scrollIntoViewIfNeeded(); await shot('07-class-window')
  await drain(25)
  check('职业导入完：没有开着的作者窗口', (await page.getByTestId('wz-author-ask').count()) === 0)
  await page.getByTestId('wz-step-done').click(); await settle(page, 600)
  check('完成页没有「作者在问」的待填', !/作者在问/.test(await page.getByTestId('wz-done').innerText()))
  await shot('08-done')
  await page.getByTestId('wz-create').click()
  await page.waitForFunction(() => !document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid=wizard-page]'), null, { timeout: 120000 })
  await settle(page, 1000)
  const built = await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend
    const row = (await be.people.roster(camp.owner.ownerKey)).find((r) => r.name === '整页牧师')
    if (!row) return null
    const sheet = await be.people.sheet(camp.owner.ownerKey, row.id)
    const items = sheet.result.items ?? []
    return { classes: row.classes.map((c) => c.name), race: row.race, feats: items.filter((i) => i.type === 'feat').length, spells: items.filter((i) => i.type === 'spell').length, gear: items.filter((i) => i.type === 'weapon' || i.type === 'equipment').length }
  }, pinia)
  check('创建成功：名单里是「牧师 / 人类」，人物身上有特性、法术、装备', built && built.classes.includes('牧师') && built.race === '人类' && built.feats > 0 && built.spells > 0 && built.gear > 0, JSON.stringify(built))
  await shot('09-list')
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
