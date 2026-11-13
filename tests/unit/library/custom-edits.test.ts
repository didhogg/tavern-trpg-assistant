// P5.5 阶段 C 的 G1–G3：保存前列出改了哪几项；存条目默认上次用的包；编辑 / 覆盖按包列出、整批改作用范围。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fieldChanges } from '../../../src/library/house-diff'
import { editChanges, listEdits, moveEdits } from '../../../src/library/custom-edits'
import { lastPack, rememberPack, type PackDeps } from '../../../src/library/custom-packs'
import { LibraryDatabase } from '../../../src/library/db'
import { ManageStore } from '../../../src/library/manage'
import { refKey, type CampaignLibrary, type EntryRef } from '../../../src/library/scopes'

let db: LibraryDatabase
let manage: ManageStore
beforeEach(() => { db = new LibraryDatabase(`test-edits-${Math.random()}`); manage = new ManageStore(db) })
afterEach(async () => { db.close(); await db.delete() })

describe('G1 这次改了哪几项', () => {
  it('列出字段、改前、改后；删掉的改后为 null；没改的不列；按字段名排', () => {
    expect(fieldChanges({ name: 'a', level: 1, range: 'x', source: 'P' }, { name: 'a', level: 2, school: 'V', source: 'Q' })).toEqual([
      { field: 'level', before: 1, after: 2 },
      { field: 'range', before: 'x', after: null },
      { field: 'school', before: undefined, after: 'V' },
    ])
  })
})

describe('G2 上次用的包', () => {
  const deps = (ids: string[]): PackDeps => ({ manage, lib: {} as never, packsOf: async () => ids.map((id) => ({ origin: 'import', sources: [id], sourceInfo: [{ json: id }], docIdLocal: id })) as never })
  it('记住后取回；包删了就退回 null；两套资料集分开记', async () => {
    expect(await lastPack(deps(['AAA']), 'cn')).toBeNull()
    await rememberPack({ manage }, 'cn', 'aaa')
    expect(await lastPack(deps(['AAA']), 'cn')).toBe('aaa')
    expect(await lastPack(deps(['AAA']), 'en')).toBeNull()
    expect(await lastPack(deps(['BBB']), 'cn')).toBeNull()
  })
})

