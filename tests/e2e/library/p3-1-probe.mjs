// P3-1 ⓪ 探路（D2-P3 整体设计 §2.3–2.5、§9）：在真实作者小窗（中文程序）里验证 P3-1 依赖的作者入口能否脱离作者界面调用。
//  1. 旧版/新版判断（SourceUtil.isClassicSource / isLegacySourceWotc）
//  2. 同编号：两个自制包同编号、自制包写官方编号——作者合并后剩哪条；能否按单个包（DataUtil.pDoMetaMerge）分别展开
//  3. _copy：基于官方条目、基于另一个自制包的条目，单包展开时能否解析
//  4. 可编辑自制：建来源、存条目（含 _copy）、删条目
//  5. 文字转条目（ConverterSpell.doParseText，中文格式）
//  6. 新条目模板（makebrew SpellBuilder 的初始状态，不建界面）
// 只读作者行为，不改插件代码。固定端口 + 固定浏览器资料夹：中文官方只在第一次下载。KEEP=0 清掉重来。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47319 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

// 测试夹具（作者自制格式；只是探路用的样本，不是数据）
const meta = (json, extra = {}) => ({ sources: [{ json, abbreviation: json, full: `探路 ${json}`, authors: ['test'], version: '1' }], dateAdded: 0, dateLastModified: 0, ...extra })
const spell = (name, source, level, text) => ({ name, source, page: 0, level, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: [text] })
const BREWS = [
  { name: 'probe-a.json', json: { _meta: meta('PROBEA'), spell: [spell('探路飞弹', 'PROBEA', 1, '甲包版本')] } },
  // 乙包：和甲包同编号；另写一条官方编号的火球术（补丁）
  { name: 'probe-b.json', json: { _meta: meta('PROBEB'), spell: [spell('探路飞弹', 'PROBEA', 2, '乙包版本'), spell('火球术', 'PHB', 3, '补丁版火球术')] } },
  // 丙包：_copy 官方火球术；_copy 甲包的探路飞弹
  // 作者规则：引用别的来源要在 _meta.dependencies 声明（utils.js _pDoMetaMerge）
  { name: 'probe-c.json', json: { _meta: meta('PROBEC', { dependencies: { spell: ['PHB', 'PROBEA'] } }), spell: [
    { name: '冰球术', source: 'PROBEC', _copy: { name: '火球术', source: 'PHB', _mod: { '*': { mode: 'replaceTxt', replace: '火焰', with: '寒冷' } } } },
    { name: '探路飞弹二', source: 'PROBEC', _copy: { name: '探路飞弹', source: 'PROBEA' } },
  ] } },
  // 丁包：声明 edition one
  { name: 'probe-d.json', json: { _meta: meta('PROBED', { edition: 'one' }), spell: [spell('丁包法术', 'PROBED', 1, '丁')] } },
]
const CONVERT_TEXT = ['测试冰锥', '1环 塑能', '施法时间：1 动作', '施法距离：60 尺', '成分：V、S', '持续时间：立即', '一道冰锥射向目标，造成 {@damage 3d6} 点寒冷伤害。'].join('\n')

