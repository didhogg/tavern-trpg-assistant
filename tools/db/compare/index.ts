import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPORT_DIR } from '../lib/paths'
import { buildNameIndex, loadManifest, loadOld, loadRecords } from './load'
import { renderReport } from './render'
import type { BookRow, CategoryRow, CompareResult, Counter, Fate, NewRec, OldEntry, TypeRow, Vanish } from './types'

/**
 * T4 步骤1：新旧比对（只读）。目的：列出"切到数据源之后，旧库哪些条目会消失、它们是什么"。
 *   旧 = 数据仓库 tavern-trpg-data 已发布的包（每条有英文名 nameEn 和来源书 data.src.book）
 *   新 = T3 源清单里登记的全部源（数量以清单为准），所有记录形状，加全部嵌套名字
 * 原则（驾驶员 2026-11-06）：旧库和源对不上，是转换器的问题，以数据源为准。所以这里不替旧条目找配对规则，只分去向：
 *   sameBook     新源有"同英文名 + 同一本书"的记录
 *   elsewhere    名字在官方数据的别处出现（嵌套在别的记录、章节、表里，或来源不同）
 *   homebrewOnly 名字只在自制仓库出现
 *   nowhere      所有源的任何位置都没有这个名字
 */
const lower = (s: string): string => s.trim().toLowerCase()
const keyOf = (name: string, source: string): string => `${lower(name)}\u0001${source}`
/** 宽松口径：只比字母和数字（撇号、加号、空格、大小写差异都不算不同）。只用来给"对不上"的数字划出范围，不是配对规则。 */
const loose = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
const looseKeyOf = (name: string, source: string): string => `${loose(name)}\u0001${source}`
const inc = (c: Counter, k: string, n = 1): void => { c[k] = (c[k] ?? 0) + n }
const top = (c: Counter, n: number): Array<[string, number]> => Object.entries(c).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
const sortedEx = (l: OldEntry[]): Array<{ name: string; nameEn: string; book: string; credit: string }> =>
  [...l].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 3).map((e) => ({ name: e.name, nameEn: e.nameEn, book: e.book, credit: e.credit }))

/**
 * 官方记录去重合并：所有官方仓库（登记表里 kind=official 的，数量以清单为准）里"同类别 + 同英文名 + 同来源"算一条，
 * 取清单里排在前面的仓库的那一份。没有英文名的记录无法对上，按（类别, 来源, 版本）分组，取各仓库里最多的那个数。
 */
function officialUnique(recs: NewRec[], officialIds: Set<string>): NewRec[] {
  const seen = new Map<string, NewRec>()
  const unnamed = new Map<string, { rec: NewRec; per: Counter }>()
  for (const r of recs) {
    if (!officialIds.has(r.repo)) continue
    if (r.nameEn.trim()) {
      const k = `${r.category}\u0001${lower(r.nameEn)}\u0001${r.source}`
      if (!seen.has(k)) seen.set(k, r)
    } else {
      const k = `${r.category}\u0001${r.source}\u0001${r.edition}`
      const g = unnamed.get(k) ?? { rec: r, per: {} }
      inc(g.per, r.repo)
      unnamed.set(k, g)
    }
  }
  const out = [...seen.values()]
  for (const g of unnamed.values()) for (let i = 0; i < Math.max(...Object.values(g.per)); i += 1) out.push(g.rec)
  return out
}

