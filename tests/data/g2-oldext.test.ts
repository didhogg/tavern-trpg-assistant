import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { loadAllPacks, packPath } from './r9-pack-helpers'

/**
 * T6 旧扩展兼容：G2.5 的新字段全是可选的，旧扩展 0.2.0（提交 f4eddfe）必须仍能识别并安装 11 个新包。
 * 做法：把 f4eddfe 的 src/ 原样取出来（tools/data/out/oldext/，不入库），用**旧代码本身**的 recognizeFile（包识别）与
 * checkPackEntries（dataVersion ≥ 3 的包安装前的严格引用检查）去验新包。不是比文件哈希：旧代码真的跑一遍。
 */
const OLD = 'f4eddfe'
const OLD_APP_VERSION = '0.2.0'
const DIR = join(process.cwd(), 'tools', 'data', 'out', 'oldext')

function ensureOldSource(): void {
  if (existsSync(join(DIR, 'src', 'core', 'packs', 'recognize.ts'))) return
  mkdirSync(DIR, { recursive: true })
  const tar = join(DIR, 'old-src.tar')
  execFileSync('git', ['archive', '--format=tar', '-o', tar, OLD, 'src'])
  execFileSync('tar', ['-xf', tar, '-C', DIR])
}

type Entry = { id: string; type: string; data: Record<string, unknown> }
interface OldCheck { checkPackEntries(input: { packId: string; entries: Entry[]; reach: Set<string>; lookup: (id: string) => { type: string; data: Record<string, unknown>; packId: string } | undefined }): string[] }
interface OldRecognize { recognizeFile(bytes: Uint8Array, ctx: { appVersion: string; hasRule: (id: string) => boolean }): { type: string; manifest: { id: string; dataVersion?: number; relationships: { requires: Array<{ id: string }> } }; entries: Entry[] } }

async function loadOld(): Promise<{ check: OldCheck; recognize: OldRecognize }> {
  ensureOldSource()
  const check = (await import(/* @vite-ignore */ join(DIR, 'src', 'rules', 'dnd5e2014', 'data', 'check.ts'))) as OldCheck
  const recognize = (await import(/* @vite-ignore */ join(DIR, 'src', 'core', 'packs', 'recognize.ts'))) as OldRecognize
  return { check, recognize }
}

describe('G2.5 旧扩展 0.2.0 仍能识别并安装全部 11 个新包', () => {
  it('旧代码确实是 f4eddfe 的那一份（对照：它不认识 joins 的 as:"spell"，所以塔莎法术表用并列字段 spellLists）', async () => {
    const { check } = await loadOld()
    const lookup = (id: string) => (id === 'class.ranger.phb' ? { type: 'class', data: {}, packId: 'p' } : id === 'spell.aid.phb' ? { type: 'spell', data: {}, packId: 'p' } : undefined)
    const bad = check.checkPackEntries({ packId: 'p', reach: new Set(['p']), lookup, entries: [{ id: 'feature.x.tce', type: 'feature', data: { joins: [{ to: 'class.ranger.phb', level: 0, as: 'spell', spells: ['spell.aid.phb'] }] } }] })
    expect(bad.join('；')).toContain('as 不合法')
    const ok = check.checkPackEntries({ packId: 'p', reach: new Set(['p']), lookup, entries: [{ id: 'feature.x.tce', type: 'feature', data: { spellLists: [{ to: 'class.ranger.phb', spells: ['spell.aid.phb'] }] } }] })
    expect(ok).toEqual([])
  })

  it('11 个包：旧的包识别通过，旧的引用检查没有问题', async () => {
    const { check, recognize } = await loadOld()
    const all = loadAllPacks()
    const owners = new Map<string, { type: string; data: Record<string, unknown>; packId: string }>()
    for (const p of all) for (const e of p.entries as unknown as Entry[]) owners.set(e.id, { type: e.type, data: e.data, packId: p.id })
    const requires = new Map<string, string[]>()
    const recognized = [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)].map((id) => {
      const rec = recognize.recognizeFile(new Uint8Array(readFileSync(packPath(id))), { appVersion: OLD_APP_VERSION, hasRule: (rule) => rule === 'dnd5e2014' })
      expect(rec.type, id).toBe('pack')
      expect(rec.manifest.id).toBe(id)
      requires.set(id, rec.manifest.relationships.requires.map((r) => r.id))
      return rec
    })
    for (const rec of recognized) {
      const reach = new Set<string>([rec.manifest.id, SRD_PACK_ID])
      const visit = (id: string): void => { for (const d of requires.get(id) ?? []) if (!reach.has(d)) { reach.add(d); visit(d) } }
      visit(rec.manifest.id)
      const problems = check.checkPackEntries({ packId: rec.manifest.id, entries: rec.entries, reach, lookup: (id) => owners.get(id) })
      expect(problems.slice(0, 5), `${rec.manifest.id}（dataVersion ${rec.manifest.dataVersion}）`).toEqual([])
    }
    expect(recognized.length).toBe(11)
  }, 240_000)
})
