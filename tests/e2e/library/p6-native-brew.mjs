// P6 第 2 段：本战役自制包进作者完整建卡器（建卡专用小窗把作者收下的自制包登记成作者「额外自制文件」）。
// 真实插件后台（Chrome；ENGINE=webkit 换 WebKit；上限 8 分钟）。本机没有私人完整版就跳过。
// 查：① 作者自己的来源窗口列出本战役的自制包（本地自制）；② 玩家加选它，作者候选里有自制种族、自制战士子职业，各一行；
//     ③ 玩家选上后 Finalize，收进存档的人物带这两样、没有重复物品；关小窗读档读回一致。
// 测试里点的是玩家输入（选哪个种族、子职业），不是建卡规则。试跑包：work/p58-fixtures/试跑者; 试跑包.json。
import assert from 'node:assert/strict'
import { access, mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic, root } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'

try { await access(join(root, 'vendor/private/modules/plutonium/module.json')) } catch {
  console.log('跳过：本机没有私人完整版（vendor/private/modules/plutonium/）'); process.exit(0)
}
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, 8 * 60_000)
await buildAll()
const engine = process.env.ENGINE ?? 'chrome'
const [, type, options] = engines[engine === 'webkit' ? 1 : 0]
const shots = join(root, `work/p6-native/brew-${engine}`)
await mkdir(shots, { recursive: true })
const { server, url } = await startStatic({ port: E2E_PORT })
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-native-brew'), { ...options, viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
const shot = (name) => page.screenshot({ path: join(shots, `${name}.png`) })
const checks = {}
const PACK = await readFile(join(root, 'work/p58-fixtures/试跑者; 试跑包.json'), 'utf8')
const meta = JSON.parse(PACK)
const race = meta.race[0].name
const subclass = meta.subclass[0]

