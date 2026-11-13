// 范围（D2-P3 整体设计 §2.1、§2.2）：一本书 / 一个自制来源 / 单条属于哪些范围；一个战役看得到什么。
// 范围是插件自己的管理数据（登记在 scopes.json，加一个范围 = 加一行），不写进作者内容。
// 初始归类只用作者的判断（SourceUtil.isClassicSource，经小窗 editionOf），作者判断不了的进"未归类"，不猜。
import registry from './scopes.json'

export interface ScopeDef {
  id: string
  name: string
  /** 作者版本（SITE_STYLE__CLASSIC = classic，SITE_STYLE__ONE = one）：作者判为这一版的来源默认归进这个范围。用户自建的范围没有。 */
  edition?: 'classic' | 'one'
}

export interface RuleScopes {
  /** 这套规则的新战役默认选哪些范围。 */
  defaultScopes: string[]
  /** 作者搜索默认藏旧版来源（omnisearch-backing.js 第 175 行）；为 true 时本规则的战役搜索要显示旧版。 */
  showLegacy: boolean
  /** 作者的版本风格（consts.js SITE_STYLE__CLASSIC / SITE_STYLE__ONE）：文字转条目时标签指向哪一版。 */
  style: 'classic' | 'one'
  /** 这套规则的资料用哪种数据格式（formats.ts 登记）；战役选的资料集必须是同一种。 */
  format: string
}

export const BUILTIN_SCOPES = registry.scopes as ScopeDef[]
const RULES = registry.rules as Record<string, RuleScopes>

export function ruleScopes(rule: string): RuleScopes {
  const r = RULES[rule]
  if (!r) throw new Error(`范围登记表里没有这套规则：${rule}`)
  return r
}

/** 一组范围属于哪套规则：和哪套规则的默认范围一模一样就是它；都对不上（含空的）= null（未归类）。按登记表，不写死。 */
export function ruleOfScopes(scopes: string[]): string | null {
  const key = [...scopes].sort().join(',')
  if (!key) return null
  return Object.entries(RULES).find(([, r]) => [...r.defaultScopes].sort().join(',') === key)?.[0] ?? null
}

/** 条目的定位：哪个数据集（源登记表 id）、哪一类、作者编号。 */
export interface EntryRef {
  set: string
  prop: string
  hash: string
}

/** 归类单位：一个来源（不分语言：中英同一本书归类相同），或一条（分数据集）。 */
export const sourceUnit = (source: string): string => `src:${source.toLowerCase()}`
export const entryUnit = (ref: EntryRef): string => `ent:${ref.set}:${ref.prop}:${ref.hash}`
export const refKey = (ref: EntryRef): string => `${ref.set}|${ref.prop}|${ref.hash}`
/** A clicked row can name an installed copy or the original explicitly. A text link has no selection. */
export type EntrySelection = { docIdLocal: string } | { original: true }

export interface Assignment {
  scopes: string[]
  global: boolean
}

/** 作者对一个来源的版本判断（小窗 editionOf）。classic 为 null = 作者判断不了。 */
export interface EditionInfo {
  classic: boolean | null
  /** date：官方来源按出版日期；brew-meta：自制按 _meta.edition（没写时作者默认旧版）。 */
  basis: 'date' | 'brew-meta' | null
}

export type MembershipBasis = 'entry' | 'user' | 'author' | 'none'

export interface Membership {
  assignment: Assignment | null
  basis: MembershipBasis
}

/** 自制包的样子（作者 BrewUtil2.pGetBrew 的一项，只用到这几个字段）。 */
export interface BrewDocLike {
  head?: { url?: string | null }
  body?: { _meta?: { sources?: Array<{ json?: string }>; edition?: string } }
}

/**
 * P5.5 R78：这个来源是不是"【我的库】里没写版本的自制"——所有含它的包都没有网址（本地导入 / 自己写的）且包头没写 edition。
 * 是的话不按作者的"没写算旧版"猜，记作未归类；从网址下载的自制、写了 edition 的照作者判断。
 */
export function isMineWithoutEdition(docs: BrewDocLike[], source: string): boolean {
  const s = source.toLowerCase()
  const hits = docs.filter((d) => (d.body?._meta?.sources ?? []).some((x) => String(x?.json ?? '').toLowerCase() === s))
  return hits.length > 0 && hits.every((d) => !d.head?.url && !d.body?._meta?.edition)
}

