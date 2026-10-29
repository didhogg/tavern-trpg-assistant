import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createServices } from '../../src/core/services'
import { sha256Hex } from '../../src/core/hash'
import { exportSaves } from '../../src/core/transfer/exporter'
import { importSaves } from '../../src/core/transfer/importer'
import type { RecognizedSaveFile } from '../../src/core/packs/recognize'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { DND5E2014_ENTRY_TYPES } from '../../src/rules/dnd5e2014/data/entries'
import { uuid } from '../../src/core/ids'
import { z } from 'zod'
import { textBlockSchema } from '../../src/schemas/text'

const REPO = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const OWNER = { ownerKey: 'char:official.png', ownerLabel: '官方包测试' }

function packPath(id: string, version: string): string {
  if (id === SRD_PACK_ID) return join(REPO, 'packs', `${id}.trpgpack`)
  return join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${version}.trpgpack`)
}

async function loadPacks(): Promise<Array<{ id: string; bytes: Uint8Array }>> {
  const list = [{ id: SRD_PACK_ID, version: '1.0.0' }, ...BOOKS.map((b) => ({ id: b.packId, version: b.version }))]
  for (const item of list) if (!existsSync(packPath(item.id, item.version))) throw new Error(`缺少 ${packPath(item.id, item.version)}；先运行 npm run build:data`)
  return Promise.all(list.map(async (item) => ({ id: item.id, bytes: new Uint8Array(await readFile(packPath(item.id, item.version))) })))
}

async function installAll(s: Awaited<ReturnType<typeof createServices>>, packs: Array<{ id: string; bytes: Uint8Array }>) {
  for (const pack of packs) {
    const rec = s.packs.recognize(pack.bytes)
    if (rec.type !== 'pack') throw new Error(`${pack.id} 不是内容包`)
    const plan = await s.packs.plan(rec)
    expect(plan.missingRequires, pack.id).toEqual([])
    await s.packs.install(rec, { source: 'download' })
  }
}

describe('官方包全量往返', () => {
  it('全部装入测试库；每个包导出后再装，校验值一致', async () => {
    const packs = await loadPacks()
    const a = createServices({ dbName: `official-a-${uuid()}`, appVersion: '99.0.0' })
    const b = createServices({ dbName: `official-b-${uuid()}`, appVersion: '99.0.0' })
    try {
      await installAll(a, packs)
      expect(await a.db.packs.count()).toBe(packs.length)
      for (const pack of packs) {
        const exported = await a.packs.exportPack(pack.id)
        expect(sha256Hex(exported), pack.id).toBe(sha256Hex(pack.bytes))
      }
      await installAll(b, packs)
      for (const pack of packs) expect(sha256Hex(await b.packs.exportPack(pack.id)), pack.id).toBe(sha256Hex(pack.bytes))
      const entries = await a.db.entries.toArray()
      const ids = new Set(entries.map((e) => e.entryId))
      const refs = new Set<string>()
      for (const entry of entries) for (const match of JSON.stringify(entry.data).matchAll(/\{\{ref:([^|}]+)/g)) refs.add(match[1])
      const sample = [...refs].slice(0, 200)
      expect(sample.length).toBe(200)
      for (const id of sample) expect(ids.has(id), id).toBe(true)
    } finally {
      a.db.close(); b.db.close(); await a.db.delete(); await b.db.delete()
    }
  }, 120_000)

  it('每种类型抽 20 条生成副本，存档往返一致', async () => {
    const packs = await loadPacks()
    const a = createServices({ dbName: `official-save-a-${uuid()}`, appVersion: '99.0.0' })
    const b = createServices({ dbName: `official-save-b-${uuid()}`, appVersion: '99.0.0' })
    try {
      await installAll(a, packs)
      await a.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: packs.map((p) => p.id), name: '官方包存档' })
      let created = 0
      for (const type of DND5E2014_ENTRY_TYPES) {
        const rows = await a.db.entries.where('[ruleId+type]').equals(['dnd5e2014', type]).limit(20).toArray()
        expect(rows.length, type).toBeGreaterThan(0)
        for (const row of rows) {
          const made = await a.campaign.materialize(OWNER.ownerKey, { packId: row.packId, entryId: row.entryId })
          if (made.created) created++
        }
      }
      expect(created).toBeGreaterThan(200)
      await a.campaign.saveCurrent(OWNER.ownerKey)
      const current = (await a.campaign.getWorkspace(OWNER.ownerKey))!.currentSaveId!
      const { bytes } = await exportSaves({ db: a.db, packs: a.packs, now: a.now, appVersion: '99.0.0' }, { type: 'save', saveId: current }, { includePacks: false })
      const rec = a.packs.recognize(bytes) as RecognizedSaveFile
      expect(rec.type).toBe('save')
      await importSaves({ db: b.db, campaign: b.campaign, now: b.now, hasRule: (id) => b.rules.has(id) }, rec, { owner: { ownerKey: 'char:other.png', ownerLabel: '另一张卡' }, selectedIds: [rec.saves[0].id] })
      const imported = (await b.campaign.listManual({ ownerKey: 'char:other.png', ruleId: 'dnd5e2014' }, 'all'))[0]
      expect(imported.snapshot).toEqual(rec.saves[0].snapshot)
    } finally {
      a.db.close(); b.db.close(); await a.db.delete(); await b.db.delete()
    }
  }, 180_000)
})

describe('官方包的规则选项说明', () => {
  it('说明要么为空，要么是能读成正文块的 JSON（界面按正文块显示，不会露出原始 JSON）', async () => {
    const s = createServices({ dbName: `official-options-${uuid()}`, appVersion: '99.0.0' })
    try {
      await installAll(s, await loadPacks())
      let readable = 0
      for (const pack of await s.packs.list()) {
        for (const f of (pack.content?.features ?? []) as Array<{ kind: string; name: string; data: { text?: string } }>) {
          if (f.kind !== 'ruleOptions') continue
          const text = String(f.data.text ?? '').trim()
          if (text === '' || text === '[]') continue
          const parsed = z.array(textBlockSchema).safeParse(JSON.parse(text))
          expect(parsed.success, `${pack.id} 的「${f.name}」`).toBe(true)
          readable++
        }
      }
      expect(readable).toBeGreaterThanOrEqual(7)
    } finally {
      s.db.close()
      await s.db.delete()
    }
  }, 120_000)
})
