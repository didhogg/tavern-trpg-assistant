// 译名由作者类别登记和译名表生成。上游增减类别时，这里能查到产物过期。
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('Plutonium 的已登记起始装备类别都有中文语言包键', () => {
  const root = 'vendor/foundry/modules/plutonium'
  const script = readFileSync(`${root}/js/Bundle.js`, 'utf8')
  const registration = script.match(/const EQUIPMENT_TYPE_EXPANDERS = Object.fromEntries\(\[([\s\S]+?)\]/)?.[1] ?? ''
  const classes = [...registration.matchAll(/_EquipmentTypeExpander_(\w+)/g)].map(([, name]) => name)
  const labels = JSON.parse(readFileSync(`${root}/lang/zh.json`, 'utf8'))
  const prefix = 'TRPGAssistant.EquipmentType.'
  const keys = Object.keys(labels).filter(key => key.startsWith(prefix)).map(key => key.slice(prefix.length))
  expect(classes.length).toBeGreaterThan(0)
  expect(keys.sort()).toEqual(classes.sort())
  expect(labels[prefix + 'weaponSimpleRanged']).toBe('简易远程武器')
  expect(labels[prefix + 'toolArtisan']).toBe('工匠工具')
})
