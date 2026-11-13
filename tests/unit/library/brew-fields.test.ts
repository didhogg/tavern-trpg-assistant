import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { configureBrewValidator, loadBrewFields } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import { formatOfCodeSet } from '../../../src/library/formats'
import { branchOf, gridFields, resolve } from '../../../src/library/field-shape-core'
import { CODE_SETS } from '../../../src/library/sources'

// P5.5 B4：字段说明表从作者结构定义生成（tools/build-brew-fields.mjs）。不写死类别和条数，按作者根结构核对。
configureBrewValidator(new URL('../../../', import.meta.url))
const root = JSON.parse(readFileSync(new URL('../../../vendor/brew-schema/schema/homebrew.json', import.meta.url), 'utf8')) as { properties: Record<string, unknown> }
const categories = Object.keys(root.properties).filter((k) => !k.startsWith('_') && !k.startsWith('$'))

describe('字段说明表（B4）', () => {
  it('类别 = 作者根结构的全部类别，一个不多一个不少', async () => {
    const t = await loadBrewFields()
    expect(Object.keys(t.props).sort()).toEqual([...categories].sort())
  })
  it('每个字段都有名字和类型，必填项在字段里；"能自带版本" = 字段里有 edition', async () => {
    const t = await loadBrewFields()
    for (const [prop, v] of Object.entries(t.props)) {
      for (const f of v.fields) expect(f.name, prop).toBeTruthy()
      expect(v.edition, prop).toBe(v.fields.some((f) => f.name === 'edition'))
    }
  })
  it('法术：名字、环阶必填，环阶是整数（作者结构定义原样）', async () => {
    const spell = (await loadBrewFields()).props.spell
    expect(spell.fields.find((f) => f.name === 'name')).toMatchObject({ required: true, types: ['string'] })
    expect(spell.fields.find((f) => f.name === 'level')).toMatchObject({ required: true, types: ['integer'] })
  })
  it('单表和表格组的必填项分开；职业表按作者结构识别数字格', async () => {
    const t = await loadBrewFields()
    expect(t.props.table.requiredChoices).toEqual([
      { fields: ['rows'], fixed: { type: 'table' } },
      { fields: ['tables'], fixed: { type: 'tableGroup' } },
    ])
    expect(t.props.table.fields.filter((f) => f.required).map((f) => f.name)).toEqual(['name', 'source'])
    const defs = t.defs ?? {}
    const groups = resolve(t.props.class.fields.find((f) => f.name === 'classTableGroups')!.shape!, defs)
    if (groups.c !== 'list') throw new Error('作者职业表不是列表')
    const choice = resolve(groups.of, defs)
    if (choice.c !== 'pick') throw new Error('作者职业表没有不同写法')
    const branch = branchOf(choice, { colLabels: ['1'], rowsSpellProgression: [[2]] }, defs)
    const group = resolve(choice.branches[branch].shape, defs)
    if (group.c !== 'group') throw new Error('作者职业表不是对象')
    expect(gridFields(group.props, defs)).toEqual({ rows: 'rowsSpellProgression', numeric: true })
  })
  it('按资料集的数据格式取：custom.fields = 格式登记表的 + 下拉 / 建议值的显示名（小窗按作者对照表给，P5.5 C10）；不认识的类别给 null', async () => {
    const codeSet = Object.keys(CODE_SETS)[1] ?? Object.keys(CODE_SETS)[0]
    let asked: string[][] = []
    const frame = { call: async (fn: string, lists: string[][]) => { expect(fn).toBe('valueLabels'); asked = lists; return lists.map((l) => (l.includes('action') ? { action: '动作' } : null)) } }
    const custom = new CustomLibrary({ frameOf: async () => frame } as never, {} as never, {} as never)
    const got = (await custom.fields(codeSet, 'spell'))!
    const raw = (await formatOfCodeSet(codeSet).fields('spell'))!
    expect(got.fields.map((f) => f.name)).toEqual(raw.fields.map((f) => f.name))
    expect(asked.some((l) => l.includes('action'))).toBe(true)
    expect(JSON.stringify(got.defs)).toContain('"labels":{"action":"动作"}')
    expect(JSON.stringify(raw.defs)).not.toContain('"labels"')
    expect(await custom.fields(codeSet, 'no-such-prop')).toBeNull()
  })
})

