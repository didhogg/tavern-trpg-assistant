import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { scanSourceRecords } from '../../tools/data/report/fieldPaths'
import { recordCountsByPath } from '../../tools/data/report/pathRecords'
import type { Entry } from '../../src/schemas/pack'

// D1.2a §30.5 常量：逐字，不得增删改
const ITEM = ['item.ts', 'items.ts', 'plan.ts', 'common.ts', 'blocks.ts', 'foundry.ts', 'activities.ts', 'tables.ts']
const ROOT_FILES: Record<string, string[]> = {
  item: ITEM, 'base-item': ITEM, 'item-group': ITEM, 'magic-variant': ITEM, 'item-entry': ITEM,
  'item-property': ITEM, 'item-type-additional-entries': ITEM,
  spell: ['spell.ts', 'common.ts', 'plan.ts', 'blocks.ts'],
  feat: ['featRule.ts', 'common.ts', 'plan.ts'],
  subrace: ['character.ts', 'character2.ts', 'common.ts', 'plan.ts'],
  race: ['character.ts', 'character2.ts', 'common.ts', 'plan.ts'],
  recipe: ['common.ts', 'plan.ts', 'blocks.ts', 'tables.ts', 'table.ts'],
  card: ['common.ts', 'plan.ts', 'blocks.ts', 'tables.ts', 'table.ts'],
  action: ['common.ts', 'plan.ts', 'blocks.ts', 'activities.ts', 'foundry.ts'],
}
const GENERIC = new Set(['name', 'type', 'entries', 'items', 'item', 'entry', 'source', 'page', 'ENG_name', 'caption', 'rows', 'colLabels', 'value', 'text', 'count', 'amount', 'mode', 'number', 'spell', 'target', 'key', 'units', 'period', 'group', 'changes', 'types', 'denomination', 'charges', 'ability', 'severity', 'str', 'dex', 'con', 'int', 'wis', 'cha'])
const leafKey = (path: string): string => path.split('.').pop()!.replace(/\[\]$/, '').replace(/[^\w$]/g, '')
const readRe = (key: string): RegExp => new RegExp(`(?:\\.|\\?\\.|\\[['"])${key}\\b|['"]${key}['"]|\\b${key}\\s*:`)
const BANNED = ['来源值经', '转换后进入输出', '被转换', '元数据不进入输出', '核心样本为空', '没有写入物品数据；详情页不会显示', '无此位置', '疑似缺陷']

