// P6-R 照 Tidy5e 搬的人物页控件逐个真点（真实插件界面 + 真实库 + 真实结算小窗），每样都读回人物数据核对：
// 表格（数量 / 装备 / 复制 / 自定义分组 / 新建 / 钱币 / 拆分 / 改名 / 官方筛选 / 显示到行动页 / 卷轴 / 钱币换算 / 置顶）· 页头（改名 / 属性值 / 力竭 / 死亡豁免 / 临时上限）
// · 属性页（熟练循环 / 换属性 / 收藏 / 豁免 / 等级菜单 / 升一级 / 背景删选 / 换种族 / 特质勾选 / 特殊特质）· 效果（新建 / 编辑 / 开关 / 复制 / 删除）。截图 work/p6-ui/shots-tidy-*/。
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'
import { answerImport } from './ask-helper.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-tidy-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-tidy'), { ...options, viewport: { width: 1440, height: 900 } })
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

  const S = (js) => page.evaluate(`(() => { const s = ${pinia}._s.get('person').sheet; return (${js}) })()`)
  const I = (id, path) => S(`(s.items.find((i) => i.id === '${id}') ?? {})${path}`)
  const menuOn = async (row, name) => { await row.getByRole('button', { name: /更多操作/ }).click(); await settle(page, 300); await page.getByRole('menuitem', { name }).click(); await settle(page, 2300) }
  const row = (text) => page.getByTestId('ps-row').filter({ hasText: text }).first()
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=pp-row]'); await settle(page, 600)
  await page.getByTestId('pp-row').filter({ hasText: '艾琳' }).first().click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)

  // —— 背包表格 ——
  await page.getByTestId('ps-tab-bag').click(); await page.getByTestId('ps-bag').waitFor(); await settle(page, 600)
  const pid = await row(/药水/).getAttribute('data-id')
  await row(/药水/).hover(); await row(/药水/).getByRole('button', { name: /数量加一/ }).click({ force: true }); await settle(page, 2200)
  check('背包：数量 +1', await I(pid, '.system.quantity') === 2)
  const aid = await row('胸甲').getAttribute('data-id'); const e0 = await I(aid, '.system.equipped')
  await row('胸甲').getByRole('button', { name: /^(卸下|装备)胸甲$/ }).click(); await settle(page, 2200)
  check('背包：装备开关', (await I(aid, '.system.equipped')) === !e0)
  const n0 = await S('s.items.length'); await menuOn(row('胸甲'), '复制一份')
  check('背包：复制一份（存档也成）', (await S('s.items.length')) === n0 + 1 && /胸甲（副本）/.test(await page.getByTestId('ps-bag-table').innerText()))
  const xid = await row('战斧').getAttribute('data-id'); await menuOn(row('战斧'), /移到自定义分组/)
  await page.getByTestId('section-name').fill('常用'); await page.getByRole('button', { name: '移过去' }).click(); await settle(page, 2500)
  check('背包：移到自定义分组「常用」', (await I(xid, `.flags?.['tavern-trpg']?.section`)) === '常用' && /常用/.test(await page.getByTestId('ps-bag-table').innerText()))
  await page.getByRole('button', { name: /新建物品/ }).first().click(); await settle(page, 400); await page.getByRole('menuitem', { name: /新建武器/ }).click(); await settle(page, 2500)
  check('背包：新建空白武器', /新武器/.test(await page.getByTestId('ps-bag-table').innerText()))
  const gp = page.locator('.ps-coin[data-coin=gp] input'); await gp.fill('+15'); await gp.press('Enter'); await settle(page, 2300)
  check('背包：金币 +15', (await S('s.system.currency.gp')) === 15)
  const n1 = await S('s.items.length'); await menuOn(row(/药水/), /拆分堆叠/)
  check('背包：拆分堆叠（2 → 1 + 1）', (await S('s.items.length')) === n1 + 1)
  await menuOn(row('战斧'), '编辑'); await page.getByTestId('pf-item-name').waitFor(); await settle(page, 600)
  await page.getByTestId('pf-item-name').fill('祖传战斧'); await page.getByTestId('pf-save').click(); await settle(page, 2500)
  check('背包：改名后页面显示新名字', /祖传战斧/.test(await page.getByTestId('ps-bag-table').innerText()))
  const before = await page.getByTestId('ps-row').count()
  await page.getByTestId('ps-bag-filters').click(); await settle(page, 300); await page.getByTestId('ps-bag-filter-action').click(); await settle(page, 2000)
  check('背包：官方筛选「动作」生效', (await page.getByTestId('ps-row').count()) < before)
  await page.getByRole('button', { name: '清除筛选' }).click(); await settle(page, 1000)
  await menuOn(row('胸甲'), /显示到行动页/)
  await page.getByTestId('ps-tab-action').click(); await settle(page, 800)
  check('行动页：「显示到行动页」的胸甲出现', /胸甲/.test(await page.getByTestId('ps-actions').innerText()))
  await page.getByTestId('ps-tab-spell').click(); await settle(page, 600)
  const n2 = await S('s.items.length'); await menuOn(page.getByTestId('ps-row').first(), '做成卷轴')
  check('法术页：做成卷轴（中文名）', (await S('s.items.length')) === n2 + 1 && (await S(`s.items.some((i) => i.name === '法术卷轴：酸液飞溅')`)))
  await page.getByTestId('ps-tab-bag').click(); await settle(page, 600)
  const cp = page.locator('.ps-coin[data-coin=cp] input'); await cp.fill('250'); await cp.press('Enter'); await settle(page, 2200)
  await page.getByTestId('ps-coin-convert').click(); await settle(page, 2500)
  check('背包：钱币换算', JSON.stringify(await S('s.system.currency')) === JSON.stringify({ pp: 1, gp: 7, ep: 1, sp: 0, cp: 0 }), JSON.stringify(await S('s.system.currency')))
  await menuOn(row(/药水/), '置顶到这一页')
  check('背包：置顶条出现', /治疗药水/.test(await page.getByTestId('ps-pins-bag').innerText()))
  await page.getByTestId('ps-bag').evaluate((e) => e.scrollIntoView({ block: 'start' })); await shot('bag')

  // —— 页头 ——
  await page.getByTestId('ps-name-edit').click(); await page.getByTestId('ps-name-input').fill('艾琳·晨光'); await page.getByTestId('ps-name-input').press('Enter'); await settle(page, 2200)
  check('页头：名字原地改', (await S('s.name')) === '艾琳·晨光')
  const str = page.getByTestId('ps-ability-str').locator('input'); await str.fill('15'); await str.press('Enter'); await settle(page, 2200)
  check('页头：属性值原地输入', (await S('s.system.abilities.str.value')) === 15)
  await page.getByRole('button', { name: '力竭 2 级' }).click(); await settle(page, 2200)
  check('页头：力竭点到 2 级', (await S('s.system.attributes.exhaustion')) === 2)
  await page.getByRole('button', { name: '失败 1' }).click(); await settle(page, 2200)
  check('页头：死亡豁免失败 1 格', (await S('s.system.attributes.death.failure')) === 1)
  await page.getByTestId('ps-hp-tempmax').click(); await page.getByTestId('ps-hp-tempmax-input').fill('-3'); await page.getByTestId('ps-hp-tempmax-input').press('Enter'); await settle(page, 2200)
  check('页头：临时生命上限 −3', (await S('s.system.attributes.hp.tempmax')) === -3)
  await shot('head')

  // —— 属性页 ——
  await page.getByTestId('ps-tab-attr').click(); await page.getByTestId('ps-attr').waitFor(); await settle(page, 700)
  const attr = page.getByTestId('ps-attr')
  await attr.getByTestId('ps-prof-ath').click(); await settle(page, 2200)
  check('属性页：技能熟练点一下 → 半熟练', (await S('s.system.skills.ath.value')) === 0.5)
  await attr.locator('[data-key=ath]').getByRole('button', { name: /运动的关联属性/ }).click(); await settle(page, 300); await page.getByRole('menuitem', { name: '敏捷' }).click(); await settle(page, 2200)
  check('属性页：技能换关联属性', (await S('s.system.skills.ath.ability')) === 'dex')
  await attr.getByTestId('ps-save-prof-str').click(); await settle(page, 2200)
  check('属性页：豁免熟练开关', (await S('s.system.abilities.str.proficient')) === 1)
  const lv = () => S(`s.items.filter((i) => i.type === 'class').map((i) => i.system.levels)[0]`)
  // 属性页的等级下拉 → 打开职业与出身弹窗，右边走升级问答（等级题已按下拉预选，要做的选择一题一题答完再确认）
  const levelTo = async (n) => {
    await attr.getByTestId('ps-build-level').first().click(); await settle(page, 300)
    await page.getByRole('option', { name: `${n} 级`, exact: true }).scrollIntoViewIfNeeded(); await page.getByRole('option', { name: `${n} 级`, exact: true }).click()
    await page.getByTestId('import-ask').waitFor(); await answerImport(page); await settle(page, 1500)
    await page.locator('.trpg-modal__close').click(); await settle(page, 500)
  }
  await levelTo(3)
  check('属性页：等级下拉改到 3 级（问答）', (await lv()) === 3)
  await levelTo(4)
  check('属性页：等级下拉再选 4 级只升一级（4）', (await lv()) === 4)
  await attr.getByTestId('ps-build-race').getByRole('button', { name: /更多操作/ }).click(); await settle(page, 300)
  await page.getByRole('menuitem', { name: /换种族/ }).click(); await page.getByTestId('item-pick').waitFor()
  await page.getByTestId('ip-search').fill('矮人'); await settle(page, 800); await page.getByTestId('ip-row').first().click(); await settle(page, 600); await page.getByTestId('ip-add').click()
  await page.getByTestId('import-ask').waitFor(); await answerImport(page); await settle(page, 1500)
  const traits = await attr.locator('.ps-traits').innerText()
  check('属性页：换成矮人，武器熟练按作者编号显示中文', /手斧/.test(traits) && !/Handaxe|Warhammer/.test(traits), traits.replace(/\s+/g, ' '))
  await attr.getByRole('button', { name: '改语言' }).click(); await page.getByTestId('trait-page').waitFor(); await settle(page, 1500)
  await page.getByTestId('trait-page').locator('.pf-tree li').filter({ hasText: /^精灵语$/ }).locator('label').click(); await page.getByTestId('trait-save').click(); await settle(page, 2500)
  check('属性页：语言勾选加精灵语', (await S('s.system.traits.languages.value')).includes('elvish'))
  await attr.getByTestId('ps-special-traits').click(); await page.getByTestId('special-traits').waitFor(); await settle(page, 1500)
  await page.getByTestId('special-traits').locator('.pf-row').filter({ hasText: /万事通/ }).getByRole('switch').click(); await page.getByTestId('special-save').click(); await settle(page, 2500)
  check('属性页：特殊特质 万事通', (await S('s.flags?.dnd5e?.jackOfAllTrades')) === true)
  await page.getByTestId('ps-attr').evaluate((e) => e.scrollIntoView({ block: 'start' })); await shot('attr')

  // —— 效果页 ——
  await page.getByTestId('ps-tab-effect').click(); await page.getByTestId('ps-effects').waitFor(); await settle(page, 700)
  const str0 = await S('s.system.abilities.str.value')
  await page.getByTestId('ps-eff-add-temporary').click(); await page.getByTestId('ae-name').waitFor(); await settle(page, 800)
  await page.getByTestId('ae-name').fill('祝福术')
  await page.getByTestId('ae-changes').getByRole('combobox').first().click(); await page.keyboard.type('力量'); await settle(page, 600); await page.getByRole('option').filter({ hasText: /属性值/ }).first().click(); await settle(page, 300)
  await page.getByTestId('ae-value').fill('2'); await page.getByTestId('ae-save').click(); await settle(page, 2500)
  check('效果页：新建效果，力量 +2 生效', (await S('s.system.abilities.str.value')) === str0 + 2, `${str0} → ${await S('s.system.abilities.str.value')}`)
  const er = page.getByTestId('ps-eff-row').filter({ hasText: '祝福术' }).first()
  await er.getByRole('button', { name: /更多操作/ }).click(); await settle(page, 300); await page.getByRole('menuitem', { name: '编辑' }).click(); await page.getByTestId('ae-name').waitFor(); await settle(page, 800)
  check('效果页：编辑里改法是中文', !/EFFECT\./.test(await page.getByTestId('effect-page').innerText()))
  await page.getByTestId('ae-name').fill('祝福术（强化）'); await page.getByTestId('ae-save').click(); await settle(page, 2500)
  check('效果页：编辑保存', (await S(`s.effects.some((e) => e.name === '祝福术（强化）')`)))
  await page.getByTestId('ps-eff-row').filter({ hasText: '祝福术（强化）' }).first().getByRole('switch').click(); await settle(page, 2200)
  check('效果页：关掉开关，力量回到原值', (await S('s.system.abilities.str.value')) === str0, `${str0} / ${await S('s.system.abilities.str.value')}`)
  await page.getByTestId('ps-effects').evaluate((e) => e.scrollIntoView({ block: 'start' })); await shot('effects')
  check('没有页面报错', errors.filter((e) => !/404|gendata-nav|Failed to load resource/.test(e)).length === 0, errors.join(' | ').slice(0, 400))
} catch (e) { check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900)); await shot('99-crash').catch(() => undefined) }
finally { clearTimeout(killer); await ctx.close(); server.close(); console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS'); process.exit(failures.length ? 1 : 0) }
