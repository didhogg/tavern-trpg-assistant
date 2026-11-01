import { evaluateFormula } from '../../../src/rules/dnd5e2014/data/formula'
import { readGrants, readProficiencies, readSpellcasting } from './classSheet'
import type { Lib, Row } from './load'
import { readRace } from './originSheet'
import { scaleAt } from './scale'
import { arr, fold, rec, str, strs } from './util'

/** 样卡计算：模拟 R1.1 派生数值——只用包里的数据，加上书上的通用规则（调整值、熟练加值、平均生命值）。 */
export interface SampleIn {
  name: string
  classId: string
  level: number
  subclassId?: string
  raceId: string
  subraceId?: string
  backgroundId?: string
  feats?: string[]
  scores: Record<string, number>
  armor?: string // 物品英文名，如 "Chain Mail"
  shield?: boolean
  skills: string[] // 职业自选技能（代码）
}
export interface SampleOut {
  prof: number; ac: number; hp: number; initiative: number; speed: number; darkvision: number; passivePerception: number
  saves: Record<string, number>; skills: Record<string, number>; slots?: number[]; spellDc?: number; spellAttack?: number
}

const mod = (s: number): number => Math.floor((s - 10) / 2)
export const profBonus = (level: number): number => 2 + Math.floor((level - 1) / 4)

function collectScales(rows: Row[], level: number): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) for (const a of arr(r.data.advancement).map(rec)) if (a.kind === 'scaleValue' && (a.type === 'number' || a.type === 'distance')) { const v = scaleAt({ scale: rec(a.scale) as Record<string, number | string> }, level); if (typeof v === 'number') out[str(a.id)] = v }
  return out
}

/** 此人物拥有的全部特性条目（职业、子职业按等级，种族与亚种的特质，专长，背景特性） */
export function ownedRows(l: Lib, s: SampleIn): Row[] {
  const rows: Row[] = []
  const grant = (owner: Row): void => { for (const g of readGrants(owner)) if (!g.optional && g.level <= s.level) for (const i of g.items) { const f = l.get(i); if (f) rows.push(f) } }
  const cls = l.need(s.classId)
  grant(cls)
  if (s.subclassId) grant(l.need(s.subclassId))
  for (const rid of [s.raceId, s.subraceId].filter(Boolean) as string[]) { const r = l.need(rid); rows.push(r); for (const t of strs(r.data.traits)) { const f = l.get(t); if (f) rows.push(f) } }
  for (const f of s.feats ?? []) rows.push(l.need(f))
  if (s.backgroundId) { const b = l.need(s.backgroundId); const f = l.get(str(b.data.feature)); if (f) rows.push(f) }
  return rows
}