const ROOT = process.cwd()
const A2 = new Set<string>(JSON.parse(readFileSync(join(ROOT, 'tests/data/fixtures/r8b-a2-paths.json'), 'utf8')) as string[])
const AUDIT = readFileSync(join(ROOT, 'docs/probes/D1.2a_R8b_去向审计.md'), 'utf8')
const rows = [...AUDIT.matchAll(/^\| `([^`]+)` \| `data\.tags` \| `([^`]*)`(?: `([^`]*)`)? \| (.*) \|$/gm)].map((m) => ({ path: m[1], how: m[2], to: m[3] ?? '', evidence: m[4] })).filter((r) => A2.has(r.path))
const delivered = rows.filter((r) => r.how === 'mapped' || r.how === 'text')
const section = (title: string): string => { const i = AUDIT.indexOf(`## ${title}`); if (i < 0) return ''; const j = AUDIT.indexOf('\n## ', i + 5); return AUDIT.slice(i, j < 0 ? undefined : j) }
const codeLines = new Map<string, string[]>()
const lines = (file: string): string[] => { if (!codeLines.has(file)) codeLines.set(file, readFileSync(join(ROOT, 'tools/data/convert', file), 'utf8').split('\n')); return codeLines.get(file)! }
const squash = (v: string): string => v.replace(/\s+/g, '')
async function packs(): Promise<Map<string, Entry>> {
  const out = new Map<string, Entry>()
  for (const id of [SRD_PACK_ID, ...BOOKS.map((x) => x.packId)]) {
    const file = id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(ROOT, '..', 'tavern-trpg-data', 'packs', 'dnd5e2014', `${id}-${BOOKS.find((x) => x.packId === id)!.version}.trpgpack`)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    for (const [name, data] of Object.entries(unzipSync(new Uint8Array(await readFile(file))))) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return out
}
const valueAt = (all: Map<string, Entry>, id: string, to: string): unknown => {
  const entry = all.get(id) as unknown as Record<string, unknown> | undefined
  if (!entry) return undefined
  if (to.startsWith('entry.')) return entry[to.slice(6)]
  let cur: unknown[] = [entry.data]
  for (const part of to.slice(5).split('.')) cur = cur.flatMap((x) => { const v = x && typeof x === 'object' ? (x as Record<string, unknown>)[part.replace(/\[\]$/, '')] : undefined; return v === undefined ? [] : Array.isArray(v) && part.endsWith('[]') ? v : [v] })
  return cur.length === 1 ? cur[0] : cur
}
const firstSeg = (to: string): string => (to.startsWith('data.') ? to.slice(5).split(/[.[]/, 1)[0] : to.split('.')[1])
const allConvert = (): string[] => ['tools/data/convert', 'tools/data/extract'].flatMap((d) => readdirSync(join(ROOT, d)).filter((x) => x.endsWith('.ts')).map((x) => join(d, x)))
let sources: string[][] | undefined
const convertSources = (): string[][] => (sources ??= allConvert().map((f) => readFileSync(join(ROOT, f), 'utf8').split('\n')))
const fnSpan = (file: string, name: string): [number, number] => {
  const ls = lines(file)
  const decl = ls.findIndex((l) => new RegExp(`(?:export\\s+)?function\\s+${name}\\b|const\\s+${name}\\s*=`).test(l))
  let end = ls.length - 1
  for (let i = decl + 1; decl >= 0 && i < ls.length; i++) if (/^(?:export\s+)?function\s+[A-Za-z_$]/.test(ls[i])) { end = i - 1; break }
  return [decl, end]
}
function enclosing(ls: string[], idx: number): string | undefined {
  for (let i = idx; i >= 0; i--) { const m = ls[i].match(/^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/); if (m) return m[1] }
  return undefined
}
function toReached(name: string, file: string, first: string, depth = 2): boolean {
  const [d, e] = fnSpan(file, name)
  if (lines(file).slice(d, e + 1).join('\n').includes(first)) return true
  if (depth === 0) return false
  for (const [fi, ls] of convertSources().entries()) {
    for (let i = 0; i < ls.length; i++) {
      if (!ls[i].includes(name) || new RegExp(`function\\s+${name}\\b`).test(ls[i])) continue
      if (ls.slice(Math.max(0, i - 2), i + 3).some((x) => x.includes(first))) return true
      const caller = enclosing(ls, i)
      const callerFile = allConvert()[fi].replace(/^tools\/data\/convert\//, '')
      if (caller && caller !== name && !callerFile.includes('/') && toReached(caller, callerFile, first, depth - 1)) return true
    }
  }
  return false
}

describe('R8b-A2 订正二：出处与回读', () => {
  it('13a 文件白名单 + 范围内读取键命中（非同父行）', () => {
    const bad: string[] = []
    for (const r of delivered) {
      if (r.evidence.startsWith('同父 ')) continue
      const m = r.evidence.match(/代码 tools\/data\/convert\/([^:]+):(\d+)-(\d+)/)
      if (!m) { bad.push(r.path); continue }
      const hit = lines(m[1]).slice(Number(m[2]) - 1, Number(m[3])).some((l) => readRe(leafKey(r.path)).test(l))
      if (!ROOT_FILES[r.path.split('.')[0]]?.includes(m[1]) || !hit) bad.push(r.path)
    }
    expect(bad.join('\n')).toBe('')
  })

  it('13b 新格式：函数、读取行、范围、to 首段', () => {
    const bad: string[] = []
    for (const r of delivered) {
      const same = r.evidence.startsWith('同父 ')
      const q = r.evidence.match(/读取行「(.*?)」；样本/)?.[1]?.trim()
      if (!q) { bad.push(`${r.path} 缺读取行`); continue }
      if (same) {
        const sm = r.evidence.match(/^同父 (\S+?)（整体复制依据 tools\/data\/convert\/([^:]+):(\d+)）/)
        const parent = sm?.[1] ?? ''
        const ok = !!sm && ROOT_FILES[r.path.split('.')[0]]?.includes(sm[2]) && lines(sm[2]).some((l) => squash(l).includes(squash(q))) && readRe(leafKey(parent)).test(q) && ['mapped', 'text'].includes(FIELD_COVERAGE[parent]?.how) && !!lines(sm[2])[Number(sm[3]) - 1]
        if (!ok) bad.push(`${r.path} 同父`)
        continue
      }
      const fm = r.evidence.match(/函数\s+([A-Za-z_$][\w$]*)/)
      const cm = r.evidence.match(/代码 tools\/data\/convert\/([^:]+):(\d+)-(\d+)/)
      if (!fm || !cm) { bad.push(`${r.path} 缺函数/代码`); continue }
      const [, file, aRaw, bRaw] = cm
      const a = Number(aRaw), b = Number(bRaw)
      const [d, e] = fnSpan(file, fm[1])
      if (b - a + 1 > 20 || d < 0 || a - 1 < d || b - 1 > e) { bad.push(`${r.path} 范围/函数`); continue }
      if (!lines(file).slice(a - 1, b).some((l) => squash(l).includes(squash(q))) || !readRe(leafKey(r.path)).test(q)) { bad.push(`${r.path} 读取行`); continue }
      if (!toReached(fm[1], file, firstSeg(r.to))) bad.push(`${r.path} to 首段`)
    }
    expect(bad.join('\n')).toBe('')
  })

  it('14 样本回读：Y/X 在输出里；模板条目不可作样本；核心无样本只在计数为 0 时；禁用短语', async () => {
    const all = await packs()
    const counts = recordCountsByPath((await scanSourceRecords()).records.filter((x) => x.scope === 'core'))
    const bad: string[] = []
    for (const r of delivered) {
      for (const w of BANNED) if (r.evidence.includes(w)) bad.push(`${r.path} 禁用短语 ${w}`)
      if (/^同父 \S+（[^）]*）；读取行「.*」；样本 核心无样本/.test(r.evidence) || r.evidence.includes('样本 核心无样本')) {
        if ((counts.get(r.path) ?? 0) !== 0) bad.push(`${r.path} 核心有记录却写核心无样本`)
        continue
      }
      const sm = r.evidence.match(/样本 ([^\s：]+)：来源 (.*?) → 输出 (.*?)(?:；转换：(.*?)；规则 tools\/data\/(?:convert|extract)\/(\S+?\.ts):(\d+))?$/)
      if (!sm) { bad.push(`${r.path} 样本格式`); continue }
      const [, id, x0, y0, conv] = sm
      const entry = all.get(id)
      if (!entry) { bad.push(`${r.path} 样本不存在`); continue }
      if (!r.path.startsWith('magic-variant.requires') && !r.path.startsWith('magic-variant.excludes') && (entry.data as Record<string, unknown>).variantTemplate === true) bad.push(`${r.path} 模板样本`)
      const ser = squash(JSON.stringify(valueAt(all, id, r.to)) ?? '')
      if (r.path.startsWith('item-group.entries[].') && ser.includes('tableRef')) continue
      const y = squash(y0.replace(/…$/, ''))
      if (!y || /^(无|空|\[\]|\{\}|0)$/.test(y) || !ser.includes(y)) bad.push(`${r.path} Y 不在输出（实际 ${ser.slice(0, 60)}）`)
      if (!conv && !ser.includes(squash(x0.replace(/…$/, '')))) bad.push(`${r.path} X 不在输出`)
    }
    for (const [p, e] of Object.entries(FIELD_COVERAGE)) if (A2.has(p) && (e.how === 'lost' || e.how === 'dropped')) for (const w of BANNED) if ((e.why ?? '').includes(w)) bad.push(`${p} 理由含禁用短语 ${w}`)
    expect(bad.join('\n')).toBe('')
  })

  it('15 读取核对：lost 行中键被转换器读取的，逐个命中说明', async () => {
    const all = await packs()
    const table = [...section('A-2 读取核对表').matchAll(/^\| `([^`]+)` \| (\S+?:\d+) \| `(.*?)` \| (他物同名|本字段未送达|送达但位置不合规) \| (.*?) \| (.*?) \| (.*?) \|$/gm)].map((m) => ({ path: m[1], at: m[2], text: m[3], verdict: m[4], note: m[5], sample: m[6].trim(), back: m[7] }))
    const bad: string[] = []
    for (const [p, e] of Object.entries(FIELD_COVERAGE)) {
      if (!A2.has(p) || e.how !== 'lost') continue
      const key = leafKey(p)
      if (!key || GENERIC.has(key) || /^\d+$/.test(key)) continue
      const hits: string[] = []
      for (const f of ROOT_FILES[p.split('.')[0]]) lines(f).forEach((l, i) => { if (readRe(key).test(l)) hits.push(`${f}:${i + 1}`) })
      if (!hits.length) continue
      const mine = table.filter((t) => t.path === p)
      for (const h of hits.slice(0, 6)) {
        const t = mine.find((x) => x.at === h)
        if (!t) { bad.push(`${p} 缺 ${h}`); continue }
        const [f, n] = h.split(':')
        if (squash(lines(f)[Number(n) - 1]) !== squash(t.text)) bad.push(`${p} ${h} 原文不符`)
        if (t.note.length < 15 || BANNED.some((w) => t.note.includes(w))) bad.push(`${p} ${h} 说明`)
        if (t.verdict === '本字段未送达') {
          const entry = all.get(t.sample)
          const x = t.back.match(/不含 (.+?)$/)?.[1]?.trim()
          if (!entry || !x) { bad.push(`${p} ${h} 样本/回读`); continue }
          if (!/^[\d.+-]+$/.test(x) && x.length >= 2 && squash(JSON.stringify(entry.data)).includes(squash(x))) bad.push(`${p} ${h} 回读不成立`)
        }
        if (t.verdict === '送达但位置不合规') {
          const entry = all.get(t.sample)
          const x = t.back.match(/含 (.+?)$/)?.[1]?.trim()
          if (!entry || !x || !squash(JSON.stringify((entry.data as Record<string, unknown>).tags)).includes(squash(x))) bad.push(`${p} ${h} data.tags 回读不成立`)
        }
      }
    }
    expect(bad.join('\n')).toBe('')
  })

  it('16 容器一致', () => {
    const bad: string[] = []
    for (const p of A2) {
      const e = FIELD_COVERAGE[p]
      const kids = Object.keys(FIELD_COVERAGE).filter((q) => q !== p && (q.startsWith(`${p}.`) || q.startsWith(`${p}[]`)))
      if (!e || !kids.length) continue
      if ((e.how === 'mapped' || e.how === 'text') && !kids.some((q) => ['mapped', 'text'].includes(FIELD_COVERAGE[q].how))) bad.push(p)
      if (e.how === 'dropped' && !kids.every((q) => FIELD_COVERAGE[q].how === 'dropped')) bad.push(p)
    }
    expect(bad.join('\n')).toBe('')
  })

  it('17 同键一致：四个物品根下同后缀状态不一致的必须有分歧说明', () => {
    const groups = new Map<string, Array<{ root: string; delivered: boolean }>>()
    for (const p of A2) {
      const [root, ...rest] = p.split('.')
      if (!['item', 'base-item', 'item-group', 'magic-variant'].includes(root)) continue
      const suffix = (root === 'magic-variant' && rest[0] === 'inherits' ? rest.slice(1) : rest).join('.')
      const g = groups.get(suffix) ?? []
      g.push({ root, delivered: ['mapped', 'text'].includes(FIELD_COVERAGE[p].how) })
      groups.set(suffix, g)
    }
    const mixed = [...groups].filter(([, g]) => g.length > 1 && new Set(g.map((x) => x.delivered)).size > 1).map(([s]) => s).sort()
    const table = new Map([...section('A-2 同键一致核对').matchAll(/^\| `([^`]+)` \| (.*?) \| (.*) \|$/gm)].map((m) => [m[1], m[3]]))
    expect([...table.keys()].sort()).toEqual(mixed)
    const seen = new Set<string>()
    for (const [suffix, note] of table) {
      expect(note.length, suffix).toBeGreaterThanOrEqual(20)
      for (const w of BANNED) expect(note, suffix).not.toContain(w)
      const norm = note.replaceAll(suffix, '{k}')
      expect(seen.has(norm), `${suffix} 分歧说明重复`).toBe(false)
      seen.add(norm)
    }
  })
})
