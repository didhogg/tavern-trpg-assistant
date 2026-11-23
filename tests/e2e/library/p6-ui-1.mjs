// P6 单元 1 人物详情外壳（真实插件界面 + 真实库 + 真实结算小窗）：人物列表点一行进来 → 页头（中文名字 / 属性 / 技能）
// → 生命原地改（−3 预览后 Enter、+2、=5、临时 4）→ 生命骰 / 力竭 / 死亡豁免抽屉 → 身份抽屉（英文名）→ 头像链接校验
// → 撤销 → 改动记录（中文字段名）→ 下一位（怪物：挑战等级、传奇动作圆点、中文阵营）→ ⋯ 移到 NPC → ‹ 人物 回列表 → 窄屏 390。
// 截图 work/p6-ui/shots-1-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-1.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-1')
const shots = `${process.cwd()}/work/p6-ui/shots-1-${engineName}`
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
const hpNow = () => page.getByTestId('ps-hp-now').innerText().then(Number)
/** 像真人一样点弹窗右上角 ✕ 关掉（焦点不在弹窗里时 Esc 到不了弹窗宿主）。 */
const closeModal = async () => { await page.locator('.trpg-modal__close').click(); await settle(page, 500) }
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
    const a = await camp.backendWrite((k) => be.people.build(k, { name: '盖尔', items: ['race', 'background', 'class'].map((key) => plan[key].ref) }, { category: 'party' }))
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
  await shot('01-pc-head')
  const sub = await page.getByTestId('ps-sub').innerText()
  check('点一行进整页详情，名字行有职业等级（中文）', (await page.getByTestId('people-view').count()) === 0 && /野蛮人/.test(sub), sub)
  const abil = await page.getByTestId('ps-abilities').innerText()
  check('六属性中文名（力量…魅力）', ['力量', '敏捷', '体质', '智力', '感知', '魅力'].every((w) => abil.includes(w)), abil.replace(/\s+/g, ' '))
  check('侧栏技能 18 项中文', (await page.getByTestId('ps-side').locator('li').count()) === 18 && han(await page.getByTestId('ps-side').innerText()))
  const facts = await page.getByTestId('ps-facts').innerText()
  check('事实表：种族、背景（中文）、体型、速度', /种族/.test(facts) && /背景/.test(facts) && /速度/.test(facts) && !/DND5E\./.test(facts), facts.replace(/\s+/g, ' '))

  // ---- 生命原地改 ----
  const hp0 = await hpNow()
  await page.getByTestId('ps-hp-now').click(); await page.getByTestId('ps-hp-input').fill('-3'); await settle(page, 1200)
  const hint = await page.getByTestId('ps-hp-hint').innerText()
  check('输入 −3：预览「生命 a → a−3」', hint.includes(`${hp0} → ${hp0 - 3}`), hint)
  await shot('02-hp-preview')
  await page.getByTestId('ps-hp-input').press('Enter'); await settle(page, 1500)
  check('Enter 生效：生命少 3', (await hpNow()) === hp0 - 3)
  await page.getByTestId('ps-hp-now').click(); await page.getByTestId('ps-hp-input').fill('+2'); await settle(page, 1200); await page.getByTestId('ps-hp-input').press('Enter'); await settle(page, 1500)
  check('+2 治疗', (await hpNow()) === hp0 - 1)
  await page.getByTestId('ps-hp-now').click(); await page.getByTestId('ps-hp-input').fill('=5'); await page.getByTestId('ps-hp-input').press('Enter'); await settle(page, 1500)
  check('=5 直接设', (await hpNow()) === 5)
  await page.getByTestId('ps-hp-now').click(); await page.getByTestId('ps-hp-input').fill('-1'); await settle(page, 1200); await page.getByTestId('ps-hp-input').press('Escape'); await settle(page, 800)
  check('Esc 还原，不改', (await hpNow()) === 5)
  await page.getByTestId('ps-hp-temp').click(); await page.locator('.ps-hp-input--temp').fill('4'); await page.locator('.ps-hp-input--temp').press('Enter'); await settle(page, 1500)
  check('临时生命 4', /\+4 临时/.test(await page.getByTestId('ps-hp-temp').innerText()))

  // ---- 三个抽屉 ----
  const hdBefore = await page.getByTestId('ps-hd').innerText()
  await page.getByTestId('ps-hd').click(); await page.getByTestId('ps-drawer-hitDice').waitFor(); await shot('03-drawer-hd')
  await page.getByRole('button', { name: '用掉一颗' }).first().click(); await settle(page, 1500)
  await closeModal()
  check('生命骰用掉一颗', (await page.getByTestId('ps-hd').innerText()) !== hdBefore, `${hdBefore} → ${await page.getByTestId('ps-hd').innerText()}`)
  await page.getByTestId('ps-exh').click(); await page.getByTestId('ps-drawer-exhaustion').waitFor(); await settle(page, 800); await shot('04-drawer-exh')
  await page.getByRole('button', { name: '多一级' }).click(); await settle(page, 1500); await closeModal()
  check('力竭 1 级', /力竭\s*1 级/.test(await page.getByTestId('ps-exh').innerText()))
  await page.getByTestId('ps-death').click(); await page.getByTestId('ps-drawer-death').waitFor()
  await page.getByTestId('ps-drawer-death').getByRole('group', { name: '死亡豁免成功' }).getByRole('button', { name: '设为 2' }).click(); await settle(page, 1500); await shot('05-drawer-death')
  await closeModal()
  check('死亡豁免成功 2', /成功 2/.test(await page.getByTestId('ps-death').innerText()))

  // ---- 身份 / 头像 ----
  await page.getByTestId('ps-ident-edit').click(); await page.getByTestId('ps-drawer-identity').waitFor()
  await page.getByTestId('ps-drawer-identity').getByLabel('英文名（选填）').fill('Gale'); await shot('06-drawer-identity')
  await page.getByTestId('ps-drawer-identity').getByRole('button', { name: '保存' }).click(); await settle(page, 1500)
  check('英文名显示在名字旁', /Gale/.test(await page.locator('.ps-name-line').innerText()))
  await page.getByTestId('ps-portrait').click(); await page.getByTestId('ps-drawer-avatar').waitFor()
  await page.getByTestId('ps-drawer-avatar').getByLabel('图片链接').fill('不是网址'); await settle(page, 300)
  check('头像：不是网址时说明原因、[使用这张]灰掉', /http/.test(await page.getByTestId('ps-drawer-avatar').innerText()) && await page.getByRole('button', { name: '使用这张' }).isDisabled())
  await shot('07-drawer-avatar'); await closeModal()

  // ---- 撤销 / 改动记录 ----
  await page.getByTestId('ps-undo').click(); await settle(page, 1500)
  check('撤销一步：英文名回到空', !/Gale/.test(await page.locator('.ps-name-line').innerText()))
  await page.getByTestId('ps-history').click(); await page.getByTestId('ps-drawer-history').waitFor(); await settle(page, 1200); await shot('08-history')
  const hist = await page.getByTestId('ps-drawer-history').innerText()
  check('改动记录：中文字段名（当前 HP / 临时 HP 一类）', /HP|生命/.test(hist) && /撤销到这里/.test(hist) && !/system\./.test(hist), hist.replace(/\s+/g, ' ').slice(0, 300))
  await closeModal()

  // ---- 下一位：怪物 ----
  await page.getByTestId('ps-next').click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1500); await shot('09-monster-head')
  const lvl = await page.getByTestId('ps-level').innerText()
  const msub = await page.getByTestId('ps-sub').innerText()
  check('怪物页头：挑战等级 + 传奇动作圆点，没有灵感', /挑战等级/.test(lvl) && /传奇动作/.test(lvl) && (await page.getByTestId('ps-insp').count()) === 0, lvl.replace(/\s+/g, ' '))
  check('怪物名字行：类型 · 体型 · 阵营都是中文', han(msub) && !/[A-Za-z]{4,}/.test(msub), msub)
  await page.getByRole('button', { name: '放在哪个分类' }).click(); await page.getByRole('menuitem', { name: 'NPC' }).click(); await settle(page, 1500)
  check('分类 ▾ 移到 NPC', /NPC/.test(await page.getByRole('button', { name: '放在哪个分类' }).innerText()))
  await page.getByTestId('ps-back').click(); await page.getByTestId('people-view').waitFor(); await settle(page, 600)
  check('‹ 人物 回到列表', (await page.getByTestId('person-page').count()) === 0)

  // ---- 窄屏 ----
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 600)
  await page.locator('.trpg-tabs').getByRole('button', { name: '人物' }).click(); await settle(page, 400)
  await page.getByTestId('pp-tab-party').click(); await settle(page, 400)
  await page.getByTestId('pp-row').filter({ hasText: '盖尔' }).first().click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)
  await shot('10-narrow-head')
  check('窄屏：侧栏默认收起', (await page.getByTestId('ps-side').count()) === 0)
  const box = await page.getByTestId('ps-abilities').boundingBox()
  const cols = await page.locator('.ps-ability').evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size)
  check('窄屏：属性 3 列、不超出窗口', cols === 3 && box && box.width <= 390, `cols=${cols} width=${box?.width}`)
  await page.mouse.wheel(0, 900); await settle(page, 400); await shot('11-narrow-tabs')
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
