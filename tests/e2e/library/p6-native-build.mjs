// P6 第 2 段：建卡专用小窗跑作者完整建卡器（本机私人完整版），真实插件后台（Chrome；ENGINE=webkit 换 WebKit；上限 8 分钟）。
// 本机没有 vendor/private/modules/plutonium/（私人完整版，不进 git）就跳过并说明。
// 查：① 本战役关掉一本书（XGE）和一个条目（PHB 半兽人），作者建卡器的候选里都没有；2014 战役看不到 2024 职业；
//     ② 像玩家一样在作者原界面建一个 3 级生命领域牧师（标准数组、技能、语言、装备、法术）→ 收进存档 → 日常小窗里一致 → 关小窗读档、整页刷新读回一致；
//     ③ 再开一次建卡，中途关掉作者窗口 = 取消，存档不变；建卡期间日常小窗照常能用，且日常小窗不装屏蔽名单。
// 测试里点的是玩家输入（选哪个职业、分哪些属性），不是建卡规则。
import assert from 'node:assert/strict'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic, root } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'

try { await access(join(root, 'vendor/private/modules/plutonium/module.json')) } catch {
  console.log('跳过：本机没有私人完整版（vendor/private/modules/plutonium/）'); process.exit(0)
}
const LIMIT = 8 * 60_000
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, LIMIT)
await buildAll()
const engine = process.env.ENGINE ?? 'chrome'
const [, type, options] = engines[engine === 'webkit' ? 1 : 0]
const shots = join(root, `work/p6-native/shots-${engine}`)
await mkdir(shots, { recursive: true })
const { server, url } = await startStatic({ port: E2E_PORT })
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-native-build'), { ...options, viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
const shot = (name) => page.screenshot({ path: join(shots, `${name}.png`) })
const checks = {}

const env = (fresh) => page.evaluate(async (fresh) => {
  const h = await import('/work/e2e-lib/harness.js')
  const owner = 'char:p6-native-build.png'
  let library = h.defaultCampaignLibrary('dnd5e2014', 'en')
  if (fresh) {
    const audit = await h.offlineAudit('en-official')
    if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install('en-official')
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    // 本战役关掉一本书和一个条目（玩家在资料范围里做的事）
    const halfOrc = (await h.scoped.query(library, 'race', { source: 'PHB', mode: 'browse' })).find((r) => r.item.name === 'Half-Orc')
    if (!halfOrc) throw Error('缺测试条目 PHB 半兽人')
    library = { ...library, ...h.chooseSource(library, 'XGE', false) }
    library = { ...library, ...h.chooseEntry(library, halfOrc.ref, false) }
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 完整建卡器', ruleId: library.rule, name: 'P6 完整建卡器' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
  } else {
    library = await h.kernelSave.libraryOf(owner)
  }
  const deps = { revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
    campaignOf: async () => ({ rule: library.rule, library, title: 'P6 完整建卡器' }) }
  const rt = new h.KernelRuntime({ ...deps, cache: { db: h.libraryDb, dataVersion: h.dataVersion } })
  const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
  const native = new h.KernelNativeBuild(deps)
  globalThis.nb = { h, owner, library, rt, saves, native, people: new h.KernelPeople({ runtime: rt, saves, native }) }
  await rt.session(owner)
}, fresh)

/** 开始一次建卡（不等它结束），拿到建卡专用小窗；测试里把它铺满页面、挂上作者声明的样式（产品里的承载是第 3 段）。 */
async function startBuild(name) {
  await page.evaluate((name) => {
    globalThis.showBuild = true
    globalThis.nbRun = nb.people.buildNative(nb.owner, name, { category: 'party' }).then((r) => (globalThis.nbBuilt = r.built.data ?? null, { status: r.built.status, error: r.built.error ?? null, id: r.id ?? null, excluded: r.built.excluded ?? null, unpaired: r.built.unpaired?.length ?? null }))
  }, name)
  let frame
  await page.waitForFunction(() => document.querySelectorAll('iframe[data-trpg-author-frame="foundry"]').length >= 2)
  for (let i = 0; i < 600 && !frame; i++) {
    for (const f of page.frames()) {
      if (!f.url().includes('/vendor/foundry/frame.html')) continue
      if (await f.evaluate(() => String(globalThis.game?.world?.id ?? '').startsWith('trpg-build-')).catch(() => false)) frame = f
    }
    if (!frame) await page.waitForTimeout(500)
  }
  assert(frame, '没找到建卡专用小窗')
  await frame.evaluate(async () => {
    const styles = [game.system, ...game.modules.filter((m) => m.active)].flatMap((p) => [...(p.styles ?? [])].map((s) => new URL(String(s.src ?? s), location.href).href))
    await Promise.all(styles.map((href) => new Promise((resolve) => { const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href }); l.onload = l.onerror = resolve; document.head.append(l) })))
  })
  await frame.getByRole('button', { name: 'Confirm', exact: true }).waitFor()
  return frame
}

