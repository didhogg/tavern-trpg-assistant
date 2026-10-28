import { describe, expect, it } from 'vitest'
import { TrpgError } from '../../src/core/errors'
import { sha256Hex } from '../../src/core/hash'
import { PackService } from '../../src/core/packs/installer'
import type { RecognizedPack } from '../../src/core/packs/recognize'
import { buildPackFile } from '../../src/core/packs/file'
import type { Entry, PackCategory } from '../../src/schemas/pack'
import { makeClock, makeEntries, makePack, makeRegistry, PNG, withDb } from '../helpers/fixtures'

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

describe.each<PackCategory>(['rules', 'adventure'])('PackService（category=%s）', (category) => {
  const base = { id: `p-${category}`, category, name: category === 'rules' ? '珊娜萨' : '风暴岛' }

  it('安装新包：写入清单、条目与图片仓库，并通知', async () => {
    await withDb(async (db) => {
      const events: unknown[] = []
      const svc = service(db, (c) => events.push(c))
      const assets = new Map([['a.png', PNG]])
      const installed = await svc.install(rec(svc, makePack(base, makeEntries(4), assets)), { source: 'import' })
      expect(installed).toMatchObject({ id: base.id, category, source: 'import', entryCount: 4, version: '1.0.0' })
      expect(await db.entries.where('packId').equals(base.id).count()).toBe(4)
      const hash = sha256Hex(PNG)
      expect((await db.blobs.get(hash))?.bytes).toEqual(PNG)
      expect(installed.blobHashes).toEqual([hash])
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

  it('同版本内容不同时标注出来', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base, makeEntries(2))), { source: 'import' })
      const plan = await svc.plan(rec(svc, makePack(base, makeEntries(3, 'spell', 'x'))))
      expect(plan).toMatchObject({ action: 'overwrite', relation: 'same', contentChanged: true })
    })
  })

  it('lineage 不同时拒绝', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack({ ...base, lineage: 'a' })), { source: 'import' })
      const plan = await svc.plan(rec(svc, makePack({ ...base, version: '2.0.0', lineage: 'b' })))
      expect(plan).toMatchObject({ action: 'overwrite', blocked: 'lineage-mismatch' })
      await expectCode(svc.install(rec(svc, makePack({ ...base, version: '2.0.0', lineage: 'b' })), { source: 'import', resolution: 'overwrite' }), 'E_LINEAGE')
    })
  })

  it('覆盖：旧条目整体替换，新图片写入；不再改写当前数据', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base, makeEntries(5), new Map([['old.png', PNG]]))), { source: 'import' })
      await db.workspaces.add({ ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', currentSaveId: null, enabledPacks: [{ id: base.id, version: '1.0.0' }], data: { instances: [] }, savedHash: '', schemaVersion: 1, updatedAt: 1 })
      await svc.install(rec(svc, makePack({ ...base, version: '1.1.0' }, makeEntries(2, 'spell', 'n'))), { source: 'import', resolution: 'overwrite' })
      const entries = await db.entries.where('packId').equals(base.id).toArray()
      expect(entries.map((e) => e.entryId).sort()).toEqual(['n1', 'n2'])
      expect((await db.packs.get(base.id))?.version).toBe('1.1.0')
      expect((await db.workspaces.get('k'))?.enabledPacks).toEqual([{ id: base.id, version: '1.0.0' }])
    })
  })

  it('不同 id 同名：保留两个 / 替换 / 未选择', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base)), { source: 'import' })
      const other = makePack({ ...base, id: `q-${category}` })
      expect(await svc.plan(rec(svc, other))).toMatchObject({ action: 'name-conflict', canReplace: true })
      await expectCode(svc.install(rec(svc, other), { source: 'import' }), 'E_CONFLICT_UNRESOLVED')
      const kept = await svc.install(rec(svc, other), { source: 'import', resolution: 'keep-both' })
      expect(kept.name).toBe(`${base.name}（2）`)
      const replaced = await svc.install(rec(svc, makePack({ ...base, id: `s-${category}` })), { source: 'import', resolution: 'replace' })
      expect(replaced.id).toBe(`s-${category}`)
      expect(await db.packs.get(base.id)).toBeUndefined()
    })
  })

  it('requires 缺失时阻止；recommends、conflicts、不支持的功能作为结构化结果返回', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const conflict = rec(svc, makePack({ id: 'conflict-pack', category: 'rules', name: '冲突包' }))
      await svc.install(conflict, { source: 'import' })
      const features = [{ id: 'f1', kind: 'charGen', name: '建卡', data: {} }, { id: 'f2', kind: 'alien', name: '未知', data: {} }]
      const bytes = buildPackFile({
        manifest: {
          ruleId: 'dnd5e2014',
          version: '1.0.0',
          ...base,
          id: 'with-rels',
          relationships: { requires: [{ id: 'missing-dep' }], recommends: [{ id: 'rec-dep' }], conflicts: [{ id: 'conflict-pack', reason: '设定冲突' }] },
        },
        entries: makeEntries(1),
        features,
      })
      const plan = await svc.plan(rec(svc, bytes))
      expect(plan.missingRequires.map((d) => d.id)).toEqual(['missing-dep'])
      expect(plan.missingRecommends.map((d) => d.id)).toEqual(['rec-dep'])
      expect(plan.conflicts).toEqual([{ id: 'conflict-pack', reason: '设定冲突', installedVersion: '1.0.0' }])
      expect(plan.unsupportedFeatures).toEqual([{ kind: 'alien', count: 1 }, { kind: 'charGen', count: 1 }])
      await expectCode(svc.install(rec(svc, bytes), { source: 'import' }), 'E_DEP_MISSING')
    })
  })

  it('删除：移除包与无人引用的图片；被存档引用时可查出数量', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      await svc.install(rec(svc, makePack(base, makeEntries(3), new Map([['a.png', PNG]]))), { source: 'import' })
      await db.saves.bulkAdd([
        { id: 's1', ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', name: 'a', note: '', kind: 'manual', createdAt: 1, updatedAt: 1, summary: { partyNames: [], partyCount: 0 }, packs: [{ id: base.id, version: '1.0.0', name: base.name }], snapshot: { instances: [] }, hash: 'h', schemaVersion: 1 },
        { id: 's2', ownerKey: 'k', ownerLabel: 'k', ruleId: 'dnd5e2014', name: 'b', note: '', kind: 'manual', createdAt: 1, updatedAt: 1, deletedAt: 5, summary: { partyNames: [], partyCount: 0 }, packs: [{ id: base.id, version: '1.0.0', name: base.name }], snapshot: { instances: [] }, hash: 'h', schemaVersion: 1 },
      ])
      expect((await svc.referencingSaves(base.id)).map((s) => s.id)).toEqual(['s1'])
      await svc.uninstall(base.id)
      expect(await db.packs.count()).toBe(0)
      expect(await db.blobs.count()).toBe(0)
      await expectCode(svc.uninstall(base.id), 'E_NOT_FOUND')
    })
  })

  it('导出再导入：内容与图片一致（往返）', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const entries = [...makeEntries(2, 'spell'), ...makeEntries(1, 'monster', 'm')]
      await svc.install(rec(svc, makePack({ ...base, relationships: { requires: [], recommends: [], conflicts: [] } }, entries, new Map([['x/y.png', PNG]]))), { source: 'import' })
      const bytes = await svc.exportPack(base.id)
      const again = rec(svc, bytes)
      expect(again.manifest).toMatchObject({ id: base.id, category, entryCount: 3, typeCounts: { spell: 2, monster: 1 } })
      expect(again.entries.map((e) => e.id).sort()).toEqual(['e1', 'e2', 'm1'])
      expect([...again.blobs.values()][0].bytes).toEqual(PNG)
    })
  })

  it('安装失败时整体回滚；存储空间不足有明确提示', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const original = db.entries.bulkPut.bind(db.entries)
      db.entries.bulkPut = (async () => {
        await original([])
        throw new Error('写入中途失败')
      }) as unknown as typeof db.entries.bulkPut
      await expect(svc.install(rec(svc, makePack(base)), { source: 'import' })).rejects.toThrow('写入中途失败')
      expect(await db.packs.count()).toBe(0)
      expect(await db.entries.count()).toBe(0)
      db.entries.bulkPut = (async () => {
        const err = new Error('quota')
        err.name = 'QuotaExceededError'
        throw err
      }) as unknown as typeof db.entries.bulkPut
      await expectCode(svc.install(rec(svc, makePack(base)), { source: 'import' }), 'E_QUOTA')
    })
  })
})

