// 自制 JSON 结构校验（P5 B-12）：用作者的自制结构定义（vendor/brew-schema，随构建预编译成独立校验器，不用 eval）。
// 作者运行时本身不校验（结构定义在独立的包里，给作者的编辑器和测试脚本用）；这里补上，错误带"路径 + 说明 + 行列"。
// 校验器很大（压缩后约 7 MB），所以第一次用时才加载，之后复用。
import { parse } from 'json-source-map'
import type { ErrorObject } from 'ajv'

export interface SchemaIssue {
  /** 出错位置，JSON 指针写法，例如 `/spell/3/level`；根是空串。 */
  path: string
  /** ajv 的关键字（required / type / enum / additionalProperties / pattern …）。 */
  keyword: string
  /** 中文说明（常见关键字翻成中文，其余用 ajv 原话）。 */
  text: string
  /** ajv 原话，供对照。 */
  message: string
  /** 在原文里的位置（从 1 开始）；没有原文（传的是对象）时为 null。 */
  line: number | null
  column: number | null
}

export interface BrewValidation {
  ok: boolean
  /** 照作者测试器的做法挑出的"最可能的原因"：先按位置深浅排，超过 5 条只留最深的那条。 */
  issues: SchemaIssue[]
  /** ajv 一共报了多少条（oneOf / anyOf 会一次报很多）。 */
  total: number
}

type Validator = ((data: unknown) => boolean) & { errors?: ErrorObject[] | null }

/**
 * 预编译好的校验器（vendor/brew-schema/validator.js，tools/build-brew-validator.mjs 生成）放在插件目录里，
 * 第一次用时按网址加载；插件根目录由接线处（core/backend）告诉本模块。
 */
let pluginRoot: URL | null = null
let loading: Promise<Validator> | null = null
export function configureBrewValidator(root: URL): void {
  if (pluginRoot?.href !== root.href) { loading = null; loadingFields = null }
  pluginRoot = root
}
/** 一类条目的一个顶层字段（tools/build-brew-fields.mjs 从作者结构定义生成；说明是作者原文）。 */
export interface BrewField {
  name: string
  types: string[]
  required: boolean
  enum?: unknown[]
  itemEnum?: unknown[]
  itemTypes?: string[]
  description?: string
  /** 该画成什么控件（P5.5 阶段 C，tools/brew-schema-walk.mjs）；内部字段没有。 */
  shape?: FieldShape
  /** Foundry / Roll20 专用字段：表单不显示。 */
  internal?: boolean
  /** 中文名（作者中文版的；没有就不给，界面显示英文原名）。fields() 填。 */
  label?: string
}
/**
 * 控件形状：text / number / switch / select（enum）/ multiselect（enum）/ list（of）/ group（props）/ map（of）/
 * pick（几种写法任选，by = 用来区分的共同字段）/ entries（作者正文）/ const / json（表单里画不了，提示到 JSON 里改，why = 原因）。
 * { ref } 指向 defs 里同一个结构（同一个 $ref 只拆一次）。
 */
export type FieldShape =
  | { ref: string }
  | { c: 'text' | 'switch' | 'entries'; description?: string }
  | { c: 'number'; integer?: boolean; description?: string }
  | { c: 'select' | 'multiselect'; enum: unknown[]; description?: string }
  | { c: 'const'; value: unknown; description?: string }
  | { c: 'list' | 'map'; of: FieldShape; description?: string }
  | { c: 'group'; props: Array<{ name: string; required: boolean; shape: FieldShape }>; description?: string }
  | { c: 'pick'; by?: string; branches: Array<{ shape: FieldShape; keys: string[] }>; description?: string }
  | { c: 'json'; why: string; description?: string }
export interface BrewFieldTable {
  generatedFrom: string
  props: Record<string, { fields: BrewField[]; edition: boolean }>
  defs?: Record<string, FieldShape>
}
export interface FieldLabelTable {
  generatedFrom: string
  byProp: Record<string, Record<string, string>>
  shared: Record<string, string>
}
let loadingFields: Promise<BrewFieldTable> | null = null
/** 字段说明表（vendor/brew-schema/fields.js），第一次用时按网址加载，之后复用。插件目录同校验器。 */
export const loadBrewFields = (): Promise<BrewFieldTable> => {
  if (!pluginRoot) return Promise.reject(new Error('字段说明表还没有告诉它插件目录（configureBrewValidator）'))
  const url = new URL('vendor/brew-schema/fields.js', pluginRoot).href
  return (loadingFields ||= import(/* @vite-ignore */ url).then((m: { default: BrewFieldTable }) => m.default, (error: unknown) => { loadingFields = null; throw error }))
}

let loadingLabels: Promise<FieldLabelTable> | null = null
/** 字段中文名表（vendor/brew-schema/field-labels.js，作者中文版自动取），加载办法同字段说明表。 */
export const loadFieldLabels = (): Promise<FieldLabelTable> => {
  if (!pluginRoot) return Promise.reject(new Error('字段中文名表还没有告诉它插件目录（configureBrewValidator）'))
  const url = new URL('vendor/brew-schema/field-labels.js', pluginRoot).href
  return (loadingLabels ||= import(/* @vite-ignore */ url).then((m: { default: FieldLabelTable }) => m.default, (error: unknown) => { loadingLabels = null; throw error }))
}

