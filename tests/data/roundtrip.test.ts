import { describe, expect, it } from 'vitest'
import { createServices } from '../../src/core/services'
import { sha256Hex } from '../../src/core/hash'
import { exportSaves } from '../../src/core/transfer/exporter'
import { importSaves } from '../../src/core/transfer/importer'
import type { RecognizedPack, RecognizedSaveFile } from '../../src/core/packs/recognize'
import { featureSupport } from '../../src/rules/dnd5e2014/data/features'
import { DND5E2014_ENTRY_TYPES } from '../../src/rules/dnd5e2014/data/entries'
import { uuid } from '../../src/core/ids'
import { buildFixtureAdventurePack, buildFixtureBasePack, buildFixtureDataPack, fixtureBlob } from './fixtures'
import { makeEntries, makePack } from '../helpers/fixtures'

const OWNER = { ownerKey: 'char:fixture.png', ownerLabel: '夹具角色' }

async function services(name: string) {
  const s = createServices({ dbName: `${name}-${uuid()}`, appVersion: '99.0.0' })
  return s
}

async function installFixturePacks(s: Awaited<ReturnType<typeof services>>) {
  for (const bytes of [makePack({ id: 'dnd5e2014-srd' }, makeEntries(1)), buildFixtureBasePack(), buildFixtureDataPack(), buildFixtureAdventurePack()]) {
    const rec = s.packs.recognize(bytes)
    if (rec.type !== 'pack') throw new Error('夹具不是内容包')
    await s.packs.install(rec, { source: 'import' })
  }
}

async function recognizePack(s: Awaited<ReturnType<typeof services>>, bytes: Uint8Array): Promise<RecognizedPack> {
  const rec = s.packs.recognize(bytes)
  if (rec.type !== 'pack') throw new Error('不是内容包')
  return rec
}

