// P5.5 收尾 C3：「已有房规、在哪一层、用在哪里」在后端判断（原来在界面里）。
import { describe, expect, it } from 'vitest'
import { houseExisting } from '../../src/core/house-existing'

const zh = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }
const en = { set: 'en-official', prop: 'spell', hash: 'fireball_phb' }
const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} }
const house = (set: string, hash: string) => ({ set, prop: 'spell', hash })

describe('houseExisting', () => {
  it('没有生效的房规：null（预览页不出现「直接改 / 另存」）', async () => {
    const d = { houseNow: async () => ({ house: null, level: null }), impact: async () => ({ choices: [], saves: [] }) } as never
    expect(await houseExisting(d, c as never, { zh, en })).toBeNull()
  })
  it('中英各自的房规、所在层；用在哪里：层去重 + 战役名去重', async () => {
    const d = {
      houseNow: async (_c: unknown, r: typeof zh) => (r.set === 'cn-official' ? { house: house('cn-brew', 'h'), level: 'rule:dnd5e2014' } : { house: null, level: null }),
      impact: async () => ({ choices: [{ level: 'rule:dnd5e2014' }, { level: 'global' }, { level: 'global' }], saves: [{ ownerLabel: '龙枪' }, { ownerLabel: '龙枪' }] }),
    } as never
    expect(await houseExisting(d, c as never, { zh, en })).toEqual({ zh: house('cn-brew', 'h'), level: 'rule:dnd5e2014', usedAt: [{ kind: 'level', level: 'rule:dnd5e2014' }, { kind: 'level', level: 'global' }, { kind: 'campaign', name: '龙枪' }] })
  })
})
