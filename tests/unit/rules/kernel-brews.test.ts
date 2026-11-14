import { describe, expect, it, vi } from 'vitest'
import { excludedBrewReason, libraryBrews, type PreparedBrew } from '../../../src/rules/kernel/brews'
import { selectBrews } from '../../../src/rules/kernel/frame/brew-input'
import type { LibraryView } from '../../../src/library/revision'

function brew(id: string, source = id, needs?: { source: string; hash: string }): PreparedBrew {
  return {
    doc: { head: { docIdLocal: id }, body: { _meta: { sources: [{ json: source }] } } },
    pack: {
      docIdLocal: id, filename: `${id}.json`, url: null, origin: 'import', isEditable: false, timeAdded: 0,
      sources: [source], sourceInfo: [], dependencies: null, includes: null,
      requires: needs ? [{ ...needs, prop: 'spell', kind: 'copy' }] : [],
      props: { spell: 1 }, hashes: { spell: [`spell_${source}`] }, entryCount: 1,
    },
    flattened: 0, failures: [],
  }
}

describe('结算自制资料准备', () => {
  it('从固定版本读本语言的包，只在作者程序语言不同时展开临时副本', async () => {
    const cn = brew('cn')
    const en = brew('en')
    const view = { kvGet: vi.fn(async (codeSet) => codeSet === 'cn' ? [cn.doc] : [en.doc]) } as unknown as LibraryView
    const flatten = vi.fn(async () => ({ json: { spell: [] }, flattened: 1, failed: [] }))
    const author = async () => ({ packs: [cn.pack, en.pack], flatten })
    expect((await libraryBrews(view, 'cn', author)).map(({ doc, flattened }) => [doc.body, flattened])).toEqual([[{ spell: [] }, 1]])
    expect(cn.doc.body).toEqual({ _meta: { sources: [{ json: 'cn' }] } })
    expect(await libraryBrews(view, 'en', author)).toEqual([en])
    expect(flatten).toHaveBeenCalledTimes(1)
  })

  it('无自制时无需打开作者窗口', async () => {
    const view = { kvGet: async () => [] } as unknown as LibraryView
    const open = vi.fn()
    expect(await libraryBrews(view, 'cn', open)).toEqual([])
    expect(open).not.toHaveBeenCalled()
  })

  it('整组通过只检查一次，保留顺序', async () => {
    const group = [brew('first'), brew('second')]
    const check = vi.fn(async () => null)
    expect((await selectBrews(group, new Set(), check)).accepted).toEqual(group)
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('有同来源同类别编号的替代提供者时保住依赖包，另一条真的失去提供者时才排除', async () => {
    const bad = brew('bad', 'P')
    bad.pack.hashes.spell.push('only_bad')
    const backup = brew('backup', 'P')
    const dependent = brew('dep', 'Q', { source: 'P', hash: 'spell_P' })
    const orphan = brew('orphan', 'R', { source: 'P', hash: 'only_bad' })
    const unrelated = brew('unrelated')
    const result = await selectBrews([dependent, bad, orphan, backup, unrelated], new Set(), async (group) => {
      if (group.includes(bad)) return '作者展开失败'
      if (group.includes(orphan)) return '缺 _copy 原件'
      if (group.includes(dependent) && !group.includes(backup)) return '缺提供者'
      return null
    })
    expect(result.accepted).toEqual([dependent, backup, unrelated])
    expect([...result.errors.keys()].sort()).toEqual(['bad', 'orphan'])
  })

  it('两包只在合用时冲突，保住已验证可合并的一组，并返回其余包的错误', async () => {
    const first = brew('first')
    const second = brew('second')
    const unrelated = brew('unrelated')
    const result = await selectBrews([first, second, unrelated], new Set(), async (group) => group.includes(first) && group.includes(second) ? '合用冲突' : null)
    expect(result.accepted).toEqual([first, unrelated])
    expect(result.errors.get('second')).toBe('合用冲突')
  })

  it('错误按条目版本定位，不把同来源的另一份备选误判成坏包', () => {
    const bad = brew('bad', 'D')
    const good = brew('good', 'D')
    const ref = { set: 'cn-brew', prop: 'spell', hash: 'spell_D' }
    const excluded = [{ docIdLocal: 'bad', filename: 'bad.json', sources: ['D'], reason: '作者失败原因' }]
    expect(excludedBrewReason([bad, good], excluded, ref, 'doc:bad', 'D')).toContain('作者失败原因')
    expect(excludedBrewReason([bad, good], excluded, ref, 'doc:good', 'D')).toBeNull()
    expect(excludedBrewReason([bad], excluded, { ...ref, set: 'cn-official' }, null, 'D')).toBeNull()
  })
})
