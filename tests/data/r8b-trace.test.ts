import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { scanSourceRecords } from '../../tools/data/report/fieldPaths'
import { recordCountsByPath } from '../../tools/data/report/pathRecords'

const ROOT = process.cwd()
const A1_ROOTS = new Set(['monster', 'monster-template', 'legendary-group', 'legendary-group-template'])
const A2_PATHS = new Set<string>(JSON.parse(readFileSync(join(process.cwd(), 'tests/data/fixtures/r8b-a2-paths.json'), 'utf8')) as string[])
const inAudit = (path: string): boolean => (A1_ROOTS.has(path.split('.')[0]) && path !== 'monster.hasFluff') || A2_PATHS.has(path)
const AUDIT = readFileSync(join(ROOT, 'docs/probes/D1.2a_R8b_去向审计.md'), 'utf8')
const auditRows = [...AUDIT.matchAll(/^\| `([^`]+)` \| `data\.tags` \| `([^`]*)`(?: `([^`]*)`)? \| (.*) \|$/gm)].map((m) => ({ path: m[1], how: m[2], to: m[3] ?? '', evidence: m[4] }))
const auditPaths = new Set(auditRows.map((x) => x.path))
const lossRows = [...AUDIT.matchAll(/^\| `([^`]+)` \| (\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|$/gm)].map((m) => ({ path: m[1], affected: Number(m[2]), why: m[3].trim() }))
async function readPacks(): Promise<{ entries: Map<string, Entry> }> {
  const out = new Map<string, Entry>()
  const files = [{ id: SRD_PACK_ID }, ...BOOKS.map((x) => ({ id: x.packId }))]
  for (const b of files) {
    const file = b.id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(ROOT, '..', 'tavern-trpg-data', 'packs', 'dnd5e2014', `${b.id}-${BOOKS.find((x) => x.packId === b.id)!.version}.trpgpack`)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return { entries: out }
}
const entries = async (): Promise<Map<string, Entry>> => (await readPacks()).entries
let scanPromise: ReturnType<typeof scanSourceRecords> | undefined
const getScan = (): ReturnType<typeof scanSourceRecords> => (scanPromise ??= scanSourceRecords())
const get = (all: Map<string, Entry>, id: string, path: string): unknown => {
  let cur: unknown[] = [all.get(id)?.data]
  for (const part of path.split('.')) {
    const array = part.endsWith('[]')
    const key = array ? part.slice(0, -2) : part
    cur = cur.flatMap((x) => {
      if (!x || typeof x !== 'object') return []
      const v = (x as Record<string, unknown>)[key]
      if (v === undefined) return []
      return array && Array.isArray(v) ? v : [v]
    })
  }
  return cur
}

describe('R8b-A1 去向审计', () => {
  it('金样：技能、速度、施法、属性', async () => {
    const all = await entries()
    expect(get(all, 'monster.assassin.mm', 'skills.acrobatics')).toContain(6)
    expect(get(all, 'monster.adult-red-dragon.mm', 'skills.perception')).toContain(13)
    expect(get(all, 'monster.adult-red-dragon.mm', 'speed.fly')).toContain(80)
    expect(get(all, 'monster.air-elemental.mm', 'speed.canHover')).toContain(true)
    expect((get(all, 'monster.acolyte.mm', 'spellcasting') as unknown[]).length).toBeGreaterThan(0)
    expect(get(all, 'monster.adult-red-dragon.mm', 'abilities.dex')).toContain(10)
  })

  it('金样 A-2：物品 abilitySet 与家族表', async () => {
    const all = await entries()
    const belt = get(all, 'item.belt-of-hill-giant-strength.dmg', 'effects')
    expect(JSON.stringify(belt)).toContain('abilitySet')
    expect(JSON.stringify(belt)).toContain('"str"')
    expect(JSON.stringify(belt)).toContain('21')
    const gauntlets = get(all, 'item.gauntlets-of-ogre-power.dmg', 'effects')
    expect(JSON.stringify(gauntlets)).toContain('abilitySet')
    expect(JSON.stringify(gauntlets)).toContain('"str"')
    expect(JSON.stringify(gauntlets)).toContain('19')
    const family = get(all, 'item.armor-of-resistance-family.dmg', 'text')
    const text = JSON.stringify(family)
    expect(text).toContain('"cols":["d10","伤害类型"]')
    expect((text.match(/"rows":/g) ?? []).length).toBe(1)
    expect(text).toContain('强酸')
  })

  it('1 审计表路径集合等于 A1 范围', () => {
    const expected = new Set([...Object.keys(FIELD_COVERAGE).filter((p) => A1_ROOTS.has(p.split('.')[0]) && p !== 'monster.hasFluff'), ...A2_PATHS])
    expect(auditPaths).toEqual(expected)
  })

  it('2 mapped/text/lost 证据非空', () => {
    for (const row of auditRows) {
      if (row.how === 'lost' || row.how === 'mapped' || row.how === 'text') expect(row.evidence.trim().length, row.path).toBeGreaterThan(0)
      expect(row.evidence.trim()).not.toBe('—')
      expect(row.evidence.trim()).not.toBe('-')
    }
  })

  it('3/4 真丢失清单与矩阵、affected 实测一致', async () => {
    const matrixLost = new Map(Object.entries(FIELD_COVERAGE).filter(([p, e]) => inAudit(p) && e.how === 'lost').map(([p, e]) => [p, e]))
    expect(new Set(lossRows.map((x) => x.path))).toEqual(new Set(matrixLost.keys()))
    const scan = await getScan()
    const counts = recordCountsByPath(scan.records.filter((r) => r.scope === 'core'))
    for (const row of lossRows) {
      expect(row.affected, row.path).toBe(counts.get(row.path) ?? 0)
      expect(matrixLost.get(row.path)?.affected, row.path).toBe(row.affected)
    }
  })

  it('5 dropped/lost 理由按字段名归一后不得跨顶层复用', () => {
    const norm = (why: string, path: string): string => {
      const key = path.split('.').pop()!.replace(/\[\]$/, '')
      return why.replaceAll(key, '{field}').replace(/\s+/g, ' ').trim()
    }
    const dropped = new Map<string, { top: string; path: string }>()
    for (const [path, entry] of Object.entries(FIELD_COVERAGE)) {
      if (!A2_PATHS.has(path) || entry.how !== 'dropped') continue
      const top = path.split('.')[1].replace(/\[\]$/, '')
      const key = norm(entry.why!, path)
      const prev = dropped.get(key)
      if (prev) expect(prev.top, path).toBe(top)
      dropped.set(key, { top, path })
    }
    const lost = new Map<string, Set<string>>()
    for (const [path, entry] of Object.entries(FIELD_COVERAGE)) {
      if (!A2_PATHS.has(path) || entry.how !== 'lost') continue
      const top = path.split('.')[1].replace(/\[\]$/, '')
      const key = norm(entry.why!, path)
      const tops = lost.get(key) ?? new Set<string>()
      tops.add(top); lost.set(key, tops)
    }
    for (const [why, tops] of lost) expect(tops.size, why).toBeLessThan(3)
  })

  it('9 核心零记录不得 dropped，理由不得含模糊措辞', async () => {
    const scan = await getScan()
    const counts = recordCountsByPath(scan.records.filter((r) => r.scope === 'core'))
    for (const [path, entry] of Object.entries(FIELD_COVERAGE)) {
      if (!inAudit(path) || entry.how !== 'dropped') continue
      expect(counts.get(path) ?? 0, path).toBeGreaterThan(0)
      expect(entry.why, path).not.toContain('没有该字段值')
      expect(entry.why, path).not.toContain('未找到')
    }
  })

  it('6 已知字段不得 lost/dropped', () => {
    for (const path of ['monster.skill', 'monster.speed', 'monster.spellcasting', 'item.ability.static']) expect(['mapped', 'text'], path).toContain(FIELD_COVERAGE[path].how)
  })

  it('7 mapped/text 的 data.tags 只允许标签字段', () => {
    for (const [path, entry] of Object.entries(FIELD_COVERAGE)) {
      if (!inAudit(path) || entry.to !== 'data.tags') continue
      const last = path.split('.').pop()?.replace(/\[\]$/, '') ?? ''
      expect(/tags$/i.test(last) || last === 'environment', path).toBe(true)
    }
  })


  it('10 非「同父」证据的代码行确实读取末段键', () => {
    for (const row of auditRows) {
      if (row.how !== 'mapped' && row.how !== 'text') continue
      if (row.evidence.startsWith('同父 ')) continue
      const m = row.evidence.match(/代码 ([^:]+):(\d+)-(\d+)/)
      expect(m, row.path).not.toBeNull()
      const [, file, startRaw, endRaw] = m!
      expect(file.startsWith('tools/data/convert/') || file.startsWith('tools/data/extract/'), `${row.path} 代码文件不在转换代码白名单：${file}`).toBe(true)
      expect(existsSync(join(ROOT, file)), `${row.path} 代码文件不存在：${file}`).toBe(true)
      const start = Number(startRaw)
      const end = Number(endRaw)
      expect(end - start + 1, row.path).toBeLessThanOrEqual(20)
      const key = row.path.split('.').pop()!.replace(/\[\]$/, '')
      const lines = readFileSync(join(ROOT, file), 'utf8').split('\n').slice(start - 1, end)
      expect(lines.some((line) => line.includes(key)), `${row.path} ${file}:${start}-${end} ${key}`).toBe(true)
    }
  })

  it('11 输出不是纯路径，同父父路径存在', () => {
    for (const row of auditRows) {
      if (row.how !== 'mapped' && row.how !== 'text') continue
      const same = row.evidence.match(/同父 ([^（(]+)/)
      if (same) {
        const parent = same[1].trim()
        expect(FIELD_COVERAGE[parent], `${row.path} -> ${parent}`).toBeDefined()
        expect(['mapped', 'text'], parent).toContain(FIELD_COVERAGE[parent].how)
      }
      const out = row.evidence.match(/→ 输出 (.*)$/)
      expect(out, row.path).not.toBeNull()
      const value = out![1].trim()
      if (!row.evidence.includes('核心无样本')) {
        expect(value, row.path).not.toMatch(/^data\.[\w.[\]]+$/)
        expect(row.evidence, row.path).not.toContain('来源 —')
      }
    }
  })

  it('12「同父」必须给出转换代码的文件:行号依据', () => {
    for (const row of auditRows) {
      if (row.how !== 'mapped' && row.how !== 'text') continue
      if (!row.evidence.startsWith('同父 ')) continue
      expect(row.evidence, row.path).toMatch(/tools\/data\/(?:convert|extract)\/\S+\.ts:\d+/)
    }
  })

  it('13 出处函数：代码范围在函数内，且函数含 to 首段字段', () => {
    for (const row of auditRows) {
      if (!A2_PATHS.has(row.path)) continue
      if (row.how !== 'mapped' && row.how !== 'text') continue
      if (row.evidence.startsWith('同父 ')) continue
      const fm = row.evidence.match(/函数\s+([A-Za-z_$][\w$]*)/)
      expect(fm, `${row.path} 缺少函数名`).not.toBeNull()
      const cm = row.evidence.match(/代码\s+(tools\/data\/(?:convert|extract)\/[^:]+):(\d+)-(\d+)/)
      expect(cm, row.path).not.toBeNull()
      const [, file, aRaw, bRaw] = cm!
      const lines = readFileSync(join(ROOT, file), 'utf8').split('\n')
      const start = Number(aRaw), end = Number(bRaw)
      const name = fm![1]
      const decl = new RegExp(`(?:export\\s+)?function\\s+${name}\\b|const\\s+${name}\\s*=`)
      const declLine = lines.findIndex((l) => decl.test(l))
      expect(declLine, `${row.path} 找不到函数 ${name}`).toBeGreaterThanOrEqual(0)
      let fnEnd = lines.length - 1
      for (let i = declLine + 1; i < lines.length; i++) {
        if (/^(?:export\s+)?function\s+[A-Za-z_$]/.test(lines[i])) { fnEnd = i - 1; break }
      }
      expect(start - 1, `${row.path} 代码范围在函数 ${name} 之前`).toBeGreaterThanOrEqual(declLine)
      expect(end - 1, `${row.path} 代码范围超出函数 ${name}`).toBeLessThanOrEqual(fnEnd)
      const first = row.to.startsWith('data.') ? row.to.slice(5).split(/\.|\[/, 1)[0] : row.to.split('.')[1]
      const body = lines.slice(declLine, fnEnd + 1).join('\n')
      let callHit = body.includes(first)
      if (!callHit) {
        const dirs = ['tools/data/convert', 'tools/data/extract']
        const files = dirs.flatMap((dir) => readdirSync(join(ROOT, dir)).filter((x) => x.endsWith('.ts')).map((x) => join(dir, x)))
        const allLines = new Map<string, string[]>()
        for (const f of files) allLines.set(f, readFileSync(join(ROOT, f), 'utf8').split('\n'))
        const enclosing = (f: string, idx: number): string | undefined => {
          const ls = allLines.get(f)!
          let name2: string | undefined
          for (let i = 0; i <= idx; i++) {
            const mm = ls[i].match(/(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/)
            if (mm) name2 = mm[1]
          }
          return name2
        }
        const seen = new Set<string>([name])
        let frontier = [name]
        for (let depth = 0; depth < 3 && !callHit; depth++) {
          const next: string[] = []
          for (const fn2 of frontier) for (const [f, ls] of allLines) for (let i = 0; i < ls.length; i++) {
            if (!ls[i].includes(fn2)) continue
            if (ls.slice(Math.max(0, i - 2), i + 3).some((x) => x.includes(first))) { callHit = true; break }
            const caller = enclosing(f, i)
            if (caller && !seen.has(caller)) { seen.add(caller); next.push(caller) }
          }
          frontier = next
        }
      }
      expect(callHit, `${row.path} 函数 ${name} 的调用/内部不含 ${first}`).toBe(true)
    }
  })

  it('14 样本回读：输出序列化必须含来源值，或写转换说明', async () => {
    const all = await entries()
    for (const row of auditRows) {
      if (!A2_PATHS.has(row.path)) continue
      if (row.how !== 'mapped' && row.how !== 'text') continue
      if (row.evidence.includes('核心无样本') || row.evidence.includes('转换：')) continue
      const m = row.evidence.match(/样本\s+([^\s：]+)：来源\s+(.*?)\s+→\s+输出/)
      expect(m, `${row.path} 缺少样本回读格式`).not.toBeNull()
      const id = m![1], source = m![2].trim().replace(/…$/, '')
      if (/^(?:true|false|-?\d+(?:\.\d+)?)$/.test(source) || source.length < 2) continue
      const entry = all.get(id)
      expect(entry, `${row.path} 找不到样本 ${id}`).toBeDefined()
      let value: unknown
      if (row.to.startsWith('entry.')) value = (entry as unknown as Record<string, unknown>)[row.to.slice(6)]
      else value = get(all, id, row.to.slice(5))
      expect(JSON.stringify(value), `${row.path} 输出不含来源 ${source}`).toContain(source)
    }
  })

  it('8 不存在 r8bAudit 覆盖文件', () => {
    expect(existsSync(join(ROOT, 'tools/data/config/fieldCoverage/r8bAudit1.ts'))).toBe(false)
    expect(existsSync(join(ROOT, 'tools/data/config/fieldCoverage/r8bAudit4.ts'))).toBe(false)
  })
})
