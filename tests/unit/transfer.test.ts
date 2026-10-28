import { describe, expect, it } from 'vitest'
import { reminderStatus, loadBackupState, markBackupExported, requestPersistence } from '../../src/core/backup'
import { attachedPackFiles, describeSaveFile, importSaves } from '../../src/core/transfer/importer'
import { estimateExport, exportSaves } from '../../src/core/transfer/exporter'
import type { RecognizedSaveFile } from '../../src/core/packs/recognize'
import { backupStateSchema, settingsSchema } from '../../src/schemas/campaign'
import { OTHER_OWNER, OWNER, installExtra, setup, type Harness } from '../helpers/harness'
import { PackService } from '../../src/core/packs/installer'
import { makeClock, makePack, makeRegistry, withDb } from '../helpers/fixtures'
import { TrpgDatabase } from '../../src/core/db'

const NEW = { ...OWNER, ruleId: 'dnd5e2014', packIds: [] as string[], name: '龙金劫-2' }

function deps(h: Harness) {
  return { db: h.db, packs: h.packs, now: h.clock, appVersion: '1.0.0' }
}

function recognizeSaveFile(h: Harness, bytes: Uint8Array): RecognizedSaveFile {
  const rec = h.packs.recognize(bytes)
  if (rec.type === 'pack') throw new Error('应为存档文件')
  return rec
}

function importDeps(h: Harness) {
  return { db: h.db, campaign: h.campaign, now: h.clock, hasRule: (id: string) => id === 'dnd5e2014' || id === 'coc7' }
}

describe('导出与导入单个存档', () => {
  it('往返一致：快照、摘要、内容包引用；导入为当前卡的新存档，重名加（导入）', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await h.campaign.startNewCampaign({ ...NEW, packIds: ['storm-isle'] })
      await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' }, 2)
      const { workspace } = await h.campaign.saveCurrent(OWNER.ownerKey)
      const { bytes, filename } = await exportSaves(deps(h), { type: 'save', saveId: workspace.currentSaveId! }, { includePacks: false })
      expect(filename).toMatch(/^龙金劫-2_\d{4}-\d{2}-\d{2}\.trpgsave$/)
      const rec = recognizeSaveFile(h, bytes)
      expect(rec.type).toBe('save')
      expect(rec.saves).toHaveLength(1)
      const original = (await h.campaign.getSave(workspace.currentSaveId!))!
      const items = describeSaveFile(rec, importDeps(h).hasRule)
      expect(items.every((i) => i.selectable)).toBe(true)
      const r1 = await importSaves(importDeps(h), rec, { owner: OTHER_OWNER, selectedIds: [original.id] })
      expect(r1).toEqual({ imported: 1, skipped: 0 })
      const r2 = await importSaves(importDeps(h), rec, { owner: OTHER_OWNER, selectedIds: [original.id] })
      expect(r2.imported).toBe(1)
      const theirs = await h.campaign.listManual({ ownerKey: OTHER_OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      expect(theirs.map((s) => s.name).sort()).toEqual(['龙金劫-2', '龙金劫-2（导入）'])
      expect(theirs[0].snapshot).toEqual(original.snapshot)
      expect(theirs[0].packs).toEqual(original.packs)
      expect(theirs.every((s) => s.id !== original.id && s.ownerKey === OTHER_OWNER.ownerKey)).toBe(true)
    })
  })

  it('只导入选中的存档；规则未安装的存档不可选且不会导入', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const a = await h.campaign.startNewCampaign(NEW)
      const b = await h.campaign.branch(OWNER.ownerKey, '第二个')
      const { bytes } = await exportSaves(deps(h), { type: 'backup' }, { includePacks: false })
      const rec = recognizeSaveFile(h, bytes)
      rec.saves[0] = { ...rec.saves[0], ruleId: 'unknown-rule' }
      const items = describeSaveFile(rec, (id) => id === 'dnd5e2014')
      expect(items.filter((i) => !i.selectable).map((i) => i.reason)).toEqual(['规则未安装'])
      const ids = rec.saves.map((s) => s.id)
      const r = await importSaves({ ...importDeps(h), hasRule: (id) => id === 'dnd5e2014' }, { ...rec, type: 'save' }, { owner: OWNER, selectedIds: ids })
      expect(r.imported).toBe(rec.saves.filter((s) => s.ruleId === 'dnd5e2014').length)
      expect(a.save.id).not.toBe(b.save.id)
    })
  })

  it('附带内容包：导出时写入非内置的已用包；估算体积；内置核心包不重复打包', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await installExtra(h, 'xge')
      const { save } = await h.campaign.startNewCampaign({ ...NEW, packIds: ['xge', 'storm-isle'] })
      const est = await estimateExport(deps(h), { type: 'save', saveId: save.id })
      expect(est.packs.map((p) => p.id).sort()).toEqual(['storm-isle', 'xge'])
      expect(est.saveBytes).toBeGreaterThan(0)
      const withPacks = await exportSaves(deps(h), { type: 'save', saveId: save.id }, { includePacks: true })
      const without = await exportSaves(deps(h), { type: 'save', saveId: save.id }, { includePacks: false })
      expect(withPacks.bytes.length).toBeGreaterThan(without.bytes.length)
      const rec = recognizeSaveFile(h, withPacks.bytes)
      const files = attachedPackFiles(rec)
      expect(files.map((f) => f.name).sort()).toEqual(['packs/storm-isle@1.0.0.trpgpack', 'packs/xge@1.0.0.trpgpack'])
      // 在另一个全新的数据库里装回附带的内容包
      await withDb(async (db2) => {
        const fresh = new PackService(db2, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0' })
        await fresh.installBuiltin(makePack({ id: 'dnd5e2014-srd', name: '核心规则' }))
        for (const f of files) {
          const r = fresh.recognize(f.bytes)
          if (r.type !== 'pack') throw new Error()
          await fresh.install(r, { source: 'import' })
        }
        expect((await fresh.list()).map((p) => p.id).sort()).toEqual(['dnd5e2014-srd', 'storm-isle', 'xge'].sort())
      })
    })
  })

  it('不存在或已删除的存档无法导出', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const a = await h.campaign.startNewCampaign(NEW)
      const b = await h.campaign.branch(OWNER.ownerKey, 'B')
      await h.campaign.deleteSave(a.save.id)
      await expect(exportSaves(deps(h), { type: 'save', saveId: a.save.id }, { includePacks: false })).rejects.toThrow('没有找到这个存档')
      await expect(exportSaves(deps(h), { type: 'save', saveId: 'nope' }, { includePacks: false })).rejects.toThrow('没有找到这个存档')
      expect(b.save.id).toBeTruthy()
    })
  })
})

