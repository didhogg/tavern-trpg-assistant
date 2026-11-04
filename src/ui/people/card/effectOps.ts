import type { Effect } from '../../../rules/dnd5e2014/data/effects'
import type { PersonEffect } from '../../../schemas/people'
import type { Entry } from '../../../schemas/pack'

/** 添加效果（U5R §10.7、§12.4）：条目 → 结构化人物效果（时长、专注、effects 快照）。纯函数。 */
export type EffectTab = 'condition' | 'disease' | 'spell' | 'other'
export const EFFECT_TABS: Array<{ key: EffectTab; label: string }> = [{ key: 'condition', label: '状态' }, { key: 'disease', label: '疾病' }, { key: 'spell', label: '法术效果' }, { key: 'other', label: '其他' }]

type Dur = NonNullable<PersonEffect['duration']>
/** 条目时长：法术是数组（取第一个计时型）；特性 / 物品 / 疾病 / 环境若有 data.duration（对象）同形状。 */
export function durationOf(entry: Entry): Dur | undefined {
  const raw = entry.data.duration
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const v = item as { type?: unknown; amount?: unknown; unit?: unknown; concentration?: unknown }
    if (typeof v.type !== 'string') continue
    return { type: v.type, ...(typeof v.amount === 'number' ? { amount: v.amount } : {}), ...(typeof v.unit === 'string' ? { unit: v.unit } : {}), concentration: v.concentration === true }
  }
  return undefined
}
export const isTimedSpell = (entry: Entry): boolean => entry.type === 'spell' && (Array.isArray(entry.data.duration) ? entry.data.duration : []).some((d) => (d as { type?: string })?.type === 'timed')

export function tabOf(entry: Entry): EffectTab | null {
  if (entry.type === 'condition' || entry.type === 'status') return entry.id.startsWith('condition.exhaustion') ? null : 'condition'
  if (entry.type === 'disease') return 'disease'
  if (entry.type === 'spell') return isTimedSpell(entry) ? 'spell' : null
  if (entry.type === 'feature' || entry.type === 'item' || entry.type === 'hazard') return 'other'
  return null
}
export const categoryOf = (entry: Entry): PersonEffect['category'] => (entry.type === 'condition' ? 'condition' : entry.type === 'status' ? 'status' : entry.type === 'disease' ? 'disease' : entry.type === 'spell' ? 'spell' : 'other')
export const OTHER_SUB: Record<string, string> = { feature: '特性', item: '物品', hazard: '环境' }

export function structuredEffects(entry: Entry): Effect[] | undefined {
  const e = entry.data.effects
  return Array.isArray(e) && e.length && typeof e[0] === 'object' ? (e as Effect[]) : undefined
}

export function effectFromEntry(entry: Entry, now: number, seq: number): PersonEffect {
  const duration = durationOf(entry)
  const effects = structuredEffects(entry)
  return {
    id: `fx-${now.toString(36)}-${seq}`, ref: entry.id, category: categoryOf(entry), name: entry.name, ...(entry.nameEn ? { nameEn: entry.nameEn } : {}),
    ...(duration ? { duration } : {}), concentration: duration?.concentration === true, ...(effects ? { effects } : {}), addedAt: now,
  }
}
export function customEffect(name: string, durationText: string, note: string, now: number, seq: number): PersonEffect {
  const merged = [durationText.trim() ? `时长：${durationText.trim()}` : '', note.trim()].filter(Boolean).join('；') // 自定义时长是文字，不丢：和备注并在一起
  return { id: `fx-${now.toString(36)}-${seq}`, category: 'other', name: name.trim(), concentration: false, ...(merged ? { note: merged.slice(0, 400) } : {}), ...(durationText.trim() ? { duration: { type: 'special', concentration: false } } : {}), addedAt: now }
}
/** 同时只能专注一个（p203）：加入带专注的效果时，若已有专注，返回它的名字（只提示，不自动移除）。 */
export function concentrationConflict(current: PersonEffect[], adding: PersonEffect): string | undefined {
  if (!adding.concentration) return undefined
  return current.find((e) => e.concentration)?.name
}
export const activeRef = (current: PersonEffect[], ref: string): PersonEffect | undefined => current.find((e) => e.ref === ref)
