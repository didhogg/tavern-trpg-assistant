import { describe, expect, it } from 'vitest'
import { checkReferences } from '../../tools/data/validate/refs'
import type { ConvertedPack } from '../../tools/data/convert'

const pack = (data: Record<string, unknown>): ConvertedPack => ({ manifest: { id: 'dnd5e2014-srd' }, entries: [{ id: 'item.test', type: 'item', name: 'Test', nameEn: 'Test', summary: '', keywords: [], unique: false, data }], features: [] } as unknown as ConvertedPack)

describe('RW22 引用完整性变异确认', () => {
  it('不存在的 variantOf 会被报出', async () => {
    const r = await checkReferences([pack({ variantOf: 'item.missing' })])
    expect(r.dangling).toContainEqual(expect.objectContaining({ field: 'variantOf', value: 'item.missing' }))
  })
  it('不存在的 members[] 会被报出', async () => {
    const r = await checkReferences([pack({ members: ['item.missing'] })])
    expect(r.dangling).toContainEqual(expect.objectContaining({ field: 'members[]', value: 'item.missing' }))
  })
})
