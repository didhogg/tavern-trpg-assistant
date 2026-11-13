// 小窗里：新建条目用到的作者入口（P5.5 B5）。哪些类型能新建、中文名、分组、作者的构建器和转换器都从作者代码读，不抄名单：
// - 构建器 / 转换器：作者页面脚本 makebrew.js / converter.js 用 import 逐个登记，这里读这两个文件的 import 行，
//   再取各类构造时自己写明的 prop（转换器还有 modes、示例文字）。
// - 类型：作者「能单独打开的条目」UrlUtil.URL_TO_HASH_BUILDER，去掉书 / 冒险的正文类（UrlUtil._PAGE_TO_PROPS_CORPUS）；
//   中文名 Parser.getPropDisplayName，分组 UrlUtil.PAGE_TO_PROPS + PG_TO_NAME。结构定义允不允许由主窗按字段表再筛（custom.entryTypes）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)

/** 作者的转换模式（converter-ui-base.js _getDisplayMode：txt / md / html）。 */
export type ConvertMode = 'txt' | 'md' | 'html'

/** 读作者页面脚本里 `import {类名} from "./目录/文件.js"` 的登记，按类名后缀挑出要的那几类。 */
async function authorImports(page: string, dir: string, suffix: RegExp): Promise<Array<{ cls: string; file: string }>> {
  const text = await (await fetch(new URL(`js/${page}`, location.href))).text()
  const out: Array<{ cls: string; file: string }> = []
  for (const m of text.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/([\w/.-]+\.js)["']/g)) {
    if (m[2].startsWith(`${dir}/`) && suffix.test(m[1])) out.push({ cls: m[1], file: m[2] })
  }
  return out
}

let converterReady: Promise<void> | null = null
/** 照作者 converter.js 第 17–41 行的页面准备步骤（去掉界面部分）。 */
export function prepareConverters(): Promise<void> {
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

let converterList: Promise<any[]> | null = null
/** 作者登记的转换器（界面类实例，不建界面：界面对象只给作者构造时要挂的保存回调）。示例文字取作者 data/converter.json，取不到就没有示例。 */
export function converterUis(): Promise<any[]> {
  converterList ??= (async () => {
    await init()
    const converterData: any = await A.DataUtil.loadJSON(`${A.Renderer.get().baseUrl}data/converter.json`).catch(() => ({ converterSample: [] }))
    const ui = { saveSettingsDebounced: () => undefined }
    const out = []
    for (const { cls, file } of await authorImports('converter.js', 'converter', /.ConverterUi$/)) {
      const Cls = (await mod(file))[cls]
      if (typeof Cls === 'function') out.push(new Cls({ ui, converterData }))
    }
    return out
  })()
  converterList.catch(() => { converterList = null })
  return converterList
}

export interface ConverterInfo {
  /** 作者的转换器编号（spell、generic…）。 */
  id: string
  /** 转出来的是哪一类条目；通用正文转换器没有（只转成正文段落）。 */
  prop: string | null
  modes: ConvertMode[]
  /** 作者认为转出来能直接存成自制条目。 */
  canSave: boolean
  /** 每种模式有没有作者示例文字。 */
  samples: ConvertMode[]
}

const sampleOf = (c: any, mode: ConvertMode): string | null => {
  try { return c._getSample(mode) ?? null } catch { return null }
}

/** 作者有哪些转换器。 */
export async function converters(): Promise<ConverterInfo[]> {
  return (await converterUis()).map((c) => ({ id: c.converterId, prop: c.prop ?? null, modes: [...c._modes], canSave: !!c.canSaveLocal, samples: (c._modes as ConvertMode[]).filter((m) => !!sampleOf(c, m)) }))
}

/** 作者某个转换器某种模式的示例文字（照作者「Sample」按钮，按版本风格挑）。 */
export async function converterSample(id: string, mode: ConvertMode, styleHint?: 'classic' | 'one'): Promise<string | null> {
  const c = (await converterUis()).find((x) => x.converterId === id)
  if (!c) return null
  if (styleHint) c._state.styleHint = styleHint
  return sampleOf(c, mode)
}

/**
 * 文字转条目：调作者转换器界面类自己的 handleParse（作者真正的转换入口），输出与警告原样交回。
 * styleHint 是作者的版本风格（classic / one），决定转换时标签指向哪一版的条目，由战役规则决定。
 */
export async function convertText(id: string, mode: ConvertMode, text: string, opts: { source: string; page?: number; styleHint?: 'classic' | 'one' }): Promise<{ outputs: unknown[]; warnings: string[] }> {
  const c = (await converterUis()).find((x) => x.converterId === id)
  if (!c) throw new Error(`作者没有这个转换器：${id}`)
  if (!c._modes.includes(mode)) throw new Error(`作者的 ${id} 转换器不支持这种格式：${mode}（支持 ${c._modes.join('、')}）`)
  await prepareConverters()
  Object.assign(c._state, { mode, ...(opts.styleHint ? { styleHint: opts.styleHint } : {}) })
  if ('source' in c._state) c._state.source = opts.source
  if ('page' in c._state) c._state.page = opts.page ?? 0
  const outputs: unknown[] = []
  const warnings: string[] = []
  c.handleParse(text, (o: unknown) => outputs.push(o), (w: unknown) => warnings.push(String(w)), false)
  return { outputs, warnings }
}

let builderList: Promise<Array<{ prop: string; proto: any }>> | null = null
/** 作者登记的新条目构建器（makebrew.js 的 import）：类别取构建器构造时写明的 prop。 */
function builders(): Promise<Array<{ prop: string; proto: any }>> {
  builderList ??= (async () => {
    await init()
    const out = []
    for (const { cls, file } of await authorImports('makebrew.js', 'makebrew', /(?<!Base)Builder$/)) {
      const Cls = (await mod(file))[cls]
      if (typeof Cls !== 'function') continue
      const prop = new Cls()._prop
      if (typeof prop === 'string') out.push({ prop, proto: Cls.prototype })
    }
    return out
  })()
  builderList.catch(() => { builderList = null })
  return builderList
}

/** 新条目模板：作者构建器的初始状态（_getInitialState；不建构建器界面）。作者没有这一类的构建器 → null。 */
export async function entryTemplate(prop: string): Promise<Record<string, unknown> | null> {
  const b = (await builders()).find((x) => x.prop === prop)
  return b ? b.proto._getInitialState.call(Object.create(b.proto)) : null
}

export interface EntryTypeInfo {
  prop: string
  /** 作者的显示名（中文版作者给中文）。 */
  name: string
  /** 作者网站上放这一类的页面；不属于任何页的 null。 */
  group: { page: string; name: string } | null
  /** 作者有新条目构建器（模板）。 */
  builder: boolean
  /** 作者能把文字转成这一类的转换器编号。 */
  converters: string[]
}

/** 作者认为能单独打开的条目类型（不含书 / 冒险的正文类）。 */
export async function entryTypes(): Promise<EntryTypeInfo[]> {
  await init()
  const U = A.UrlUtil
  const corpus = new Set<string>(Object.values(U._PAGE_TO_PROPS_CORPUS ?? {}).flatMap((x: any) => [x.propHead, x.propBody]))
  const pageOf = new Map<string, string>()
  for (const [page, props] of Object.entries(U.PAGE_TO_PROPS ?? {}) as Array<[string, string[]]>) for (const p of props) if (!pageOf.has(p)) pageOf.set(p, page)
  const bs = new Set((await builders()).map((b) => b.prop))
  const cs = await converters()
  // 页面表（PAGE_TO_PROPS）作者没登全（神祇、表格、载具……不在里面）：再看作者每类数据加载类自己写的页面（DataUtil.<类别>._PAGE，
  // 描述类如 monsterFluff 写的是怪物页）。§16.10 1d
  const dataPage = (prop: string): string | undefined => { const pg = (A.DataUtil as any)?.[prop]?._PAGE; return typeof pg === 'string' && pg.endsWith('.html') ? pg : undefined }
  return Object.keys(U.URL_TO_HASH_BUILDER ?? {}).filter((p) => !corpus.has(p)).map((prop) => {
    const page = pageOf.get(prop) ?? dataPage(prop)
    return {
      prop,
      name: String(A.Parser.getPropDisplayName(prop)),
      group: page ? { page, name: String(U.PG_TO_NAME?.[page] ?? page) } : null,
      builder: bs.has(prop),
      converters: cs.filter((c) => c.prop === prop).map((c) => c.id),
    }
  })
}

/**
 * 一类条目的作者原文件内容（§16.10 1a 用法统计用）：先用这一类自己的 DataUtil.<类别>.loadRawJSON，
 * 没有就用同一页别的类别的（子种族在种族文件里：DataUtil.race 读 races.json）。取不到 null。
 */
export async function rawProp(prop: string): Promise<unknown[] | null> {
  await init()
  const U = A.UrlUtil, D = A.DataUtil as any
  const page = Object.entries((U.PAGE_TO_PROPS ?? {}) as Record<string, string[]>).find(([, ps]) => ps.includes(prop))?.[0]
  for (const c of [prop, ...(page ? U.PAGE_TO_PROPS[page] as string[] : [])]) {
    const cls = D?.[c]
    if (typeof cls?.loadRawJSON !== 'function') continue
    try {
      const j = await cls.loadRawJSON()
      if (Array.isArray(j?.[prop])) return j[prop]
    } catch (e) { console.debug(`[trpg-assistant] 作者 ${c} 原文件没读到`, e) }
  }
  return null
}
