import { describe, expect, it } from 'vitest'
import { autoInstallRecommended, getBuiltinRemoved, installBuiltinPacks, setBuiltinRemoved, setUserRemoved } from '../../src/core/packs/builtins'
import { PackService } from '../../src/core/packs/installer'
import type { Catalog, CatalogPack } from '../../src/schemas/pack'
import { makeClock, makeEntries, makePack, makeRegistry, withDb } from '../helpers/fixtures'
import { sha256Hex } from '../../src/core/hash'

function catalogPack(id: string, bytes: Uint8Array, recommended = true): CatalogPack {
  return {
    id,
    ruleId: 'dnd5e2014',
    category: 'rules',
    name: id,
    version: '1.0.0',
    license: '',
    description: '',
    typeCounts: {},
    contributes: {},
    relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] },
    byteSize: bytes.length,
    sha256: sha256Hex(bytes),
    url: `${id}.trpgpack`,
    recommended,
  }
}

function catalog(packs: CatalogPack[]): Catalog {
  return { formatVersion: 1, rules: [], packs }
}

function service(db: Parameters<Parameters<typeof withDb>[0]>[0]): PackService {
  return new PackService(db, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0' })
}

describe('内置包', () => {
  it('启动安装跳过 builtinRemoved；恢复后重新安装', async () => {
    await withDb(async (db) => {
      const packs = service(db)
      const srd = makePack({ id: 'dnd5e2014-srd' }, makeEntries(2))
      await setBuiltinRemoved(db, 'dnd5e2014-srd', true)
      const skipped = await installBuiltinPacks(db, packs, makeRegistry().get('dnd5e2014')!, async () => srd)
      expect(skipped).toMatchObject({ installed: [], removed: ['dnd5e2014-srd'] })
      expect(await db.packs.count()).toBe(0)
      await setBuiltinRemoved(db, 'dnd5e2014-srd', false)
      const installed = await installBuiltinPacks(db, packs, makeRegistry().get('dnd5e2014')!, async () => srd)
      expect(installed.installed).toEqual(['dnd5e2014-srd'])
      expect(await getBuiltinRemoved(db)).toEqual([])
    })
  })
})

describe('推荐包自动安装', () => {
  it('全部成功后标记完成，第二次跳过', async () => {
    await withDb(async (db) => {
      const packs = service(db)
      await packs.installBuiltin(makePack({ id: 'dnd5e2014-srd' }, makeEntries(1)))
      const phb = makePack({ id: 'dnd5e2014-phb', name: 'PHB' }, makeEntries(2))
      const cat = catalog([catalogPack('dnd5e2014-phb', phb)])
      const first = await autoInstallRecommended({ db, packs, catalog: cat, ruleId: 'dnd5e2014', fetchBytes: async () => phb })
      expect(first).toMatchObject({ status: 'done', installed: ['dnd5e2014-phb'] })
      expect(await packs.list()).toHaveLength(2)
      const second = await autoInstallRecommended({ db, packs, catalog: cat, ruleId: 'dnd5e2014', fetchBytes: async () => phb })
      expect(second.status).toBe('skipped')
    })
  })

  it('跳过 userRemoved；不会把 builtinRemoved 里的包自动装回', async () => {
    await withDb(async (db) => {
      const packs = service(db)
      await setUserRemoved(db, 'dnd5e2014-xge', true)
      await setBuiltinRemoved(db, 'dnd5e2014-tce', true)
      const xge = makePack({ id: 'dnd5e2014-xge', name: 'XGE' }, makeEntries(1))
      const tce = makePack({ id: 'dnd5e2014-tce', name: 'TCE' }, makeEntries(1))
      const cat = catalog([catalogPack('dnd5e2014-xge', xge), catalogPack('dnd5e2014-tce', tce)])
      const result = await autoInstallRecommended({ db, packs, catalog: cat, ruleId: 'dnd5e2014', fetchBytes: async () => xge })
      expect(result).toMatchObject({ status: 'done', installed: [], skippedUserRemoved: ['dnd5e2014-xge'], skippedBuiltinRemoved: ['dnd5e2014-tce'] })
      expect(await packs.list()).toHaveLength(0)
    })
  })

  it('部分失败时保留未完成状态，下次仍会重试', async () => {
    await withDb(async (db) => {
      const packs = service(db)
      const ok = makePack({ id: 'dnd5e2014-phb', name: 'PHB' }, makeEntries(1))
      const bad = makePack({ id: 'dnd5e2014-dmg', name: 'DMG' }, makeEntries(1))
      const cat = catalog([catalogPack('dnd5e2014-phb', ok), catalogPack('dnd5e2014-dmg', bad)])
      const first = await autoInstallRecommended({
        db,
        packs,
        catalog: cat,
        ruleId: 'dnd5e2014',
        fetchBytes: async (pack) => {
          if (pack.id === 'dnd5e2014-dmg') throw new Error('下载失败：网络中断')
          return ok
        },
      })
      expect(first.status).toBe('partial')
      expect(first.installed).toEqual(['dnd5e2014-phb'])
      expect(first.failed.map((f) => f.id)).toEqual(['dnd5e2014-dmg'])
      expect((await db.getMeta<Record<string, { done: boolean }>>('autoInstall'))?.['dnd5e2014'].done).toBe(false)
      const second = await autoInstallRecommended({ db, packs, catalog: cat, ruleId: 'dnd5e2014', fetchBytes: async () => bad })
      expect(second.status).toBe('done')
      expect(second.installed).toEqual(['dnd5e2014-dmg'])
      expect((await db.getMeta<Record<string, { done: boolean }>>('autoInstall'))?.['dnd5e2014'].done).toBe(true)
    })
  })
})
