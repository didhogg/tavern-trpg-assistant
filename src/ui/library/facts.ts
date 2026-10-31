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

import { ABILITY, ALIGNMENT, ARMOR_CATEGORY, CREATURE, DAMAGE, ITEM_CATEGORY, LANGUAGE, MOVE, RANGE_SHAPE, RANGE_WORD, RARITY, RECHARGE, RULE_CATEGORY, SCHOOL, SIZE, SKILL, TABLE_KIND, TOOL, UNIT, WEAPON_CATEGORY, WEAPON_PROPERTY, tr, trCode, trWords } from './zh'

const join = (items: string[], sep = '、'): string => items.filter(Boolean).join(sep)
const abilityList = (v: unknown): string => list(v, ABILITY)
const unit = (u: unknown): string => tr(UNIT, u)
const list = (v: unknown, map: Record<string, string>): string => {
  if (isObj(v)) {
    const fixed = arr(v.fixed).map((x) => tr(map, x))
    const choose = isObj(v.choose) ? `自选 ${v.choose.count ?? 1} 项` : ''
    return join([...fixed, choose].filter(Boolean))
  }
  return join(arr(v).map((x) => tr(map, x)))
}

function equipmentText(v: unknown): string {
  if (typeof v === 'string') return v
  if (!isObj(v)) return ''
  const fixed = arr(v.fixed).map((item) => isObj(item) ? `${str(item.item)}${Number(item.qty ?? 1) > 1 ? `×${item.qty}` : ''}` : str(item))
  const choices = arr(v.choice).map((group) => arr(group).map((item) => isObj(item) ? `${str(item.item)}${Number(item.qty ?? 1) > 1 ? `×${item.qty}` : ''}` : str(item)).join(' / ')).filter(Boolean)
  const gold = isObj(v.gold) ? `${str(v.gold.dice)}×${Number(v.gold.multiplier ?? 1)} gp` : ''
  return join([...fixed, ...choices.map((c) => `(${c})`), gold].filter(Boolean), '，')
}

function bonusMap(v: unknown, labels: Record<string, string>): string {
  return isObj(v) ? join(Object.entries(v).map(([k, n]) => `${labels[k] ?? k} ${Number(n) >= 0 ? '+' : ''}${n}`), ' ') : ''
}

function formatRange(range: unknown): string {
  if (!isObj(range)) return ''
  const t = str(range.type)
  const shape = t === 'point' ? '' : `${tr(RANGE_SHAPE, t)} `
  if (range.amount !== undefined) return `${shape}${range.amount} ${unit(range.unit)}`
  return tr(RANGE_WORD, range.unit ?? t)
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
    add(out, '护甲熟练', list(p.armor, ARMOR_CATEGORY))
    add(out, '武器熟练', join(arr(p.weapons).map(str)))
    add(out, '工具熟练', list(p.tools, TOOL))
    if (isObj(p.skills)) add(out, '技能熟练', `从 ${join(arr(p.skills.from).map((s) => SKILL[str(s)] ?? str(s)))} 中选 ${p.skills.choose} 项`)
  }
  if (arr(d.startingEquipment).length) out.push({ label: '起始装备', parts: arr(d.startingEquipment).flatMap((s, i) => [i ? '\n' : '', equipmentText(s)]) })
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
  const type = isObj(d.creatureType) ? tr(CREATURE, d.creatureType.type) : ''
  const align = str(d.alignment).split(' ').map((c) => tr(ALIGNMENT, c)).join('')
  add(out, '类型', join([arr(d.size).map((x) => tr(SIZE, x)).join('/'), type, align], ' · '))
  add(out, '护甲等级', join(arr(d.ac).map((a) => (isObj(a) ? `${a.value}${a.from ? `（${Array.isArray(a.from) ? arr(a.from).map(str).join('、') : str(a.from)}）` : ''}${a.condition ? (a.braces ? `（${str(a.condition)}）` : ` ${str(a.condition)}`) : ''}` : str(a)))))
  if (isObj(d.hp)) add(out, '生命值', `${d.hp.average}${d.hp.formula ? `（${d.hp.formula}）` : ''}`)
  add(out, '速度', isObj(d.speed) ? join(Object.entries(d.speed).map(([k, v]) => `${tr(MOVE, k)} ${v} 尺`), '，') : '')
  add(out, '属性', isObj(d.abilities) ? join(Object.entries(ABILITY).map(([k, n]) => `${n} ${(d.abilities as Obj)[k] ?? '—'}`), '  ') : '')
  add(out, '豁免', bonusMap(d.saves, ABILITY))
  add(out, '技能', bonusMap(d.skills, SKILL))
  add(out, '伤害易伤', join(arr(d.vulnerable).map((x) => trWords(str(x)))))
  add(out, '伤害抗性', join(arr(d.resist).map((x) => trWords(str(x)))))
  add(out, '伤害免疫', join(arr(d.immune).map((x) => trWords(str(x)))))
  add(out, '状态免疫', join(arr(d.conditionImmune).map((x) => trWords(str(x)))))
  add(out, '感官', join([...arr(d.senses).map(str), d.passive ? `被动察觉 ${d.passive}` : '']))
  add(out, '语言', join(arr(d.languages).map((x) => tr(LANGUAGE, x))))
  add(out, '挑战等级', formatCr(d.cr))
  for (const [label, key] of [['特性', 'traits'], ['动作', 'actions'], ['附赠动作', 'bonusActions'], ['反应', 'reactions']] as const) {
    const f = named(label, d[key])
    if (f) out.push(f)
  }
  if (isObj(d.legendary)) {
    const f = named('传奇动作', d.legendary.actions)
    if (f) out.push(f)
  }
  if (arr(d.attachedItems).length) out.push({ label: '携带物品', parts: arr(d.attachedItems).map(str).flatMap((id, i) => [i ? '、' : '', { ref: id }]) })
  return out
}

function spellFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  const level = Number(d.level)
  add(out, '环阶', `${level === 0 ? '戏法' : `${level} 环`} · ${tr(SCHOOL, d.school)}${d.ritual ? ' · 仪式' : ''}`)
  add(out, '施法时间', join(arr(d.castTime).map((c) => (isObj(c) ? `${c.n ?? 1} ${unit(c.unit)}` : '')), '；'))
  add(out, '施法距离', formatRange(d.range))
  add(out, '法术成分', formatComponents(d.components))
  add(out, '持续时间', formatDuration(d.duration))
  for (const [key, label] of [['damageInflict', '造成伤害'], ['conditionInflict', '施加状态'], ['conditionImmune', '赋予状态免疫'], ['damageResist', '赋予伤害抗性'], ['damageImmune', '赋予伤害免疫'], ['damageVulnerable', '造成伤害易伤'], ['affectsCreatureType', '影响的生物']] as const) add(out, label, join(arr(d[key]).map((x) => trWords(str(x)))))
  add(out, '相关属性检定', abilityList(d.abilityCheck))
  if (arr(d.classes).length) out.push({ label: '职业', parts: arr(d.classes).flatMap((c, i) => [i ? '、' : '', { ref: str(c) }]) })
  return out
}

function raceFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  add(out, '属性加值', isObj(d.abilityBonus) ? bonusMap(d.abilityBonus.fixed, ABILITY) : '')
  add(out, '体型', arr(d.size).map((x) => tr(SIZE, x)).join('/'))
  add(out, '速度', isObj(d.speed) ? join(Object.entries(d.speed).map(([k, v]) => `${tr(MOVE, k)} ${v} 尺`), '，') : '')
  add(out, '黑暗视觉', d.darkvision ? `${d.darkvision} 尺` : '')
  if (isObj(d.proficiencies)) {
    add(out, '技能熟练', list(d.proficiencies.skills, SKILL))
    add(out, '工具熟练', list(d.proficiencies.tools, TOOL))
    add(out, '武器熟练', join(arr((d.proficiencies as Obj).weapons).map(str)))
    add(out, '护甲熟练', list(d.proficiencies.armor, ARMOR_CATEGORY))
  } else add(out, '熟练项', list(d.proficiencies, { ...SKILL, ...TOOL }))
  add(out, '语言', list(d.languages, LANGUAGE))
  if (arr(d.traits).length) out.push({ label: '种族特质', parts: arr(d.traits).flatMap((t, i) => [i ? '、' : '', { ref: str(t) }]) })
  if (d.parentRace) out.push({ label: '所属种族', parts: [{ ref: str(d.parentRace) }] })
  return out
}

function backgroundFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  if (isObj(d.proficiencies)) {
    add(out, '技能熟练', list(d.proficiencies.skills, SKILL))
    add(out, '工具熟练', list(d.proficiencies.tools, TOOL))
    add(out, '语言', list(d.proficiencies.languages, LANGUAGE))
  }
  if (typeof d.feature === 'string') out.push({ label: '背景特性', parts: [{ ref: d.feature }] })
  return out
}

/** 物品附带的法术：随意施放、每日 N 次、耗 N 点充能、限用次数、其他；法术写条目 id，升环写成 `id#环数`。 */
function spellParts(ids: unknown): Part[] {
  return arr(ids).map(str).filter(Boolean).flatMap((raw, i) => { const [id, level] = raw.split('#'); return [i ? '、' : '', { ref: id }, level ? `（${level} 环）` : ''] })
}
function attachedSpellFacts(v: unknown): Fact[] {
  if (!isObj(v)) return []
  const out: Fact[] = []
  if (arr(v.will).length) out.push({ label: '附带法术·随意施放', parts: spellParts(v.will) })
  for (const [key, label] of [['daily', '每日'], ['charges', '耗充能'], ['limited', '限用']] as const) {
    const group = v[key]
    if (isObj(group)) for (const [n, ids] of Object.entries(group)) out.push({ label: `附带法术·${label}${key === 'charges' ? ` ${n} 点` : key === 'daily' ? ` ${n.replace('e', '')} 次${n.endsWith('e') ? '（每个）' : ''}` : ` ${n} 次`}`, parts: spellParts(ids) })
  }
  if (arr(v.other).length) out.push({ label: '附带法术·其他', parts: spellParts(v.other) })
  if (typeof v.ability === 'string') out.push({ label: '附带法术·施法属性', parts: [tr(ABILITY, v.ability)] })
  return out
}
function abilityGrantText(v: unknown): string {
  if (!isObj(v) || !isObj(v.static)) return isObj(v) ? '见正文' : ''
  return join(Object.entries(v.static).map(([k, n]) => `${tr(ABILITY, k)} ${n}`), '，')
}