function compare(): CompareResult {
  const manifest = loadManifest()
  const old = loadOld()
  const recs = loadRecords()
  const idx = buildNameIndex(manifest, new Set(old.entries.map((e) => lower(e.nameEn)).filter(Boolean)))
  const officialIds = new Set(manifest.repos.filter((r) => r.kind === 'official').map((r) => r.id))
  const lang = new Map(manifest.repos.map((r) => [r.id, r.lang]))
  const oldBooks = new Set(old.entries.map((e) => e.book).filter(Boolean))

  // 顶层记录的"英文名 + 来源书"：中文仓库用 ENG_name，英文仓库用 name
  const topKeys = new Set<string>()
  const topLoose = new Set<string>()
  for (const r of recs) {
    const en = r.nameEn || (lang.get(r.repo) === 'en' ? r.name : '')
    if (en) { topKeys.add(keyOf(en, r.source)); topLoose.add(looseKeyOf(en, r.source)) }
  }

  const fate = new Map<OldEntry, Fate>()
  const whereOf = new Map<OldEntry, string[]>()
  const matchedKeys = new Set<string>()
  for (const e of old.entries) {
    const k = keyOf(e.nameEn, e.book)
    if (topKeys.has(k)) { fate.set(e, 'sameBook'); matchedKeys.add(k); continue }
    const off = idx.official.get(lower(e.nameEn))
    if (off) { fate.set(e, 'elsewhere'); whereOf.set(e, [...off.keys()]) } else if (idx.homebrew.has(lower(e.nameEn))) fate.set(e, 'homebrewOnly')
    else fate.set(e, 'nowhere')
  }
  const looseGoneSet = new Set(old.entries.filter((e) => fate.get(e) !== 'sameBook' && !topLoose.has(looseKeyOf(e.nameEn, e.book))))

  const fates: Record<Fate, number> = { sameBook: 0, elsewhere: 0, homebrewOnly: 0, nowhere: 0 }
  for (const f of fate.values()) fates[f] += 1

  const types = [...new Set(old.entries.map((e) => e.type))].sort()
  const perType: TypeRow[] = types.map((type) => {
    const es = old.entries.filter((e) => e.type === type)
    const by = (f: Fate): OldEntry[] => es.filter((e) => fate.get(e) === f)
    const found = by('sameBook')
    const gone = es.filter((e) => fate.get(e) !== 'sameBook')
    const where: Counter = {}
    for (const e of by('elsewhere')) for (const w of whereOf.get(e) ?? []) inc(where, w)
    const keys = [...new Set(es.flatMap((e) => e.keys))]
    const markers = keys
      .map((key) => ({ key, vanished: gone.filter((e) => e.keys.includes(key)).length, found: found.filter((e) => e.keys.includes(key)).length }))
      .filter((m) => gone.length > 0 && m.vanished / gone.length - (found.length ? m.found / found.length : 0) >= 0.3)
      .sort((a, b) => b.vanished - a.vanished || a.key.localeCompare(b.key)).slice(0, 3)
    const credits: Counter = {}
    for (const e of gone) inc(credits, e.credit || '（无）')
    return {
      type, total: es.length, looseGone: es.filter((e) => looseGoneSet.has(e)).length, sameBook: found.length, elsewhere: by('elsewhere').length, homebrewOnly: by('homebrewOnly').length, nowhere: by('nowhere').length,
      elsewhereWhere: top(where, 3), markers, credits: top(credits, 4),
      examples: { sameBook: sortedEx(found), elsewhere: sortedEx(by('elsewhere')), homebrewOnly: sortedEx(by('homebrewOnly')), nowhere: sortedEx(by('nowhere')) },
    }
  })

  const creditAll: Counter = {}
  const creditGone: Counter = {}
  for (const e of old.entries) { inc(creditAll, e.credit || '（无）'); if (fate.get(e) !== 'sameBook') inc(creditGone, e.credit || '（无）') }

  // 按书：所有官方仓库的记录去重合并后统计（见 officialUnique），所有形状
  const cn = officialUnique(recs, officialIds)
  const matchedRec = (r: NewRec): boolean => !!r.nameEn && matchedKeys.has(keyOf(r.nameEn, r.source))
  const oldByBook = new Map<string, OldEntry[]>()
  for (const e of old.entries) if (e.book) oldByBook.set(e.book, [...(oldByBook.get(e.book) ?? []), e])
  const names = new Map(manifest.sources.filter((s) => s.kind === 'official').map((s) => [s.id, s]))
  const perBook: BookRow[] = [...oldByBook.keys()].sort().map((book) => {
    const es = oldByBook.get(book)!
    const nr = cn.filter((r) => r.source === book)
    const s = names.get(book)
    return {
      book, name: s?.name ?? '', nameEn: s?.nameEn ?? '', edition: s?.edition ?? '', oldPacks: [...new Set(es.map((e) => e.pack))].sort(),
      oldEntries: es.length, sameBook: es.filter((e) => fate.get(e) === 'sameBook').length, newRecords: nr.length, newOnly: nr.filter((r) => !matchedRec(r)).length,
    }
  })

  const perCat = new Map<string, { inScope: number; matched: number; newOnly: number; ed: Counter; out: number }>()
  for (const r of cn) {
    const c = perCat.get(r.category) ?? { inScope: 0, matched: 0, newOnly: 0, ed: {}, out: 0 }
    perCat.set(r.category, c)
    if (!oldBooks.has(r.source)) { c.out += 1; continue }
    c.inScope += 1
    if (matchedRec(r)) c.matched += 1
    else { c.newOnly += 1; inc(c.ed, r.edition) }
  }
  const perCategory: CategoryRow[] = [...perCat.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, c]) => ({ category, inScope: c.inScope, matched: c.matched, newOnly: c.newOnly, newOnlyByEdition: top(c.ed, 4), outOfScope: c.out }))

  const nameKeys: Counter = {}
  for (const m of idx.official.values()) for (const [label, n] of m) inc(nameKeys, label.split('/')[0]!, n)
  const outBooks = new Set(cn.map((r) => r.source).filter((s) => s && !oldBooks.has(s)))
  const vanish: Vanish[] = old.entries.filter((e) => fate.get(e) !== 'sameBook')
    .map((e) => ({ id: e.id, type: e.type, name: e.name, nameEn: e.nameEn, book: e.book, fate: fate.get(e)!, credit: e.credit }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id))

  return {
    oldFingerprint: old.fingerprint,
    newIndexSha256: manifest.recordIndex.sha256,
    repos: manifest.repos.map((r) => ({ id: r.id, records: recs.filter((x) => x.repo === r.id).length, files: idx.files.get(r.id) ?? 0 })),
    oldPacks: old.packs, oldEntries: old.entries.length, oldBooks: oldBooks.size, fates,
    goneStrict: vanish.length, goneLoose: looseGoneSet.size, officialRepos: [...officialIds], nameKeys: top(nameKeys, 12),
    creditAll: top(creditAll, 6), creditVanished: top(creditGone, 6),
    newOutOfScopeBooks: outBooks.size, newOutOfScopeRecords: cn.filter((r) => r.source && !oldBooks.has(r.source)).length,
    perBook, perType, perCategory, vanish,
  }
}

const result = compare()
mkdirSync(REPORT_DIR, { recursive: true })
writeFileSync(join(REPORT_DIR, '新旧比对.json'), `${JSON.stringify(result, null, 2)}\n`)
writeFileSync(join(REPORT_DIR, '新旧比对.md'), renderReport(result))
console.log(`旧库 ${result.oldPacks} 包 / ${result.oldEntries} 条；${result.repos.length} 个源；对不上 ${result.goneStrict} 条（宽松口径 ${result.goneLoose}）；报告：${join(REPORT_DIR, '新旧比对.md')}`)
