// P6 建卡走作者整机（Plutonium「导入到人物」）+ 存档 B′（存完整数据）真实验证（Chrome；ENGINE=webkit 换 WebKit；上限 8 分钟）。
// 中文战役：人类 + 侍僧 + 牧师 1 级。作者开的窗口经作者窗口桥交出来（产品里整个搬到建卡页）；测试助手像玩家一样在作者窗口里点作者自己的确定 / 是。
// 查：特性 / 授予链接 / 法术 / 起始装备进人物；存档人物记录不含完整数据、战役层 bases 有、撤销快照不含；名单中文；
//     扣血 → 关小窗读档（按完整数据建回）→ 撤销；整件取下背景（作者 reverse 退回授予的特性）/ 装回；复制；整页刷新读回。
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'

const LIMIT = 8 * 60_000
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, LIMIT)
await buildAll()
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const engine = process.env.ENGINE ?? 'chrome'
const { server, url } = await startStatic({ port: E2E_PORT })
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-author-build'), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(LIMIT)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

const env = (fresh) => page.evaluate(async (fresh) => {
  const h = await import('/work/e2e-lib/harness.js')
  const owner = 'char:p6-author-build.png'
  const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
  if (fresh) {
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 作者整机', ruleId: library.rule, name: 'P6 作者整机' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
  }
  const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
    cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: library.rule, library, title: 'P6 作者整机' }) })
  const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
  globalThis.ab = { h, owner, library, rt, saves, people: new h.KernelPeople({ runtime: rt, saves }) }
  await rt.session(owner)
}, fresh)

