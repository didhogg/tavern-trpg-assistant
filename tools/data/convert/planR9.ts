import type { Raw } from '../extract/load'
import type { PlanResult, PlannedEntry } from './plan'
import type { R9Candidate, R9Replacement } from './r9Types'
import { buildCandidates } from './r9Candidates'
import { selectSurvivors } from './r9Golden'
import { isObj, storageDice } from './r9lib'
import { BOOK_BY_SOURCE, PACK_BY_SOURCE, SRD_PACK_ID } from '../config/books'
import type { R9Meta, R9Seed } from './tableR9'
import { keyTableValues } from './tableValues'

export interface R9PlanOptions { includeRef: boolean; replace: boolean }
export interface R9PlanResult {
  tables: PlannedEntry[]
  replacements: R9Replacement[]
  redirects: Array<[string, string]>
  survivorByCandidate: Map<number, R9Candidate>
}

function makeTable(candidate: R9Candidate, aliases: Set<string>): PlannedEntry {
  if (!candidate.id) throw new Error(`R9 表没有 id：${candidate.name}`)
  const book = BOOK_BY_SOURCE.get(candidate.source)
  if (!book) throw new Error(`R9 表来源不在白名单：${candidate.source}（${candidate.name}）`)
  aliases.add(candidate.name)
  for (const merged of candidate.merged ?? []) aliases.add(merged.name)
  const seed: R9Seed = {
    ...(candidate.ref ? {} : { dice: storageDice(candidate.expr!) }),
    cols: candidate.cols,
    rows: candidate.rows,
    ...(candidate.extra.group ? { group: candidate.extra.group } : {}),
    ...(candidate.extra.caption ? { caption: candidate.extra.caption } : {}),
    aliases: [...aliases],
    ...(candidate.extra.parentKey ? { parentKey: candidate.extra.parentKey } : {}),
  }
  const meta: R9Meta = {
    kind: candidate.kind,
    ...(candidate.modifierPrompt ? { modifier: { prompt: candidate.modifierPrompt } } : {}),
    ...(candidate.extra.footnotes ? { footnotes: candidate.extra.footnotes } : {}),
    ...(candidate.parent ? { parent: { id: candidate.parent } } : {}),
    ...(!candidate.parent && candidate.chapter ? { chapter: { book: candidate.source, name: candidate.chapter } } : {}),
  }
  const raw: Raw = { ...seed, name: candidate.name, ENG_name: candidate.nameEn ?? candidate.name, source: candidate.source, page: candidate.page ?? 0, srd: candidate.srd === true, __seed: seed, __r9: meta }
  return {
    key: `table|${candidate.source}|${candidate.name}|${candidate.id}`,
    type: 'table',
    raw,
    source: candidate.source,
    packId: candidate.srd === true ? SRD_PACK_ID : PACK_BY_SOURCE.get(candidate.source)!,
    srd: candidate.srd === true,
    name: candidate.name,
    nameEn: candidate.nameEn ?? candidate.name,
    page: candidate.page ?? 0,
    id: candidate.id,
    missingName: false,
    missingPage: candidate.page === undefined,
    context: {},
  }
}

function replaceBlock(value: unknown, target: Raw, replacement: Raw, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] === target) { value[i] = replacement; return true }
      if (isObj(value[i]) || Array.isArray(value[i])) {
        const child = value[i]
        if (isObj(child) && seen.has(child)) continue
        if (isObj(child)) seen.add(child)
        if (replaceBlock(child, target, replacement, seen)) return true
      }
    }
    return false
  }
  if (!isObj(value)) return false
  for (const [key, child] of Object.entries(value)) {
    if (key === 'rows' || key === 'colLabels') continue
    if (child === target) { value[key] = replacement; return true }
    if (isObj(child) || Array.isArray(child)) {
      if (isObj(child) && seen.has(child)) continue
      if (isObj(child)) seen.add(child)
      if (replaceBlock(child, target, replacement, seen)) return true
    }
  }
  return false
}

// tableGroup 在非 lore 条目里不会输出；组里的表都换成 tableRef 后，把组改成普通 entries 块，让它们能显示
function flattenGroups(value: unknown, seen = new WeakSet<object>()): void {
  if (Array.isArray(value)) { for (const item of value) flattenGroups(item, seen); return }
  if (!isObj(value) || seen.has(value)) return
  seen.add(value)
  if (value.type === 'tableGroup' && Array.isArray(value.tables) && value.tables.length && value.tables.every((t) => isObj(t) && t.type === 'tableRef')) {
    value.type = 'entries'
    value.entries = value.tables
    delete value.tables
  }
  for (const [key, child] of Object.entries(value)) { if (key === 'rows' || key === 'colLabels') continue; flattenGroups(child, seen) }
}

