import { describe, expect, it } from 'vitest'
import { createServices } from '../../src/core/services'
import { sha256Hex } from '../../src/core/hash'
import { exportSaves } from '../../src/core/transfer/exporter'
import { importSaves } from '../../src/core/transfer/importer'
import type { RecognizedSaveFile } from '../../src/core/packs/recognize'
import { writeZip } from '../../src/core/packs/zip'
import { PNG } from '../helpers/fixtures'
import { uuid } from '../../src/core/ids'

function save(id: string, hash?: string) {
  return {
    id,
    ownerKey: 'char:a.png',
    ownerLabel: '甲',
    ruleId: 'dnd5e2014',
    name: '带图存档',
    note: '',
    kind: 'manual' as const,
    createdAt: 1,
    updatedAt: 2,
    summary: { partyNames: [], partyCount: 0 },
    packs: [],
    snapshot: { instances: [], ...(hash ? { portrait: { $asset: hash } } : {}) },
    hash: 'h',
    schemaVersion: 1,
  }
}

describe('.trpgsave 带图片', () => {
  it('导出写入 blobs/<sha256>；导入恢复到图片仓库', async () => {
    const from = createServices({ dbName: `save-from-${uuid()}`, appVersion: '99.0.0' })
    const to = createServices({ dbName: `save-to-${uuid()}`, appVersion: '99.0.0' })
    try {
      const hash = sha256Hex(PNG)
      await from.db.blobs.put({ hash, bytes: PNG, mime: 'image/png', size: PNG.length, createdAt: 1 })
      await from.db.saves.put(save('s1', hash))
      const { bytes } = await exportSaves({ db: from.db, packs: from.packs, now: from.now, appVersion: '99.0.0' }, { type: 'save', saveId: 's1' }, { includePacks: false })
      const rec = from.packs.recognize(bytes) as RecognizedSaveFile
      expect(rec.type).toBe('save')
      expect(rec.blobs.get(hash)).toEqual(PNG)
      const result = await importSaves({ db: to.db, campaign: to.campaign, now: to.now, hasRule: (id) => to.rules.has(id) }, rec, { owner: { ownerKey: 'char:b.png', ownerLabel: '乙' }, selectedIds: ['s1'] })
      expect(result.imported).toBe(1)
      expect((await to.db.blobs.get(hash))?.bytes).toEqual(PNG)
    } finally {
      from.db.close()
      to.db.close()
      await from.db.delete()
      await to.db.delete()
    }
  })

  it('图片哈希不符时拒绝；缺少图片不阻止导入', async () => {
    const from = createServices({ dbName: `save-bad-${uuid()}`, appVersion: '99.0.0' })
    try {
      const hash = sha256Hex(PNG)
      await from.db.saves.put(save('s1', hash))
      const { bytes } = await exportSaves({ db: from.db, packs: from.packs, now: from.now, appVersion: '99.0.0' }, { type: 'save', saveId: 's1' }, { includePacks: false })
      const rec = from.packs.recognize(bytes) as RecognizedSaveFile
      expect(rec.blobs.size).toBe(0)
      const files: Record<string, Uint8Array | string> = {}
      const raw = bytes
      const { unzipSync } = await import('fflate')
      const unzipped = unzipSync(raw)
      for (const [name, data] of Object.entries(unzipped)) files[name] = data
      files[`blobs/${hash}`] = new Uint8Array([1, 2, 3])
      expect(() => from.packs.recognize(writeZip(files))).toThrow('哈希不一致')
    } finally {
      from.db.close()
      await from.db.delete()
    }
  })
})