try {
  await page.goto(url)
  await page.evaluate(() => new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n instanceof HTMLIFrameElement && n.dataset.trpgAuthorFrame === 'foundry' && globalThis.showBuild) {
      n.style.cssText = 'position:fixed;inset:0;width:1280px;height:900px;border:0;visibility:visible;pointer-events:auto;z-index:10'
      n.removeAttribute('aria-hidden')
    }
  }).observe(document.body, { childList: true }))
  await page.waitForFunction(() => [...(document.querySelector('#trpg-assistant-root')?.shadowRoot?.children ?? [])].map((x) => x.__vue_app__).find(Boolean)?.config.globalProperties.$pinia._s.get('app')?.booted)
  // 玩家导入自制包、开一个中文 2014 战役（本战役开着这个包）
  await page.evaluate(async (text) => {
    const h = await import('/work/e2e-lib/harness.js')
    const app = [...document.querySelector('#trpg-assistant-root').shadowRoot.children].map((x) => x.__vue_app__).find(Boolean)
    const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
    await lib.bilingual.importFiles([{ name: '试跑者; 试跑包.json', text }]); await lib.brewQueue.settled()
    const owner = 'char:p6-native-brew.png'
    const library = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), include: ['src:testrunpack'] }
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 自制建卡', ruleId: library.rule, name: 'P6 自制建卡' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const deps = { revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      campaignOf: async () => ({ rule: library.rule, library, title: 'P6 自制建卡' }) }
    const rt = new h.KernelRuntime({ ...deps, cache: { db: h.libraryDb, dataVersion: h.dataVersion } })
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
    const native = new h.KernelNativeBuild(deps)
    globalThis.nb = { h, owner, rt, saves, people: new h.KernelPeople({ runtime: rt, saves, native }) }
    await rt.session(owner)
    globalThis.showBuild = true
    globalThis.nbRun = nb.people.buildNative(owner, '自制建卡人物', { category: 'party' }).then((r) => ({ status: r.built.status, error: r.built.error ?? null, id: r.id ?? null }))
  }, PACK)
  let frame
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

  // ① 作者来源窗口：本地自制一行就是本战役的包
  const brewRow = frame.locator('label.imp-wiz__row').filter({ has: frame.locator('.ve-source-category-homebrew--local') })
  checks.sourceRows = await frame.locator('label.imp-wiz__row').allInnerTexts()
  assert.equal(await brewRow.count(), 1, `来源窗口该有一行本地自制：${checks.sourceRows}`)
  checks.brewRow = (await brewRow.innerText()).trim()
  await shot('01-source-window')
  // ② 玩家加选自制包（作者的多选：Ctrl / Cmd 点击）→ 确认
  await brewRow.click({ modifiers: ['ControlOrMeta'] })
  checks.selected = await frame.locator('label.imp-wiz__row.list-multi-selected').allInnerTexts()
  assert.equal(checks.selected.length, 2, `该选上 5etools + 自制包：${checks.selected}`)
  await frame.getByRole('button', { name: 'Confirm', exact: true }).click()
  await frame.getByRole('button', { name: 'Finalize', exact: true }).waitFor()
  const search = frame.locator('.ve-ui-sel2__ipt-search:visible')
  const options = async (index, term) => {
    await search.nth(index).fill(term)
    const list = (await frame.locator('.ve-ui-sel2__disp-option:visible').allInnerTexts()).map((t) => t.trim())
    await search.nth(index).fill('')
    return list
  }
  const pick = async (name, index = 0) => {
    await search.nth(index).fill(name)
    await frame.locator('.ve-ui-sel2__disp-option:visible').filter({ hasText: name }).first().click()
  }
  await pick(subclass.className)
  checks.subclassRows = (await options(1, subclass.name)).filter((t) => t.startsWith(subclass.name))
  assert.equal(checks.subclassRows.length, 1, `自制子职业该有一行：${checks.subclassRows}`)
  await pick(subclass.name, 1)
  await frame.locator('label:visible').filter({ has: frame.locator('input[type=radio]') }).nth(2).click()
  await shot('02-class-subclass')
  await frame.getByRole('button', { name: 'Origin (Species)', exact: true }).click()
  checks.raceRows = (await options(0, race)).filter((t) => t.startsWith(race))
  assert.equal(checks.raceRows.length, 1, `自制种族该有一行：${checks.raceRows}`)
  await pick(race)
  await shot('03-species')
  // ③ Finalize（其余选择留空，作者问「确定吗」→ OK）
  await frame.getByRole('button', { name: 'Finalize', exact: true }).click()
  await frame.locator('button:visible').filter({ hasText: /^\W*OK\s*$/ }).click()
  await frame.getByText('Build complete.', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
  // 玩家关掉作者开着的窗口（作者的关闭钮），这次建卡才结束（同 p6-native-build）
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => Promise.race([globalThis.nbRun.then(() => true), new Promise((r) => setTimeout(() => r(false), 800))]))) break
    const close = frame.locator('[data-action="close"]')
    if (await close.count().catch(() => 0)) await close.last().click({ force: true, timeout: 3000 }).catch((e) => { if (!/detached|not attached|closed|Timeout/i.test(e.message)) throw e })
  }
  checks.run = await page.evaluate(() => globalThis.nbRun)
  assert.equal(checks.run.status, 'built', `建卡没成：${JSON.stringify(checks.run)}`)
  const live = await page.evaluate(async (id) => nb.h.actorData((await nb.rt.session(nb.owner)).session, id), checks.run.id)
  const names = live.items.map((i) => `${i.type}:${i.name}`)
  checks.items = { total: names.length, race: names.includes(`race:${race}`), subclass: names.includes(`subclass:${subclass.name}`), duplicates: names.filter((n, i) => names.indexOf(n) !== i) }
  assert(checks.items.race && checks.items.subclass, `人物缺自制种族 / 子职业：${names}`)
  assert.deepEqual(checks.items.duplicates, [])
  checks.saved = await page.evaluate(async (id) => { const s = await nb.saves.read(nb.owner); return { actors: s.actors.length, base: !!s.bases?.[id] } }, checks.run.id)
  assert(checks.saved.actors === 1 && checks.saved.base, '存档应有这一个人、完整数据进战役层')
  const reopened = await page.evaluate(async (id) => { await nb.rt.close(nb.owner); await nb.people.load(nb.owner); return nb.h.actorData((await nb.rt.session(nb.owner)).session, id) }, checks.run.id)
  assert.deepEqual(reopened, live); checks.reopen = 'exact'
  await shot('04-after-build')
  checks.pageErrors = errors.map((e) => e.slice(0, 200))
  console.log(JSON.stringify({ engine, ok: true, checks }, null, 2))
} catch (e) {
  await shot('zz-failure').catch((s) => console.error('失败截图没拍成', s.message))
  checks.lastRun = await page.evaluate(() => Promise.race([globalThis.nbRun, new Promise((r) => setTimeout(() => r('still running'), 2000))])).catch((x) => `读不到：${x.message}`)
  console.error(JSON.stringify({ engine, ok: false, checks, errors: errors.slice(0, 8).map((x) => x.slice(0, 300)) }, null, 2))
  throw e
} finally {
  clearTimeout(killer)
  await ctx.close()
  await new Promise((r) => server.close(r))
}
