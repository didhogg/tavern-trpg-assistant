import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { inventory } from './consumer/inventory'
import { lib } from './consumer/load'
import { Recorder } from './consumer/findings'
import { packPath } from './r9-pack-helpers'

/** G2 阶段 0：开工快照（证明 G2 没改数据）、第 1 节数字重量、“任选”记号盘点。 */
const SNAPSHOT = join(process.cwd(), 'docs/probes/D1.2-G2_快照.json')
const INVENTORY = join(process.cwd(), 'docs/probes/D1.2-G2_任选记号盘点.json')
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

function packHashes(): Record<string, { version: string; sha256: string }> {
  const out: Record<string, { version: string; sha256: string }> = {}
  for (const id of [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)]) {
    const file = packPath(id)
    out[id] = { version: /-(\d+\.\d+\.\d+)\.trpgpack$/.exec(file)?.[1] ?? 'builtin', sha256: createHash('sha256').update(readFileSync(file)).digest('hex') }
  }
  return out
}

describe('G2 阶段 0', () => {
  it('11 个包与开工快照一致（G2 不改数据；G2.5 开工时本测试由 g2-additive 取代）', () => {
    const now = packHashes()
    if (process.env.G2_WRITE === '1') {
      const head = execFileSync('git', ['-C', DATA_REPO, 'rev-parse', 'HEAD']).toString().trim()
      writeFileSync(SNAPSHOT, JSON.stringify({ dataRepoCommit: head, packs: now }, null, 1) + '\n')
    }
    expect(existsSync(SNAPSHOT)).toBe(true)
    const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as { packs: typeof now }
    expect(now).toEqual(snap.packs)
  })

  it('条目数量与“任选”记号盘点与登记一致', () => {
    const l = lib()
    const rec = new Recorder('g2-0')
    rec.stat('p0', 'entries', l.rows.length)
    const types = new Map<string, number>()
    for (const r of l.rows) types.set(r.type, (types.get(r.type) ?? 0) + 1)
    for (const [t, n] of types) rec.stat('p0', `type.${t}`, n)
    const inv = inventory(l)
    rec.stat('p0', 'tokens.distinct', Object.keys(inv.tokens).length)
    rec.stat('p0', 'tokens.total', Object.values(inv.tokens).reduce((a, b) => a + b, 0))
    rec.stat('p0', 'shapes.distinct', Object.keys(inv.shapes).length)
    if (process.env.G2_WRITE === '1') writeFileSync(INVENTORY, JSON.stringify(inv, null, 1) + '\n')
    expect(JSON.parse(readFileSync(INVENTORY, 'utf8'))).toEqual(inv)
    expect(rec.settle()).toEqual([])
  })
})
