import type { R9Candidate } from './r9Types'
import type { TableColumn, TableValue } from '../../../src/rules/dnd5e2014/data/tableValues'

const FR: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75 }
export function untag(input: string): string {
  let out = input
  for (let i = 0; i < 6 && out.includes('{@'); i++) out = out.replace(/\{@\w+ ([^{}]*)\}/g, (_m, inner: string) => inner.split('|')[0])
  return out.trim()
}
export function toNum(input: string): number | null {
  let s = untag(input).replace(/[,，\s]/g, '').replace(/^[×x+]/, '')
  if (s === '' || /^[—–-]+$/.test(s)) return null
  for (const [k, v] of Object.entries(FR)) if (s.includes(k)) { const rest = s.replace(k, ''); return (rest ? Number(rest) : 0) + v }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
function int(s: string): number { const n = toNum(s); if (n === null || !Number.isInteger(n)) throw new Error(`整数解析失败 ${s}`); return n }
function level(s: string): number { const m = /^(\d{1,2})(?:环|th|st|nd|rd|级)?$/.exec(untag(s).replace(/\s/g, '')); if (!m) throw new Error(`等级解析失败 ${s}`); return Number(m[1]) }
function levelNoun(s: string): number { return /戏法/.test(s) ? 0 : level(s) }
function range(s0: string): { min: number; max: number | null } {
  const s = untag(s0).replace(/\s/g, '').replace(/[–—]/g, '-').replace(/级$/, '')
  let m = /^(\d+)-(\d+)$/.exec(s)
  if (m) return { min: Number(m[1]), max: Number(m[2]) }
  m = /^(\d+)(?:或更高|及以上)$/.exec(s)
  if (m) return { min: Number(m[1]), max: null }
  m = /^(\d+)$/.exec(s)
  if (m) return { min: Number(m[1]), max: Number(m[1]) }
  throw new Error(`区间解析失败 ${s0}`)
}
function dice(s0: string): string { const m = /(\d*)d(\d+)/i.exec(untag(s0)); if (!m) throw new Error(`骰子解析失败 ${s0}`); return `${m[1] === '1' ? '' : m[1]}d${m[2]}` }
function bonus(s: string): number { const m = /^([+-]?\d+)\s*$/.exec(untag(s)); if (!m) throw new Error(`加值解析失败 ${s}`); return Number(m[1]) }
function bonusRange(s: string): { min: number; max: number } { const m = /^\+?(\d+)至\+?(\d+)$/.exec(untag(s).replace(/\s/g, '')); if (!m) throw new Error(`加值区间解析失败 ${s}`); return { min: Number(m[1]), max: Number(m[2]) } }
const SIZE: Record<string, string> = { 微型: 'T', 小型: 'S', 中型: 'M', 大型: 'L', 巨型: 'H', 超巨型: 'G' }
function size(s: string): string { const k = Object.keys(SIZE).sort((a, b) => b.length - a.length).find((x) => untag(s).startsWith(x)); if (!k) throw new Error(`体型解析失败 ${s}`); return SIZE[k] }
function crv(s: string): { cr: string; value: number } { const t = untag(s).replace(/\s/g, ''); const m = /^(\d+)(?:\/(\d+))?$/.exec(t); if (!m) throw new Error(`CR 解析失败 ${s}`); return { cr: t, value: m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]) } }
function diceAvg(s: string): { average: number; dice: string } { const m = /^(\d+)\s*\((.+)\)$/.exec(s.replace(/\{@dice ([^}|]*)[^}]*\}/g, '$1').trim()); if (!m) throw new Error(`带平均骰解析失败 ${s}`); return { average: Number(m[1]), dice: dice(m[2]) } }
function sev(s: string): string { const map: Record<string, string> = { 妨害: 'setback', 危险: 'dangerous', 致命: 'deadly' }; const v = map[untag(s)]; if (!v) throw new Error(`严重度 ${s}`); return v }

