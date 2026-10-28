import { describe, expect, it } from 'vitest'
import { TrpgError } from '../../src/core/errors'
import { hashValue, stableStringify } from '../../src/core/hash'
import { batchLabel, ownerFromHost, uuid } from '../../src/core/ids'
import { migrateRecord } from '../../src/core/migrate'
import { compareVersions } from '../../src/core/semver'

describe('semver', () => {
  it('比较版本', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
    expect(compareVersions('1.10.0', '1.9.9')).toBe(1)
    expect(compareVersions('2.0.0', '2.0.0')).toBe(0)
  })
})

describe('hash', () => {
  it('键顺序不同、内容相同则哈希相同', () => {
    expect(hashValue({ a: 1, b: [1, { c: 2, d: 3 }] })).toBe(hashValue({ b: [1, { d: 3, c: 2 }], a: 1 }))
  })
  it('忽略 undefined 键，内容不同则哈希不同', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}')
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 2 }))
  })
})

describe('ids', () => {
  it('uuid 格式正确且不重复', () => {
    const a = uuid()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(uuid()).not.toBe(a)
  })
  it('批内编号 A…Z、AA、AB', () => {
    expect([0, 1, 25, 26, 27, 51, 52].map(batchLabel)).toEqual(['A', 'B', 'Z', 'AA', 'AB', 'AZ', 'BA'])
  })
  it('角色卡用头像文件名，群组用群组 id，无聊天为 null', () => {
    const characters = [{ name: 'COC跑团', avatar: 'COC跑团.png' }]
    expect(ownerFromHost({ characterId: '0', characters })).toEqual({ ownerKey: 'char:COC跑团.png', ownerLabel: 'COC跑团' })
    expect(ownerFromHost({ groupId: 'g1', groups: [{ id: 'g1', name: '冒险队' }] })).toEqual({ ownerKey: 'group:g1', ownerLabel: '冒险队' })
    expect(ownerFromHost({})).toBeNull()
  })
})

describe('migrate', () => {
  it('逐级升级到当前版本', () => {
    const out = migrateRecord('save', { schemaVersion: 0, name: 'x' }, { current: 2, migrations: { 0: (r) => ({ ...r, note: '' }), 1: (r) => ({ ...r, extra: true }) } })
    expect(out).toMatchObject({ schemaVersion: 2, note: '', extra: true })
  })
  it('版本高于当前时拒绝并给出提示', () => {
    try {
      migrateRecord('save', { schemaVersion: 9 })
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(TrpgError)
      expect((e as TrpgError).code).toBe('E_NEWER_DATA')
      expect((e as TrpgError).message).toBe('这个存档由更新版本的扩展创建，请先更新扩展')
    }
  })
  it('缺少迁移步骤或版本号无效时报错', () => {
    expect(() => migrateRecord('save', { schemaVersion: 0 }, { current: 1, migrations: {} })).toThrow(/无法升级/)
    expect(() => migrateRecord('save', {})).toThrow(/版本号/)
  })
})

describe('M2 枚举与内置包', () => {
  it('autoReason 含「改动模组前」；source 含 user', async () => {
    const { autoReasonSchema } = await import('../../src/schemas/campaign')
    const { packSourceSchema } = await import('../../src/schemas/pack')
    expect(autoReasonSchema.options).toContain('改动模组前')
    expect(packSourceSchema.options).toContain('user')
  })
  it('D&D 5e（2014）的核心包与内置包都是 SRD', async () => {
    const { dnd5e2014 } = await import('../../src/rules/dnd5e2014')
    expect(dnd5e2014.corePackIds).toEqual(['dnd5e2014-srd'])
    expect(dnd5e2014.builtinPacks).toEqual(['dnd5e2014-srd'])
  })
})
