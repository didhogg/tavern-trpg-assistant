import { PHB_SKILLS } from './codes'
import type { Lib, Row } from './load'
import { fold, ShapeError, shape, str, strs, uniq } from './util'

/**
 * 「任选」记号展开器：把 `skill:*`、`tool:anyGamingSet`、`weapon:martial` 这类记号展开成具体的值。
 * 值是条目编号（物品、语言用 `lang:代码`，护甲组用 `armor:组名`，没有条目的熟练如载具用 `code:xxx`）。
 * 没见过的记号抛 ShapeError；含义不明的记号返回 ambiguous 说明，由调用方登记。
 */
export interface Expanded {
  values: string[]
  /** 含义不明时的说明；此时 values 为空 */
  ambiguous?: string
  /** 写法不是规范写法时给出规范写法（读得出，但数据里应统一） */
  spelling?: string
  /** 记号指向的东西没有对应的条目（如原初语的方言、载具熟练），读取器只能给出代码 */
  noEntry?: string
}

/** 书上原初语的四种方言（PHB 第 4 章语言表），数据里没有对应语言条目 */
const PRIMORDIAL_DIALECTS = ['aquan', 'auran', 'ignan', 'terran']

const TOOL_CATEGORY: Record<string, { tag: string; canon: string }> = {
  anyartisanstool: { tag: 'AT', canon: 'anyArtisansTool' },
  anygamingset: { tag: 'GS', canon: 'anyGamingSet' },
  gamingset: { tag: 'GS', canon: 'anyGamingSet' },
  anymusicalinstrument: { tag: 'INS', canon: 'anyMusicalInstrument' },
  musicalinstrument: { tag: 'INS', canon: 'anyMusicalInstrument' },
}

const tags = (r: Row): string[] => strs(r.data.tags)
const isBase = (r: Row): boolean => r.type === 'item' && !('variantOf' in r.data) && !('baseItem' in r.data) && r.data.rarity === 'none'

/** 书里的基础武器、基础护甲：没有魔法变体标记、稀有度为“无”的物品。 */
export function baseWeapons(l: Lib): Row[] { return l.of('item').filter((r) => isBase(r) && r.data.category === 'weapon' && r.data.weapon) }
export function baseArmors(l: Lib): Row[] { return l.of('item').filter((r) => isBase(r) && (r.data.category === 'armor' || r.data.category === 'shield') && r.data.armor) }
export function toolItems(l: Lib): Row[] { return l.of('item').filter((r) => isBase(r) && tags(r).some((t) => ['T', 'AT', 'INS', 'GS'].includes(t))) }

const weaponCat = (r: Row): string => str((r.data.weapon as Record<string, unknown>).category)

function byEnglish(rows: Row[], name: string): Row | undefined {
  const f = fold(name)
  return rows.find((r) => r.nameEn && fold(r.nameEn) === f) ?? rows.find((r) => fold(r.id.split('.')[1] ?? '') === f)
}

export function expandToken(l: Lib, token: string): Expanded {
  const m = /^([a-z]+):(.+)$/.exec(token)
  shape(m, `不认识的记号 ${token}`)
  const [, kind, rest] = m
  switch (kind) {
    case 'skill': {
      if (rest === '*') return { values: [...PHB_SKILLS] }
      const canon = PHB_SKILLS.find((s) => s === rest) ?? PHB_SKILLS.find((s) => s === rest.replace(/-/g, ' '))
      shape(canon, `不认识的技能 ${token}`)
      return { values: [canon], spelling: canon === rest ? undefined : `skill:${canon}` }
    }
    case 'lang': {
      const langs = l.of('language')
      const code = (r: Row): string => str(r.data.code)
      if (rest === '*') return { values: langs.filter((r) => ['standard', 'exotic'].includes(str(r.data.type))).map((r) => `lang:${code(r)}`) }
      if (rest === 'anyStandard') return { values: langs.filter((r) => r.data.type === 'standard').map((r) => `lang:${code(r)}`) }
      if (rest === 'other') return { values: [], ambiguous: 'lang:other 的含义没有约定（“另一种语言”？“除已有语言外任选”？）' }
      if (PRIMORDIAL_DIALECTS.includes(rest)) return { values: [`lang:${rest}`], noEntry: `${token}（原初语方言，没有语言条目）` }
      shape(langs.some((r) => code(r) === rest), `不认识的语言 ${token}`)
      return { values: [`lang:${rest}`] }
    }
    case 'weapon': {
      const w = baseWeapons(l)
      if (rest === '*') return { values: w.map((r) => r.id) }
      if (rest === 'martial' || rest === 'simple') return { values: w.filter((r) => weaponCat(r) === rest).map((r) => r.id) }
      if (rest === 'firearms') return { values: w.filter((r) => strs((r.data.weapon as Record<string, unknown>).properties).includes('AF')).map((r) => r.id) }
      const hit = byEnglish(w, rest)
      shape(hit, `不认识的武器 ${token}`)
      return { values: [hit.id] }
    }
    case 'armor': {
      shape(['light', 'medium', 'heavy', 'shield'].includes(rest), `不认识的护甲组 ${token}`)
      return { values: [`armor:${rest}`] }
    }
    case 'tool': {
      const tools = toolItems(l)
      const cat = TOOL_CATEGORY[fold(rest)]
      if (rest === '*') return { values: tools.map((r) => r.id) }
      if (cat) return { values: tools.filter((r) => tags(r).includes(cat.tag)).map((r) => r.id), spelling: cat.canon === rest ? undefined : `tool:${cat.canon}` }
      if (/^vehicles \((land|water)\)$/.test(rest)) return { values: [`code:${rest}`], noEntry: `${token}（载具熟练，没有条目）` }
      const hit = byEnglish(l.of('item').filter((r) => r.type === 'item'), rest)
      shape(hit, `不认识的工具 ${token}`)
      const canon = (hit.nameEn ?? '').toLowerCase()
      return { values: [hit.id], spelling: canon === rest ? undefined : `tool:${canon}` }
    }
    default:
      throw new ShapeError(`不认识的记号类别 ${token}`)
  }
}

export function expandPool(l: Lib, pool: string[]): Expanded {
  const out: Expanded = { values: [] }
  const spell: string[] = []
  const noEntry: string[] = []
  for (const t of pool) {
    const e = expandToken(l, t)
    out.values.push(...e.values)
    if (e.ambiguous) out.ambiguous = e.ambiguous
    if (e.spelling) spell.push(`${t}→${e.spelling}`)
    if (e.noEntry) noEntry.push(e.noEntry)
  }
  if (noEntry.length) out.noEntry = noEntry.join('; ')
  out.values = uniq(out.values)
  if (spell.length) out.spelling = spell.join('; ')
  return out
}
