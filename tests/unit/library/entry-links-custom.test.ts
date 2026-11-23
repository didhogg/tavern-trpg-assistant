// 自制编号对照（EntryLinks.customRefs）取自装包时作者对整套自制的解析结果，不再逐包开隔离小窗（驾驶员 2026-11-22～23：真机 24 包、11 秒）。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LibraryDatabase } from '../../../src/library/db'
import { EntryLinks } from '../../../src/library/entry-links'
import { LibraryOperations } from '../../../src/library/operations'
import { LibraryRevisionStore } from '../../../src/library/revision'
import { parsedKey } from '../../../src/library/install'
import { altsKey } from '../../../src/library/alternatives'
import type { LibraryService } from '../../../src/library/service'
import type { DocumentStore } from '../../../src/library/documents'

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

const parsed = (hashes: Array<string | null>) => ({ items: hashes.map(() => ({})), hashes, sources: hashes.map(() => 'HB') })
const report = (props: string[]) => ({ source: 'cn-brew', installed: [], parse: { props: Object.fromEntries(props.map((p) => [p, { count: 1, noHash: 0 }])), notRun: [], errors: [], corpora: {}, authorErrors: [] }, alternatives: { targets: 0, errors: [] }, ms: 0 })

describe('自制编号对照取自整套自制的解析结果', () => {
  it('解析报告登记的类别全收（含跨包生成的条目）、和官方同编号的备选目标也收；不开任何作者小窗；同一库版本只读一次', async () => {
    db = new LibraryDatabase(`links-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const operations = new LibraryOperations({ db, revisions })
    const h = await operations.begin({ kind: 'test', set: 'cn-brew', codeSet: 'cn' })
    await h.target.derivedPut('audit:cn-brew', 'brew', report(['subclass', 'item']))
    await h.target.derivedPut(parsedKey('cn-brew', 'subclass'), 'brew', parsed(['季节结社|druid|xphb|hb', null]))
    await h.target.derivedPut(parsedKey('cn-brew', 'item'), 'brew', parsed(['屠龙者手持汤米弩_xdmg']))
    // 报告没登记的类别（解析失败 / 没有）不收
    await h.target.derivedPut(parsedKey('cn-brew', 'spell'), 'brew', parsed(['不该出现_hb']))
    await h.target.derivedPut(altsKey('cn-brew'), 'brew', { source: 'cn-brew', targets: { 'cn|item|长剑_phb': { target: { set: 'cn', prop: 'item', hash: '长剑_phb' }, source: 'PHB', base: 'official', alts: [] } }, errors: [] })
    await operations.publish(h, {})

    const openFrame = vi.fn()
    const lib = { currentView: () => revisions.published(), frameOf: openFrame, packOwnedItems: openFrame } as unknown as LibraryService
    const links = new EntryLinks(lib, {} as DocumentStore)
    const refs = await links.customRefs('cn')
    expect([...refs.keys()].sort()).toEqual(['item|屠龙者手持汤米弩_xdmg', 'item|长剑_phb', 'subclass|季节结社|druid|xphb|hb'])
    expect(refs.get('item|长剑_phb')).toEqual({ set: 'cn-brew', prop: 'item', hash: '长剑_phb' })
    expect(openFrame).not.toHaveBeenCalled()

    const view = await revisions.published()
    const get = vi.spyOn(view, 'derivedGet')
    await links.customRefs('cn')
    expect(get).not.toHaveBeenCalled()
  })

  it('没有解析报告的自制不收', async () => {
    db = new LibraryDatabase(`links-${Math.random()}`)
    const revisions = new LibraryRevisionStore(db)
    await revisions.ensureLegacy()
    const links = new EntryLinks({ currentView: () => revisions.published() } as unknown as LibraryService, {} as DocumentStore)
    expect((await links.customRefs('cn')).size).toBe(0)
  })
})
