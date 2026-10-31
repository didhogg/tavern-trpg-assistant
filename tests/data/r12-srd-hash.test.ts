import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const EXPECTED = 'a61ff6279ba94380c60c46455472e2a85c6535db777962945f4552088ca0ce49'

describe('R12 SRD 包文件', () => {
  it('构建后的 SRD 包哈希与构建前相同', () => {
    const bytes = readFileSync(join(process.cwd(), 'packs', 'dnd5e2014-srd.trpgpack'))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(EXPECTED)
  })
})
