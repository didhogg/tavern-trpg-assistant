import type { Entry } from '../../../src/schemas/pack'
import { entryDataByType, DND5E2014_ENTRY_TYPES } from '../../../src/rules/dnd5e2014/data/entries'
import { diceSchema } from '../../../src/rules/dnd5e2014/data/common'
import { parseFormula } from '../../../src/rules/dnd5e2014/data/formula'
import type { ConvertedPack } from '../convert'

export interface ValidationContext {
  packs: ConvertedPack[]
}

function fail(message: string): never {
  throw new Error(`校验失败：${message}`)
}

function refsIn(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{\{ref:([^|}]+)/g)) out.add(match[1])
  } else if (Array.isArray(value)) {
    for (const item of value) refsIn(item, out)
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) refsIn(item, out)
  }
  return out
}

function checkDice(label: string, value: unknown): void {
  if (value === undefined) return
  if (typeof value !== 'string') fail(`${label} 的骰式无法识别：${String(value)}`)
  if (!/^[\d\sdD+\-]+$/.test(value)) return
  if (!diceSchema.safeParse(value).success) fail(`${label} 的骰式无法识别：${value}`)
}

function raw5eTools(value: unknown): string | undefined {
  if (typeof value === 'string') return value.includes('{@') || value.includes('{=') || value.includes('{#') ? value.slice(0, 120) : undefined
  if (Array.isArray(value)) {
    for (const item of value) { const found = raw5eTools(item); if (found) return found }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) { const found = raw5eTools(item); if (found) return found }
  }
  return undefined
}

/** 转换时把对象、空值直接转成文字的痕迹，出现就说明转换器漏处理了某种写法。 */
function stringifyArtifact(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const hit = /\[object Object\]|\bundefined\b|\bNaN\b|^\s*[[{]\s*"/.exec(value)
    return hit ? value.slice(Math.max(0, hit.index - 20), hit.index + 30) : undefined
  }
  if (Array.isArray(value)) {
    for (const item of value) { const found = stringifyArtifact(item); if (found) return found }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) { const found = stringifyArtifact(item); if (found) return found }
  }
  return undefined
}

/** 引用标记的显示文字不应是书籍代码（说明取错了标签的参数位置）。 */
const BOOK_CODES = new Set(['PHB', 'DMG', 'MM', 'XGE', 'TCE', 'SCAG', 'VGM', 'MTF', 'MPMM', 'BMT', 'XPHB', 'XDMG', 'XMM'])
function bookCodeDisplay(value: unknown): string | undefined {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{\{ref:[^|}]+\|([^}]*)\}\}/g)) if (BOOK_CODES.has(match[1].trim().toUpperCase())) return match[0]
  } else if (Array.isArray(value)) {
    for (const item of value) { const found = bookCodeDisplay(item); if (found) return found }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) { const found = bookCodeDisplay(item); if (found) return found }
  }
  return undefined
}

function diceInEntry(entry: Entry): void {
  const data = entry.data as Record<string, unknown>
  if (entry.type === 'table') {
    checkDice(`${entry.id} 的随机表`, data.dice)
    const faces = facesOf(String(data.dice ?? ''))
    const seen = new Set<number>()
    for (const row of (data.rows as Array<{ min: number; max: number }> | undefined) ?? []) {
      if (row.min < 1 || row.max > faces) fail(`${entry.id} 的范围超出骰子`)
      for (let n = row.min; n <= row.max; n++) {
        if (seen.has(n)) fail(`${entry.id} 的范围重叠`)
        seen.add(n)
      }
    }
    if (seen.size !== faces) fail(`${entry.id} 没有恰好覆盖骰子全部结果`)
  }
  const activities = data.activities as Array<Record<string, unknown>> | undefined
  for (const activity of activities ?? []) {
    for (const part of (activity.damage as Array<{ dice?: string }> | undefined) ?? []) checkDice(`${entry.id} 的行动`, part.dice)
    for (const part of (activity.parts as Array<{ dice?: string }> | undefined) ?? []) checkDice(`${entry.id} 的行动`, part.dice)
  }
  const weapon = data.weapon as { damage?: Array<{ dice?: string }> } | undefined
  for (const part of weapon?.damage ?? []) checkDice(`${entry.id} 的武器伤害`, part.dice)
  const hp = data.hp as { formula?: string } | undefined
  if (hp?.formula) checkDice(`${entry.id} 的生命值公式`, hp.formula)
}

function facesOf(dice: string): number {
  const match = /^(\d{0,2})d(\d{1,3})/.exec(dice)
  const count = match?.[1] ? Number(match[1]) : 1
  const faces = Number(match?.[2] ?? 0)
  return count * faces
}

function scaleIds(packs: ConvertedPack[]): Set<string> {
  const out = new Set<string>()
  for (const pack of packs) for (const entry of pack.entries) for (const item of (entry.data.advancement as Array<Record<string, unknown>> | undefined) ?? []) {
    if (item.kind === 'scaleValue' && typeof item.id === 'string') out.add(item.id)
  }
  return out
}

function checkFormula(label: string, value: unknown): void {
  if (typeof value !== 'string') return
  if (/^\d{0,2}d\d{1,3}(?:\s*[+-].*)?$/i.test(value)) return
  const parsed = parseFormula(value)
  if (!parsed.ok) fail(`${label} 的公式无法解析：${value}（${parsed.error.message}）`)
}

