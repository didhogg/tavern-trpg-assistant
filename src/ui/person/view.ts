// 人物页从读数里取要显示的东西：只取字段、不算数。名字和说明来自 dnd5e 官方角色表的显示数据（view，已过唯一中文出口）；
// 玩家角色（CharacterActorSheet）和怪物（NPCActorSheet）的官方分部分不同，这里两种都认；编号的名字查名字表（glossary）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明，界面只读字段 */
import type { Glossary } from '../../rules/kernel/people'
import type { PersonSheet } from '../../stores/person'

export interface Pip { n: number; filled: boolean; label: string }
export interface Labeled { label: string; value?: number | string | null; key?: string }

const parts = (s: PersonSheet): Record<string, any> => s.view?.parts ?? {}
const list = <T>(v: unknown): T[] => Array.isArray(v) ? v as T[] : v && typeof v === 'object' ? [v as T] : []

export const isNpc = (s: PersonSheet): boolean => s.view?.base?.isNPC === true
/** 名字表里一个编号的名字；没有就原样。 */
export const named = (g: Glossary | null, table: string, code: unknown): string => code == null || code === '' ? '' : (g?.tables[table]?.[String(code)] as string | undefined) ?? String(code)

/** 职业与等级（玩家角色）：名字取官方显示数据里的物品名，等级取原始数据。 */
export function classes(s: PersonSheet): Array<{ id: string; name: string; levels: number | null }> {
  const levels = new Map<string, number | null>((s.items ?? []).filter((i: any) => i.type === 'class').map((i: any) => [i.id, i.system?.levels ?? null]))
  return list<any>(s.view?.base?.itemCategories?.classes).map((c) => ({ id: c.id, name: String(c.name ?? ''), levels: levels.get(c.id) ?? null }))
}
/** 种族 / 背景（玩家角色）：带库条目引用，点了看库里的资料卡。 */
export const species = (s: PersonSheet): { name: string; ref?: any } | null => parts(s).details?.species ?? null
export const background = (s: PersonSheet): { name: string; ref?: any } | null => parts(s).details?.background ?? null

/** 生物类型：玩家角色用官方的“类型 / 亚类”；怪物用名字表 + 亚类原文。 */
export function creatureType(s: PersonSheet, g: Glossary | null): string {
  const ct = parts(s).details?.creatureType
  if (ct?.title) return [ct.title, ct.subtitle].filter(Boolean).join('（') + (ct.subtitle ? '）' : '')
  const t = s.view?.base?.system?.details?.type ?? s.system.details?.type
  const name = named(g, 'creatureTypes', t?.value)
  return t?.subtype ? `${name}（${t.subtype}）` : name
}
export const alignment = (s: PersonSheet): string => String(s.view?.base?.system?.details?.alignment ?? s.system.details?.alignment ?? '')
export const size = (s: PersonSheet, g: Glossary | null): string => named(g, 'actorSizes', s.system.traits?.size)

export const speeds = (s: PersonSheet): Labeled[] => list<Labeled>(parts(s).sidebar?.speed)
export const senses = (s: PersonSheet): Labeled[] => list<Labeled>(parts(s).sidebar?.senses ?? parts(s).details?.senses)
/** 技能：官方给哪些就列哪些（玩家角色 18 项全列，怪物只列有熟练的）。 */
export const skills = (s: PersonSheet): Array<{ key: string; label: string; total: number; passive: number; proficient: number; hover: string; baseAbility: string }> =>
  list<any>(parts(s).details?.skills ?? parts(s).sidebar?.skills)

/** 死亡豁免：玩家角色一直显示；怪物按官方规则（重要 NPC 且 0 血）才显示。 */
export const deathShown = (s: PersonSheet): boolean => !!parts(s).sidebar?.death || parts(s).header?.showDeathSaves === true
/** 力竭的级数圆点（官方给的，决定最多几级）；怪物没有时为空。 */
export const exhaustionPips = (s: PersonSheet): Pip[] => [...list<Pip>(parts(s).sidebar?.exhaustion?.left), ...list<Pip>(parts(s).sidebar?.exhaustion?.right)]
/** 怪物的传奇动作 / 传奇抗性圆点。 */
export const legendary = (s: PersonSheet): { act: Pip[]; res: Pip[] } => ({ act: list<Pip>(parts(s).header?.legact), res: list<Pip>(parts(s).header?.legres) })
export const showExperience = (s: PersonSheet): boolean => parts(s).header?.showExperience === true

/** 挑战等级的写法（1/8、1/4、1/2）：只是数字排版。 */
export function crText(cr: unknown): string {
  const n = Number(cr)
  if (!Number.isFinite(n)) return ''
  const frac: Record<number, string> = { 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' }
  return frac[n] ?? String(n)
}
export const signed = (n: unknown): string => { const v = Number(n); return Number.isFinite(v) ? (v >= 0 ? `+${v}` : `−${Math.abs(v)}`) : '' }

// ---- 属性页 ----
/** 工具熟练：和技能同样的官方列表。 */
export const tools = (s: PersonSheet): ReturnType<typeof skills> => list<any>(parts(s).details?.tools ?? parts(s).sidebar?.tools)
/** 特质：官方整理好的各组（抗性 / 免疫 / 语言 / 武器护甲熟练……），组名查名字表。 */
export function traits(s: PersonSheet, g: Glossary | null): Array<{ key: string; label: string; items: string[] }> {
  const t: Record<string, any> = parts(s).details?.traits ?? parts(s).sidebar?.traits ?? {}
  return Object.entries(t).map(([key, rows]) => ({ key, label: named(g, 'traits', key), items: list<any>(rows).map((r) => [r.label, r.value].filter((x) => x !== undefined && x !== null && x !== '').join(' ')) })).filter((x) => x.items.length)
}