function itemFacts(d: Obj): Fact[] {
  const out: Fact[] = []
  add(out, '类别', tr(ITEM_CATEGORY, d.category))
  add(out, '稀有度', d.rarity ? tr(RARITY, d.rarity) : '')
  if (isObj(d.weapon)) {
    add(out, '武器类别', tr(WEAPON_CATEGORY, d.weapon.category))
    add(out, '伤害', join(arr(d.weapon.damage).map((x) => (isObj(x) ? `${x.dice} ${tr(DAMAGE, x.type)}` : '')), '；') + (d.weapon.versatile ? `（两用 ${d.weapon.versatile}）` : ''))
    add(out, '武器属性', join(arr(d.weapon.properties).map((x) => trCode(WEAPON_PROPERTY, x))))
    if (isObj(d.weapon.range) && d.weapon.range.normal) add(out, '射程', `${d.weapon.range.normal}${d.weapon.range.long ? `/${d.weapon.range.long}` : ''} 尺`)
  }
  if (isObj(d.armor)) {
    add(out, '护甲类别', tr(ARMOR_CATEGORY, d.armor.category))
    add(out, '护甲等级', d.armor.ac !== undefined ? String(d.armor.ac) : '')
    add(out, '隐匿', d.armor.stealthDisadvantage ? '劣势' : '')
  }
  if (isObj(d.bonuses)) add(out, '加值', join(Object.entries(d.bonuses).map(([k, v]) => `${({ attack: '攻击', damage: '伤害', ac: '护甲等级', save: '豁免', spellAttack: '法术攻击', spellDc: '法术豁免 DC' } as Record<string, string>)[k] ?? k} ${v}`), '，'))
  if (isObj(d.charges)) add(out, '充能', `${d.charges.max} 次，${tr(RECHARGE, d.charges.recharge)}恢复`)
  add(out, '价格', typeof d.value === 'number' ? money(d.value) : '')
  add(out, '重量', d.weight ? `${d.weight} 磅` : '')
  add(out, '同调', isObj(d.attunement) && d.attunement.required ? `需要${d.attunement.by ? `（${str(d.attunement.by)}）` : ''}` : '')
  add(out, '层级', str(d.tier))
  add(out, '标记', d.wondrous === true ? '奇物' : '')
  add(out, '赋予属性值', abilityGrantText(d.abilityGrant))
  out.push(...attachedSpellFacts(d.attachedSpells))
  return out
}

function tableFacts(d: Obj): Fact[] {
  const cols = arr(d.cols).map(str)
  const kind = str(d.kind) || 'roll'
  const isRef = kind === 'ref'
  const modifier = isObj(d.modifier) ? `＋修正值（${str(d.modifier.prompt)}）` : ''
  const rows = arr(d.rows).filter(isObj).map((r) => {
    const prefix = isRef ? [] : [r.min === r.max ? str(r.min) : `${r.min}–${r.max}`]
    const cells = arr(r.cells).map((cell) => `${r.indent === true ? '　' : ''}${str(cell)}`)
    return [...prefix, ...cells]
  })
  if (!rows.length) return []
  const out: Fact[] = [{ label: `${d.dice ? `${d.dice}${modifier} ` : ''}${tr(TABLE_KIND, kind)}`, table: { cols: isRef ? cols : [d.dice ? str(d.dice) : '点数', ...cols], rows } }]
  if (isObj(d.parent) && str(d.parent.id)) out.push({ label: '所属', parts: [{ ref: str(d.parent.id) }] })
  else if (isObj(d.chapter)) out.push({ label: '所属章节', parts: [`${str(d.chapter.book)}·${str(d.chapter.name)}`] })
  return out
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
    case 'background': return backgroundFacts(d)
    case 'item': return itemFacts(d)
    case 'table': return tableFacts(d)
    case 'feature': {
      const out: Fact[] = []
      add(out, '等级', d.level ? `${d.level} 级` : '')
      if (isObj(d.owner) && d.owner.id && d.owner.type !== 'optional') out.push({ label: '来自', parts: [{ ref: str(d.owner.id) }] })
      return out
    }
    case 'rule': return isObj(d) && d.category ? [{ label: '类别', parts: [tr(RULE_CATEGORY, d.category)] }] : []
    default: return []
  }
}

export function collectRefs(facts: Fact[]): string[] {
  const ids = new Set<string>()
  for (const f of facts) for (const p of f.parts ?? []) if (typeof p !== 'string') ids.add(p.ref)
  return [...ids]
}
