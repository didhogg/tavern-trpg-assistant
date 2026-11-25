// P6-R 职业流程（驾驶员 11-25 评测：主职业、目标等级、子职业、兼职是同一次人物变更，照作者自己的升级）：
//   空白人物 → 选德鲁伊 → 先选目标等级 2 → 同一流程里只列德鲁伊的子职业，选月亮结社 → 作者问答（不再问等级）→ 一次确认
//   → 德鲁伊 2 级 + 月亮结社紧贴在下；等级下拉升到 3 级（不再问子职业、不问等级）；兼职只列别的职业、从 1 级加、不问等级；
//   再加一个战士 2 级前不到门槛不问子职业。另起一个空白人物：德鲁伊 2 级「稍后再选」→ 职业下面留「选子职业」→ 补选只问作者的题，职业仍 2 级。
// 截图 work/p6-ui/shots-class-<内核>/。
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'
import { answerImport } from './ask-helper.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-class-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-class'), { ...options, viewport: { width: 1280, height: 860 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const S = (js) => page.evaluate(`(() => { const s = ${pinia}._s.get('person').sheet; return (${js}) })()`)
const dlg = () => page.getByTestId('origins-dialog')
const openOrigins = async () => { if (!await dlg().isVisible()) { await page.getByTestId('ps-origins-edit').click(); await dlg().waitFor(); await settle(page, 400) } }
const classes = () => S(`s.items.filter((i) => i.type === 'class').map((i) => i.system.identifier + ':' + i.system.levels).sort().join(',')`)
const subs = () => S(`s.items.filter((i) => i.type === 'subclass').map((i) => i.system.identifier).join(',')`)
/** 问答里每道题的题目（检查有没有再问等级）。 */
const titles = []
/** 答完、确认后等人物读数换成新的（记下从确认到画面换好的毫秒）。 */
const shown = []
const answer = async (tag, opts = {}) => {
  // opts.onReady：确认前看一眼清单
  const sig = `JSON.stringify(s.items.map((i) => i.id + (i.system?.levels ?? '')))`
  const before = await S(sig)
  const steps = await answerImport(page, { ...opts, onStep: async (n, title) => { titles.push(title); return shot(`${tag}-q${n}`) } })
  const t0 = Date.now()
  await page.waitForFunction(`(() => { const s = ${pinia}._s.get('person').sheet; return ${sig} !== ${JSON.stringify(before)} })()`, null, { timeout: 30000 }).catch(() => {})
  shown.push(`${tag} ${steps.at(-1)?.ms ?? '?'}+${Date.now() - t0}ms`)
  await settle(page, 300)
  return steps
}
const newBlank = async (name) => {
  if (await page.getByTestId('ps-head').isVisible()) { await page.getByTestId('ps-back').click(); await settle(page, 600) }
  await page.getByRole('button', { name: '新建' }).click(); await settle(page, 250)
  await page.getByRole('menuitem', { name: '直接新建（空白人物卡）' }).click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 800)
  await page.getByTestId('ps-name-edit').click(); await page.getByTestId('ps-name-input').fill(name); await page.getByTestId('ps-name-input').press('Enter'); await settle(page, 1500)
}
const pickRow = async (query, row) => {
  await page.getByTestId('ip-search').waitFor(); await page.getByTestId('ip-search').fill(query); await settle(page, 500)
  await page.getByTestId('ip-row').filter({ hasText: row }).first().click(); await settle(page, 500)
}
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '职业流程', codeSet: 'cn' }))
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 600)

  // ① 空白人物选德鲁伊：先问目标等级，选 2 级 → 同一流程选子职业（只列德鲁伊的）→ 作者问答不再问等级 → 一次确认
  await newBlank('林语')
  await openOrigins(); await dlg().getByTestId('ps-build-add-class').click()
  await pickRow('德鲁伊', /^德鲁伊\s*PHB/)
  await page.getByTestId('ip-add').click()
  await page.getByTestId('class-prep-level').waitFor(); await shot('01-target-level')
  check('① 选了职业先问目标等级（写明几级选子职业）', /2 级会接着选子职业/.test(await page.getByTestId('class-prep-level').innerText()))
  await page.getByTestId('prep-level-2').click(); await page.getByTestId('prep-level-next').click()
  await page.getByTestId('ip-title').waitFor(); await settle(page, 800); await shot('02-pick-circle')
  const circleRows = await page.getByTestId('ip-row').allInnerTexts()
  check('① 到 2 级接着选子职业：只列德鲁伊的子职业', circleRows.length >= 2 && circleRows.every((t) => /结社/.test(t)), circleRows.join(' | ').slice(0, 300))
  check('① 子职业页有「稍后再选」', await page.getByTestId('ip-later').isVisible())
  await pickRow('月', /月/)
  await page.getByTestId('ip-add').click()
  await page.getByTestId('import-ask').waitFor()
  check('① 已答一栏列出目标等级和子职业', /2 级/.test(await page.locator('.ask-done').innerText()) && /月/.test(await page.locator('.ask-done').innerText()))
  titles.length = 0
  let ready1 = ''
  const s1 = await answer('03-druid', { onReady: async () => { ready1 = await page.getByTestId('ask-added').innerText(); await shot('03-druid-ready') } })
  check('① 确认前的清单列出人物本身的变化（生命上限、技能熟练等）和物品', /生命上限/.test(ready1) && /技能/.test(ready1), ready1.replace(/\s+/g, ' ').slice(0, 300))
  check('① 作者问答里不再问等级', !titles.some((t) => /等级/.test(t) && /职业/.test(t)), titles.join(' / '))
  check('① 写进人物：德鲁伊 2 级 + 月亮结社', (await classes()) === 'druid:2' && /moon/.test(await subs()), `${await classes()} ${await subs()} ${JSON.stringify(s1.at(-1))}`)
  await openOrigins(); await shot('04-druid-built')
  check('① 子职业紧贴在德鲁伊下面', (await dlg().locator('[data-testid=ps-build-class] + [data-testid=ps-build-subclass]').count()) === 1)
  check('① 显示人物总等级', /总等级 2/.test(await dlg().getByTestId('ps-build-total').innerText()))
  const moonFeats = await S(`s.items.filter((i) => i.type === 'feat' && /wild shape|combat wild|circle forms|战斗野性|结社形态/i.test(i.name + ' ' + (i.flags?.plutonium?.hash ?? ''))).length`)
  check('① 月亮结社 2 级特性进了人物', moonFeats >= 1, String(moonFeats))

  // ② 等级下拉升到 3 级：已有子职业，不问子职业、不问等级
  await dlg().getByTestId('ps-build-level').first().click(); await page.getByRole('option', { name: '3 级', exact: true }).click()
  await page.getByTestId('import-ask').waitFor(); titles.length = 0
  await answer('05-lv3')
  check('② 升到 3 级：不问等级、不问子职业，德鲁伊 3 级、月亮结社还在', (await classes()) === 'druid:3' && /moon/.test(await subs()) && !titles.some((t) => /等级/.test(t) && /职业/.test(t)), `${await classes()} ${titles.join(' / ')}`)

  // ③ 兼职：只列别的职业，从 1 级加，不问等级
  await openOrigins(); await dlg().getByTestId('ps-build-multiclass').click()
  await page.getByTestId('ip-search').waitFor(); await page.getByTestId('ip-search').fill('德鲁伊'); await settle(page, 500)
  check('③ 兼职列表里没有已有的德鲁伊', !(await page.getByTestId('ip-row').filter({ hasText: /^德鲁伊\s*PHB/ }).count()))
  await pickRow('战士', /^战士\s*PHB/)
  await page.getByTestId('ip-add').click()
  await page.getByTestId('import-ask').waitFor(); titles.length = 0; await shot('06-multiclass')
  await answer('06-fighter')
  check('③ 兼职战士 1 级、德鲁伊仍 3 级、没问等级', (await classes()) === 'druid:3,fighter:1' && !titles.some((t) => /等级/.test(t) && /职业/.test(t)), `${await classes()} ${titles.join(' / ')}`)
  await openOrigins()
  check('③ 人物总等级 4', /总等级 4/.test(await dlg().getByTestId('ps-build-total').innerText()))
  await shot('07-two-classes')
  await page.locator('.trpg-modal__close').click(); await settle(page, 400)

  // ④ 另一个空白人物：德鲁伊 2 级稍后再选 → 职业下面留「选子职业」→ 补选：只问作者的题，职业仍 2 级
  await newBlank('晚星')
  await openOrigins(); await dlg().getByTestId('ps-build-add-class').click()
  await pickRow('德鲁伊', /^德鲁伊\s*PHB/); await page.getByTestId('ip-add').click()
  await page.getByTestId('prep-level-2').click(); await page.getByTestId('prep-level-next').click()
  await page.getByTestId('ip-later').click()
  await page.getByTestId('import-ask').waitFor()
  check('④ 已答一栏写「稍后再选」', /稍后再选/.test(await page.locator('.ask-done').innerText()))
  await answer('08-later')
  check('④ 德鲁伊 2 级、没有子职业', (await classes()) === 'druid:2' && !(await subs()))
  await openOrigins()
  check('④ 职业下面紧贴「选子职业」', (await dlg().locator('[data-testid=ps-build-class] + [data-testid=ps-build-needs-sub]').count()) === 1)
  await dlg().getByTestId('ps-build-pick-sub').click()
  await page.getByTestId('ip-search').waitFor(); await settle(page, 600); await shot('09-pick-sub-later')
  check('④ 补选页标题写明为德鲁伊几级选', await page.locator('.trpg-modal__title').filter({ hasText: /德鲁伊（2 级）选子职业/ }).isVisible())
  await pickRow('大地', /大地/); await page.getByTestId('ip-add').click()
  await page.getByTestId('import-ask').waitFor(); titles.length = 0
  await answer('10-land')
  check('④ 补选大地结社：没问等级，德鲁伊仍 2 级', (await classes()) === 'druid:2' && /land/.test(await subs()) && !titles.some((t) => /等级/.test(t)), `${await classes()} ${await subs()} ${titles.join(' / ')}`)
  await openOrigins(); await shot('11-land-built')

  // ⑤ 新建自制种族：进库里同一个新建条目流程（不往人物上塞空白条目）→ 存好回到选种族页、搜索框是它 → 用这一条走作者导入
  const itemsBefore = await S('s.items.length')
  await dlg().getByTestId('ps-build-new-race').click()
  await page.getByTestId('new-start').waitFor(); await shot('12-new-race-start')
  check('⑤ 新建自制种族：进的是库的「新建条目：从哪开始」，人物上没多东西', (await S('s.items.length')) === itemsBefore)
  // 详细表单 = 作者自己的「新种族」模板（作者构建器的默认内容，带正文）
  await settle(page, 600); await shot('12b-start-options')
  console.log('起点：' + (await page.getByTestId('start-option').allInnerTexts()).join(' | ').replace(/\s+/g, ' '))
  await page.getByTestId('start-next').click()
  const ed = page.locator('.trpg-modal__page:not(.is-under) [data-testid="editor"]')
  await ed.locator('[data-testid="entry-form"]').first().waitFor(); await settle(page, 1500)
  await ed.getByTestId('editor-main').locator('[data-field="name"] input').first().fill('雾林人'); await settle(page, 400)
  await shot('13-new-race-editor')
  await ed.getByTestId('editor-done').click()
  await page.getByTestId('save-page').waitFor(); await page.getByTestId('save-go').click()
  await page.getByTestId('ip-search').waitFor(); await shot('14-back-to-pick')
  check('⑤ 存好回到选种族页，搜索框填着刚存的名字', (await page.getByTestId('ip-search').inputValue()) === '雾林人')
  const t0 = Date.now()
  await page.getByTestId('ip-row').filter({ hasText: '雾林人' }).first().waitFor({ timeout: 40000 }).catch(() => {})
  const found = await page.getByTestId('ip-row').filter({ hasText: '雾林人' }).count()
  check('⑤ 刚存的自制种族出现在列表里', found > 0, `${Date.now() - t0}ms`)
  if (found) {
    await page.getByTestId('ip-row').filter({ hasText: '雾林人' }).first().click(); await settle(page, 600)
    await page.getByTestId('ip-add').click(); await page.getByTestId('import-ask').waitFor({ timeout: 30000 }).catch(() => {})
    if (await page.getByTestId('import-ask').count()) await answer('15-own-race')
    check('⑤ 用这一条：人物的种族是雾林人', (await S(`s.items.filter((i) => i.type === 'race').map((i) => i.name).join()`)).includes('雾林人'), await S(`s.items.filter((i) => i.type === 'race').map((i) => i.name).join()`))
  }
  await shot('16-own-race-done')
  if (await page.locator('.trpg-modal__close').count()) { await page.locator('.trpg-modal__close').first().click(); await settle(page, 400) }

  // ⑥ 降级收回作者导入的：德鲁伊 2 → 3（作者给 2 环德鲁伊法术）→ 降回 2：预览列出它们，确认后收回
  const spells2 = () => S(`s.items.filter((i) => i.type === 'spell' && i.system.level === 2).length`)
  await openOrigins(); await dlg().getByTestId('ps-build-level').first().click(); await page.getByRole('option', { name: '3 级', exact: true }).click()
  await page.getByTestId('import-ask').waitFor(); await answer('17-up3')
  const s2at3 = await spells2()
  check('⑥ 升到 3 级：作者加了 2 环法术', s2at3 > 0, String(s2at3))
  await openOrigins(); await dlg().getByTestId('ps-build-level').first().click(); await page.getByRole('option', { name: '2 级', exact: true }).click()
  await dlg().getByTestId('origins-level-down-list').waitFor(); await settle(page, 500); await shot('18-down-preview')
  const downItems = await dlg().getByTestId('origins-level-down-list').locator('li').count()
  check('⑥ 降级预览列出作者在 3 级加的东西（含法术）', downItems >= s2at3, `${downItems} 条，2 环法术 ${s2at3}`)
  await dlg().getByTestId('origins-level-down-ok').click()
  for (let i = 0; i < 30 && (await classes()) !== 'druid:2'; i++) await page.waitForTimeout(300)
  await settle(page, 500)
  check('⑥ 降回 2 级：2 环法术收回', (await classes()) === 'druid:2' && (await spells2()) === 0, `${await classes()} 2 环 ${await spells2()}`)

  // ⑦ 重选第 1 级（只有 1 级的战士）：起始装备、技能不会多一份
  await page.locator('.trpg-modal__close').first().click(); await settle(page, 400)
  await newBlank('一级')
  await openOrigins(); await dlg().getByTestId('ps-build-add-class').click()
  await pickRow('战士', /^战士\s*PHB/); await page.getByTestId('ip-add').click()
  await page.getByTestId('prep-level-next').click()
  await page.getByTestId('import-ask').waitFor(); await answer('19-fighter1')
  const itemsLv1 = await S('s.items.length')
  await openOrigins(); await dlg().locator('[data-testid=ps-build-lvl][data-level="1"]').click(); await settle(page, 500)
  check('⑦ 只有 1 级的战士：第 1 级可以重选', !(await dlg().getByTestId('origins-redo').isDisabled()))
  await dlg().getByTestId('origins-redo').click(); await page.getByTestId('import-ask').waitFor(); await shot('20-redo1')
  await answer('20-redo1')
  for (let i = 0; i < 20 && (await classes()) !== 'fighter:1'; i++) await page.waitForTimeout(300)
  check('⑦ 重选第 1 级：还是战士 1 级、物品数不变（起始装备没有多一份）', (await classes()) === 'fighter:1' && (await S('s.items.length')) === itemsLv1, `${await classes()} 物品 ${itemsLv1} → ${await S('s.items.length')}`)
  await shot('21-redo1-done')
} catch (e) {
  check(`流程跑完（${String(e.message ?? e).slice(0, 200)}）`, false)
  await shot('zz-failed').catch(() => {})
} finally {
  clearTimeout(killer)
  console.log('确认 → 人物画面换好：' + shown.join('；'))
  if (errors.length) console.log('页面错误：\n' + errors.slice(0, 10).join('\n'))
  await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