// P5.5 阶段 C：每个字段该画成什么控件（tools/brew-schema-walk.mjs）、中文名（tools/build-field-labels.mjs，只从作者中文版取）。
describe('控件形状与中文名（阶段 C）', () => {
  const deref = (s: unknown, defs: Record<string, unknown>): Record<string, unknown> => { const x = s as Record<string, unknown>; return (x && 'ref' in x ? defs[x.ref as string] : x) as Record<string, unknown> }
  it('不是内部字段的都有形状；Foundry / Roll20 专用的标内部、没有形状', async () => {
    const t = await loadBrewFields()
    for (const [prop, v] of Object.entries(t.props)) for (const f of v.fields) expect(f.internal ? !f.shape : !!f.shape, `${prop}.${f.name}`).toBe(true)
    expect(t.props.spell.fields.find((f) => f.name === 'foundrySystem')?.internal).toBe(true)
  })
  it('{ ref } 都能在 defs 里找到', async () => {
    const t = await loadBrewFields()
    const refs = JSON.stringify(t).match(/"ref":"[^"]+"/g) ?? []
    for (const r of refs) expect(t.defs, r).toHaveProperty([r.slice(7, -1)])
  })
  it('法术：施法时间 = 可以加几个的一组；范围 = 一组，里面「类型」是下拉；正文 = 作者正文', async () => {
    const t = (await formatOfCodeSet(Object.keys(CODE_SETS)[0]).fields('spell'))!
    const f = (n: string) => deref(t.fields.find((x) => x.name === n)!.shape, t.defs)
    expect(f('time')).toMatchObject({ c: 'list' })
    expect(deref(f('time').of, t.defs)).toMatchObject({ c: 'group' })
    const range = f('range') as { c: string; props: Array<{ name: string; shape: { c: string } }> }
    expect(range.c).toBe('group')
    expect(range.props.find((p) => p.name === 'type')?.shape.c).toBe('select')
    expect(f('entries')).toMatchObject({ c: 'list', of: { c: 'entries' } })
  })
  it('中文名：类别专用标签优先；其余字段从作者中文资料自动补，英文栏仍可取原名', async () => {
    const codeSet = Object.keys(CODE_SETS)[0]
    const spell = (await formatOfCodeSet(codeSet).fields('spell'))!
    const monster = (await formatOfCodeSet(codeSet).fields('monster'))!
    expect(spell.fields.find((f) => f.name === 'level')?.label).toBe('环节')
    expect(spell.fields.find((f) => f.name === 'time')?.label).toBe('施法时间')
    expect(monster.fields.find((f) => f.name === 'level')?.label).toBe('等级')
    const action = (await formatOfCodeSet(codeSet).fields('action'))!
    expect(action.fields.find((f) => f.name === 'time')?.label).toBe('时间')
    const mt = (await formatOfCodeSet(codeSet).fields('monster'))!
    expect(mt.labels['action[].name']).toBe('名称')
    expect(mt.fields.find((f) => f.name === 'skill')?.label).toBe('技能')
    expect(mt.fields.find((f) => f.name === 'ac')?.label).toBe('AC')
    expect(Object.values(mt.labels)).not.toContain('飞行术')
    const cls = (await formatOfCodeSet(codeSet).fields('class'))!
    expect(cls.fields.find((f) => f.name === 'classTableGroups')?.label).toBe('职业表格组')
    expect(cls.tips['classTableGroups[].rowsSpellProgression']).toMatch(/每一格只填写数字/)
  })
})