interface Spec { purpose: string; id: string; columns: TableColumn[]; row: (cells: string[]) => Record<string, TableValue> }
const specs: Spec[] = [
  { purpose: 'encounter.xpThresholdsByLevel', id: 'table.dmg-p82-r1', columns: [{ key: 'level', type: 'level' }, { key: 'easy', type: 'int', unit: 'XP' }, { key: 'medium', type: 'int', unit: 'XP' }, { key: 'hard', type: 'int', unit: 'XP' }, { key: 'deadly', type: 'int', unit: 'XP' }], row: (c) => ({ level: level(c[0]), easy: int(c[1]), medium: int(c[2]), hard: int(c[3]), deadly: int(c[4]) }) },
  { purpose: 'encounter.groupMultiplier', id: 'table.dmg-p82-r2', columns: [{ key: 'monsters', type: 'range' }, { key: 'multiplier', type: 'number' }], row: (c) => ({ monsters: range(c[0]), multiplier: toNum(c[1]) as number }) },
  { purpose: 'encounter.dailyAdjustedXpByLevel', id: 'table.dmg-p84-r1', columns: [{ key: 'level', type: 'level' }, { key: 'xpPerCharacter', type: 'int', unit: 'XP' }], row: (c) => ({ level: level(c[0]), xpPerCharacter: int(c[1]) }) },
  { purpose: 'cr.xpByCr', id: 'table.dmg-p274-r2', columns: [{ key: 'cr', type: 'cr' }, { key: 'xp', type: 'intOrOptions', unit: 'XP' }], row: (c) => { const k = crv(c[0]); const m = /^0或10$/.test(untag(c[1])) ? [0, 10] : int(c[1]); return { cr: k.cr, crValue: k.value, xp: m } } },
  { purpose: 'character.levelProgression', id: 'table.phb-p15-r1', columns: [{ key: 'xp', type: 'int', unit: 'XP' }, { key: 'level', type: 'level' }, { key: 'proficiencyBonus', type: 'bonus' }], row: (c) => ({ xp: int(c[0]), level: level(c[1]), proficiencyBonus: bonus(c[2]) }) },
  { purpose: 'creature.sizeSpace', id: 'table.phb-p191-r1', columns: [{ key: 'size', type: 'size' }, { key: 'spaceFeet', type: 'number', unit: 'ft' }, { key: 'orLarger', type: 'bool' }], row: (c) => { const m = /^([\d½¼¾.]+)/.exec(untag(c[1]).replace(/\s/g, '')); if (!m) throw new Error(`空间 ${c[1]}`); return { size: size(c[0]), spaceFeet: toNum(m[1]) as number, orLarger: /或更大/.test(c[1]) } } },
  { purpose: 'monster.hitDieBySize', id: 'table.mm-p7-r1', columns: [{ key: 'size', type: 'size' }, { key: 'hitDie', type: 'dice' }, { key: 'average', type: 'number' }], row: (c) => ({ size: size(c[0]), hitDie: dice(c[1]), average: toNum(c[2]) as number }) },
  { purpose: 'monster.hpMultiplierByResistance', id: 'table.dmg-p277-r1', columns: [{ key: 'expectedCr', type: 'range' }, { key: 'resistance', type: 'multiplier' }, { key: 'immunity', type: 'multiplier' }], row: (c) => ({ expectedCr: range(c[0]), resistance: toNum(c[1]) as number, immunity: toNum(c[2]) as number }) },
  { purpose: 'trap.saveDcAndAttackBySeverity', id: 'table.dmg-p121-r1', columns: [{ key: 'severity', type: 'enum' }, { key: 'saveDc', type: 'range' }, { key: 'attackBonus', type: 'bonusRange' }], row: (c) => ({ severity: sev(c[0]), saveDc: range(c[1]), attackBonus: bonusRange(c[2]) }) },
  { purpose: 'trap.damageBySeverityAndLevel', id: 'table.dmg-p121-r2', columns: [{ key: 'characterLevel', type: 'range' }, { key: 'setback', type: 'dice' }, { key: 'dangerous', type: 'dice' }, { key: 'deadly', type: 'dice' }], row: (c) => ({ characterLevel: range(c[0]), setback: dice(c[1]), dangerous: dice(c[2]), deadly: dice(c[3]) }) },
  { purpose: 'spell.damageByLevel', id: 'table.dmg-p283-r1', columns: [{ key: 'spellLevel', type: 'int' }, { key: 'singleTarget', type: 'dice' }, { key: 'multipleTargets', type: 'dice' }], row: (c) => ({ spellLevel: levelNoun(c[0]), singleTarget: dice(c[1]), multipleTargets: dice(c[2]) }) },
  { purpose: 'spellcasting.multiclassSlots', id: 'table.multiclassing.phb-3', columns: [{ key: 'level', type: 'level' }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ key: `slots${n}`, type: 'int' as const }))], row: (c) => ({ level: level(c[0]), ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`slots${n}`, toNum(c[n]) ?? 0])) }) },
  { purpose: 'object.hpBySize', id: 'table.dmg-p247-r1', columns: [{ key: 'size', type: 'size' }, { key: 'fragile', type: 'diceWithAverage' }, { key: 'resilient', type: 'diceWithAverage' }], row: (c) => ({ size: size(c[0]), fragile: diceAvg(c[1]), resilient: diceAvg(c[2]) }) },
]

export interface KeyTable { purpose: string; columns: TableColumn[]; rows: Array<Record<string, TableValue>> }
export function keyTableValues(survivors: R9Candidate[]): Map<string, KeyTable> {
  const byId = new Map(survivors.map((s) => [s.id!, s]))
  const out = new Map<string, KeyTable>()
  for (const spec of specs) {
    const survivor = byId.get(spec.id)
    if (!survivor) throw new Error(`关键表不存在：${spec.id}`)
    const rows = survivor.rows.map((row, i) => { try { return spec.row(row.cells) } catch (e) { throw new Error(`${spec.purpose} 第 ${i + 1} 行：${e instanceof Error ? e.message : String(e)}`) } })
    out.set(spec.id, { purpose: spec.purpose, columns: spec.columns, rows })
  }
  const m = survivors.find((s) => s.origin === 'M')
  if (!m) throw new Error('关键表缺少挑战等级怪物数值')
  const crRaw = m.extra.crRaw
  if (!crRaw) throw new Error('挑战等级怪物数值缺少来源')
  out.set(m.id!, { purpose: 'cr.monsterStatsByCr', columns: [{ key: 'cr', type: 'cr' }, { key: 'proficiencyBonus', type: 'bonus' }, { key: 'ac', type: 'int' }, { key: 'hp', type: 'range' }, { key: 'attackBonus', type: 'bonus' }, { key: 'dpr', type: 'range' }, { key: 'saveDc', type: 'int' }], rows: crRaw.map((r) => { const k = crv(String(r._cr)); return { cr: k.cr, crValue: k.value, proficiencyBonus: Number(r.pb), ac: Number(r.ac), hp: { min: Number(r.hpMin), max: Number(r.hpMax) }, attackBonus: Number(r.attackBonus), dpr: { min: Number(r.dprMin), max: Number(r.dprMax) }, saveDc: Number(r.saveDc) } }) })
  return out
}
