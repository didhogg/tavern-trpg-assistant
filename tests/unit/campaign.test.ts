import { describe, expect, it } from 'vitest'
import { TrpgError } from '../../src/core/errors'
import { backupStateSchema } from '../../src/schemas/campaign'
import { OTHER_OWNER, OWNER, installExtra, setup } from '../helpers/harness'
import { withDb } from '../helpers/fixtures'

async function code(promise: Promise<unknown>): Promise<string> {
  try {
    await promise
  } catch (e) {
    expect(e).toBeInstanceOf(TrpgError)
    return (e as TrpgError).code
  }
  throw new Error('应当抛出错误')
}

const NEW = { ...OWNER, ruleId: 'dnd5e2014', packIds: [] as string[], name: '龙金劫-2' }

describe('新存档', () => {
  it('建立当前数据与第一个存档，核心包自动启用，且没有未保存改动', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const { workspace, save } = await campaign.startNewCampaign({ ...NEW, note: '开荒' })
      expect(workspace.currentSaveId).toBe(save.id)
      expect(workspace.enabledPacks.map((p) => p.id)).toEqual(['dnd5e2014-core'])
      expect(save).toMatchObject({ name: '龙金劫-2', note: '开荒', kind: 'manual', ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' })
      expect(campaign.isDirty(workspace)).toBe(false)
      expect(await campaign.getWorkspace(OWNER.ownerKey)).toEqual(workspace)
    })
  })

  it('选择模组时自动带上依赖；名称校验；规则与内容包校验', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const { workspace } = await h.campaign.startNewCampaign({ ...NEW, packIds: ['storm-isle'] })
      expect(workspace.enabledPacks.map((p) => p.id)).toEqual(['dnd5e2014-core', 'storm-isle'])
      expect(await code(h.campaign.startNewCampaign({ ...NEW, name: '   ' }))).toBe('E_BAD_NAME')
      expect(await code(h.campaign.startNewCampaign({ ...NEW, name: 'x'.repeat(41) }))).toBe('E_BAD_NAME')
      expect(await code(h.campaign.startNewCampaign({ ...NEW, ruleId: 'coc7' }))).toBe('E_RULE_MISSING')
      expect(await code(h.campaign.startNewCampaign({ ...NEW, packIds: ['不存在'] }))).toBe('E_DEP_MISSING')
    })
  })

  it('已有当前数据时先写一个"新存档前"的自动存档，并替换当前数据', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      await campaign.startNewCampaign(NEW)
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, note: '未保存的内容' }))
      await campaign.startNewCampaign({ ...NEW, name: '新战役' })
      const autos = await campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
      expect(autos).toHaveLength(1)
      expect(autos[0]).toMatchObject({ kind: 'auto', autoReason: '新存档前' })
      expect(autos[0].snapshot.note).toBe('未保存的内容')
      expect((await campaign.getWorkspace(OWNER.ownerKey))?.data.note).toBeUndefined()
    })
  })
})

