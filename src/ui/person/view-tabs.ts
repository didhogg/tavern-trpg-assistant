// P6-R 法术 / 特性 / 效果 / 背景页从官方显示数据里取要显示的东西：只取字段、不算数（view.ts 的延续）。
// 分组、组名、每行的说明文字都是 dnd5e 官方角色表准备好的（过唯一中文出口）；写入只写字段，见各页。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明，界面只读字段 */
import type { Glossary } from '../../rules/kernel/people'
import type { PersonSheet } from '../../stores/person'
import { named, signed, type Pip } from './view'

const parts = (s: PersonSheet): Record<string, any> => s.view?.parts ?? {}
const list = <T>(v: unknown): T[] => Array.isArray(v) ? v as T[] : v && typeof v === 'object' ? Object.values(v) as T[] : []
const ic = (s: PersonSheet): Record<string, any> => s.view?.base?.itemContext ?? {}
const raw = (s: PersonSheet, id: string): any => (s.items ?? []).find((i: any) => i.id === id)

export interface Count { value: number; max: number }
const countOf = (c: any): Count | null => { const max = Number(c?.uses?.max); return c?.uses?.hasUses && !c?.uses?.hasRecharge && max > 0 ? { value: Number(c.uses.value ?? 0), max } : null }
const rollOf = (c: any, g: Glossary | null): string => c?.toHit !== null && c?.toHit !== undefined ? signed(c.toHit) : c?.save?.ability ? `DC ${c.save.dc?.value ?? ''} ${named(g, 'abilities', c.save.ability)}` : ''
const damagesOf = (it: any): string[] => list<any>(it?.labels?.damages).map((d) => String(d.label ?? d.formula ?? '')).filter(Boolean)

// ---- 法术 ----
export interface SpellRow { id: string; name: string; ref?: unknown; subtitle: string; time: string; range: string; roll: string; effects: string[]; count: Count | null; prepared: { on: boolean; title: string; locked: boolean } | null }
export interface SpellSection { key: string; label: string; slot: string | null; pips: Pip[]; rows: SpellRow[] }
export interface Casting { label: string; ability: string; attack: string; save: string; prepared: string }
export function spellbook(s: PersonSheet, g: Glossary | null): { casting: Casting[]; sections: SpellSection[] } {
  const p = parts(s).spells ?? {}
  const casting = list<any>(p.spellcasting).map((c) => ({
    label: String(c.label ?? ''), ability: named(g, 'abilities', c.ability?.ability ?? ''),
    attack: signed(c.attack), save: c.save !== undefined ? String(c.save) : '',
    prepared: c.preparation?.max ? `${c.preparation.value ?? 0} / ${c.preparation.max}` : '',
  }))
  const sections = list<any>(p.sections).map((sec, i) => ({
    key: String(sec.slot ?? `${sec.id}-${i}`), label: String(sec.label ?? ''), slot: sec.usesSlots ? String(sec.slot) : null, pips: list<Pip>(sec.pips),
    rows: list<any>(sec.items).map((it) => {
      const c = ic(s)[it.id] ?? {}
      const range = c.range?.distance ? `${c.range.value} ${c.range.unit ?? ''}`.trim() : String(it.labels?.range ?? '')
      return {
        id: String(it.id), name: String(it.name ?? ''), ref: it.ref, subtitle: String(c.subtitle ?? ''), time: String(it.labels?.activation || c.activation || ''), range,
        roll: rollOf(c, g), effects: damagesOf(it), count: countOf(c),
        prepared: c.preparation?.applicable ? { on: c.preparation.cls === 'active', title: String(c.preparation.title ?? ''), locked: !!c.preparation.disabled } : null,
      }
    }),
  }))
  return { casting, sections }
}
/** 法术位：某一环现在剩几个（读数）。 */
export const slotValue = (s: PersonSheet, slot: string): number => Number(s.system.spells?.[slot]?.value ?? 0)

// ---- 特性 ----
export interface FeatureRow { id: string; name: string; ref?: unknown; subtitle: string; count: Count | null; recovery: string; recharge: string }
export function features(s: PersonSheet): Array<{ key: string; label: string; rows: FeatureRow[] }> {
  return list<any>(parts(s).features?.sections).map((sec) => ({
    key: String(sec.id), label: String(sec.label ?? ''),
    rows: list<any>(sec.items).map((it) => {
      const c = ic(s)[it.id] ?? {}
      return { id: String(it.id), name: String(it.name ?? ''), ref: it.ref, subtitle: String(c.subtitle ?? ''), count: countOf(c), recovery: String(it.labels?.recovery ?? ''), recharge: c.uses?.hasRecharge ? String(it.labels?.recharge ?? '') : '' }
    }),
  })).filter((x) => x.rows.length)
}
/** 职业（特性页顶上的职业卡）：名字、等级、子职业、生命骰。 */
export function classCards(s: PersonSheet): Array<{ id: string; name: string; levels: number; hd: string; ref?: unknown }> {
  return list<any>(parts(s).features?.classes).map((c) => ({ id: String(c.id), name: String(c.name ?? ''), levels: Number(raw(s, c.id)?.system?.levels ?? 0), hd: String(raw(s, c.id)?.system?.hd?.denomination ?? ''), ref: c.ref }))
}

// ---- 效果 ----
export interface EffectRow { id: string; parentId: string | null; name: string; source: string; duration: string; disabled: boolean; toggleable: boolean }
export function effectGroups(s: PersonSheet): Array<{ key: string; label: string; info: string; rows: EffectRow[] }> {
  return Object.entries(parts(s).effects?.effects ?? {}).filter(([, c]: [string, any]) => !c.hidden).map(([key, c]: [string, any]) => ({
    key, label: String(c.label ?? ''), info: String(c.info ?? ''),
    rows: list<any>(c.effects).map((e) => ({
      id: String(e.id), parentId: e.parentId ?? null, name: String(e.name ?? ''), source: String(e.source?.name ?? e.source ?? ''),
      duration: String(e.duration?.label ?? e.duration?.remaining ?? ''), disabled: !!e.disabled, toggleable: e.toggleable !== false,
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
