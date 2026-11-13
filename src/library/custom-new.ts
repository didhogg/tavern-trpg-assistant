// P5.5 B5 / B6 新建条目：能新建哪些类型、每类有哪几种起点、空白条目、作者模板、文字转条目。
// 类型、中文名、分组、构建器、转换器都从作者代码读（小窗 entry-types-commands.ts）；这里只按这套资料集的结构定义再筛一遍，
// 并按库里现有条目算「能不能从已有条目开始」。不写类型名单。
import type { BrewField } from './brew-validate'
import { distinctNames, entryKinds, NOT_CREATABLE, type EntryKind } from './entry-kinds'
import { formatOfCodeSet } from './formats'
import type { AuthorFrame } from './runtime/host'
import type { ConvertMode, ConverterInfo, EntryTypeInfo } from './runtime/frame/entry-types-commands'
import { SOURCES } from './sources'

export type { ConvertMode, ConverterInfo }

export interface NewEntryDeps {
  frame: (codeSet: string) => Promise<AuthorFrame>
  /** 一个数据集里每类有几条（LibraryService.categories）；没装的数据集抛错。 */
  categories: (setId: string) => Promise<Record<string, number>>
}

export interface EntryType extends Omit<EntryTypeInfo, 'builder' | 'converters'> {
  /** 主条目 / 从属（在 parent 里编辑）/ 背景介绍与图片（在 parent 里编辑）。§16.10 1d，entry-kinds.ts */
  kind: EntryKind
  parent: string | null
  /** 新建这一类可以从哪里开始。 */
  starts: {
    /** 空白：按结构定义只预先填好必填项（总有）。 */
    blank: true
    /** 作者模板（作者有这一类的构建器）。 */
    template: boolean
    /** 从已有条目开始：库里（官方 + 自制）这一类现有几条，0 = 没有可复制的。 */
    existing: number
    /** 文字转条目：作者能转成这一类的转换器编号（空 = 没有）。 */
    convert: string[]
    /** 粘贴 JSON（总有）。 */
    json: true
  }
}

/** 能新建的类型：作者认为能单独打开的条目，且这套资料集的结构定义收这一类（有字段表）。顺序照作者。 */
export async function entryTypes(d: NewEntryDeps, codeSet: string): Promise<EntryType[]> {
  const format = formatOfCodeSet(codeSet)
  const types: EntryTypeInfo[] = await (await d.frame(codeSet)).call('entryTypes')
  const counts: Record<string, number> = {}
  for (const s of SOURCES.filter((x) => x.codeSet === codeSet)) {
    let c: Record<string, number>
    try { c = await d.categories(s.id) } catch { continue } // 这个数据集还没装
    for (const [prop, n] of Object.entries(c)) counts[prop] = (counts[prop] ?? 0) + n
  }
  const kept: Array<EntryTypeInfo & { required: string[] }> = []
  for (const t of types) {
    if (NOT_CREATABLE.has(t.prop)) continue
    const table = await format.fields(t.prop)
    if (table) kept.push({ ...t, required: table.fields.filter((f) => f.required).map((f) => f.name) })
  }
  const kinds = entryKinds(kept.map((t) => t.prop), (p) => kept.find((t) => t.prop === p)?.required ?? [])
  const out: EntryType[] = kept.map((t) => ({ prop: t.prop, name: t.name, group: t.group, ...(kinds.get(t.prop) ?? { kind: 'main' as const, parent: null }), starts: { blank: true, template: t.builder, existing: counts[t.prop] ?? 0, convert: t.converters, json: true } }))
  // 作者中文名重名的补另一种语言的名字（另一种语言的小窗没装 / 打不开就用类别编号）
  const otherNames = await otherLanguageNames(d, codeSet)
  return distinctNames(out, (p) => otherNames.get(p))
}

async function otherLanguageNames(d: NewEntryDeps, codeSet: string): Promise<Map<string, string>> {
  const other = SOURCES.find((s) => s.kind === 'official' && s.codeSet !== codeSet)?.codeSet
  if (!other) return new Map()
  try {
    const list: EntryTypeInfo[] = await (await d.frame(other)).call('entryTypes')
    return new Map(list.map((t) => [t.prop, t.name]))
  } catch (e) {
    console.debug('[trpg-assistant] 另一种语言的类型名没取到，重名的用类别编号区分', e)
    return new Map()
  }
}

/** 一个字段的空值：有可选值的取第一个，否则按结构定义里的第一种类型给空值。 */
function emptyOf(f: BrewField): unknown {
  if (f.enum?.length) return f.enum[0]
  switch (f.types[0]) {
    case 'string': return ''
    case 'integer':
    case 'number': return 0
    case 'boolean': return false
    case 'array': return []
    case 'object': return {}
    default: return null
  }
}

/**
 * 空白条目（B6）：按结构定义只放必填字段，值是空值（来源由保存时的包决定，不放）。
 * 结构定义不收这一类 → null。保存前用户要把必填项填好，结构检查会指出没填对的。
 */
export async function blankEntry(codeSet: string, prop: string): Promise<Record<string, unknown> | null> {
  const t = await formatOfCodeSet(codeSet).fields(prop)
  if (!t) return null
  return Object.fromEntries(t.fields.filter((f) => f.required && f.name !== 'source').map((f) => [f.name, emptyOf(f)]))
}
