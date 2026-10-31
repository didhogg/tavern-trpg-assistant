import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PlannedEntry } from './plan'
import type { R9Candidate, R9ParentHint, R9Row } from './r9Types'
import { DATA_5ETOOLS } from '../extract/load'
import { BOOK_SOURCES } from '../config/books'
import { isObj, normRaw, slug, str } from './r9lib'

const PRI: Record<string, number> = { X: 0, B: 1, N: 2, V: 3, L: 4, D: 5, O: 6, M: 7, GG: 8, G: 9 }

interface Chapters { [source: string]: Array<{ name: string; page: number }> }

function loadChapters(): Chapters {
  const out: Chapters = {}
  for (const source of BOOK_SOURCES) {
    try {
      const raw = JSON.parse(readFileSync(join(DATA_5ETOOLS, 'book', `book-${source.toLowerCase()}.json`), 'utf8')) as Record<string, unknown>
      const bookData = Array.isArray(raw.bookData) ? raw.bookData : []
      const first = isObj(bookData[0]) ? bookData[0] : {}
      const data = Array.isArray(first.data) ? first.data : []
      out[source] = data.filter((s) => isObj(s) && s.type === 'section' && typeof s.page === 'number').map((s) => ({ name: str((s as Record<string, unknown>).name).replace(/^(第[一二三四五六七八九十百]+章|附录[A-Za-z]?)[：:]\s*/, ''), page: Number((s as Record<string, unknown>).page) }))
    } catch { out[source] = [] }
  }
  return out
}

function rk(c: R9Candidate): string {
  return c.ref ? JSON.stringify(['ref', c.cols.length, c.rows.length]) : JSON.stringify([c.expr ?? null, c.rows.map((r) => [r.min, r.max])])
}
function hk(c: R9Candidate): string {
  return JSON.stringify(c.rows.map((r) => r.cells.map(normRaw).join('|')))
}
function sim(a: R9Candidate, b: R9Candidate): number {
  let eq = 0
  for (let i = 0; i < a.rows.length; i++) if ((a.rows[i]?.cells ?? []).map(normRaw).join('|') === (b.rows[i]?.cells ?? []).map(normRaw).join('|')) eq++
  return eq / a.rows.length
}
function band(n: string): string | undefined {
  const m = /(\d+)\s*[~—\-–]\s*(\d+)/.exec(n)
  if (m) return `${m[1]}-${m[2]}`
  const p = /(\d+)\s*\+/.exec(n)
  return p ? `${p[1]}+` : undefined
}
function lootKind(n: string): string | undefined {
  if (/个人宝藏|个体宝藏/.test(n)) return 'ind'
  if (/宝藏堆|库藏宝藏/.test(n)) return 'hoard'
  return undefined
}
function stripParen(n: string): string { return n.replace(/[（(][^）)]*[）)]$/, '') }

export interface GoldenResult {
  survivors: R9Candidate[]
  dropped: R9Candidate[]
  redirects: Array<[string, string]>
  duplicateNames: string[]
  duplicateIds: string[]
}

