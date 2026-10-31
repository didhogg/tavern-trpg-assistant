import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'

const ROOT = process.cwd()
const A1_ROOTS = new Set(['monster', 'monster-template', 'legendary-group', 'legendary-group-template'])
const A2_PATHS = new Set<string>(JSON.parse(readFileSync(join(process.cwd(), 'tests/data/fixtures/r8b-a2-paths.json'), 'utf8')) as string[])
const inAudit = (path: string): boolean => (A1_ROOTS.has(path.split('.')[0]) && path !== 'monster.hasFluff') || A2_PATHS.has(path)
const AUDIT = readFileSync(join(ROOT, 'docs/probes/D1.2a_R8b_去向审计.md'), 'utf8')
const auditRows = [...AUDIT.matchAll(/^\| `([^`]+)` \| `data\.tags` \| `([^`]*)`(?: `([^`]*)`)? \| (.*) \|$/gm)].map((m) => ({ path: m[1], how: m[2], to: m[3] ?? '', evidence: m[4] }))
const auditPaths = new Set(auditRows.map((x) => x.path))
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
    const family = all.get('item.armor-of-resistance-family.dmg')!.data.text as Array<{ tableRef?: { id: string; label?: string } }>
    const ref = family.find((b) => b.tableRef)?.tableRef?.id
    expect(ref).toBeDefined()
    const table = all.get(ref!)
    const text = JSON.stringify(table?.data)
    expect((text.match(/"rows":/g) ?? []).length).toBe(1)
    expect(text).toContain('强酸')
    expect(family.some((b) => b.tableRef?.label?.includes('d10'))).toBe(true)
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

  it('8 不存在 r8bAudit 覆盖文件', () => {
    expect(existsSync(join(ROOT, 'tools/data/config/fieldCoverage/r8bAudit1.ts'))).toBe(false)
    expect(existsSync(join(ROOT, 'tools/data/config/fieldCoverage/r8bAudit4.ts'))).toBe(false)
  })
})
