import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { buildPackFile } from '../../../src/core/packs/file'
import type { Entry as AppEntry } from '../../../src/schemas/pack'
import { OUT_ROOT } from '../lib/paths'
import type { Entry } from './entries'

export const PACK_VERSION = '1.8.0'
export type Ed = '2014' | '2024'
export const EDS: Ed[] = ['2014', '2024']

export interface PackInfo { id: string; ed: Ed; srd: boolean; source: string | null; name: string; nameEn: string; entries: Entry[]; bytes?: Uint8Array; sha256?: string; typeCounts: Record<string, number> }
export type SourceNames = Map<string, { name: string; nameEn: string }>

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
const uuidOf = (id: string): string => { const h = createHash('sha256').update(`trpg-lineage:${id}`).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}` }

/** 版本分书架（没有版本归属的两个书架各放一份，不改内容），再按 SRD／来源切包。 */
export function splitPacks(entries: Entry[], names: SourceNames): Record<Ed, PackInfo[]> {
  const out = {} as Record<Ed, PackInfo[]>
  for (const ed of EDS) {
    const by = new Map<string, PackInfo>()
    for (const e of entries) {
      if (e.edition !== ed && e.edition !== 'both') continue
      const srd = ed === '2014' ? e.srd : e.srd52
      const key = srd ? 'srd' : e.source ? slug(e.source) || 'misc' : 'misc'
      const id = `dnd5e${ed}-${key}`
      let p = by.get(id)
      if (!p) {
        const nm = srd ? { name: 'SRD 基础规则', nameEn: 'Systems Reference Document' } : e.source ? names.get(e.source) ?? { name: e.source, nameEn: e.source } : { name: '未标来源的内容', nameEn: 'Content without a source' }
        p = { id, ed, srd, source: srd ? null : e.source, name: nm.name, nameEn: nm.nameEn, entries: [], typeCounts: {} }
        by.set(id, p)
      }
      p.entries.push(e)
    }
    out[ed] = [...by.values()].sort((a, b) => a.id.localeCompare(b.id))
  }
  return out
}

const pub = (e: Entry): AppEntry => ({ id: e.id, type: e.type, name: e.name, nameEn: e.nameEn, keywords: e.keywords, unique: e.unique, summary: '', data: e.data, dataEn: e.dataEn, dataLang: e.dataLang } as AppEntry)

/** 用应用自带的 buildPackFile 写包（格式 formatVersion 2，逐字节可重现）。 */
export function packBytes(p: PackInfo, names: SourceNames): void {
  const used = [...new Set(p.entries.map((e) => e.source).filter((s): s is string => !!s))].sort()
  p.bytes = buildPackFile({
    manifest: {
      id: p.id, ruleId: `dnd5e${p.ed}`, category: 'rules', name: p.name, nameEn: p.nameEn, version: PACK_VERSION, lineage: uuidOf(p.id), dataVersion: 5,
      license: 'CC-BY-4.0 OR CC-BY-NC-SA-4.0 OR GPL-3.0 OR MIT', author: 'didhogg', minAppVersion: '0.7.0',
      description: `D&D 5e（${p.ed}）${p.name}。由上游 DataLoader 取数、按 5e-translator 并排规则配对生成。`,
      sourceNames: Object.fromEntries(used.map((s) => [s, names.get(s) ?? { name: s, nameEn: s }])),
    },
    entries: p.entries.map(pub),
  })
  p.sha256 = createHash('sha256').update(p.bytes).digest('hex')
  for (const e of p.entries) p.typeCounts[e.type] = (p.typeCounts[e.type] ?? 0) + 1
}

export function writeOut(packs: Record<Ed, PackInfo[]>): void {
  for (const ed of EDS) {
    const dir = join(OUT_ROOT, `dnd5e${ed}`)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(join(dir, 'packs'), { recursive: true })
    mkdirSync(join(dir, 'srd'), { recursive: true })
    for (const p of packs[ed]) writeFileSync(join(dir, p.srd ? 'srd' : 'packs', `${p.id}.trpgpack`), p.bytes!)
    writeFileSync(join(dir, 'catalog.json'), `${JSON.stringify({
      formatVersion: 1, rules: [],
      packs: packs[ed].map((p) => ({ id: p.id, ruleId: `dnd5e${ed}`, category: 'rules', name: p.name, nameEn: p.nameEn, version: PACK_VERSION, byteSize: p.bytes!.length, sha256: p.sha256, url: `${p.srd ? 'srd' : 'packs'}/${p.id}.trpgpack`, typeCounts: p.typeCounts })),
    }, null, 2)}\n`)
    writeCanon(join(dir, '规范库.sqlite'), packs[ed])
  }
}

/** 规范库.sqlite：每条条目一行（含中英原样正文），供新旧比对用。 */
function writeCanon(path: string, packs: PackInfo[]): void {
  mkdirSync(dirname(path), { recursive: true })
  rmSync(path, { force: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;')
  db.exec('CREATE TABLE entries (id TEXT PRIMARY KEY, type TEXT, name TEXT, name_en TEXT, source TEXT, pack TEXT, kind TEXT, pair TEXT, lang TEXT, body TEXT, body_en TEXT); CREATE TABLE packs (id TEXT PRIMARY KEY, name TEXT, name_en TEXT, entries INTEGER, bytes INTEGER, sha256 TEXT);')
  db.exec('BEGIN')
  const ie = db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?)')
  const ip = db.prepare('INSERT INTO packs VALUES (?,?,?,?,?,?)')
  for (const p of packs) {
    ip.run(p.id, p.name, p.nameEn, p.entries.length, p.bytes?.length ?? 0, p.sha256 ?? '')
    for (const e of p.entries) ie.run(e.id, e.type, e.name, e.nameEn, e.source, p.id, e.kind, e.how, e.dataLang, JSON.stringify(e.data), e.dataEn ? JSON.stringify(e.dataEn) : null)
  }
  db.exec('COMMIT')
  db.close()
}
