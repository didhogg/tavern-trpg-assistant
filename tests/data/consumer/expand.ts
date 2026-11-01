import { PHB_SKILLS } from './codes'
import type { Lib, Row } from './load'
import { arr, fold, rec, ShapeError, shape, str, strs, uniq } from './util'

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

/** 书上原初语的四种方言（PHB 第 4 章语言表）。语言条目自己带 `dialectCodes` 时解析到原初语条目；否则只给出代码（noEntry）。 */
const PRIMORDIAL_DIALECTS = ['aquan', 'auran', 'ignan', 'terran']
/** 没有条目的熟练用两个固定代码（G2.5 约定，写进 docs/模块数据约定.md）。 */
const FIXED_CODES = ['vehicles-land', 'vehicles-water']
const FOCUS_KINDS = ['arcane', 'druidic', 'holy']

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
      if (rest === 'other') return { values: [], ambiguous: 'lang:other 被禁止（含义不明）：改成该种族自己的语言记号，查不到就报错后手动给条目查原书加数据' }
      if (PRIMORDIAL_DIALECTS.includes(rest)) {
        const owner = langs.find((r) => arr(r.data.dialectCodes).some((d) => rec(d).code === rest))
        return owner ? { values: [`lang:${rest}`] } : { values: [`lang:${rest}`], noEntry: `${token}（原初语方言，没有语言条目）` }
      }
      shape(langs.some((r) => code(r) === rest), `不认识的语言 ${token}`)
      return { values: [`lang:${rest}`] }
    }
    case 'weapon': {
      const w = baseWeapons(l)
      if (rest === '*') return { values: w.map((r) => r.id) }
      if (rest === 'martial' || rest === 'simple') return { values: w.filter((r) => weaponCat(r) === rest).map((r) => r.id) }
      // 近战/远程：看物品自带的 M / R 标签（飞镖是 R，手斧是 M）；每个基础武器都必须带其中之一
      const melee = /^(simple|martial)-melee$/.exec(rest)
      if (melee) {
        shape(w.every((r) => tags(r).includes('M') || tags(r).includes('R')), '有基础武器既不是近战也不是远程（缺 M/R 标签）')
        return { values: w.filter((r) => weaponCat(r) === melee[1] && tags(r).includes('M')).map((r) => r.id) }
      }
      if (rest === 'firearms') return { values: w.filter((r) => strs((r.data.weapon as Record<string, unknown>).properties).includes('AF')).map((r) => r.id) }
      const hit = byEnglish(w, rest)
      shape(hit, `不认识的武器 ${token}`)
      return { values: [hit.id] }
    }
    case 'focus': {
      // 法器：奥术法器、德鲁伊法器、圣徽（物品的 facets.scf 标明是哪一种）
      shape(FOCUS_KINDS.includes(rest), `不认识的法器类别 ${token}`)
      const facet = rest === 'druidic' ? 'druid' : rest // 物品里德鲁伊法器的标记是 druid
      return { values: l.of('item').filter((r) => isBase(r) && r.data.category !== 'family' && tags(r).includes('SCF') && strs((r.data.facets as Record<string, unknown> | undefined)?.scf).includes(facet)).map((r) => r.id) }
    }
    case 'code': {
      shape(FIXED_CODES.includes(rest), `不认识的固定代码 ${token}`)
      return { values: [token] }
    }
    case 'spell': return expandSpellPool(l, rest, token)
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

/** 职业 id 的第二段：class.wizard.phb → wizard */
const classShort = (id: string): string => id.split('.')[1] ?? ''

/** 某职业的法术表：法术自己写了这个职业的 ＋ 已安装的锚点特性（spellLists）加进来的。 */
export function classSpellIds(l: Lib, short: string): Set<string> {
  const out = new Set<string>()
  for (const s of l.of('spell')) if (strs(s.data.classes).some((c) => classShort(c) === short)) out.add(s.id)
  for (const f of l.of('feature')) for (const item of arr(f.data.spellLists).map(rec)) if (classShort(str(item.to)) === short) for (const id of strs(item.spells)) out.add(id)
  return out
}

const SPELL_KEYS = ['class', 'level', 'school', 'ritual', 'attack']

/**
 * 法术池记号：`spell:class=<职业短名|any|@选择id>,level=<0-9>[,school=a|b][,ritual=true][,attack=true]`。
 * `@选择id` 要靠调用方给出那个选择的结果（choices：选择 id → 职业短名）；没给 = 含义不明（ambiguous）。
 */
export function expandSpellPool(l: Lib, rest: string, token: string, choices: Record<string, string> = {}): Expanded {
  const kv = new Map<string, string>()
  for (const part of rest.split(',')) {
    const m = /^([a-z]+)=(.+)$/.exec(part)
    shape(m, `法术池记号写法不对 ${token}`)
    shape(SPELL_KEYS.includes(m[1]) && !kv.has(m[1]), `法术池记号的键不认识或重复：${m[1]}（${token}）`)
    kv.set(m[1], m[2])
  }
  shape(kv.has('class') && kv.has('level') && /^[0-9]$/.test(kv.get('level')!), `法术池记号必须有 class 和 0–9 的 level：${token}`)
  const cls = kv.get('class')!
  const wantedClass = cls.startsWith('@') ? choices[cls.slice(1)] : cls
  if (wantedClass === undefined) return { values: [], ambiguous: `${token} 引用了还没有结果的选择 ${cls}` }
  const schools = kv.get('school')?.split('|')
  shape(!schools || schools.every((x) => ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'].includes(x)), `不认识的学派 ${token}`)
  shape(!kv.has('ritual') || kv.get('ritual') === 'true', `ritual 只能写 true：${token}`)
  shape(!kv.has('attack') || kv.get('attack') === 'true', `attack 只能写 true：${token}`)
  // 「需要攻击检定」看法术的 attack 字段（来源 spellAttack，第 1 站导入）；库里还没有任何法术带它时明确报错，不悄悄给空池
  shape(!kv.has('attack') || l.of('spell').some((s) => s.data.attack !== undefined), 'attack=true 需要法术的 attack 字段，但库里还没有任何法术带它（第 1 站导入 spellAttack 之前不能用）')
  const inClass = wantedClass === 'any' ? undefined : classSpellIds(l, wantedClass)
  shape(inClass === undefined || inClass.size > 0, `没有职业「${wantedClass}」的法术表：${token}`)
  const level = Number(kv.get('level'))
  return {
    values: l.of('spell').filter((s) => s.data.level === level && (!inClass || inClass.has(s.id)) && (!schools || schools.includes(str(s.data.school))) && (!kv.has('ritual') || s.data.ritual === true) && (!kv.has('attack') || s.data.attack !== undefined)).map((s) => s.id),
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
