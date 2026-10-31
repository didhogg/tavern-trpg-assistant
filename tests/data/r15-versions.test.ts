import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { SUPPORTED_DATA_VERSION } from '../../src/schemas/common'
import { BOOKS, SRD_PACK_ID, SRD_VERSION } from '../../tools/data/config/books'
import { DATA_REPO, packPath } from './r9-pack-helpers'

describe('R15 版本', () => {
  it('SUPPORTED_DATA_VERSION 为 3；11 个包都是 1.2.1（S1 起，包内容变了就升版本，设备上已装的才会更新），清单 dataVersion 为 3', () => {
    expect(SUPPORTED_DATA_VERSION).toBe(3)
    expect(SRD_VERSION).toBe('1.2.1')
    for (const book of BOOKS) expect(book.version, book.packId).toBe('1.2.1')
    for (const id of [SRD_PACK_ID, ...BOOKS.map((b) => b.packId)]) {
      const files = unzipSync(new Uint8Array(readFileSync(packPath(id))))
      const manifest = JSON.parse(strFromU8(files['trpg-manifest.json'])) as { pack: { dataVersion: number; version: string } }
      expect(manifest.pack.dataVersion, id).toBe(3)
      expect(manifest.pack.version, id).toBe('1.2.1')
    }
  })

  it('目录与数据仓库里每个书包只有当前版本的文件', () => {
    const catalog = JSON.parse(readFileSync(join(DATA_REPO, 'catalog.json'), 'utf8')) as { packs: Array<{ id: string; version: string }> }
    expect(catalog.packs.every((p) => p.version === '1.2.1')).toBe(true)
  })
})
