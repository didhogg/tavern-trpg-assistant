import { describe, expect, it } from 'vitest'
import { autoAssignment, chooseEntry, chooseSource, defaultCampaignLibrary, disabledEntries, entryUnit, membershipOf, sourceUnit, viewOf, type CampaignLibrary } from '../../../src/library/scopes'
import { chooseVersion, findCollisions, packAltId, packStableId, type Alternative, type DocIndex } from '../../../src/library/versions'

const c2014: CampaignLibrary = defaultCampaignLibrary('dnd5e2014', 'cn')
const ref = { set: 'cn-official', prop: 'spell', hash: 'x_phb' }
const units = { entry: entryUnit(ref), source: sourceUnit('PHB') }

describe('范围：作者判断 → 默认范围', () => {
  it('作者判为旧版 → 2014；新版 → 2024；判断不了 → 未归类', () => {
    expect(autoAssignment({ classic: true, basis: 'date' })).toEqual({ scopes: ['5e2014'], global: false })
    expect(autoAssignment({ classic: false, basis: 'brew-meta' })).toEqual({ scopes: ['5e2024'], global: false })
    expect(autoAssignment({ classic: null, basis: null })).toBeNull()
    expect(autoAssignment(undefined)).toBeNull()
  })
  it('归属：单条例外 > 用户归类 > 作者判断', () => {
    const a = { scopes: ['a'], global: false }
    const u = { scopes: ['u'], global: false }
    const e = { scopes: ['e'], global: false }
    expect(membershipOf(e, u, a).basis).toBe('entry')
    expect(membershipOf(undefined, u, a).basis).toBe('user')
    expect(membershipOf(undefined, undefined, a).basis).toBe('author')
    expect(membershipOf(undefined, undefined, null)).toEqual({ assignment: null, basis: 'none' })
  })
})

describe('战役看得到什么：并集 − 排除', () => {
  const in2014 = membershipOf(undefined, undefined, { scopes: ['5e2014'], global: false })
  const both = membershipOf(undefined, { scopes: ['5e2014', '5e2024'], global: false }, null)
  const global = membershipOf(undefined, { scopes: [], global: true }, null)
  const only2024 = membershipOf(undefined, undefined, { scopes: ['5e2024'], global: false })
  it('所选范围、两个范围共享、全局通用都看得到；别的范围、未归类看不到', () => {
    expect(viewOf(c2014, units, in2014)).toEqual({ visible: true, reason: 'scope' })
    expect(viewOf(c2014, units, both)).toEqual({ visible: true, reason: 'scope' })
    expect(viewOf(c2014, units, global)).toEqual({ visible: true, reason: 'global' })
    expect(viewOf(c2014, units, only2024)).toEqual({ visible: true, reason: 'out-of-scope' }) // B-32：已下载默认开
    expect(viewOf(c2014, units, membershipOf(undefined, undefined, null))).toEqual({ visible: true, reason: 'unclassified' })
  })
  it('排除说了算（连全局通用也能排除）；额外加入能加进范围外的', () => {
    expect(viewOf({ ...c2014, exclude: [sourceUnit('phb')] }, units, global)).toEqual({ visible: false, reason: 'excluded' })
    expect(viewOf({ ...c2014, exclude: [units.entry], include: [units.entry] }, units, in2014).reason).toBe('excluded')
    expect(viewOf({ ...c2014, include: [units.entry] }, units, only2024)).toEqual({ visible: true, reason: 'included' })
  })
  it('来源单位不分大小写、不分语言', () => {
    expect(sourceUnit('PHB')).toBe(sourceUnit('phb'))
  })
})

describe('同编号挂备选', () => {
  const doc = (id: string, t: number, props: DocIndex['props'], order = 0): DocIndex => ({ docIdLocal: id, filename: `${id}.json`, timeAdded: t, order, isEditable: false, props })
  it('和官方撞：官方是原件，自制全挂备选', () => {
    const r = findCollisions({ spell: new Set(['fireball_phb']) }, [doc('b', 2, { spell: ['fireball_phb'] }), doc('a', 1, { spell: ['fireball_phb', 'new_x'] })])
    expect(r).toEqual([{ prop: 'spell', hash: 'fireball_phb', base: { kind: 'official' }, others: ['a', 'b'] }])
  })
  it('自制之间撞：先装的是原件；包内自己重复不算；没撞的不列', () => {
    const r = findCollisions({}, [doc('late', 5, { spell: ['p_x'] }), doc('early', 1, { spell: ['p_x', 'p_x', 'only'] })])
    expect(r).toEqual([{ prop: 'spell', hash: 'p_x', base: { kind: 'doc', docIdLocal: 'early' }, others: ['late'] }])
  })
  it('同一次导入（加入时间相同）：按作者存储里的先后，不按随机编号', () => {
    const r = findCollisions({}, [doc('zzz-第二个', 7, { spell: ['p_x'] }, 1), doc('aaa-第一个', 7, { spell: ['p_x'] }, 0)])
    expect(r[0].base).toEqual({ kind: 'doc', docIdLocal: 'aaa-第一个' })
    const r2 = findCollisions({}, [doc('aaa-第二个', 7, { spell: ['p_x'] }, 1), doc('zzz-第一个', 7, { spell: ['p_x'] }, 0)])
    expect(r2[0].base).toEqual({ kind: 'doc', docIdLocal: 'zzz-第一个' })
  })
})

