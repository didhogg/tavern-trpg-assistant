import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { PEOPLE_CATEGORY_LABELS, type Person } from '../../src/schemas/people'
import { nextNames, serialOfName } from '../../src/ui/people/naming'
import { hpFromEntry } from '../../src/ui/people/hp'
import { emptyBlock, emptyPerson, personFromEntry, toLibraryEntry } from '../../src/ui/people/fromEntry'
import { filterPeople, sortPeople } from '../../src/ui/people/list'
import { rowSummary } from '../../src/ui/people/rows'
import { queryTemplates, type TemplateRow } from '../../src/ui/people/templates'

const base = { src: { book: 'PHB', page: 1 }, credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } }
const block = (extra: Record<string, unknown> = {}): ReturnType<typeof emptyBlock> => ({ ...emptyBlock(), ...extra })
const person = (id: string, name: string, categoryId: Person['categoryId'] = 'enemy', extra: Partial<Person> = {}): Person => ({ ...emptyPerson({ id, name, categoryId, now: 10 }), ...extra })

describe('U6 起名与生命', () => {
  it('第一个不带号，之后续号；回收站里的名字也算；号不回收', () => {
    expect(nextNames('地精', [], 3)).toEqual(['地精', '地精 2', '地精 3'])
    expect(nextNames('地精', ['地精', '地精 3'], 2)).toEqual(['地精 4', '地精 5'])
    expect(nextNames('地精', ['地精 2'], 1)).toEqual(['地精 3'])
    expect(serialOfName('地精', '地精')).toBeUndefined()
    expect(serialOfName('地精', '地精 2')).toBe(2)
  })
  it('固定生命值才给当前与上限；特殊/没有就空着', () => {
    expect(hpFromEntry({ hp: { average: 7, formula: '2d6' } })).toEqual({ current: 7, max: 7 })
    expect(hpFromEntry({ hp: { average: 0, special: '见法术' } })).toEqual({ current: null, max: null })
    expect(hpFromEntry({})).toEqual({ current: null, max: null })
  })
})

describe('U6 列表纯函数', () => {
  const a = person('a', '盖尔', 'party', { tags: ['t1'], block: block({ race: 'race.human.phb', classes: [{ class: 'class.wizard.phb', level: 3 }] }) })
  const b = person('b', '地精', 'enemy', { tags: ['t1', 't2'], block: block({ creatureType: { type: 'humanoid', tags: ['goblin'] }, cr: 0.25 }) })
  const trashed = person('c', '死者', 'enemy', { trashedAt: 3 })
  it('搜索名字/种族/类型/标签，并可多标签同时具备；回收站排除', () => {
    expect(filterPeople([a, b, trashed], { search: '盖尔' }).map((p) => p.id)).toEqual(['a'])
    expect(filterPeople([a, b], { search: 'race.human' }).map((p) => p.id)).toEqual(['a'])
    expect(filterPeople([a, b], { categoryId: 'enemy', search: 'humanoid' }).map((p) => p.id)).toEqual(['b'])
    expect(filterPeople([a, b], { search: '深水', tagNames: { t2: '深水' } }).map((p) => p.id)).toEqual(['b'])
    expect(filterPeople([a, b], { tagIds: ['t1', 't2'] }).map((p) => p.id)).toEqual(['b'])
    expect(filterPeople([a, b, trashed], { categoryId: 'enemy' }).map((p) => p.id)).toEqual(['b'])
  })
  it('排序：置顶在前；四种键；没有等级排最后；挑战等级按分数', () => {
    const pinned = person('p', '钉', 'party', { pinned: true, touchedAt: 1 })
    expect(sortPeople([a, b, pinned], { key: 'touched', dir: 'desc' }).map((p) => p.id)[0]).toBe('p')
    expect(sortPeople([a, b], { key: 'name', dir: 'asc' }).map((p) => p.id)).toEqual(['b', 'a'])
    expect(sortPeople([a, b], { key: 'level', dir: 'desc' }).map((p) => p.id)).toEqual(['a', 'b'])
    expect(person('x', '无等级', 'npc', { block: block({ classes: undefined, cr: undefined }) }))
    expect(sortPeople([a, b], { key: 'level', dir: 'asc' }).map((p) => p.id)).toEqual(['b', 'a'])
  })
})

