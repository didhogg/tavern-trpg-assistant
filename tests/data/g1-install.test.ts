import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { PackService } from '../../src/core/packs/installer'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { makeRegistry } from '../helpers/fixtures'
import { packPath } from './r9-pack-helpers'

/** G1：官方的 11 个包用同一个安装校验（引用存在、方向向下、joins 合规）能按依赖顺序全部装上；缺依赖的先装本包会被拒绝。 */
describe('G1 官方包通过安装校验', () => {
  it('按层级顺序安装 SRD 与 10 本书：全部成功，joins 与引用校验没有拒绝任何一个', async () => {
    const db = new TrpgDatabase(`g1-${uuid()}`)
    const svc = new PackService(db, { rules: makeRegistry(), now: () => 1, appVersion: '99.0.0' })
    try {
      for (const id of [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)]) {
        const rec = svc.recognize(new Uint8Array(readFileSync(packPath(id))))
        if (rec.type !== 'pack') throw new Error(`${id} 应为内容包`)
        await expect(svc.install(rec, { source: id === SRD_PACK_ID ? 'builtin' : 'download' }), id).resolves.toMatchObject({ id })
      }
      expect((await svc.list()).length).toBe(1 + BOOKS.length)
      // 塔莎自己登记的可选特性：在数据库里能按 joins 反查到牧师
      const tce = await db.entries.get(['dnd5e2014-tce', 'feature.cleric-channel-divinity-harness-divine-power.tce'])
      expect((tce!.data.joins as Array<Record<string, unknown>>)[0]).toMatchObject({ to: 'class.cleric.phb', level: 2, as: 'optional' })
    } finally { db.close(); await db.delete() }
  }, 180_000)

  it('塔莎依赖没装就装塔莎：被拒绝并说明缺哪些包', async () => {
    const db = new TrpgDatabase(`g1-${uuid()}`)
    const svc = new PackService(db, { rules: makeRegistry(), now: () => 1, appVersion: '99.0.0' })
    try {
      const rec = svc.recognize(new Uint8Array(readFileSync(packPath('dnd5e2014-tce'))))
      if (rec.type !== 'pack') throw new Error('应为内容包')
      await expect(svc.install(rec, { source: 'download' })).rejects.toMatchObject({ code: 'E_DEP_MISSING' })
    } finally { db.close(); await db.delete() }
  })
})
