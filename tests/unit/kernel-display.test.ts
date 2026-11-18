// 显示出口（src/rules/kernel/display.ts）：小窗交回的每段文字按来路换成本战役语言；取不到显示原文并记进 missed。
import { describe, expect, it } from 'vitest'
import type { TextQuery } from '../../src/library/texts'
import { display } from '../../src/rules/kernel/display'
import { asData, fromAuthor, fromEntry, fromLibrary, joined, named, plugin, requirementOf, valueText } from '../../src/rules/kernel/shown'
import { namerOf } from '../../src/rules/kernel/naming'
import type { KernelRefFlags } from '../../src/core/saves/split'

// 作者数据原样节选（侍僧 PHB、牧师 PHB 的中英两版）
const acolyteEn = { name: 'Acolyte', startingEquipment: [{ _: [{ item: 'holy symbol|phb', displayName: 'holy symbol (a gift to you when you entered the priesthood)' }, { special: 'sticks of incense', quantity: 5 }] }] }
const acolyteZh = { name: '侍僧', startingEquipment: [{ _: [{ item: '圣徽|phb', displayName: '圣徽（出任神职时的礼物）' }, { special: '熏香', quantity: 5 }] }] }
const clericEn = { name: 'Cleric', classTableGroups: [{ colLabels: ['{@filter Cantrips Known|spells|level=0|class=Cleric}'] }] }
const clericZh = { name: '牧师', classTableGroups: [{ colLabels: ['{@filter 已知戏法|spells|level=0|class=牧师}'] }] }
const pairs = [{ en: acolyteEn, zh: acolyteZh }, { en: clericEn, zh: clericZh }]

const brewer: KernelRefFlags = { page: 'items.html', source: 'PHB', hash: "brewer's%20supplies_phb", propDroppable: 'item' }
const hidden: KernelRefFlags = { page: 'items.html', source: 'PHB', hash: "smith's%20tools_phb", propDroppable: 'item' }
const namer = namerOf((f) => (f.source === 'PHB' ? { kind: 'item', set: 'cn-official', prop: 'item', hash: f.hash! } : null),
  async (prop) => (prop === 'item' ? [{ ref: { set: 'cn-official', prop: 'item', hash: "brewer's%20supplies_phb" }, item: { name: '酿酒工具' } }] : []))
// 本战役的作者小窗（假）：作者代码同位置的中文、前置条件按作者渲染
const author = { resolve: async (requests: TextQuery[]) => requests.map(q => {
  if (q.source === 'system') return q.key === 'DND5E.Feat' ? '专长' : null
  if (q.source === 'author') return q.path.join('.') === 'Parser.FEAT_CATEGORY_TO_FULL.O' ? '起源' : null
  if (q.source === 'requirement') return Array.isArray(q.raw) ? '战斗风格 特性' : null
  return null
}) }

const ctx = { translate: true, pairs, namer, author, requirementOf: (key: string) => (key === 'arcane-warrior' ? [{ feature: ['战斗风格'] }] : undefined) }

