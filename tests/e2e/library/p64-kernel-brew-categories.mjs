// 多类别抽检：自制内容的各种数据类型都能进结算内核吗？（B，2026-11-14，驾驶员要求「不能只测子职，多抽检几个类别」）
// 样本：本机中文自制仓库（只读，BREW_ZH 可改路径）每个类别目录最多 2 个 <300KB 的包，全部一起装进库（多个真实包同时在内核里，
//   也顺带测「任一依赖缺了整个自制库变空」那个已知毛病）。类别不手写：作者导入器登记表（内核命令 importerMeta）说有导入器的才测，
//   导入器说是「人物」的（folderType = Actor）走建怪物 / 建人物入口，建卡三件套（种族 / 背景 / 职业）走建卡入口，其余走「加到人物」。
//   每个类别抽 2 条自制，各配 1 条官方条目当对照（同一入口）：对照成功而自制失败才是自制进内核的问题。
// 判定：自制条目状态 complete / pending（需要玩家选择）算进得去；error 等列出来。没有标准答案可比，不证明规则数值正确。
// 用法：node tests/e2e/library/p64-kernel-brew-categories.mjs（SKIP_BUILD=1 跳过构建；ENGINE=webkit 跑 WebKit）。8 分钟强制结束。
import { cp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

setTimeout(() => { console.error('p64 超过 8 分钟，强制结束'); process.exit(2) }, 8 * 60 * 1000).unref()

const ZH = process.env.BREW_ZH ?? '/Users/xxx/tavern-trpg-data-next/_sources/homebrew-zh'
const PER_DIR = 2
// 对照实验用：SKIP_DIRS=magicvariant,item 跳过这些类别目录（第一次抽检里，这两个目录的作者示例包让内核合并整库变空）
const SKIP_DIRS = new Set((process.env.SKIP_DIRS ?? '').split(',').filter(Boolean))
// ONLY_DIRS=class,subclass,charoption 只装这些类别目录（对照：只装职业相关的包，看合并后的自制是不是不再为空）
const ONLY_DIRS = process.env.ONLY_DIRS ? new Set(process.env.ONLY_DIRS.split(',')) : null
const MAX_BYTES = 300 * 1024
const files = []
const props = new Set()
const sources = new Set()
for (const dir of (await readdir(ZH)).sort()) {
  if (dir.startsWith('_') || dir.startsWith('.') || SKIP_DIRS.has(dir) || (ONLY_DIRS && !ONLY_DIRS.has(dir))) continue
  const st = await stat(`${ZH}/${dir}`).catch(() => null)
  if (!st?.isDirectory()) continue
  let taken = 0
  for (const name of (await readdir(`${ZH}/${dir}`)).sort()) {
    if (taken >= PER_DIR) break
    if (!name.endsWith('.json')) continue
    const full = `${ZH}/${dir}/${name}`
    if ((await stat(full)).size > MAX_BYTES) continue
    const text = await readFile(full, 'utf8')
    let json
    try { json = JSON.parse(text) } catch { continue }
    const entryProps = Object.keys(json).filter((k) => !k.startsWith('_') && Array.isArray(json[k]) && json[k].length)
    if (!entryProps.length || !(json._meta?.sources ?? []).length) continue
    entryProps.forEach((k) => props.add(k))
    json._meta.sources.forEach((s) => sources.add(s.json))
    files.push({ name, text, dir })
    taken++
  }
}
console.log(`样本：${files.length} 个包，${props.size} 种数据类型，${sources.size} 个来源`)

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[engineName === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47340 })
const profile = `${work}/profile-p64-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(460_000)
const pageErrors = []
let curStep = ''
await page.exposeFunction('p64Step', (s) => { curStep = s })
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('小窗要求处理失败')) pageErrors.push(`[${curStep}] console: ${m.text().slice(0, 800)}`)
})
page.on('pageerror', (e) => pageErrors.push(`[${curStep}] ${String(e.stack ?? e)}`.slice(0, 260)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())

let r
try {
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  r = await page.evaluate(async ({ files, props, sources, lenient, screen }) => {
    const out = { step: 'start', ms: {}, import: { ok: 0, failed: [] }, rows: [], skipped: [] }
    const at = async (s) => { out.step = s; await window.p64Step(s) }
    const guard = async (fn) => { try { return await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('单步超过 60 秒')), 60_000))]) } catch (e) { return { thrown: String(e?.message ?? e).slice(0, 220) } } }
    const timed = async (key, fn) => { const t = performance.now(); try { return await fn() } finally { out.ms[key] = Math.round(performance.now() - t) } }
    try {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
      const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
      await at('import')
      const t0 = performance.now()
      for (let i = 0; i < files.length; i += 6) {
        if (performance.now() - t0 > 170_000) { out.import.stoppedAt = i; break }
        const batch = files.slice(i, i + 6).map(({ name, text }) => ({ name, text }))
        const res = await guard(() => lib.bilingual.importFiles(batch))
        if (Array.isArray(res)) res.forEach((x, k) => (x.result?.ok ? out.import.ok++ : out.import.failed.push(`${batch[k]?.name}: ${(x.result?.errors ?? []).slice(0, 1).join(' ').slice(0, 100)}`)))
        else out.import.failed.push(`批 ${i}: ${res.thrown}`)
        await lib.brewQueue.settled()
      }
      out.ms.import = Math.round(performance.now() - t0)

      await at('setup')
      const h = await import('/work/e2e-lib/harness.js')
      const lib2 = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), include: [...sources].map((s) => `src:${s.toLowerCase()}`) }
      const owner = { ownerKey: 'char:p64.png', ownerLabel: 'P64 多类别' }
      await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
      await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: owner.ownerLabel })
      await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library: lib2, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library: lib2, title: owner.ownerLabel }) })
      const visible = async (ref) => { const d = await h.scoped.detail(lib2, ref); return !!d && !('hidden' in d) }
      const firstOf = async (set, prop, pred) => {
        let p; try { p = await h.service.parsed(set, prop) } catch { return null }
        for (let i = 0; i < p.items.length; i++) {
          if (p.items[i]._isCopy || !pred(p.items[i], p.sources[i])) continue
          const ref = { set, prop, hash: p.hashes[i] }
          if (await visible(ref)) return { ref, name: p.items[i].name, source: p.sources[i], item: p.items[i] }
        }
        return null
      }
      const someOf = async (set, prop, pred, n) => {
        let p; try { p = await h.service.parsed(set, prop) } catch { return [] }
        const found = []
        for (let i = 0; i < p.items.length && found.length < n; i++) {
          if (p.items[i]._isCopy || !pred(p.items[i], p.sources[i])) continue
          const ref = { set, prop, hash: p.hashes[i] }
          if (await visible(ref)) found.push({ ref, name: p.items[i].name, source: p.sources[i], item: p.items[i] })
        }
        return found
      }
      const phb = (name) => (it, src) => src === 'PHB' && it.name === name
      const fighter = await firstOf('cn-official', 'class', phb('战士'))
      const human = await firstOf('cn-official', 'race', (it, src) => src === 'PHB' && !!it.size && !String(it.name).includes('('))
      const bg = await firstOf('cn-official', 'background', (it, src) => src === 'PHB' && (!!it.skillProficiencies || !!it.entries))
      out.base = { fighter: !!fighter, human: !!human, bg: !!bg }

      await at('open kernel')
      const opened = await timed('kernelOpen', () => rt.session(owner.ownerKey))
      let { session } = opened
      out.brews = opened.brews
      const view = await h.revisions.published()
      const stored = await view.kvGet('cn', 'HOMEBREW_2_STORAGE') ?? []
      out.installed = stored.length
      out.copiedSources = stored.filter((doc) => doc.body?._meta?.dependencies).flatMap((doc) => (doc.body._meta.sources ?? []).map((src) => src.json))
      // 验证用（不改 src/）：LENIENT_COPY=1 时，只在内核小窗里把作者合并的 isErrorOnMissing 放宽——找不到 _copy 的父条目就原样保留这一条，
      // 不抛错（作者合并本来就有这条非抛错分支，utils.js 5558）；官方站点 / 库的作者小窗不受影响
      if (lenient) {
        const D = session.frame.frame.contentWindow.DataUtil
        const orig = D._pDoMetaMerge_handleCopyProp.bind(D)
        D._pDoMetaMerge_handleCopyProp = (prop, arr, entry, options) => orig(prop, arr, entry, { ...options, isErrorOnMissing: false })
        out.lenientApplied = true
      }
      // 验证用（不改 src/）：SCREEN=1 时，对每个已装自制包的副本，在内核小窗里用作者自己的合并函数 pDoMetaMerge 单独合并一次
      // （作者自己的自制体检工具 test-homebrew-tags.js 也是一个文件一个进程单独检查），抓出合并不过的包，
      // 然后只把好的交给内核重开（测试里包一层 published()，等于产品里「只交体检通过的包」）
      if (screen) {
        const view0 = await h.revisions.published()
        const raw = (await view0.kvGet('cn', 'HOMEBREW_2_STORAGE')) ?? []
        const win = session.frame.frame.contentWindow
        const bad = []
        const t = performance.now()
        for (const d of raw) {
          try { await win.DataUtil.pDoMetaMerge(`p64-screen-${d.head.docIdLocal}`, structuredClone(d.body), { isSkipMetaMergeCache: true }) }
          catch (e) { bad.push({ id: String(d.head.docIdLocal), sources: (d.body?._meta?.sources ?? []).map((x) => x.json), error: String(e?.message ?? e).replace(/\n.*/s, '').slice(0, 170) }) }
        }
        out.screen = { total: raw.length, ms: Math.round(performance.now() - t), bad }
        const badIds = new Set(bad.map((b) => b.id))
        const orig = h.revisions.published.bind(h.revisions)
        h.revisions.published = async () => {
          const v = await orig()
          return new Proxy(v, { get: (target, key) => (key === 'kvGet'
            ? async (cs, k) => { const val = await target.kvGet(cs, k); return k === 'HOMEBREW_2_STORAGE' && Array.isArray(val) ? val.filter((d) => !badIds.has(String(d.head?.docIdLocal))) : val }
            : typeof target[key] === 'function' ? target[key].bind(target) : target[key]) })
        }
        await rt.closeAllExcept(null)
        session = (await timed('kernelReopen', () => rt.session(owner.ownerKey))).session
      }
      const win = session.frame.frame.contentWindow
      const meta = await session.call('importerMeta', [...props])
      const importable = new Map(meta.map((m) => [m.prop, m.folderType]))
      out.importable = [...importable.entries()]
      out.notImportable = [...props].filter((p) => !importable.has(p))

      const newHero = async (name, cls = fighter) => {
        const hero = await rt.buildCharacter(owner.ownerKey, { name, items: [human.ref, bg.ref, cls.ref], equipment: [] })
        if (hero.status !== 'complete') return { error: `建人物 ${hero.status} ${hero.error ?? ''}`.slice(0, 120) }
        const sess = (await rt.session(owner.ownerKey)).session
        const c = (await h.actorData(sess, hero.id)).items.find((i) => i.type === 'class')
        for (let k = 0; k < 2; k++) await sess.call('levelUpApply', hero.id, c._id, 1)
        return { id: hero.id }
      }
      const shared = await guard(() => newHero('P64 公用战士'))
      out.shared = shared
      const BUILD = { race: 0, background: 1, class: 2 }
      const run = async (prop, e) => {
        const folder = importable.get(prop)
        if (folder === 'Actor') { const c = await rt.createActors(owner.ownerKey, [e.ref]); return { route: '建怪物/人物', status: c.status, error: c.error } }
        if (prop in BUILD) {
          const items = [human.ref, bg.ref, fighter.ref]; items[BUILD[prop]] = e.ref
          const c = await rt.buildCharacter(owner.ownerKey, { name: `P64 ${prop}`, items, equipment: [] })
          return { route: '建卡', status: c.status, error: c.error }
        }
        if (prop === 'subclass') {
          const want = String(e.item.className ?? '')
          // 子职属于官方职业就用官方职业建人物；属于自制职业（这次修的就是它）就用自制职业建人物
          const cls = (await firstOf('cn-official', 'class', (it, src) => ['PHB', 'XGE', 'TCE'].includes(src) && (it.name === want || it.ENG_name === want)))
            ?? (await firstOf('cn-brew', 'class', (it, src) => customSet.has(src) && (it.name === want || it.ENG_name === want)))
          if (!cls) return { route: '加到人物(子职)', status: 'skipped', error: `没有对应的职业：${want}` }
          const hero = await newHero(`P64 ${want}`, cls)
          if (!hero.id) return { route: '加到人物(子职)', status: 'skipped', error: hero.error }
          const a = await rt.addToActor(owner.ownerKey, hero.id, [e.ref]); return { route: '加到人物(子职)', status: a.status, error: a.error }
        }
        if (!shared.id) return { route: '加到人物', status: 'skipped', error: '公用战士没建成' }
        const a = await rt.addToActor(owner.ownerKey, shared.id, [e.ref]); return { route: '加到人物', status: a.status, error: a.error }
      }

      await at('categories')
      const customSet = new Set(sources)
      for (const prop of importable.keys()) {
        const customs = await someOf('cn-brew', prop, (it, src) => customSet.has(src), 2)
        if (!customs.length) { out.skipped.push(`${prop}：导入后没有可见的自制条目`); continue }
        for (const [kind, list] of [['自制', customs], ['官方对照', prop === 'subclass' ? [] : await someOf('cn-official', prop, (it, src) => (prop in BUILD ? src === 'PHB' : true), 1)]]) {
          for (const e of list) {
            const t = performance.now()
            const res = await guard(() => run(prop, e))
            out.rows.push({ prop, kind, name: e.name, source: e.source, ms: Math.round(performance.now() - t), route: res.route ?? null, status: res.status ?? (res.thrown ? 'thrown' : '?'), error: String(res.error ?? res.thrown ?? '').slice(0, 130) })
          }
        }
      }

      await at('merged brew')
      out.merged = await guard(async () => {
        const t = performance.now(); const p = await win.BrewUtil2.pGetBrewProcessed()
        const copyEntries = Object.entries(p ?? {}).flatMap(([prop, list]) => Array.isArray(list)
          ? list.filter((e) => out.copiedSources.includes(e?.source) && !e._copy).map((e) => [prop, e.source, e.name]) : [])
        return { ms: Math.round(performance.now() - t), copyEntries, counts: Object.fromEntries(Object.entries(p ?? {}).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])) }
      })
      out.originalsIntact = JSON.stringify(stored) === JSON.stringify(await view.kvGet('cn', 'HOMEBREW_2_STORAGE') ?? [])
      await rt.closeAllExcept(null)
      await at('done')
    } catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500) }
    return out
  }, { files: files.map(({ name, text }) => ({ name, text })), props: [...props], sources: [...sources], lenient: !!process.env.LENIENT_COPY, screen: !!process.env.SCREEN })
} finally {
  await writeFile(`${work}/p64-kernel-brew-categories-${engineName}.json`, JSON.stringify({ r, pageErrors }, null, 2))
}

if (r?.error) { console.log('STEP', r.step, r.error); await ctx.close(); server.close(); await rm(profile, { recursive: true, force: true }); process.exit(1) }
console.log('导入：', JSON.stringify({ ok: r.import.ok, failed: r.import.failed.length, stoppedAt: r.import.stoppedAt ?? null }), r.import.failed.slice(0, 4))
console.log('耗时（毫秒）：', JSON.stringify(r.ms))
if (r.screen) console.log('体检（每个包单独合并）：', JSON.stringify({ total: r.screen.total, ms: r.screen.ms, bad: r.screen.bad.map((b) => [b.sources.join('/'), b.error]) }))
console.log('作者导入器说有导入器的类别：', r.importable.map(([p, f]) => `${p}(${f})`).join(' '))
console.log('没有导入器的类别（不进内核，不算问题）：', r.notImportable.join(' '))
console.log('内核里合并后的自制（BrewUtil2）：', JSON.stringify(r.merged?.counts))
console.log('结算包：', JSON.stringify({ installed: r.installed, loaded: r.brews?.loaded.length, flattened: r.brews?.flattened, excluded: r.brews?.excluded }))
const byProp = {}
for (const x of r.rows) (byProp[x.prop] ??= []).push(x)
for (const [prop, list] of Object.entries(byProp)) console.log(`  ${prop.padEnd(18)}`, list.map((x) => `${x.kind}「${x.name}」${x.status}${x.error ? '（' + x.error + '）' : ''} ${x.ms}ms`).join(' | '))
if (r.skipped.length) console.log('没抽到的类别：', r.skipped.join('；'))
const OK = new Set(['complete', 'pending'])
const customRows = r.rows.filter((x) => x.kind === '自制')
// 官方对照同样不成功（内核本身不支持这个类别 / 这个入口）的，不算自制的问题；自制失败而官方对照成功才是
const controlStatuses = (prop) => new Set(r.rows.filter((x) => x.prop === prop && x.kind === '官方对照').map((x) => x.status))
const bad = customRows.filter((x) => !OK.has(x.status) && x.status !== 'skipped' && !controlStatuses(x.prop).has(x.status))
const skippedRows = customRows.filter((x) => x.status === 'skipped')
console.log('官方对照也不成功的类别（内核本身不支持，不算自制的问题）：', [...new Set(customRows.filter((x) => !OK.has(x.status) && x.status !== 'skipped' && controlStatuses(x.prop).has(x.status)).map((x) => x.prop))].join(' '))
console.log('被跳过的：', JSON.stringify(skippedRows.map((x) => [x.prop, x.name, x.error])))
check('前置：战士 / 人类 / 背景都挑到了，公用战士建成', r.base.fighter && r.base.human && r.base.bg && !!r.shared?.id, JSON.stringify({ ...r.base, shared: r.shared }))
check('抽检到了多个类别的自制条目（不是只有子职）', new Set(customRows.map((x) => x.prop)).size >= 5, JSON.stringify([...new Set(customRows.map((x) => x.prop))]))
check('自制条目都进得去内核（complete / pending）；失败的列出来', bad.length === 0, JSON.stringify(bad.map((x) => [x.prop, x.name, x.status, x.error])))
if (!ONLY_DIRS && !SKIP_DIRS.size && !process.env.SCREEN && !process.env.LENIENT_COPY) {
  check('原来拖垮整库的来源现在都实际出现在作者合并结果里', ['TTNSP', 'GiddySpellCopy', 'GiddyVariant'].every((source) => r.merged?.copyEntries?.some(([, src]) => src === source)), JSON.stringify([...new Set(r.merged?.copyEntries?.map(([, src]) => src))]))
  check('真实包的中文复制已展开，已装包全保留，库里原件无变化',
    r.brews?.flattened > 0 && r.brews?.loaded?.length === r.installed && !r.brews?.excluded?.length && r.originalsIntact, JSON.stringify(r.brews?.excluded))
}
check('自制子职、自制职业至少各有一条成功（这次修的就是它们）', ['subclass', 'class'].every((p) => customRows.some((x) => x.prop === p && OK.has(x.status))), JSON.stringify(customRows.filter((x) => ['subclass', 'class'].includes(x.prop)).map((x) => [x.prop, x.name, x.status, x.error])))
await ctx.close()
server.close()
await rm(profile, { recursive: true, force: true })
console.log(failures.length ? `FAIL ${failures.length}（见 work/e2e-lib/p64-kernel-brew-categories-${engineName}.json）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
