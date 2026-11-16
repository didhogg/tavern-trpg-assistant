// 起始装备类别登记表 = Plutonium 原文：十八个类别码、每类别用哪些判断、每个判断看什么，逐项核对。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { EQUIPMENT_EXPANDERS, EQUIPMENT_PREDICATES } from '../../src/rules/kernel/equipment-rules'

const bundle = readFileSync('vendor/foundry/modules/plutonium/js/Bundle.js', 'utf8')
const block = bundle.slice(bundle.indexOf('class _EquipmentTypeExpanderBase'), bundle.indexOf('const EQUIPMENT_TYPE_EXPANDERS'))

describe('起始装备类别 = Plutonium 原文', () => {
  it('类别码和每类别的判断一致', () => {
    const found: Record<string, string[]> = {}
    for (const m of block.matchAll(/class _EquipmentTypeExpander_\w+ extends _EquipmentTypeExpanderBase \{[\s\S]*?equipmentType = "(\w+)";[\s\S]*?\.filter\(item => ([^)]*\)[^;]*)\);/g)) {
      found[m[1]] = [...m[2].matchAll(/this\._(\w+)\(item\)/g)].map((x) => `is${x[1].replace(/^is/, '')}`)
    }
    expect(Object.keys(found).length).toBe(18)
    expect(EQUIPMENT_EXPANDERS).toEqual(found)
  })
  it('每个判断看的类型缩写 / 字段和原文一致', () => {
    const found: Record<string, unknown> = {}
    for (const m of block.matchAll(/\t_is(\w+) \(item\) \{([\s\S]*?)\n\t\}/g)) {
      const body = m[2]
      const abv = [...body.matchAll(/Parser\.ITM_TYP_ABV__(\w+)/g)].map((x) => x[1])
      const field = /item\.(\w+) === "(\w+)"/.exec(body)
      found[`is${m[1]}`] = abv.length ? { abv } : field ? { field: [field[1], field[2]] } : body.trim()
    }
    expect(EQUIPMENT_PREDICATES).toEqual(found)
  })
})
