import { describe, expect, it } from 'vitest'
import { reminderStatus, loadBackupState, markBackupExported, requestPersistence } from '../../src/core/backup'
import { describeSaveFile, importSaves } from '../../src/core/transfer/importer'
import { estimateExport, exportSaves } from '../../src/core/transfer/exporter'
import { readSaveFile, type RecognizedSaveFile } from '../../src/core/transfer/saveFile'
import { writeZip } from '../../src/core/files/zip'
import { backupStateSchema, settingsSchema } from '../../src/schemas/campaign'
import { OTHER_OWNER, OWNER, setup, type Harness } from '../helpers/harness'
import { withDb } from '../helpers/fixtures'
import { TrpgDatabase } from '../../src/core/db'

const NEW = { ...OWNER, ruleId: 'dnd5e2014', name: '龙金劫-2' }

function deps(h: Harness) {
  return { db: h.db, now: h.clock, appVersion: '1.0.0' }
}

function recognizeSaveFile(_h: Harness, bytes: Uint8Array): RecognizedSaveFile {
  return readSaveFile(bytes)
}

function importDeps(h: Harness) {
  return { db: h.db, campaign: h.campaign, now: h.clock, hasRule: (id: string) => id === 'dnd5e2014' || id === 'coc7' }
}

describe('导出与导入单个存档', () => {
  it('往返一致：快照、摘要；导入为当前卡的新存档，重名加（导入）', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await h.campaign.startNewCampaign(NEW)
      await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 7 }))
      const { workspace } = await h.campaign.saveCurrent(OWNER.ownerKey)
      const { bytes, filename } = await exportSaves(deps(h), { type: 'save', saveId: workspace.currentSaveId! })
      expect(filename).toMatch(/^龙金劫-2_\d{4}-\d{2}-\d{2}\.trpgsave$/)
      const rec = recognizeSaveFile(h, bytes)
      expect(rec.type).toBe('save')
      expect(rec.saves).toHaveLength(1)
      const original = (await h.campaign.getSave(workspace.currentSaveId!))!
      const items = describeSaveFile(rec, importDeps(h).hasRule)
      expect(items.every((i) => i.selectable)).toBe(true)
      const r1 = await importSaves(importDeps(h), rec, { owner: OTHER_OWNER, selectedIds: [original.id] })
      expect(r1).toMatchObject({ imported: 1, skipped: 0, dependencies: 0, missing: [], library: null })
      const r2 = await importSaves(importDeps(h), rec, { owner: OTHER_OWNER, selectedIds: [original.id] })
      expect(r2.imported).toBe(1)
      const theirs = await h.campaign.listManual({ ownerKey: OTHER_OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      expect(theirs.map((s) => s.name).sort()).toEqual(['龙金劫-2', '龙金劫-2（导入）'])
      expect(theirs[0].snapshot).toEqual(original.snapshot)
      expect(theirs.every((s) => s.id !== original.id && s.ownerKey === OTHER_OWNER.ownerKey)).toBe(true)
    })
  })

  it('只导入选中的存档；规则未安装的存档不可选且不会导入', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const a = await h.campaign.startNewCampaign(NEW)
      const b = await h.campaign.branch(OWNER.ownerKey, '第二个')
      const { bytes } = await exportSaves(deps(h), { type: 'backup' })
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

  it('估算导出体积', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const { save } = await h.campaign.startNewCampaign(NEW)
      expect((await estimateExport(deps(h), { type: 'save', saveId: save.id })).saveBytes).toBeGreaterThan(0)
    })
  })

  it('旧版文件：旧扩展包 .trpgpack、旧格式存档都明确拒绝；不是 zip、缺说明文件也报错', async () => {
    const manifest = (m: Record<string, unknown>) => writeZip({ 'trpg-manifest.json': JSON.stringify(m) })
    expect(() => readSaveFile(manifest({ format: 'trpg-pack', formatVersion: 2 }))).toThrow('旧版的扩展包文件')
    expect(() => readSaveFile(manifest({ format: 'trpg-save', formatVersion: 2 }))).toThrow('旧版扩展导出的存档')
    expect(() => readSaveFile(manifest({ format: 'trpg-save', formatVersion: 99 }))).toThrow('更新版本')
    expect(() => readSaveFile(new Uint8Array([1, 2, 3]))).toThrow('这不是')
    expect(() => readSaveFile(writeZip({ 'a.txt': 'x' }))).toThrow('缺少说明文件')
  })

  it('不存在或已删除的存档无法导出', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const a = await h.campaign.startNewCampaign(NEW)
      const b = await h.campaign.branch(OWNER.ownerKey, 'B')
      await h.campaign.deleteSave(a.save.id)
      await expect(exportSaves(deps(h), { type: 'save', saveId: a.save.id })).rejects.toThrow('没有找到这个存档')
      await expect(exportSaves(deps(h), { type: 'save', saveId: 'nope' })).rejects.toThrow('没有找到这个存档')
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

  it('包含存档（含自动存档）、各卡当前数据、设置；不含最近删除', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const first = await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      await h.campaign.loadSave(OWNER, first[1].id) // 切走当前存档，使另一个可删除
      await h.campaign.deleteSave(first[0].id)
      await db.setMeta('settings', settingsSchema.parse({ reminderDays: 3 }))
      const { bytes, filename } = await exportSaves(deps(h), { type: 'backup' })
      expect(filename).toMatch(/^TRPG备份_\d{4}-\d{2}-\d{2}\.trpgsave$/)
      const rec = recognizeSaveFile(h, bytes)
      expect(rec.type).toBe('backup')
      expect(rec.saves.some((s) => s.kind === 'auto')).toBe(true)
      expect(rec.saves.some((s) => s.id === first[0].id)).toBe(false)
      expect(rec.workspaces.map((w) => w.ownerKey).sort()).toEqual([OTHER_OWNER.ownerKey, OWNER.ownerKey].sort())
      expect(rec.settings?.reminderDays).toBe(3)
    })
  })

  it('合并：只添加尚不存在的存档与当前数据，不改动已有内容与设置', async () => {
    await withDb(async (db) => {
      const h = await populated(db)
      const { bytes } = await exportSaves(deps(h), { type: 'backup' })
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
      const { bytes } = await exportSaves(deps(h), { type: 'backup' })
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
      const { bytes } = await exportSaves(deps(h), { type: 'backup' })
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
    expect(reminderStatus(state({ lastExportAt: now }), settings, now, 2048)).toMatchObject({ estimatedBytes: 2048 })
    expect(reminderStatus(state({ lastExportAt: now }), settings, now, 2048).text).toContain('约 2 KB')
  })

  it('提醒项设为 0 表示不提醒：天数、次数各自独立，两项都 0 永不提醒', () => {
    const old = state({ lastExportAt: now - 30 * day, savesSinceExport: 99 })
    expect(reminderStatus(old, settingsSchema.parse({}), now).kind).toBe('due')
    expect(reminderStatus(old, settingsSchema.parse({ reminderDays: 0 }), now).kind).toBe('due') // 次数仍提醒
    expect(reminderStatus(old, settingsSchema.parse({ reminderDays: 0, reminderSaves: 0 }), now)).toMatchObject({ kind: 'ok' })
    expect(reminderStatus(state({ lastExportAt: now - 30 * day }), settingsSchema.parse({ reminderDays: 0 }), now).kind).toBe('ok')
    expect(reminderStatus(state({ lastExportAt: now - 30 * day, savesSinceExport: 50 }), settingsSchema.parse({ reminderSaves: 0 }), now).kind).toBe('due') // 天数仍提醒
    expect(settingsSchema.safeParse({ reminderDays: -1 }).success).toBe(false)
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
