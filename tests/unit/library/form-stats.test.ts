// P5.5 §16.10 第 1 步：类别从属（1d）、官方用法统计（1a）、出版信息标记（1c）。自动字段（1b）要作者打标签程序，在浏览器里测。
import { describe, expect, it } from 'vitest'
import { distinctNames, entryKinds, NOT_CREATABLE } from '../../../src/library/entry-kinds'
import { fieldUsage, ownItems } from '../../../src/library/field-usage'
import type { BrewField } from '../../../src/library/brew-validate'
// @ts-expect-error 生成的字段表是 JS，没有类型声明
import fields from '../../../vendor/brew-schema/fields.js'

describe('类别从属（作者规矩：主类别名 + Fluff；必填写着主条目名）', () => {
  const req: Record<string, string[]> = {
    race: ['name', 'source'], subrace: ['name', 'source', 'raceName', 'raceSource'],
    class: ['name'], subclass: ['name', 'className', 'classSource'], subclassFeature: ['name', 'className', 'classSource', 'subclassShortName', 'level'],
    monster: ['name'], monsterFluff: ['name', 'source'], subclassFluff: ['name', 'className'],
  }
  const k = entryKinds(Object.keys(req), (p) => req[p] ?? [])
  it('背景介绍与图片挂到主条目', () => {
    expect(k.get('monsterFluff')).toEqual({ kind: 'fluff', parent: 'monster' })
    expect(k.get('subclassFluff')).toEqual({ kind: 'fluff', parent: 'subclass' })
  })
  it('从属挂到最近的一层', () => {
    expect(k.get('subrace')).toEqual({ kind: 'child', parent: 'race' })
    expect(k.get('subclass')).toEqual({ kind: 'child', parent: 'class' })
    expect(k.get('subclassFeature')).toEqual({ kind: 'child', parent: 'subclass' })
  })
  it('主条目', () => { expect(k.get('monster')).toEqual({ kind: 'main', parent: null }) })
  it('驾驶员定的两类不出现', () => { expect([...NOT_CREATABLE].sort()).toEqual(['citation', 'renderdemo']) })
  it('重名的补另一种语言的名字，取不到用类别编号', () => {
    const out = distinctNames([{ prop: 'condition', name: '状态' }, { prop: 'status', name: '状态' }, { prop: 'feat', name: '专长' }], (p) => (p === 'condition' ? 'Condition' : undefined))
    expect(out.map((t) => t.name)).toEqual(['状态（Condition）', '状态（status）', '专长'])
  })
})

describe('官方用法统计', () => {
  const defs = {}
  const f = (name: string, shape: BrewField['shape']): BrewField => ({ name, types: [], required: false, shape })
  const table: BrewField[] = [
    f('name', { c: 'text' }),
    f('alignment', { c: 'list', of: { c: 'pick', branches: [{ shape: { c: 'select', enum: ['L', 'C', 'E', 'G', 'N', 'U'] }, keys: [] }, { shape: { c: 'group', props: [{ name: 'special', required: true, shape: { c: 'text' } }] }, keys: ['special'] }] } }),
    f('type', { c: 'pick', branches: [{ shape: { c: 'text' }, keys: [] }, { shape: { c: 'group', props: [{ name: 'type', required: true, shape: { c: 'text' } }, { name: 'swarmSize', required: false, shape: { c: 'text' } }] }, keys: ['type'] }] }),
    { name: 'foundryX', types: [], required: false, internal: true },
  ]
  const items = [
    { name: 'A', alignment: ['C', 'E'], type: 'beast', _category: 'x' },
    { name: 'B', alignment: ['C', 'E'], type: { type: 'beast', swarmSize: 'T' } },
    { name: 'C', alignment: [{ special: '随它' }], type: 'undead' },
    { _copy: { name: 'A' }, name: 'D' },
  ]
  const u = fieldUsage(ownItems(items), table, defs)
  it('只统计自己写全的条目，只认字段表里的字段', () => {
    expect(u.items).toBe(3)
    expect(u.fields).toEqual({ name: 3, alignment: 3, type: 3 })
  })
  it('几种写法各用几次；套组子项几次', () => {
    expect(u.at['alignment[]'].branches).toEqual({ 0: 4, 1: 1 })
    expect(u.at.type.branches).toEqual({ 0: 2, 1: 1 })
    expect(u.at.type.sub).toEqual({ type: 1, swarmSize: 1 })
  })
  it('常见取值：一小串代号按整串算（阵营组合）', () => {
    expect(u.at.alignment.values?.[0]).toEqual(['["C","E"]', 2])
    expect(u.at.type.values?.[0]).toEqual(['"beast"', 1])
  })
})

describe('出版信息字段（结构定义特征，驾驶员 11-13 定）', () => {
  const monster = (fields as { props: Record<string, { fields: BrewField[] }> }).props.monster.fields
  const flag = (n: string) => monster.find((x) => x.name === n)?.publish ?? false
  it('头像 / 媒体 / 重印出处 / has 开头的素材标记 → 出版信息', () => {
    for (const n of ['hasToken', 'hasFluff', 'hasFluffImages', 'soundClip', 'altArt', 'tokenHref', 'reprintedAs', 'otherSources', 'referenceSources', 'isReprinted']) expect(flag(n), n).toBe(true)
  })
  it('种族里写成是否的 hasFluff 也算（11-13 补）', () => {
    const race = (fields as { props: Record<string, { fields: BrewField[] }> }).props.race.fields
    expect(race.find((x) => x.name === 'hasFluff')?.publish).toBe(true)
    expect(race.find((x) => x.name === 'size')?.publish ?? false).toBe(false)
  })
  it('有意义的开关不误收（召唤物按等级缩放）；人填的字段不收', () => {
    for (const n of ['summonedScaleByPlayerLevel', 'name', 'alignment', 'ac', 'trait']) expect(flag(n), n).toBe(false)
  })
})