describe('显示出口：每种来路接现有出口', () => {
  it('条目原文按同编号条目同位置换；编号和原样数据不动', async () => {
    const out = await display({ entry: { uid: 'holy symbol|phb', displayName: fromEntry('Holy Symbol (A Gift to You When You Entered the Priesthood)'), raw: { a: 1 } }, title: fromEntry('Cantrips Known') }, ctx)
    expect(out.value.entry.displayName).toBe('圣徽（出任神职时的礼物）')
    expect(out.value.entry.uid).toBe('holy symbol|phb')
    expect(out.value.entry.raw).toEqual({ a: 1 })
    expect(out.value.title).toBe('已知戏法')
    expect(out.missed).toEqual([])
  })
  it('带作者编号的名字取本战役库名并补 ref；库里看不见的用 dnd5e 语言包的字，不算没翻到', async () => {
    const out = await display({ options: [{ value: 'a', label: named("Brewer's Supplies", brewer), author: brewer }, { value: 'b', label: named('锻造工具', hidden), author: hidden }] }, ctx)
    expect(out.value.options[0].label).toBe('酿酒工具')
    expect((out.value.options[0] as { ref?: unknown }).ref).toEqual({ kind: 'item', set: 'cn-official', prop: 'item', hash: "brewer's%20supplies_phb" })
    expect(out.value.options[1].label).toBe('锻造工具')
    expect(out.missed).toEqual([])
  })
  it('作者代码文字按位置取；前置条件用本战役生效条目的原始条件、本战役作者代码渲染', async () => {
    const out = await display({ title: joined([{ $t: 'system', text: 'Feat', key: 'DND5E.Feat' }, fromAuthor('Origin', ['Parser', 'FEAT_CATEGORY_TO_FULL', 'O'])], ' · '), requirement: requirementOf('arcane-warrior') }, ctx)
    expect(out.value.title).toBe('专长 · 起源')
    expect(out.value.requirement).toBe('战斗风格 特性')
  })
  it('插件说明句：参数各按来路取', async () => {
    const out = await display({ note: plugin('{0}的前置条件请核对：{1}', fromLibrary('奥法武斗家'), requirementOf('arcane-warrior')) }, ctx)
    expect(out.value.note).toBe('奥法武斗家的前置条件请核对：战斗风格 特性')
  })
  it('取不到的显示原文并记进 missed（不悄悄放行）', async () => {
    const out = await display({ a: fromEntry('Fighting Style'), b: fromAuthor('Three-Dragon Ante Set', null), c: requirementOf('unknown'), d: asData('gp|phb') }, ctx)
    expect(out.value.a).toBe('Fighting Style')
    expect(out.value.b).toBe('Three-Dragon Ante Set')
    expect(out.value.d).toBe('gp|phb')
    expect(out.missed).toEqual(expect.arrayContaining(['Fighting Style', 'Three-Dragon Ante Set']))
    expect(out.missed).toHaveLength(3)
  })
  it('英文战役（本战役语言 = 小窗出字的语言）：条目原文、作者代码文字原样，不算没翻到', async () => {
    const out = await display({ a: fromEntry('Fighting Style'), b: fromAuthor('Origin', ['Parser', 'FEAT_CATEGORY_TO_FULL', 'O']) }, { ...ctx, translate: false })
    expect(out.value).toEqual({ a: 'Fighting Style', b: 'Origin' })
    expect(out.missed).toEqual([])
  })
  it('语言包来源必须有真实键，错误键记录原因，不能把原名当作已翻译', async () => {
    const out = await display({ label: { $t: 'system', key: 'unknown', text: 'Longsword' } as const }, ctx)
    expect(out.value.label).toBe('Longsword')
    expect(out.missed).toEqual(['Longsword'])
    expect(out.issues).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'language-key-missing', key: 'unknown' })]))
  })
  it('同一熟练涉及多个出处时，共同译名可显示，译名冲突保留诊断', async () => {
    const ids = [brewer, { ...brewer, source: 'XPHB' }]
    const same = await display({ label: named('Brewer', ids, true) }, { ...ctx, namer: async id => ({ ref: { kind: 'item', set: 'cn-official', prop: 'item', hash: id.hash! }, label: '酿酒工具' }) })
    expect(same.value.label).toBe('酿酒工具')
    const conflict = await display({ label: named('Brewer', ids, true) }, { ...ctx, namer: async id => ({ ref: { kind: 'item', set: 'cn-official', prop: 'item', hash: id.hash! }, label: id.source! }) })
    expect(conflict.value.label).toBe('Brewer')
    expect(conflict.issues[0].reason).toBe('ambiguous-name')
  })
  it('同组配置编号交已有 valueLabels 入口，不能把技能或属性编号当成品英文', async () => {
    const calls: TextQuery[][] = []
    const out = await display({ a: valueText('str', ['str', 'dex']), b: valueText('dex', ['str', 'dex']) }, {
      ...ctx, author: { resolve: async requests => { calls.push(requests); return requests.map(q => q.source === 'value' ? ({ str: '力量', dex: '敏捷' })[q.key as 'str' | 'dex'] : null) } },
    })
    expect(out.value).toEqual({ a: '力量', b: '敏捷' })
    expect(calls).toEqual([[{ source: 'value', key: 'str', group: ['str', 'dex'] }, { source: 'value', key: 'dex', group: ['str', 'dex'] }]])
    expect(out.issues).toEqual([])
  })
})
