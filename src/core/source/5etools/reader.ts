import type { Entry } from '../../../schemas/pack'
import { ABILITY_LABELS, DAMAGE_LABELS, SCHOOL_LABELS } from '../../../rules/dnd5e2014/data/enums'

/**
 * 5etools 原样数据的只读读取层。
 *
 * 这里只做三件事：把 raw 字段读出来、把 `{@damage 8d6}` 这类行内标记读成骰子/DC/命中、
 * 把职业特性引用按等级归位。它不存数据、不改数据、不引入第二套 schema。
 *
 * 上游对应：
 * - 标签：5etools `js/render.js` 的 `_renderString_renderTag`；项目内已有 `tools/data/markup/inline.ts`。
 *   这里是后端计算需要的子集（damage/dice/scaledamage/scaledice/dc/hit/atk），不处理网页样式。
 * - 职业引用串：5etools 自己的 `名字|职业|来源|等级` 格式；类别数据里直接可见。
 * - 学派代码：5etools `Parser.SP_SCHOOL_ABV_TO_FULL`（项目 `tools/data/convert/spell.ts` 也有同一张表）。
 */

export interface TagRoll { dice: string; display: string }
export interface TagStats {
  rolls: TagRoll[]
  dc: number[]
  hit: number[]
  atk: string[]
  tags: Record<string, number>
  /** 读不了的标签名；不静默丢弃。 */
  unknown: string[]
}

const DICE = /^\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?$/i
const SCHOOL_BY_CODE: Record<string, string> = {
  A: 'abjuration', C: 'conjuration', D: 'divination', E: 'enchantment',
  V: 'evocation', I: 'illusion', N: 'necromancy', T: 'transmutation',
}

function cleanDice(value: string | undefined): string | undefined {
  const normalized = String(value ?? '').replace(/\s+/g, '')
  return DICE.test(normalized) ? normalized : undefined
}

function emptyTags(): TagStats {
  return { rolls: [], dc: [], hit: [], atk: [], tags: {}, unknown: [] }
}

function addRoll(out: TagStats, dice: string | undefined, display: string): void {
  const clean = cleanDice(dice)
  if (clean && !out.rolls.some((x) => x.dice === clean)) out.rolls.push({ dice: clean, display })
}

/** 从 5etools 行内文本里读标签；支持简单的嵌套/多段标签。 */
export function parseTags(value: unknown, out: TagStats = emptyTags()): TagStats {
  const visit = (text: string): void => {
    let i = 0
    while (i < text.length) {
      if (!text.startsWith('{@', i)) { i += 1; continue }
      let depth = 1
      let end = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '{') depth += 1
        else if (text[j] === '}') { depth -= 1; if (depth === 0) { end = j; break } }
      }
      if (end < 0) break
      const inner = text.slice(i + 2, end)
      const space = inner.indexOf(' ')
      const name = space < 0 ? inner : inner.slice(0, space)
      const arg = space < 0 ? '' : inner.slice(space + 1)
      const parts = arg.split('|')
      out.tags[name] = (out.tags[name] ?? 0) + 1
      switch (name) {
        case 'damage':
        case 'dice':
          addRoll(out, parts[0], parts[1] || parts[0] || '')
          break
        case 'scaledamage':
        case 'scaledice':
          addRoll(out, parts[2] || parts[0], parts[2] || parts[0] || '')
          break
        case 'dc': { const n = Number(parts[0]); if (Number.isFinite(n)) out.dc.push(n); break }
        case 'hit': { const n = Number(parts[0]); if (Number.isFinite(n)) out.hit.push(n); break }
        case 'atk': if (parts[0]) out.atk.push(parts[0]); break
        default: break
      }
      i = end + 1
    }
  }
  if (typeof value === 'string') visit(value)
  else if (Array.isArray(value)) for (const v of value) parseTags(v, out)
  else if (value && typeof value === 'object') for (const v of Object.values(value)) parseTags(v, out)
  out.dc = [...new Set(out.dc)]
  out.hit = [...new Set(out.hit)]
  out.atk = [...new Set(out.atk)]
  return out
}

