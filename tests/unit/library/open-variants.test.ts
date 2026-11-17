// 关着的只是搜不到（驾驶员 2026-11-17）：展开同编号版本时，提供这个版本的自制包在本战役关着就不列；原件、开着的包照列，生效标记不改。
// 同编号版本的来源字段和原件一样（如都写 PHB），所以按「提供它的包声明的来源」判断，和包开关同一口径。
import { describe, expect, it } from 'vitest'
import { variantsOf, type Alternative } from '../../../src/library/versions'
import { chooseSource, defaultCampaignLibrary, openOnly, packVisible } from '../../../src/library/scopes'

const alt = (altId: string, docIdLocal: string): Alternative => ({ altId, kind: 'collision', filename: `${docIdLocal}.json`, docIdLocal, ref: { set: 'cn-brew', prop: 'spell', hash: 'fireball_phb' }, item: { source: 'PHB' } }) as Alternative
const alts = [alt('pack:openbrew', 'd-open'), alt('pack:closedbrew', 'd-closed')]
const packs = new Map([['cn-brew', new Map([['d-open', { sources: ['OpenBrew'] }], ['d-closed', { sources: ['ClosedBrew', 'ClosedBrew2'] }]])]])
const base = defaultCampaignLibrary('dnd5e2014', 'cn')
const closed = { ...base, ...chooseSource(chooseSource(base, 'ClosedBrew', false) as typeof base, 'ClosedBrew2', false) }

describe('packVisible', () => {
  it('包声明的来源全关 = 关；有一个开着 = 开；没声明来源 = 开', () => {
    expect(packVisible(closed, ['ClosedBrew', 'ClosedBrew2'])).toBe(false)
    expect(packVisible({ ...base, ...chooseSource(base, 'ClosedBrew', false) }, ['ClosedBrew', 'ClosedBrew2'])).toBe(true)
    expect(packVisible(closed, [])).toBe(true)
  })
})

describe('openOnly', () => {
  it('关着的包提供的版本不列，原件和开着的包照列（版本自己的来源同为 PHB，不影响判断）', () => {
    expect(openOnly(variantsOf('base', alts), closed, packs).map((v) => v.variant.altId)).toEqual(['base', 'pack:openbrew'])
  })
  it('本战役选用的版本来自关着的包：照样不列，原件也不标生效', () => {
    expect(openOnly(variantsOf('pack:closedbrew', alts), closed, packs).map((v) => [v.variant.altId, v.variant.effective])).toEqual([['base', false], ['pack:openbrew', false]])
  })
  it('全开时与展开结果一致', () => {
    const all = variantsOf('pack:openbrew', alts)
    expect(openOnly(all, base, packs)).toEqual(all)
  })
})
