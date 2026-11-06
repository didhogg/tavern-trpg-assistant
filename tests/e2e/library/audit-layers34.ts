// 审计第 3、4 层（D2-P2 B1 设计 §11）：验证程序，不随插件发布，不处理数据，只出报告。
// 只读四样东西：作者结构定义（schemaInfo，tools/audit/schema-info.mjs 从 5etools-utils 读出）、作者编号规则（小窗里算）、
// 作者规则登记（audit-author-rules.ts）命中的差异单独计数。
// 本地原始文件（= GitHub 锁定版本，第 1 层已证）、全量解析结果。不含我们自己写的字段名单。
//   第 3 层 不漏：原始每条用作者编号规则算编号，去解析结果里找 → A 对上 / B 原始有解析无 / C 解析有原始无 / D 解释不了
//   第 4 层 只有解析处不同：A 桶每一对逐字段比；只允许 ① 结构定义里没有的字段（加载器加的）② 原始记录带解析标记

import { findRule, type AuthorRule } from './audit-author-rules'

export interface RecordSchema { fields: string[]; markers: string[]; open: boolean }

export interface SchemaInfo {
  version: string
  /** 结构定义文件 → 类别 → 单条记录定义。 */
  files: Record<string, Record<string, RecordSchema>>
  /** 类别 → 各文件里这一类定义的合并（给没有对应结构定义文件的生成文件、解析后多出的条目用）。 */
  byProp: Record<string, RecordSchema>
}

/** 数据文件对哪个结构定义文件：原样取自作者 test/test-json.js 的 fnGetSchemaId。 */
export function schemaIdOf(filePath: string): string {
  const relativeFilePath = filePath.replace('data/', '')

  if (relativeFilePath.startsWith('adventure/')) return 'adventure/adventure.json'
  if (relativeFilePath.startsWith('book/')) return 'book/book.json'

  if (relativeFilePath.startsWith('bestiary/bestiary-')) return 'bestiary/bestiary.json'
  if (relativeFilePath.startsWith('bestiary/fluff-bestiary-')) return 'bestiary/fluff-bestiary.json'

  if (relativeFilePath.startsWith('class/class-')) return 'class/class.json'
  if (relativeFilePath.startsWith('class/fluff-class-')) return 'class/fluff-class.json'

  if (relativeFilePath.startsWith('spells/spells-')) return 'spells/spells.json'
  if (relativeFilePath.startsWith('spells/fluff-spells-')) return 'spells/fluff-spells.json'

  return relativeFilePath
}

/**
 * Foundry 补充数据文件：照作者 test/test-foundry.js 的认法——目录里的 foundry.json（_DirectoryAdapter）、
 * data/ 下的 foundry-*.json（_RootAdapter）。里面每条对应一条原始记录、只给 Foundry 用，不是独立条目，不进第 3、4 层。
 */
export function isFoundryFile(path: string): boolean {
  const name = path.split('/').at(-1) ?? ''
  const depth = path.split('/').length
  return (depth === 3 && name === 'foundry.json') || (depth === 2 && name.startsWith('foundry-') && name.endsWith('.json'))
}

/** 原始记录的单条定义：先按作者的文件对应规则找；作者不校验的文件（data/generated/ 等）用这一类的合并定义。 */
export function recordSchemaOf(schema: SchemaInfo, file: string, prop: string): { schema: RecordSchema | undefined; fallback: boolean } {
  const own = schema.files[schemaIdOf(file)]
  if (own) return { schema: own[prop], fallback: false }
  return { schema: schema.byProp[prop], fallback: true }
}

export interface RawRecord { prop: string; file: string; hash: string | null; rec: Record<string, unknown>; schema: RecordSchema | undefined }
export interface ParsedRecord { prop: string; hash: string | null; item: Record<string, unknown> }

const SAMPLES = 8
const label = (r: Record<string, unknown>): string => `${String(r.name ?? r.id ?? '?')}|${String(r.source ?? '?')}`

export interface Layer3Prop {
  raw: number
  parsed: number
  /** A：原始和解析后同类别、同编号。 */
  a: number
  /** A'：同编号出现在另一类别（作者加载器把这一类并进/拆出另一类）：原始类别 → 解析类别 → 条数。 */
  crossProp: Record<string, number>
  /** B（已解释）：原始有、解析后没有，记录带解析标记。按标记计数。 */
  bMarked: Record<string, number>
  /** D：解释不了的。 */
  d: { rawOnly: number; parsedOnly: number; rawNoHash: number; samples: string[] }
  /** 作者规则登记命中（规则编号 → 条数），不算进 D。 */
  authorRules: Record<string, number>
  /** 解析有原始无的条目上，结构定义里没有的字段（看它们是不是加载器生成的）：字段 → 条数。 */
  parsedOnlyRuntime: Record<string, number>
}