describe('未保存判定与保存', () => {
  it('改动后为未保存，保存后恢复；没有改动时保存不写入', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      await campaign.startNewCampaign(NEW)
      expect((await campaign.saveCurrent(OWNER.ownerKey)).changed).toBe(false)
      const dirty = await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 10 }))
      expect(campaign.isDirty(dirty)).toBe(true)
      const saved = await campaign.saveCurrent(OWNER.ownerKey)
      expect(saved.changed).toBe(true)
      expect(campaign.isDirty(saved.workspace)).toBe(false)
      const slot = await campaign.getSave(saved.workspace.currentSaveId!)
      expect(slot?.snapshot.gold).toBe(10)
      expect((await campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')).length).toBe(1)
    })
  })

  it('启用或停用内容包算改动；内容包版本更新不算改动', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await h.campaign.startNewCampaign(NEW)
      const { workspace } = await h.campaign.setPackEnabled(OWNER.ownerKey, 'storm-isle', true)
      expect(h.campaign.isDirty(workspace)).toBe(true)
      await h.campaign.saveCurrent(OWNER.ownerKey)
      const rec = h.packs.recognize((await import('../helpers/fixtures')).makePack({ id: 'storm-isle', kind: 'module', name: '风暴岛', version: '1.1.0', dependsOn: [{ id: 'dnd5e2014-core' }] }))
      if (rec.type !== 'pack') throw new Error()
      await h.packs.install(rec, { source: 'download' })
      const after = await h.campaign.getWorkspace(OWNER.ownerKey)
      expect(after?.enabledPacks.find((p) => p.id === 'storm-isle')?.version).toBe('1.1.0')
      expect(h.campaign.isDirty(after!)).toBe(false)
    })
  })

  it('保存次数计入备份提醒', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      await campaign.startNewCampaign(NEW)
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, a: 1 }))
      await campaign.saveCurrent(OWNER.ownerKey)
      await campaign.branch(OWNER.ownerKey)
      expect(backupStateSchema.parse(await db.getMeta('backup')).savesSinceExport).toBe(3)
    })
  })

  it('存档摘要来自各单元登记的贡献函数', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db, { summaryContributors: [(d) => ({ partyNames: (d.party as string[] | undefined) ?? [], partyCount: ((d.party as string[] | undefined) ?? []).length }), () => ({ location: '龙骨洞', round: 2 })] })
      await campaign.startNewCampaign(NEW)
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, party: ['盖尔', '邦妮'] }))
      const { workspace } = await campaign.saveCurrent(OWNER.ownerKey)
      expect((await campaign.getSave(workspace.currentSaveId!))?.summary).toEqual({ partyNames: ['盖尔', '邦妮'], partyCount: 2, location: '龙骨洞', round: 2 })
    })
  })
})

describe('分支存档', () => {
  it('新存档含当前未保存改动并成为当前存档；原存档保持上次保存的样子', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign(NEW)
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 5 }))
      const { workspace, save } = await campaign.branch(OWNER.ownerKey)
      expect(save).toMatchObject({ name: '龙金劫-2 分支', branchedFrom: first.save.id })
      expect(save.snapshot.gold).toBe(5)
      expect(workspace.currentSaveId).toBe(save.id)
      expect(campaign.isDirty(workspace)).toBe(false)
      expect((await campaign.getSave(first.save.id))?.snapshot.gold).toBeUndefined()
    })
  })

  it('默认名称重复时加序号；自定义名称需通过校验', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      await campaign.startNewCampaign(NEW)
      const a = await campaign.branch(OWNER.ownerKey)
      const b = await campaign.branch(OWNER.ownerKey)
      expect([a.save.name, b.save.name]).toEqual(['龙金劫-2 分支', '龙金劫-2 分支 分支'])
      expect((await campaign.branch(OWNER.ownerKey, '  自定义  ')).save.name).toBe('自定义')
      expect(await code(campaign.branch(OWNER.ownerKey, ''))).toBe('E_BAD_NAME')
    })
  })
})

