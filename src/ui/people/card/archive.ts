import type { Person } from '../../../schemas/people'
import { ARMOR_LABELS, CONDITION_LABELS, DAMAGE_LABELS, LANGUAGE_LABELS, TOOL_LABELS, WEAPON_CATEGORY_LABELS } from '../../../rules/dnd5e2014/data/enums'

/** 档案三卡的数据模型（U5R §8）：纯函数，界面与单测共用。 */
export type ArchiveGroupKey = 'resist' | 'immune' | 'vulnerable' | 'condition' | 'senses' | 'languages' | 'weapons' | 'armor' | 'tools'
export type ArchiveCardKey = 'defense' | 'senses' | 'proficiency'
export interface ArchiveItem { id: string; label: string; source: string; ref?: string; group: ArchiveGroupKey }
export interface ArchiveGroup { key: ArchiveGroupKey; label: string; items: ArchiveItem[] }
export interface ArchiveCard { key: ArchiveCardKey; title: string; groups: ArchiveGroup[] }
type Src = Array<{ kind: string; from?: string }> | undefined
export const ARCHIVE_VISIBLE = 3
export const CARD_OF_GROUP: Record<ArchiveGroupKey, ArchiveCardKey> = { resist: 'defense', immune: 'defense', vulnerable: 'defense', condition: 'defense', senses: 'senses', languages: 'proficiency', weapons: 'proficiency', armor: 'proficiency', tools: 'proficiency' }

const SENSE_NAMES: Record<string, string> = { darkvision: '黑暗视觉', blindsight: '盲视', tremorsense: '震颤感知', truesight: '真实视觉' }
export function senseLabel(text: string): string {
  return text.replace(/^(\w+)\s+(\d+)\s*(?:ft\.?|feet)?/i, (_, key: string, range: string) => `${SENSE_NAMES[key.toLowerCase()] ?? key} ${range} 尺`)
}

export function sourceText(sources: Src, nameOf: (id?: string) => string, template: boolean): string {
  const rows = sources ?? []
  if (rows.length === 0) return template ? '模板' : '手动添加'
  return rows.map((s) => (s.kind === 'auto' ? `来自 ${nameOf((s.from ?? '').split(':').slice(1).join(':')) || s.from || '自动'}` : s.kind === 'template' ? '模板' : '手动添加')).join('；')
}

export function archiveOf(person: Person, nameOf: (id?: string) => string): ArchiveCard[] {
  const block = person.block
  const template = block.cr !== undefined
  const plain = (key: ArchiveGroupKey, values: string[] | undefined, map: Record<string, string>): ArchiveItem[] => (values ?? []).map((v) => ({ id: `${key}:${v}`, label: map[v] ?? v, source: template ? '模板' : '手动添加', group: key }))
  const prof = block.proficiencies
  const languages: ArchiveItem[] = [
    ...(prof?.languages ?? []).map((r) => ({ id: `languages:${r.id}`, label: LANGUAGE_LABELS[r.id] ?? r.id, source: sourceText(r.sources, nameOf, template), group: 'languages' as const })),
    ...(block.languages ?? []).map((t) => ({ id: `languages:text:${t}`, label: t, source: '模板', group: 'languages' as const })),
  ]
  const weapons = (prof?.weapons ?? []).map((r): ArchiveItem => ({ id: `weapons:${r.ref ?? r.category ?? r.name}`, label: r.name ?? (r.ref ? nameOf(r.ref) : r.category ? `${WEAPON_CATEGORY_LABELS[r.category]}武器` : ''), source: sourceText(r.sources, nameOf, template), ref: r.ref, group: 'weapons' })).filter((i) => i.label)
  const armor = (prof?.armor ?? []).map((r): ArchiveItem => ({ id: `armor:${r.category}`, label: ARMOR_LABELS[r.category] ?? r.category, source: sourceText(r.sources, nameOf, template), group: 'armor' }))
  const tools = (prof?.tools ?? []).map((r): ArchiveItem => ({ id: `tools:${r.ref ?? r.name}`, label: r.name ? (TOOL_LABELS[r.name] ?? r.name) : (r.ref ? nameOf(r.ref) : ''), source: sourceText(r.sources, nameOf, template), ref: r.ref, group: 'tools' })).filter((i) => i.label)
  const group = (key: ArchiveGroupKey, label: string, items: ArchiveItem[]): ArchiveGroup => ({ key, label, items })
  return [
    { key: 'defense', title: '防御', groups: [group('resist', '抗性', plain('resist', block.resist, DAMAGE_LABELS)), group('immune', '免疫', plain('immune', block.immune, DAMAGE_LABELS)), group('vulnerable', '易伤', plain('vulnerable', block.vulnerable, DAMAGE_LABELS)), group('condition', '状态免疫', plain('condition', block.conditionImmune, CONDITION_LABELS))] },
    { key: 'senses', title: '感官', groups: [group('senses', '', (block.senses ?? []).map((t): ArchiveItem => ({ id: `senses:${t}`, label: senseLabel(t), source: template ? '模板' : '手动添加', group: 'senses' })))] },
    { key: 'proficiency', title: '熟练', groups: [group('languages', '语言', languages), group('weapons', '武器', weapons), group('armor', '护甲', armor), group('tools', '工具', tools)] },
  ]
}
