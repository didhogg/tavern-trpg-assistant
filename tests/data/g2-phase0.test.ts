import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inventory } from './consumer/inventory'
import { lib } from './consumer/load'
import { Recorder } from './consumer/findings'

/** G2 阶段 0：“任选”记号盘点。（原来还有“11 个包与开工快照一致”的哈希测试：G2.5 第 1 站起数据会改，由 g2-additive 逐条放行取代；快照文件 docs/probes/D1.2-G2_快照.json 留作记录。） */
const INVENTORY = join(process.cwd(), 'docs/probes/D1.2-G2_任选记号盘点.json')

describe('G2 阶段 0', () => {
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