try {
  await page.goto(url)
  await env(true)
  const r = await page.evaluate(async () => {
    const { h, owner, library, rt, saves, people } = globalThis.ab
    // 中文库条目编号按中文名生成；按条目带的英文名找
    const ref = async (prop, eng) => {
      const rows = await h.scoped.query(library, prop, { source: 'PHB', expand: true, mode: 'browse' })
      const row = rows.find((x) => (x.item.ENG_name ?? x.item.name) === eng && !x.item._isCopy)
      if (!row) throw Error(`缺测试条目 ${prop} ${eng}`)
      return row.ref
    }
    const items = [await ref('race', 'Human'), await ref('background', 'Acolyte'), await ref('class', 'Cleric')]
    const data = async (id) => h.actorData((await rt.session(owner)).session, id)
    const out = {}
    // 作者窗口：测试助手像玩家一样点作者自己的按钮（只在测试里用；产品里由玩家在建卡页答）
    const asked = []
    const watcher = {
      open: (win) => { asked.push({ prop: win.ref.prop, title: win.title, styles: win.styles.length, closed: false, token: win.token })
        setTimeout(() => { const n = win.node(); const b = n && ([...n.querySelectorAll('button')].find((x) => /^(OK|Yes|Confirm|Use Default|Import|Save|Submit)$/i.test(x.textContent.trim())) ?? n.querySelector('.ve-btn-primary')); b?.click() }, 300) },
      closed: (token) => { const row = asked.find((x) => x.token === token); if (row) row.closed = true },
    }
    globalThis.abAsked = asked
    const made = await people.create(owner, { name: '整机牧师', items }, watcher, { category: 'party' })
    if (made.made.status !== 'complete') return { fatal: made.made }
    const id = made.made.id
    const a0 = await data(id)
    const names = a0.items.map((i) => `${i.type}:${i.name}`)
    const advTypes = a0.items.flatMap((i) => Object.values(i.system.advancement ?? {}).map((v) => v.type))
    const k0 = await saves.read(owner)
    const rec = k0.actors.find((a) => a.id === id)
    out.build = { names, items: names.length, grants: advTypes.filter((t) => t === 'ItemGrant').length,
      baseBytes: JSON.stringify(k0.bases?.[id] ?? null).length, recordHasBase: 'base' in rec, recordBytes: JSON.stringify(rec).length, refs: rec.refs.length }
    const roster = (await people.roster(owner)).find((x) => x.id === id)
    out.roster = { classes: roster?.classes.map((c) => c.name), race: roster?.race, background: roster?.background }
    // 扣血 → 关小窗按存档读回（B′：按完整数据建回）→ 撤销
    const hp0 = a0.system.attributes.hp.value
    await people.act(owner, id, 'damage', id, [{ value: 2, type: 'slashing' }], [], {})
    await rt.close(owner)
    const loaded = await people.load(owner)
    const a1 = await data(id)
    out.cold = { loaded: loaded.map((l) => l.status), hp: a1.system.attributes.hp.value, hp0, items: a1.items.length }
    const undoBefore = JSON.stringify((await saves.read(owner)).undo.at(-1)).length
    await people.undo(owner)
    out.undo = { hp: (await data(id)).system.attributes.hp.value, undoEntryBytes: undoBefore }
    // 整件取下背景：作者 reverse 退回它授予的特性；装回
    const bg = a1.items.find((i) => i.type === 'background')
    const bgKey = `${bg.flags.plutonium.propDroppable}|${bg.flags.plutonium.source}|${bg.flags.plutonium.hash}`
    const granted = Object.values(bg.system.advancement).flatMap((v) => Object.keys(v.value?.added ?? {}))
    const off = await people.setOff(owner, id, [{ ref: bgKey }])
    const a2 = await data(id)
    const back = await people.setOff(owner, id, [])
    const a3 = await data(id)
    out.off = { ok: off.ok, problems: off.problems, granted: granted.length, grantedGone: granted.every((g) => !a2.items.some((i) => i._id === g)), backOk: back.ok, grantedBack: granted.every((g) => a3.items.some((i) => i._id === g)) }
    // 复制
    const copy = await people.copy(owner, id)
    const c = copy.result.id ? await data(copy.result.id) : null
    out.copy = { status: copy.result.status, distinct: copy.result.id !== id, items: c?.items.length, hasBase: !!(await saves.read(owner)).bases?.[copy.result.id] }
    globalThis.abExpect = { id, items: a3.items.length, hp: a3.system.attributes.hp.value }
    out.expect = globalThis.abExpect
    return out
  })
  if (r.fatal) throw Error(`建卡没完成：${JSON.stringify(r.fatal).slice(0, 600)}`)
  const answered = await page.evaluate(() => globalThis.abAsked)
  // 整页刷新：页面里的对象全部销毁，从 IndexedDB 读档
  await page.reload()
  await env(false)
  r.reload = await page.evaluate(async (expect) => {
    const { h, owner, rt, people } = globalThis.ab
    const loaded = await people.load(owner)
    const a = await h.actorData((await rt.session(owner)).session, expect.id)
    await rt.close(owner)
    return { loaded: loaded.map((l) => l.status), items: a?.items.length, hp: a?.system.attributes.hp.value }
  }, r.expect)
  const has = (re) => r.build.names.some((n) => re.test(n))
  const checks = {
    featuresIn: has(/^feat:Spellcasting$/) && has(/^feat:Shelter of the Faithful$/) && has(/^race:Human$/) && has(/^class:Cleric$/),
    authorGrants: r.build.grants >= 3,
    spellsAndGear: r.build.names.filter((n) => n.startsWith('spell:')).length > 0 && has(/^weapon:/),
    storedB: r.build.baseBytes > 50_000 && !r.build.recordHasBase && r.build.recordBytes < 20_000,
    rosterChinese: (r.roster.classes ?? []).includes('牧师') && r.roster.race === '人类',
    coldFromBase: r.cold.loaded.every((x) => x === 'complete') && r.cold.hp === r.cold.hp0 - 2 && r.cold.items === r.build.items,
    undo: r.undo.hp === r.cold.hp0 && r.undo.undoEntryBytes < 20_000,
    wholeOff: r.off.ok && r.off.granted > 0 && r.off.grantedGone && r.off.backOk && r.off.grantedBack,
    copy: r.copy.status === 'complete' && r.copy.distinct && r.copy.items === r.expect.items && r.copy.hasBase,
    // 作者窗口桥：作者开的窗口都交出来了（带作者声明的样式表），每个都在作者窗口里答完关掉
    windowsThroughBridge: answered.length >= 5 && answered.every((q) => q.closed && q.styles > 0),
    pageReload: r.reload.loaded.every((x) => x === 'complete') && r.reload.items === r.expect.items && r.reload.hp === r.expect.hp,
  }
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium')
    || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const ok = Object.values(checks).every(Boolean) && unexplained.length === 0
  await writeFile(`${work}/p6-author-build-${engine}.json`, JSON.stringify({ engine, ok, checks, answered, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, checks, answered, unexplained: unexplained.slice(0, 5) }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { clearTimeout(killer); await ctx.close(); server.close() }
