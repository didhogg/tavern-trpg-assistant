// 小窗里：P3-1 用到的作者入口（D2-P3 整体设计 §2.1、§2.3–§2.5）。只转调作者函数，结果原样交回。
// 版本判断、来源名、单包编号、可编辑自制、文字转条目、新条目模板、自制导出、背景描述。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, engSiteHashOf, hashOf, init } from './author'
import { prepareProp } from './page-prepare'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)

export interface EditionInfo {
  classic: boolean | null
  basis: 'date' | 'brew-meta' | null
}

/**
 * 作者对来源的版本判断（SourceUtil.isClassicSource，utils.js 第 648 行）：
 * 自制 / 试玩稿按包头 _meta.edition（没写时作者默认旧版，utils-brew-base.js 第 1235 行）；
 * 官方按出版日期；查不到日期的作者也判断不了 → classic: null。
 */
export async function editionOf(sources: string[]): Promise<Record<string, EditionInfo>> {
  await init()
  const out: Record<string, EditionInfo> = {}
  for (const s of sources) {
    if (A.BrewUtil2.hasSourceJson(s) || A.PrereleaseUtil.hasSourceJson(s)) out[s] = { classic: !!A.SourceUtil.isClassicSource(s), basis: 'brew-meta' }
    else if (A.Parser.sourceJsonToDate(s)) out[s] = { classic: !!A.SourceUtil.isClassicSource(s), basis: 'date' }
    else out[s] = { classic: null, basis: null }
  }
  return out
}

/** 来源的全名、缩写（作者 Parser.sourceJsonToFull / sourceJsonToAbv）。 */
export async function sourceNames(sources: string[]): Promise<Record<string, { full: string; abv: string }>> {
  await init()
  return Object.fromEntries(sources.map((s) => [s, { full: A.Parser.sourceJsonToFull(s), abv: A.Parser.sourceJsonToAbv(s) }]))
}

const requiresOf = (body: any): BrewRequirement[] => {
  const out: BrewRequirement[] = []
  const seen = new Set<string>()
  const add = (r: BrewRequirement): void => {
    const key = `${r.kind}|${r.prop}|${String(r.source).toLowerCase()}|${r.hash ?? ''}`
    if (seen.has(key)) return
    seen.add(key); out.push(r)
  }
  for (const kind of ['dependencies', 'includes'] as const) {
    for (const [prop, list] of Object.entries(body?._meta?.[kind] ?? {})) {
      for (const source of Array.isArray(list) ? list : []) add({ kind: kind === 'dependencies' ? 'dependency' : 'include', prop, source: String(source) })
    }
  }
  for (const [prop, list] of Object.entries(body?._meta?.otherSources ?? {})) {
    for (const source of Object.keys((list ?? {}) as Record<string, unknown>)) add({ kind: 'otherSource', prop, source })
  }
  for (const [prop, list] of Object.entries(body ?? {})) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    for (const entry of list) {
      const copy = (entry as any)?._copy
      if (!copy || typeof copy !== 'object') continue
      const source = String(copy.source ?? '')
      if (!source) continue
      add({ kind: 'copy', prop, source, hash: hashOf(prop, copy) })
    }
  }
  return out
}

/** 已装自制每个包：包头 + 声明的来源 + 每类每条的作者编号（原始文件直接算，不经加载器，所以同编号的都在）。 */
export interface BrewRequirement {
  kind: 'dependency' | 'include' | 'otherSource' | 'copy'
  prop: string
  source: string
  hash?: string | null
}

