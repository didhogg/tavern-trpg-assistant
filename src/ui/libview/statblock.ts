// 专门详情块（U9b 数值块 / U9c 物品）的"摘要行 + 分节"：按类别登记，从条目对象里取值。
// 只取数字、字符串和作者自己算好的中文字段（物品的 _entryType / _attunementCategory 等）；需要翻译的少数代号（体型之外的速度、技能、豁免、稀有度、伤害类型）用下面的登记表，加一项 = 加一行。
type Obj = Record<string, unknown>
export interface StatLine { label: string; value: string }
export interface StatSection { title: string; entries: unknown }
export interface Statblock { lines: StatLine[]; abilities: Array<{ key: string; label: string; score: number; mod: string }>; sections: StatSection[] }

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

export const ABILITIES: Array<[string, string]> = [['str', '力量'], ['dex', '敏捷'], ['con', '体质'], ['int', '智力'], ['wis', '感知'], ['cha', '魅力']]
const SPEEDS: Record<string, string> = { walk: '步行', burrow: '掘地', climb: '攀爬', fly: '飞行', swim: '游泳' }
const SKILLS: Record<string, string> = { acrobatics: '杂技', 'animal handling': '驯兽', arcana: '奥秘', athletics: '运动', deception: '欺瞒', history: '历史', insight: '洞悉', intimidation: '威吓', investigation: '调查', medicine: '医药', nature: '自然', perception: '察觉', performance: '表演', persuasion: '游说', religion: '宗教', 'sleight of hand': '巧手', stealth: '隐匿', survival: '求生' }
const RARITY: Record<string, string> = { none: '无', common: '普通', uncommon: '非普通', rare: '珍稀', 'very rare': '极珍稀', legendary: '传奇', artifact: '神器', varies: '多变', unknown: '未知' }
const DMG_TYPE: Record<string, string> = { S: '挥砍', P: '穿刺', B: '钝击' }
/** 数值块下面的分节：字段名 → 小节标题（顺序即显示顺序）。 */
const MONSTER_SECTIONS: Array<[string, string]> = [['trait', '特性'], ['action', '动作'], ['bonus', '附赠动作'], ['reaction', '反应'], ['legendary', '传奇动作'], ['mythic', '神话动作']]

