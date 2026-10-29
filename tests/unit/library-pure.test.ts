import { describe, expect, it } from 'vitest'
import { mergePatch } from '../../src/core/library/mergePatch'
import { disableFeatures, enableFeatures, featureUpdates, ruleOptionRows, setRuleOption, updateFeatures } from '../../src/core/library/features'
import { applyVariantPlan, fromPack, incomingVariants, planVariants, resolveVariant, setSourceUse, switchVariant, withdrawFrom } from '../../src/core/library/variants'
import { libraryOf, ORIGINAL, type Variant } from '../../src/core/library/types'
import type { WorkspaceData } from '../../src/schemas/campaign'
import type { Entry, InstalledPack, StoredEntry } from '../../src/schemas/pack'

const base: WorkspaceData = { instances: [] }
const entry = (data: Record<string, unknown> = { hp: 30 }): Entry => ({ id: 'gargoyle', type: 'monster', name: '石像鬼', summary: '原版', keywords: [], unique: false, data })
const pack = (id: string, extra: Partial<InstalledPack> = {}): InstalledPack => ({ id, name: id, version: '1.0.0', lineage: `l-${id}`, content: { features: [], adventure: {}, fallback: [] }, ...extra }) as InstalledPack
const mkVariant = (id: string, mode: Variant['mode'], payload: unknown = null): Variant => ({
  key: `pack:l-${id}/gar-v`, source: { type: 'pack', packId: id, lineage: `l-${id}`, version: '1.0.0' }, sourceName: id, mode, payload, note: '', })
const incoming = (id: string, mode: Variant['mode'], payload?: unknown) => ({ target: { packId: 'mm', entryId: 'gargoyle' }, variant: mkVariant(id, mode, payload) })
const KEY = 'mm/gargoyle'

describe('JSON Merge Patch', () => {
  it('递归合并、null 删除、数组整体替换，不改入参', () => {
    const target = { a: 1, b: { c: 2, d: 3 }, e: [1, 2] }
    const result = mergePatch(target, { b: { c: null, f: 4 }, e: [9] })
    expect(result).toEqual({ a: 1, b: { d: 3, f: 4 }, e: [9] })
    expect(target).toEqual({ a: 1, b: { c: 2, d: 3 }, e: [1, 2] })
  })
})

describe('修改版：加入候选的默认表（L1 §3.15）', () => {
  it('正在用原版且没亲自选过：按设置默认应用或不应用', () => {
    const plan = planVariants(base, [incoming('bt', 'replace', entry())], 'apply')
    expect(plan[0]).toMatchObject({ conflict: false, defaultUse: true })
    expect(planVariants(base, [incoming('bt', 'replace', entry())], 'skip')[0].defaultUse).toBe(false)
  })

  it('正在用其他修改版，或玩家亲自选过：保持现状并标为冲突', () => {
    let data = applyVariantPlan(base, planVariants(base, [incoming('a', 'hide')], 'apply'), { 'pack:l-a/gar-v': true })
    expect(planVariants(data, [incoming('b', 'hide')], 'apply')[0]).toMatchObject({ conflict: true, defaultUse: false, current: 'pack:l-a/gar-v' })
    data = switchVariant(data, KEY, ORIGINAL)
    expect(libraryOf(data).variants[KEY].manual).toBe(true)
    expect(planVariants(data, [incoming('b', 'hide')], 'apply')[0]).toMatchObject({ conflict: true, current: ORIGINAL })
  })

  it('不勾选的修改版照样加入候选，只是不使用；使用中的不会被新加入的替换', () => {
    const plan = planVariants(base, [incoming('a', 'hide')], 'apply')
    const data = applyVariantPlan(base, plan, { 'pack:l-a/gar-v': false })
    const slot = libraryOf(data).variants[KEY]
    expect(slot.candidates).toHaveLength(1)
    expect(slot.active).toBe(ORIGINAL)
    const used = applyVariantPlan(base, plan, { 'pack:l-a/gar-v': true })
    const second = planVariants(used, [incoming('b', 'hide')], 'apply')
    const again = applyVariantPlan(used, second, Object.fromEntries(second.map((p) => [p.variant.key, p.defaultUse])))
    expect(libraryOf(again).variants[KEY].active).toBe('pack:l-a/gar-v')
    expect(libraryOf(again).variants[KEY].candidates).toHaveLength(2)
  })

  it('扩展包更新：同一 key 的修改版换成新内容，使用状态不变', () => {
    let data = applyVariantPlan(base, planVariants(base, [incoming('a', 'replace', entry({ hp: 40 }))], 'apply'), { 'pack:l-a/gar-v': true })
    data = applyVariantPlan(data, planVariants(data, [incoming('a', 'replace', entry({ hp: 50 }))], 'apply'), { 'pack:l-a/gar-v': false })
    const slot = libraryOf(data).variants[KEY]
    expect(slot.active).toBe('pack:l-a/gar-v')
    expect((slot.candidates[0].payload as Entry).data.hp).toBe(50)
  })
})