export async function brewDocIndex(): Promise<Array<{ docIdLocal: string; filename: string | null; url: string | null; timeAdded: number; order: number; isEditable: boolean; sources: string[]; props: Record<string, Array<string | null>>; requires: BrewRequirement[] }>> {
  await init()
  return (await A.BrewUtil2.pGetBrew()).map((b: any, i: number) => ({
    docIdLocal: b.head.docIdLocal,
    filename: b.head.filename ?? null,
    url: b.head.url ?? null,
    timeAdded: b.head.timeAdded ?? 0,
    order: i,
    isEditable: !!b.head.isEditable,
    sources: (b.body?._meta?.sources ?? []).map((s: any) => s?.json).filter(Boolean),
    props: Object.fromEntries(Object.entries(b.body ?? {})
      .filter(([k, v]) => !k.startsWith('_') && Array.isArray(v))
      .map(([k, v]) => [k, (v as any[]).map((e) => (e && typeof e === 'object' ? hashOf(k, e) : null))])),
    requires: requiresOf(b.body),
  }))
}

/** 已装自制的原样（包头 + 内容），按本地编号取；不给编号就是全部。 */
export async function brewRaw(docIdLocals: string[] | null = null): Promise<any[]> {
  await init()
  const all = await A.BrewUtil2.pGetBrew()
  return docIdLocals ? all.filter((b: any) => docIdLocals.includes(b.head.docIdLocal)) : all
}

/**
 * 隔离小窗里用：按编号取作者加载器处理后的自制条目（先让作者把这一类自制装进缓存，再按编号取）。
 * 和官方同编号时作者缓存里自制版会顶掉官方版（P3-1 探路实测）；若取回的仍是官方那个对象，说明自制版没装进去，不交。
 */
export async function brewItemsByHash(wants: Array<{ prop: string; hash: string }>): Promise<Record<string, unknown>> {
  await init()
  const out: Record<string, unknown> = {}
  for (const { prop, hash } of wants) {
    await prepareProp(prop)
    await A.DataLoader.pCacheAndGetAllBrew(prop)
    const item = await A.DataLoader.pCacheAndGetHash(prop, hash)
    if (!item) continue
    const site: any[] = (await A.DataLoader.pCacheAndGetAllSite(prop)) ?? []
    if (site.includes(item)) continue
    out[`${prop}|${hash}`] = item
  }
  return out
}

/** 书或冒险正文的文件路径（作者加载器的拼法：utils-dataloader-dataloader.js 第 1134 行）。 */
export async function corpusFile(prop: string, id: string): Promise<string> {
  await init()
  return `data/${prop}/${prop}-${A.UrlUtil.encodeForHash(id.toLowerCase())}.json`
}

/** 导出一个包：作者 brew.body 原样（utils-brew-ui-manage.js 第 909 行的取数部分）。 */
export async function brewExport(docIdLocal: string): Promise<{ filename: string | null; body: unknown } | null> {
  const b = (await brewRaw([docIdLocal]))[0]
  return b ? { filename: b.head.filename ?? null, body: b.body } : null
}

/** 背景描述（作者 Renderer.utils.pGetProxyFluff）：条目对象由插件给（不从作者缓存取，缓存可能被同编号的自制顶掉）。 */
export async function fluffOf(prop: string, item: any): Promise<{ fluff: unknown; fluffError: string | null }> {
  await init()
  try {
    return { fluff: (await A.Renderer.utils.pGetProxyFluff({ entity: item, prop })) ?? null, fluffError: null }
  } catch (e) {
    return { fluff: null, fluffError: e instanceof Error ? e.message : String(e) }
  }
}

/** 整类一次取配图描述：装书/改自制时存进库，看资料时不再开小窗。 */
export async function fluffOfMany(prop: string, items: any[]): Promise<Record<string, { fluff: unknown; fluffError: string | null; engSiteHash: string | null }>> {
  await init()
  const out: Record<string, { fluff: unknown; fluffError: string | null; engSiteHash: string | null }> = {}
  for (const item of items) {
    const hash = hashOf(prop, item)
    if (!hash) continue
    try {
      out[hash] = {
        fluff: (await A.Renderer.utils.pGetProxyFluff({ entity: item, prop })) ?? null,
        fluffError: null,
        engSiteHash: engSiteHashOf(prop, item),
      }
    } catch (e) {
      out[hash] = { fluff: null, fluffError: e instanceof Error ? e.message : String(e), engSiteHash: null }
    }
  }
  return out
}

