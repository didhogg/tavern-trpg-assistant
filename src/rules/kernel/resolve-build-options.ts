import { refKey } from '../../core/saves/split'
import type { ScopedLibrary } from '../../library/scoped'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { LibraryService } from '../../library/service'
import type { LibraryView } from '../../library/revision'
import { checkBuildExtras, type ExtraCandidate, type ExtraKind, type ExtraPools, type ExtraWithCandidates, type FrameExtras } from './build-options'
import { kernelEntryOf } from './entry'
import type { KernelSession } from './host'
import { namerFor } from './naming'
import { display, type DisplayIssue } from './display'
import { fromLibrary, plugin, requirementOf, type Displayed, type FrameText } from './shown'
import type { FrameStep } from './frame/commands-options'
import { kernelDataSource } from '../../library/sources'
import type { PairsOf } from './sidecar'
import { abilityView, type AbilityPlan, type AbilityView } from './ability-rules'
import type { BuildPick } from './frame/commands-level'

export interface BuildOptionPlan { items: EntryRef[]; picks?: BuildPick[][]; blank?: boolean; abilities?: AbilityPlan }
/** 经显示出口前的一件条目（文字都是 FrameText）。 */
interface FrameItem { ref: EntryRef; name: FrameText | null; steps: FrameStep[]; extras: ExtraWithCandidates[]; unsupported: FrameText[] }
/** 给界面的一件条目：文字都是过了显示出口的 Shown。 */
export type BuildOptionsItem = Displayed<FrameItem>
/** untranslated：显示出口没取到本战役语言、显示了原文的文字（语言审计按它数）。 */
export interface BuildOptionsResult { status: string; error?: string; detail?: unknown; items?: BuildOptionsItem[]; complete?: boolean; abilities?: AbilityView; extraIssue?: string | null; untranslated?: string[]; displayIssues?: DisplayIssue[] }
type EntryRow = { ref: EntryRef; entry: unknown; zh: unknown | null; name: string | null }
type FrameRow = Partial<FrameExtras> & { refKey: string; steps: FrameStep[]; unsupported: FrameText[] }
type FrameAbilities = { initial: Record<string, number>; auto: Record<string, number>; cap: number | null; labels: Record<string, FrameText> }

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
  const names = new Map<string, { ref: EntryRef; name: string; source: string | null }>()
  /** 候选编号 → 本战役库里生效的这一条的原始前置条件（房规改过就是改过的）。 */
  const prerequisites = new Map<string, unknown>()
  const pools: ExtraPools = Object.fromEntries(await Promise.all(neededPools(rows).map(async kind => {
    const available = await scoped.query(library, kind, { view })
    const pool = await Promise.all(available.map(async row => {
      const key = refKey(row.ref)
      const local = row.item as Record<string, unknown>
      const { entry } = await kernelEntryOf(scoped, library.codeSet, row.ref, row.item, row.version.altId, view)
      names.set(key, { ref: row.ref, name: typeof local.name === 'string' ? local.name : row.ref.hash, source: row.source })
      if (local.prerequisite !== undefined) prerequisites.set(key, local.prerequisite)
      return { key, entry: entry as Record<string, unknown>, ...(kind === 'subclass' && entry !== local ? { local } : {}) }
    }))
    return [kind, pool]
  })))
  const items = rows.map(row => ({ prop: row.ref.prop, refKey: refKey(row.ref), entry: row.entry }))
  const local = Object.fromEntries(rows.flatMap(row => row.zh ? [[refKey(row.ref), row.zh]] : []))
  const out = await deps.session.call('buildOptions', { items, picks, blank: plan.blank, extraPools: pools, local, traitScope: await traitItemScope(scoped, library, view, rows) })
  if (out.status !== 'complete') return { status: out.status, error: out.error ?? `建卡选项状态：${out.status}`, detail: out }
  const frameRows = out.result.items as FrameRow[]
  const byKey = new Map(frameRows.map(row => [row.refKey, row]))
  const extraBlocked = frameRows.flatMap(row => row.blocked ?? [])
  const selected = new Set(plan.items.map(refKey))
  const frameItems: FrameItem[] = rows.map(row => {
    const described = byKey.get(refKey(row.ref))
    const extras: ExtraWithCandidates[] = (described?.extras ?? []).map(group => {
      const candidates: ExtraCandidate[] = group.candidates.flatMap(({ key, needsCheck }) => {
        const hit = names.get(key)
        return hit ? [{ ref: hit.ref, name: fromLibrary(hit.name), source: hit.source, ...(needsCheck ? { requirement: requirementOf(key) } : {}) }] : []
      })
      return { ...group, candidates, ...(candidates.some(c => c.requirement) ? { unfiltered: true } : {}) }
    })
    const reminders = extras.flatMap(group => group.candidates.filter(c => c.requirement && selected.has(refKey(c.ref))))
      .map(c => plugin('{0}的前置条件请核对：{1}', c.name, c.requirement!))
    return { ref: row.ref, name: row.name === null ? null : fromLibrary(row.name), steps: described?.steps ?? [], extras, unsupported: [...(described?.unsupported ?? []), ...(described?.blocked ?? []), ...reminders] }
  })
  // 唯一的显示出口：所有文字按来路换成本战役语言（display.ts）
  const shown = await display({ items: frameItems, abilities: out.result.abilities as FrameAbilities }, {
    translate: library.codeSet !== kernelDataSource().codeSet,
    pairs: await deps.pairsOf(rows),
    namer: await namerFor(scoped, library),
    author: deps.service.texts.reader(library.codeSet),
    requirementOf: key => prerequisites.get(key),
  })
  const resultItems = shown.value.items
  // 只有「选错」拦创建；没选完、这一组还选不了（已列在 unsupported）都留空照样能建
  const check = checkBuildExtras(resultItems.flatMap(row => row.extras), plan.items)
  const complete = out.result.complete && !check.wrong && !check.missing && !extraBlocked.length
  return { status: 'complete', items: resultItems, complete, abilities: abilityView(shown.value.abilities, plan.abilities), extraIssue: check.wrong, ...(shown.missed.length ? { untranslated: shown.missed, displayIssues: shown.issues } : {}) }
}