export const signed = (n: number): string => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`)
export const modOf = (score: number): number => Math.floor((score - 10) / 2)

function acText(ac: unknown): string | null {
  const parts = (Array.isArray(ac) ? ac : [ac]).map((a) => {
    if (num(a) !== null) return String(a)
    if (!isObj(a) || num(a.ac) === null) return null
    const from = strs(a.from)
    return `${a.ac}${from.length ? `（${from.join('，')}）` : ''}${typeof a.condition === 'string' ? ` ${a.condition}` : ''}`
  }).filter((x): x is string => !!x)
  return parts.length ? parts.join('；') : null
}
function speedText(sp: unknown): string | null {
  if (!isObj(sp)) return null
  const parts = Object.entries(sp).filter(([k]) => k in SPEEDS).map(([k, v]) => {
    const n = isObj(v) ? num(v.number) : num(v)
    return n === null ? null : `${SPEEDS[k]} ${n} 尺${isObj(v) && typeof v.condition === 'string' ? ` ${v.condition}` : ''}`
  }).filter((x): x is string => !!x)
  return parts.length ? parts.join('，') : null
}
const bonuses = (o: unknown, names: Record<string, string>): string | null => {
  if (!isObj(o)) return null
  const parts = Object.entries(o).map(([k, v]) => (typeof v === 'string' ? `${names[k] ?? k} ${v}` : null)).filter((x): x is string => !!x)
  return parts.length ? parts.join('，') : null
}

/** 怪物 / 物件 / 载具的数值块：一行一项，读不到的行不出现（缺字段不整块消失）。 */
export function monsterBlock(m: unknown): Statblock {
  const o = isObj(m) ? m : {}
  const lines: StatLine[] = []
  const add = (label: string, value: string | null): void => { if (value) lines.push({ label, value }) }
  add('防御', acText(o.ac))
  if (isObj(o.hp) && num(o.hp.average) !== null) add('生命', `${o.hp.average}${typeof o.hp.formula === 'string' ? `（${o.hp.formula}）` : ''}`)
  add('速度', speedText(o.speed))
  add('豁免', bonuses(o.save, Object.fromEntries(ABILITIES)))
  add('技能', bonuses(o.skill, SKILLS))
  add('感官', [...strs(o.senses), ...(num(o.passive) !== null ? [`被动察觉 ${o.passive}`] : [])].join('，') || null)
  add('语言', strs(o.languages).join('，') || null)
  const abilities = ABILITIES.map(([key, label]) => ({ key, label, score: num(o[key]) })).filter((a): a is { key: string; label: string; score: number } => a.score !== null).map((a) => ({ ...a, mod: signed(modOf(a.score)) }))
  const spells = Array.isArray(o.spellcasting) ? o.spellcasting.filter(isObj) : []
  const sections = MONSTER_SECTIONS.map(([key, title]) => ({
    title,
    entries: [
      ...(Array.isArray(o[key]) ? o[key] : []),
      ...spells.filter((spell) => (spell.displayAs ?? 'trait') === key).map((spell) => ({ ...spell, type: 'spellcasting' })),
    ],
  })).filter((section) => section.entries.length)
  return { lines, abilities, sections }
}

const coin = (copper: number): string => (copper % 100 === 0 ? `${copper / 100} gp` : copper % 10 === 0 ? `${copper / 10} sp` : `${copper} cp`)

/** 物品的摘要行：类型 · 稀有度 · 价值 · 重量 · 同调 · 伤害 / 护甲（取作者算好的中文字段或数字）。 */
export function itemBlock(it: unknown): Statblock {
  const o = isObj(it) ? it : {}
  const lines: StatLine[] = []
  const add = (label: string, value: string | null): void => { if (value) lines.push({ label, value }) }
  add('类型', typeof o._entrySubType === 'string' && o._entrySubType ? o._entrySubType : typeof o._entryType === 'string' ? o._entryType : null)
  add('稀有度', typeof o.rarity === 'string' && o.rarity !== 'none' ? RARITY[o.rarity] ?? o.rarity : null)
  add('价值', num(o.value) !== null ? coin(o.value as number) : null)
  add('重量', num(o.weight) !== null ? `${o.weight} 磅` : null)
  add('同调', typeof o._attunementCategory === 'string' && o._attunementCategory !== '无需同调' ? o._attunementCategory : null)
  if (typeof o.dmg1 === 'string') add('伤害', `${o.dmg1}${typeof o.dmgType === 'string' ? ` ${DMG_TYPE[o.dmgType] ?? o.dmgType}` : ''}${typeof o.dmg2 === 'string' ? `（双手 ${o.dmg2}）` : ''}`)
  add('护甲', num(o.ac) !== null ? `AC ${o.ac}` : null)
  return { lines, abilities: [], sections: [] }
}

/** 食谱：类型 / 份量 + 食材、做法、备注三节（字段取自作者数据：dishTypes / makes / _fullIngredients / instructions / noteCook）。 */
export function recipeBlock(r: unknown): Statblock {
  const o = isObj(r) ? r : {}
  const lines: StatLine[] = []
  const add = (label: string, value: string | null): void => { if (value) lines.push({ label, value }) }
  add('类型', strs(o.dishTypes).join('、') || null)
  add('份量', typeof o.makes === 'string' ? o.makes : null)
  const ing = (Array.isArray(o._fullIngredients) ? o._fullIngredients : Array.isArray(o.ingredients) ? o.ingredients : []).map((i) => (isObj(i) ? i.entry : i)).filter((x) => typeof x === 'string')
  const steps = strs(o.instructions)
  const notes = strs(o.noteCook)
  const sections: StatSection[] = []
  if (ing.length) sections.push({ title: '食材', entries: { type: 'list', items: ing } })
  if (steps.length) sections.push({ title: '做法', entries: { type: 'list', items: steps } })
  if (notes.length) sections.push({ title: '备注', entries: notes })
  return { lines, abilities: [], sections }
}

/** 类别 → 数值块函数（登记表；没登记的类别只有通用摘要行）。 */
export const BLOCKS: Record<string, (item: unknown) => Statblock> = { monster: monsterBlock, object: monsterBlock, vehicle: monsterBlock, item: itemBlock, baseitem: itemBlock, recipe: recipeBlock }