function mergeTags(a: TagStats, b: TagStats): TagStats {
  const out = emptyTags()
  out.rolls = [...a.rolls, ...b.rolls.filter((x) => !a.rolls.some((y) => y.dice === x.dice))]
  out.dc = [...new Set([...a.dc, ...b.dc])]
  out.hit = [...new Set([...a.hit, ...b.hit])]
  out.atk = [...new Set([...a.atk, ...b.atk])]
  for (const k of new Set([...Object.keys(a.tags), ...Object.keys(b.tags)])) out.tags[k] = (a.tags[k] ?? 0) + (b.tags[k] ?? 0)
  out.unknown = [...new Set([...a.unknown, ...b.unknown])]
  return out
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

// ---------- 法术 ----------
export interface SpellView {
  name: string
  nameEn?: string
  level?: number
  schoolCode?: string
  school?: string
  schoolLabel?: string
  ritual: boolean
  castTime: Array<{ n: number; unit?: string }>
  range: Record<string, unknown> | null
  components: { v: boolean; s: boolean; m?: string }
  duration: Array<{ type?: string; amount?: number; unit?: string; concentration: boolean }>
  damageTypes: string[]
  saves: string[]
  higherLevel: string
  rolls: TagRoll[]
  dc: number[]
  hit: number[]
  atk: string[]
  tags: TagStats
  classes: { count: number; names: string[]; source: string | null }
}

export interface SpellSourceRow { class?: Array<{ name?: string; ENG_name?: string; source?: string }> }

export function spellClasses(spell: Record<string, unknown>, sources: Record<string, Record<string, SpellSourceRow>>): SpellView['classes'] {
  const source = String(spell.source ?? '')
  const row = sources[source]?.[String(spell.name ?? '')] ?? sources[source]?.[String(spell.ENG_name ?? '')]
  const list = Array.isArray(row?.class) ? row.class : []
  return { count: list.length, names: list.map((c) => String(c.name ?? c.ENG_name ?? '')), source: list.length ? source : null }
}

function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join('\n')
  if (isObj(value)) {
    if (typeof value.entries === 'string') return value.entries
    if (Array.isArray(value.entries)) return textOf(value.entries)
    if (Array.isArray(value.items)) return textOf(value.items)
  }
  return ''
}

export function spellView(entry: Entry, sources: Record<string, Record<string, SpellSourceRow>> = {}): SpellView {
  const d = entry.data
  const tags = parseTags([d.entries, d.entriesHigherLevel])
  const level = Number(d.level)
  const range = isObj(d.range) ? d.range : null
  const comp = isObj(d.components) ? d.components : {}
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    level: Number.isFinite(level) ? level : undefined,
    schoolCode: typeof d.school === 'string' ? d.school : undefined,
    school: SCHOOL_BY_CODE[String(d.school)] ?? undefined,
    schoolLabel: SCHOOL_LABELS[SCHOOL_BY_CODE[String(d.school)] ?? ''] ?? undefined,
    ritual: isObj(d.meta) && d.meta.ritual === true,
    castTime: (Array.isArray(d.time) ? d.time : []).map((t) => { const x = isObj(t) ? t : {}; return { n: Number(x.number ?? 1), unit: typeof x.unit === 'string' ? x.unit : undefined } }),
    range,
    components: { v: comp.v === true, s: comp.s === true, ...(typeof comp.m === 'string' ? { m: comp.m } : {}) },
    duration: (Array.isArray(d.duration) ? d.duration : []).map((x) => { const o = isObj(x) ? x : {}; return {
      type: typeof o.type === 'string' ? o.type : undefined,
      amount: Number.isFinite(Number(o.amount)) ? Number(o.amount) : undefined,
      unit: typeof o.unit === 'string' ? o.unit : undefined,
      concentration: o.concentration === true,
    } }),
    damageTypes: (Array.isArray(d.damageInflict) ? d.damageInflict : []).map((x) => DAMAGE_LABELS[String(x)] ?? String(x)),
    saves: (Array.isArray(d.savingThrow) ? d.savingThrow : []).map(String),
    higherLevel: textOf(d.entriesHigherLevel),
    rolls: tags.rolls,
    dc: tags.dc,
    hit: tags.hit,
    atk: tags.atk,
    tags,
    classes: spellClasses(d, sources),
  }
}

// ---------- 怪物 ----------
export interface MonsterActionView { name: string; tags: TagStats }
export interface MonsterView {
  name: string
  nameEn?: string
  ac: number[]
  hp: unknown
  size: unknown[]
  creatureType: unknown
  abilities: Record<string, number | null>
  saves: unknown
  skills: unknown
  senses: unknown[]
  passive: unknown
  languages: unknown[]
  cr: unknown
  traits: MonsterActionView[]
  actions: MonsterActionView[]
  bonusActions: MonsterActionView[]
  reactions: MonsterActionView[]
  legendary: MonsterActionView[]
  actionCount: number
  actionsWithAttack: number
  actionsWithDamage: number
  actionsWithDc: number
  variants: Array<{ type?: string; name?: string; versionName?: string; addHeadersAs?: string }>
}

