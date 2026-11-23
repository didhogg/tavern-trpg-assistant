// P6 A 批 人物详情 · 行动页 + 属性页（真实插件界面 + 真实库 + 真实结算小窗）：建卡一人（带战斧）+ 模板成年黑龙。
// 行动：分组中文、战斧命中与伤害、龙的传奇 / 巢穴动作与 DC、搜索、只看、行内展开作者原文；属性：技能 / 豁免 / 特质中文；窄屏不超出。
// 截图 work/p6-ui/shots-2-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-2.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-2')
const shots = `${process.cwd()}/work/p6-ui/shots-2-${engineName}`
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
const han = (t) => /[一-鿿]/.test(t)
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役 + 真实建卡一人（野蛮人）+ 从模板加一只带传奇动作的怪物 ----
  const made = await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '人物详情测试', codeSet: 'cn' }))
    const be = app.svc().backend; const owner = camp.owner.ownerKey; const library = await be.kernelSave.libraryOf(owner)
    const { plan } = await h.pickChainEntries(library, 'barbarian')
    await be.kernel.enter(owner)
    // 和真实界面一样经存档层写（直接调后端会让存档层内存里的当前数据过期，之后的写入会用旧数据盖掉新加的人）
    const a = await camp.backendWrite((k) => be.people.build(k, { name: '盖尔', items: ['race', 'background', 'class'].map((key) => plan[key].ref), equipment: [plan.weapon.ref] }, { category: 'party' }))
    const pool = await h.scoped.query(library, 'monster')
    const dragon = pool.find((r) => r.source === 'MM' && r.item.legendary?.length && JSON.stringify(r.item.alignment) === '["C","E"]')
    const m = await camp.backendWrite((k) => be.people.fromTemplate(k, dragon.ref, 1, { category: 'party' }))
    return { a: a.built.status, m: m.made.status }
  }, pinia)
  check('造数据：建卡一人 + 模板怪物一只', made.a === 'complete' && made.m === 'complete', JSON.stringify(made))

  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=pp-row]'); await settle(page, 600)
  await page.getByTestId('pp-row').filter({ hasText: '盖尔' }).first().click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 800)
  const toPanel = (id) => page.getByTestId(id).evaluate((e) => e.scrollIntoView({ block: 'start' }))
  const raw = (t) => /DND5E\.|TYPES\.|undefined|\[object/.test(t)

  // ---- 玩家角色 · 行动 ----
  await page.getByTestId('ps-tab-action').click(); await page.getByTestId('ps-actions').waitFor(); await settle(page, 500)
  await toPanel('ps-panel-action'); await shot('01-pc-actions')
  const act = await page.getByTestId('ps-actions').innerText()
  const axe = await page.getByTestId('ps-act-action').innerText()
  check('玩家角色也按动作类型分组：有「动作」组，武器在里面，带命中和中文伤害', /动作/.test(axe) && /\+\d/.test(axe) && /\d+d\d+[^\n]*[一-鿿]/.test(axe), axe.replace(/\s+/g, ' '))
  check('被动特性放最后一组「特性」', (await page.locator('.ps-act-table').last().getAttribute('data-testid')) === 'ps-act-passive')
  check('行动页没有生的语言键或英文类别', !raw(act), act.replace(/\s+/g, ' ').slice(0, 300))
  await page.getByTestId('ps-act-action').getByRole('button').first().click(); await settle(page, 2500)
  const detail = await page.locator('.ps-act-detail').innerText()
  check('点一行原地展开作者原文（中文）', detail.length > 10 && han(detail) && !/读不出来|没读出来/.test(detail), detail.replace(/\s+/g, ' ').slice(0, 160))
  await shot('02-pc-action-open')
  await page.getByTestId('ps-actions-search').fill('不会有这个名字'); await settle(page, 300)
  check('搜不到时说明', /没有符合的行动/.test(await page.getByTestId('ps-actions').innerText()))
  await page.getByTestId('ps-actions-search').fill(''); await page.getByTestId('ps-actions-only-action').click(); await settle(page, 300)
  check('「只看 动作」只剩动作组', (await page.locator('.ps-act-table').count()) === 1)
  await page.getByTestId('ps-actions-only-action').click(); await settle(page, 300)

  // ---- 玩家角色 · 属性 ----
  await page.getByTestId('ps-tab-attr').click(); await page.getByTestId('ps-attr').waitFor(); await settle(page, 500)
  await toPanel('ps-panel-attr'); await shot('03-pc-attr')
  const attr = await page.getByTestId('ps-attr').innerText()
  check('属性页：技能 18 项', (await page.getByTestId('ps-attr-skills').locator('li').count()) === 18)
  const saves = await page.getByTestId('ps-attr-saves').innerText()
  check('豁免六项中文', ['力量', '敏捷', '体质', '智力', '感知', '魅力'].every((w) => saves.includes(w)), saves.replace(/\s+/g, ' '))
  const traits = await page.getByTestId('ps-attr-traits').innerText()
  check('特质：组名和内容都是中文（语言、武器熟练……）', han(traits) && !/^[a-z]{2,}$/m.test(traits) && /通用语/.test(traits), traits.replace(/\s+/g, ' '))
  check('属性页没有生的语言键', !raw(attr))

  // ---- 怪物 ----
  await page.getByTestId('ps-next').click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1500)
  await page.getByTestId('ps-tab-action').click(); await page.getByTestId('ps-actions').waitFor(); await settle(page, 500)
  await toPanel('ps-panel-action'); await shot('04-monster-actions')
  const mact = await page.getByTestId('ps-actions').innerText()
  check('怪物：动作 / 传奇动作 / 巢穴动作分组', (await page.getByTestId('ps-act-legendary').count()) === 1 && (await page.getByTestId('ps-act-lair').count()) === 1)
  check('怪物：攻击有命中、豁免类有 DC + 中文属性', /\+1\d/.test(mact) && /DC \d+ (力量|敏捷|体质|智力|感知|魅力)/.test(mact), mact.replace(/\s+/g, ' ').slice(0, 300))
  check('怪物行动页没有生的语言键', !raw(mact))
  await page.getByTestId('ps-tab-attr').click(); await settle(page, 500); await toPanel('ps-panel-attr'); await shot('05-monster-attr')
  const mtr = await page.getByTestId('ps-attr-traits').innerText()
  check('怪物特质：伤害免疫 强酸（中文）', /强酸/.test(mtr) && han(mtr), mtr.replace(/\s+/g, ' '))

  // ---- 窄屏 ----
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 600)
  await page.getByTestId('ps-tab-action').click(); await settle(page, 500)
  await toPanel('ps-panel-action'); await shot('06-narrow-actions')
  const wide = await page.locator('.ps-act-table').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)))
  check('窄屏：行动表不超出窗口', wide <= 390, `right=${wide}`)
  await page.getByTestId('ps-tab-attr').click(); await settle(page, 400); await toPanel('ps-panel-attr'); await shot('07-narrow-attr')
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