export interface Layer4Prop {
  pairs: number
  identical: number
  /** 只差在结构定义里没有的字段（加载器加的运行时字段）。字段 → 条数。 */
  runtimeOnly: number
  runtimeFields: Record<string, number>
  /** 原始记录带解析标记（允许不同）。 */
  marked: number
  /** 差异全部被作者规则登记解释的对数；规则编号 → 命中的差异个数。 */
  authorRule: number
  authorRules: Record<string, number>
  /** 这一类没有结构定义，只多了字段、判断不了是不是加载器加的（例 data/generated/gendata-tables.json 的 tableGroup）。 */
  noSchema: number
  /** 同一编号原始或解析后不止一条，无法一一配对。 */
  ambiguous: number
  ambiguousSamples: string[]
  /** 可疑：kind:字段 → 条数和样例。kind = removed（解析后少了）/ changed（值变了）/ added-in-schema（加载器加了结构定义里允许的字段）/ added-no-schema（这一类没有结构定义，判断不了）。 */
  suspicious: Record<string, { count: number; samples: string[] }>
}

export interface AuditLayers34Report {
  source: string
  schemaVersion: string
  /** 原始文件里不是结构定义类别的顶层键（例：中文站的 data/spells/sources.json 按来源编号做键）。键 → 文件。 */
  notCategory: Record<string, string[]>
  /** 作者 test-json 不校验的文件（没有对应的结构定义文件，例 data/generated/）：按类别的合并定义比。文件 → 类别。 */
  noSchemaFile: Record<string, string[]>
  /** Foundry 补充数据（作者 test-foundry.js 的认法）：文件 → 条数。不进第 3、4 层。 */
  foundry: Record<string, number>
  /** 不在这两层比的类别和原因（书、冒险正文：第 2 层已逐本解析）。 */
  notChecked: Array<{ prop: string; raw: number; reason: string }>
  /** 原始有、作者加载器登记表里没有这一类、解析结果里也没有（作者不单独加载这一类）。 */
  notLoaded: Record<string, number>
  layer3: Record<string, Layer3Prop>
  layer4: Record<string, Layer4Prop>
  totals: { raw: number; a: number; crossProp: number; bMarked: number; authorRule3: number; dRaw: number; dParsed: number; pairs: number; identical: number; runtimeOnly: number; marked: number; authorRule4: number; noSchema: number; ambiguous: number; suspicious: number }
}

/** 不看键顺序的深比较（解析结果经过结构化克隆，键顺序可能和原文不同）。 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) return a.length === (b as unknown[]).length && a.every((v, i) => deepEqual(v, (b as unknown[])[i]))
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

const groupBy = <T>(list: T[], key: (t: T) => string): Map<string, T[]> => {
  const m = new Map<string, T[]>()
  for (const t of list) {
    const k = key(t)
    const arr = m.get(k)
    if (arr) arr.push(t)
    else m.set(k, [t])
  }
  return m
}

/** 第 4 层：一对原始 / 解析后记录逐字段比。 */
export function comparePair(raw: Record<string, unknown>, parsed: Record<string, unknown>, schema: RecordSchema | undefined):
  { kind: 'identical' | 'marked' | 'runtimeOnly' | 'noSchema' | 'suspicious'; runtime: string[]; diffs: string[] } {
  if (schema?.markers.some((m) => m in raw)) return { kind: 'marked', runtime: [], diffs: [] }
  const allowed = new Set(schema?.fields ?? [])
  const runtime: string[] = []
  const diffs: string[] = []
  for (const k of new Set([...Object.keys(raw), ...Object.keys(parsed)])) {
    const inRaw = k in raw
    const inParsed = k in parsed
    if (inRaw && inParsed) {
      if (!deepEqual(raw[k], parsed[k])) diffs.push(`changed:${k}`)
    } else if (inRaw) diffs.push(`removed:${k}`)
    else if (!schema) diffs.push(`added-no-schema:${k}`)
    else if (!allowed.has(k) && !schema.open) runtime.push(k)
    else diffs.push(`added-in-schema:${k}`)
  }
  if (diffs.length && diffs.every((d) => d.startsWith('added-no-schema:'))) return { kind: 'noSchema', runtime, diffs: [] }
  if (diffs.length) return { kind: 'suspicious', runtime, diffs }
  return { kind: runtime.length ? 'runtimeOnly' : 'identical', runtime, diffs }
}