/** 作者屏蔽表原文（开关书、装书时算缓存指纹用）。 */
export async function excludeList(): Promise<unknown[]> {
  await init()
  return A.ExcludeUtil.getList()
}

// ---- 可编辑自制（作者 utils-brew-impl-brew.js 第 58–135 行）----

/** 可编辑自制包（没有就让作者建一个）。 */
export async function editableDoc(): Promise<{ head: any; body: any }> {
  await init()
  return A.BrewUtil2.pGetOrCreateEditableBrewDoc()
}

/** 可编辑自制里加一个来源（作者 pAddSource）；已有同名来源不重复加。 */
export async function editableEnsureSource(sourceObj: { json: string; full: string; abbreviation: string; authors?: string[]; version?: string }): Promise<string[]> {
  const doc = await editableDoc()
  const has = (doc.body?._meta?.sources ?? []).some((s: any) => String(s.json).toLowerCase() === sourceObj.json.toLowerCase())
  if (!has) await A.BrewUtil2.pAddSource({ authors: [], convertedBy: [], version: '1', ...sourceObj })
  return ((await editableDoc()).body?._meta?.sources ?? []).map((s: any) => s.json)
}

/** 存一条（作者 pPersistEditableBrewEntity：按 uniqueId 新增或覆盖）。没有 uniqueId 就让作者生成。 */
export async function editablePut(prop: string, ent: any): Promise<{ uniqueId: string; hash: string | null }> {
  await init()
  const e = { ...ent, uniqueId: ent.uniqueId ?? A.CryptUtil.uid() }
  await A.BrewUtil2.pPersistEditableBrewEntity(prop, e)
  return { uniqueId: e.uniqueId, hash: hashOf(prop, e) }
}

/** 删条（作者 pRemoveEditableBrewEntities）。 */
export async function editableRemove(prop: string, uniqueIds: string[]): Promise<void> {
  await init()
  await A.BrewUtil2.pRemoveEditableBrewEntities(prop, uniqueIds)
}

/**
 * 补依赖声明（作者规则：_copy 别的来源要在 _meta.dependencies 里声明，utils.js _pDoMetaMerge）。
 * 写回走作者 pSetEditableBrewDoc（makebrew-builder-base.js 第 560 行同法）。
 */
export async function editableAddDependencies(add: Record<string, string[]>): Promise<Record<string, string[]>> {
  const doc = A.MiscUtil.copyFast(await editableDoc())
  const deps: Record<string, string[]> = (doc.body._meta.dependencies ??= {})
  for (const [prop, sources] of Object.entries(add)) deps[prop] = [...new Set([...(deps[prop] ?? []), ...sources])]
  await A.BrewUtil2.pSetEditableBrewDoc(doc)
  return deps
}

// ---- 文字转条目（作者 converter，js/converter/）与新条目模板（作者 makebrew，js/makebrew/）----

/** 作者的转换器：类别 → 模块、类、支持的格式（格式名对应作者方法 doParseText / doParseMarkdown / doParseHtml）。 */
const CONVERTERS: Record<string, { file: string; cls: string; formats: Array<'text' | 'markdown' | 'html'> }> = {
  spell: { file: 'converter/converter-spell.js', cls: 'ConverterSpell', formats: ['text'] },
  monster: { file: 'converter/converter-creature.js', cls: 'ConverterCreature', formats: ['text', 'markdown'] },
  item: { file: 'converter/converter-item.js', cls: 'ConverterItem', formats: ['text'] },
  feat: { file: 'converter/converter-feat.js', cls: 'ConverterFeat', formats: ['text'] },
  race: { file: 'converter/converter-race.js', cls: 'ConverterRace', formats: ['text', 'markdown'] },
  background: { file: 'converter/converter-background.js', cls: 'ConverterBackground', formats: ['text'] },
  table: { file: 'converter/converter-table.js', cls: 'ConverterTable', formats: ['markdown', 'html'] },
  entries: { file: 'converter/converter-entries.js', cls: 'ConverterEntries', formats: ['markdown'] },
}
const METHOD = { text: 'doParseText', markdown: 'doParseMarkdown', html: 'doParseHtml' } as const