const loadValidator = (): Promise<Validator> => {
  if (!pluginRoot) return Promise.reject(new Error('结构校验器还没有告诉它插件目录（configureBrewValidator）'))
  const url = new URL('vendor/brew-schema/validator.js', pluginRoot).href
  return (loading ||= import(/* @vite-ignore */ url).then((m: { validateBrew: Validator }) => m.validateBrew, (error: unknown) => { loading = null; throw error }))
}

const list = (xs: unknown): string => (Array.isArray(xs) ? xs.map(String).join('、') : String(xs))

/** 常见的几种错误翻成中文；别的保留 ajv 原话。 */
export function describeError(e: Pick<ErrorObject, 'keyword' | 'params' | 'message'>): string {
  const p = e.params as Record<string, unknown>
  switch (e.keyword) {
    case 'required': return `缺少必填项「${String(p.missingProperty)}」`
    case 'additionalProperties': return `多出不认识的属性「${String(p.additionalProperty)}」`
    case 'unevaluatedProperties': return `多出不认识的属性「${String(p.unevaluatedProperty)}」`
    case 'type': return `类型应为 ${list(p.type)}`
    case 'enum': return `只能是这几个值之一：${list(p.allowedValues)}`
    case 'const': return `只能是 ${JSON.stringify(p.allowedValue)}`
    case 'pattern': return `格式不对（要符合 ${String(p.pattern)}）`
    case 'minItems': return `至少要有 ${String(p.limit)} 项`
    case 'maxItems': return `最多 ${String(p.limit)} 项`
    case 'uniqueItems': return `不能有重复项（第 ${String(p.j)} 项与第 ${String(p.i)} 项相同）`
    case 'minimum': return `不能小于 ${String(p.limit)}`
    case 'maximum': return `不能大于 ${String(p.limit)}`
    case 'minLength': return `至少 ${String(p.limit)} 个字符`
    case 'format': return `格式应为 ${String(p.format)}`
    case 'oneOf': case 'anyOf': return `不符合任何一种允许的写法（${e.message ?? e.keyword}）`
    default: return e.message ?? e.keyword
  }
}

type Pointers = Record<string, { value: { line: number; column: number }; key?: { line: number; column: number } }>

/** 条目错误取"最近的、有位置的那一层"（路径里的具体位置不在原文时往上找）。 */
function locate(pointers: Pointers | null, path: string): { line: number | null; column: number | null } {
  if (!pointers) return { line: null, column: null }
  let p = path
  for (;;) {
    const hit = pointers[p]
    if (hit) { const at = hit.key ?? hit.value; return { line: at.line + 1, column: at.column + 1 } }
    const cut = p.lastIndexOf('/')
    if (cut < 0) return { line: null, column: null }
    p = p.slice(0, cut)
  }
}

/**
 * 作者的条目结构是"完整条目 或 _copy 加改动"二选一，ajv 会把"缺 _copy"和"不符合任何一种写法"也报出来，只会盖住真正的问题。
 * 有别的错误时去掉这两类（总数 total 仍按 ajv 原始条数）。
 */
function withoutNoise(errors: ErrorObject[]): ErrorObject[] {
  const real = errors.filter((e) => e.keyword !== 'anyOf' && e.keyword !== 'oneOf' && !(e.keyword === 'required' && (e.params as { missingProperty?: string }).missingProperty === '_copy'))
  return real.length ? real : errors
}

/** 校验一份自制：传 JSON 原文（错误带行列），或已解析好的对象。原文不是 JSON 时返回一条"不是 JSON"。 */
export async function validateBrewJson(input: string | unknown): Promise<BrewValidation> {
  let data: unknown
  let pointers: Pointers | null = null
  if (typeof input === 'string') {
    try {
      const parsed = parse(input)
      data = parsed.data
      pointers = parsed.pointers as Pointers
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const at = /position (\d+)/.exec(message)
      const before = at ? input.slice(0, Number(at[1])) : ''
      return { ok: false, total: 1, issues: [{ path: '', keyword: 'parse', text: `不是合法的 JSON：${message}`, message, line: at ? before.split('\n').length : null, column: at ? before.length - before.lastIndexOf('\n') : null }] }
    }
  } else data = input
  const validate = await loadValidator()
  if (validate(data)) return { ok: true, issues: [], total: 0 }
  const raw = [...(validate.errors ?? [])].sort((a, b) => a.instancePath.length - b.instancePath.length)
  const all = withoutNoise(raw)
  const kept = all.length > 5 ? all.slice(-1) : all
  return {
    ok: false,
    total: raw.length,
    issues: kept.map((e) => ({ path: e.instancePath, keyword: e.keyword, text: describeError(e), message: e.message ?? e.keyword, ...locate(pointers, e.instancePath) })),
  }
}