export function selectSurvivors(pool: R9Candidate[], planned: PlannedEntry[]): GoldenResult {
  pool.forEach((c, i) => { c.i = i })
  const parent = pool.map((_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a: number, b: number): void => { parent[find(a)] = find(b) }
  const groupsByRk = new Map<string, number[]>()
  pool.forEach((c, i) => { if (!c.expr && !c.ref) return; const key = rk(c); groupsByRk.set(key, [...(groupsByRk.get(key) ?? []), i]) })
  for (const idxs of groupsByRk.values()) for (let a = 0; a < idxs.length; a++) for (let b = a + 1; b < idxs.length; b++) {
    const A = pool[idxs[a]], B = pool[idxs[b]]
    if (A.source !== B.source && A.origin !== 'L' && B.origin !== 'L') continue
    let why = ''
    if (hk(A) === hk(B)) why = '内容完全相同'
    else if (sim(A, B) >= 0.8) why = '80% 以上行相同'
    else if (A.cap === B.cap && sim(A, B) >= 0.6) why = '同名且 60% 以上行相同'
    else if (A.cap === B.cap && (A.origin === 'B') !== (B.origin === 'B') && A.page != null && B.page != null && Math.abs(A.page - B.page) <= 1) why = '同名且页码相差不超过 1'
    else if (A.ref && ((A.origin === 'M' && /对应挑战等级的怪物资料/.test(B.name)) || (B.origin === 'M' && /对应挑战等级的怪物资料/.test(A.name)))) why = '挑战等级怪物数值配对'
    else if (((A.origin === 'L' && (B.origin === 'GG' || B.origin === 'G')) || (B.origin === 'L' && (A.origin === 'GG' || A.origin === 'G'))) && A.cap === B.cap) why = '出身原因表按职业或背景名配对'
    else if (A.origin === 'X' && A.kind === 'loot' && (B.origin === 'G' || B.origin === 'GG') && lootKind(A.name) && lootKind(A.name) === lootKind(B.name) && band(A.name) && band(A.name) === band(B.name)) why = '宝藏表按挑战等级配对'
    else if (B.origin === 'X' && B.kind === 'loot' && (A.origin === 'G' || A.origin === 'GG') && lootKind(B.name) && lootKind(B.name) === lootKind(A.name) && band(B.name) && band(B.name) === band(A.name)) why = '宝藏表按挑战等级配对'
    if (why) union(idxs[a], idxs[b])
  }
  const groups = new Map<number, number[]>()
  pool.forEach((_, i) => { const r = find(i); groups.set(r, [...(groups.get(r) ?? []), i]) })
  const survivors: R9Candidate[] = []
  const dropped: R9Candidate[] = []
  for (const g of groups.values()) {
    const members = g.map((i) => pool[i]).sort((a, b) => PRI[a.origin] + (a.weak ? 100 : 0) - PRI[b.origin] - (b.weak ? 100 : 0) || (a.i ?? 0) - (b.i ?? 0))
    const s = members[0]
    s.merged = members.slice(1).map((m) => ({ origin: m.origin, name: m.name, oldId: m.oldId, source: m.source, page: m.page }))
    if (!s.chapter) s.chapter = members.find((m) => m.chapter)?.chapter
    s.extra.footnotes = s.extra.footnotes ?? members.find((m) => m.extra.footnotes)?.extra.footnotes
    const kinds = new Set(members.map((m) => m.kind))
    s.kind = members[0].ref ? 'ref' : (['loot', 'names', 'encounter', 'life', 'deck'].find((k) => kinds.has(k)) ?? 'roll')
    s.ref = !!members[0].ref
    s.parentHints = members.map((m) => m.parentHint).filter((x): x is R9ParentHint => !!x)
    survivors.push(s)
    for (const m of members.slice(1)) { m.survivorIndex = s.i; dropped.push(m) }
  }
  for (const s of survivors) s.srd = s.srd === true
  const byId = new Map(planned.map((e) => [e.id, e]))
  const findOne = (type: string, name: string, source?: string): PlannedEntry | undefined => {
    const list = planned.filter((e) => e.type === type && e.name === name)
    return (source ? list.find((e) => e.source === source) : undefined) ?? list.sort((a, b) => (a.source === 'PHB' ? -1 : 0) - (b.source === 'PHB' ? -1 : 0))[0]
  }
  for (const s of survivors) {
    s.parent = undefined
    if (s.origin === 'B') s.parent = s.parentId?.startsWith('lore.') ? s.parentId.slice(5) : s.parentId
    for (const h of s.parentHints ?? []) {
      if (s.parent) break
      let e: PlannedEntry | undefined
      if (h.prop) {
        const type = h.prop === 'variantrule' ? 'rule' : h.prop
        const name = String(h.uid).split('|')[0]
        const src = String(h.uid).split('|').pop()
        e = findOne(type, name, /^[A-Z]+$/.test(src ?? '') ? src : undefined)
      } else if (h.raceEn) e = byId.get(`race.${h.raceEn}.phb`)
      else if (h.cls) e = findOne('class', h.cls, 'PHB')
      else if (h.bg) e = findOne('background', stripParen(h.bg), 'PHB')
      else if (h.deckName) e = findOne('item', stripParen(h.deckName), s.source) ?? findOne('item', stripParen(h.deckName))
      if (e) s.parent = e.id
    }
  }
  const taken = new Set<string>(survivors.filter((s) => s.oldId).map((s) => s.oldId!))
  for (const d of dropped) if (d.oldId) taken.add(d.oldId)
  for (const s of survivors) {
    if (s.oldId) { s.id = s.oldId; continue }
    if (s.extra.gid) { s.id = s.extra.gid; continue }
    const base = `table.${slug(s.nameEn ? (s.nameEn.split(' ')[0] === '' ? 'x' : s.nameEn.slice(0, s.nameEn.lastIndexOf(' '))) : s.name)}.${s.source.toLowerCase()}`
    s.id = base
  }
  for (const s of [...survivors.filter((x) => !x.ref), ...survivors.filter((x) => x.ref)]) {
    if (s.oldId || s.origin !== 'B') continue
    const pe = s.parent ? byId.get(s.parent) : undefined
    const en = slug(pe?.nameEn ?? s.name)
    const base = `table.${en}.${s.source.toLowerCase()}`
    let id = base, n = 2
    while (taken.has(id)) id = `${base}-${n++}`
    taken.add(id)
    s.id = id
  }
  for (const s of survivors) {
    if (s.origin !== 'G' && s.origin !== 'GG') continue
    const pe = s.parent ? byId.get(s.parent) : undefined
    if (pe) { const tail = s.name.split('·').pop()!; s.name = normRaw(tail) === normRaw(pe.name) ? pe.name : `${pe.name}·${tail}` }
  }
  for (const s of survivors) { const parts = s.name.split('·'); if (parts.length === 2 && parts[0] === parts[1]) s.name = parts[0] }
  for (const s of survivors) if (s.kind === 'roll') {
    if (s.origin.startsWith('G') && /名字|姓名/.test(s.name) && !s.parent) s.kind = 'names'
    else if (s.origin.startsWith('G') && /遭遇/.test(s.name)) s.kind = 'encounter'
    else if (s.source === 'XGE' && s.chapter === '角色选项' && (s.page ?? 0) >= 62 && (s.page ?? 0) <= 73) s.kind = 'life'
  }
  const chapters = loadChapters()
  for (const s of survivors) {
    if (s.parent) { s.chapter = undefined; continue }
    if (!s.chapter && chapters[s.source]) {
      let pick: { name: string; page: number } | undefined
      for (const c of chapters[s.source]) if ((s.page ?? 0) > 0 && c.page <= (s.page ?? 0) && (!pick || c.page >= pick.page)) pick = c
      s.chapter = pick?.name
    }
  }
  const nm = new Map<string, R9Candidate[]>()
  for (const s of survivors) { const key = `${s.source}|${s.name}`; nm.set(key, [...(nm.get(key) ?? []), s]) }
  const duplicateNames = [...nm.values()].filter((l) => l.length > 1).map((l) => `${l[0].source}|${l[0].name}`)
  const ids = new Map<string, number>()
  for (const s of survivors) ids.set(s.id!, (ids.get(s.id!) ?? 0) + 1)
  const duplicateIds = [...ids].filter(([, n]) => n > 1).map(([id]) => id)
  const survivorOf = new Map<number, R9Candidate>()
  for (const s of survivors) survivorOf.set(s.i!, s)
  const redirects: Array<[string, string]> = []
  for (const d of dropped) {
    if (!d.oldId) continue
    const s = survivorOf.get(d.survivorIndex!)
    if (!s) continue
    if (d.oldId !== s.id) redirects.push([d.oldId, s.id!])
  }
  return { survivors, dropped, redirects, duplicateNames, duplicateIds }
}

export function candidateRows(c: R9Candidate): R9Row[] { return c.rows }
export function candidateDice(c: R9Candidate): string | undefined { return c.expr }
