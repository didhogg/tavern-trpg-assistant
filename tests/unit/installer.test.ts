import { describe, expect, it } from 'vitest'
import { TrpgError } from '../../src/core/errors'
import { PackService } from '../../src/core/packs/installer'
import type { RecognizedPack } from '../../src/core/packs/recognize'
import type { PackKind } from '../../src/schemas/pack'
import { makeClock, makeEntries, makePack, makeRegistry, withDb } from '../helpers/fixtures'

function service(db: Parameters<Parameters<typeof withDb>[0]>[0], onChange?: (c: unknown) => void): PackService {
  return new PackService(db, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0', onChange })
}

function rec(svc: PackService, bytes: Uint8Array): RecognizedPack {
  const r = svc.recognize(bytes)
  if (r.type !== 'pack') throw new Error('不是内容包')
  return r
}

async function expectCode(promise: Promise<unknown>, code: string): Promise<void> {
  try {
    await promise
  } catch (e) {
    expect(e).toBeInstanceOf(TrpgError)
    expect((e as TrpgError).code).toBe(code)
    return
  }
  throw new Error(`应当抛出 ${code}`)
}

// 数据包与模组扩展同构：同一批用例对两种 kind 各跑一遍
describe.each<PackKind>(['data', 'module'])('PackService（kind=%s）', (kind) => {
  const base = { id: `p-${kind}`, kind, name: kind === 'data' ? '珊娜萨' : '风暴岛' }

  it('安装新包：写入清单、条目与资源，并通知', async () => {
    await withDb(async (db) => {
      const events: unknown[] = []
      const svc = service(db, (c) => events.push(c))
      const assets = new Map([['a.png', new Uint8Array([9])]])
      const installed = await svc.install(rec(svc, makePack(base, makeEntries(4), assets)), { source: 'import' })
      expect(installed).toMatchObject({ id: base.id, kind, source: 'import', entryCount: 4, version: '1.0.0' })
      expect(await db.entries.where('packId').equals(base.id).count()).toBe(4)
      expect((await db.assets.get([base.id, 'a.png']))?.bytes).toEqual(new Uint8Array([9]))
      expect(events).toEqual([{ type: 'installed', packId: base.id }])
    })
  })

  it('同 id：较新 / 相同 / 较旧各返回对应关系，未选择时拒绝', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack({ ...base, version: '1.1.0' })), { source: 'import' })
      expect(await svc.plan(rec(svc, makePack({ ...base, version: '1.2.0' })))).toMatchObject({ action: 'overwrite', relation: 'newer' })
      expect(await svc.plan(rec(svc, makePack({ ...base, version: '1.1.0' })))).toMatchObject({ action: 'overwrite', relation: 'same' })
      expect(await svc.plan(rec(svc, makePack({ ...base, version: '1.0.0' })))).toMatchObject({ action: 'overwrite', relation: 'older' })
      await expectCode(svc.install(rec(svc, makePack({ ...base, version: '1.2.0' })), { source: 'import' }), 'E_CONFLICT_UNRESOLVED')
    })
  })

  it('覆盖：旧条目与资源被整体替换，新条目写入', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base, makeEntries(5), new Map([['old.png', new Uint8Array([1])]]))), { source: 'import' })
      await svc.install(rec(svc, makePack({ ...base, version: '1.1.0' }, makeEntries(2, 'spell', 'n'))), { source: 'import', resolution: 'overwrite' })
      const entries = await db.entries.where('packId').equals(base.id).toArray()
      expect(entries.map((e) => e.entryId).sort()).toEqual(['n1', 'n2'])
      expect(await db.assets.where('packId').equals(base.id).count()).toBe(0)
      expect((await db.packs.get(base.id))?.version).toBe('1.1.0')
    })
  })

  it('下载与更新：同 id 直接覆盖，无需选择', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base)), { source: 'import' })
      const updated = await svc.install(rec(svc, makePack({ ...base, version: '1.0.1' })), { source: 'download' })
      expect(updated).toMatchObject({ version: '1.0.1', source: 'download' })
    })
  })

  it('不同 id 同名：保留两个（导入的加（2）、（3））/ 替换 / 未选择', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base)), { source: 'import' })
      const other = makePack({ ...base, id: `q-${kind}` })
      expect(await svc.plan(rec(svc, other))).toMatchObject({ action: 'name-conflict', canReplace: true })
      await expectCode(svc.install(rec(svc, other), { source: 'import' }), 'E_CONFLICT_UNRESOLVED')
      const kept = await svc.install(rec(svc, other), { source: 'import', resolution: 'keep-both' })
      expect(kept.name).toBe(`${base.name}（2）`)
      const third = await svc.install(rec(svc, makePack({ ...base, id: `r-${kind}` })), { source: 'import', resolution: 'keep-both' })
      expect(third.name).toBe(`${base.name}（3）`)
      const replaced = await svc.install(rec(svc, makePack({ ...base, id: `s-${kind}`, name: base.name })), { source: 'import', resolution: 'replace' })
      expect(replaced.id).toBe(`s-${kind}`)
      expect(await db.packs.get(base.id)).toBeUndefined()
      expect(await db.entries.where('packId').equals(base.id).count()).toBe(0)
    })
  })

  it('同名但规则或类型不同不算冲突', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base)), { source: 'import' })
      const otherKind: PackKind = kind === 'data' ? 'module' : 'data'
      expect(await svc.plan(rec(svc, makePack({ ...base, id: 'z', kind: otherKind })))).toEqual({ action: 'install' })
    })
  })

  it('删除：移除全部数据，通知；被存档引用时可查出数量', async () => {
    await withDb(async (db) => {
      const events: unknown[] = []
      const svc = service(db, (c) => events.push(c))
      await svc.install(rec(svc, makePack(base, makeEntries(3), new Map([['a', new Uint8Array([1])]]))), { source: 'import' })
      await db.saves.bulkAdd([
        { id: 's1', ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', name: 'a', note: '', kind: 'manual', createdAt: 1, updatedAt: 1, summary: { partyNames: [], partyCount: 0 }, packs: [{ id: base.id, version: '1.0.0', name: base.name }], snapshot: { instances: [] }, hash: 'h', schemaVersion: 1 },
        { id: 's2', ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', name: 'b', note: '', kind: 'manual', createdAt: 1, updatedAt: 1, deletedAt: 5, summary: { partyNames: [], partyCount: 0 }, packs: [{ id: base.id, version: '1.0.0', name: base.name }], snapshot: { instances: [] }, hash: 'h', schemaVersion: 1 },
      ])
      expect((await svc.referencingSaves(base.id)).map((s) => s.id)).toEqual(['s1'])
      await svc.uninstall(base.id)
      expect(await db.packs.count()).toBe(0)
      expect(await db.entries.count()).toBe(0)
      expect(await db.assets.count()).toBe(0)
      expect(events.at(-1)).toEqual({ type: 'uninstalled', packId: base.id })
      await expectCode(svc.uninstall(base.id), 'E_NOT_FOUND')
    })
  })

  it('导出再导入：内容一致（往返）', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const entries = [...makeEntries(2, 'spell'), ...makeEntries(1, 'monster', 'm')]
      await svc.install(rec(svc, makePack({ ...base, dependsOn: [{ id: 'dnd5e2014-core', minVersion: '1.0.0' }] }, entries, new Map([['x/y.png', new Uint8Array([7, 7])]]))), { source: 'import' })
      const bytes = await svc.exportPack(base.id)
      const again = rec(svc, bytes)
      expect(again.manifest).toMatchObject({ id: base.id, kind, entryCount: 3, typeCounts: { spell: 2, monster: 1 }, dependsOn: [{ id: 'dnd5e2014-core', minVersion: '1.0.0' }] })
      expect(again.entries.map((e) => e.id).sort()).toEqual(['e1', 'e2', 'm1'])
      expect(again.assets.get('x/y.png')).toEqual(new Uint8Array([7, 7]))
    })
  })

  it('安装失败时整体回滚，不留下半个包', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const r = rec(svc, makePack(base, makeEntries(3)))
      r.entries.push({ ...r.entries[0] }) // 条目主键重复：bulkPut 之外制造失败
      const original = db.entries.bulkPut.bind(db.entries)
      db.entries.bulkPut = (async () => {
        await original([])
        throw new Error('写入中途失败')
      }) as unknown as typeof db.entries.bulkPut
      await expect(svc.install(r, { source: 'import' })).rejects.toThrow('写入中途失败')
      expect(await db.packs.count()).toBe(0)
      expect(await db.entries.count()).toBe(0)
    })
  })

  it('存储空间不足时给出明确提示', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      db.entries.bulkPut = (async () => {
        const err = new Error('quota')
        err.name = 'QuotaExceededError'
        throw err
      }) as unknown as typeof db.entries.bulkPut
      const promise = svc.install(rec(svc, makePack(base)), { source: 'import' })
      await expectCode(promise, 'E_QUOTA')
      expect(await db.packs.count()).toBe(0)
    })
  })

  it('覆盖时同步更新当前数据里启用的版本号', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base)), { source: 'import' })
      await db.workspaces.add({ ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', currentSaveId: null, enabledPacks: [{ id: base.id, version: '1.0.0' }], data: { instances: [] }, savedHash: '', schemaVersion: 1, updatedAt: 1 })
      await svc.install(rec(svc, makePack({ ...base, version: '2.0.0' })), { source: 'download' })
      expect((await db.workspaces.get('k'))?.enabledPacks).toEqual([{ id: base.id, version: '2.0.0' }])
    })
  })
})

