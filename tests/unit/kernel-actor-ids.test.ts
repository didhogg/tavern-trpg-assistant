// 结算小窗发人物编号不和存档撞（驾驶员 2026-11-23 真机：刷新后第一次从模板加入失败“存档里已经有这个人物：kernel0000000010”）。
// 小窗只在装回存档的人时才往后挪发号起点；装人慢一步或装不回（缺资料）时，新人会拿到存档里已有的编号。
import { describe, expect, it, vi } from 'vitest'
import { createServer } from '../../src/rules/kernel/frame/server'
import { usedActorIds } from '../../src/core/saves/kernel-roster'
import { defaultCampaignLibrary } from '../../src/library/scopes'
import { kernelCampaignSchema } from '../../src/schemas/kernel'

function server() {
  const socket = { emit: vi.fn() }
  const s = createServer(socket, { userId: 'test', worldTime: 0, readPack: async () => [], readText: async () => '' })
  const create = (data: Record<string, unknown>, keepId = false) => new Promise<{ result: Array<{ _id: string }> }>((resolve) => {
    socket.emit('modifyDocument', { action: 'create', type: 'Actor', operation: { data: [data], keepId } }, resolve)
  })
  return { s, create }
}

describe('人物编号', () => {
  it('登记过的编号之后再发：新人不拿存档里已有（还没装回小窗）的编号', async () => {
    const { s, create } = server()
    s.reserve(['kernel0000000009', 'kernel0000000012', 'kernel0000000010', 'a1'])
    expect((await create({ name: '地精' })).result[0]._id).toBe('kernel0000000013')
    // 读档装回旧编号照常保留，之后接着往后发
    expect((await create({ _id: 'kernel0000000020', name: '旧人' }, true)).result[0]._id).toBe('kernel0000000020')
    expect((await create({ name: '地精' })).result[0]._id).toBe('kernel0000000021')
  })

  it('存档用过的编号：名单上的、留着完整数据的、撤销能放回的都算', () => {
    const kernel = kernelCampaignSchema.parse({
      rule: 'dnd5e2014', kernelVersion: 1, library: defaultCampaignLibrary('dnd5e2014', 'en'), revision: 3,
      actors: [{ id: 'kernel0000000009', name: '甲', seed: 's', refs: [], choices: {}, state: {} }],
      bases: { kernel0000000011: {} },
      undo: [{ at: 1, revision: 2, actorIds: ['kernel0000000014'], before: { kernel0000000014: {} } }],
    })
    expect(usedActorIds(kernel).sort()).toEqual(['kernel0000000009', 'kernel0000000011', 'kernel0000000014'])
  })
})