/** 第 3、4 层的比对本身（纯函数，单元测试直接测它）。 */
export function compareLayers(raws: RawRecord[], parseds: ParsedRecord[], schema: SchemaInfo, loaderGroups: string[][], parsedProps: Set<string>, rules: AuthorRule[] = [], codeSet = ''): Pick<AuditLayers34Report, 'notLoaded' | 'layer3' | 'layer4' | 'totals'> {
  const loaderProps = new Set(loaderGroups.flat())
  // 换类别只认同一个作者加载器里的类别（例 baseitem、magicvariant、itemGroup → item；race、subrace），
  // 还要求名字相同：编号规则不同类别可能撞号（例 itemType 与 itemProperty、物品与物品背景描述）
  const sameLoader = (a: string, b: string) => loaderGroups.some((g) => g.includes(a) && g.includes(b))
  const layer3: Record<string, Layer3Prop> = {}
  const layer4: Record<string, Layer4Prop> = {}
  const notLoaded: Record<string, number> = {}
  const l3 = (prop: string): Layer3Prop => (layer3[prop] ??= { raw: 0, parsed: 0, a: 0, crossProp: {}, bMarked: {}, d: { rawOnly: 0, parsedOnly: 0, rawNoHash: 0, samples: [] }, authorRules: {}, parsedOnlyRuntime: {} })
  const l4 = (prop: string): Layer4Prop => (layer4[prop] ??= { pairs: 0, identical: 0, runtimeOnly: 0, runtimeFields: {}, marked: 0, authorRule: 0, authorRules: {}, noSchema: 0, ambiguous: 0, ambiguousSamples: [], suspicious: {} })
  const dSample = (t: Layer3Prop, s: string) => { if (t.d.samples.length < SAMPLES) t.d.samples.push(s) }

  const parsedByKey = groupBy(parseds.filter((p) => p.hash !== null), (p) => `${p.prop}\u0000${p.hash}`)
  const parsedByHash = groupBy(parseds.filter((p) => p.hash !== null), (p) => p.hash!)
  const rawByKey = groupBy(raws.filter((r) => r.hash !== null), (r) => `${r.prop}\u0000${r.hash}`)
  const rawByHash = groupBy(raws.filter((r) => r.hash !== null), (r) => r.hash!)

  const pairUp = (prop: string, rawList: RawRecord[], parsedList: ParsedRecord[]) => {
    const t = l4(prop)
    t.pairs++
    if (rawList.length !== 1 || parsedList.length !== 1) {
      t.ambiguous++
      if (t.ambiguousSamples.length < SAMPLES) t.ambiguousSamples.push(`${rawList[0].hash} 原始×${rawList.length}（${[...new Set(rawList.map((r) => r.file))].join('、')}）解析×${parsedList.length}`)
      return
    }
    const r = comparePair(rawList[0].rec, parsedList[0].item, rawList[0].schema)
    if (r.kind === 'identical') t.identical++
    else if (r.kind === 'marked') t.marked++
    else if (r.kind === 'runtimeOnly') t.runtimeOnly++
    else if (r.kind === 'noSchema') t.noSchema++
    for (const f of r.runtime) t.runtimeFields[f] = (t.runtimeFields[f] ?? 0) + 1
    const left = r.diffs.filter((d) => {
      const rule = findRule(rules, { layer: 4, prop, match: d, codeSet, raw: rawList[0].rec, parsed: parsedList[0].item })
      if (rule) t.authorRules[rule.id] = (t.authorRules[rule.id] ?? 0) + 1
      return !rule
    })
    if (r.kind === 'suspicious' && !left.length) t.authorRule++
    for (const d of left) {
      const g = (t.suspicious[d] ??= { count: 0, samples: [] })
      g.count++
      if (g.samples.length < SAMPLES) g.samples.push(`${rawList[0].hash} (${rawList[0].file})`)
    }
  }

  // 原始这一侧
  for (const [prop, list] of groupBy(raws, (r) => r.prop)) {
    if (!loaderProps.has(prop) && !parsedProps.has(prop)) { notLoaded[prop] = list.length; continue }
    const t = l3(prop)
    t.raw += list.length
    const seen = new Set<string>()
    for (const r of list) {
      if (r.hash === null) { t.d.rawNoHash++; dSample(t, `无编号 ${label(r.rec)} (${r.file})`); continue }
      const same = parsedByKey.get(`${prop}\u0000${r.hash}`)
      if (same) {
        t.a++
        if (!seen.has(r.hash)) { seen.add(r.hash); pairUp(prop, rawByKey.get(`${prop}\u0000${r.hash}`)!, same) }
        continue
      }
      const other = parsedByHash.get(r.hash)?.filter((p) => p.prop !== prop && sameLoader(p.prop, prop) && p.item.name === r.rec.name)
      if (other?.length) {
        const k = `→${other[0].prop}`
        t.crossProp[k] = (t.crossProp[k] ?? 0) + 1
        if (!seen.has(r.hash)) { seen.add(r.hash); pairUp(`${prop}→${other[0].prop}`, rawByKey.get(`${prop}\u0000${r.hash}`)!, other) }
        continue
      }
      const marker = r.schema?.markers.find((m) => m in r.rec)
      if (marker) { t.bMarked[marker] = (t.bMarked[marker] ?? 0) + 1; continue }
      const rule = findRule(rules, { layer: 3, prop, match: 'rawOnly', codeSet, raw: r.rec })
      if (rule) { t.authorRules[rule.id] = (t.authorRules[rule.id] ?? 0) + 1; continue }
      t.d.rawOnly++
      dSample(t, `原始有解析无 ${r.hash} (${r.file})`)
    }
  }
  // 解析这一侧
  for (const [prop, list] of groupBy(parseds, (p) => p.prop)) {
    const t = l3(prop)
    t.parsed += list.length
    for (const p of list) {
      if (p.hash === null) continue // 无编号已在第 2 层报告（noHash）
      if (rawByKey.has(`${prop}\u0000${p.hash}`)) continue
      const other = rawByHash.get(p.hash)?.filter((r) => r.prop !== prop && sameLoader(r.prop, prop) && r.rec.name === p.item.name)
      if (other?.length) { const k = `←${other[0].prop}`; t.crossProp[k] = (t.crossProp[k] ?? 0) + 1; continue }
      const rule = findRule(rules, { layer: 3, prop, match: 'parsedOnly', codeSet, parsed: p.item })
      if (rule) { t.authorRules[rule.id] = (t.authorRules[rule.id] ?? 0) + 1; continue }
      t.d.parsedOnly++
      dSample(t, `解析有原始无 ${p.hash}`)
      const allowed = new Set(schema.byProp[prop]?.fields ?? [])
      for (const k of Object.keys(p.item)) if (!allowed.has(k)) t.parsedOnlyRuntime[k] = (t.parsedOnlyRuntime[k] ?? 0) + 1
    }
  }

  const sum = <T>(o: Record<string, T>, f: (t: T) => number) => Object.values(o).reduce((n, t) => n + f(t), 0)
  const totals = {
    raw: sum(layer3, (t) => t.raw),
    a: sum(layer3, (t) => t.a),
    crossProp: sum(layer3, (t) => Object.entries(t.crossProp).filter(([k]) => k.startsWith('→')).reduce((n, [, v]) => n + v, 0)),
    bMarked: sum(layer3, (t) => sum(t.bMarked, (n) => n)),
    authorRule3: sum(layer3, (t) => sum(t.authorRules, (n) => n)),
    dRaw: sum(layer3, (t) => t.d.rawOnly + t.d.rawNoHash),
    dParsed: sum(layer3, (t) => t.d.parsedOnly),
    pairs: sum(layer4, (t) => t.pairs),
    identical: sum(layer4, (t) => t.identical),
    runtimeOnly: sum(layer4, (t) => t.runtimeOnly),
    marked: sum(layer4, (t) => t.marked),
    authorRule4: sum(layer4, (t) => t.authorRule),
    noSchema: sum(layer4, (t) => t.noSchema),
    ambiguous: sum(layer4, (t) => t.ambiguous),
    suspicious: sum(layer4, (t) => t.pairs - t.identical - t.runtimeOnly - t.marked - t.authorRule - t.noSchema - t.ambiguous),
  }
  return { notLoaded, layer3, layer4, totals }
}
