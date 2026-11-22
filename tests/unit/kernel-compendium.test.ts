import { describe, expect, it, vi } from 'vitest'
import { createServer } from '../../src/rules/kernel/frame/server'

function connect(readPack: (id: string) => Promise<unknown[]>) {
  const socket = { emit: vi.fn() }
  createServer(socket, { userId: 'test', worldTime: 0, readPack, readText: async () => '' })
  return (operation: Record<string, unknown>) => new Promise<{ result: Array<Record<string, unknown>>; error?: { message: string } }>((resolve) => {
    socket.emit('modifyDocument', { action: 'get', operation: { pack: 'dnd5e.rules', ...operation } }, resolve)
  })
}

describe('official compendium reads in one kernel', () => {
  it('shares startup reads and keeps different projections independent', async () => {
    const source = { _id: 'a', name: 'Rule', system: { detail: { entries: ['original'] } } }
    const readPack = vi.fn(async () => [structuredClone(source)])
    const request = connect(readPack)
    const [byName, byDetail] = await Promise.all([
      request({ index: true, indexFields: ['_id', 'name'] }),
      request({ index: true, indexFields: ['system.detail'] }),
    ])
    expect(byName.result).toEqual([{ _id: 'a', name: 'Rule' }])
    expect(byDetail.result).toEqual([{ system: source.system }])
    ;(byDetail.result[0].system as typeof source.system).detail.entries.push('modified by caller')
    const document = await request({ query: { _id: 'a' } })
    expect(document.result).toEqual([source])
    expect(readPack).toHaveBeenCalledExactlyOnceWith('dnd5e.rules')
  })

  it('allows a later request to retry a failed read', async () => {
    const readPack = vi.fn<() => Promise<unknown[]>>()
      .mockRejectedValueOnce(new Error('read failed'))
      .mockResolvedValueOnce([{ _id: 'a' }])
    const request = connect(readPack)
    expect((await request({})).error?.message).toBe('read failed')
    expect((await request({})).result).toEqual([{ _id: 'a' }])
    expect(readPack).toHaveBeenCalledTimes(2)
  })
})
