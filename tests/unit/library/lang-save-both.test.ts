// P5.5 两边一起存 + 中文条目的英文名（ENG_name）自动写（驾驶员 2026-11-13 批准）。
import { describe, expect, it } from 'vitest'
import { BilingualLibrary } from '../../../src/library/custom-lang'

type Ent = Record<string, unknown>
const PACK = { id: 'p55', docIdLocal: 'doc', sources: ['P55'] }

function make({ zhEntity = null as Ent | null, failEn = false } = {}) {
  const saved: Array<{ codeSet: string; ent: Ent; opts: Record<string, unknown> }> = []
  const custom = {
    packs: async () => [PACK],
    saveEntry: async (codeSet: string, _prop: string, ent: Ent, opts: Record<string, unknown>) => {
      if (failEn && codeSet === 'en') throw new Error('写不进去')
      saved.push({ codeSet, ent, opts })
      return { uniqueId: 'u', hash: 'h', pending: true }
    },
    packEntry: async () => null,
  }
  const lib = {
    frameOf: async () => ({ call: async (cmd: string) => (cmd === 'packEntity' && zhEntity ? { entity: zhEntity, hash: 'zh-hash', hadId: true } : []) }),
    brewImport: async () => ({ ok: true, errors: [] }),
  }
  const counterparts = { counterpart: async () => (zhEntity ? { refs: [{ hash: 'zh-hash', docIdLocal: 'zh-doc' }] } : { refs: [], reason: 'not-paired' }) }
  const b = new BilingualLibrary(custom as never, lib as never, { installed: async () => [] } as never, counterparts as never)
  return { b, saved }
}

describe('两边一起存', () => {
  it('中英都给：先存中文、再存英文；中文的英文名写成英文那一条的名字', async () => {
    const { b, saved } = make()
    await b.saveBoth('p55', 'spell', { zh: { ent: { name: '火焰鹦鹉', ENG_name: '旧名' } }, en: { ent: { name: 'Fire Parrot' } } })
    expect(saved.map((s) => s.codeSet)).toEqual(['cn', 'en'])
    expect(saved[0].ent).toMatchObject({ name: '火焰鹦鹉', ENG_name: 'Fire Parrot' })
    expect(saved[0].opts.pack).toBe('p55')
  })

  it('只存中文：英文名不动', async () => {
    const { b, saved } = make()
    await b.saveBoth('p55', 'spell', { zh: { ent: { name: '火焰鹦鹉', ENG_name: 'Fire Parrot' }, replaceHash: 'x' } })
    expect(saved).toHaveLength(1)
    expect(saved[0].ent.ENG_name).toBe('Fire Parrot')
    expect(saved[0].opts.replaceHash).toBe('x')
  })

  it('只存英文、改了名：对上的中文那一条英文名跟着改', async () => {
    const { b, saved } = make({ zhEntity: { name: '火焰鹦鹉', ENG_name: 'Fire Parrot', uniqueId: 'z' } })
    await b.saveBoth('p55', 'spell', { en: { ent: { name: 'Flame Parrot' }, replaceHash: 'en-old' } })
    expect(saved.map((s) => s.codeSet)).toEqual(['cn', 'en'])
    expect(saved[0].ent).toMatchObject({ name: '火焰鹦鹉', ENG_name: 'Flame Parrot' })
    expect(saved[0].opts.replaceHash).toBe('zh-hash')
  })

  it('只存英文、名字没变：中文不用再存', async () => {
    const { b, saved } = make({ zhEntity: { name: '火焰鹦鹉', ENG_name: 'Fire Parrot' } })
    await b.saveBoth('p55', 'spell', { en: { ent: { name: 'Fire Parrot' }, replaceHash: 'en-old' } })
    expect(saved.map((s) => s.codeSet)).toEqual(['en'])
  })

  it('英文存失败：报错里说中文已经存好', async () => {
    const { b, saved } = make({ failEn: true })
    await expect(b.saveBoth('p55', 'spell', { zh: { ent: { name: '火焰鹦鹉' } }, en: { ent: { name: 'Fire Parrot' } } })).rejects.toThrow('中文已经存好')
    expect(saved.map((s) => s.codeSet)).toEqual(['cn'])
  })

  it('两边都没给：报错', async () => {
    const { b } = make()
    await expect(b.saveBoth('p55', 'spell', {})).rejects.toThrow('都没有要存的')
  })
})

describe('房规两种语言一起改', () => {
  const zhRef = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }
  const enRef = { set: 'en-official', prop: 'spell', hash: 'fireball_phb' }
  const camp = { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} as Record<string, string> }
  function make() {
    const calls: Array<{ codeSet: string; target: unknown }> = []
    const custom = {
      createHouseRule: async (c: typeof camp, target: typeof zhRef) => {
        calls.push({ codeSet: c.codeSet, target })
        const altId = `house:${target.set}`
        return { altId, campaign: { ...c, choices: { ...c.choices, [`${target.set}|${target.prop}|${target.hash}`]: altId } } }
      },
    }
    const scoped = {
      englishOf: async () => ({ status: 'found', hash: 'fireball_phb', item: { name: 'Fireball', level: 3 } }),
      detail: async (c: typeof camp) => ({ item: { name: 'Fireball', level: c.choices['en-official|spell|fireball_phb'] ? 4 : 3 }, version: { altId: c.choices['en-official|spell|fireball_phb'] ?? 'base' } }),
    }
    const b = new BilingualLibrary(custom as never, {} as never, {} as never, {} as never, scoped as never)
    return { b, calls }
  }
  it('两边各建一条，各用自己那一套；选择都记在同一个战役里', async () => {
    const { b, calls } = make()
    const r = await b.houseRuleBoth(camp, { zh: { target: zhRef, edited: { level: 4 } }, en: { target: enRef, edited: { level: 4 } } })
    expect(calls.map((x) => x.codeSet)).toEqual(['cn', 'en'])
    expect(r.campaign.codeSet).toBe('cn')
    expect(Object.keys(r.campaign.choices).sort()).toEqual(['cn-official|spell|fireball_phb', 'en-official|spell|fireball_phb'])
  })
  it('战役里生效的英文：有英文房规给房规那一份，没有给英文原文', async () => {
    const { b } = make()
    expect(await b.englishInCampaign(camp, zhRef)).toMatchObject({ ref: enRef, altId: 'base', item: { level: 3 } })
    const r = await b.houseRuleBoth(camp, { en: { target: enRef, edited: { level: 4 } } })
    expect(await b.englishInCampaign(r.campaign, zhRef)).toMatchObject({ altId: 'house:en-official', item: { level: 4 } })
  })
  it('两边都没给：报错', async () => {
    const { b } = make()
    await expect(b.houseRuleBoth(camp, {})).rejects.toThrow('都没有要改的')
  })
})