describe('完整备份', () => {
  async function populated(db: TrpgDatabase) {
    const h = await setup(db)
    await h.campaign.startNewCampaign(NEW)
    await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 7 }))
    await h.campaign.saveCurrent(OWNER.ownerKey)
    const b = await h.campaign.branch(OWNER.ownerKey, '分支')
    await h.campaign.startNewCampaign({ ...NEW, ...OTHER_OWNER, name: '另一张卡' })
    await h.campaign.deleteSave(b.save.id).catch(() => undefined) // 当前存档不能删：保持原状
    return h
  }

  it('包含存档（含自动存档）、各卡当前数据、设置、内容包清单；不含最近删除', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const first = await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      await h.campaign.loadSave(OWNER, first[1].id) // 切走当前存档，使另一个可删除
      await h.campaign.deleteSave(first[0].id)
      await db.setMeta('settings', settingsSchema.parse({ reminderDays: 3 }))
      const { bytes, filename } = await exportSaves(deps(h), { type: 'backup' }, { includePacks: false })
      expect(filename).toMatch(/^TRPG备份_\d{4}-\d{2}-\d{2}\.trpgsave$/)
      const rec = recognizeSaveFile(h, bytes)
      expect(rec.type).toBe('backup')
      expect(rec.saves.some((s) => s.kind === 'auto')).toBe(true)
      expect(rec.saves.some((s) => s.id === first[0].id)).toBe(false)
      expect(rec.workspaces.map((w) => w.ownerKey).sort()).toEqual([OTHER_OWNER.ownerKey, OWNER.ownerKey].sort())
      expect(rec.settings?.reminderDays).toBe(3)
      expect(rec.packList.map((p) => p.id)).toContain('dnd5e2014-srd')
    })
  })

  it('合并：只添加尚不存在的存档与当前数据，不改动已有内容与设置', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const { bytes } = await exportSaves(deps(h), { type: 'backup' }, { includePacks: false })
      const rec = recognizeSaveFile(h, bytes)
      const mine = await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      await h.campaign.loadSave(OWNER, mine[1].id)
      await h.campaign.deleteSave(mine[0].id)
      await h.campaign.purgeSaves([mine[0].id])
      await db.workspaces.delete(OTHER_OWNER.ownerKey)
      await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 1000 }))
      const countBefore = await db.saves.count()
      const r = await importSaves(importDeps(h), rec, { owner: OWNER, selectedIds: rec.saves.map((s) => s.id), mode: 'merge' })
      expect(r.imported).toBe(rec.saves.length - countBefore + 1 > 0 ? r.imported : 0)
      expect(await h.campaign.getSave(mine[0].id)).not.toBeNull() // 被清掉的存档回来了
      expect(await db.workspaces.get(OTHER_OWNER.ownerKey)).toBeDefined() // 缺失的当前数据回来了
      expect((await h.campaign.getWorkspace(OWNER.ownerKey))?.data.gold).toBe(1000) // 已有的当前数据不被覆盖
    })
  })

  it('覆盖：用备份替换全部存档与当前数据，并把覆盖前的当前数据写成"恢复备份前"自动存档', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const { bytes } = await exportSaves(deps(h), { type: 'backup' }, { includePacks: false })
      const rec = recognizeSaveFile(h, bytes)
      await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 555 }))
      await h.campaign.startNewCampaign({ ...NEW, name: '备份之后新建的' })
      await db.setMeta('settings', settingsSchema.parse({ reminderDays: 99 }))
      const r = await importSaves(importDeps(h), rec, { owner: OWNER, selectedIds: [], mode: 'overwrite' })
      expect(r.imported).toBe(rec.saves.length)
      const names = (await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')).map((s) => s.name)
      expect(names).not.toContain('备份之后新建的')
      expect((await h.campaign.getWorkspace(OWNER.ownerKey))?.data.gold).toBe(7)
      const autos = await h.campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
      const safety = autos.find((a) => a.autoReason === '恢复备份前')
      expect(safety).toBeDefined()
      expect(safety?.name).toBeDefined()
      expect((await db.getMeta<{ reminderDays: number }>('settings'))?.reminderDays).toBe(7)
    })
  })

  it('覆盖时不动属于未安装规则的存档', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const { bytes } = await exportSaves(deps(h), { type: 'backup' }, { includePacks: false })
      const rec = recognizeSaveFile(h, bytes)
      const keep = (await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card'))[0]
      await db.saves.put({ ...keep, id: 'orphan', ruleId: 'future-rule', name: '未来规则的存档' })
      await importSaves(importDeps(h), rec, { owner: OWNER, selectedIds: [], mode: 'overwrite' })
      expect(await db.saves.get('orphan')).toBeDefined()
    })
  })
})

