// 自制子职 / 自制职业进结算内核（B，2026-11-14）。
// 战役打开时，用作者包管理器载入当前版本的自制包；断网条件下作者导入器也能找到依赖。
// 验收：①自制子职加到人物成功（人物身上有这个子职）②自制职业（厨师职业包，真实中英文件，可选）建人物成功
//       ③官方子职同一入口仍成功（对照）④没有明显异常值 ⑤记录耗时（结算小窗开机、第一次加子职、建职业）。断网。
// 输入：work/p58-fixtures/ 里的试跑包；厨师职业包用 BREW_ZH / BREW_EN 指向本机两个自制仓库（只读，同 p59），没有就跳过 ②。
// 端口 47340：profile-p3-1-* 的官方数据按端口存，47340 已确认有数据（见 p58 文件头）。
// 用法：node tests/e2e/library/p63-kernel-brew-enter.mjs（SKIP_BUILD=1 跳过构建；ENGINE=webkit 跑 WebKit）。8 分钟强制结束。
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

setTimeout(() => { console.error('p63 超过 8 分钟，强制结束'); process.exit(2) }, 8 * 60 * 1000).unref()

const fixtures = `${work}/../p58-fixtures`
const cnOnly = { name: '试跑者; 试跑包.json', text: await readFile(`${fixtures}/试跑者; 试跑包.json`, 'utf8').catch(() => { throw new Error(`缺测试输入 ${fixtures}/试跑者; 试跑包.json（见该目录 README.txt）`) }) }
const ZH = process.env.BREW_ZH ?? '/Users/xxx/tavern-trpg-data-next/_sources/homebrew-zh'
const EN = process.env.BREW_EN ?? '/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master'
let cook = null
try {
  const zh = { name: 'Sam Grierson; 厨师The Cook Class.json', text: await readFile(`${ZH}/class/Sam Grierson; 厨师The Cook Class.json`, 'utf8') }
  const en = { name: 'Sam Grierson; The Cook Class.json', text: await readFile(`${EN}/class/Sam Grierson; The Cook Class.json`, 'utf8') }
  cook = { files: [zh, en], sources: (JSON.parse(zh.text)._meta?.sources ?? []).map((s) => s.json) }
} catch (e) { console.log('没找到厨师职业包文件，跳过自制职业：', String(e.message ?? e).slice(0, 120)) }

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[engineName === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47340 })
const profile = `${work}/profile-p63-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(420_000)
const pageErrors = []
let curStep = ''
await page.exposeFunction('p63Step', (s) => { curStep = s })
page.on('pageerror', (e) => pageErrors.push(`[${curStep}] ${String(e.stack ?? e)}`.slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(`[${curStep}] console: ${m.text()}`.slice(0, 300)) })
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())

let r
try {
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  r = await page.evaluate(async ({ cnOnly, cook }) => {
    const out = { step: 'start', setup: {}, ms: {} }
    const at = async (s) => { out.step = s; await window.p63Step(s) }
    const guard = async (fn) => { try { return await fn() } catch (e) { return { thrown: String(e?.stack ?? e).slice(0, 400) } } }
    const timed = async (key, fn) => { const t = performance.now(); try { return await fn() } finally { out.ms[key] = Math.round(performance.now() - t) } }
    try {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
      const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
      await at('import')
      await lib.bilingual.importFiles([cnOnly]); await lib.brewQueue.settled()
      if (cook) { await lib.bilingual.importFiles(cook.files); await lib.brewQueue.settled() }

      await at('setup')
      const h = await import('/work/e2e-lib/harness.js')
      const lib2 = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), include: ['src:testrunpack', ...(cook?.sources ?? []).map((s) => `src:${s.toLowerCase()}`)] }
      const pick = async (set, prop, book, pred) => {
        const p = await h.service.parsed(set, prop)
        for (let i = 0; i < p.items.length; i++) {
          if (book && p.sources[i] !== book) continue
          if (!pred(p.items[i])) continue
          const ref = { set, prop, hash: p.hashes[i] }
          const d = await h.scoped.detail(lib2, ref)
          if (d && !('hidden' in d) && (!book || d.english?.status === 'found')) return { ref, label: p.items[i].name }
        }
        return null
      }
      const fighter = await pick('cn-official', 'class', 'PHB', (it) => it.name === '战士')
      const human = await pick('cn-official', 'race', 'PHB', (it) => !!it.size && !String(it.name).includes('('))
      const bg = await pick('cn-official', 'background', 'PHB', (it) => !!it.skillProficiencies || !!it.entries)
      const subRows = await h.service.parsed('cn-brew', 'subclass')
      const subIdx = subRows.items.findIndex((it) => it.name === '月影斥候' && it.source === 'TestRunPack' && !it._isCopy)
      const mSub = subIdx >= 0 ? { ref: { set: 'cn-brew', prop: 'subclass', hash: subRows.hashes[subIdx] } } : null
      const offSubs = await h.service.parsed('cn-official', 'subclass')
      const offIdx = offSubs.items.findIndex((it, i) => offSubs.sources[i] === 'PHB' && !it._isCopy && (it.className === '战士' || it.className === 'Fighter'))
      const offSub = offIdx >= 0 ? { ref: { set: 'cn-official', prop: 'subclass', hash: offSubs.hashes[offIdx] } } : null
      const cookClass = cook ? await pick('cn-brew', 'class', null, (it) => cook.sources.includes(it.source) && !it._isCopy) : null
      out.setup = { fighter: !!fighter, human: !!human, bg: !!bg, mSub: !!mSub, offSub: !!offSub, cook: cook ? !!cookClass : 'skipped' }

      const owner = { ownerKey: 'char:p63.png', ownerLabel: 'P63 自制进内核' }
      await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
      await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: owner.ownerLabel })
      await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library: lib2, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library: lib2, title: owner.ownerLabel }) })
      const bad = /@classes\.\.|undefined|NaN|\[object Object\]/
      const summary = async (id) => {
        const session = (await rt.session(owner.ownerKey)).session
        const a = await h.actorData(session, id)
        return { items: a.items.map((i) => `${i.type}:${i.name}`), classes: a.items.filter((i) => i.type === 'class').map((i) => ({ name: i.name, levels: i.system?.levels })), subclasses: a.items.filter((i) => i.type === 'subclass').map((i) => i.name), suspicious: [...new Set(JSON.stringify(a).match(new RegExp(bad.source, 'g')) ?? [])] }
      }

      await at('open kernel')
      await timed('kernelOpen', () => rt.session(owner.ownerKey))
      await at('fighter')
      const hero = await timed('buildFighter', () => rt.buildCharacter(owner.ownerKey, { name: 'P63 战士', items: [human.ref, bg.ref, fighter.ref], equipment: [] }))
      out.fighter = { status: hero.status, error: hero.error ?? null }
      const sess = (await rt.session(owner.ownerKey)).session
      const cls = (await h.actorData(sess, hero.id)).items.find((i) => i.type === 'class')
      out.levelUp = []
      for (let k = 0; k < 2; k++) { const u = await sess.call('levelUpApply', hero.id, cls._id, 1); out.levelUp.push(u.status) }

      await at('add custom subclass')
      out.addCustomSub = await guard(async () => {
        const a = await timed('addCustomSubclass', () => rt.addToActor(owner.ownerKey, hero.id, [mSub.ref]))
        return { status: a.status, error: a.error ?? null, added: a.result?.added ?? null }
      })
      await at('add official subclass')
      out.addOfficialSub = offSub ? await guard(async () => { const a = await rt.addToActor(owner.ownerKey, hero.id, [offSub.ref]); return { status: a.status, error: a.error ?? null } }) : null
      out.heroSummary = await guard(() => summary(hero.id))

      await at('custom class')
      out.customClass = !cookClass ? { skipped: true } : await guard(async () => {
        const c = await timed('buildCustomClass', () => rt.buildCharacter(owner.ownerKey, { name: 'P63 厨师', items: [human.ref, bg.ref, cookClass.ref], equipment: [] }))
        return { status: c.status, error: c.error ?? null, summary: c.id ? await summary(c.id) : null }
      })
      await rt.closeAllExcept(null)
      await at('precompute')
      const preOpts = { codeSet: 'cn', mode: 'changed', limit: 2 }
      const first = await lib.precompute.run(preOpts)
      const again = await lib.precompute.run(preOpts)
      out.precompute = [first, again].map(({ total, converted, cached, failed, excludedBrews }) => ({ total, converted, cached, failed, excludedBrews }))

      await at('broken dependency')
      const input = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 'p63-deps', title: 'P63 dependency test' } })
      const view = await h.revisions.published()
      const test = await h.startKernelSession(input, view)
      try {
        const make = (id, spells, sourceOfCopy) => ({
          doc: { head: { docIdLocal: id, filename: `${id}.json` }, body: {
            _meta: { sources: [{ json: id }], ...(sourceOfCopy ? { dependencies: { spell: [sourceOfCopy] } } : {}) },
            spell: spells.map((spell) => ({ ...spell, source: id })),
          } },
          pack: { docIdLocal: id, filename: `${id}.json`, sources: [id], props: { spell: spells.length },
            hashes: {},
            requires: sourceOfCopy ? [{ kind: 'dependency', prop: 'spell', source: sourceOfCopy }] : [] },
          flattened: 0, failures: [],
        })
        const source = test.session.frame.frame.contentWindow
        const parent = await source.DataLoader.pCacheAndGet('spell', 'PHB', 'fireball_phb')
        if (!parent) throw Error('没读到真实官方复制原件')
        const good = make('KernelTestProvider', [{ ...JSON.parse(JSON.stringify(parent)), name: 'Kernel Test Parent' }])
        const dependent = make('KernelTestDep', [{ name: 'Kernel Test Copy', _copy: { name: 'Kernel Test Parent', source: 'KernelTestProvider' } }], 'KernelTestProvider')
        const bad = make('KernelTestBad', [{ name: 'Kernel Test Broken', _copy: { name: 'Missing PHB spell', source: 'PHB' } }], 'PHB')
        const orphan = make('KernelTestOrphan', [{ name: 'Kernel Test Orphan', _copy: { name: 'Kernel Test Broken', source: 'KernelTestBad' } }], 'KernelTestBad')
        const report = await test.session.call('loadBrews', [bad, orphan, dependent, good], [])
        const processed = await source.BrewUtil2.pGetBrewProcessed()
        out.dependencies = { loaded: report.loaded, excluded: report.excluded.map(({ docIdLocal, reason }) => ({ docIdLocal, reason })),
          copy: processed.spell?.find((row) => row.source === 'KernelTestDep')?.level, expectedLevel: parent.level,
          official: (await test.session.call('importForBuild', 'spell', JSON.parse(JSON.stringify(parent)))).status }
      } finally {
        test.session.close()
      }
      await at('done')
    } catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500) }
    return out
  }, { cnOnly, cook })
} finally {
  await writeFile(`${work}/p63-kernel-brew-enter-${engineName}.json`, JSON.stringify({ r, pageErrors }, null, 2))
}

if (r?.error) { console.log('STEP', r.step, r.error); await ctx.close(); server.close(); await rm(profile, { recursive: true, force: true }); process.exit(1) }
// 放行：断网噪声、local-set 只读错误、Foundry 对隐藏 0×0 小窗的固有提示（kernel-enter / kernel-import / rebuild-cache 等已有测试同样放行）
const NET = /Network error during JSON request|请求 JSON 时发生网络错误|文件不存在：data\/generated\/gendata-nav|local-set|Failed to load resource|net::ERR|usable window dimensions/
const unexpected = pageErrors.filter((e) => !NET.test(e))
console.log('耗时（毫秒）：', JSON.stringify(r.ms))
console.log('人物（战士 3 级）：', JSON.stringify(r.heroSummary))
console.log('自制职业：', JSON.stringify(r.customClass))
check('前置：战士 / 人类 / 背景 / 自制子职 / 官方子职对照 都挑到了', r.setup.fighter && r.setup.human && r.setup.bg && r.setup.mSub && r.setup.offSub, JSON.stringify(r.setup))
check('战士建成、升到 3 级', r.fighter.status === 'complete' && r.levelUp.every((s) => s === 'complete'), JSON.stringify({ f: r.fighter, u: r.levelUp }))
check('① 自制子职加到人物：完成，人物身上有「月影斥候」', r.addCustomSub?.status === 'complete' && r.heroSummary?.subclasses?.includes('月影斥候'), JSON.stringify({ a: r.addCustomSub, s: r.heroSummary?.subclasses }))
check('③ 对照：官方战士子职同一入口仍成功', r.addOfficialSub?.status === 'complete' && r.heroSummary?.subclasses?.includes('Battle Master'), JSON.stringify({ a: r.addOfficialSub, s: r.heroSummary?.subclasses }))
if (cook) check('② 自制职业（厨师）建人物：完成，人物身上有这个职业', r.customClass?.status === 'complete' && (r.customClass?.summary?.classes ?? []).length > 0, JSON.stringify(r.customClass))
check('④ 没有明显异常值（@classes..、undefined、NaN、[object Object]）', !(r.heroSummary?.suspicious?.length) && !(r.customClass?.summary?.suspicious?.length), JSON.stringify({ h: r.heroSummary?.suspicious, c: r.customClass?.summary?.suspicious }))
check('后台重复换算命中同一套自制缓存', r.precompute?.[0]?.total > 0 && r.precompute?.[1]?.cached === r.precompute?.[0]?.total && r.precompute?.every((x) => !x.failed.length && !x.excludedBrews.length), JSON.stringify(r.precompute))
check('真作者载入保留有效的跨包复制，只排除坏包和失去依赖的包，官方仍可换算',
  r.dependencies?.loaded.includes('KernelTestDep') && r.dependencies?.loaded.includes('KernelTestProvider') && r.dependencies?.copy === r.dependencies?.expectedLevel && Number.isFinite(r.dependencies?.copy) && r.dependencies?.official === 'complete'
  && r.dependencies?.excluded.map((x) => x.docIdLocal).sort().join(',') === 'KernelTestBad,KernelTestOrphan', JSON.stringify(r.dependencies))
check('没有预料之外的页面报错（断网、local-set 只读错误除外）', unexpected.length === 0, unexpected.slice(0, 3).join(' | '))
await ctx.close()
server.close()
await rm(profile, { recursive: true, force: true })
console.log(failures.length ? `FAIL ${failures.length}（见 work/e2e-lib/p63-kernel-brew-enter-${engineName}.json）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
