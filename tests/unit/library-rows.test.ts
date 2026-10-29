import { describe, expect, it } from 'vitest'
import { buildPackRows, contributesLabel, findRow } from '../../src/ui/library/rows'
import { parseInline } from '../../src/ui/library/inline'
import type { Catalog, InstalledPack } from '../../src/schemas/pack'

const installed = (id: string, extra: Partial<InstalledPack> = {}): InstalledPack =>
  ({ id, ruleId: 'dnd5e2014', category: 'rules', name: id, version: '1.0.0', source: 'download', description: '', byteSize: 10, entryCount: 5, typeCounts: {}, contributes: { entries: 5, tables: 1, variants: 0, adventures: 0, ruleOptions: 2 }, relationships: { requires: [], recommends: [], conflicts: [] }, ...extra }) as InstalledPack
const catalog = (packs: Array<Record<string, unknown>>): Catalog => ({ formatVersion: 2, rules: [], packs: packs.map((p) => ({ ruleId: 'dnd5e2014', category: 'rules', name: p.id, license: '', description: '', typeCounts: {}, contributes: {}, relationships: { requires: [], recommends: [], conflicts: [] }, byteSize: 1, sha256: 'x', url: 'u', recommended: false, ...p })) }) as unknown as Catalog

describe('库里的包列表', () => {
  it('目录里有更高版本：标出可更新；内置包不提示更新', () => {
    const rows = buildPackRows([installed('a'), installed('b', { source: 'builtin' })], catalog([{ id: 'a', version: '1.1.0' }, { id: 'b', version: '2.0.0' }]), 'dnd5e2014')
    expect(rows.find((r) => r.id === 'a')?.updateVersion).toBe('1.1.0')
    expect(rows.find((r) => r.id === 'b')?.updateVersion).toBeUndefined()
  })

  it('已安装的与目录里尚未安装的合并；其他规则的不出现', () => {
    const rows = buildPackRows([installed('a')], catalog([{ id: 'a', version: '1.0.0' }, { id: 'c', version: '1.0.0', recommended: true }, { id: 'z', ruleId: 'other', version: '1.0.0' }]), 'dnd5e2014')
    expect(rows.map((r) => [r.id, r.installed])).toEqual([['a', true], ['c', false]])
    expect(rows[1]).toMatchObject({ source: 'catalog', recommended: true })
  })

  it('内容标签：资料数不含随机表，数量为 0 的不显示', () => {
    expect(contributesLabel({ entryCount: 5, contributes: { entries: 5, tables: 1, variants: 0, adventures: 0, ruleOptions: 2 } })).toBe('资料 4 · 随机表 1 · 规则选项 2')
    expect(contributesLabel({ entryCount: 0, contributes: {} })).toBe('')
  })

  it('按 id 找包', () => {
    expect(findRow('a', [installed('a')], null)?.name).toBe('a')
    expect(findRow('c', [], catalog([{ id: 'c', version: '1.0.0' }]))?.installed).toBe(false)
    expect(findRow('x', [], null)).toBeUndefined()
  })
})

describe('条目正文的行内标记', () => {
  it('ref 是可点的关联术语，其余只显示文字', () => {
    const segs = parseInline('先看{{ref:rule.use-an-object.phb|使用物件}}，再掷{{roll:1d6|1d6}}点伤害，{{em:很重要}}。')
    expect(segs.map((s) => s.kind)).toEqual(['text', 'ref', 'text', 'mark', 'text', 'mark', 'text'])
    expect(segs[1]).toMatchObject({ kind: 'ref', id: 'rule.use-an-object.phb', text: '使用物件' })
    expect(segs[5]).toMatchObject({ kind: 'mark', mark: 'em', text: '很重要' })
  })

  it('没有标记的文字原样返回', () => {
    expect(parseInline('普通文字')).toEqual([{ kind: 'text', text: '普通文字' }])
  })
})
