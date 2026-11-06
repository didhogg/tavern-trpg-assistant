import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { readdirSync } from 'node:fs'
import { OUT_ROOT, RAW_DB, REPO } from '../lib/paths'

export type Lib = 'cn' | 'bak'
export type Obj = Record<string, unknown>

/** 上游给每条取数层条目算出的身份与版本依据（见 upstream/dump.ts）。 */
export interface Key { h: string | null; e: string | null; s: string | null; f: string | null; c: boolean | null; d: boolean }
export interface Ent { prop: string; i: number; lib: Lib; value: Obj; key: Key }

const U = join(OUT_ROOT, '_upstream')
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T

export interface Dump { lib: Lib; props: string[]; byProp: Map<string, Ent[]> }

/** 上游 DataLoader 取出的条目。raw_* 是上游为类/职业特性等留的"加工前副本"（上游代码 _getAsRawPrefixed 的命名），不另成条目。 */
export function loadDump(lib: Lib): Dump {
  const dir = join(U, `dump_${lib}`)
  const summary = readJson<{ summary: Array<{ prop: string; count: number | null }> }>(join(dir, '_summary.json'))
  const byProp = new Map<string, Ent[]>()
  for (const s of summary.summary) {
    if (s.count == null || s.prop.startsWith('raw_')) continue
    const rows = readJson<Obj[]>(join(dir, `${s.prop}.json`))
    const keys = readJson<Key[]>(join(dir, `${s.prop}.keys.json`))
    byProp.set(s.prop, rows.map((value, i) => ({ prop: s.prop, i, lib, value, key: keys[i]! })))
  }
  return { lib, props: [...byProp.keys()].sort(), byProp }
}

export interface RawInfo { id: number; file: string; category: string; idx: number; kind: string; h: string | null; s: string | null; c: boolean | null; d: boolean; f: string | null }

/** 原样库里的原始记录（不含正文）+ 上游算的哈希与来源依据。 */
export function loadRawInfo(db: DatabaseSync, lib: Lib): RawInfo[] {
  const keys = new Map(readJson<Array<[number, string | null, string | null, boolean | null, boolean, string | null]>>(join(U, `rawkeys_${lib}.json`)).map((k) => [k[0], k]))
  const out: RawInfo[] = []
  for (const r of db.prepare('SELECT id, file, category, idx, kind FROM raw WHERE lib=? ORDER BY file, category, idx').iterate(lib) as Iterable<{ id: number; file: string; category: string; idx: number; kind: string }>) {
    const k = keys.get(r.id)
    out.push({ ...r, h: k?.[1] ?? null, s: k?.[2] ?? null, c: k?.[3] ?? null, d: k?.[4] ?? false, f: k?.[5] ?? null })
  }
  return out
}

export const openRaw = (): DatabaseSync => new DatabaseSync(RAW_DB, { readOnly: true })

export interface AlignFile { status: string; cnExists: boolean; jobs?: number; translated?: number; errors?: string[]; entityLeaves?: Record<string, number> }
export const loadAlign = (): Record<string, AlignFile> => readJson<{ files: Record<string, AlignFile> }>(join(U, 'translator', 'align.json')).files

/** wiki-dnd-parser 收的 [数据类型, 中文名, 英文名, 来源]。 */
export const loadWikiNames = (): Array<[string, string, string, string]> => readJson(join(U, 'wiki_names.json'))

export const loadSources = (): Record<string, { full: string; abv: string; date: string | null }> => readJson(join(U, 'dump_cn', '_sources.json'))

export const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

/** wiki-dnd-parser 自带的子种族词典：[母种族中文, 母种族英文, 缀名中文, 缀名英文, 来源] */
export const loadSubraceDict = (): Array<[string, string, string, string, string]> => readJson(join(U, 'subrace_dict.json'))

/** 中文仓库自带的术语库导出（翻译系统数据库）：中文 → 英文（可能多个） */
export function loadTerms(): Map<string, Set<string>> {
  const dir = join(REPO.cn, 'docs')
  const file = readdirSync(dir).filter((f) => /^terms-.*\.json$/.test(f)).sort().at(-1)!
  const items = readJson<{ items: Array<{ en: string; cn: string }> }>(join(dir, file)).items
  const m = new Map<string, Set<string>>()
  for (const it of items) if (typeof it.cn === 'string' && typeof it.en === 'string') m.set(it.cn, (m.get(it.cn) ?? new Set()).add(it.en))
  return m
}