describe('G3 编辑 / 覆盖按包列、改作用范围', () => {
  const fire: EntryRef = { set: 'cn-brew', prop: 'spell', hash: 'fireball_phb' }
  const sword: EntryRef = { set: 'cn', prop: 'item', hash: 'longsword_phb' }
  const other: EntryRef = { set: 'cn', prop: 'spell', hash: 'x_xge' }
  const items: Record<string, { item: unknown; source: string }> = {
    [refKey(fire)]: { item: { name: '火球术' }, source: 'PHB' },
    [refKey(sword)]: { item: { name: '长剑' }, source: 'PHB' },
    [refKey(other)]: { item: { name: '某法术' }, source: 'XGE' },
  }
  const deps = () => ({
    manage,
    storedItem: async (r: EntryRef) => items[refKey(r)] ?? null,
    choose: async (c: CampaignLibrary, r: EntryRef, altId: string | null, level: string = 'campaign') => {
      if (level === 'campaign') { const choices = { ...c.choices }; if (altId === null) delete choices[refKey(r)]; else choices[refKey(r)] = altId; return { ...c, choices } }
      await manage.setChoice(level as 'global', refKey(r), altId)
      return c
    },
  }) as never
  const camp = (choices: Record<string, string>) => ({ codeSet: 'cn', rule: 'dnd5e-2014', choices }) as unknown as CampaignLibrary

  it('按包的全部来源 + 包自己这一份筛；本战役层一起列；整包选用不列', async () => {
    await manage.setChoice('global', refKey(sword), 'house:longsword_trpghouse')
    await manage.setChoice('global', refKey(other), 'pack:phb :: phb_copy1')
    const c = camp({ [refKey(fire)]: 'base', 'src:phb': 'pack:phb :: phb_copy1' })
    const rows = await listEdits(deps(), { sources: ['PHB', 'PHB_COPY1'], altIds: ['pack:phb :: phb_copy1'] }, c)
    expect(rows.map((r) => [r.name, r.level, r.kind])).toEqual([['火球术', 'campaign', 'base'], ['长剑', 'global', 'house'], ['某法术', 'global', 'pack']])
    expect((await listEdits(deps(), { sources: ['XGE'] })).map((r) => r.name)).toEqual(['某法术'])
  })
  it('改作用范围：本战役 → 全局，旧层清掉、新层写上；已在目标层的不动', async () => {
    const c = camp({ [refKey(fire)]: 'house:fireball_trpghouse' })
    const next = await moveEdits(deps(), c, [{ level: 'campaign', ref: fire, altId: 'house:fireball_trpghouse' }], 'global')
    expect(next.choices).toEqual({})
    expect(await manage.choices('global')).toEqual({ [refKey(fire)]: 'house:fireball_trpghouse' })
    const back = await moveEdits(deps(), next, [{ level: 'global', ref: fire, altId: 'house:fireball_trpghouse' }], 'campaign')
    expect(back.choices).toEqual({ [refKey(fire)]: 'house:fireball_trpghouse' })
    expect(await manage.choices('global')).toEqual({})
  })
  it('生效中由后端标：本战役 → 这个战役的规则 → 全局，最上面那层生效；别的规则的层这个战役用不上', async () => {
    await manage.setChoice('global', refKey(fire), 'house:g')
    await manage.setChoice('rule:dnd5e-2024', refKey(fire), 'house:other')
    await manage.setChoice('rule:dnd5e-2014', refKey(fire), 'house:r')
    const rows = await listEdits(deps(), { refs: [fire] }, camp({}))
    const by = Object.fromEntries(rows.map((r) => [r.level, [r.active, r.inactive ?? null]]))
    expect(by).toEqual({ 'global': [false, 'covered'], 'rule:dnd5e-2024': [false, 'other-rule'], 'rule:dnd5e-2014': [true, null] })
    const withCampaign = await listEdits(deps(), { refs: [fire] }, camp({ [refKey(fire)]: 'base' }))
    expect(withCampaign.filter((r) => r.active).map((r) => r.level)).toEqual(['campaign'])
  })
  it('单条筛选：只列给的那几条（和来源筛选一起给时同时满足）', async () => {
    await manage.setChoice('global', refKey(sword), 'house:longsword_trpghouse')
    const c = camp({ [refKey(fire)]: 'house:fireball_trpghouse' })
    expect((await listEdits(deps(), { refs: [fire] }, c)).map((r) => [r.name, r.level])).toEqual([['火球术', 'campaign']])
    expect(await listEdits(deps(), { refs: [fire], sources: ['XGE'] }, c)).toEqual([])
  })
  it('改了什么：房规用唯一的房规改动算法（原文 + 原件当场拼，只看原文写了的字段）；别的版本本战役层临时选这一份和原件比；选的是原件就没有改动', async () => {
    const seen: Array<Record<string, string>> = []
    const house = { name: '火球术', source: 'TRPGHOUSE', level: 4, _copy: { name: '火球术', source: 'PHB' } }
    const frame = { call: async (cmd: string, ...a: unknown[]) => {
      if (cmd === 'brewDocIndex') return [{ docIdLocal: 'ed', isEditable: true }]
      if (cmd === 'packEntity') return { entity: house, hadId: true }
      if (cmd === 'cleanEntity') return a[0]
      // 作者合并不抄 page（_MERGE_REQUIRES_PRESERVE）：整条比会多出「page 删掉了」，只看原文写了的就不会
      if (cmd === 'mergeOne') return { name: '火球术', level: 4 }
      throw new Error(cmd)
    } }
    const d = {
      lib: { frameOf: async () => frame, storedItem: async () => ({ item: { name: '火球术', level: 3, page: 241 }, source: 'PHB' }) },
      houseSet: () => 'cn-brew',
      detail: async (c: CampaignLibrary) => { seen.push(c.choices); const alt = c.choices[refKey(fire)]; return { item: alt === 'base' ? { name: '火球术', level: 3 } : { name: '某版本', level: 5 }, base: { name: '火球术', level: 3 } } },
      changes: async (codeSet: string, a: Record<string, unknown> | null, b: Record<string, unknown>) => (codeSet === 'cn' ? fieldChanges(a!, b) : []),
    } as never
    const c = camp({})
    const got = await editChanges(d, c, { ref: { ...fire, set: 'cn-official' }, altId: 'house:fireball_trpghouse' })
    expect(got?.changes).toEqual([{ field: 'level', before: 3, after: 4 }])
    expect((await editChanges(d, c, { ref: fire, altId: 'pack:x' }))?.changes).toEqual([{ field: 'level', before: 3, after: 5 }, { field: 'name', before: '火球术', after: '某版本' }])
    expect(seen.at(-1)).toEqual({ [refKey(fire)]: 'pack:x' })
    expect(c.choices).toEqual({})
    expect((await editChanges(d, c, { ref: fire, altId: 'base' }))?.changes).toEqual([])
    expect(await editChanges({ detail: async () => null, changes: async () => [] } as never, c, { ref: fire, altId: 'x' })).toBeNull()
  })
})