describe('U6 模板生成与存库', () => {
  const entry: Entry = { id: 'goblin', type: 'monster', name: '地精', keywords: [], unique: false, summary: '', data: { ...base, ...block({ creatureType: { type: 'humanoid', tags: [] }, cr: 0.25, hp: { average: 7 } }) } }
  it('从条目生成人物时复制 block、生命取固定值、记来源与续号', () => {
    const p = personFromEntry(entry, entry.data as ReturnType<typeof emptyBlock>, { name: '地精 2', categoryId: 'enemy', now: 5, serial: 2, sourceRef: { packId: 'dnd5e2014-srd', version: '1.0.0', entryId: 'goblin' } })
    expect(p).toMatchObject({ name: '地精 2', serial: 2, hp: { current: 7, temp: 0 }, sourceRef: { entryId: 'goblin' } })
    expect(p.block).not.toBe(entry.data)
  })
  it('存库条目是合法 monster，且去掉当场状态', () => {
    const p = person('a', '盖尔', 'party', { hp: { current: 2, temp: 3, deathSaves: { success: 1, fail: 0 } }, effects: [{ id: 'fx-1', category: 'spell', name: '祝福', concentration: false, addedAt: 0 }] })
    const lib = toLibraryEntry(p, { name: '查看用' })
    expect(lib).toMatchObject({ type: 'monster', name: '查看用' })
    expect((lib.data as { inventory?: unknown }).inventory).toBeUndefined()
    expect(() => toLibraryEntry(p, { name: ' ' })).toThrow('名字需要')
  })
})

describe('U6 模板查询与行摘要', () => {
  const rows: TemplateRow[] = [
    { packId: 'mm', packName: '怪物图鉴', entry: { id: 'goblin', type: 'monster', name: '地精', keywords: [], unique: false, summary: '', data: {} }, block: block({ creatureType: { type: 'humanoid', tags: [] }, cr: 0.25, size: ['S'] }) },
    { packId: 'mm', packName: '怪物图鉴', entry: { id: 'boss', type: 'monster', name: '地精首领', keywords: [], unique: false, summary: '', data: {} }, block: block({ creatureType: { type: 'humanoid', tags: [] }, cr: 1, size: ['M'] }) },
    { packId: 'mine', packName: '我的资料', entry: { id: 'npc', type: 'npc', name: '老渔夫', keywords: [], unique: false, summary: '', data: { statblock: 'goblin' } }, block: block({ creatureType: { type: 'humanoid', tags: [] }, cr: 0.25, size: ['S'] }) },
  ]
  it('类型、来源、挑战、生物类型、体型、搜索与排序', () => {
    expect(queryTemplates(rows, { type: 'monster', search: '地精', crMin: 0, crMax: 0.5, sizes: ['S'] }).map((r) => r.entry.id)).toEqual(['goblin'])
    expect(queryTemplates(rows, { sourcePacks: ['mine'] }).map((r) => r.entry.id)).toEqual(['npc'])
    expect(queryTemplates(rows, { creatureTypes: ['humanoid'], sort: 'cr' }).map((r) => r.entry.id)).toEqual(['boss', 'goblin', 'npc'])
  })
  it('行摘要写职业/种族、生命、AC 与效果，全部模式可加分类名', () => {
    const p = person('a', '盖尔', 'party', { tags: [], block: block({ race: 'race.human.phb', classes: [{ class: 'class.wizard.phb', level: 3 }], hp: { average: 18 }, ac: [{ value: 12 }] }), hp: { current: 12, temp: 0, deathSaves: { success: 0, fail: 0 } }, effects: [{ id: 'fx-1', category: 'spell', name: '祝福', concentration: false, addedAt: 0 }] })
    const s = rowSummary(p, { classes: { 'class.wizard.phb': '法师' }, races: { 'race.human.phb': '人类' } }, true)
    expect(s.line2).toBe('法师 3 ・ 人类 ・ 队伍')
    expect(s).toMatchObject({ hp: { current: 12, max: 18 }, ac: 12, effects: ['祝福'] })
    expect(PEOPLE_CATEGORY_LABELS.party).toBe('队伍')
  })
})