function checkEntryRules(entry: Entry, scales: Set<string>, packId: string): void {
  const data = entry.data as Record<string, unknown>
  const uses = data.uses as { max?: unknown } | undefined
  if (uses?.max !== undefined) checkFormula(`${entry.id} 的 uses.max`, uses.max)
  const effects = data.effects as Array<Record<string, unknown>> | undefined
  for (const effect of effects ?? []) {
    for (const key of ['amount', 'formula', 'perLevel', 'flat', 'bonus']) if (typeof effect[key] === 'string') checkFormula(`${entry.id} 的 effects.${key}`, effect[key])
  }
  for (const activity of (data.activities as Array<Record<string, unknown>> | undefined) ?? []) {
    if (typeof activity.dc === 'string' && activity.dc !== 'spell') checkFormula(`${entry.id} 的 activity.dc`, activity.dc)
    if (typeof activity.formula === 'string') checkFormula(`${entry.id} 的 activity.formula`, activity.formula)
  }
  const text = JSON.stringify(data)
  for (const match of text.matchAll(/scale\.([a-z0-9-]+)/g)) {
    if (!scales.has(match[1])) fail(`${entry.id} 引用的 scale.${match[1]} 没有定义（包 ${packId}）`)
  }
  const spellcasting = data.spellcasting as { progression?: string; slotsByLevel?: Array<{ level?: number; slots?: number[]; pact?: { count?: number; level?: number } }> } | undefined
  if (spellcasting?.slotsByLevel) {
    const rows = spellcasting.slotsByLevel
    if (rows.length !== 20) fail(`${entry.id} 的 slotsByLevel 不是 20 行`)
    let previous: number[] | undefined
    for (const row of rows) {
      if (spellcasting.progression === 'pact') {
        if (!row.pact || (row.pact.count ?? 0) < 1 || (row.pact.level ?? 0) < 1) fail(`${entry.id} 的契约位不合法`)
      } else {
        const slots = row.slots ?? []
        if (slots.length !== 9) fail(`${entry.id} 的法术位不是 9 环`)
        if (previous) for (let i = 0; i < slots.length; i++) if (slots[i] < previous[i]) fail(`${entry.id} 的法术位随等级减少`)
        previous = slots
      }
    }
  }
}

export function validatePack(pack: ConvertedPack, ctx: ValidationContext): void {
  const own = new Set(pack.entries.map((e) => e.id))
  const required = new Set(pack.manifest.relationships.requires.map((r) => r.id))
  if (pack.manifest.id !== 'dnd5e2014-srd') required.add('dnd5e2014-srd')
  const byEntry = new Map<string, string>()
  for (const other of ctx.packs) for (const entry of other.entries) byEntry.set(entry.id, other.manifest.id)
  for (const entry of pack.entries) {
    if (!/^[a-z0-9][a-z0-9.-]*$/.test(entry.id)) fail(`${entry.id} 的 id 不符合规则`)
    const schema = entryDataByType[entry.type as keyof typeof entryDataByType]
    if (!schema) fail(`${entry.id} 的类型 ${entry.type} 不在 D1 §4.2 中`)
    const parsed = schema.safeParse(entry.data)
    if (!parsed.success) fail(`${entry.id} 的 ${parsed.error.issues[0]?.path.join('.')}：${parsed.error.issues[0]?.message}`)
    if (!DND5E2014_ENTRY_TYPES.includes(entry.type as never)) fail(`${entry.id} 的类型未知`)
    if (Array.from(entry.summary).length > 80) fail(`${entry.id} 的摘要超过 80 字`)
    const credit = (entry.data as { credit?: { by?: string; license?: string; missing?: string[] } }).credit
    if (!credit?.by || !credit.license) fail(`${entry.id} 缺少来源或许可`)
    const rawText = raw5eTools(entry.data)
    if (rawText) fail(`${entry.id} 还有未转换的 5etools 标签：${rawText}`)
    const artifact = stringifyArtifact(entry.data)
    if (artifact) fail(`${entry.id} 里有转换残留：${artifact}`)
    const badDisplay = bookCodeDisplay(entry.data)
    if (badDisplay) fail(`${entry.id} 的引用显示文字是书籍代码：${badDisplay}`)
    if (/(^|[.-])entry([.-]|$)/.test(entry.id)) fail(`${entry.id} 的 id 里有占位词 entry（英文名缺失）`)
    diceInEntry(entry)
    checkEntryRules(entry, scaleIds(ctx.packs), pack.manifest.id)
    const src = (entry.data as { src?: { book?: string } }).src
    if (src?.book && ['XPHB', 'XDMG', 'XMM'].includes(src.book)) fail(`${entry.id} 含 2024 来源 ${src.book}`)
    for (const id of [...refsIn(entry.data)]) {
      if (own.has(id)) continue
      const target = byEntry.get(id)
      if (!target) fail(`${entry.id} 引用的 ${id} 不存在`)
      if (target !== pack.manifest.id && !required.has(target)) fail(`${entry.id} 引用的 ${id} 不在本包或 requires 中`)
    }
  }
}

export function validatePacks(packs: ConvertedPack[]): void {
  const ctx = { packs }
  const ids = new Set(packs.map((p) => p.manifest.id))
  for (const pack of packs) {
    for (const dep of pack.manifest.relationships.requires) if (!ids.has(dep.id)) fail(`${pack.manifest.id} 依赖的 ${dep.id} 不存在`)
    validatePack(pack, ctx)
  }
}

export function assertVolume(packs: Array<{ id: string; bytes: number }>): void {
  let total = 0
  for (const pack of packs) {
    total += pack.bytes
    if (pack.bytes > 3 * 1024 * 1024) fail(`${pack.id} 压缩后 ${(pack.bytes / 1024 / 1024).toFixed(2)}MB，超过 3MB`)
  }
  if (total > 12 * 1024 * 1024) fail(`全部包合计 ${(total / 1024 / 1024).toFixed(2)}MB，超过 12MB`)
}
