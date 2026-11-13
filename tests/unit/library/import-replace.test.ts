// P5.5 B8-7：导入会顶掉哪些已有的包（作者按来源编号组合认包，身份相同的整个替换）。
import { describe, expect, it } from 'vitest'
import { importReplaces } from '../../../src/library/import-replace'

const file = (name: string, sources: string[]) => ({ name, text: JSON.stringify({ _meta: { sources: sources.map((json) => ({ json })) } }) })
const existing = [
  { docIdLocal: 'a', filename: 'pirate.json', isEditable: false, sources: ['PIRATE'] },
  { docIdLocal: 'b', filename: 'phb copy', isEditable: false, sources: ['PHB', 'PHB_COPY1'] },
  { docIdLocal: 'e', filename: null, isEditable: true, sources: ['TRPGHOUSE'] },
  { docIdLocal: 'd', filename: 'kib.json', url: 'https://x/kib.json', isEditable: false, sources: ['KIB'] },
]

describe('importReplaces', () => {
  it('来源编号组合相同（不分大小写、不管顺序）的列出来；不同的不列', () => {
    expect(importReplaces(existing, [file('p.json', ['pirate']), file('c.json', ['PHB_COPY1', 'PHB']), file('new.json', ['NEW'])]).map((h) => [h.file, h.docIdLocal])).toEqual([['p.json', 'a'], ['c.json', 'b']])
  })
  it('可编辑自制不算；下载来的包按网址认（本地文件没有网址，同来源也不会替换它）', () => {
    expect(importReplaces(existing, [file('h.json', ['TRPGHOUSE']), file('k.json', ['KIB'])])).toEqual([])
  })
  it('不是 JSON、没有来源的不算', () => {
    expect(importReplaces(existing, [{ name: 'x', text: '{' }, { name: 'y', text: '{}' }])).toEqual([])
  })
})
