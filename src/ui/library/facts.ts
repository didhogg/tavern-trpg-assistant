import type { Entry } from '../../schemas/pack'
import type { TextBlock } from '../../schemas/text'

/** 条目的结构化数据 → 可读的「事实」列表（资料卡 U11 之前的通用展示）。 */
export type Part = string | { ref: string }

export interface Fact {
  label: string
  parts?: Part[]
  table?: { cols: string[]; rows: string[][] }
  sections?: Array<{ name: string; text: TextBlock[] }>
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')

const ABILITY: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const SKILL: Record<string, string> = {
  acrobatics: '杂技', 'animal handling': '驯兽', arcana: '奥秘', athletics: '运动', deception: '欺瞒', history: '历史', insight: '洞悉',
  intimidation: '威吓', investigation: '调查', medicine: '医药', nature: '自然', perception: '察觉', performance: '表演', persuasion: '游说',
  religion: '宗教', 'sleight of hand': '巧手', stealth: '隐匿', survival: '求生',
}
const ARMOR: Record<string, string> = { light: '轻甲', medium: '中甲', heavy: '重甲', shield: '盾牌' }
const SIZE: Record<string, string> = { T: '微型', S: '小型', M: '中型', L: '大型', H: '巨型', G: '超巨型' }
const MOVE: Record<string, string> = { walk: '步行', swim: '游泳', fly: '飞行', climb: '攀爬', burrow: '掘地', hover: '悬浮' }
const CREATURE: Record<string, string> = {
  aberration: '异怪', beast: '野兽', celestial: '天界生物', construct: '构装体', dragon: '龙', elemental: '元素生物', fey: '精类', fiend: '邪魔',
  giant: '巨人', humanoid: '类人生物', monstrosity: '怪兽', ooze: '泥怪', plant: '植物', undead: '不死生物',
}
const ALIGN: Record<string, string> = { L: '守序', N: '中立', C: '混乱', G: '善良', E: '邪恶', U: '无阵营', A: '任意阵营' }
const SCHOOL: Record<string, string> = {
  abjuration: '防护', conjuration: '咒法', divination: '预言', enchantment: '惑控', evocation: '塑能', illusion: '幻术', necromancy: '死灵', transmutation: '变化',
}
const UNIT: Record<string, string> = { feet: '尺', miles: '里', action: '动作', bonus: '附赠动作', reaction: '反应', minute: '分钟', hour: '小时', round: '轮', day: '天' }
const RARITY: Record<string, string> = { none: '无', common: '普通', uncommon: '非普通', rare: '珍稀', 'very rare': '极珍稀', legendary: '传说', artifact: '神器', varies: '不定' }

const join = (items: string[], sep = '、'): string => items.filter(Boolean).join(sep)
const abilityList = (v: unknown): string => join(arr(v).map((a) => ABILITY[str(a)] ?? str(a)))
const unit = (u: unknown): string => UNIT[str(u)] ?? str(u)

function bonusMap(v: unknown, labels: Record<string, string>): string {
  return isObj(v) ? join(Object.entries(v).map(([k, n]) => `${labels[k] ?? k} ${Number(n) >= 0 ? '+' : ''}${n}`), ' ') : ''
}

function formatRange(range: unknown): string {
  if (!isObj(range)) return ''
  const t = str(range.type)
  if (range.amount !== undefined) return `${range.amount} ${unit(range.unit)}`
  return ({ self: '自身', touch: '触及', sight: '视线内', unlimited: '无限', special: '特殊' } as Record<string, string>)[t] ?? t
}

function formatDuration(list: unknown): string {
  return join(arr(list).map((d) => {
    if (!isObj(d)) return ''
    const t = str(d.type)
    const base = t === 'instant' ? '即时' : t === 'permanent' ? '直到被解除' : t === 'special' ? '特殊' : d.amount !== undefined ? `${d.amount} ${unit(d.unit)}` : t
    return d.concentration ? `专注，至多 ${base}` : base
  }), '；')
}

function formatComponents(c: unknown): string {
  if (!isObj(c)) return ''
  const parts = [c.v ? 'V' : '', c.s ? 'S' : '', c.m ? (typeof c.m === 'string' ? `M（${c.m}）` : 'M') : '']
  return join(parts)
}

function money(cp: number): string {
  if (cp >= 100) return `${cp / 100} gp`
  if (cp >= 10) return `${cp / 10} sp`
  return `${cp} cp`
}

function formatCr(v: unknown): string {
  return str(v)
}

/** 按等级分组的特性：advancement 里的 itemGrant。 */
function featuresByLevel(advancement: unknown): Fact | undefined {
  const rows: string[][] = []
  const parts: Fact['parts'] = []
  const byLevel = new Map<number, string[]>()
  for (const a of arr(advancement)) {
    if (!isObj(a) || a.kind !== 'itemGrant') continue
    const level = Number(a.level) || 1
    byLevel.set(level, [...(byLevel.get(level) ?? []), ...arr(a.items).map(str)])
  }
  void rows
  for (const [level, ids] of [...byLevel].sort((x, y) => x[0] - y[0])) {
    parts.push(`\n${level} 级：`)
    ids.forEach((id, i) => {
      if (i) parts.push('、')
      parts.push({ ref: id })
    })
  }
  return parts.length ? { label: '特性', parts } : undefined
}

function named(label: string, v: unknown): Fact | undefined {
  const sections = arr(v)
    .filter(isObj)
    .map((x) => ({ name: str(x.name), text: arr(x.text) as TextBlock[] }))
    .filter((s) => s.name || s.text.length)
  return sections.length ? { label, sections } : undefined
}

const add = (out: Fact[], label: string, value: string | undefined | false): void => {
  if (value) out.push({ label, parts: [value] })
}

function classFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  add(out, '生命骰', d.hitDie ? `d${d.hitDie}` : '')
  add(out, '主要属性', abilityList(d.primaryAbility))
  add(out, '豁免熟练', abilityList(d.saves))
  if (isObj(d.proficiencies)) {
    const p = d.proficiencies
    add(out, '护甲熟练', join(arr(p.armor).map((a) => ARMOR[str(a)] ?? str(a))))
    add(out, '武器熟练', join(arr(p.weapons).map(str)))
    add(out, '工具熟练', join(arr(p.tools).map(str)))
    if (isObj(p.skills)) add(out, '技能熟练', `从 ${join(arr(p.skills.from).map((s) => SKILL[str(s)] ?? str(s)))} 中选 ${p.skills.choose} 项`)
  }
  if (arr(d.startingEquipment).length) out.push({ label: '起始装备', parts: arr(d.startingEquipment).flatMap((s, i) => [i ? '\n' : '', str(s)]) })
  if (d.subclassTitle) add(out, '子职业', `${d.subclassTitle}（${d.subclassLevel} 级选择）`)
  if (isObj(d.table) && arr(d.table.rows).length) {
    const cols = ['等级', ...arr(d.table.cols).map(str)]
    out.push({ label: '职业表', table: { cols, rows: arr(d.table.rows).filter(isObj).map((r) => [str(r.level), ...arr(r.values).map(str)]) } })
  }
  const f = featuresByLevel(d.advancement)
  if (f) out.push(f)
  return out
}

function monsterFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  const type = isObj(d.creatureType) ? CREATURE[str(d.creatureType.type)] ?? str(d.creatureType.type) : ''
  const align = str(d.alignment).split(' ').map((c) => ALIGN[c] ?? c).join('')
  add(out, '类型', join([arr(d.size).map((s) => SIZE[str(s)] ?? str(s)).join('/'), type, align], ' · '))
  add(out, '护甲等级', join(arr(d.ac).map((a) => (isObj(a) ? `${a.value}${a.from ? `（${arr(a.from).map(str).join('、')}）` : ''}` : str(a)))))
  if (isObj(d.hp)) add(out, '生命值', `${d.hp.average}${d.hp.formula ? `（${d.hp.formula}）` : ''}`)
  add(out, '速度', isObj(d.speed) ? join(Object.entries(d.speed).map(([k, v]) => `${MOVE[k] ?? k} ${v} 尺`), '，') : '')
  add(out, '属性', isObj(d.abilities) ? join(Object.entries(ABILITY).map(([k, n]) => `${n} ${(d.abilities as Obj)[k] ?? '—'}`), '  ') : '')
  add(out, '豁免', bonusMap(d.saves, ABILITY))
  add(out, '技能', bonusMap(d.skills, SKILL))
  add(out, '伤害易伤', join(arr(d.vulnerable).map(str)))
  add(out, '伤害抗性', join(arr(d.resist).map(str)))
  add(out, '伤害免疫', join(arr(d.immune).map(str)))
  add(out, '状态免疫', join(arr(d.conditionImmune).map(str)))
  add(out, '感官', join([...arr(d.senses).map(str), d.passive ? `被动察觉 ${d.passive}` : '']))
  add(out, '语言', join(arr(d.languages).map(str)) )
  add(out, '挑战等级', formatCr(d.cr))
  for (const [label, key] of [['特性', 'traits'], ['动作', 'actions'], ['附赠动作', 'bonusActions'], ['反应', 'reactions']] as const) {
    const f = named(label, d[key])
    if (f) out.push(f)
  }
  if (isObj(d.legendary)) {
    const f = named('传奇动作', d.legendary.actions)
    if (f) out.push(f)
  }
  return out
}

function spellFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  const level = Number(d.level)
  add(out, '环阶', `${level === 0 ? '戏法' : `${level} 环`} · ${SCHOOL[str(d.school)] ?? str(d.school)}${d.ritual ? ' · 仪式' : ''}`)
  add(out, '施法时间', join(arr(d.castTime).map((c) => (isObj(c) ? `${c.n ?? 1} ${unit(c.unit)}` : '')), '；'))
  add(out, '施法距离', formatRange(d.range))
  add(out, '法术成分', formatComponents(d.components))
  add(out, '持续时间', formatDuration(d.duration))
  if (arr(d.classes).length) out.push({ label: '职业', parts: arr(d.classes).flatMap((c, i) => [i ? '、' : '', { ref: str(c) }]) })
  return out
}

function raceFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  add(out, '属性加值', isObj(d.abilityBonus) ? bonusMap(d.abilityBonus.fixed, ABILITY) : '')
  add(out, '体型', arr(d.size).map((s) => SIZE[str(s)] ?? str(s)).join('/'))
  add(out, '速度', isObj(d.speed) ? join(Object.entries(d.speed).map(([k, v]) => `${MOVE[k] ?? k} ${v} 尺`), '，') : '')
  add(out, '黑暗视觉', d.darkvision ? `${d.darkvision} 尺` : '')
  add(out, '语言', join(arr(d.languages).map(str)))
  if (arr(d.traits).length) out.push({ label: '种族特质', parts: arr(d.traits).flatMap((t, i) => [i ? '、' : '', { ref: str(t) }]) })
  if (d.parentRace) out.push({ label: '所属种族', parts: [{ ref: str(d.parentRace) }] })
  return out
}

function itemFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  add(out, '类别', str(d.category))
  add(out, '稀有度', d.rarity ? RARITY[str(d.rarity)] ?? str(d.rarity) : '')
  add(out, '价格', typeof d.value === 'number' ? money(d.value) : '')
  add(out, '重量', d.weight ? `${d.weight} 磅` : '')
  add(out, '同调', isObj(d.attunement) && d.attunement.required ? `需要${d.attunement.by ? `（${str(d.attunement.by)}）` : ''}` : '')
  return out
}

function tableFacts(d: Obj): Fact[] {
  const cols = arr(d.cols).map(str)
  const rows = arr(d.rows).filter(isObj).map((r) => [r.min === r.max ? str(r.min) : `${r.min}–${r.max}`, ...arr(r.cells).map(str)])
  return rows.length ? [{ label: `${d.dice ? `${d.dice} ` : ''}随机表`, table: { cols: [d.dice ? str(d.dice) : '点数', ...cols], rows } }] : []
}

/** 取条目的事实列表；没有结构化数据时返回空数组。 */
export function entryFacts(entry: Pick<Entry, 'type' | 'data'>): Fact[] {
  const d = entry.data as Obj
  switch (entry.type) {
    case 'class': return classFacts(d)
    case 'subclass': {
      const out: Fact[] = []
      if (d.classId) out.push({ label: '所属职业', parts: [{ ref: str(d.classId) }] })
      const f = featuresByLevel(d.advancement)
      if (f) out.push(f)
      return out
    }
    case 'monster': return monsterFacts(d)
    case 'spell': return spellFacts(d)
    case 'race':
    case 'subrace': return raceFacts(d)
    case 'item': return itemFacts(d)
    case 'table': return tableFacts(d)
    case 'feature': {
      const out: Fact[] = []
      add(out, '等级', d.level ? `${d.level} 级` : '')
      if (d.owner) out.push({ label: '来自', parts: [{ ref: str(d.owner) }] })
      return out
    }
    default: return []
  }
}

export function collectRefs(facts: Fact[]): string[] {
  const ids = new Set<string>()
  for (const f of facts) for (const p of f.parts ?? []) if (typeof p !== 'string') ids.add(p.ref)
  return [...ids]
}
