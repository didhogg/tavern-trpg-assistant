// 引擎登记表里哪些值是“名字”（名字表 people.glossary 用）。按 dnd5e 自己的约定分三种，不靠猜（驾驶员 2026-11-23 自查）：
//   ① 开机时这一格存的就是语言键（dnd5e 在 i18nInit 才把登记过的表就地翻译，翻译前存的是键）→ 名字，真实键在前；
//   ② 这一格是带 label / name 字段的对象（dnd5e 约定这两个字段是显示名；i18nInit 里才拼出来的表，如施法进度，也是这种）
//      → 名字，用英文原文精确比对（区分大小写）找语言键；
//   ③ 只是一个字符串、开机时也不是语言键 → 编号（defaultAbilities 的 "str"、weaponProficienciesMap 的 "mar"、"melee"…），不收。
// 旧做法拿翻译后的文字不分大小写反查语言键，"mar" 反查成了日历的“三月”缩写。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方配置对象没有类型声明 */
import type { FrameText } from '../shown'

const g = globalThis as any

/** 开机时（main.ts 的 init 钩子，排在 dnd5e 自己的 init 之后、i18nInit 之前）各表、各状态这一格的原值。 */
let captured: { tables: Record<string, Record<string, string>>; statuses: Record<string, string> } | null = null

const nameField = (v: any): string | null => typeof v?.label === 'string' ? v.label : typeof v?.name === 'string' ? v.name : null

/** 一张表里每个编号的格子：[编号, 值]（字符串本身，或对象），children 一层层往下。 */
function cells(table: any, out: Array<[string, any]> = []): Array<[string, any]> {
  if (!table || typeof table !== 'object' || Array.isArray(table)) return out
  for (const [code, v] of Object.entries(table) as Array<[string, any]>) {
    out.push([code, v])
    if (v?.children) cells(v.children, out)
  }
  return out
}

export function captureRegistryKeys(): void {
  const raw = (v: any): string | null => typeof v === 'string' ? v : nameField(v)
  const tables = Object.fromEntries(Object.entries(g.CONFIG.DND5E ?? {}).map(([name, t]) => [name,
    Object.fromEntries(cells(t).flatMap(([code, v]) => { const r = raw(v); return r ? [[code, r]] : [] }))]))
  const statuses = Object.fromEntries((g.CONFIG.statusEffects ?? []).filter((s: any) => typeof s?.name === 'string').map((s: any) => [s.id, s.name]))
  captured = { tables, statuses }
}

export const registryCaptured = (): boolean => captured !== null

let exactIndex: { i18n: object; byText: Map<string, string[]> } | null = null
/** 已加载语言字典里显示文字（区分大小写）完全相同的语言键。 */
function keysOfText(text: string): string[] {
  const i18n = g.game.i18n
  let index = exactIndex
  if (!index || index.i18n !== i18n) {
    const byText = new Map<string, string[]>()
    const walk = (node: any, path: string[]): void => {
      for (const [k, v] of Object.entries(node ?? {})) {
        if (typeof v === 'string') byText.set(v, [...(byText.get(v) ?? []), [...path, k].join('.')])
        else if (v && typeof v === 'object') walk(v, [...path, k])
      }
    }
    walk(i18n.translations, [])
    index = exactIndex = { i18n, byText }
  }
  return (index.byText.get(text) ?? []).filter((k) => i18n.has(k))
}

/** 名字 → 标好来路的语言键：给定的真实键在前，显示文字相同的其他键依次作退路（本战役语言包缺哪个退哪个）。 */
export function nameText(text: string, own: string | null): FrameText | null {
  const keys = [...new Set([...(own && g.game.i18n.has(own) ? [own] : []), ...keysOfText(text)])]
  return keys.reduceRight<FrameText | null>((fallback, key) => ({ $t: 'system', key, text, ...(fallback ? { fallback } : {}) }), null)
}

/** 运行时最终的一张表：编号 → 名字（按上面三种情况判断）。 */
export function tableNames(name: string, table: any): Record<string, FrameText> {
  const out: Record<string, FrameText> = {}
  for (const [code, v] of cells(table)) {
    const before = captured?.tables[name]?.[code] ?? null
    const own = before && g.game.i18n.has(before) ? before : null
    const raw = typeof v === 'string' ? v : nameField(v)
    if (!raw || (!own && typeof v === 'string')) continue
    // 有真实键时显示文字取它的翻译（有些表运行时一直存着键本身，没被就地翻译）
    const t = nameText(own ? g.game.i18n.localize(own) : raw, own)
    if (t) out[code] = t
  }
  return out
}

/** 开机时记下的状态原值（状态名的真实键）。 */
export const statusKey = (id: string): string | null => captured?.statuses[id] ?? null
