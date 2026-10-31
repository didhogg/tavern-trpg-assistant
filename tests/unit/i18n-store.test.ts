import { describe, expect, it } from 'vitest'
import { PackService } from '../../src/core/packs/installer'
import { buildPackFile } from '../../src/core/packs/file'
import type { Entry } from '../../src/schemas/pack'
import { makeClock, makePack, makeRegistry, withDb } from '../helpers/fixtures'

describe('R15 英文对照入库', () => {
  it('安装带 i18n 的包后，条目里仍有 i18n', async () => {
    await withDb(async (db) => {
      const svc = new PackService(db, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0' })
      const entry = { id: 'fireball', type: 'spell', name: '火球术', keywords: [], unique: false, summary: '', data: {}, i18n: { en: { name: 'Fireball', fields: { text: [{ p: 'A bright streak flashes.' }] } } } } as unknown as Entry
      const bytes = makePack({ id: 'i18n-pack', category: 'rules', name: '测试包' }, [entry])
      void buildPackFile
      const rec = svc.recognize(bytes)
      if (rec.type !== 'pack') throw new Error('不是内容包')
      await svc.install(rec, { source: 'import' })
      const stored = await db.entries.where('packId').equals('i18n-pack').toArray()
      expect(stored).toHaveLength(1)
      expect((stored[0] as unknown as { i18n?: { en: { name: string } } }).i18n?.en.name).toBe('Fireball')
    })
  })
})