describe('D1 §8 往返验证', () => {
  it('各类型条目：装入后查得到，字段完整；生成副本进入存档；导出再装逐字节一致', async () => {
    const a = await services('rt-entries-a')
    const b = await services('rt-entries-b')
    try {
      await installFixturePacks(a)
      for (const type of DND5E2014_ENTRY_TYPES) {
        const rows = await a.db.entries.where('packId').equals('fixture-data').and((e) => e.type === type).toArray()
        expect(rows.length, type).toBeGreaterThan(0)
        expect(rows[0].data.src).toBeDefined()
        expect(rows[0].data.credit).toBeDefined()
      }
      await a.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: ['fixture-base', 'fixture-data', 'fixture-adventure'], name: '夹具存档' })
      const made = await a.campaign.materialize(OWNER.ownerKey, { packId: 'fixture-data', entryId: 'spell.fireball.test' })
      expect(made.created).toBe(true)
      const saved = await a.campaign.saveCurrent(OWNER.ownerKey)
      expect(saved.changed).toBe(true)
      const original = buildFixtureDataPack()
      const exported = await a.packs.exportPack('fixture-data')
      expect(sha256Hex(exported)).toBe(sha256Hex(original))
      await installFixturePacks(b)
      const again = await recognizePack(b, exported)
      expect(again.entries.length).toBe((await a.db.entries.where('packId').equals('fixture-data').count()))
      expect(await b.packs.exportPack('fixture-data')).toEqual(exported)
    } finally {
      a.db.close(); b.db.close(); await a.db.delete(); await b.db.delete()
    }
  })

  it('随机表：读出 rows 与 then 引用，能找到被引用的表', async () => {
    const s = await services('rt-table')
    try {
      await installFixturePacks(s)
      const table = await s.db.entries.get(['fixture-data', 'table.loot-a.test'])
      const rows = table?.data.rows as Array<{ then?: { table: string } }>
      const target = rows.find((r) => r.then)?.then?.table
      expect(target).toBe('table.loot-b.test')
      expect(await s.db.entries.get(['fixture-data', target!])).toBeDefined()
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('修改版：作为带 override 的条目装入，能按 target 找到原条目', async () => {
    const s = await services('rt-variant')
    try {
      await installFixturePacks(s)
      const variant = await s.db.entries.get(['fixture-data', 'item.variant-gargoyle.test'])
      expect(variant?.override).toMatchObject({ target: { packId: 'fixture-base', entryId: 'item.base-gargoyle.test' }, mode: 'patch' })
      expect(await s.db.entries.get(['fixture-base', 'item.base-gargoyle.test'])).toBeDefined()
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('规则选项与 AI 基调：功能定义装入，读出定义与默认值', async () => {
    const s = await services('rt-features')
    try {
      await installFixturePacks(s)
      const pack = await s.db.packs.get('fixture-data')
      const rule = (pack?.content.features as Array<{ kind: string; defaultEnabled: boolean; data: { id: string } }>).find((f) => f.kind === 'ruleOptions')!
      expect(rule.defaultEnabled).toBe(true)
      expect(rule.data.id).toBe('test-option')
      const note = (pack?.content.features as Array<{ kind: string; data: { text: string } }>).find((f) => f.kind === 'aiNotes')!
      expect(note.data.text).toBe('这是一个测试基调。')
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('不认识的功能种类：照常装入，标记为暂不支持，导出原样写回', async () => {
    const s = await services('rt-unknown')
    try {
      await installFixturePacks(s)
      const pack = await s.db.packs.get('fixture-data')
      const unknown = (pack?.content.features as Array<{ kind: string }>).find((f) => f.kind === 'futureKind')
      expect(unknown).toBeDefined()
      expect(featureSupport('futureKind')).toBe('unknown')
      const again = await recognizePack(s, await s.packs.exportPack('fixture-data'))
      expect(again.features.find((f) => f.kind === 'futureKind')?.data).toEqual({ any: ['value'] })
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('图片：写入图片仓库，按哈希去重，按 $asset 读出相同字节', async () => {
    const s = await services('rt-image')
    try {
      await installFixturePacks(s)
      const blob = fixtureBlob()
      expect((await s.db.blobs.get(blob.hash))?.bytes).toEqual(blob.bytes)
      expect(await s.db.blobs.count()).toBe(1)
      const pack = await s.db.packs.get('fixture-adventure')
      expect(pack?.blobHashes).toEqual([blob.hash])
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('冒险内容项：装入包，读出每一项，项间引用与数据包引用都能找到', async () => {
    const s = await services('rt-adventure')
    try {
      await installFixturePacks(s)
      const pack = await s.db.packs.get('fixture-adventure')
      const files = pack?.content.adventure ?? {}
      const adventure = files['adventure/adventure.json'] as { adventures: Array<{ itemIds: string[] }> }
      expect(adventure.adventures[0].itemIds).toHaveLength(7)
      const persons = files['adventure/person.json'] as Array<{ id: string; data: { home: { id: string }; stat: { entryId: string } } }>
      expect(persons[0].data.home.id).toBe('location-1')
      const locations = files['adventure/location.json'] as Array<{ id: string }>
      expect(locations.some((l) => l.id === persons[0].data.home.id)).toBe(true)
      expect(await s.db.entries.get(['fixture-data', persons[0].data.stat.entryId])).toBeDefined()
    } finally {
      s.db.close(); await s.db.delete()
    }
  })

  it('存档：生成副本后保存，.trpgsave 导出再导入，快照与图片一致', async () => {
    const a = await services('rt-save-a')
    const b = await services('rt-save-b')
    try {
      await installFixturePacks(a)
      await a.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: ['fixture-base', 'fixture-data', 'fixture-adventure'], name: '带图存档' })
      await a.campaign.materialize(OWNER.ownerKey, { packId: 'fixture-data', entryId: 'spell.fireball.test' })
      const blob = fixtureBlob()
      await a.db.blobs.put({ hash: blob.hash, bytes: blob.bytes, mime: 'image/png', size: blob.bytes.length, createdAt: 1 })
      await a.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, portrait: { $asset: blob.hash } }))
      await a.campaign.saveCurrent(OWNER.ownerKey)
      const current = (await a.campaign.getWorkspace(OWNER.ownerKey))!.currentSaveId!
      const { bytes } = await exportSaves({ db: a.db, packs: a.packs, now: a.now, appVersion: '99.0.0' }, { type: 'save', saveId: current }, { includePacks: false })
      const rec = a.packs.recognize(bytes) as RecognizedSaveFile
      expect(rec.blobs.get(blob.hash)).toEqual(blob.bytes)
      await importSaves({ db: b.db, campaign: b.campaign, now: b.now, hasRule: (id) => b.rules.has(id) }, rec, { owner: { ownerKey: 'char:other.png', ownerLabel: '另一张卡' }, selectedIds: [rec.saves[0].id] })
      const imported = (await b.campaign.listManual({ ownerKey: 'char:other.png', ruleId: 'dnd5e2014' }, 'all'))[0]
      expect(imported.snapshot).toEqual(rec.saves[0].snapshot)
      expect((await b.db.blobs.get(blob.hash))?.bytes).toEqual(blob.bytes)
    } finally {
      a.db.close(); b.db.close(); await a.db.delete(); await b.db.delete()
    }
  })
})
