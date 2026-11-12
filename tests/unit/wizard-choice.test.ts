// 向导③选资料（P5-5 §13）：书和冒险一个列表；没下载的默认不勾，已下载的恒勾；分组框全选 / 取消；冒险要先有官方资料；规则标签筛选。
import { beforeEach, describe, expect, it } from 'vitest'
import { canPick, isPicked, picksInput, rowsOf, toggleGroup, togglePick } from '../../src/ui/wizard/data'
import { resetWizard, wizard, wizardOptions } from '../../src/ui/wizard/state'
import type { ShelfGroup } from '../../src/library/shelf'

type Row = { kind: 'book' | 'adventure'; set: string; source: string; id: string | null; name: string; abv: string; altName: null; downloaded: boolean; edition: { classic: boolean | null } | null }
const book = (id: string | null, source: string, o: Partial<Row> = {}): Row => ({ kind: 'book', set: 'cn-official', source, id, name: source, abv: source, altName: null, downloaded: false, edition: { classic: true }, ...o })
const adv = (id: string, o: Partial<Row> = {}): Row => ({ ...book(id, id, o), kind: 'adventure', ...o })
const group = (g: string, books: Row[], adventures: Row[] = []): ShelfGroup => ({ group: g, name: g, books: books as never, adventures: adventures as never })
const svc = { backend: { starter: { estimateDownload: async () => ({ computing: false, data: { sets: [], bytes: 0 }, adventures: { items: [], bytes: 0 }, errors: [] }) } } } as never

function setShelf(groups: ShelfGroup[], installed: string[] = []): void {
  wizardOptions.value = { shelf: groups, data: installed.map((setId) => ({ setId, installed: true })) } as never
}

describe('向导③选资料', () => {
  beforeEach(() => resetWizard())

  it('默认一本不勾；已下载的恒勾、不能点掉', () => {
    const g = group('core', [book('PHB', 'PHB'), book('DMG', 'DMG', { downloaded: true })])
    setShelf([g])
    expect(rowsOf(g).map((r) => isPicked(r as never))).toEqual([false, true])
    togglePick(svc, g.books[1] as never, false)
    expect(isPicked(g.books[1] as never)).toBe(true)
    expect(picksInput()).toEqual({ picks: [], adventures: [] })
  })

  it('勾书：开局给后端的是书号 + 来源；没有书号的来源行只给来源', () => {
    const g = group('core', [book('PHB', 'PHB'), book(null, 'Generic')])
    setShelf([g])
    togglePick(svc, g.books[0] as never, true)
    togglePick(svc, g.books[1] as never, true)
    expect(picksInput().picks).toEqual([{ set: 'cn-official', book: 'PHB', source: 'PHB' }, { set: 'cn-official', book: null, source: 'Generic' }])
  })

  it('冒险要先有同一套官方资料：没装也没勾书时不能勾；勾了书就能勾；取消最后一本书，冒险一起取消', () => {
    const g = group('adv', [book('PHB', 'PHB')], [adv('LMoP')])
    setShelf([g])
    expect(canPick(g.adventures[0] as never)).toBe(false)
    togglePick(svc, g.books[0] as never, true)
    togglePick(svc, g.adventures[0] as never, true)
    expect(picksInput().adventures).toEqual([{ set: 'cn-official', id: 'LMoP' }])
    togglePick(svc, g.books[0] as never, false)
    expect(picksInput()).toEqual({ picks: [], adventures: [] })
  })

  it('官方资料已经装过：冒险直接能勾', () => {
    const g = group('adv', [], [adv('LMoP')])
    setShelf([g], ['cn-official'])
    expect(canPick(g.adventures[0] as never)).toBe(true)
  })

  it('分组框：[ ] 全选这一组能勾的（书和冒险，已下载的不算）；[−] 取消这一组全部', () => {
    const g = group('core', [book('PHB', 'PHB'), book('DMG', 'DMG', { downloaded: true })], [adv('LMoP')])
    setShelf([g])
    toggleGroup(svc, rowsOf(g) as never, true)
    expect(picksInput()).toEqual({ picks: [{ set: 'cn-official', book: 'PHB', source: 'PHB' }], adventures: [{ set: 'cn-official', id: 'LMoP' }] })
    toggleGroup(svc, rowsOf(g) as never, false)
    expect(picksInput()).toEqual({ picks: [], adventures: [] })
  })

  it('规则标签：书和冒险都按作者对来源的版本判断筛；未归类 = 判断不了的', () => {
    const g = group('core', [book('PHB', 'PHB'), book('XPHB', 'XPHB', { edition: { classic: false } }), book('X', 'X', { edition: { classic: null } })], [adv('LMoP')])
    setShelf([g])
    const ids = () => rowsOf(g).map((r) => r.id)
    wizard.filter = '5e'; expect(ids()).toEqual(['PHB', 'LMoP'])
    wizard.filter = '5.5e'; expect(ids()).toEqual(['XPHB'])
    wizard.filter = 'none'; expect(ids()).toEqual(['X'])
    wizard.filter = 'all'; expect(ids()).toHaveLength(4)
  })
})