describe('修改版：切换、撤下、回退', () => {
  const setup = () => {
    let data = applyVariantPlan(base, planVariants(base, [incoming('a', 'hide'), { target: { packId: 'mm', entryId: 'gargoyle' }, variant: { ...mkVariant('b', 'hide'), key: 'pack:l-b/gar-v' } }], 'skip'), {})
    data = switchVariant(data, KEY, 'pack:l-a/gar-v')
    data = switchVariant(data, KEY, 'pack:l-b/gar-v')
    return data
  }

  it('切换时旧版本进入 history 且标记为亲自选择', () => {
    const slot = libraryOf(setup()).variants[KEY]
    expect(slot.active).toBe('pack:l-b/gar-v')
    expect(slot.manual).toBe(true)
    expect(slot.history).toEqual([ORIGINAL, 'pack:l-a/gar-v'])
  })

  it('撤下正在使用的：回到 history 里最近仍存在的版本；没有就回到原版', () => {
    const { data, reverted } = withdrawFrom(setup(), fromPack('b'))
    expect(libraryOf(data).variants[KEY].active).toBe('pack:l-a/gar-v')
    expect(reverted).toEqual([{ entryKey: KEY, from: 'pack:l-b/gar-v', to: 'pack:l-a/gar-v' }])
    const second = withdrawFrom(data, fromPack('a'))
    expect(libraryOf(second.data).variants[KEY]).toBeUndefined()
    expect(second.reverted[0].to).toBe(ORIGINAL)
  })

  it('撤下没有在使用的修改版：只删候选，不改使用状态', () => {
    const { data, reverted } = withdrawFrom(setup(), fromPack('a'))
    expect(reverted).toEqual([])
    expect(libraryOf(data).variants[KEY].candidates.map((c) => c.key)).toEqual(['pack:l-b/gar-v'])
  })

  it('「全部不用」保留候选；「全部使用」改用该来源', () => {
    const none = setSourceUse(setup(), fromPack('b'), false)
    expect(libraryOf(none.data).variants[KEY].candidates).toHaveLength(2)
    expect(libraryOf(none.data).variants[KEY].active).toBe('pack:l-a/gar-v')
    const all = setSourceUse(none.data, fromPack('b'), true)
    expect(libraryOf(all.data).variants[KEY].active).toBe('pack:l-b/gar-v')
  })
})

describe('修改版：解析', () => {
  const slot = (v: Variant, active = v.key) => ({ candidates: [v], active, manual: false, history: [] })
  it('replace 整条换；patch 合并 data；hide 内容仍是原版但标为隐藏', () => {
    const rep = resolveVariant(entry(), slot(mkVariant('a', 'replace', { ...entry({ hp: 99 }) })))
    expect(rep.entry?.data.hp).toBe(99)
    const patch = resolveVariant(entry({ hp: 30, ac: 15 }), slot(mkVariant('a', 'patch', { data: { hp: 60 } })))
    expect(patch.entry?.data).toEqual({ hp: 60, ac: 15 })
    expect(patch.entry?.name).toBe('石像鬼')
    const hide = resolveVariant(entry(), slot(mkVariant('a', 'hide')))
    expect(hide).toMatchObject({ hidden: true, broken: false })
    expect(hide.entry?.data.hp).toBe(30)
  })

  it('原版缺失：patch / hide 无法显示，replace 照常', () => {
    expect(resolveVariant(null, slot(mkVariant('a', 'patch', { data: {} }))).broken).toBe(true)
    expect(resolveVariant(null, slot(mkVariant('a', 'replace', entry()))).entry?.name).toBe('石像鬼')
  })

  it('套用结果不合法：本次使用原版并标为 broken', () => {
    const r = resolveVariant(entry(), slot(mkVariant('a', 'replace', { id: 'x' })))
    expect(r.broken).toBe(true)
    expect(r.entry?.summary).toBe('原版')
  })

  it('没有候选或使用原版：返回原版', () => {
    expect(resolveVariant(entry(), undefined)).toMatchObject({ active: ORIGINAL, hidden: false, others: 0 })
  })
})