/** 作者判断 → 默认范围（按登记表里范围的 edition）。判断不了 → null（未归类）。 */
export function autoAssignment(ed: EditionInfo | undefined, scopes: ScopeDef[] = BUILTIN_SCOPES): Assignment | null {
  if (!ed || ed.classic === null) return null
  const edition = ed.classic ? 'classic' : 'one'
  const ids = scopes.filter((s) => s.edition === edition).map((s) => s.id)
  return ids.length ? { scopes: ids, global: false } : null
}

/** 一条的归属：单条例外 > 用户给来源的归类 > 作者判断 > 未归类。 */
export function membershipOf(entry: Assignment | undefined, user: Assignment | undefined, auto: Assignment | null): Membership {
  if (entry) return { assignment: entry, basis: 'entry' }
  if (user) return { assignment: user, basis: 'user' }
  if (auto) return { assignment: auto, basis: 'author' }
  return { assignment: null, basis: 'none' }
}

/** 战役的选书设置（存在战役记录里，P3-3）。单位见 sourceUnit / entryUnit。 */
export interface CampaignLibrary {
  rule: string
  /** 用哪套作者程序（cn / en）的数据。 */
  codeSet: string
  scopes: string[]
  include: string[]
  exclude: string[]
  /** 本战役选的版本：refKey(目标) → 备选编号（'base' = 原件）。 */
  choices: Record<string, string>
}

export function defaultCampaignLibrary(rule: string, codeSet: string): CampaignLibrary {
  return { rule, codeSet, scopes: [...ruleScopes(rule).defaultScopes], include: [], exclude: [], choices: {} }
}

/**
 * 向导里勾选 / 取消一本书（一个来源）：只记用户明确表态的，加入和排除互斥；
 * 取消勾选 = 排除，勾选 = 加入（排除说了算 > 加入 > 范围，见下面的 viewOf）。
 */
export function chooseSource(c: Pick<CampaignLibrary, 'include' | 'exclude'>, source: string, visible: boolean): Pick<CampaignLibrary, 'include' | 'exclude'> {
  return chooseUnit(c, sourceUnit(source), visible)
}

/** 单条启用 / 停用（P5 B-19）：和 chooseSource 同一套加入 / 排除，只是单位是一条（entryUnit）。 */
export function chooseEntry(c: Pick<CampaignLibrary, 'include' | 'exclude'>, ref: EntryRef, visible: boolean): Pick<CampaignLibrary, 'include' | 'exclude'> {
  return chooseUnit(c, entryUnit(ref), visible)
}

function chooseUnit(c: Pick<CampaignLibrary, 'include' | 'exclude'>, unit: string, visible: boolean): Pick<CampaignLibrary, 'include' | 'exclude'> {
  const rest = (list: string[]): string[] => list.filter((u) => u !== unit)
  return visible ? { include: [...rest(c.include), unit], exclude: rest(c.exclude) } : { include: rest(c.include), exclude: [...rest(c.exclude), unit] }
}

/** 本战役停用的单条（排除清单里的条目单位 → 定位）；"停用项目"页用。 */
export function disabledEntries(c: Pick<CampaignLibrary, 'exclude'>): EntryRef[] {
  const out: EntryRef[] = []
  for (const u of c.exclude) {
    const m = /^ent:([^:]+):([^:]+):(.+)$/.exec(u)
    if (m) out.push({ set: m[1], prop: m[2], hash: m[3] })
  }
  return out
}

export type ViewReason = 'excluded' | 'included' | 'global' | 'scope' | 'out-of-scope' | 'unclassified'

/**
 * 在不在本战役：排除说了算 > 额外加入 > 全局通用 > 所选范围 > 范围外 / 未归类。
 * P5 B-32：已下载的来源默认开——范围外、未归类的 visible 也是 true（reason 照实写，界面可以提示"不在所选范围"），只有用户关掉的才看不见。
 */
export function viewOf(c: CampaignLibrary, units: { entry: string; source: string | null }, m: Membership): { visible: boolean; reason: ViewReason } {
  const hit = (list: string[]) => list.includes(units.entry) || (units.source !== null && list.includes(units.source))
  if (hit(c.exclude)) return { visible: false, reason: 'excluded' }
  if (hit(c.include)) return { visible: true, reason: 'included' }
  if (!m.assignment) return { visible: true, reason: 'unclassified' }
  if (m.assignment.global) return { visible: true, reason: 'global' }
  if (m.assignment.scopes.some((s) => c.scopes.includes(s))) return { visible: true, reason: 'scope' }
  return { visible: true, reason: 'out-of-scope' }
}

/** 只按范围算本来看不看得到（向导的默认勾选用）：范围外、未归类的不算。 */
export const inScopeOf = (v: { reason: ViewReason }): boolean => v.reason !== 'out-of-scope' && v.reason !== 'unclassified'