/** 玩家关掉作者开着的窗口（作者的关闭钮），直到这次建卡结束。 */
async function closeAuthorWindows(frame) {
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => Promise.race([globalThis.nbRun.then(() => true), new Promise((r) => setTimeout(() => r(false), 800))]))) return
    const close = frame.locator('[data-action="close"]')
    if (await close.count().catch(() => 0)) await close.last().click({ force: true, timeout: 3000 }).catch((e) => { if (!/detached|not attached|closed|Timeout/i.test(e.message)) throw e })  // 窗口刚好自己关了
  }
}

try {
  await page.goto(url)
  await page.evaluate(() => new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n instanceof HTMLIFrameElement && n.dataset.trpgAuthorFrame === 'foundry' && globalThis.showBuild) {
      n.style.cssText = 'position:fixed;inset:0;width:1280px;height:900px;border:0;visibility:visible;pointer-events:auto;z-index:10'
      n.removeAttribute('aria-hidden')
    }
  }).observe(document.body, { childList: true }))
  await env(true)

  // ① 范围：先看后端算出的屏蔽名单
  checks.excludes = await page.evaluate(async () => {
    const view = await nb.h.revisions.published()
    const { rows, unpaired } = await nb.h.campaignExcludes({ scoped: nb.h.scoped, service: nb.h.service }, nb.library, view)
    const has = (category, test) => rows.some((r) => r.category === category && test(r))
    return { rows: rows.length, unpaired: unpaired.length, halfOrc: has('race', (r) => /half-orc/i.test(r.hash) && r.source === 'PHB'), xgeSubclass: has('subclass', (r) => r.source === 'XGE'), clericVisible: (await nb.h.scoped.query(nb.library, 'class', { view })).filter((r) => r.item.name === 'Cleric').length }
  })
  assert(checks.excludes.halfOrc && checks.excludes.xgeSubclass, `屏蔽名单不全：${JSON.stringify(checks.excludes)}`)

  const frame = await startBuild('原生建卡验证人物')
  await shot('00-source-window')
  await frame.getByRole('button', { name: 'Confirm', exact: true }).click()
  await frame.getByRole('button', { name: 'Finalize', exact: true }).waitFor()
  // 作者自带的默认名单两边都有；本战役的行只在建卡小窗（日常小窗关着的条目照样要能结算）
  const key = (r) => `${r.hash}|${r.category}|${r.source}`.toLowerCase()
  const buildList = (await frame.evaluate(() => ExcludeUtil.getList())).map(key)
  const dailyList = (await page.evaluate(() => [...document.querySelectorAll('iframe[data-trpg-author-frame="foundry"]')][0].contentWindow.ExcludeUtil.getList())).map(key)
  const halfOrcRow = buildList.find((k) => /half-orc.*\|race\|phb$/.test(k))
  checks.blocklist = { build: buildList.length, daily: dailyList.length, authorDefaultsKept: dailyList.every((k) => buildList.includes(k)), oursInBuild: !!halfOrcRow, oursInDaily: dailyList.includes(halfOrcRow) }
  assert(checks.blocklist.authorDefaultsKept && checks.blocklist.oursInBuild && !checks.blocklist.oursInDaily, `屏蔽名单不对：${JSON.stringify(checks.blocklist)}`)

  // 作者候选和本战役一致：关掉的 XGE 坟墓领域、PHB 半兽人看不到；牧师行数 = 本战役看得见的条数
  const options = async (index, term) => {
    await frame.locator('.ve-ui-sel2__ipt-search:visible').nth(index).fill(term)
    const list = await frame.locator('.ve-ui-sel2__disp-option:visible').allInnerTexts()
    await frame.locator('.ve-ui-sel2__ipt-search:visible').nth(index).fill('')
    return list.map((t) => t.trim())
  }
  const pick = async (name, index = 0) => {
    await frame.locator('.ve-ui-sel2__ipt-search:visible').nth(index).fill(name)
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    await frame.locator('.ve-ui-sel2__disp-option:visible').filter({ hasText: new RegExp('^' + escaped + '\\s*$') }).first().click()
  }
  checks.clericRows = await options(0, 'Cleric')
  // 作者只会比本战役少（作者自己还按世界规则版本等筛），不会多出关掉的
  const clerics = checks.clericRows.filter((t) => /^Cleric\b/.test(t)).length
  assert(clerics >= 1 && clerics <= checks.excludes.clericVisible, `作者的牧师行数不对：${checks.clericRows}`)

  // ② 像玩家一样建一个人（第 1 段同一组玩家输入）
  await pick('Cleric')
  await frame.locator('input[type=checkbox]:visible').nth(0).check()
  await frame.locator('input[type=checkbox]:visible').nth(2).check()
  checks.subclassRows = await options(1, 'Domain')
  assert(!checks.subclassRows.some((t) => /^Grave Domain/.test(t)), `关掉的 XGE 坟墓领域不该出现：${checks.subclassRows}`)
  assert(checks.subclassRows.some((t) => /Life/.test(t)), '生命领域应该在')
  await pick('Life Domain', 1)
  await frame.locator('label:visible').filter({ has: frame.locator('input[type=radio]') }).nth(2).click()
  await shot('01-class-level-subclass')
  await frame.getByRole('button', { name: 'Origin (Background)', exact: true }).click()
  await pick('Acolyte')
  await frame.locator('input[type=checkbox]:visible').nth(3).check()
  await frame.locator('input[type=checkbox]:visible').nth(4).check()
  await shot('02-background')
  await frame.getByRole('button', { name: 'Origin (Species)', exact: true }).click()
  checks.speciesRows = await options(0, 'Half')
  assert(!checks.speciesRows.includes('Half-Orc'), `关掉的半兽人不该出现：${checks.speciesRows}`)
  assert(checks.speciesRows.includes('Half-Elf'), '半精灵应该在')
  await pick('Human')
  await frame.locator('input[type=checkbox]:visible').nth(2).check()
  await shot('03-species')
  await frame.getByRole('button', { name: 'Abilities', exact: true }).click()
  await frame.locator('select:visible').selectOption({ label: 'Standard Array' })
  for (const [index, label] of ['14', '12', '13', '10', '15', '8'].entries()) await frame.locator('select:visible').nth(index + 1).selectOption({ label })
  await shot('04-abilities')
  await frame.getByRole('button', { name: 'Starting Equipment', exact: true }).click()
  await frame.getByTitle('Choose an Item', { exact: true }).last().click()
  await frame.getByText('Amulet', { exact: true }).last().locator('..').getByRole('button').click()
  await shot('05-equipment')
  await frame.getByRole('button', { name: 'Spells', exact: true }).click()
  for (const name of ['Guidance', 'Light', 'Sacred Flame']) await frame.getByText(name, { exact: true }).first().locator('..').getByRole('button', { name: 'Learn', exact: true }).click()
  for (const name of ['Command', 'Detect Magic', 'Guiding Bolt', 'Healing Word', 'Aid', 'Hold Person']) await frame.getByText(name, { exact: true }).first().locator('..').getByRole('button', { name: 'Prep.', exact: true }).click()
  await shot('06-spells')
  // 建卡期间日常小窗照常能用
  checks.dailyDuringBuild = await page.evaluate(async () => (await nb.rt.session(nb.owner)).session.call('status').then((s) => !!s))
  await frame.getByRole('button', { name: 'Finalize', exact: true }).click()
  await frame.getByText('OK', { exact: true }).click()
  await frame.getByText('Build complete.', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
  await shot('07-build-complete')
  await closeAuthorWindows(frame)
  checks.run = await page.evaluate(() => globalThis.nbRun)
  assert.equal(checks.run.status, 'built', `建卡没成：${JSON.stringify(checks.run)}`)

  const built = await page.evaluate(async () => {
    const id = (await globalThis.nbRun).id
    const saved = await nb.saves.read(nb.owner)
    const live = await nb.h.actorData((await nb.rt.session(nb.owner)).session, id)
    return { id, live, actors: saved.actors.length, base: !!saved.bases?.[id] }
  })
  const a = built.live
  const abilities = Object.fromEntries(Object.entries(a.system.abilities).map(([k, v]) => [k, v.value]))
  assert.deepEqual(abilities, { str: 15, dex: 13, con: 14, int: 11, wis: 16, cha: 9 })
  assert.equal(a.items.find((i) => i.type === 'class')?.system.levels, 3)
  assert.equal(a.items.find((i) => i.type === 'subclass')?.name, 'Life Domain')
  const spells = a.items.filter((i) => i.type === 'spell')
  assert.deepEqual(spells.filter((i) => i.system.prepared === 1).map((i) => i.name).sort(), ['Aid', 'Command', 'Detect Magic', 'Guiding Bolt', 'Healing Word', 'Hold Person'])
  for (const n of ['Mace', 'Scale Mail', 'Light Crossbow', 'Shield', 'Amulet', 'Prayer Book']) assert(a.items.some((i) => i.name === n), `缺装备 ${n}`)
  assert(built.actors === 1 && built.base, '存档应有这一个人、完整数据进战役层')
  // 建卡小窗（完整版）交出的整份人物 vs 日常小窗（自带公开版）里建回的：逐件对
  const handed = await page.evaluate(() => globalThis.nbBuilt)
  await writeFile(join(shots, 'actor-handed.json'), JSON.stringify(handed, null, 2))
  const ids = (x) => x.items.map((i) => `${i._id}|${i.type}|${i.name}`)
  checks.handover = { handed: handed.items.length, live: a.items.length, missing: ids(handed).filter((k) => !ids(a).includes(k)), extra: ids(a).filter((k) => !ids(handed).includes(k)) }
  checks.built = { items: a.items.length, abilities, level: 3, subclass: 'Life Domain' }
  await writeFile(join(shots, 'actor-live.json'), JSON.stringify(a, null, 2))

  // 关小窗读档、整页刷新读回：和收进存档时完全一致
  const reopened = await page.evaluate(async (id) => { await nb.rt.close(nb.owner); await nb.people.load(nb.owner); return nb.h.actorData((await nb.rt.session(nb.owner)).session, id) }, built.id)
  assert.deepEqual(reopened, a); checks.reopen = 'exact'

  // ③ 取消：再开一次，来源窗口确认后直接关掉作者建卡器
  const frame2 = await startBuild('取消的人')
  await frame2.getByRole('button', { name: 'Confirm', exact: true }).click()
  await frame2.getByRole('button', { name: 'Finalize', exact: true }).waitFor()
  await shot('08-cancel-open')
  await closeAuthorWindows(frame2)
  checks.cancel = await page.evaluate(async () => ({ run: await globalThis.nbRun, actors: (await nb.saves.read(nb.owner)).actors.length, frames: document.querySelectorAll('iframe[data-trpg-author-frame="foundry"]').length }))
  assert.equal(checks.cancel.run.status, 'cancelled'); assert.equal(checks.cancel.actors, 1); assert.equal(checks.cancel.frames, 1)

  await page.reload()
  await env(false)
  const cold = await page.evaluate(async (id) => { await nb.people.load(nb.owner); return nb.h.actorData((await nb.rt.session(nb.owner)).session, id) }, built.id)
  assert.deepEqual(cold, a); checks.cold = 'exact'
  await shot('09-after-reload')
  checks.pageErrors = errors.map((e) => e.slice(0, 300))
  console.log(JSON.stringify({ engine, ok: true, checks }, null, 2))
} catch (e) {
  await shot('zz-failure').catch((s) => console.error('失败截图没拍成', s.message))
  checks.lastRun = await page.evaluate(() => Promise.race([globalThis.nbRun, new Promise((r) => setTimeout(() => r('still running'), 2000))])).catch((x) => `读不到：${x.message}`)
  console.error(JSON.stringify({ engine, ok: false, checks, errors: errors.slice(0, 8) }, null, 2))
  throw e
} finally {
  clearTimeout(killer)
  await ctx.close()
  await new Promise((r) => server.close(r))
  void work
}