describe('包里的修改版条目', () => {
  it('读出 target、mode、note，key 带 lineage', () => {
    const stored = [
      { packId: 'bt', entryId: 'gar-v', ruleId: 'r', type: 'monster', name: '石像鬼', keywords: [], unique: false, summary: '改', data: { hp: 60 }, override: { target: { packId: 'mm', entryId: 'gargoyle' }, mode: 'patch', note: '不惧魔法武器', baseVersion: '1.0.0' } },
      { packId: 'bt', entryId: 'plain', ruleId: 'r', type: 'monster', name: '普通', keywords: [], unique: false, summary: '', data: {} },
    ] as StoredEntry[]
    const list = incomingVariants(pack('bt'), stored)
    expect(list).toHaveLength(1)
    expect(list[0].variant).toMatchObject({ key: 'pack:l-bt/gar-v', mode: 'patch', note: '不惧魔法武器', baseVersion: '1.0.0' })
    expect(list[0].target).toEqual({ packId: 'mm', entryId: 'gargoyle' })
  })
})

describe('功能：启用、停用、规则选项', () => {
  const feature = (id: string, defaultEnabled: boolean, extra: Record<string, unknown> = {}) => ({ id, kind: 'ruleOptions', name: `选项${id}`, description: '', defaultEnabled, data: { summary: '一句话', ...extra } })
  const dmg = pack('dmg', { content: { features: [feature('a', true), feature('b', false)], adventure: {}, fallback: [] } })

  it('启用时复制定义，初始值取 defaultEnabled；已有值不覆盖', () => {
    let data = enableFeatures(base, dmg, 1)
    expect(ruleOptionRows(data).map((r) => [r.name, r.on])).toEqual([['选项a', true], ['选项b', false]])
    data = setRuleOption(data, 'l-dmg/a', false)
    data = disableFeatures(data, 'dmg')
    expect(ruleOptionRows(data)).toEqual([])
    data = enableFeatures(data, dmg, 2)
    expect(ruleOptionRows(data).find((r) => r.name === '选项a')?.on).toBe(false)
  })

  it('停用：定义与状态保留，只是 enabled 为否', () => {
    const data = disableFeatures(enableFeatures(base, dmg, 1), 'dmg')
    expect(libraryOf(data).features['l-dmg/a'].enabled).toBe(false)
    expect(libraryOf(data).featureState['l-dmg/a']).toBe(true)
  })

  it('说明文字为占位的 "[]" 时当作没有', () => {
    const data = enableFeatures(base, pack('x', { content: { features: [feature('a', false, { text: '[]' })], adventure: {}, fallback: [] } }), 1)
    expect(ruleOptionRows(data)[0].text).toBe('')
  })

  it('库里有新版定义：计数；stateVersion 相同时更新，不同时保留旧定义并说明', () => {
    const data = enableFeatures(base, dmg, 1)
    const newer = pack('dmg', { version: '1.1.0', content: { features: [{ ...feature('a', true), description: '新说明' }, { ...feature('b', false), stateVersion: 2, description: '改了格式' }], adventure: {}, fallback: [] } })
    expect(featureUpdates(data, new Map([['dmg', newer]])).get('dmg')).toBe(2)
    const result = updateFeatures(data, newer, 5)
    expect(result.updated).toEqual(['l-dmg/a'])
    expect(result.kept[0].reason).toContain('不能自动迁移')
    expect(libraryOf(result.data).features['l-dmg/a'].def.description).toBe('新说明')
    expect(libraryOf(result.data).features['l-dmg/b'].def.description).toBe('')
  })

  it('不是规则选项的 key 不能当规则选项开关', () => {
    const data = enableFeatures(base, pack('t', { content: { features: [{ id: 't1', kind: 'aiNotes', name: 'n', description: '', defaultEnabled: false, data: {} }], adventure: {}, fallback: [] } }), 1)
    expect(setRuleOption(data, 'l-t/t1', true)).toBe(data)
  })
})