export function planR9(plan: PlanResult, options: R9PlanOptions, legendaryGroups: Raw[] = [], r11Ids: ReadonlySet<string> = new Set()): R9PlanResult {
  const pool = buildCandidates(plan, legendaryGroups, r11Ids)
  const golden = selectSurvivors(pool, plan.entries)
  const survivorByCandidate = new Map<number, R9Candidate>()
  for (const s of golden.survivors) survivorByCandidate.set(s.i!, s)
  for (const d of golden.dropped) {
    const s = golden.survivors.find((x) => x.i === d.survivorIndex)
    if (s) survivorByCandidate.set(d.i!, s)
  }
  const aliasesBySurvivor = new Map<string, Set<string>>()
  for (const candidate of pool) {
    const survivor = survivorByCandidate.get(candidate.i!)
    if (!survivor?.id) continue
    const set = aliasesBySurvivor.get(survivor.id) ?? new Set<string>()
    for (const alias of [candidate.name, candidate.name.split('·').pop() ?? candidate.name, candidate.name.replace(/·/g, '; '), candidate.name.replace(/·/g, ';')]) set.add(alias)
    aliasesBySurvivor.set(survivor.id, set)
  }
  const parentKeys = new Map<string, Set<string>>()
  for (const candidate of pool) {
    if (candidate.origin !== 'B' || !candidate.extra.parentKey) continue
    const survivor = survivorByCandidate.get(candidate.i!)
    if (!survivor?.id) continue
    const set = parentKeys.get(survivor.id) ?? new Set<string>()
    set.add(candidate.extra.parentKey)
    parentKeys.set(survivor.id, set)
  }
  const keyTables = keyTableValues(golden.survivors)
  const tables = golden.survivors.filter((s) => options.includeRef || s.kind !== 'ref').map((s) => { const table = makeTable(s, aliasesBySurvivor.get(s.id!) ?? new Set<string>()); const seed = table.raw.__seed as R9Seed; const keys = parentKeys.get(s.id!); if (keys) seed.parentKeys = [...keys]; const key = keyTables.get(s.id!); if (key) { const meta = table.raw.__r9 as R9Meta; meta.purpose = key.purpose; meta.columns = key.columns; seed.rows.forEach((row, i) => { row.values = key.rows[i] }) } return table })
  const replacements: R9Replacement[] = []
  for (const candidate of pool) {
    if (candidate.origin !== 'B' || !candidate.block || !candidate.where || candidate.blockIndex === undefined) continue
    const survivor = survivorByCandidate.get(candidate.i!)
    if (!survivor || (!options.includeRef && survivor.kind === 'ref')) continue
    const label = `${survivor.name}${survivor.ref ? '' : `（${storageDice(survivor.expr!)}）`}`
    replacements.push({ entryId: candidate.parentId!, where: candidate.where, blockIndex: candidate.blockIndex, tableId: survivor.id! })
    if (!options.replace) continue
    const entry = plan.entries.find((e) => e.id === candidate.parentId)
    if (!entry) continue
    const block = candidate.block
    if (candidate.host !== undefined) {
      replaceBlock(candidate.host, block, { type: 'tableRef', id: survivor.id!, label })
      continue
    }
    if (entry.raw._r9OriginalEntries === undefined) entry.raw._r9OriginalEntries = structuredClone(entry.raw.entries)
    if (entry.raw._r9OriginalLore === undefined) entry.raw._r9OriginalLore = structuredClone(entry.raw._lore)
    const replacement: Raw = { type: 'tableRef', id: survivor.id!, label }
    replaceBlock(entry.raw.entries, block, replacement)
    replaceBlock(entry.raw._lore, block, replacement)
  }
  if (options.replace) {
    const roots = new Set<unknown>()
    for (const candidate of pool) {
      if (candidate.host !== undefined) roots.add(candidate.host)
      const entry = candidate.parentId ? plan.entries.find((e) => e.id === candidate.parentId) : undefined
      if (entry && candidate.host === undefined) { roots.add(entry.raw.entries); roots.add(entry.raw._lore) }
    }
    for (const root of roots) flattenGroups(root)
  }
  return { tables, replacements, redirects: golden.redirects, survivorByCandidate }
}
