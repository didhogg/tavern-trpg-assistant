// P6 人物（一）额外选择按组选（真实插件界面 + 真实库 + 真实结算小窗）：2024 人类 + 2024 战士 → 专长这一步出现两个组名标签（起源专长 / 战斗风格，组名后端给）→ 点标签切换、每组各选 1 → 完成页没有专长待填 → 创建 → 人物身上两个专长；窄屏标签不撑破。
// 截图 work/p6-ui/shots-0c-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0c-groups.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-0c-groups') // 克隆干净底座（npm run e2e:base 造），跑完自动删（KEEP_PROFILE=1 保留）
const dark = process.env.DARK === '1' // DARK=1：整条流程在深色下走一遍，截图放 shots-0c-*-dark
const shots = `${process.cwd()}/work/p6-ui/shots-0c-groups-${engineName}${dark ? '-dark' : ''}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
if (dark) await page.emulateMedia({ colorScheme: 'dark' })
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
// 建卡后端在算（每次改动都会重算）：等它算完再读画面，不靠固定等几秒
const idle = () => page.waitForFunction((P) => !eval(P)._s.get('wizard').optLoading, pinia, { timeout: 60000 })
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役（走开局向导的后端入口），不预先建人 ----
  const made = await page.evaluate(async (P) => {
    for (const id of ['cn-official', 'en-official']) { const h0 = await import('/work/e2e-lib/harness.js'); const a = await h0.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h0.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '建卡测试', codeSet: 'cn' }))
    await app.svc().backend.kernel.enter(camp.owner.ownerKey)
    return true
  }, pinia)
  check('开了真实战役', made === true)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)
  const openWizard = async () => { await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /分步建卡/ }).click(); await page.getByTestId('wizard-page').waitFor() }
  const next = async () => { await page.getByTestId('wz-next').click(); await settle(page, 400) }


  const xphb = async (searchText, re) => {
    await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-search').fill(searchText); await settle(page, 500)
    await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: re }) }).filter({ has: page.locator('.lib-src', { hasText: /^XPHB$/ }) }).first().click()
    await page.getByTestId('wz-choose').click(); await settle(page, 600); await idle()
  }
  const tabs = () => page.getByTestId('wz-group-tabs').getByRole('button')
  const tabTexts = async () => (await tabs().allInnerTexts()).map((t) => t.trim())
  const listCount = async () => Number(((await page.locator('.wz-list .lib-count').innerText()).match(/共 (\d+) 条/) ?? [])[1] ?? 0)

  await openWizard(); await settle(page, 800)
  await page.getByTestId('wz-name').fill('双组战士'); await next()
  await xphb('人类', /^人类$/); await next()
  await next() // 背景不选（留空也能建）
  await xphb('战士', /^战士$/)
  check('选了 2024 人类和 2024 战士后步骤标签有「专长」', (await page.getByTestId('wz-step-feat').count()) === 1)
  await page.getByTestId('wz-step-feat').click(); await settle(page, 600); await idle()
  const t0 = await tabTexts()
  check('专长这一步有两个组名标签（组名后端给：起源 / 战斗风格），各写 0/1', t0.length === 2 && t0.some((t) => /起源/.test(t)) && t0.some((t) => /战斗风格/.test(t)) && t0.every((t) => /0\/1$/.test(t)), t0.join(' | '))
  check('写着这一组来自哪件条目', /来自/.test(await page.getByTestId('wz-groups').innerText()))
  check('不再写「列表是全部专长」', !/全部专长/.test(await page.getByTestId('wz-right').innerText()))
  await shot('01-two-groups')
  // 第一组（默认停在第一个没选满的组）
  const firstTitle = t0[0].replace(/ \d+\/\d+$/, '')
  const n1 = await listCount()
  await page.getByTestId('wz-row').first().click(); await page.getByTestId('wz-choose').click(); await settle(page, 600); await idle()
  const t1 = await tabTexts()
  check('第一组选了 1 个：这组标签变 1/1，另一组还是 0/1', t1.filter((t) => /1\/1$/.test(t)).length === 1 && t1.filter((t) => /0\/1$/.test(t)).length === 1, t1.join(' | '))
  // 点另一组的标签切换
  await tabs().filter({ hasNotText: firstTitle }).first().click(); await settle(page, 600)
  const n2 = await listCount()
  check('点标签切到另一组：左边换成这一组自己的候选（条数不同）', n2 > 0 && n2 !== n1, `${n1} → ${n2}`)
  await page.getByTestId('wz-row').first().click(); await page.getByTestId('wz-choose').click(); await settle(page, 600); await idle()
  const reqText = (await page.getByTestId('wz-requirement').count()) ? await page.getByTestId('wz-requirement').innerText() : ''
  check('选中带条件的候选：前置条件是本战役语言（中文），不是英文原句', /前置条件：[^（]*[㐀-鿿]/.test(reqText) && !/Fighting Style/.test(reqText), reqText)
  const t2 = await tabTexts()
  check('两组都选了：两个标签都是 1/1，「专长」步骤打勾', t2.every((t) => /1\/1$/.test(t)) && (await page.getByTestId('wz-step-feat').getAttribute('data-s')) === 'done', t2.join(' | '))
  await shot('02-both-picked')
  // 切回第一组：它选的那条还带 ✓
  await tabs().filter({ hasText: firstTitle }).first().click(); await settle(page, 400)
  check('切回第一组：左边又是它自己的候选，选过的那条还带 ✓', (await listCount()) === n1 && (await page.locator('[data-testid=wz-row] svg').count()) >= 1)
  // 窄屏：标签不撑破
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 800); await shot('03-narrow')
  check('窄屏：组名标签在、页面没有横向滚动', (await tabs().count()) === 2 && await page.evaluate(() => { const m = document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('.wz'); return m.scrollWidth <= m.clientWidth + 1 }))
  await page.setViewportSize({ width: 1280, height: 800 }); await settle(page, 600)
  // 完成页 → 创建
  await page.getByTestId('wz-step-done').click(); await settle(page, 600)
  const doneText = await page.getByTestId('wz-done').innerText()
  check('完成页待填里没有专长组的「还差」', !t0.some((t) => doneText.includes(`${t.replace(/ \d+\/\d+$/, '')}还差`)), doneText.replace(/\s+/g, ' ').slice(0, 300))
  await shot('04-done')
  await page.getByTestId('wz-create').click()
  await page.waitForFunction(() => ![...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid=wizard-page]')].length, null, { timeout: 120000 })
  await page.waitForSelector('.pp-row', { timeout: 60000 }); await settle(page, 1200)
  const feats = await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend
    const row = ps._s.get('people').rows.find((r) => r.name === '双组战士')
    if (!row) return null
    const sheet = await be.people.sheet(camp.owner.ownerKey, row.id)
    return (sheet.result.items ?? []).filter((i) => i.type === 'feat').map((i) => i.name)
  }, pinia)
  check('创建成功：人物身上有两组各选的一个专长', Array.isArray(feats) && feats.length === 2, JSON.stringify(feats))
  await shot('05-list')
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
