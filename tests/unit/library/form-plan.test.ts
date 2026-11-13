// P5.5 §16.10 2b：表单安排（分块、默认写法、写法叫法、收起的子项、常见值、不出现的字段）。
import { describe, expect, it } from 'vitest'
import type { BrewField } from '../../../src/library/brew-validate'
import { fieldUsage } from '../../../src/library/field-usage'
import { formPlan } from '../../../src/library/form-plan'

const f = (name: string, shape: BrewField['shape'], extra: Partial<BrewField> = {}): BrewField => ({ name, types: [], required: false, shape, ...extra })
const align = { c: 'list' as const, of: { c: 'pick' as const, branches: [
  { shape: { c: 'select' as const, enum: ['L', 'C', 'E', 'G', 'N'] }, keys: [] },
  { shape: { c: 'group' as const, props: [{ name: 'alignment', required: true, shape: { c: 'text' as const } }, { name: 'chance', required: false, shape: { c: 'number' as const } }] }, keys: ['alignment'] },
  { shape: { c: 'group' as const, props: [{ name: 'special', required: true, shape: { c: 'text' as const } }] }, keys: ['special'] },
] } }
const fields: BrewField[] = [
  f('name', { c: 'text' }, { required: true }),
  f('source', { c: 'text' }, { required: true }),
  f('alignment', align),
  f('type', { c: 'pick', branches: [{ shape: { c: 'group', props: [{ name: 'type', required: true, shape: { c: 'text' } }, { name: 'swarmSize', required: false, shape: { c: 'text' } }, { name: 'tags', required: false, shape: { c: 'list', of: { c: 'text' } } }] }, keys: ['type'] }, { shape: { c: 'text' }, keys: [] }] }),
  f('rare', { c: 'text' }),
  f('hasToken', { c: 'switch' }, { publish: true }),
  f('damageTags', { c: 'multiselect', enum: ['F'] }),
]
const items = Array.from({ length: 20 }, (_, i) => ({ name: `m${i}`, alignment: ['C', 'E'], type: i < 15 ? 'beast' : { type: 'beast', tags: ['x'] }, ...(i === 0 ? { rare: 'y' } : {}), damageTags: ['F'] }))
const plan = formPlan({ fields, defs: {}, labels: { chance: '概率', special: '特殊', tags: '标签' } }, fieldUsage(items, fields, {}), ['damageTags'])

describe('表单安排', () => {
  it('分块：必填 / 常用（≥ 10%）/ 更多；来源、出版信息、自动字段不出现', () => {
    expect(plan.required).toEqual(['name'])
    expect(plan.common).toEqual(['alignment', 'type'])
    expect(plan.more).toEqual(['rare'])
    expect(plan.hidden.sort()).toEqual(['damageTags', 'hasToken', 'source'])
  })
  it('几种写法：默认官方最常用的；叫法 = 独有的子项（和字段同名的不算）', () => {
    expect(plan.at.type.order?.[0]).toBe(1)
    expect(plan.at.type.names).toEqual(['带swarmSize、标签', '自己写'])
    expect(plan.at['alignment[]'].names).toEqual(['从列表选', '带概率', '带特殊'])
  })
  it('写法菜单只给官方 ≥ 5% 在用的；没统计到的全给', () => {
    expect(plan.at.type.alt).toEqual([1, 0])
    expect(plan.at['alignment[]'].alt).toEqual([0])
  })
  it('用得少的子项收起；常见取值（一串代号按整串）', () => {
    expect(plan.at.type.rare).toEqual(['swarmSize'])
    expect(plan.at.alignment.values?.[0]).toEqual(['C', 'E'])
  })
})
