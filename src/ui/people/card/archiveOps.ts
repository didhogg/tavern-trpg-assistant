import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { Proficiencies } from '../../../rules/dnd5e2014/data/entries/sheet'
import { assignGrants, type Grant } from '../../../rules/dnd5e2014/derive'
import type { ArchiveGroupKey } from './archive'
import { senseDefs } from './senseDefs'

/** 档案管理弹窗的写入（对 block 的纯函数，返回新 block；U5R §10.6）。 */
const clone = (block: MonsterData): MonsterData => JSON.parse(JSON.stringify(block)) as MonsterData
type ListKey = 'resist' | 'immune' | 'vulnerable' | 'conditionImmune'
const LIST: Partial<Record<ArchiveGroupKey, ListKey>> = { resist: 'resist', immune: 'immune', vulnerable: 'vulnerable', condition: 'conditionImmune' }
const PROF: Partial<Record<ArchiveGroupKey, keyof Proficiencies>> = { languages: 'languages', weapons: 'weapons', armor: 'armor', tools: 'tools' }

/** 感官的编号（darkvision……）；名称与说明来自库（senseDefs.ts），这里不手写。 */
export type SenseKey = string

export interface SenseRow { index: number; key: SenseKey | null; label: string; range: number | null }
/** `block.senses` 是文字（「黑暗视觉 60 尺」或「darkvision 60 ft.」）；读出种类与距离，读不出的原样保留只读。 */
export function senseRows(block: MonsterData): SenseRow[] {
  return (block.senses ?? []).map((text, index) => {
    const found = senseDefs().find((s) => text.includes(s.label) || text.toLowerCase().includes(s.key))
    const range = /(\d+)/.exec(text)
    return { index, key: found?.key ?? null, label: found?.label ?? text, range: range ? Number(range[1]) : null }
  })
}
export const senseText = (key: SenseKey, range: number): string => `${senseDefs().find((s) => s.key === key)?.label ?? key} ${range} 尺`

export function addSense(block: MonsterData, key: SenseKey, range = 60): MonsterData {
  if (senseRows(block).some((r) => r.key === key)) return block
  const next = clone(block)
  next.senses = [...(next.senses ?? []), senseText(key, range)]
  return next
}
export function setSenseRange(block: MonsterData, index: number, range: number): MonsterData {
  const row = senseRows(block)[index]
  if (!row?.key || !Number.isInteger(range) || range < 0) return block
  const next = clone(block)
  next.senses[index] = senseText(row.key, range)
  return next
}

export function addListItem(block: MonsterData, group: ArchiveGroupKey, key: string): MonsterData {
  const list = LIST[group]
  if (!list) return block
  if ((block[list] ?? []).includes(key)) return block
  const next = clone(block)
  next[list] = [...(next[list] ?? []), key]
  return next
}

/** 熟练类（语言 / 武器 / 护甲 / 工具）：手动添加一行，来源 manual。 */
export function addProficiency(block: MonsterData, grant: Grant): MonsterData {
  const next = clone(block)
  const before = next.proficiencies
  const exists = (before?.[PROF[grant.category as ArchiveGroupKey] as keyof Proficiencies] as Array<Record<string, unknown>> | undefined)?.some((r) => (r.ref ?? r.category ?? r.name ?? r.id) === (grant.ref ?? grant.weaponCategory ?? grant.name ?? grant.key))
  if (exists) return block
  const withRow = assignGrants(before, [grant], 'manual-placeholder')
  // 把占位的自动来源换成手动
  for (const rows of Object.values(withRow) as Array<Array<{ sources: Array<{ kind: string; from?: string }> }>>) {
    for (const row of rows) row.sources = row.sources.map((s) => (s.kind === 'auto' && s.from === 'manual-placeholder' ? { kind: 'manual' } : s))
  }
  next.proficiencies = withRow
  return next
}

export function removeItem(block: MonsterData, group: ArchiveGroupKey, key: string): MonsterData {
  const next = clone(block)
  const list = LIST[group]
  if (list) { next[list] = (next[list] ?? []).filter((v) => v !== key); return next }
  if (group === 'senses') { const i = senseRows(block).findIndex((r) => (r.key ?? r.label) === key); if (i >= 0) next.senses = next.senses.filter((_, j) => j !== i); return next }
  const prof = PROF[group]
  if (prof && next.proficiencies) {
    const rows = (next.proficiencies[prof] ?? []) as Array<Record<string, unknown>>
    ;(next.proficiencies as Record<string, unknown>)[prof] = rows.filter((r) => String(r.ref ?? r.category ?? r.name ?? r.id) !== key)
  }
  return next
}

export function setToolLevel(block: MonsterData, key: string, level: 'proficient' | 'expertise'): MonsterData {
  const next = clone(block)
  for (const row of next.proficiencies?.tools ?? []) if (String(row.ref ?? row.name) === key) row.level = level
  return next
}
