import { describe, expect, it } from 'vitest'
import { migrateRecord, migratePersonEffect } from '../../src/core/migrate'
import { personEffectSchema } from '../../src/schemas/people'
import { SCHEMA_VERSIONS } from '../../src/schemas/common'

const oldEffect = { name: '祝福术', ref: 'spell.bless.phb', duration: '1 分钟（专注）', note: '队友' }

describe('U5R 人物效果结构化迁移', () => {
  it('旧文字效果 → 新结构：类别由 ref 前缀推断，时长文字进 note', () => {
    const out = migratePersonEffect(oldEffect, 0) as Record<string, unknown>
    expect(out).toMatchObject({ category: 'spell', name: '祝福术', ref: 'spell.bless.phb', concentration: false })
    expect(String(out.note)).toContain('1 分钟')
    expect(personEffectSchema.safeParse(out).success).toBe(true)
  })
  it('推不出类别的归「其他」；已是新结构的原样不动', () => {
    expect((migratePersonEffect({ name: '自定义' }, 2) as Record<string, unknown>).category).toBe('other')
    const fresh = { id: 'a', category: 'condition', name: '目盲', concentration: false, addedAt: 5 }
    expect(migratePersonEffect(fresh, 0)).toBe(fresh)
  })
  it('workspace v2 / save v2 升到当前版本，其余键不动', () => {
    const data = { instances: [1], people: [{ id: 'p', name: 'x', effects: [oldEffect] }] }
    const ws = migrateRecord('workspace', { schemaVersion: 2, data })
    expect(ws.schemaVersion).toBe(SCHEMA_VERSIONS.workspace)
    const wsData = ws.data as typeof data & { people: Array<{ effects: Array<Record<string, unknown>> }> }
    expect(wsData.instances).toEqual([1])
    expect(wsData.people[0]!.effects[0]).toMatchObject({ category: 'spell', name: '祝福术' })
    const sv = migrateRecord('save', { schemaVersion: 2, snapshot: data })
    expect(sv.schemaVersion).toBe(SCHEMA_VERSIONS.save)
  })
  it('旧版（v1）一路升到当前，people 没有 effects 也不报错', () => {
    const out = migrateRecord('workspace', { schemaVersion: 1, data: { instances: [] } })
    expect(out.schemaVersion).toBe(SCHEMA_VERSIONS.workspace)
  })
  it('高版本拒绝', () => {
    expect(() => migrateRecord('workspace', { schemaVersion: SCHEMA_VERSIONS.workspace + 1, data: {} })).toThrow('更新版本')
  })
})
