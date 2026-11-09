// 按战役搜索（P5 B-01）：作者搜索器会返回三种命中——条目、书 / 冒险、规则速查等文档。
// 以前一律当条目，书和文档点进去找不到（甚至指到自制包）。这里按命中的种类分流，每条带 target 说明点开走哪条路。
import { parseDocumentHash, type CorpusIndex, type EntryLinks } from './entry-links'
import type { LibraryService } from './service'
import type { SearchHit } from './runtime/frame/read-commands'
import { refKey, ruleScopes, type CampaignLibrary, type Assignment, type EntryRef, type Membership, type ViewReason } from './scopes'
import type { SourceEntry } from './sources'

/** 命中点开后走哪条路。 */
export type SearchTarget =
  | { kind: 'entry' }
  | { kind: 'corpus'; prop: string; id: string; source: string | null }
  | { kind: 'document'; id: string; chapter: number | null; header: string | null }

export type ScopedSearchHit = SearchHit & { ref: EntryRef; reason: ViewReason; target: SearchTarget }

/**
 * 判断一条命中属于哪一种。点不开的（作者的"页面"类、自制里的书 / 冒险）返回 null，不交给界面。
 * 纯函数：判断依据是书目（corpus）与文档编号，不写死类别名。
 */
export function routeHit(hit: Pick<SearchHit, 'prop' | 'doc'>, corpus: CorpusIndex, documentIds: Iterable<string>): { target: SearchTarget; hash: string } | null {
  const hash = String(hit.doc.u ?? '')
  const doc = parseDocumentHash(hash, documentIds)
  if (doc) return { target: { kind: 'document', ...doc }, hash }
  if (!hit.prop) return null
  const byProp = corpus.get(hit.prop)
  if (byProp) {
    const row = byProp.get(hash.toLowerCase())
    return row ? { target: { kind: 'corpus', prop: hit.prop, id: row.id, source: row.source }, hash } : null
  }
  return { target: { kind: 'entry' }, hash }
}

export interface SearchDeps {
  lib: LibraryService
  links: EntryLinks
  sets: SourceEntry[]
  installed: (set: SourceEntry) => Promise<boolean>
  viewFor: (c: CampaignLibrary, ref: EntryRef, source: string | null, assigns: Map<string, Assignment>) => Promise<{ visible: boolean; reason: ViewReason; membership: Membership }>
  assignments: () => Promise<Map<string, Assignment>>
  houseUnits: () => Promise<Set<string>>
}

/** 作者搜索器（本规则要显示旧版时临时打开），结果只留本战役看得到的；条目所在的包由 `locate` 定，不再靠"官方里有没有"猜。 */
export async function scopedSearch(d: SearchDeps, c: CampaignLibrary, term: string): Promise<ScopedSearchHit[]> {
  const official = d.sets.find((s) => s.kind === 'official')
  if (!official || !(await d.installed(official))) return []
  const hits = await d.lib.search(official.id, term, { showLegacy: ruleScopes(c.rule).showLegacy })
  const corpus = await d.links.corpusIndex(c.codeSet)
  const documentIds = await d.links.documentIds(c.codeSet)
  const assigns = await d.assignments()
  const house = await d.houseUnits()
  const out: ScopedSearchHit[] = []
  for (const h of hits) {
    const routed = routeHit(h, corpus, documentIds)
    if (!routed) continue
    const source = typeof h.doc.s === 'string' ? h.doc.s : null
    const located = routed.target.kind === 'entry'
      ? await d.links.locate(c.codeSet, h.prop, routed.hash)
      : { set: official.id, prop: routed.target.kind === 'document' ? 'document' : h.prop }
    if (!located) continue
    const ref: EntryRef = { set: located.set, prop: located.prop, hash: routed.hash }
    if (house.has(refKey(ref))) continue
    // 文档（规则速查等）不属于哪本书的范围，任何战役都看得到
    if (routed.target.kind === 'document') { out.push({ ...h, ref, reason: 'global', target: routed.target }); continue }
    const v = await d.viewFor(c, ref, source, assigns)
    if (v.visible) out.push({ ...h, ref, reason: v.reason, target: routed.target })
  }
  return out
}