describe('读取存档', () => {
  async function twoSaves(db: Parameters<Parameters<typeof withDb>[0]>[0]) {
    const h = await setup(db)
    const first = await h.campaign.startNewCampaign(NEW)
    await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 1 }))
    await h.campaign.saveCurrent(OWNER.ownerKey)
    const second = await h.campaign.branch(OWNER.ownerKey, '龙金劫-1')
    return { h, first, second }
  }

  it('读取后当前数据等于存档快照且无未保存改动；读取前为当前数据写自动存档（含未保存改动）', async () => {
    await withDb(async (db) => {
      const { h, first } = await twoSaves(db)
      await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, gold: 99 }))
      const ws = await h.campaign.loadSave(OWNER, first.save.id)
      expect(ws.currentSaveId).toBe(first.save.id)
      expect(ws.data.gold).toBe(1)
      expect(h.campaign.isDirty(ws)).toBe(false)
      const autos = await h.campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
      expect(autos[0]).toMatchObject({ autoReason: '读档前' })
      expect(autos[0].snapshot.gold).toBe(99)
    })
  })

  it('自动存档每卡每规则只保留最新 3 个', async () => {
    await withDb(async (db) => {
      const { h, first } = await twoSaves(db)
      for (let i = 0; i < 5; i++) {
        await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, n: i }))
        await h.campaign.loadSave(OWNER, first.save.id)
      }
      const autos = await h.campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
      expect(autos).toHaveLength(3)
      expect(autos.map((a) => a.snapshot.n)).toEqual([4, 3, 2].map((n) => n)) // 最新在前
    })
  })

  it('读取其他卡的同规则存档：复制为本卡的新存档，原存档不变', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      const theirs = await h.campaign.startNewCampaign({ ...NEW, ...OTHER_OWNER, name: '龙金劫-1' })
      await h.campaign.startNewCampaign(NEW)
      const ws = await h.campaign.loadSave(OWNER, theirs.save.id)
      expect(ws.ownerKey).toBe(OWNER.ownerKey)
      const mine = await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'card')
      expect(mine.map((s) => s.name)).toContain('龙金劫-1（来自 龙金劫）')
      expect(ws.currentSaveId).not.toBe(theirs.save.id)
      expect((await h.campaign.getSave(theirs.save.id))?.ownerKey).toBe(OTHER_OWNER.ownerKey)
      const all = await h.campaign.listManual({ ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }, 'all')
      expect(all.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('其他规则：未确认拒绝；确认后以"切换规则前"写自动存档并整体切换', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      h.campaign['deps'].rules.register({ id: 'coc7', name: '克苏鲁的呼唤 7 版', nameShort: 'CoC 7', description: '', corePackIds: [] })
      const coc = await h.campaign.startNewCampaign({ ...NEW, ruleId: 'coc7', name: '黑暗边境', ...OTHER_OWNER })
      await h.campaign.startNewCampaign(NEW)
      expect(await code(h.campaign.loadSave(OWNER, coc.save.id))).toBe('E_RULE_SWITCH_REQUIRED')
      const ws = await h.campaign.loadSave(OWNER, coc.save.id, { allowRuleSwitch: true })
      expect(ws.ruleId).toBe('coc7')
      expect((await h.campaign.listAuto(OWNER.ownerKey, 'dnd5e2014'))[0].autoReason).toBe('切换规则前')
      expect((await h.campaign.listOtherRules('coc7')).map((s) => s.name)).toContain('龙金劫-2')
    })
  })

  it('存档属于未安装的规则、或存档不存在/已删除：拒绝', async () => {
    await withDb(async (db) => {
      const { campaign, db: d } = await setup(db)
      const { save } = await campaign.startNewCampaign(NEW)
      await d.saves.put({ ...save, id: 'x', ruleId: 'unknown-rule' })
      expect(await code(campaign.loadSave(OWNER, 'x'))).toBe('E_RULE_MISSING')
      expect(await code(campaign.loadSave(OWNER, 'nope'))).toBe('E_NOT_FOUND')
    })
  })

  it('引用了未安装的内容包：副本照常可用，缺失内容包可被查出', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await installExtra(h, 'xge')
      const { save } = await h.campaign.startNewCampaign({ ...NEW, packIds: ['xge'] })
      await h.packs.uninstall('xge')
      const ws = await h.campaign.loadSave(OWNER, save.id)
      expect(ws.enabledPacks.map((p) => p.id)).toContain('xge')
      expect((await h.campaign.missingPacks(ws)).map((p) => p.id)).toEqual(['xge'])
    })
  })

  it('当前存档为空（没有当前数据）时读取不需要自动存档', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign({ ...NEW, ...OTHER_OWNER })
      await campaign.loadSave(OWNER, first.save.id)
      expect(await campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')).toHaveLength(0)
    })
  })
})

