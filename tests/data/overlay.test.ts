import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ConvertedPack } from '../../tools/data/convert'
import { applyFixes } from '../../tools/data/fix/engine'
import { loadOverlay } from '../../tools/data/fix/overlay'

/** 补充层（E 站起的数据文件）的格式与应用规则。 */
const pack = (): ConvertedPack => ({ manifest: { id: 'p' }, entries: [{ id: 'feature.a.phb', type: 'feature', name: 'A', keywords: [], unique: false, summary: '', data: { uses: { max: 1 }, list: [1, 2, 3] } }] } as unknown as ConvertedPack)
const dirWith = (files: Record<string, unknown>): string => {
  const dir = mkdtempSync(join(tmpdir(), 'overlay-'))
  mkdirSync(dir, { recursive: true })
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), typeof body === 'string' ? body : JSON.stringify(body))
  return dir
}
const run = (rows: unknown[], extra: Record<string, unknown> = {}): ConvertedPack => {
  const p = pack()
  applyFixes([p], [], loadOverlay(dirWith({ 'E-测试.json': { 领域: '测试', rows, ...extra } })))
  return p
}
const data = (p: ConvertedPack): Record<string, unknown> => p.entries[0].data as Record<string, unknown>

describe('补充层 overlay', () => {
  it('仓库里的补充层目录能读（现在可以是空的）', () => {
    expect(() => loadOverlay()).not.toThrow()
  })
  it('不写 before 的 set ＝ 新增原来不存在的字段；写了 before 就按现状比对', () => {
    expect(data(run([{ id: 'feature.a.phb', path: '/data/extra', op: 'set', after: 5, basis: 'PHB p.1' }])).extra).toBe(5)
    expect(data(run([{ id: 'feature.a.phb', path: '/data/uses/max', op: 'set', before: 1, after: 2, basis: 'PHB p.1' }])).uses).toEqual({ max: 2 })
  })
  it('现状对不上、对已有字段漏写 before、重复、找不到条目，构建都会失败（不悄悄跳过）', () => {
    expect(() => run([{ id: 'feature.a.phb', path: '/data/uses/max', op: 'set', before: 9, after: 2, basis: 'x' }])).toThrow(/与 before 不符/)
    expect(() => run([{ id: 'feature.a.phb', path: '/data/uses', op: 'set', after: 2, basis: 'x' }])).toThrow(/与 before 不符/)
    expect(() => run([{ id: 'feature.zzz.phb', path: '/data/x', op: 'set', after: 1, basis: 'x' }])).toThrow(/匹配到 0 个/)
    expect(() => run([{ id: 'feature.a.phb', path: '/data/x', op: 'set', after: 1, basis: 'x' }, { id: 'feature.a.phb', path: '/data/x', op: 'set', after: 2, basis: 'x' }])).toThrow(/出现两次/)
  })
  it('delete 与 insert；新增条目', () => {
    const p = run([{ id: 'feature.a.phb', path: '/data/list/1', op: 'delete', before: 2, basis: 'x' }, { id: 'feature.a.phb', path: '/data/list/0', op: 'insert', after: 0, basis: 'x' }])
    expect(data(p).list).toEqual([0, 1, 3])
    const q = pack()
    applyFixes([q], [], loadOverlay(dirWith({ 'E-加.json': { 领域: '加', add: [{ pack: 'p', entry: { id: 'feature.b.phb', type: 'feature', name: 'B' }, basis: 'PHB p.2' }] } })))
    expect(q.entries.map((e) => e.id)).toEqual(['feature.a.phb', 'feature.b.phb'])
  })
  it('格式不对一律抛错：缺 basis、不认识的键、不认识的 op；以 _ 开头的文件不读', () => {
    expect(() => run([{ id: 'feature.a.phb', path: '/data/x', op: 'set', after: 1 }])).toThrow(/格式不对/)
    expect(() => run([{ id: 'feature.a.phb', path: '/data/x', op: 'set', after: 1, basis: 'x', 备注: 'y' }])).toThrow(/格式不对/)
    expect(() => run([{ id: 'feature.a.phb', path: '/data/x', op: 'replace', after: 1, basis: 'x' }])).toThrow(/格式不对/)
    expect(loadOverlay(dirWith({ '_说明.json': '这不是 JSON' }))).toEqual([])
  })
})
