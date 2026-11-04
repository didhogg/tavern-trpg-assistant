import { describe, expect, it } from 'vitest'
import { migrateRecord } from '../../src/core/migrate'
import { SCHEMA_VERSIONS } from '../../src/schemas/common'
import { workspaceDataSchema } from '../../src/schemas/campaign'

describe('U6 数据迁移', () => {
  it('workspace 1→2 只补 people/tags/party，其余键不变；新数据允许缺失三键', () => {
    const old = { schemaVersion: 1, ownerKey: 'x', data: { instances: [], gold: 7 } }
    const next = migrateRecord('workspace', old)
    expect(next.schemaVersion).toBe(SCHEMA_VERSIONS.workspace)
    expect(next.data).toEqual({ instances: [], gold: 7, people: [], tags: [], party: { name: '' } })
    expect(workspaceDataSchema.parse({ instances: [] })).toMatchObject({ instances: [] })
  })
  it('save 1→2 给快照补三键，其余内容不变', () => {
    const old = { schemaVersion: 1, snapshot: { instances: [], note: '旧' } }
    const next = migrateRecord('save', old)
    expect(next.schemaVersion).toBe(SCHEMA_VERSIONS.save)
    expect(next.snapshot).toEqual({ instances: [], note: '旧', people: [], tags: [], party: { name: '' } })
  })
  it('高版本拒绝', () => {
    expect(() => migrateRecord('workspace', { schemaVersion: SCHEMA_VERSIONS.workspace + 1, data: {} })).toThrow('更新版本')
    expect(() => migrateRecord('save', { schemaVersion: SCHEMA_VERSIONS.save + 1, snapshot: {} })).toThrow('更新版本')
  })
})
