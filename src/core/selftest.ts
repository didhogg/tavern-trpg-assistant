import { uuid } from './ids'
import { sha256Hex } from './hash'
import { buildPackFile } from './packs/file'
import { createServices } from './services'
import { exportSaves } from './transfer/exporter'
import { describeSaveFile, importSaves } from './transfer/importer'
import type { Entry } from '../schemas/pack'
import type { RecognizedSaveFile } from './packs/recognize'

export interface SelfTestStep {
  name: string
  ok: boolean
  detail?: string
}

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function entries(count: number, type: string, prefix: string): Entry[] {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i + 1}`, type, name: `${type}${i + 1}`, keywords: [], unique: false, summary: '', data: { n: i + 1 } }))
}

/**
 * 数据层自检：在独立的临时数据库里走完安装、存档、副本、导出导入的主路径，
 * 用于在真实宿主（TauriTavern 的 WebKit）里确认存储、压缩、哈希、事务都可用。
 * 只使用合成数据，结束后删除临时数据库，不触碰真实数据。
 */
export async function runSelfTest(onStep?: (step: SelfTestStep) => void): Promise<SelfTestStep[]> {
  const steps: SelfTestStep[] = []
  const s = createServices({ dbName: `tavern-trpg-assistant-selftest-${uuid()}`, appVersion: '99.0.0' })
  const owner = { ownerKey: 'char:selftest.png', ownerLabel: '自检角色' }
  const other = { ownerKey: 'char:selftest2.png', ownerLabel: '自检角色二' }
  const hasRule = (id: string) => s.rules.has(id)
  let failed = false

  const run = async (name: string, fn: () => Promise<string | void>): Promise<void> => {
    if (failed) return
    let step: SelfTestStep
    try {
      step = { name, ok: true, detail: (await fn()) || undefined }
    } catch (error) {
      failed = true
      step = { name, ok: false, detail: error instanceof Error ? error.message : String(error) }
    }
    steps.push(step)
    onStep?.(step)
  }

  const tom: Entry = { id: 'tom', type: 'npc', name: '托姆', keywords: ['托姆'], unique: true, summary: '', data: { hp: 9 } }
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))
  const pack = (id: string, category: 'rules' | 'adventure', version = '1.0.0', extra: Entry[] = []) =>
    buildPackFile({
      manifest: { id, ruleId: 'dnd5e2014', category, name: `自检-${id}`, version, relationships: { requires: category === 'adventure' ? [{ id: 'dnd5e2014-srd' }] : [], recommends: [], conflicts: [] } },
      entries: [...entries(5, 'spell', 'sp'), ...extra],
      blobs: new Map([[sha256Hex(png), { bytes: png, mime: 'image/png' }]]),
    })

  try {
    await run('运行环境', async () => {
      check(typeof indexedDB !== 'undefined', '没有 IndexedDB')
      check(typeof structuredClone === 'function', '没有 structuredClone')
      check(typeof crypto?.getRandomValues === 'function', '没有 crypto.getRandomValues')
      check(typeof BroadcastChannel !== 'undefined', '没有 BroadcastChannel（多窗口只读不可用）')
      return `secureContext=${String(globalThis.isSecureContext)}`
    })
    await run('生成并识别内容包（zip 压缩与解压）', async () => {
      const rec = s.packs.recognize(pack('selftest-core', 'rules'))
      check(rec.type === 'pack' && rec.manifest.entryCount === 5, '识别结果不对')
      return `${rec.type === 'pack' ? rec.byteSize : 0} 字节`
    })
    await run('安装内置包与模组（模组依赖核心包）', async () => {
      check((await s.packs.installBuiltin(pack('dnd5e2014-srd', 'rules'))) === 'installed', '内置包未安装')
      const module = s.packs.recognize(pack('selftest-module', 'adventure', '1.0.0', [tom]))
      check(module.type === 'pack', '不是内容包')
      await s.packs.install(module, { source: 'import' })
      check((await s.packs.list()).length === 2, '安装数量不对')
    })
    await run('重复导入同一个包：要求先选择覆盖；选择后升级', async () => {
      const again = s.packs.recognize(pack('selftest-module', 'adventure', '1.1.0', [tom]))
      check(again.type === 'pack', '不是内容包')
      let refused = false
      try {
        await s.packs.install(again, { source: 'import' })
      } catch {
        refused = true
      }
      check(refused, '没有要求选择覆盖')
      await s.packs.install(again, { source: 'import', resolution: 'overwrite' })
      check((await s.db.packs.get('selftest-module'))?.version === '1.1.0', '覆盖后版本不对')
    })
    await run('新存档、修改、保存、分支', async () => {
      const first = await s.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', packIds: ['selftest-module'], name: '自检存档' })
      check(!s.campaign.isDirty(first.workspace), '新存档不应有未保存改动')
      const dirty = await s.campaign.updateData(owner.ownerKey, (d) => ({ ...d, gold: 10 }))
      check(s.campaign.isDirty(dirty), '修改后应为未保存')
      check((await s.campaign.saveCurrent(owner.ownerKey)).changed, '保存应写入')
      const branched = await s.campaign.branch(owner.ownerKey)
      check(branched.save.branchedFrom === first.save.id, '分支来源不对')
    })
    await run('读取存档（写自动存档）与模板副本', async () => {
      const first = (await s.campaign.listManual({ ownerKey: owner.ownerKey, ruleId: 'dnd5e2014' }, 'card')).find((x) => x.name === '自检存档')
      check(first, '找不到第一个存档')
      await s.campaign.loadSave(owner, first.id)
      check((await s.campaign.listAuto(owner.ownerKey, 'dnd5e2014')).length === 1, '没有写自动存档')
      const a = await s.campaign.materialize(owner.ownerKey, { packId: 'selftest-module', entryId: 'tom' })
      const b = await s.campaign.materialize(owner.ownerKey, { packId: 'selftest-module', entryId: 'tom' })
      check(a.created && !b.created, '唯一条目应只有一份')
      const batch = await s.campaign.materialize(owner.ownerKey, { packId: 'selftest-module', entryId: 'sp1' }, 3)
      check(batch.instances.map((i) => i.label).join('') === 'ABC', '批量编号不对')
    })
    await run('删除、最近删除、恢复、彻底删除', async () => {
      const [other1] = (await s.campaign.listManual({ ownerKey: owner.ownerKey, ruleId: 'dnd5e2014' }, 'card')).filter((x) => x.name !== '自检存档')
      await s.campaign.deleteSave(other1.id)
      check((await s.campaign.listDeleted('dnd5e2014')).length === 1, '最近删除应有 1 个')
      await s.campaign.restoreSave(other1.id)
      await s.campaign.deleteSave(other1.id)
      check((await s.campaign.purgeSaves([other1.id])) === 1, '彻底删除失败')
    })
    await run('导出存档并导入到另一张卡', async () => {
      await s.campaign.saveCurrent(owner.ownerKey)
      const current = (await s.campaign.getWorkspace(owner.ownerKey))!.currentSaveId!
      const { bytes } = await exportSaves({ db: s.db, packs: s.packs, now: s.now, appVersion: '99.0.0' }, { type: 'save', saveId: current }, { includePacks: true })
      const rec = s.packs.recognize(bytes) as RecognizedSaveFile
      check(rec.type === 'save' && rec.attachedPacks.size === 1, '导出文件内容不对')
      const items = describeSaveFile(rec, hasRule)
      const result = await importSaves({ db: s.db, campaign: s.campaign, now: s.now, hasRule }, rec, { owner: other, selectedIds: items.map((i) => i.save.id) })
      check(result.imported === 1, '导入数量不对')
      return `${bytes.length} 字节`
    })
    await run('完整备份导出与覆盖恢复', async () => {
      const { bytes } = await exportSaves({ db: s.db, packs: s.packs, now: s.now, appVersion: '99.0.0' }, { type: 'backup' }, { includePacks: false })
      const rec = s.packs.recognize(bytes) as RecognizedSaveFile
      check(rec.type === 'backup' && rec.workspaces.length === 1 && rec.saves.length >= 3, '备份内容不对')
      await s.campaign.updateData(owner.ownerKey, (d) => ({ ...d, gold: 999 }))
      await importSaves({ db: s.db, campaign: s.campaign, now: s.now, hasRule }, rec, { owner, selectedIds: [], mode: 'overwrite' })
      check((await s.campaign.getWorkspace(owner.ownerKey))?.data.gold === 10, '覆盖恢复后数据不对')
      check((await s.campaign.listAuto(owner.ownerKey, 'dnd5e2014')).some((a) => a.autoReason === '恢复备份前'), '没有"恢复备份前"自动存档')
    })
    await run('删除内容包', async () => {
      await s.packs.uninstall('selftest-module')
      check((await s.db.entries.where('packId').equals('selftest-module').count()) === 0, '条目未清除')
    })
  } finally {
    s.db.close()
    await s.db.delete()
  }
  return steps
}