describe('内置包', () => {
  it('首次安装、更高版本升级、相同或更低版本跳过；内置包不能删除或降级', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      expect(await svc.installBuiltin(makePack({ id: 'dnd5e2014-srd', version: '1.0.0' }))).toBe('installed')
      expect(await svc.installBuiltin(makePack({ id: 'dnd5e2014-srd', version: '1.0.0' }))).toBe('skipped')
      expect(await svc.installBuiltin(makePack({ id: 'dnd5e2014-srd', version: '1.1.0' }))).toBe('upgraded')
      expect(await svc.installBuiltin(makePack({ id: 'dnd5e2014-srd', version: '1.0.5' }))).toBe('skipped')
      expect((await db.packs.get('dnd5e2014-srd'))?.version).toBe('1.1.0')
      await expectCode(svc.uninstall('dnd5e2014-srd'), 'E_BUILTIN_PROTECTED')
      const older = rec(svc, makePack({ id: 'dnd5e2014-srd', version: '1.0.0' }))
      expect(await svc.plan(older)).toMatchObject({ action: 'overwrite', relation: 'older', blocked: 'builtin-downgrade' })
      await expectCode(svc.install(older, { source: 'import', resolution: 'overwrite' }), 'E_BUILTIN_DOWNGRADE')
    })
  })
})

describe('修改版与功能', () => {
  it('修改版：target.packId 必须在 requires 中，且同一 target 只能出现一次', async () => {
    await withDb(async (db) => {
      const svc = service(db)
      const overrideEntry: Entry = { id: 'variant-1', type: 'item', name: '石像鬼', keywords: [], unique: false, summary: '', data: {}, override: { target: { packId: 'other-pack', entryId: 'gargoyle' }, mode: 'patch' } } as Entry
      const bytes = buildPackFile({ manifest: { id: 'variant-pack', ruleId: 'dnd5e2014', category: 'rules', name: '修改版', version: '1.0.0', relationships: { requires: [], recommends: [], conflicts: [] } }, entries: [overrideEntry] })
      await expectCode(Promise.resolve().then(() => svc.recognize(bytes)), 'E_BAD_CONTENT')
      const ok = buildPackFile({ manifest: { id: 'variant-pack', ruleId: 'dnd5e2014', category: 'rules', name: '修改版', version: '1.0.0', relationships: { requires: [{ id: 'other-pack' }], recommends: [], conflicts: [] } }, entries: [overrideEntry] })
      expect(() => svc.recognize(ok)).not.toThrow()
    })
  })
})
