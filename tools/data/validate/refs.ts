import type { ConvertedPack } from '../convert'
import { BOOKS } from '../config/books'

export interface RefIssue {
  pack: string
  entry: string
  field: string
  value: string
}
export interface RefResult {
  dangling: RefIssue[]
  dependency: RefIssue[]
  softRefs: RefIssue[]
}

function walkStrings(value: unknown, visit: (s: string, field: string) => void, field = ''): void {
  if (typeof value === 'string') { visit(value, field); return }
  if (Array.isArray(value)) { for (const x of value) walkStrings(x, visit, field); return }
  if (value && typeof value === 'object') for (const [k, x] of Object.entries(value)) walkStrings(x, visit, field ? `${field}.${k}` : k)
}
function tableRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) { for (const item of value) tableRefs(item, out); return out }
  if (value && typeof value === 'object') { const rec = value as Record<string, unknown>; if (rec.tableRef && typeof rec.tableRef === 'object' && typeof (rec.tableRef as { id?: unknown }).id === 'string') out.push((rec.tableRef as { id: string }).id); for (const item of Object.values(rec)) tableRefs(item, out) }
  return out
}
function idsOf(value: unknown): string[] {
  const out: string[] = []
  walkStrings(value, (s) => { if (/^[a-z]+[a-z0-9.-]*$/.test(s) && s.includes('.')) out.push(s) })
  return out
}

export async function checkReferences(packs: ConvertedPack[]): Promise<RefResult> {
  const byPack = new Map(packs.map((p) => [p.manifest.id, p]))
  const all = new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
  const srd = 'dnd5e2014-srd'
  const issues: RefIssue[] = []
  const softRefs: RefIssue[] = []
  for (const pack of packs) {
    const requires = pack.manifest.id === srd ? new Set([srd]) : new Set([pack.manifest.id, srd, ...(BOOKS.find((b) => b.packId === pack.manifest.id)?.requiresBooks.map((s) => `dnd5e2014-${s.toLowerCase()}`) ?? [])])
    const check = (entryId: string, field: string, value: string): void => {
      if (!value || !value.includes('.')) return
      if (!all.has(value)) issues.push({ pack: pack.manifest.id, entry: entryId, field, value })
      else if (![...requires].some((id) => byPack.get(id)?.entries.some((e) => e.id === value))) issues.push({ pack: pack.manifest.id, entry: entryId, field: `${field}（依赖缺失）`, value })
    }
    const soft = (entryId: string, field: string, value: string, step: Record<string, unknown>): boolean => {
      if (pack.manifest.id === 'dnd5e2014-tce' || step.kind !== 'itemGrant' || step.optional !== 'tce-ocf') return false
      const target = byPack.get('dnd5e2014-tce')?.entries.some((e) => e.id === value)
      if (!target) return false
      softRefs.push({ pack: pack.manifest.id, entry: entryId, field, value })
      return true
    }
    for (const entry of pack.entries) {
      const d = entry.data as Record<string, unknown>
      const fields: Array<[string, unknown]> = [
        ['variantOf', d.variantOf], ['baseItem', d.baseItem], ['target', d.target],
        ['owner.id', (d.owner as Record<string, unknown> | undefined)?.id], ['classId', d.classId], ['parentRace', d.parentRace],
        ['feature', d.feature],
        ['expandedSpells', d.expandedSpells],
      ]
      for (const [field, value] of fields) for (const id of idsOf(value)) check(entry.id, field, id)
      for (const field of ['supersededBy', 'versionGroup', 'fromVariantRule'] as const) if (typeof d[field] === 'string' && !all.has(d[field] as string)) issues.push({ pack: pack.manifest.id, entry: entry.id, field, value: d[field] as string })
      for (const member of (d.members as string[] | undefined) ?? []) check(entry.id, 'members[]', member)
      for (const content of (d.contents as Array<{ item?: string }> | undefined) ?? []) if (content.item) check(entry.id, 'contents[].item', content.item)
      for (const choice of (d.contentsChoice as Array<{ from?: Array<{ item?: string }> }> | undefined) ?? []) for (const x of choice.from ?? []) if (x.item) check(entry.id, 'contentsChoice[].from[].item', x.item)
      for (const step of (d.advancement as Array<Record<string, unknown>> | undefined) ?? []) {
        for (const id of (step.items as string[] | undefined) ?? []) { if (!soft(entry.id, 'advancement[].items[]', id, step)) check(entry.id, 'advancement[].items[]', id) }
        for (const id of (step.pool as string[] | undefined) ?? []) check(entry.id, 'advancement[].pool[]', id)
        if (typeof step.explain === 'string') check(entry.id, 'advancement[].explain', step.explain)
        if (typeof step.replaces === 'string') check(entry.id, 'advancement[].replaces', step.replaces)
      }
      const requires = d.requires as Record<string, unknown> | undefined
      for (const key of ['race', 'class', 'feature', 'spell', 'patron']) for (const id of idsOf(requires?.[key])) check(entry.id, `requires.${key}`, id)
      for (const effect of (d.effects as Array<Record<string, unknown>> | undefined) ?? []) if (effect.kind === 'spellGrant') for (const id of (effect.spells as string[] | undefined) ?? []) check(entry.id, 'effects[].spells[]', id)
      for (const id of tableRefs(entry.data)) check(entry.id, 'text.tableRef', id)
      // R13：英文版里的引用同样不能悬空、不能越过包依赖
      const english = (entry as { i18n?: { en?: { fields?: Record<string, unknown> } } }).i18n?.en?.fields ?? {}
      for (const [path, value] of Object.entries(english)) {
        for (const id of tableRefs(value)) check(entry.id, `i18n.en.fields.${path}.tableRef`, id)
        walkStrings(value, (s) => { for (const match of s.matchAll(/\{\{ref:([^|}]+)/g)) check(entry.id, `i18n.en.fields.${path}.ref`, match[1]) })
      }
      for (const row of (d.rows as Array<Record<string, unknown>> | undefined) ?? []) {
        for (const id of (row.refs as string[] | undefined) ?? []) check(entry.id, 'rows[].refs[]', id)
        const then = row.then as { table?: string } | undefined
        if (then?.table && !all.has(then.table)) issues.push({ pack: pack.manifest.id, entry: entry.id, field: 'rows[].then.table', value: then.table })
      }
    }
  }
  return { dangling: issues.filter((x) => !x.field.includes('依赖缺失')), dependency: issues.filter((x) => x.field.includes('依赖缺失')), softRefs }
}
