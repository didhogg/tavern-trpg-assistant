import { createHash } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import type { Dump, Key, Obj, RawInfo } from './data'
import { isObj } from './data'
import type { How, Pair, PropPairing, RawPairing } from './pair'

export type Edition = '2014' | '2024' | 'both'

/** 一条要写进包的条目。外壳字段只有：编号、类型、名字、英文名、版本归属（不进包）；其余都是上游原样内容。 */
export interface Entry {
  id: string
  type: string
  name: string
  nameEn: string
  keywords: string[]
  unique: false
  /** 上游原样：有中文就是中文条目，没有中文就是英文条目（dataLang 说明是哪个） */
  data: Obj
  /** 中英都有时，英文原样 */
  dataEn?: Obj
  dataLang: 'zh' | 'en'
  // 以下不写进包
  kind: 'entity' | 'dataset'
  how: How | null
  edition: Edition
  source: string | null
  srd: boolean
  srd52: boolean
}

/** 版本归属：条目自带 edition 字段优先（classic→2014，one→2024），否则用上游 SourceUtil.isClassicSource 的结果；来源没有出版日期或没有来源就两个书架都放。 */
export function editionOf(k: Pick<Key, 'f' | 's' | 'c' | 'd'>): Edition {
  if (k.f === 'classic') return '2014'
  if (k.f === 'one') return '2024'
  if (k.s && k.d) return k.c ? '2014' : '2024'
  return 'both'
}

const truthy = (v: unknown): boolean => v === true || (typeof v === 'string' && v.length > 0)
const short = (s: string): string => (s.length <= 150 ? s : `${s.slice(0, 120)}~${createHash('sha1').update(s).digest('hex').slice(0, 12)}`)

function nameOf(v: Obj, fallback: string): string {
  for (const k of ['name', 'abbreviation', 'id', 'caption', 'cr']) { const x = v[k]; if ((typeof x === 'string' || typeof x === 'number') && String(x)) return String(x) }
  return fallback
}

export function buildEntityEntries(pairing: Map<string, PropPairing>): Entry[] {
  const out: Entry[] = []
  const seen = new Map<string, number>()
  for (const prop of [...pairing.keys()].sort()) {
    const { pairs } = pairing.get(prop)!
    pairs.forEach((p: Pair, n) => {
      const primary = (p.cn ?? p.bak)!
      const v = primary.value
      const name = nameOf(v, `${prop}#${n}`)
      const nameEn = p.bak ? nameOf(p.bak.value, name) : typeof v.ENG_name === 'string' ? v.ENG_name : name
      const baseId = short(`${prop}:${p.bak?.key.h ?? p.cn?.key.h ?? `#${n}`}`)
      const c = (seen.get(baseId) ?? 0) + 1
      seen.set(baseId, c)
      let ed = editionOf(primary.key)
      if (ed === 'both' && p.cn && p.bak) ed = editionOf(p.bak.key)
      out.push({
        id: c === 1 ? baseId : `${baseId}~${c}`, type: prop, name, nameEn, keywords: [...new Set([name, nameEn])], unique: false,
        data: v, ...(p.cn && p.bak ? { dataEn: p.bak.value } : {}), dataLang: p.cn ? 'zh' : 'en',
        kind: 'entity', how: p.how, edition: ed, source: primary.key.s, srd: truthy(v.srd), srd52: truthy(v.srd52),
      })
    })
  }
  return out
}

export interface DatasetResult {
  entries: Entry[]
  /** 中文原始记录编号 → 去处 */
  cnDest: Map<number, 'entity' | 'dataset'>
  /** 英文原始记录编号 → 去处（可能同时在实体和数据集里） */
  bakDest: Map<number, Array<'entity' | 'dataset'>>
}

/** 没有被取数层条目覆盖的原始记录，整条原样放进"数据集"条目（按 文件×数组×来源 分组）。 */
export function buildDatasets(db: DatabaseSync, cnRaw: RawInfo[], bakRaw: RawInfo[], cn: Dump, bak: Dump, rp: RawPairing): DatasetResult {
  const covered = (dump: Dump): Set<string> => { const s = new Set<string>(); for (const [prop, l] of dump.byProp) for (const e of l) if (e.key.h) s.add(`${prop}|${e.key.h}`); return s }
  const cnCov = covered(cn), bakCov = covered(bak)
  const cnDest = new Map<number, 'entity' | 'dataset'>()
  const bakDest = new Map<number, Array<'entity' | 'dataset'>>()
  for (const r of bakRaw) bakDest.set(r.id, r.h && bakCov.has(`${r.category}|${r.h}`) ? ['entity'] : [])
  const body = db.prepare('SELECT kind, body FROM raw WHERE id=?')
  const val = (id: number): unknown => { const r = body.get(id) as { kind: string; body: string }; return r.kind === 'text' ? r.body : JSON.parse(r.body) }
  const bakById = new Map(bakRaw.map((r) => [r.id, r]))
  const groups = new Map<string, { file: string; category: string; ed: Edition; source: string | null; rows: Array<{ idx: number; value: unknown; en?: unknown }>; lang: 'zh' | 'en' }>()
  const add = (r: RawInfo, lang: 'zh' | 'en', value: unknown, en?: unknown): void => {
    const ed = editionOf(r)
    const k = `${r.file}\u0001${r.category}\u0001${ed}\u0001${r.s ?? ''}\u0001${lang}`
    const g = groups.get(k) ?? { file: r.file, category: r.category, ed, source: r.s, rows: [], lang }
    g.rows.push({ idx: r.idx, value, ...(en !== undefined ? { en } : {}) })
    groups.set(k, g)
  }
  for (const r of cnRaw) {
    if (r.h && cnCov.has(`${r.category}|${r.h}`)) { cnDest.set(r.id, 'entity'); continue }
    cnDest.set(r.id, 'dataset')
    const bid = rp.byCnId.get(r.id)
    if (bid !== undefined) { const d = bakDest.get(bid)!; d.push('dataset') }
    add(r, 'zh', val(r.id), bid !== undefined ? val(bid) : undefined)
  }
  // 英文原始记录既没被英文取数层条目覆盖、也没跟着中文那条进数据集的：以英文原样放进数据集（保证每条都有去处）
  for (const r of bakRaw) {
    if (bakDest.get(r.id)!.length) continue
    bakDest.get(r.id)!.push('dataset')
    add(bakById.get(r.id)!, 'en', val(r.id))
  }
  const entries: Entry[] = []
  for (const g of [...groups.values()].sort((a, b) => a.file.localeCompare(b.file) || a.category.localeCompare(b.category) || a.ed.localeCompare(b.ed) || String(a.source).localeCompare(String(b.source)))) {
    g.rows.sort((a, b) => a.idx - b.idx)
    const title = `${g.category}（${g.file}）`
    const hasEn = g.rows.some((r) => r.en !== undefined)
    entries.push({
      id: short(`dataset:${g.file}#${g.category}#${g.source ?? '-'}#${g.ed}#${g.lang}`), type: 'dataset', name: title, nameEn: title, keywords: [g.category], unique: false,
      data: { file: g.file, category: g.category, rows: g.rows.map((r) => ({ idx: r.idx, value: r.value })) },
      ...(hasEn ? { dataEn: { file: g.file, category: g.category, rows: g.rows.filter((r) => r.en !== undefined).map((r) => ({ idx: r.idx, value: r.en })) } } : {}),
      dataLang: g.lang, kind: 'dataset', how: null, edition: g.ed, source: g.source, srd: false, srd52: false,
    })
  }
  void isObj
  return { entries, cnDest, bakDest }
}
