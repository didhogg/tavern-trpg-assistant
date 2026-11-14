// 换算缓存：实际载入的自制包组成会影响换算；清理只删同规则下旧的一套。
import { describe, expect, it } from 'vitest'
import { LibraryDatabase } from '../../src/library/db'
import { KernelCache, kernelBaseKey, kernelImportKey } from '../../src/rules/kernel/cache'

describe('结算内核换算缓存', () => {
  it('没参与结算的自制包版本变化不使官方换算缓存失效', async () => {
    const a = { official: 'c1', brews: { 'cn-brew:x': '1' } }
    const b = { official: 'c1', brews: { 'cn-brew:x': '2', 'cn-brew:y': '1' } }
    const entry = { name: 'Fireball', source: 'PHB' }
    expect(await kernelImportKey({ base: 'k', dataVersion: a, kind: 'build', prop: 'spell', entry }))
      .toBe(await kernelImportKey({ base: 'k', dataVersion: b, kind: 'build', prop: 'spell', entry }))
    expect(await kernelImportKey({ base: 'k', dataVersion: a, kind: 'build', prop: 'spell', entry }))
      .not.toBe(await kernelImportKey({ base: 'k', dataVersion: { ...a, official: 'c2' }, kind: 'build', prop: 'spell', entry }))
    const actor = { name: 'A', refs: [], choices: {} }
    expect(await kernelBaseKey({ base: 'k', dataVersion: a, actor })).not.toBe(await kernelBaseKey({ base: 'k', dataVersion: b, actor }))
  })

  it('换算和重建缓存按实际参与结算的自制内容区分', async () => {
    const dataVersion = { official: 'c1', brews: {} }
    const common = { base: 'k', dataVersion }
    const row = { ...common, kind: 'build' as const, prop: 'spell', entry: { name: 'Fireball', source: 'PHB' } }
    const actor = { ...common, actor: { name: 'A', refs: [], choices: {} } }
    expect(await kernelImportKey(row)).not.toBe(await kernelImportKey({ ...row, brewFingerprint: 'loaded' }))
    expect(await kernelBaseKey(actor)).not.toBe(await kernelBaseKey({ ...actor, brewFingerprint: 'loaded' }))
  })

  it('sweep：删同规则下内核指纹或官方版本不同的行、没记套别的老行；别的规则不动', async () => {
    const db = new LibraryDatabase(`test-kc-${Math.random()}`)
    const cache = new KernelCache(db)
    const now = { rule: 'dnd5e2014', base: 'k2', official: 'c1' }
    await cache.put('keep', { a: 1 }, now)
    await cache.put('oldKernel', { a: 1 }, { ...now, base: 'k1' })
    await cache.put('oldData', { a: 1 }, { ...now, official: 'c0' })
    await cache.put('otherRule', { a: 1 }, { rule: 'dnd5e2024', base: 'x', official: 'y' })
    await db.derived.put({ key: 'kc:legacy', fingerprint: 'legacy', value: { data: {} }, savedAt: 0 })
    await db.derived.put({ key: 'kc-meta:dnd5e2014:cn', fingerprint: 'm', value: {}, savedAt: 0 })
    expect(await cache.sweep(now)).toBe(3)
    const left = (await db.derived.toArray()).map((r) => r.key).sort()
    expect(left).toEqual(['kc-meta:dnd5e2014:cn', 'kc:keep', 'kc:otherRule'])
    expect(await cache.get('keep')).toEqual({ a: 1 })
    db.close()
    await db.delete()
  })

  it('state 只看有没有、是不是失败行；失败行读出来是 null；之后换成功了失败记录跟着删；sweep 一并清旧失败记录', async () => {
    const db = new LibraryDatabase(`test-kc-${Math.random()}`)
    const cache = new KernelCache(db)
    const now = { rule: 'dnd5e2014', base: 'k2', official: 'c1' }
    expect(await cache.state('a')).toBe('missing')
    await cache.putFailed('a', '换算状态：error', now)
    expect(await cache.state('a')).toBe('failed')
    expect(await cache.get('a')).toBeNull()
    await cache.put('a', { ok: 1 }, now)
    expect(await cache.state('a')).toBe('done')
    expect(await cache.get('a')).toEqual({ ok: 1 })
    await cache.putFailed('old', 'x', { ...now, base: 'k1' })
    expect(await cache.sweep(now)).toBe(2)
    expect(await cache.state('old')).toBe('missing')
    db.close()
    await db.delete()
  })
})
