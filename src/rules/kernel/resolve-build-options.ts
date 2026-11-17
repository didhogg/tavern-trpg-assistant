import { refKey } from '../../core/saves/split'
import type { ScopedLibrary } from '../../library/scoped'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { LibraryService } from '../../library/service'
import type { LibraryView } from '../../library/revision'
import { checkBuildExtras, type ExtraCandidate, type ExtraKind, type ExtraPools, type ExtraWithCandidates, type FrameExtras } from './build-options'
import { authorTextFor, localizeHints } from './author-text'
import { kernelEntryOf } from './entry'
import type { KernelSession } from './host'
import { localizeAll } from './locale'
import { nameAll, namerFor } from './naming'
import type { PairsOf } from './sidecar'
import { abilityView, type AbilityPlan, type AbilityView } from './ability-rules'
import type { BuildPick } from './frame/commands-level'

export interface BuildOptionPlan { items: EntryRef[]; picks?: BuildPick[][]; blank?: boolean; abilities?: AbilityPlan }
export interface BuildOptionsItem { ref: EntryRef; name: string | null; steps: unknown[]; extras: ExtraWithCandidates[]; unsupported: string[] }
export interface BuildOptionsResult { status: string; error?: string; detail?: unknown; items?: BuildOptionsItem[]; complete?: boolean; abilities?: AbilityView; extraIssue?: string | null }
type EntryRow = { ref: EntryRef; entry: unknown; zh: unknown | null; name: string | null }
type FrameRow = Partial<FrameExtras> & { refKey: string; steps: unknown[]; unsupported: string[] }

function neededPools(rows: EntryRow[]): ExtraKind[] {
  const kinds = new Set<ExtraKind>()
  for (const { ref, entry } of rows) {
    const entity = entry as Record<string, unknown>
    if (ref.prop === 'class') kinds.add('subclass')
    if (entity.feats || entity.featProgression) kinds.add('feat')
    if (entity.optionalfeatureProgression) kinds.add('optionalfeature')
  }
  return [...kinds]
}

// The author decides which items match the filter. The campaign decides which of those can be selected.
export async function traitItemScope(scoped: ScopedLibrary, library: CampaignLibrary, view: LibraryView, rows: Array<{ entry: unknown }>): Promise<string[] | undefined> {
  function hasFilter(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false
    if ('fromFilter' in value && typeof value.fromFilter === 'string') return true
    return Object.values(value).some(hasFilter)
  }
  if (!rows.some(({ entry }) => hasFilter(entry))) return undefined
  const items = await scoped.query(library, 'item', { view })
  return [...new Set(items.flatMap(({ item, source }) => {
    const local = item as { name?: string; ENG_name?: string; source?: string }
    return [local.name, local.ENG_name].filter(Boolean).map(name => `${name}|${local.source ?? source}`.toLowerCase())
  }))]
}

export async function resolveBuildOptions(deps: {
  session: KernelSession
  scoped: ScopedLibrary
  service: LibraryService
  library: CampaignLibrary
  view: LibraryView
  pairsOf: PairsOf
}, plan: BuildOptionPlan, rows: EntryRow[], picks: Record<string, BuildPick[]>): Promise<BuildOptionsResult> {
  const { scoped, library, view } = deps
  const names = new Map<string, ExtraCandidate>()
  const pools: ExtraPools = Object.fromEntries(await Promise.all(neededPools(rows).map(async kind => {
    const available = await scoped.query(library, kind, { view })
    const pool = await Promise.all(available.map(async row => {
      const key = refKey(row.ref)
      const local = row.item as Record<string, unknown>
      const { entry } = await kernelEntryOf(scoped, library.codeSet, row.ref, row.item, row.version.altId, view)
      names.set(key, { ref: row.ref, name: typeof local.name === 'string' ? local.name : row.ref.hash, source: row.source })
      return { key, entry: entry as Record<string, unknown>, ...(kind === 'subclass' && entry !== local ? { local } : {}) }
    }))
    return [kind, pool]
  })))
  const items = rows.map(row => ({ prop: row.ref.prop, refKey: refKey(row.ref), entry: row.entry }))
  const local = Object.fromEntries(rows.flatMap(row => row.zh ? [[refKey(row.ref), row.zh]] : []))
  const out = await deps.session.call('buildOptions', { items, picks, blank: plan.blank, extraPools: pools, local, traitScope: await traitItemScope(scoped, library, view, rows) })
  if (out.status !== 'complete') return { status: out.status, error: out.error ?? `建卡选项状态：${out.status}`, detail: out }
  const author = authorTextFor(deps.service, library.codeSet)
  const shown = await localizeHints(await nameAll(localizeAll(out.result.items, await deps.pairsOf(rows)), await namerFor(scoped, library)), author) as FrameRow[]
  const byKey = new Map(shown.map(row => [row.refKey, row]))
  const extraBlocked = shown.flatMap(row => row.blocked ?? [])
  const selected = new Set(plan.items.map(refKey))
  const labels = shown.flatMap(row => (row.extras ?? []).flatMap(group => group.labels ?? []))
  const translations = await author.at(labels.map(label => label.at))
  const titles = new Map(labels.map((label, i) => [label.at.join('.'), translations[i] ?? label.text]))
  const resultItems: BuildOptionsItem[] = rows.map(row => {
    const described = byKey.get(refKey(row.ref))
    const extras = (described?.extras ?? []).map(({ labels, ...group }) => {
      const candidates = group.candidates.flatMap(({ key, requirement }) => {
        const candidate = names.get(key)
        return candidate ? [{ ...candidate, ...(requirement ? { requirement } : {}) }] : []
      })
      const title = labels?.map(label => titles.get(label.at.join('.'))).join(' · ') || group.title
      return { ...group, title, candidates, ...(candidates.some(c => c.requirement) ? { unfiltered: true } : {}) }
    })
    const pendingRequirements = extras.flatMap(group => group.candidates.filter(c => c.requirement && selected.has(refKey(c.ref))))
    const reminders = pendingRequirements.map(c => `${c.name}的前置条件请核对：${c.requirement}`)
    return { ref: row.ref, name: row.name, steps: described?.steps ?? [], extras, unsupported: [...(described?.unsupported ?? []), ...(described?.blocked ?? []), ...reminders] }
  })
  const extraIssue = extraBlocked[0] ?? checkBuildExtras(resultItems.flatMap(row => row.extras), plan.items)
  return { status: 'complete', items: resultItems, complete: out.result.complete && !extraIssue, abilities: abilityView(out.result.abilities, plan.abilities), extraIssue }
}
