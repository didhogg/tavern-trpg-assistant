// 数据格式登记（P5.5 A1/A3，原 P5.6a）：一套资料集（作者程序 cn / en）用哪种数据格式、怎么校验、怎么认出一个文件是不是这种格式。
// 体系的规则在 scopes.json 的 rules 里写 format，资料集在 sources.json 的 codeSets 里写 format；加一种格式 = 在这里登记一条。
// 不定义数据形状：校验用格式作者自己的结构定义，认文件只看作者结构定义规定的必填外壳。
import { loadBrewFields, loadFieldLabels, validateBrewJson, type BrewField, type BrewValidation, type FieldShape, type SchemaIssue } from './brew-validate'
import translated from './field-labels.json'
import { ruleScopes } from './scopes'
import { CODE_SETS } from './sources'

export interface FormatSource {
  json: string
  full: string
  abbreviation: string
}

export interface DataFormat {
  id: string
  /** 给人看的名字（报错里用）。 */
  name: string
  /** 整个文件的结构校验（格式作者的结构定义）。 */
  validate(input: string | unknown): Promise<BrewValidation>
  /** 单条条目的结构校验：套上 source 这个来源的外壳，只留这一条自己的错。 */
  validateEntry(prop: string, ent: Record<string, unknown>, source: FormatSource): Promise<SchemaIssue[]>
  /** 已解析的 JSON 是不是这种格式（只看作者规定的必填外壳，内容错误交给 validate）。 */
  recognize(json: unknown): boolean
  /**
   * 一类条目的顶层字段说明（类型、可选值、必填、作者原文说明、控件形状、中文名）+ 这一类能不能在条目上自带版本；不认识的类别 null。
   * defs：形状里 { ref } 指向的结构；labels：往下拆出来的小字段按名字查中文名（没有就显示英文原名）。
   */
  fields(prop: string): Promise<FieldTable | null>
}

export interface FieldTable {
  fields: BrewField[]
  edition: boolean
  defs: Record<string, FieldShape>
  labels: Record<string, string>
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * 5etools 自制格式：作者结构定义 homebrew.json 根部必填 _meta，_meta 里必填 sources（数组）。
 * 版本外壳 edition 也是必填，单条校验时套上 classic（只为过外壳，不代表这一条的版本；版本见 scopes 归类）。
 */
const FIVETOOLS: DataFormat = {
  id: '5etools',
  name: '5etools 自制格式',
  validate: (input) => validateBrewJson(input),
  async validateEntry(prop, ent, source) {
    const wrapper = {
      _meta: { sources: [{ json: source.json, abbreviation: source.abbreviation, full: source.full, authors: ['-'], convertedBy: ['-'], version: '1.0.0' }], dateAdded: 0, dateLastModified: 0, edition: 'classic' },
      [prop]: [{ source: source.json, ...ent }],
    }
    const issues = (await validateBrewJson(wrapper)).issues
    return issues.filter((i) => i.path.startsWith(`/${prop}/0`))
  },
  recognize: (json) => isObject(json) && isObject(json._meta) && Array.isArray(json._meta.sources),
  async fields(prop) {
    const [table, names] = await Promise.all([loadBrewFields(), loadFieldLabels()])
    const own = table.props[prop]
    if (!own) return null
    // 中文名：这一类作者编辑器里的 > 各编辑器一致的 / 作者界面词表 > 另由翻译补的（field-labels.json）；都没有就不给
    const labels: Record<string, string> = { ...(translated as Record<string, string>), ...names.shared }
    const mine = { ...labels, ...(names.byProp[prop] ?? {}) }
    return { ...own, fields: own.fields.map((f) => (mine[f.name] ? { ...f, label: mine[f.name] } : f)), defs: table.defs ?? {}, labels }
  },
}

const FORMATS: Record<string, DataFormat> = { [FIVETOOLS.id]: FIVETOOLS }

/**
 * 插件不支持、但认得出来的外来格式：拒收时说清楚是什么。
 * Foundry：导出的文档带 _stats.systemId（Foundry API DocumentStats：创建它的规则系统）。
 */
const FOREIGN: Array<(json: unknown) => string | null> = [
  (json) => {
    const docs = Array.isArray(json) ? json : [json]
    const system = docs.map((d) => (isObject(d) && isObject(d._stats) ? d._stats.systemId : null)).find((s) => typeof s === 'string' && s)
    return system ? `这是 Foundry VTT（规则系统 ${String(system)}）导出的数据` : null
  },
]

export function getFormat(id: string): DataFormat {
  const f = FORMATS[id]
  if (!f) throw new Error(`没有登记这种数据格式：${id}`)
  return f
}

/** 一套资料集（作者程序）用的数据格式。 */
export function formatOfCodeSet(codeSet: string): DataFormat {
  const id = CODE_SETS[codeSet]?.format
  if (!id) throw new Error(`资料集 ${codeSet} 没有登记数据格式`)
  return getFormat(id)
}

/** 战役的数据格式：规则要的格式和战役选的资料集必须一致，不一致直接报错（不拿别的格式的校验器去凑）。 */
export function formatOfCampaign(c: { rule: string; codeSet: string }): DataFormat {
  const want = ruleScopes(c.rule).format
  const have = formatOfCodeSet(c.codeSet)
  if (have.id !== want) throw new Error(`规则 ${c.rule} 的资料是 ${want} 格式，资料集 ${c.codeSet} 是 ${have.id} 格式，不能混用`)
  return have
}

export type Recognition = { ok: true } | { ok: false; reason: string }

/**
 * 导入前认文件（A3）：不是合法 JSON 的放行（交给作者，作者会列进"不是 JSON"）；
 * 是 JSON 但不是这种格式的拒收，能认出是什么外来格式就说出来。
 */
export function recognizeText(format: DataFormat, text: string): Recognition {
  let json: unknown
  try { json = JSON.parse(text) } catch { return { ok: true } }
  if (format.recognize(json)) return { ok: true }
  const foreign = FOREIGN.map((f) => f(json)).find(Boolean)
  return { ok: false, reason: `${foreign ?? '不是认得的数据格式'}；这里只收${format.name}（需要 _meta.sources）` }
}

/** 把一批文件分成"收"和"拒收（带原因）"。 */
export function splitRecognized<T extends { name: string; text: string }>(format: DataFormat, files: T[]): { accepted: T[]; rejected: Array<{ name: string; reason: string }> } {
  const accepted: T[] = []
  const rejected: Array<{ name: string; reason: string }> = []
  for (const f of files) {
    const r = recognizeText(format, f.text)
    if (r.ok) accepted.push(f)
    else rejected.push({ name: f.name, reason: r.reason })
  }
  return { accepted, rejected }
}