let converterReady: Promise<void> | null = null

/** 照作者 converter.js 第 17–41 行的页面准备步骤（去掉界面部分）。 */
function prepareConverters(): Promise<void> {
  converterReady ??= (async () => {
    await init()
    const [{ TagCondition, TaggerUtils }, { TagJsons }, { AcConvert, AttachedItemTag, MiscTag, SpellcastingTraitConvert }, { ConverterItem }, { RaceTraitTag }, { InstrumentBaseItemTag }] = await Promise.all([
      mod('converter/converterutils-tags.js'), mod('converter/converterutils-entries.js'), mod('converter/converterutils-creature.js'),
      mod('converter/converter-item.js'), mod('converter/converterutils-race.js'), mod('converter/converterutils-item.js'),
    ])
    const [spells, items, itemsRaw, legendaryGroups, classes, brew] = await Promise.all([
      A.DataUtil.spell.pLoadAll(), A.Renderer.item.pBuildList(), A.DataUtil.item.loadRawJSON(),
      A.DataUtil.legendaryGroup.pLoadAll(), A.DataUtil.class.loadJSON(), A.BrewUtil2.pGetBrewProcessed(),
    ])
    const itemsNoGroups = items.filter((it: any) => !it._isItemGroup)
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
  })()
  converterReady.catch(() => { converterReady = null })
  return converterReady
}

/** 作者有哪些转换器、各支持什么格式。 */
export async function converters(): Promise<Record<string, Array<'text' | 'markdown' | 'html'>>> {
  return Object.fromEntries(Object.entries(CONVERTERS).map(([k, v]) => [k, v.formats]))
}

/**
 * 文字转条目：作者转换器的输出与警告原样交回。选项照作者界面（converter-ui-base.js 第 305 行 _handleParse_getOpts）；
 * styleHint 是作者的版本风格（classic / one），决定转换时标签指向哪一版的条目，由战役规则决定。
 */
export async function convertText(prop: string, format: 'text' | 'markdown' | 'html', text: string, opts: { source: string; page?: number; styleHint?: 'classic' | 'one' }): Promise<{ outputs: unknown[]; warnings: string[] }> {
  const c = CONVERTERS[prop]
  if (!c) throw new Error(`作者没有这一类的转换器：${prop}`)
  if (!c.formats.includes(format)) throw new Error(`作者的${prop}转换器不支持这种格式：${format}（支持 ${c.formats.join('、')}）`)
  await prepareConverters()
  const Cls = (await mod(c.file))[c.cls]
  const outputs: unknown[] = []
  const warnings: string[] = []
  Cls[METHOD[format]](text, { cbOutput: (o: unknown) => outputs.push(o), cbWarning: (w: unknown) => warnings.push(String(w)), isAppend: false, source: opts.source, page: opts.page ?? 0, ...(opts.styleHint ? { styleHint: opts.styleHint } : {}) })
  return { outputs, warnings }
}

/** 作者的新条目构建器：类别 → 模块、类。 */
const BUILDERS: Record<string, { file: string; cls: string }> = {
  spell: { file: 'makebrew/makebrew-spell.js', cls: 'SpellBuilder' },
  monster: { file: 'makebrew/makebrew-creature.js', cls: 'CreatureBuilder' },
  legendaryGroup: { file: 'makebrew/makebrew-legendarygroup.js', cls: 'LegendaryGroupBuilder' },
}

/** 新条目模板：作者构建器的初始状态（_getInitialState；不建构建器界面）。作者没有这一类的构建器 → null。 */
export async function entryTemplate(prop: string): Promise<Record<string, unknown> | null> {
  await init()
  const b = BUILDERS[prop]
  if (!b) return null
  const Cls = (await mod(b.file))[b.cls]
  return Cls.prototype._getInitialState.call(Object.create(Cls.prototype))
}
