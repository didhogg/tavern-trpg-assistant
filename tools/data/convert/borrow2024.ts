/**
 * 2024 版 → 同名 2014 条目：借时长（驾驶员 2026-11-04 批准，计划 D4）。
 *
 * 为什么：5etools 的 foundry 数据里，很多物品、特性的时长挂在 2024 版记录（XPHB / XDMG / XMM）名下，
 * 读入时被"不在收录范围"滤掉，同名的 2014 条目就没有时长。
 * 做法：转换完成后做一次独立的后处理——只借 `duration`，只借给**还没有时长**的同名条目，已有的一个字不改。
 * 借不了就列出来、不猜：来源本身是公式（如「等于德鲁伊等级的一半」）、单位不认识、同一条记录里有互相矛盾的几个值、
 * 同名的几条 2024 记录时长不一致。借成功的条目写 `extra.durationFrom`（来源书代号），一查就能筛出来。
 */
import { writeText } from '../lib/io'
import { join } from 'node:path'
import { fromActivity, fromEffect, type EntryDuration } from './duration'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export interface BorrowEntry { id: string; type: string; name?: string; nameEn?: string; data: Rec }
export interface BorrowPack { manifest: { id: string }; entries: BorrowEntry[] }

/** 2014 条目类型 → 可以借用的 2024 记录种类。 */
const KINDS: Record<string, string[]> = {
  item: ['item', 'magicvariant'],
  feature: ['classFeature', 'subclassFeature', 'raceFeature', 'optionalfeature', 'feat'],
  feat: ['feat'],
}

export type BorrowSkip = 'unusable' | 'conflict' | 'ambiguous' | 'none' | 'differs'
export interface BorrowedRow { id: string; name: string; from: string; kind: string; duration: EntryDuration; /** 2014 条目正文里能找到同样的数字与单位（人工抽查的线索；没找到不代表错，如「到下个回合结束」）。 */ corroborated: boolean }
export interface SkippedRow { id: string; name: string; reason: BorrowSkip; detail: string }
export interface BorrowReport { borrowed: BorrowedRow[]; skipped: SkippedRow[]; alreadyHad: number; noRecord: number }

const SECONDS = { round: 6, minute: 60, hour: 3600, day: 86400 } as const
/** 比较用：定时时长统一折成秒（24 小时 = 1 天），其余按类型。 */
const key = (d: EntryDuration): string => (d.type === 'timed' && d.amount && d.unit ? `timed:${d.amount * SECONDS[d.unit]}s` : d.type)
const norm = (name: string): string => name.toLowerCase().replace(/\s+/g, ' ').trim()

/** 一条 2024 记录里所有"面向时长"的值。unusable = 有时长对象但读不成固定值（公式、奇怪单位、空值）。 */
export function durationsOfRecord(raw: Rec): { found: EntryDuration[]; unusable: boolean; raws: string[] } {
  const found: EntryDuration[] = []
  const raws: string[] = []
  let unusable = false
  const take = (du: unknown, read: (d: Rec) => EntryDuration | undefined): void => {
    if (!isObj(du)) return
    if (du.units === 'inst') return // 瞬间：不是"有时长"
    const d = read(du)
    if (d) { if (d.type !== 'instant') found.push(d) } else if (Object.values(du).some((v) => v !== undefined && v !== '' && v !== 0 && v !== false && v !== null)) { unusable = true; raws.push(JSON.stringify(du)) }
  }
  for (const a of Array.isArray(raw.activities) ? raw.activities : []) if (isObj(a)) take(a.duration, fromActivity)
  // 特效时长偶尔写成 { value: 600, units: '秒' }（星域德鲁伊的「龙」）：折成秒再读
  const readEffect = (d: Rec): EntryDuration | undefined => fromEffect(d) ?? (d.units === '秒' && typeof d.value === 'number' ? fromEffect({ seconds: d.value }) : undefined)
  for (const e of Array.isArray(raw.effects) ? raw.effects : []) if (isObj(e)) take(e.duration, readEffect)
  return { found, unusable, raws }
}

interface Candidate { source: string; kind: string; found: EntryDuration[]; unusable: boolean; raws: string[] }

export function buildPool(records: Rec[]): Map<string, Candidate[]> {
  const pool = new Map<string, Candidate[]>()
  for (const raw of records) {
    const name = norm(str(raw.ENG_name) || str(raw.name))
    if (!name) continue
    const { found, unusable, raws } = durationsOfRecord(raw)
    if (!found.length && !unusable) continue
    const list = pool.get(name) ?? []
    list.push({ source: str(raw.source), kind: str(raw._foundryKind), found, unusable, raws })
    pool.set(name, list)
  }
  return pool
}

const UNIT_PATTERN = { round: '轮|回合', minute: '分钟|分', hour: '小时|时', day: '天|日' } as const
/** 正文里是否出现同样的时长（24 小时与 1 天互通）。 */
export function corroborated(entry: BorrowEntry, d: EntryDuration): boolean {
  const body = `${JSON.stringify(entry.data.text ?? [])}${JSON.stringify(entry.data.activities ?? [])}${entry.name ?? ''}`
  if (d.type === 'permanent') return /永久|永续|直到/.test(body)
  if (d.type !== 'timed' || !d.amount || !d.unit) return false
  const variants: Array<[number, keyof typeof UNIT_PATTERN]> = [[d.amount, d.unit]]
  if (d.unit === 'day') variants.push([d.amount * 24, 'hour'])
  if (d.unit === 'hour' && d.amount % 24 === 0) variants.push([d.amount / 24, 'day'])
  return variants.some(([n, u]) => new RegExp(`${n}\\s*(${UNIT_PATTERN[u]})`).test(body))
}