function namedActions(value: unknown): MonsterActionView[] {
  return (Array.isArray(value) ? value : []).map((x) => { const o = isObj(x) ? x : {}; return { name: String(o.name ?? ''), tags: parseTags(o.entries) } })
}

export function monsterView(entry: Entry): MonsterView {
  const d = entry.data
  const traits = namedActions(d.trait)
  const actions = namedActions(d.action)
  const bonusActions = namedActions(d.bonus)
  const reactions = namedActions(d.reaction)
  const legendary = namedActions(isObj(d.legendary) ? d.legendary.actions : undefined)
  const all = [...actions, ...bonusActions, ...reactions, ...legendary]
  const ac = (Array.isArray(d.ac) ? d.ac : []).map((a) => (isObj(a) ? Number(a.ac ?? a.value ?? 0) : Number(a))).filter((n) => Number.isFinite(n))
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    ac,
    hp: d.hp,
    size: Array.isArray(d.size) ? d.size : [],
    creatureType: d.type,
    abilities: Object.fromEntries(Object.keys(ABILITY_LABELS).map((k) => [k, Number.isFinite(Number(d[k])) ? Number(d[k]) : null])),
    saves: d.save,
    skills: d.skill,
    senses: Array.isArray(d.senses) ? d.senses : [],
    passive: d.passive,
    languages: Array.isArray(d.languages) ? d.languages : [],
    cr: d.cr,
    traits,
    actions,
    bonusActions,
    reactions,
    legendary,
    actionCount: all.length,
    actionsWithAttack: all.filter((a) => a.tags.atk.length > 0).length,
    actionsWithDamage: all.filter((a) => a.tags.rolls.length > 0).length,
    actionsWithDc: all.filter((a) => a.tags.dc.length > 0).length,
    variants: (Array.isArray(d.variant) ? d.variant : []).map((v) => { const o = isObj(v) ? v : {}; const ver = isObj(o._version) ? o._version : {}; return {
      type: typeof o.type === 'string' ? o.type : undefined,
      name: typeof o.name === 'string' ? o.name : undefined,
      versionName: typeof ver.name === 'string' ? ver.name : undefined,
      addHeadersAs: typeof ver.addHeadersAs === 'string' ? ver.addHeadersAs : undefined,
    } }),
  }
}

// ---------- 物品 ----------
export interface ItemView {
  name: string
  nameEn?: string
  type?: string
  category: string
  wondrous: boolean
  rarity?: string
  reqAttune?: boolean | string
  weight?: number
  value?: number
  weaponCategory?: string
  property: string[]
  dmg1?: string
  dmg2?: string
  dmgType?: string
  ac?: number
  strength?: string
  stealth?: boolean
  bonuses: Record<string, unknown>
  charges?: number
  attachedSpells: unknown
  rolls: TagRoll[]
  dc: number[]
  tags: TagStats
}

export function itemView(entry: Entry): ItemView {
  const d = entry.data
  const tags = parseTags(d.entries)
  const bonuses: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(d)) if (k.startsWith('bonus') && v !== undefined) bonuses[k] = v
  const type = typeof d.type === 'string' ? d.type : undefined
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    type,
    category: d.wondrous === true ? 'wondrous' : (type ?? ''),
    wondrous: d.wondrous === true,
    rarity: typeof d.rarity === 'string' ? d.rarity : undefined,
    reqAttune: d.reqAttune === true ? true : typeof d.reqAttune === 'string' ? d.reqAttune : undefined,
    weight: Number.isFinite(Number(d.weight)) ? Number(d.weight) : undefined,
    value: Number.isFinite(Number(d.value)) ? Number(d.value) : undefined,
    weaponCategory: typeof d.weaponCategory === 'string' ? d.weaponCategory : undefined,
    property: Array.isArray(d.property) ? d.property.map(String) : [],
    dmg1: typeof d.dmg1 === 'string' ? d.dmg1 : undefined,
    dmg2: typeof d.dmg2 === 'string' ? d.dmg2 : undefined,
    dmgType: typeof d.dmgType === 'string' ? d.dmgType : undefined,
    ac: Number.isFinite(Number(d.ac)) ? Number(d.ac) : undefined,
    strength: typeof d.strength === 'string' ? d.strength : undefined,
    stealth: d.stealth === true,
    bonuses,
    charges: Number.isFinite(Number(d.charges)) ? Number(d.charges) : undefined,
    attachedSpells: d.attachedSpells,
    rolls: tags.rolls,
    dc: tags.dc,
    tags,
  }
}

export * from './reader-character'
export * from './reader-tables'

export { mergeTags }
