import type { Lib, Row } from './load'
import { arr, fold, refId, rec, ShapeError, shape, str, strs } from './util'

/** 职业与子职业的读取器：熟练、技能选项、起始装备、施法、授予。形状不认识就抛错。 */
export interface ClassProf {
  armor: string[]
  weaponCats: string[]
  weaponIds: string[]
  toolIds: string[]
  /** 工具里含“自选 N 种”之类选择的文字项——只能当文字，读不成结构 */
  toolProse: string[]
  skillChoose: number
  skillFrom: string[]
}

export function readProficiencies(c: Row, root: unknown = c.data.proficiencies): ClassProf {
  const p = rec(root)
  const out: ClassProf = { armor: strs(p.armor), weaponCats: [], weaponIds: [], toolIds: [], toolProse: [], skillChoose: 0, skillFrom: [] }
  for (const w of strs(p.weapons)) {
    const id = refId(w)
    if (id) out.weaponIds.push(id)
    else if (w === '简易') out.weaponCats.push('simple')
    else if (w === '军用') out.weaponCats.push('martial')
    else if (w === '火器') out.weaponCats.push('firearms')
    else throw new ShapeError(`${c.id} 武器熟练里有不认识的写法：${w}`)
  }
  for (const t of strs(p.tools)) {
    const id = refId(t)
    if (id) out.toolIds.push(id)
    else if (/\{\{ref:/.test(t) || /选|任/.test(t)) out.toolProse.push(t)
    else throw new ShapeError(`${c.id} 工具熟练里有不认识的写法：${t}`)
  }
  if (p.skills !== undefined) {
    const s = rec(p.skills)
    shape(typeof s.choose === 'number' && Array.isArray(s.from), `${c.id} 技能选项形状不对`)
    out.skillChoose = s.choose
    out.skillFrom = strs(s.from)
  }
  return out
}

export interface EquipOption { name?: string; qty: number; category?: string }
export interface EquipBlock { kind: 'fixed' | 'choice' | 'gold'; options: EquipOption[][]; gold?: { dice: string; multiplier: number } }

export function readEquipment(row: Row, field: 'startingEquipment' | 'equipment'): EquipBlock[] {
  const out: EquipBlock[] = []
  for (const b of arr(row.data[field])) {
    shape(b && typeof b === 'object', `${row.id} ${field} 里有非对象项`)
    const o = rec(b)
    const items = (list: unknown): EquipOption[] => arr(list).map((i) => {
      const it = rec(i)
      if (typeof it.item === 'string') return { name: it.item, qty: typeof it.qty === 'number' ? it.qty : 1 }
      if (typeof it.category === 'string') return { category: it.category, qty: typeof it.qty === 'number' ? it.qty : 1 }
      throw new ShapeError(`${row.id} ${field} 的物品形状不认识`)
    })
    if (o.fixed) out.push({ kind: 'fixed', options: [items(o.fixed)] })
    else if (o.choice) out.push({ kind: 'choice', options: arr(o.choice).map(items) })
    else if (o.gold) out.push({ kind: 'gold', options: [], gold: { dice: str(rec(o.gold).dice), multiplier: Number(rec(o.gold).multiplier ?? 1) } })
    else throw new ShapeError(`${row.id} ${field} 有不认识的块`)
  }
  return out
}

/** 物品中文名 → 条目编号。先精确，再去掉数量括号“(20)”、全半角括号后比较。找不到返回 undefined。 */
export function resolveItemName(l: Lib, name: string): string | undefined {
  const norm = (s: string): string => s.replace(/[（(][^）)]*[）)]/g, '').replace(/\s+/g, '')
  const items = l.of('item')
  const hit = items.find((r) => r.name === name) ?? items.find((r) => norm(r.name) === norm(name) && r.data.rarity === 'none')
  return hit?.id
}

export interface Casting { progression: string; cantrips: number[]; known: number[]; slots: number[][]; pact: Array<[number, number]> }
export function readSpellcasting(c: Row): Casting | undefined {
  const s = c.data.spellcasting
  if (s === undefined) return undefined
  const o = rec(s)
  if (typeof o.progression !== 'string') return undefined
  const out: Casting = { progression: o.progression, cantrips: arr(o.cantripsKnown).map(Number), known: arr(o.spellsKnown).map(Number), slots: [], pact: [] }
  for (const e of arr(o.slotsByLevel)) {
    const r = rec(e)
    const lv = Number(r.level)
    if (Array.isArray(r.slots)) out.slots[lv - 1] = r.slots.map(Number)
    else if (r.pact) out.pact[lv - 1] = [Number(rec(r.pact).count), Number(rec(r.pact).level)]
    else throw new ShapeError(`${c.id} 第 ${lv} 级的法术位形状不认识`)
  }
  return out
}

export interface Grant { level: number; items: string[]; optional: boolean }
export function readGrants(row: Row): Grant[] {
  return arr(row.data.advancement).flatMap((a) => {
    const o = rec(a)
    if (o.kind !== 'itemGrant') return []
    return [{ level: Number(o.level), items: strs(o.items), optional: o.optional === true }]
  })
}

/** 属性值提升的等级：advancement 里 kind=abilityScoreImprovement，或授予名字里带 ability-score-improvement 的特性。 */
export function asiLevels(l: Lib, c: Row): number[] {
  const direct = arr(c.data.advancement).map(rec).filter((a) => a.kind === 'abilityScoreImprovement').map((a) => Number(a.level))
  const viaFeature = readGrants(c).filter((g) => g.items.some((i) => /ability-score-improvement/.test(i) && l.get(i))).map((g) => g.level)
  return [...new Set([...direct, ...viaFeature])].sort((a, b) => a - b)
}

export const englishOf = (l: Lib, id: string): string => fold(l.get(id)?.nameEn ?? id.split('.')[1] ?? id)