const bodyOf = (entry: BorrowEntry): string => `${JSON.stringify(entry.data.text ?? [])}${JSON.stringify(entry.data.activities ?? [])}`
/** 正文里写明的所有「数字 + 时间单位」（如「1分钟」「24小时」）。 */
export function mentionedDurations(entry: BorrowEntry): string[] {
  return [...new Set([...bodyOf(entry).matchAll(/(\d+)\s*(分钟|小时|轮|回合|天|日)/g)].map((m) => `${m[1]}${m[2]}`))]
}

/** 给还没有时长的同名 2014 条目借时长（就地修改 entries）；返回逐条记录。 */
export function applyBorrowedDurations(packs: BorrowPack[], records: Rec[]): BorrowReport {
  const pool = buildPool(records)
  const report: BorrowReport = { borrowed: [], skipped: [], alreadyHad: 0, noRecord: 0 }
  for (const pack of packs) {
    for (const entry of pack.entries) {
      const kinds = KINDS[entry.type]
      if (!kinds) continue
      const cands = (pool.get(norm(entry.nameEn ?? '')) ?? []).filter((c) => kinds.includes(c.kind))
      if (!cands.length) { report.noRecord++; continue }
      if (entry.data.duration !== undefined) { report.alreadyHad++; continue }
      const skip = (reason: BorrowSkip, detail: string): void => { report.skipped.push({ id: entry.id, name: entry.name ?? '', reason, detail }) }
      if (cands.some((c) => c.unusable)) { skip('unusable', [...new Set(cands.flatMap((c) => c.raws))].join(' ; ')); continue }
      const all = cands.flatMap((c) => c.found)
      const distinct = new Map<string, EntryDuration>()
      for (const d of all) if (!distinct.has(key(d))) distinct.set(key(d), d) // 同一时长（24 小时 = 1 天）取最先出现的，即活动里写的那个
      if (distinct.size === 0) { skip('none', '来源没有可用时长'); continue }
      if (distinct.size > 1) {
        const sameRecord = cands.some((c) => new Set(c.found.map(key)).size > 1)
        skip(sameRecord ? 'conflict' : 'ambiguous', [...distinct.values()].map(text).join(' / '))
        continue
      }
      const duration = { ...[...distinct.values()][0]! }
      // 保护：2014 正文里写了明确的时长、却没有一个和借来的相符 → 两版规则很可能不同（神圣武士的神圣武器：2014 是 1 分钟、2024 是 10 分钟），不借，交人工核对。
      const mentions = mentionedDurations(entry)
      if (!corroborated(entry, duration) && mentions.length) { skip('differs', `借来 ${text(duration)}；2014 正文写的是 ${mentions.join('、')}`); continue }
      const from = [...new Set(cands.map((c) => c.source))].sort().join('+')
      entry.data.duration = duration
      entry.data.extra = { ...(isObj(entry.data.extra) ? entry.data.extra : {}), durationFrom: from }
      report.borrowed.push({ id: entry.id, name: entry.name ?? '', from, kind: entry.type, duration, corroborated: corroborated(entry, duration) })
    }
  }
  return report
}

const REASON: Record<BorrowSkip, string> = {
  unusable: '来源时长是公式 / 单位不认识 / 为空',
  conflict: '同一条记录里有互相矛盾的几个值',
  ambiguous: '同名的几条 2024 记录时长不一致',
  none: '来源没有可用时长',
  differs: '2014 正文写的时长与 2024 不同（两版规则可能不一样）',
}
function text(d: EntryDuration): string {
  return d.type === 'timed' ? `${d.amount}${{ round: '轮', minute: '分钟', hour: '小时', day: '天' }[d.unit ?? 'round']}` : d.type === 'permanent' ? '永续' : d.type
}

export async function writeBorrowReport(root: string, r: BorrowReport): Promise<void> {
  const lines = [
    '# D4 时长借用（2024 → 同名 2014）报告', '',
    `- 借成功 **${r.borrowed.length}** 条（物品 ${r.borrowed.filter((b) => b.kind === 'item').length}、特性 ${r.borrowed.filter((b) => b.kind === 'feature').length}、专长 ${r.borrowed.filter((b) => b.kind === 'feat').length}）`,
    `- 没借 **${r.skipped.length}** 条（见下）；本来就有时长（不动）${r.alreadyHad} 条；没有同名 2024 记录 ${r.noRecord} 条（正常，多数条目本来就没有时长）`, '',
    '## 没借的条目（需要核对）', '',
    '| 条目 | 名称 | 原因 | 来源里的值 |', '|---|---|---|---|',
    ...r.skipped.map((s) => `| \`${s.id}\` | ${s.name} | ${REASON[s.reason]} | ${s.detail} |`), '',
    `## 借成功的条目（正文能印证 ${r.borrowed.filter((b) => b.corroborated).length} 条，未印证 ${r.borrowed.filter((b) => !b.corroborated).length} 条）`, '',
    '| 条目 | 名称 | 来源 | 时长 | 2014 正文里有同样数字 |', '|---|---|---|---|---|',
    ...r.borrowed.map((b) => `| \`${b.id}\` | ${b.name} | ${b.from} | ${text(b.duration)} | ${b.corroborated ? '✔' : '—'} |`), '',
  ]
  await writeText(join(root, 'docs', 'probes', 'U5R2_D4_时长借用.md'), lines.join('\n'))
}
