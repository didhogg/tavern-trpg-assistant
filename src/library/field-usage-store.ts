// P5.5 §16.10 1a：官方用法统计的入口（按资料版本缓存）。官方没装 → null（同 OfficialMissingError 的口径）。
// 条目来源：作者解析结果（service.parsed）；作者加载器并进别的类的（基础物品 / 魔法物品变体 / 物品分组并进物品，子种族并进种族）
// 解析结果里没有自己的条目，改读作者原文件（小窗 rawProp：作者 DataUtil.<类别>.loadRawJSON）。
import type { BrewField } from './brew-validate'
import { resolve } from './field-shape-core'
import { formatOfCodeSet } from './formats'
import { fieldUsage, ownItems, type FieldUsage } from './field-usage'
import { emptyIfMissing } from './official-missing'
import type { LibraryService } from './service'
import { SOURCES } from './sources'

/** 统计结果格式变了就换版本号，旧缓存自动作废。 */
const FINGERPRINT = 'usage-v1'

export type UsageDeps = Pick<LibraryService, 'currentView' | 'parsed' | 'frameOf'>

export async function usageOf(lib: UsageDeps, codeSet: string, prop: string): Promise<FieldUsage | null> {
  const set = SOURCES.find((s) => s.kind === 'official' && s.codeSet === codeSet)
  const table = await formatOfCodeSet(codeSet).fields(prop)
  if (!set || !table) return null
  const view = await lib.currentView()
  const key = `usage:${set.id}:${prop}`
  const hit = await view.derivedGet(key)
  if (hit && hit.fingerprint === FINGERPRINT) return hit.value as FieldUsage
  const got = await emptyIfMissing(async () => {
    let items: unknown[] = []
    try { items = (await lib.parsed(set.id, prop, view)).items } catch (e) { console.debug(`[trpg-assistant] ${prop} 没有作者解析结果，改读作者原文件`, e) }
    if (!items.length) items = ((await (await lib.frameOf(codeSet, view)).call('rawProp', prop)) as unknown[] | null) ?? []
    return [fieldUsage(ownItems(items), table.fields, table.defs ?? {})]
  })
  const usage = got[0] ?? null
  if (usage) await view.derivedPut(key, FINGERPRINT, usage)
  return usage
}

/** 自动字段（§16.10 1b）：作者打标签程序能从条目别的内容原样写回来的字段。表单不显示，保存时由后端跑作者打标签程序写。 */
export interface AutoFields {
  /** 判定为自动的字段。 */
  auto: string[]
  /** 实测用到的作者打标签调用（作者没有这一类的转换器 = 空，这一类没有自动字段）。 */
  calls: string[]
  /** 每个字段：试了几次、写回来几次。 */
  detail: Record<string, { tried: number; back: number }>
}

const AUTO_FINGERPRINT = 'auto-v4'
/** 抽几条官方条目实测；至少试过几次、多大比例写回来才算自动。 */
const SAMPLES = 30
const MIN_TRIED = 3
const MIN_SHARE = 0.8

/**
 * 作者打标签程序按英文原文找（"fire damage" → 火焰伤害标签），中文条目里找不到，所以固定用英文官方条目实测，
 * 各语言共用这一份（字段是同一套结构定义）。英文没装 → 用这一种语言自己的条目测（会认得偏少）。
 * 只认一串代号 / 文字或单个值的字段：打标签程序也会从正文读出熟练、抗性（列表套对象），那些是人填的结构化数据，不算。
 */
export async function autoFieldsOf(lib: UsageDeps & Pick<LibraryService, 'officialInstalled'>, codeSet: string, prop: string): Promise<AutoFields | null> {
  const english = 'en'
  if (codeSet !== english && (await lib.officialInstalled(english).catch(() => false))) return autoFieldsIn(lib, english, prop)
  return autoFieldsIn(lib, codeSet, prop)
}

async function autoFieldsIn(lib: UsageDeps, codeSet: string, prop: string): Promise<AutoFields | null> {
  const set = SOURCES.find((s) => s.kind === 'official' && s.codeSet === codeSet)
  const table = await formatOfCodeSet(codeSet).fields(prop)
  if (!set || !table) return null
  const view = await lib.currentView()
  const key = `autofields:${set.id}:${prop}`
  const hit = await view.derivedGet(key)
  if (hit && hit.fingerprint === AUTO_FINGERPRINT) return hit.value as AutoFields
  const got = await emptyIfMissing(async () => {
    let items: unknown[] = []
    try { items = (await lib.parsed(set.id, prop, view)).items } catch (e) { console.debug(`[trpg-assistant] ${prop} 没有作者解析结果，自动字段没法实测`, e) }
    const own = ownItems(items)
    // 均匀抽样（不只取前几条，前几条常是同一本书）
    const step = Math.max(1, Math.floor(own.length / SAMPLES))
    const samples = own.filter((_, i) => i % step === 0).slice(0, SAMPLES)
    // 候选：一串代号 / 文字（多选、列表里是文字或选项），或单个开关 / 选项 / 文字；列表套对象的（熟练、抗性）是人填的结构化数据，不算
    const SCALAR = new Set(['switch', 'const', 'select', 'text'])
    const codes = (f: BrewField) => {
      if (!f.shape) return false
      const s = resolve(f.shape, table.defs ?? {})
      if (s.c === 'multiselect' || SCALAR.has(s.c)) return true
      return s.c === 'list' && SCALAR.has(resolve(s.of, table.defs ?? {}).c)
    }
    const fields = table.fields.filter((f) => !f.internal && !f.publish && !f.required && codes(f)).map((f) => f.name)
    const r = (await (await lib.frameOf(codeSet, view)).call('autoFieldProbe', prop, samples, fields)) as { calls: string[]; fields: AutoFields['detail'] }
    const detail = r.fields
    return [{ calls: r.calls, detail, auto: Object.entries(detail).filter(([, d]) => d.tried >= MIN_TRIED && d.back / d.tried >= MIN_SHARE).map(([f]) => f).sort() }]
  })
  const out = got[0] ?? null
  if (out) await view.derivedPut(key, AUTO_FINGERPRINT, out)
  return out
}
