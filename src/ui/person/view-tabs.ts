// P6-R 法术位 / 效果 / 背景页从官方显示数据里取要显示的东西（行动 / 背包 / 法术 / 特性的表格见 table/rows.ts）：只取字段、不算数（view.ts 的延续）。
// 分组、组名、每行的说明文字都是 dnd5e 官方角色表准备好的（过唯一中文出口）；写入只写字段，见各页。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明，界面只读字段 */
import type { PersonSheet } from '../../stores/person'

const parts = (s: PersonSheet): Record<string, any> => s.view?.parts ?? {}
const list = <T>(v: unknown): T[] => Array.isArray(v) ? v as T[] : v && typeof v === 'object' ? Object.values(v) as T[] : []

// ---- 法术 ----
/** 法术位：某一环现在剩几个（读数）。 */
export const slotValue = (s: PersonSheet, slot: string): number => Number(s.system.spells?.[slot]?.value ?? 0)

// ---- 效果 ----
export interface EffectRow { id: string; parentId: string | null; name: string; source: string; duration: string; disabled: boolean; toggleable: boolean }
/** 效果分组（官方 effects 部分）；持续只在官方 showDuration 时显示（官方表同样按它决定显示不显示）。 */
export function effectGroups(s: PersonSheet): Array<{ key: string; label: string; info: string; rows: EffectRow[] }> {
  return Object.entries(parts(s).effects?.effects ?? {}).filter(([, c]: [string, any]) => !c.hidden).map(([key, c]: [string, any]) => ({
    key, label: String(c.label ?? ''), info: String(c.info ?? ''),
    rows: list<any>(c.effects).map((e) => ({
      id: String(e.id), parentId: e.parentId ?? null, name: String(e.name ?? ''), source: String(e.source?.name ?? e.source ?? ''),
      duration: e.showDuration === false ? '' : String(e.duration?.label ?? e.duration?.remaining ?? ''), disabled: !!e.disabled, toggleable: e.toggleable !== false,
    })),
  }))
}
export function conditions(s: PersonSheet): Array<{ id: string; name: string; on: boolean; level: number | null; ref: string }> {
  return list<any>(parts(s).effects?.conditions).map((c) => ({ id: String(c.id), name: String(c.name ?? ''), on: c.level !== undefined ? Number(c.level) > 0 : !c.disabled, level: c.level !== undefined ? Number(c.level) : null, ref: String(c.reference ?? '') }))
}

// ---- 背景 ----
/** 人物特征（官方传记页给的那几项：阵营、瞳色、身高……）。 */
export const characteristics = (s: PersonSheet): Array<{ path: string; label: string; value: string }> =>
  list<any>(parts(s).biography?.characteristics).map((c) => ({ path: String(c.name), label: String(c.label ?? ''), value: String(c.value ?? '') }))

// ---- 构建（职业 · 子职业 · 种族 · 背景；照 dnd5e 官方 actor-classes 与 Tidy5e CharacterTraits）----
/** 一个职业：等级、官方给的“可改到几级”（差几级）、子职业或“该选子职业了”（官方 needsSubclass）。 */
export interface ClassBuild { id: string; name: string; source: string; levels: number; ref?: unknown; levelsMenu: Array<{ delta: number; disabled: boolean }>; subclass: { id: string; name: string; ref?: unknown } | null; needsSubclass: boolean }
const shownItemName = (s: PersonSheet, id: string): string | undefined => (s as any).shown?.items?.find?.((x: any) => x.id === id)?.name
const shownItemRef = (s: PersonSheet, id: string): unknown => (s as any).shown?.items?.find?.((x: any) => x.id === id)?.ref
export function classBuilds(s: PersonSheet): ClassBuild[] {
  const ic: Record<string, any> = s.view?.base?.itemContext ?? {}
  const subsShown = list<any>(s.view?.base?.itemCategories?.subclasses)
  const raw = (id: string): any => (s.items ?? []).find((i: any) => i.id === id)
  return list<any>(s.view?.base?.itemCategories?.classes).map((c) => {
    const it = raw(c.id)
    const sub = (s.items ?? []).find((x: any) => x.type === 'subclass' && x.system?.classIdentifier === it?.system?.identifier)
    const subShown = sub ? subsShown.find((x) => x.id === sub.id) : null
    return {
      id: String(c.id), name: String(c.name ?? ''), source: String(it?.flags?.plutonium?.source ?? it?.system?.source?.book ?? ''), levels: Number(it?.system?.levels ?? 0), ref: c.ref,
      levelsMenu: list<any>(ic[c.id]?.availableLevels).map((o) => ({ delta: Number(o.value ?? 0), disabled: !!o.disabled })),
      // 子职业名和别的条目同一个出口（人物页统一取好的名字）；官方子职业分组没给就不用它
      subclass: sub ? { id: String(sub.id), name: String(subShown?.name ?? shownItemName(s, String(sub.id)) ?? sub.name ?? ''), ref: subShown?.ref ?? shownItemRef(s, String(sub.id)) } : null,
      needsSubclass: !!ic[c.id]?.needsSubclass || !!parts(s).features?.classes?.find?.((x: any) => x.id === c.id)?.needsSubclass,
    }
  }).sort((a, b) => b.levels - a.levels)
}
/** 种族 / 背景这件条目在人物身上的编号（换、删要用）。 */
export const originId = (s: PersonSheet, type: 'race' | 'background'): string | null => (s.items ?? []).find((i: any) => i.type === type)?.id ?? null