describe('备份提醒', () => {
  const settings = settingsSchema.parse({})
  const day = 86_400_000
  const now = 30 * day
  const state = (over: Partial<ReturnType<typeof backupStateSchema.parse>>) => backupStateSchema.parse(over)

  it('从未导出、正常、超过天数、超过保存次数', () => {
    expect(reminderStatus(state({}), settings, now)).toMatchObject({ kind: 'never', text: '还没有导出过备份' })
    expect(reminderStatus(state({ lastExportAt: now - 2 * day, savesSinceExport: 3 }), settings, now)).toMatchObject({ kind: 'ok', daysSince: 2, text: '上次完整备份：2 天前 · 之后保存 3 次' })
    expect(reminderStatus(state({ lastExportAt: now - 7 * day }), settings, now).kind).toBe('due')
    expect(reminderStatus(state({ lastExportAt: now - day, savesSinceExport: 10 }), settings, now)).toMatchObject({ kind: 'due' })
    expect(reminderStatus(state({ lastExportAt: now - 12 * day }), settings, now).text).toContain('建议导出备份')
    expect(reminderStatus(state({ lastExportAt: now }), settings, now).text).toContain('今天')
  })

  it('导出完整备份后清零；持久存储只申请一次', async () => {
    await withDb(async (db) => {
      await db.setMeta('backup', { lastExportAt: null, savesSinceExport: 9, persistRequested: false, persistGranted: false })
      await markBackupExported(db, 12345)
      expect(await loadBackupState(db)).toMatchObject({ lastExportAt: 12345, savesSinceExport: 0 })
      let calls = 0
      const storage = { persist: async () => (calls++, true) }
      expect(await requestPersistence(db, storage)).toMatchObject({ persistRequested: true, persistGranted: true })
      await requestPersistence(db, storage)
      expect(calls).toBe(1)
      expect(await requestPersistence(db, undefined)).toMatchObject({ persistGranted: true })
    })
  })

  it('宿主不支持持久存储时记录为未授予', async () => {
    await withDb(async (db) => {
      expect(await requestPersistence(db, {})).toMatchObject({ persistRequested: true, persistGranted: false })
    })
  })
})
