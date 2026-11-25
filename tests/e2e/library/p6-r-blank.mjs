// P6-R 从空白卡建一个完整人物（驾驶员 11-24：不用建卡器，空白卡里每一步都能建）——全部按用户点法：
//   新建 → 直接新建 → 名字框 ✎ 改名 → 页头填属性值 → 职业与出身框 ✎ → 选种族（半精灵）→ 选背景（侍僧）→ 选职业（牧师，选戏法）→ 选子职业（生命领域）
//   → 等级下拉选 2 级（右边答升级题） → 加专长 / 物品 → 逐页看（没有原始键、没有漏翻英文）→ 撤销最后一步。
// 每道题都走作者「导入到人物」问答（ask-helper.mjs 像用户一样答）；每步反馈要在 1 秒内（这个战役第一次启动规则引擎除外）。
// 截图 work/p6-ui/shots-blank-<内核>/。
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'
import { answerImport } from './ask-helper.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-blank-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-blank'), { ...options, viewport: { width: 1280, height: 860 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const S = (js) => page.evaluate(`(() => { const s = ${pinia}._s.get('person').sheet; return (${js}) })()`)
const slow = []
/** 一道题从点下去到下一题出来；超过 1 秒记下（问答页本身另有 0.4 秒后的「正在准备」提示）。 */
const noteSteps = (tag, steps) => { for (const st of steps) if (st.ms > 1000) slow.push(`${tag}「${st.title ?? st.done}」${st.ms}ms`) ; return steps }
const fromLibrary = async (open, query, row, tag, opts = {}) => {
  await open(); await page.getByTestId('ip-search').waitFor()
  await page.getByTestId('ip-search').fill(query); await settle(page, 500)
  await page.getByTestId('ip-row').filter({ hasText: row }).first().click(); await settle(page, 500)
  await page.getByTestId('ip-add').click()
  await page.getByTestId('import-ask').waitFor()
  // 第一题停 2 秒：真人要读题，后台趁这时预读资料（ask-helper firstPause）
  const steps = noteSteps(tag, await answerImport(page, { firstPause: 2000, ...opts, onStep: (n) => shot(`${tag}-q${n}`) }))
  await settle(page, 1200)
  return steps
}
/** 职业与出身弹窗（页头框 ✎）：没开就先开，再点里面的按钮。 */
const originsDlg = () => page.getByTestId('origins-dialog')
const inOrigins = async (testid) => {
  if (!await originsDlg().isVisible()) { await page.getByTestId('ps-origins-edit').click(); await originsDlg().waitFor() }
  await originsDlg().getByTestId(testid).click()
}
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '空白卡建人', codeSet: 'cn' }))
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 600)

  // ① 直接新建
  await page.getByRole('button', { name: '新建' }).click(); await settle(page, 250)
  await page.getByRole('menuitem', { name: '直接新建（空白人物卡）' }).click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 800); await shot('01-blank')
  check('① 直接新建：进了空白人物卡（等级 0，职业与出身框写着还没有）', (await S('s.system.details.level')) === 0 && await page.getByTestId('ps-unit-origins-empty').isVisible())

  // ② 改名 + 属性值（页头原地填）
  await page.getByTestId('ps-name-edit').click(); await page.getByTestId('ps-name-input').fill('艾莉娅'); await page.getByTestId('ps-name-input').press('Enter'); await settle(page, 1500)
  for (const [k, v] of [['str', 8], ['dex', 14], ['con', 13], ['int', 10], ['wis', 15], ['cha', 12]]) {
    const ipt = page.getByTestId(`ps-ability-${k}`).locator('input'); await ipt.click(); await ipt.fill(String(v)); await ipt.press('Enter'); await settle(page, 1200)
  }
  check('② 改名、属性值写进人物', (await S('s.name')) === '艾莉娅' && (await S('s.system.abilities.wis.value')) === 15, JSON.stringify(await S('Object.fromEntries(Object.entries(s.system.abilities).map(([k, v]) => [k, v.value]))')))

  // ③ 种族 / 背景 / 职业 / 子职业（作者整路：特性、熟练、装备一起来）
  await page.getByTestId('ps-origins-edit').click(); await originsDlg().waitFor(); await settle(page, 500); await shot('02b-origins-empty')
  await fromLibrary(() => inOrigins('ps-build-pick-race'), '半精灵', /^半精灵\s*PHB/, '03-race', { prefer: { '技能熟练': ['洞悉', '察觉'] } })
  check('③ 种族：半精灵 + 种族特性', /半精灵/.test(await page.getByTestId('ps-unit-origin').innerText()) && (await S(`s.items.filter((i) => i.type === 'feat').length`)) >= 4)
  await fromLibrary(() => inOrigins('ps-build-pick-background'), '侍僧', /^侍僧/, '04-bg')
  check('③ 背景：侍僧 + 信仰庇护', /侍僧/.test(await page.getByTestId('ps-unit-origin').innerText()) && /庇护/.test(await S('JSON.stringify(s.shown?.items ?? [])')))
  // 选条目页：中英文名都能搜、按来源筛选
  await inOrigins('ps-build-add-class'); await page.getByTestId('ip-search').waitFor()
  await page.getByTestId('ip-search').fill('Cleric'); await settle(page, 500)
  check('选条目：英文名 Cleric 搜得到牧师', /牧师/.test(await page.getByTestId('ip-row').first().innerText()))
  await page.getByTestId('ip-search').fill('')
  if (await page.getByTestId('ip-source').count()) {
    await page.getByTestId('ip-source').click(); await page.getByRole('option', { name: /PHB/ }).first().click(); await settle(page, 500)
    const srcs = [...new Set((await page.locator('[data-testid=ip-row] .lib-src').allInnerTexts()).map((x) => x.trim()))]
    check('选条目：按来源筛选只剩 PHB', srcs.length === 1 && srcs[0] === 'PHB', srcs.join('、'))
  } else check('选条目：有「按来源筛选」', false)
  await page.keyboard.press('Escape'); await settle(page, 400)
  await fromLibrary(() => inOrigins('ps-build-add-class'), '牧师', /^牧师\s*PHB/, '05-class', { prefer: { '技能熟练': ['医药', '宗教'], '选择戏法': ['圣火术', '神导术', '维生术'] } })
  check('③ 职业：牧师 1 级、生命 > 0、AC > 10', /牧师\s*1/.test(await page.getByTestId('ps-unit-classes').innerText()) && (await S('s.system.attributes.hp.max')) > 0 && (await S('s.system.attributes.ac.value')) > 10)
  const cantrips = await S(`s.items.filter((i) => i.type === 'spell' && i.system.level === 0).length`)
  check('③ 选的 3 个戏法进了人物', cantrips === 3, String(cantrips))
  check('③ 1 级牧师该选子职业（按作者职业数据）', await originsDlg().getByTestId('ps-build-pick-sub').isVisible())
  await fromLibrary(() => inOrigins('ps-build-pick-sub'), '生命', /生命/, '06-sub')
  await settle(page, 400); await shot('06b-origins-built')
  check('③ 子职业：生命领域', (await S(`s.items.filter((i) => i.type === 'subclass').length`)) === 1 && /生命/.test(await originsDlg().getByTestId('ps-build').innerText()))

  // ④ 升级（职业与出身弹窗：牧师那一行的等级下拉选 2 级 → 右边答升级题，等级题已预选 2 级）
  await originsDlg().getByTestId('ps-build-level').first().click(); await page.getByRole('option', { name: '2 级', exact: true }).click()
  await page.getByTestId('import-ask').waitFor(); await shot('07-lv2-start')
  noteSteps('07-lv2', await answerImport(page, { firstPause: 2000, onStep: (n) => shot(`07-lv2-q${n}`) })); await settle(page, 1200)
  check('④ 升到 2 级（引导神力进特性）', (await S('s.system.details.level')) === 2 && /引导神力/.test(await S('JSON.stringify(s.shown?.items ?? [])')))
  check('④ 升完回到牧师的资料（弹窗还在，右边是资料卡）', await originsDlg().isVisible() && (await page.getByTestId('import-ask').count()) === 0)
  await shot('07-lv2-done')
  await page.locator('.trpg-modal__close').click(); await settle(page, 400)

  // ④′ 带「附带选择」的专长（2024 魔法学徒：作者组合组件 / 额外法术——选职业法表、戏法、1 环法术、施法属性），答完法术真的进人物
  await page.getByTestId('ps-tab-feat').click(); await settle(page, 700)
  const spellsBefore = await S(`s.items.filter((i) => i.type === 'spell').length`)
  const miSteps = await fromLibrary(() => page.getByRole('button', { name: /从库里加专长/ }).click(), '魔法学徒', /^魔法学徒\s*XPHB/, '07b-mi')
  check('④′ 组合题出现并答完（魔法学徒）', miSteps.some((st) => st.did === 'parts' || /法术/.test(st.title ?? '')) && miSteps.some((st) => st.done === 'confirmed'), JSON.stringify(miSteps))
  const spellsAfter = await S(`s.items.filter((i) => i.type === 'spell').length`)
  check('④′ 魔法学徒选的法术进了人物（至少 3 条）', spellsAfter - spellsBefore >= 3, `${spellsBefore} → ${spellsAfter}`)

  // ⑤ 加专长 / 物品（作者一题不问的直接写入）
  await fromLibrary(() => page.getByRole('button', { name: /从库里加专长/ }).click(), '警觉', /^警觉/, '08-feat')
  await page.getByTestId('ps-tab-bag').click(); await settle(page, 700)
  await fromLibrary(() => page.getByRole('button', { name: /从库里加物品/ }).click(), '治疗药水', /^治疗药水/, '09-item')
  check('⑤ 专长、物品都加上了', (await S(`s.items.some((i) => i.name === 'Alert')`)) && (await S(`s.items.some((i) => i.name === 'Potion of Healing')`)))

  // ⑥ 逐页看：没有原始键、没有漏翻英文（作者中文资料原文里本来带的英文词除外）
  const raw = (t) => /DND5E\.|EFFECT\.|TYPES\.|TRPGAssistant\.|undefined|\[object|NaN/.test(t)
  for (const tab of ['action', 'attr', 'bag', 'spell', 'feat', 'effect', 'bio']) {
    await page.getByTestId(`ps-tab-${tab}`).click(); await settle(page, 800); await shot(`10-${tab}`)
    const t = await page.locator('.ps-tab').innerText()
    const eng = [...new Set((t.match(/[A-Za-z][A-Za-z' ]{4,}/g) ?? []).map((w) => w.trim()))].filter((w) => !/^(PHB|XPHB|SRD|Traditions)$/.test(w))
    check(`⑥ ${tab} 页没有原始键、没有漏翻英文`, !raw(t) && !eng.length, eng.join('、'))
  }
  check('⑥ 背景页个性特征是中文（玩家看到并选中的那句）', /[一-龥]/.test(await S('s.system.details.trait')))

  // ⑦ 撤销最后一步（加物品）→ 再撤一步（加专长）：整步退回
  await page.getByTestId('ps-undo').click(); await settle(page, 2000)
  await page.getByTestId('ps-undo').click(); await settle(page, 2000)
  check('⑦ 撤销两步：物品、专长都退回，职业还在', !(await S(`s.items.some((i) => i.name === 'Potion of Healing')`)) && !(await S(`s.items.some((i) => i.name === 'Alert')`)) && (await S('s.system.details.level')) === 2)
  check('每道题反馈都在 1 秒内', !slow.length, slow.join('；'))
} catch (e) {
  check('测试流程没中断', false, String(e?.message ?? e).slice(0, 500))
  await shot('99-error').catch(() => undefined)
} finally {
  clearTimeout(killer)
  const known = errors.filter((e) => !/gendata-nav-adventure-book-index|404/.test(e))
  check('没有未解释的页面报错', !known.length, known.slice(0, 4).join(' | '))
  await ctx.close(); server.close()
}
console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS'); process.exit(failures.length ? 1 : 0)
console.log('ALL PASS')
