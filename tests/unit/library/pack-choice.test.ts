// P5.5 B8-4 整包选用：每层先看这一条单独选的，再看它所属的书 / 包整包选的（选的那一份有这一条才算）。
import { describe, expect, it } from 'vitest'
import { chooseVersion, packChoiceKey, pickChoice, type Alternative } from '../../../src/library/versions'

const alt = (altId: string): Alternative => ({ altId, kind: 'collision', filename: null, ref: { set: 'cn-brew', prop: 'spell', hash: 'h' }, item: {} }) as Alternative
const alts = [alt('pack:phb :: phb_copy1'), alt('pack:phb :: phb_copy2')]
const key = 'cn-official|spell|火球术_phb'

describe('pickChoice / 整包选用', () => {
  it('这一条单独选过的优先于整包', () => {
    const m = { [key]: 'pack:phb :: phb_copy1', [packChoiceKey('PHB')]: 'pack:phb :: phb_copy2' }
    expect(pickChoice(m, key, 'PHB', alts)).toBe('pack:phb :: phb_copy1')
  })
  it('没单独选：用整包选的那一份；来源不分大小写', () => {
    expect(pickChoice({ 'src:phb': 'pack:phb :: phb_copy2' }, key, 'PHB', alts)).toBe('pack:phb :: phb_copy2')
  })
  it('整包选的那一份没有这一条：当没选（不报选过的不在了）；整包选原件也行', () => {
    expect(pickChoice({ 'src:phb': 'pack:phb :: phb_copy9' }, key, 'PHB', alts)).toBeUndefined()
    expect(pickChoice({ 'src:phb': 'base' }, key, 'PHB', alts)).toBe('base')
  })
  it('各层顺序：本战役（单条 → 整包）> 这套规则 > 全局', () => {
    const campaign = { 'src:phb': 'pack:phb :: phb_copy2' }
    const rule = { [key]: 'pack:phb :: phb_copy1' }
    const r = chooseVersion(alts, { campaign: pickChoice(campaign, key, 'PHB', alts), rule: pickChoice(rule, key, 'PHB', alts) })
    expect(r).toMatchObject({ altId: 'pack:phb :: phb_copy2', by: 'campaign' })
  })
})

describe('manage.allChoices 和整包选用', async () => {
  const { LibraryDatabase } = await import('../../../src/library/db')
  const { ManageStore } = await import('../../../src/library/manage')
  it('默认只给单条的（界面列表用）；packs: true 连整包的一起给（删除影响用）', async () => {
    const db = new LibraryDatabase(`test-pc-${Math.random()}`)
    const m = new ManageStore(db)
    await m.setChoice('global', key, 'pack:phb :: phb_copy1')
    await m.setChoice('global', packChoiceKey('PHB'), 'pack:phb :: phb_copy2')
    expect((await m.allChoices()).map((c) => c.target)).toEqual([key])
    expect((await m.allChoices({ packs: true })).map((c) => c.target).sort()).toEqual([key, 'src:phb'].sort())
    expect(await m.choices('global')).toMatchObject({ 'src:phb': 'pack:phb :: phb_copy2' })
    db.close(); await db.delete()
  })
})
