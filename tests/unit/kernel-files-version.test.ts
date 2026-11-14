// 性能支线（2026-11-14）：换算缓存只认结算小窗实际读的那套官方资料（英文，sources.ts kernelDataSource）。
// 另一种语言的官方资料变了，存档用的总版本照样变，换算钥匙不变；英文变了，换算钥匙跟着变。
import { describe, expect, it } from 'vitest'
import { dataVersionOf } from '../../src/library/revision-data'
import { kernelDataSource } from '../../src/library/sources'
import { kernelFilesVersion, kernelImportKey } from '../../src/rules/kernel/cache'
import type { OfficialSetState } from '../../src/library/db'

const set = (commit: string, sources: string[]): OfficialSetState => ({ commit, status: 'installed', sources, books: null, adventures: [] } as unknown as OfficialSetState)
const entry = { name: 'Fireball', source: 'PHB' }
const key = (v: ReturnType<typeof dataVersionOf>) => kernelImportKey({ base: 'k', dataVersion: v, kind: 'build', prop: 'spell', entry })

describe('换算缓存认的资料版本', () => {
  it('结算小窗读的是英文官方资料', () => {
    expect(kernelDataSource().codeSet).toBe('en')
  })
  it('补装中文的书：总版本变（存档照样提示），换算钥匙不变', async () => {
    const before = dataVersionOf({ 'cn-official': set('c1', ['PHB']), 'en-official': set('e1', ['PHB']) }, {})
    const after = dataVersionOf({ 'cn-official': set('c1', ['PHB', 'MM']), 'en-official': set('e1', ['PHB']) }, {})
    expect(after.official).not.toBe(before.official)
    expect(kernelFilesVersion(after)).toBe(kernelFilesVersion(before))
    expect(await key(after)).toBe(await key(before))
  })
  it('补装英文的书：换算钥匙跟着变', async () => {
    const before = dataVersionOf({ 'cn-official': set('c1', ['PHB']), 'en-official': set('e1', ['PHB']) }, {})
    const after = dataVersionOf({ 'cn-official': set('c1', ['PHB']), 'en-official': set('e1', ['PHB', 'MM']) }, {})
    expect(await key(after)).not.toBe(await key(before))
  })
  it('旧数据没有 kernelFiles：按总版本算（只会多算，不会算错）', () => {
    expect(kernelFilesVersion({ official: 'v2:x', brews: {} })).toBe('v2:x')
  })
})