// 在作者小窗里跑（window 就是作者页面）
async function probeInFrame({ BREWS, CONVERT_TEXT }) {
  const W = window
  const out = {}
  const tryIt = async (k, fn) => { try { out[k] = await fn() } catch (e) { out[k] = { error: String(e?.stack ?? e).split('\n').slice(0, 3).join(' | ') } } }
  const hash = (prop, ent) => W.UrlUtil.URL_TO_HASH_BUILDER[prop](ent)
  const brief = (s) => s && { name: s.name, source: s.source, level: s.level, text: JSON.stringify(s.entries ?? '').slice(0, 60), copy: !!s._copy }

  await tryIt('edition', () => Object.fromEntries(['PHB', 'XPHB', 'DMG', 'XDMG', 'MM', 'XMM'].map((s) => [s, { classic: W.SourceUtil.isClassicSource(s), legacy: W.SourceUtil.isLegacySourceWotc(s) }])))

  await tryIt('import', async () => {
    const added = await W.BrewUtil2.pAddBrewsFromFiles(BREWS.map((b) => ({ name: b.name, json: b.json })))
    return (added ?? []).map((b) => b.head.filename)
  })
  await tryIt('editionBrew', () => Object.fromEntries(['PROBEA', 'PROBED'].map((s) => [s, { classic: W.SourceUtil.isClassicSource(s), legacy: W.SourceUtil.isLegacySourceWotc(s) }])))

  // 作者合并后的结果
  await tryIt('merged', async () => {
    const all = (await W.DataLoader.pCacheAndGetAllBrew('spell')) ?? []
    const probe = all.filter((s) => s.name === '探路飞弹').map(brief)
    const patch = all.filter((s) => s.name === '火球术').map(brief)
    const copies = all.filter((s) => ['冰球术', '探路飞弹二'].includes(s.name)).map(brief)
    const official = await W.DataLoader.pCacheAndGet('spell', 'PHB', hash('spell', { name: '火球术', source: 'PHB' }))
    const byHash = await W.DataLoader.pCacheAndGet('spell', 'PROBEA', hash('spell', { name: '探路飞弹', source: 'PROBEA' }))
    return { probeInList: probe, patchInList: patch, copies, officialFireballViaCache: brief(official), probeViaCache: brief(byHash) }
  })

  // 按单个包展开（作者 pGetBrewProcessed 对合并结果用的就是 pDoMetaMerge）
  await tryIt('perDoc', async () => {
    const res = {}
    for (const b of await W.BrewUtil2.pGetBrew()) {
      if (!b.head.filename?.startsWith('probe-')) continue
      const merged = await W.DataUtil.pDoMetaMerge(W.CryptUtil.uid(), W.MiscUtil.copyFast(b.body), { isSkipMetaMergeCache: true })
      res[b.head.filename] = (merged.spell ?? []).map(brief)
    }
    return res
  })

  // 单包展开结果和加载器结果的差别（看加载器后处理加了什么）
  await tryIt('loaderVsMerge', async () => {
    const a = (await W.BrewUtil2.pGetBrew()).find((b) => b.head.filename === 'probe-a.json')
    const merged = (await W.DataUtil.pDoMetaMerge(W.CryptUtil.uid(), W.MiscUtil.copyFast(a.body), { isSkipMetaMergeCache: true })).spell[0]
    const loaded = ((await W.DataLoader.pCacheAndGetAllBrew('spell')) ?? []).find((s) => s.name === '探路飞弹')
    return { mergeKeys: Object.keys(merged).sort(), loaderKeys: Object.keys(loaded).sort() }
  })

  // 可编辑自制
  await tryIt('editable', async () => {
    const steps = {}
    const doc = await W.BrewUtil2.pGetOrCreateEditableBrewDoc()
    steps.doc = { isEditable: doc?.head?.isEditable, filename: doc?.head?.filename }
    await W.BrewUtil2.pAddSource({ json: 'PROBEMINE', full: '探路房规', abbreviation: 'MINE', authors: ['me'], convertedBy: [], version: '1' })
    const uid = W.CryptUtil.uid()
    await W.BrewUtil2.pPersistEditableBrewEntity('spell', { name: '火球术（房规）', source: 'PROBEMINE', uniqueId: uid, _copy: { name: '火球术', source: 'PHB', _mod: { entries: { mode: 'appendArr', items: '房规：伤害改为 10d6' } } } })
    // 作者规则：_copy 官方条目要在 _meta.dependencies 声明；走作者 pSetEditableBrewDoc 写回（makebrew-builder-base.js:560 同法）
    const edDoc = W.MiscUtil.copyFast((await W.BrewUtil2.pGetBrew()).find((b) => b.head.isEditable))
    edDoc.body._meta.dependencies = { spell: ['PHB'] }
    await W.BrewUtil2.pSetEditableBrewDoc(edDoc)
    const ed = (await W.BrewUtil2.pGetBrew()).find((b) => b.head.isEditable)
    steps.metaAfterSet = W.MiscUtil.copyFast(ed?.body?._meta?.dependencies ?? null)
    steps.stored = (ed?.body?.spell ?? []).map((s) => ({ name: s.name, uniqueId: s.uniqueId === uid, copy: !!s._copy }))
    steps.sources = (ed?.body?._meta?.sources ?? []).map((s) => s.json)
    const body = W.MiscUtil.copyFast(ed.body)
    const expanded = await W.DataUtil.pDoMetaMerge(W.CryptUtil.uid(), body, { isSkipMetaMergeCache: true })
    const e = (expanded.spell ?? [])[0]
    steps.expanded = brief(e)
    steps.has10d6 = JSON.stringify(e?.entries ?? '').includes('10d6')
    await W.BrewUtil2.pRemoveEditableBrewEntities('spell', [uid])
    steps.afterRemove = ((await W.BrewUtil2.pGetBrew()).find((b) => b.head.isEditable)?.body?.spell ?? []).length
    steps.exportBody = Object.keys(ed.body)
    return steps
  })

  // 文字转条目
  // 文字转条目：照作者 converter.js 第 17–41 行的页面准备步骤（去掉界面部分）
  await tryIt('converterInit', async () => {
    const base = new URL('js/', location.href).href
    const { TagCondition, TaggerUtils } = await import(`${base}converter/converterutils-tags.js`)
    const { TagJsons } = await import(`${base}converter/converterutils-entries.js`)
    const { AcConvert, AttachedItemTag, MiscTag, SpellcastingTraitConvert } = await import(`${base}converter/converterutils-creature.js`)
    const { ConverterItem } = await import(`${base}converter/converter-item.js`)
    const { RaceTraitTag } = await import(`${base}converter/converterutils-race.js`)
    const { InstrumentBaseItemTag } = await import(`${base}converter/converterutils-item.js`)
    const [spells, items, itemsRaw, legendaryGroups, classes, brew] = await Promise.all([
      W.DataUtil.spell.pLoadAll(), W.Renderer.item.pBuildList(), W.DataUtil.item.loadRawJSON(),
      W.DataUtil.legendaryGroup.pLoadAll(), W.DataUtil.class.loadJSON(), W.BrewUtil2.pGetBrewProcessed(),
    ])
    const itemsNoGroups = items.filter((it) => !it._isItemGroup)
    SpellcastingTraitConvert.init(spells)
    ConverterItem.init(itemsNoGroups, classes)
    AcConvert.init(itemsNoGroups)
    TaggerUtils.init({ legendaryGroups, spells })
    await TagJsons.pInit({ spells })
    RaceTraitTag.init({ itemsRaw })
    MiscTag.init({ items })
    AttachedItemTag.init({ items })
    await TagCondition.pInit({ conditionsBrew: brew.condition })
    InstrumentBaseItemTag.init({ items: itemsNoGroups })
    const converterJson = await W.DataUtil.loadJSON(`${W.Renderer.get().baseUrl}data/converter.json`).then((j) => !!j, (e) => String(e))
    return { spells: spells.length, items: items.length, converterJson }
  })
  await tryIt('converter', async () => {
    const { ConverterSpell } = await import(new URL('js/converter/converter-spell.js', location.href).href)
    const outputs = []
    const warnings = []
    ConverterSpell.doParseText(CONVERT_TEXT, { cbOutput: (o) => outputs.push(o), cbWarning: (w) => warnings.push(String(w)), source: 'PROBEMINE', page: 0 })
    return { outputs, warnings }
  })

  // 新条目模板（不建构建器界面）
  await tryIt('makebrew', async () => {
    const { SpellBuilder } = await import(new URL('js/makebrew/makebrew-spell.js', location.href).href)
    const state = SpellBuilder.prototype._getInitialState.call(Object.create(SpellBuilder.prototype))
    return { keys: Object.keys(state), name: state.name, level: state.level }
  })

  // 收拾：删掉探路导入的包（作者 pDeleteBrews）
  await tryIt('cleanup', async () => {
    const mine = (await W.BrewUtil2.pGetBrew()).filter((b) => b.head.filename?.startsWith('probe-') || b.head.isEditable)
    await W.BrewUtil2.pDeleteBrews(mine)
    return mine.length
  })
  out.frameErrors = [...(W.__trpgFrameErrors ?? [])]
  return out
}

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-p3-1-${name}`
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  page.on('console', (m) => { if (m.text().startsWith('[progress]') && !/ download /.test(m.text())) console.log(m.text()) })
  const r = { engine: name }
  try {
    await page.goto(url)
    r.setup = await page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const set = await h.offlineAudit('cn-official')
      if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install('cn-official')
      const ready = await h.startFrames(['cn'], { allowNetwork: false })
      await h.callFrame('cn', 'init')
      return ready
    })
    const frame = page.frames().filter((f) => f.url().includes('/vendor/cn/frame.html')).pop()
    r.probe = await frame.evaluate(probeInFrame, { BREWS, CONVERT_TEXT })
  } catch (e) { r.fatal = e.stack } finally { r.errors = errors; await ctx.close() }
  results.push(r)
  await writeFile(`${work}/p3-1-probe-${name}.json`, JSON.stringify(r, null, 2))
  console.log(name, JSON.stringify(r, null, 1))
}
server.close()