describe('生效版本：本战役 > 当前规则 > 全局 > 原件', () => {
  const alts: Alternative[] = [{ altId: 'doc:b', kind: 'collision', filename: 'b.json', item: {} }, { altId: 'house:h', kind: 'houserule', filename: null, item: {} }]
  it('没选 → 原件；按层级取', () => {
    expect(chooseVersion(alts, {})).toEqual({ altId: 'base', by: 'default', missing: null })
    expect(chooseVersion(alts, { global: 'doc:b' })).toEqual({ altId: 'doc:b', by: 'global', missing: null })
    expect(chooseVersion(alts, { global: 'doc:b', rule: 'house:h' }).altId).toBe('house:h')
    expect(chooseVersion(alts, { global: 'doc:b', campaign: 'base' })).toEqual({ altId: 'base', by: 'campaign', missing: null })
  })
  it('选过的备选被删了 → 回到原件并标出', () => {
    expect(chooseVersion(alts, { campaign: 'doc:gone' })).toEqual({ altId: 'base', by: 'campaign', missing: 'doc:gone' })
  })
})

describe('向导勾选一本书', () => {
  const noMatter = { scopes: ['5e2014'], global: false }
  it('取消勾选 = 排除（说了算）；再勾选 = 加入，两边互斥且不重复', () => {
    const off = chooseSource({ include: [], exclude: [] }, 'PHB', false)
    expect(off).toEqual({ include: [], exclude: [sourceUnit('PHB')] })
    const on = chooseSource({ ...off }, 'PHB', true)
    expect(on).toEqual({ include: [sourceUnit('PHB')], exclude: [] })
    expect(chooseSource(on, 'PHB', true)).toEqual(on)
    // 效果：排除 > 加入 > 范围
    const c = { ...defaultCampaignLibrary('dnd5e2014', 'cn'), ...off }
    expect(viewOf(c, units, { assignment: noMatter, basis: 'author' })).toEqual({ visible: false, reason: 'excluded' })
    const c2 = { ...defaultCampaignLibrary('dnd5e2014', 'cn'), ...on }
    expect(viewOf(c2, units, { assignment: null, basis: 'none' })).toEqual({ visible: true, reason: 'included' })
  })
})

describe('B-19 单条启用 / 停用', () => {
  const ref = { set: 'cn-official', prop: 'spell', hash: 'fireball|phb' }
  it('停用 = 排除、启用 = 加入，互斥；停用清单能读回定位', () => {
    const base = { include: [], exclude: [] }
    const off = chooseEntry(base, ref, false)
    expect(off.exclude).toEqual([entryUnit(ref)])
    expect(disabledEntries(off)).toEqual([ref])
    const on = chooseEntry(off, ref, true)
    expect(on).toEqual({ include: [entryUnit(ref)], exclude: [] })
    expect(disabledEntries(on)).toEqual([])
  })
  it('单条停用后查询按它过滤（viewOf 认条目单位），整本书仍开', () => {
    const c = { ...defaultCampaignLibrary('dnd5e2014', 'cn'), ...chooseEntry({ include: [], exclude: [] }, ref, false) }
    const units = { entry: entryUnit(ref), source: sourceUnit('PHB') }
    expect(viewOf(c, units, membershipOf(undefined, undefined, null))).toEqual({ visible: false, reason: 'excluded' })
    expect(viewOf(c, { entry: entryUnit({ ...ref, hash: 'other' }), source: sourceUnit('PHB') }, membershipOf(undefined, undefined, null)).visible).toBe(true)
  })
})

describe('B-21 备选编号用包的稳定标识', () => {
  const alt: Alternative = { altId: 'pack:https://x/b.json', legacyIds: ['doc:随机1'], kind: 'collision', filename: 'b.json', item: {} }
  it('新选的记稳定标识；旧版本记下的 doc:<本地编号> 仍认得，并归到新编号', () => {
    expect(chooseVersion([alt], { global: 'pack:https://x/b.json' })).toEqual({ altId: 'pack:https://x/b.json', by: 'global', missing: null })
    expect(chooseVersion([alt], { global: 'doc:随机1' })).toEqual({ altId: 'pack:https://x/b.json', by: 'global', missing: null })
  })
  it('卸载重装后本地编号变了，按稳定标识选的还在；只认旧本地编号的就丢（退回原件并标出）', () => {
    const reinstalled: Alternative = { ...alt, legacyIds: ['doc:随机2'] }
    expect(chooseVersion([reinstalled], { campaign: 'pack:https://x/b.json' }).altId).toBe('pack:https://x/b.json')
    expect(chooseVersion([reinstalled], { campaign: 'doc:随机1' })).toEqual({ altId: 'base', by: 'campaign', missing: 'doc:随机1' })
  })
  it('稳定标识：有网址用网址；没有用来源（小写排序连起来）；都没有 → 退回 doc:', () => {
    expect(packStableId({ url: 'https://x/a.json', sources: ['A'] })).toBe('https://x/a.json')
    expect(packStableId({ url: null, sources: ['Zed', 'Alpha'] })).toBe('alpha :: zed')
    expect(packStableId({ url: null, sources: [] })).toBeNull()
    expect(packAltId(null, 'abc')).toBe('doc:abc')
  })
})
