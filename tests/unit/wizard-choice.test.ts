import { beforeEach, describe, expect, it } from 'vitest'
import { isPicked, libraryChoice, toggleBook } from '../../src/ui/wizard/data'
import { resetWizard, wizardOptions } from '../../src/ui/wizard/state'
import { sourceUnit } from '../../src/library/scopes'
import type { ShelfGroup } from '../../src/library/shelf'

const row = (source: string, visible: boolean, downloaded = false) => ({ kind: 'book', set: 'cn-official', source, id: null, name: source, abv: source, count: 1, downloaded, edition: null, membership: { assignment: null, basis: 'none' }, view: { visible, reason: visible ? 'scope' : 'out-of-scope' }, alternatives: 0 })
const group = (g: string, books: ReturnType<typeof row>[]): ShelfGroup => ({ group: g, name: g, books: books as never, adventures: [] })

function setShelf(groups: ShelfGroup[]): void {
  wizardOptions.value = { shelf: groups } as never
}

describe('向导选书：默认只勾核心组，已下载的恒勾且不能改', () => {
  beforeEach(() => resetWizard())

  it('默认：核心组里在范围内的勾；核心组范围外的、其他组的都不勾', () => {
    const core = group('core', [row('PHB', true), row('XPHB', false)])
    const other = group('supplement', [row('XGE', true)])
    setShelf([core, other])
    expect(isPicked(core, core.books[0] as never)).toBe(true)
    expect(isPicked(core, core.books[1] as never)).toBe(false)
    expect(isPicked(other, other.books[0] as never)).toBe(false)
  })

  it('开局时只把"勾选 ≠ 范围默认"的记成加入 / 排除：范围内但没勾 → 排除', () => {
    setShelf([group('core', [row('PHB', true)]), group('supplement', [row('XGE', true)])])
    expect(libraryChoice()).toEqual({ include: [], exclude: [sourceUnit('XGE')] })
  })

  it('用户点过的优先；点回默认就不记', () => {
    const other = group('supplement', [row('XGE', true)])
    setShelf([group('core', [row('PHB', true)]), other])
    toggleBook('XGE', true)
    expect(isPicked(other, other.books[0] as never)).toBe(true)
    expect(libraryChoice()).toEqual({ include: [], exclude: [] })
    toggleBook('PHB', false)
    expect(libraryChoice().exclude).toEqual([sourceUnit('PHB')])
  })

  it('已下载的恒勾：范围外的也记成加入；用户点不动它', () => {
    const g = group('supplement', [row('XGE', false, true)])
    setShelf([g])
    expect(isPicked(g, g.books[0] as never)).toBe(true)
    toggleBook('XGE', false) // 界面已禁用；即使被调用也不生效
    expect(isPicked(g, g.books[0] as never)).toBe(true)
    expect(libraryChoice()).toEqual({ include: [sourceUnit('XGE')], exclude: [] })
  })

  it('范围只在用户改过时才带', () => {
    setShelf([])
    expect(libraryChoice()).toEqual({ include: [], exclude: [] })
  })
})
