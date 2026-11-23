// P6-R 用作者完整建卡器给已有的人升级（等级管理 ▸ 用建卡器升级 / 兼职）：真实插件界面 + 真实库 + 私人完整版作者程序。
// 野蛮人 1 级 → 作者建卡器里目标等级选 2 → 创建 → 关掉作者窗口 → 详情页 野蛮人 2、2 级特性（危机感应、鲁莽攻击）进了特性页、存档一条撤销。
// 本机没有 vendor/private/modules/plutonium/（私人完整版，不进 git）就跳过并说明。
import { access, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './static.mjs'
import { check, failures } from '../helpers.mjs'
try { await access(join(root, 'vendor/private/modules/plutonium/module.json')) } catch { console.log('跳过：本机没有私人完整版作者程序'); process.exit(0) }
import { startStatic } from './static.mjs'
import { E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { settle } from '../helpers.mjs'
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-level-chrome`; await mkdir(shots, { recursive: true })
const ctx = await type.launchPersistentContext(freshFromBase('chrome', 'tmp-levelnative'), { ...options, viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage(); page.setDefaultTimeout(4 * 60_000)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const errors = []; page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)))
try {
  await page.goto(url); await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: 'T', codeSet: 'cn' }))
    const be = app.svc().backend; const owner = camp.owner.ownerKey; const library = await be.kernelSave.libraryOf(owner)
    const { plan } = await h.pickChainEntries(library, 'barbarian')
    await be.kernel.enter(owner)
    await camp.backendWrite((k) => be.people.build(k, { name: '盖尔', items: ['race', 'background', 'class'].map((key) => plan[key].ref) }, { category: 'party' }))
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 800)
  await page.getByTestId('pp-row').first().click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1000)
  await page.getByTestId('ps-level').getByRole('button', { name: '等级管理' }).click(); await page.getByRole('menuitem', { name: /用建卡器/ }).click()
  await page.getByTestId('level-page').waitFor()
  for (let i = 0; i < 12; i++) { await settle(page, 5000); await page.screenshot({ path: `${shots}/t${i}.png` }); if (await page.locator('iframe[data-trpg-author-frame="foundry"]').count() >= 2) break }
  await settle(page, 6000); await page.screenshot({ path: `${shots}/ready.png` })
  const frame = page.frameLocator('iframe[data-trpg-author-frame="foundry"] >> nth=1')
  await frame.getByRole('button', { name: '确认', exact: true }).click()
  await settle(page, 15000); await page.screenshot({ path: `${shots}/after-confirm.png` })
  await frame.getByRole('button', { name: /职业/ }).first().click(); await settle(page, 4000)
  await page.screenshot({ path: `${shots}/class-step.png` })
  const sel = frame.locator('select:visible').filter({ has: frame.locator('option', { hasText: '20 级' }) }).first()
  await sel.selectOption({ label: '2 级' }); await settle(page, 3000)
  await page.screenshot({ path: `${shots}/level2.png` })
  await frame.getByRole('button', { name: /完成/ }).first().click(); await settle(page, 4000)
  await page.screenshot({ path: `${shots}/finish-step.png` })
  await frame.getByRole('button', { name: /^创建/ }).click(); await settle(page, 3000)
  for (let i = 0; i < 20 && await page.getByTestId('level-page').count(); i++) {
    for (const t of ['确定', '关闭']) { const ok = frame.getByText(t, { exact: true }); if (await ok.count().catch(() => 0)) await ok.first().click().catch(() => undefined) }
    await settle(page, 3000)
  }
  await page.screenshot({ path: `${shots}/done.png` })
  const sub = await page.getByTestId('ps-sub').innerText().catch(() => 'no sub')
  await page.getByTestId('ps-tab-feat').click(); await settle(page, 1500)
  const feats = await page.getByTestId('ps-features').innerText()
  await page.getByTestId('ps-tab-action').click(); await settle(page, 800)
  check('行动页照常显示', (await page.getByTestId('ps-actions').innerText()).length > 0)
  const saved = await page.evaluate(async (P) => { const ps = eval(P); const k = await ps._s.get('app').svc().backend.kernelSave.read(ps._s.get('campaign').owner.ownerKey); return { rev: k.revision, undo: k.undo.length, items: (k.actors[0].doc?.items ?? []).map((i) => i.name).slice(0, 30) } }, pinia)
  check('作者升级完成后窗口自己关掉', (await page.getByTestId('level-page').count()) === 0)
  check('名字行：野蛮人 2', /野蛮人 2/.test(sub), sub)
  check('2 级特性进了特性页（危机感应、鲁莽攻击）', /危机感应/.test(feats) && /鲁莽攻击/.test(feats), feats.replace(/\s+/g, ' ').slice(0, 200))
  check('写进存档、一条撤销', saved.undo >= 2, JSON.stringify(saved))
  await page.getByTestId('ps-undo').click(); await settle(page, 2000)
  check('撤销：回到野蛮人 1', /野蛮人 1/.test(await page.getByTestId('ps-sub').innerText()))
} catch (e) { check('测试流程没中断', false, String(e).slice(0, 800)); await page.screenshot({ path: `${shots}/crash.png` }) } finally {
  check('没有未解释的页面报错', errors.filter((e) => !/gendata-nav-adventure-book-index/.test(e)).length === 0, errors.join(' | '))
  await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
