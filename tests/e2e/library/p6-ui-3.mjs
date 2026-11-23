// P6 B 批 人物详情 · 背包（真实插件界面 + 真实库 + 真实结算小窗）：建卡一人，带战斧、胸甲、治疗药水、背包、健康护符。
// 分组中文、标签筛选（同资料库）、搜索、负重、数量加减、卸下 / 装备、取消同调、药水次数、删除再撤销、展开原文；窄屏不超出。
// 截图 work/p6-ui/shots-3-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-3.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-3')
const shots = `${process.cwd()}/work/p6-ui/shots-3-${engineName}`
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
    const bag = await h.pickBagEntries(library)
    await be.kernel.enter(owner)
    // 和真实界面一样经存档层写（直接调后端会让存档层内存里的当前数据过期，之后的写入会用旧数据盖掉新加的人）
    const a = await camp.backendWrite((k) => be.people.build(k, { name: '盖尔', items: ['race', 'background', 'class'].map((key) => plan[key].ref), equipment: [plan.weapon.ref, ...Object.values(bag).map((x) => x.ref)] }, { category: 'party' }))
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
  const raw = (t) => /DND5E\.|TYPES\.|undefined|\[object|NaN/.test(t)
  const row = (name) => page.getByTestId('ps-bagt').getByTestId('ps-row').filter({ hasText: name }).first()
  const bagText = () => page.getByTestId('ps-bag').innerText()

  await page.getByTestId('ps-tab-bag').click(); await page.getByTestId('ps-bag').waitFor(); await settle(page, 500)
  await toPanel('ps-panel-bag'); await shot('01-bag')
  const t0 = await bagText()
  check('背包按类型分组（中文）：武器 / 装备 / 消耗品 / 容器', ['武器', '装备', '消耗品', '容器'].every((w) => t0.includes(w)), t0.replace(/\s+/g, ' ').slice(0, 300))
  check('背包没有生的语言键、重量单位是中文', !raw(t0) && !/\blb\b/.test(t0))
  check('负重一行有数字', /负重\s*[\d.]+ \/ \d+/.test(await page.getByTestId('ps-enc').innerText()), await page.getByTestId('ps-enc').innerText())
  check('容器行有容量', /\d+ \/ \d+/.test(await row('背包').innerText()))
  await page.getByTestId('ps-bag').getByTestId('ps-pill-consumables').click(); await settle(page, 300)
  check('标签「消耗品」只剩一组', (await page.locator('[data-testid=ps-bagt] .ps-grp').count()) === 1 && /治疗药水/.test(await bagText()))
  await page.getByTestId('ps-bag').getByTestId('ps-pill-all').click()
  await page.getByTestId('ps-bag-search').fill('胸甲'); await settle(page, 300)
  check('搜「胸甲」只剩一行', (await page.getByTestId('ps-bagt').getByTestId('ps-row').count()) === 1)
  await page.getByTestId('ps-bag-search').fill(''); await settle(page, 300)

  await row('战斧').getByRole('button', { name: '战斧多一个' }).click(); await settle(page, 1500)
  check('数量 ＋：战斧 2', /\b2\b/.test(await row('战斧').locator('.trpg-stepper').nth(0).innerText()), await row('战斧').innerText())
  await page.getByTestId('ps-undo').click(); await settle(page, 1500)
  check('撤销：战斧回到 1', /\b1\b/.test(await row('战斧').locator('.trpg-stepper').nth(0).innerText()))
  await row('胸甲').getByRole('button', { name: '卸下' }).click(); await settle(page, 1500)
  check('卸下胸甲：按钮变「装备」、没有已装备标签', (await row('胸甲').getByRole('button', { name: '装备' }).count()) === 1 && !/已装备/.test(await row('胸甲').innerText()))
  await row('健康护符').getByRole('button', { name: '健康护符的更多操作' }).click(); await page.getByRole('menuitem', { name: '取消同调' }).click(); await settle(page, 1500)
  check('取消同调：出现「同调」按钮，脚注 0 / 3', (await row('健康护符').getByRole('button', { name: '同调' }).count()) === 1 && /同调 0 \/ 3/.test(await page.getByTestId('ps-attune').innerText()))
  await row('治疗药水').getByRole('button', { name: '治疗药水用掉一次' }).click(); await settle(page, 1500)
  check('药水次数 −1：0 / 1', /0 \/ 1/.test(await row('治疗药水').innerText()), await row('治疗药水').innerText())
  await shot('02-bag-edited')
  await row('治疗药水').getByRole('button', { name: '治疗药水的更多操作' }).click(); await page.getByRole('menuitem', { name: '删除' }).click(); await settle(page, 1500)
  check('删除药水', !/治疗药水/.test(await bagText()))
  await page.getByTestId('ps-undo').click(); await settle(page, 1500)
  check('撤销删除：药水回来了', /治疗药水/.test(await bagText()))
  await row('胸甲').getByRole('button', { name: '胸甲', exact: true }).click(); await settle(page, 2500)
  const detail = await page.locator('.ps-row-detail').innerText()
  check('点名字原地展开作者原文（中文）', detail.length > 10 && han(detail) && !/读不出来|没读出来/.test(detail), detail.replace(/\s+/g, ' ').slice(0, 120))
  await shot('03-bag-open')

  // ---- 加物品（从库里选，和从模板加入同一个两栏页）----
  await page.getByTestId('ps-bag-add').click(); await page.getByTestId('item-pick').waitFor()
  await page.getByTestId('ip-search').fill('火把'); await settle(page, 800)
  await page.getByTestId('ip-row').filter({ hasText: /^火把/ }).first().click(); await settle(page, 1500)
  await shot('05-item-pick')
  await page.getByTestId('ip-add').click()
  await page.getByTestId('item-pick').waitFor({ state: 'detached', timeout: 120_000 }); await settle(page, 1500)
  check('加物品：火把进了背包（一行、数量 1）', (await page.getByTestId('ps-bagt').getByTestId('ps-row').filter({ hasText: '火把' }).count()) === 1 && /\b1\b/.test(await row('火把').locator('.trpg-stepper').last().innerText()), await row('火把').innerText().catch(() => '没有火把这一行'))
  const saved = await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend
    const k = await be.kernelSave.read(camp.owner.ownerKey)
    return k.actors.flatMap((a) => a.refs.map((r) => r.label))
  }, pinia)
  check('加的物品写进了存档（人物的条目引用里有火把）', saved.some((l) => /火把|Torch/.test(String(l))), saved.join('、').slice(0, 200))
  await page.getByTestId('ps-undo').click(); await settle(page, 1500)
  check('撤销：火把没了', !/火把/.test(await bagText()))

  // ---- 窄屏 ----
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 800)
  await toPanel('ps-panel-bag'); await shot('04-narrow-bag')
  const right = await page.locator('[data-testid=ps-bagt] .ps-grp').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)))
  check('窄屏：背包表不超出窗口', right <= 390, `right=${right}`)
  // 量每组表头三格合起来的宽度（只量表本身会漏掉多出来的隐形列）
  const widths = await page.locator('[data-testid=ps-bagt] .ps-grp').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)))
  check('窄屏：各组一样宽、铺满', new Set(widths).size === 1 && widths[0] >= 340, widths.join(','))
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