export function derive(l: Lib, s: SampleIn): SampleOut {
  const cls = l.need(s.classId)
  const prof = profBonus(s.level)
  const mods = Object.fromEntries(Object.entries(s.scores).map(([k, v]) => [k, mod(v)]))
  const owned = ownedRows(l, s)
  const effects = owned.flatMap((r) => arr(r.data.effects).map(rec))
  const scales = collectScales([cls, ...(s.subclassId ? [l.need(s.subclassId)] : [])], s.level)
  const ctx = { level: s.level, prof, abilityMods: mods, classLevels: { [s.classId.split('.')[1]]: s.level }, scales }
  const ev = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' ? evaluateFormula(v, ctx) : 0)

  // 生命值：1 级取满生命骰，之后每级取平均（骰面/2+1），每级加体质调整值；加上效果里的生命上限加成
  const die = Number(cls.data.hitDie)
  let hp = die + mods.con + (s.level - 1) * (die / 2 + 1 + mods.con)
  for (const e of effects) if (e.kind === 'hpMax') hp += ev(e.perLevel) * s.level + ev(e.flat)

  // 护甲等级：护甲 +（敏捷，受上限限制）+ 盾牌；无甲防御之类的“base”公式取较大者；“bonus”相加
  const armorRow = s.armor ? l.of('item').find((r) => r.nameEn === s.armor && r.data.armor) : undefined
  const armor = rec(armorRow?.data.armor)
  const shieldRow = s.shield ? l.of('item').find((r) => r.nameEn === 'Shield' && r.data.armor) : undefined
  const dexAdd = armorRow ? (armor.dexCap !== undefined ? Math.min(mods.dex, Number(armor.dexCap)) : armor.category === 'heavy' ? 0 : mods.dex) : mods.dex
  let ac = armorRow ? Number(armor.ac) + dexAdd : 10 + mods.dex
  for (const e of effects) {
    if (e.kind !== 'ac') continue
    // 条件只有文字（“未穿护甲”“未持盾”）：读取器只能按文字里的关键词猜
    const when = arr(rec(e.when).all).map(rec).map((c) => str(c.text)).join('')
    if (when.includes('未穿护甲') && armorRow) continue
    if (when.includes('未持盾') && s.shield) continue
    if (e.mode === 'base' && typeof e.formula === 'string') ac = Math.max(ac, ev(e.formula))
  }
  if (shieldRow) ac += Number(rec(shieldRow.data.armor).ac)
  for (const e of effects) if (e.kind === 'ac' && e.mode === 'bonus' && typeof e.amount === 'number') ac += e.amount

  const race = readRace(l, s.raceId, s.subraceId)
  let speed = race.walk
  for (const e of effects) if (e.kind === 'speed' && e.mode === 'walk' && typeof e.bonus === 'number') speed += e.bonus
  for (const e of effects) if (e.kind === 'speed' && e.mode === 'walk' && typeof e.bonusFormula === 'string') speed += ev(e.bonusFormula) // 随等级的加成（武僧无甲移动）
  for (const e of effects) if (e.kind === 'speed' && e.mode === 'walk' && typeof e.amount === 'number' && e.amount > 0 && !owned.some((r) => r.type === 'condition')) speed += e.amount

  let initiative = mods.dex
  for (const e of effects) if (e.kind === 'initiative' && typeof e.bonus === 'number') initiative += e.bonus

  const classProf = readProficiencies(cls)
  const bg = s.backgroundId ? l.need(s.backgroundId) : undefined
  const profSkills = new Set<string>([...s.skills, ...strs(rec(rec(bg?.data.proficiencies).skills).fixed), ...race.skillsFixed])
  for (const e of effects) if (e.kind === 'skill' && e.level === 'proficient') profSkills.add(str(e.skill))
  const SK: Record<string, string> = { acrobatics: 'dex', 'animal handling': 'wis', arcana: 'int', athletics: 'str', deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha', investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis', performance: 'cha', persuasion: 'cha', religion: 'int', 'sleight of hand': 'dex', stealth: 'dex', survival: 'wis' }
  const skills = Object.fromEntries(Object.entries(SK).map(([k, a]) => [k, mods[a] + (profSkills.has(k) ? prof : 0)]))
  let passive = 10 + skills.perception
  for (const e of effects) if (e.kind === 'passive' && e.skill === 'perception' && typeof e.bonus === 'number') passive += e.bonus
  const saves = Object.fromEntries(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a) => [a, mods[a] + (strs(cls.data.saves).includes(a) ? prof : 0)]))

  const out: SampleOut = { prof, ac, hp, initiative, speed, darkvision: race.darkvision, passivePerception: passive, saves, skills }
  const sc = readSpellcasting(cls)
  if (sc) {
    const castAbility = str(rec(cls.data.spellcasting).ability)
    out.slots = sc.pact.length ? [sc.pact[s.level - 1][0], sc.pact[s.level - 1][1]] : sc.slots[s.level - 1]
    out.spellDc = 8 + prof + mods[castAbility]
    out.spellAttack = prof + mods[castAbility]
  }
  void classProf; void fold
  return out
}

/** 兼职施法者的法术位（PHB 第 6 章“多职业施法者”）：全施法等级相加，半施法/2（向下取整），三分之一施法/3，奇械师/2（向上取整），再查全施法表 */
export function multiclassCasterLevel(parts: Array<{ kind: 'full' | 'half' | 'third' | 'artificer'; level: number }>): number {
  return parts.reduce((n, p) => n + (p.kind === 'full' ? p.level : p.kind === 'half' ? Math.floor(p.level / 2) : p.kind === 'third' ? Math.floor(p.level / 3) : Math.ceil(p.level / 2)), 0)
}