describe('删除、恢复、彻底删除', () => {
  it('当前存档和自动存档不能删除；删除进入最近删除，可恢复；只有已删除的才能彻底删除', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign(NEW)
      const second = await campaign.branch(OWNER.ownerKey, '备用')
      expect(await code(campaign.deleteSave(second.save.id))).toBe('E_SAVE_IN_USE')
      const deleted = await campaign.deleteSave(first.save.id)
      expect(deleted.deletedAt).toBeDefined()
      const key = { ownerKey: OWNER.ownerKey, ruleId: 'dnd5e2014' }
      expect((await campaign.listManual(key, 'card')).map((s) => s.id)).toEqual([second.save.id])
      expect((await campaign.listDeleted('dnd5e2014')).map((s) => s.id)).toEqual([first.save.id])
      const restored = await campaign.restoreSave(first.save.id)
      expect(restored.deletedAt).toBeUndefined()
      expect((await campaign.listManual(key, 'card')).length).toBe(2)
      expect(await campaign.purgeSaves([first.save.id])).toBe(0) // 未删除的不会被彻底删除
      await campaign.deleteSave(first.save.id)
      expect(await campaign.purgeSaves([first.save.id])).toBe(1)
      expect(await campaign.getSave(first.save.id)).toBeNull()
      await campaign.loadSave(OWNER, second.save.id)
      const autos = await campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
      expect(await code(campaign.deleteSave(autos[0].id))).toBe('E_AUTO_NOT_DELETABLE')
    })
  })

  it('恢复时与现有存档重名则自动改名', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign(NEW)
      await campaign.branch(OWNER.ownerKey, '龙金劫-2')
      await campaign.deleteSave(first.save.id)
      const restored = await campaign.restoreSave(first.save.id)
      expect(restored.name).toBe('龙金劫-2（恢复 2）')
    })
  })

  it('改名、备注；自动存档另存为手动存档', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign(NEW)
      expect((await campaign.renameSave(first.save.id, '  新名  ')).name).toBe('新名')
      expect((await campaign.setNote(first.save.id, '备注')).note).toBe('备注')
      expect(await code(campaign.renameSave(first.save.id, ''))).toBe('E_BAD_NAME')
      await campaign.loadSave(OWNER, first.save.id)
      const auto = (await campaign.listAuto(OWNER.ownerKey, 'dnd5e2014'))[0]
      expect(await code(campaign.renameSave(auto.id, 'x'))).toBe('E_AUTO_NOT_DELETABLE')
      const manual = await campaign.saveAutoAsManual(auto.id)
      expect(manual).toMatchObject({ kind: 'manual' })
      expect(manual.name).toMatch(/^自动存档 · \d+月\d+日 \d{2}:\d{2}$/)
      expect(await campaign.getSave(auto.id)).not.toBeNull()
    })
  })
})

describe('启用与停用内容包', () => {
  it('核心包锁定；被依赖的包不能停用；启用模组自动带上依赖；缺依赖与跨规则报错', async () => {
    await withDb(async (db) => {
      const h = await setup(db)
      await installExtra(h, 'xge')
      await h.campaign.startNewCampaign(NEW)
      expect(await code(h.campaign.setPackEnabled(OWNER.ownerKey, 'dnd5e2014-core', false))).toBe('E_CORE_LOCKED')
      const on = await h.campaign.setPackEnabled(OWNER.ownerKey, 'storm-isle', true)
      expect(on.autoEnabled).toEqual([])
      expect(await code(h.campaign.setPackEnabled(OWNER.ownerKey, 'dnd5e2014-core', false))).toBe('E_CORE_LOCKED')
      const off = await h.campaign.setPackEnabled(OWNER.ownerKey, 'storm-isle', false)
      expect(off.workspace.enabledPacks.map((p) => p.id)).toEqual(['dnd5e2014-core'])
      await installExtra(h, 'needs-xge', { kind: 'module', dependsOn: [{ id: 'xge' }] })
      const auto = await h.campaign.setPackEnabled(OWNER.ownerKey, 'needs-xge', true)
      expect(auto.autoEnabled).toEqual(['xge'])
      expect(await code(h.campaign.setPackEnabled(OWNER.ownerKey, 'xge', false))).toBe('E_REQUIRED_BY')
      h.campaign['deps'].rules.register({ id: 'coc7', name: 'CoC', nameShort: 'CoC', description: '', corePackIds: [] })
      await installExtra(h, 'coc-pack', { ruleId: 'coc7' })
      expect(await code(h.campaign.setPackEnabled(OWNER.ownerKey, 'coc-pack', true))).toBe('E_RULE_MISMATCH')
      expect(await code(h.campaign.setPackEnabled(OWNER.ownerKey, 'nonexistent', true))).toBe('E_DEP_MISSING')
    })
  })
})

