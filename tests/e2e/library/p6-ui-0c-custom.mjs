// P6 0c 收尾 ③：自制包物品在分步建卡「装备」步骤的界面里真点一次（后端候选 / 存档已由 p6-custom-refs 测过）。
// 装中文试装备包 → 开中文战役 → 分步建卡（人类 + 侍僧 + 牧师）→ 装备步骤：「任选简易武器」下拉里搜到「测试木棍」（来源徽章是自制包）→ 点选 → 创建 → 人物里有这件。
// 用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0c-custom.mjs（SKIP_BUILD=1 跳过构建）；复制一份浏览器资料，不动共用的那份。
import { rm, cp, mkdir, readFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47362 })
const profile = `${work}/profile-p6-uicustom-${engineName}`
await rm(profile, { recursive: true, force: true }); await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
const shots = `${process.cwd()}/work/p6-ui/shots-0c-custom-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage(); page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const packText = await readFile('work/p6-equip-pack/试跑者; 试装备包.json', 'utf8')
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  const made = await page.evaluate(async ({ P, packText }) => {
    for (const id of ['cn-official', 'en-official']) { const h0 = await import('/work/e2e-lib/harness.js'); const a = await h0.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h0.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app'); const be = app.svc().backend
    await be.library.bilingual.importFiles([{ name: '试跑者; 试装备包.json', text: packText }]); await be.library.brewQueue.settled()
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '自制建卡', codeSet: 'cn' }))
    await app.svc().backend.kernel.enter(camp.owner.ownerKey)
    return true
  }, { P: pinia, packText })
  check('装了自制试装备包并开了中文战役', made === true)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)
  await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /分步建卡/ }).click(); await page.getByTestId('wizard-page').waitFor()
  const next = async () => { await page.getByTestId('wz-next').click(); await settle(page, 400) }
  const pickRow = async (re) => { await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: re }) }).first().click(); await page.getByTestId('wz-choose').click(); await page.getByTestId('wz-choices').first().waitFor({ timeout: 120000 }); await settle(page, 800) }
  await page.getByTestId('wz-name').fill('自制木棍牧师'); await next()
  await page.getByTestId('wz-search').fill('人类'); await settle(page, 500); await pickRow(/^人类$/); await next()
  await page.getByTestId('wz-search').fill('侍僧'); await settle(page, 400); await pickRow(/侍僧/); await next()
  await page.getByTestId('wz-search').fill('牧师'); await settle(page, 400); await pickRow(/^牧师$/)
  while (!(await page.getByTestId('wz-equipment').count())) await next()
  await page.getByTestId('wz-equipment').waitFor(); await settle(page, 1500)
  const sec = page.getByTestId('wz-eq-section').filter({ hasText: '来自：牧师' })
  const slot = sec.getByRole('combobox', { name: /简易武器，第 1 个/ })
  await slot.click(); await settle(page, 600)
  const opt = page.getByRole('option').filter({ hasText: '测试木棍' })
  check('类别槽下拉里能看到自制的「测试木棍」，并带自制包来源徽章', (await opt.count()) === 1 && /Test|试|TestEquip/i.test(await opt.first().innerText()), (await opt.first().innerText().catch(() => '')).replace(/\s+/g, ' '))
  await shot('01-dropdown')
  await opt.first().click(); await settle(page, 1800)
  check('选了测试木棍后这一项自动选中', (await sec.locator('[data-testid=wz-eq-option][data-on]').count()) >= 1)
  check('底部合计把它算进去', /\d+ 件物品/.test(await page.getByTestId('wz-eq-sum').innerText()))
  await shot('02-picked')
  while (!(await page.getByTestId('wz-done').count())) await next()
  check('完成页的装备小结里有测试木棍', /测试木棍/.test(await page.getByTestId('wz-eq-done').innerText()), (await page.getByTestId('wz-eq-done').innerText()).replace(/\s+/g, ' ').slice(0, 240))
  await page.getByTestId('wz-create').click()
  await page.waitForFunction(() => ![...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid=wizard-page]')].length, null, { timeout: 120000 })
  await page.waitForSelector('.pp-row', { timeout: 60000 }); await settle(page, 1200)
  const items = await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend
    const row = ps._s.get('people').rows.find((r) => r.name === '自制木棍牧师')
    const sheet = await be.people.sheet(camp.owner.ownerKey, row.id)
    const saved = (await be.kernelSave.read(camp.owner.ownerKey)).actors.find((a) => a.id === row.id).refs.map((x) => `${x.set}|${x.prop}`)
    return { names: sheet.result.items.map((i) => i.name), saved }
  }, pinia)
  check('人物里有测试木棍，存档里它按自制包引用存', items.names.includes('测试木棍') && items.saved.includes('cn-brew|item'), JSON.stringify(items).slice(0, 300))
  await shot('03-list')
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
  await shot('99-crash').catch(() => undefined)
} finally {
  const bad = errors.filter((e) => !/gendata-nav-adventure-book-index|plutonium|net::ERR|Failed to load resource|requires usable window dimensions|when merging ability scores|status of 404|api\/plutonium|KERNEL_NEEDS_INPUT|homebrew|unearthed-arcana/.test(e))
  check('没有未解释的页面报错', bad.length === 0, bad.join(' | ').slice(0, 600))
  clearTimeout(killer); await ctx.close(); server.close()
  // 资料副本每份 4G 多，跑完就删（要留着看现场：KEEP_PROFILE=1）
  if (!process.env.KEEP_PROFILE) await rm(profile, { recursive: true, force: true })
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
