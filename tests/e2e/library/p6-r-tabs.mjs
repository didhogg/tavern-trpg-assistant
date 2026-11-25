// P6-R 人物单元重做：逐页走一遍（真实插件界面 + 真实库 + 真实结算小窗）。建卡牧师（带法术、武器、护甲、药水、背包、护符）+ 模板成年黑龙 + 空白人物。
// 每页截图（宽 / 窄），检查：分页内容出来、全中文（没有生的语言键 / undefined）、没有页面报错。截图 work/p6-ui/shots-r-*/；界面验收只由驾驶员给。
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-r-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-tabs'), { ...options, viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const raw = (t) => /DND5E\.|TYPES\.|EFFECT\.|undefined|\[object|NaN/.test(t)
const toPanel = (id) => page.getByTestId(id).evaluate((e) => e.scrollIntoView({ block: 'start' }))
const TABS = [['action', 'ps-actions'], ['attr', 'ps-attr'], ['bag', 'ps-bag'], ['spell', 'ps-spells'], ['feat', 'ps-features'], ['effect', 'ps-effects'], ['bio', 'ps-bio'], ['note', 'ps-notes']]
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  const made = await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '人物单元重做', codeSet: 'cn' }))
    const be = app.svc().backend; const owner = camp.owner.ownerKey; const library = await be.kernelSave.libraryOf(owner)
    const { plan } = await h.pickChainEntries(library, 'cleric')
    const bag = await h.pickBagEntries(library)
    await be.kernel.enter(owner)
    const a = await camp.backendWrite((k) => be.people.build(k, { name: '艾琳', items: ['race', 'background', 'class'].map((key) => plan[key].ref), equipment: [plan.weapon.ref, plan.spell.ref, ...Object.values(bag).map((x) => x.ref)] }, { category: 'party' }))
    const pool = await h.scoped.query(library, 'monster')
    const dragon = pool.find((r) => r.source === 'MM' && r.item.legendary?.length && JSON.stringify(r.item.alignment) === '["C","E"]')
    const m = await camp.backendWrite((k) => be.people.fromTemplate(k, dragon.ref, 1, { category: 'party' }))
    return { a: a.built.status, m: m.made.status }
  }, pinia)
  check('造数据：牧师 + 成年黑龙', made.a === 'complete' && made.m === 'complete', JSON.stringify(made))
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=pp-row]'); await settle(page, 600)
  // 空白人物（照 DiceCloud）：＋ 新建 ▸ 空白人物 → 直接进详情
  await page.getByRole('button', { name: '新建' }).click(); await page.getByRole('menuitem', { name: '直接新建（空白人物卡）' }).click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)
  await shot('00-blank-head')
  check('空白人物建好并进了详情', /新人物/.test(await page.getByTestId('ps-unit-name').innerText()))
  await page.getByTestId('ps-back').click(); await settle(page, 800)
  for (const who of ['艾琳', '成年黑龙']) {
    await page.getByTestId('pp-row').filter({ hasText: who }).first().click()
    await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)
    await shot(`${who}-head`)
    check(`${who}：页头没有生的语言键`, !raw(await page.getByTestId('ps-head').innerText()))
    for (const [tab, id] of TABS) {
      await page.getByTestId(`ps-tab-${tab}`).click(); await page.getByTestId(id).waitFor(); await settle(page, 500)
      await toPanel(`ps-panel-${tab}`); await shot(`${who}-${tab}`)
      const t = await page.getByTestId(id).innerText()
      check(`${who} · ${tab}：内容出来、没有生的语言键`, t.length > 0 && !raw(t), raw(t) ? t.match(/.{0,30}(DND5E\.|TYPES\.|EFFECT\.|undefined|\[object|NaN).{0,30}/)?.[0] : '')
    }
    await page.getByTestId('ps-back').click(); await settle(page, 800)
  }
  // 窄屏：牧师的法术页、属性页
  await page.setViewportSize({ width: 390, height: 800 }); await settle(page, 600)
  await page.getByTestId('pp-row').filter({ hasText: '艾琳' }).first().click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1000)
  await shot('narrow-head')
  for (const [tab, id] of [['spell', 'ps-spells'], ['attr', 'ps-attr'], ['bag', 'ps-bag'], ['effect', 'ps-effects']]) {
    await page.getByTestId(`ps-tab-${tab}`).click(); await page.getByTestId(id).waitFor(); await settle(page, 500)
    await toPanel(`ps-panel-${tab}`); await shot(`narrow-${tab}`)
    const over = await page.getByTestId(id).evaluate((e) => [...e.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > 391 && x.getBoundingClientRect().width > 0).map((x) => `${x.tagName}.${[...x.classList].join('.')}@${Math.round(x.getBoundingClientRect().right)}`).slice(0, 4))
    check(`窄屏 · ${tab}：不超出窗口`, over.length === 0, over.join(' '))
  }
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