describe('模板副本机制', () => {
  async function started(db: Parameters<Parameters<typeof withDb>[0]>[0]) {
    const h = await setup(db)
    await h.campaign.startNewCampaign({ ...NEW, packIds: ['storm-isle'] })
    return h
  }

  it('唯一条目反复生成返回同一副本；普通条目每次新建', async () => {
    await withDb(async (db) => {
      const h = await started(db)
      const a = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'tom' })
      const b = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'tom' })
      expect([a.created, b.created]).toEqual([true, false])
      expect(b.instances[0].id).toBe(a.instances[0].id)
      const c = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' })
      const d = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' })
      expect(c.instances[0].id).not.toBe(d.instances[0].id)
      expect(d.workspace.data.instances).toHaveLength(3)
      expect(c.instances[0]).toMatchObject({ type: 'monster', name: '狗头人', sourceRef: { packId: 'storm-isle', version: '1.0.0', entryId: 'kobold' } })
      expect(c.instances[0].label).toBeUndefined()
    })
  })

  it('批量新建按 A、B、C… 编号', async () => {
    await withDb(async (db) => {
      const h = await started(db)
      const r = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' }, 4)
      expect(r.instances.map((i) => i.label)).toEqual(['A', 'B', 'C', 'D'])
      const many = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' }, 28)
      expect(many.instances[26].label).toBe('AA')
      expect(many.workspace.data.instances).toHaveLength(32)
    })
  })

  it('副本是深拷贝，修改副本不影响内容包；内容包停用、覆盖、删除后副本不变；存档快照含全部副本', async () => {
    await withDb(async (db) => {
      const h = await started(db)
      const r = await h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'kobold' })
      const inst = r.instances[0]
      ;(inst.data.tags as string[]).push('改过')
      const stored = await db.entries.get(['storm-isle', 'kobold'])
      expect(stored?.data.tags).toEqual(['a'])
      const saved = await h.campaign.saveCurrent(OWNER.ownerKey)
      expect((await h.campaign.getSave(saved.workspace.currentSaveId!))?.snapshot.instances).toHaveLength(1)
      await h.campaign.setPackEnabled(OWNER.ownerKey, 'storm-isle', false)
      await h.packs.uninstall('storm-isle')
      const ws = await h.campaign.getWorkspace(OWNER.ownerKey)
      expect(ws?.data.instances).toHaveLength(1)
      expect(ws?.data.instances[0].name).toBe('狗头人')
    })
  })

  it('内容包已停用或条目不存在时拒绝', async () => {
    await withDb(async (db) => {
      const h = await started(db)
      expect(await code(h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'nope' }))).toBe('E_NOT_FOUND')
      await h.campaign.setPackEnabled(OWNER.ownerKey, 'storm-isle', false)
      expect(await code(h.campaign.materialize(OWNER.ownerKey, { packId: 'storm-isle', entryId: 'tom' }))).toBe('E_PACK_DISABLED')
    })
  })
})

describe('每张卡一份当前数据', () => {
  it('不同角色卡互不影响；没有当前数据时读写报错', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      await campaign.startNewCampaign(NEW)
      await campaign.startNewCampaign({ ...NEW, ...OTHER_OWNER, name: '另一场' })
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, x: 1 }))
      expect((await campaign.getWorkspace(OTHER_OWNER.ownerKey))?.data.x).toBeUndefined()
      expect(await campaign.getWorkspace('char:none.png')).toBeNull()
      expect(await code(campaign.saveCurrent('char:none.png'))).toBe('E_NO_WORKSPACE')
      expect(await code(campaign.branch('char:none.png'))).toBe('E_NO_WORKSPACE')
    })
  })
})
