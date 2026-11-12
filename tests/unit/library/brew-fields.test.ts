import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { configureBrewValidator, loadBrewFields } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'
import { formatOfCodeSet } from '../../../src/library/formats'
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
  it('按资料集的数据格式取：custom.fields 和格式登记表给的一样；不认识的类别给 null', async () => {
    const codeSet = Object.keys(CODE_SETS)[0]
    const custom = new CustomLibrary({} as never, {} as never, {} as never)
    expect(await custom.fields(codeSet, 'spell')).toEqual(await formatOfCodeSet(codeSet).fields('spell'))
    expect(await custom.fields(codeSet, 'no-such-prop')).toBeNull()
  })
})
