import { describe, expect, it } from 'vitest'
import { runSelfTest } from '../../src/core/selftest'

describe('M1 数据层自检', () => {
  it('全部步骤通过，且结束后删除临时数据库', async () => {
    const steps = await runSelfTest()
    expect(steps.filter((s) => !s.ok)).toEqual([])
    expect(steps.length).toBe(10)
    const names = (await indexedDB.databases()).map((d) => d.name ?? '')
    expect(names.filter((n) => n.startsWith('tavern-trpg-assistant-selftest-'))).toEqual([])
  })
})