describe('内置包', () => {
  it('首次安装、更高版本升级、相同或更低版本跳过；内置包不能删除或降级或被替换', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      expect(await svc.installBuiltin(makePack({ version: '1.0.0' }))).toBe('installed')
      expect(await svc.installBuiltin(makePack({ version: '1.0.0' }))).toBe('skipped')
      expect(await svc.installBuiltin(makePack({ version: '1.1.0' }))).toBe('upgraded')
      expect(await svc.installBuiltin(makePack({ version: '1.0.5' }))).toBe('skipped')
      expect((await db.packs.get('dnd5e2014-core'))?.version).toBe('1.1.0')
      await expectCode(svc.uninstall('dnd5e2014-core'), 'E_BUILTIN_PROTECTED')
      const older = rec(svc, makePack({ version: '1.0.0' }))
      expect(await svc.plan(older)).toMatchObject({ action: 'overwrite', relation: 'older', blocked: 'builtin-downgrade' })
      await expectCode(svc.install(older, { source: 'import', resolution: 'overwrite' }), 'E_BUILTIN_DOWNGRADE')
      await expectCode(svc.install(rec(svc, makePack({ version: '1.0.0' })), { source: 'download' }), 'E_BUILTIN_DOWNGRADE')
      const sameName = rec(svc, makePack({ id: 'other', version: '1.0.0' }))
      expect(await svc.plan(sameName)).toMatchObject({ action: 'name-conflict', canReplace: false })
      await expectCode(svc.install(sameName, { source: 'import', resolution: 'replace' }), 'E_BUILTIN_PROTECTED')
    })
  })
})
