import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { checkIntegrity, repairIssue } from '../../src/core/library/integrity'
import { LibraryService } from '../../src/core/library/service'
import { MyLibrary } from '../../src/core/library/mine'
import { entryKey, libraryOf, ORIGINAL } from '../../src/core/library/types'
import { resolveVariant } from '../../src/core/library/variants'
import { cleanupBlobs, impactLines, uninstallImpact, uninstallPack, restoreBuiltin, purgeExpiredTrash } from '../../src/core/library/uninstall'
import { getBuiltinRemoved } from '../../src/core/packs/builtins'
import type { WorkspaceData } from '../../src/schemas/campaign'
import type { Entry } from '../../src/schemas/pack'
import { OWNER, setup, type Harness } from '../helpers/harness'
import { makeEntries, makePack, makeRegistry, PNG } from '../helpers/fixtures'
import { sha256Hex } from '../../src/core/hash'

let db: TrpgDatabase
let h: Harness
let lib: LibraryService
let mine: MyLibrary
const rules = makeRegistry()

async function install(id: string, extra: Record<string, unknown> = {}, entries: Entry[] = makeEntries(2, 'spell', `${id}-`), more: { features?: unknown[]; assets?: Map<string, Uint8Array> } = {}): Promise<void> {
  const bytes = makePack({ id, name: `包-${id}`, relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] }, ...extra }, entries, more.assets)
  const rec = h.packs.recognize(bytes)
  if (rec.type !== 'pack') throw new Error('应为内容包')
  await h.packs.install(rec, { source: 'import' })
}

async function pack(id: string, extra: Record<string, unknown>, entries: Entry[], features: unknown[]) {
  const { buildPackFile } = await import('../../src/core/packs/file')
  const bytes = buildPackFile({ manifest: { id, ruleId: 'dnd5e2014', category: 'rules', name: `包-${id}`, version: '1.0.0', relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] }, ...extra } as never, entries, features: features as never })
  const rec = h.packs.recognize(bytes)
  if (rec.type !== 'pack') throw new Error('应为内容包')
  await h.packs.install(rec, { source: 'import' })
}

beforeEach(async () => {
  db = new TrpgDatabase(`lib-${uuid()}`)
  h = await setup(db)
  lib = new LibraryService(db, { rules, now: h.clock, campaign: h.campaign })
  mine = new MyLibrary({ db, packs: h.packs, rules, now: h.clock })
  await h.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: [], name: '测试' })
})
afterEach(async () => {
  db.close()
  await db.delete()
})

describe('启用与停用', () => {
  it('启用：依赖一并启用并返回；停用：被依赖的不能停用', async () => {
    const r = await lib.enable(OWNER.ownerKey, 'storm-isle')
    expect(r.workspace.enabledPacks.map((p) => p.id).sort()).toEqual(['dnd5e2014-srd', 'storm-isle'])
    await expect(lib.disable(OWNER.ownerKey, 'dnd5e2014-srd')).rejects.toMatchObject({ code: 'E_CORE_LOCKED' })
    const off = await lib.disable(OWNER.ownerKey, 'storm-isle')
    expect(off.workspace.enabledPacks.map((p) => p.id)).toEqual(['dnd5e2014-srd'])
  })

  it('冲突：不能同时启用，说明原因（双向）', async () => {
    await install('a', { relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [{ id: 'b', reason: '都改了先攻' }] } })
    await install('b')
    await lib.enable(OWNER.ownerKey, 'b')
    await expect(lib.enable(OWNER.ownerKey, 'a')).rejects.toMatchObject({ code: 'E_PACK_CONFLICT', message: expect.stringContaining('都改了先攻') })
    await lib.disable(OWNER.ownerKey, 'b')
    await lib.enable(OWNER.ownerKey, 'a')
    await expect(lib.enable(OWNER.ownerKey, 'b')).rejects.toMatchObject({ code: 'E_PACK_CONFLICT' })
  })

  it('启用没有安装的包：提示先安装', async () => {
    await expect(lib.enable(OWNER.ownerKey, 'nope')).rejects.toMatchObject({ code: 'E_NOT_FOUND' })
  })

  it('停用的预览：列出依赖它的包', async () => {
    await lib.enable(OWNER.ownerKey, 'storm-isle')
    const preview = await lib.previewDisable(OWNER.ownerKey, 'dnd5e2014-srd')
    expect(preview.dependents).toEqual(['storm-isle'])
  })
})

describe('功能与规则选项', () => {
  const opt = (id: string, def: boolean) => ({ id: `ro.${id}`, kind: 'ruleOptions', name: `选项${id}`, description: '', defaultEnabled: def, data: { summary: '说明', implemented: false } })

  it('启用复制定义并写初始值，开关写 featureState，停用后状态保留、重新启用恢复', async () => {
    await pack('house', {}, makeEntries(1, 'spell', 'h-'), [opt('a', true), opt('b', false)])
    let ws = (await lib.enable(OWNER.ownerKey, 'house')).workspace
    const keys = Object.keys(libraryOf(ws.data).features)
    expect(keys).toHaveLength(2)
    ws = await lib.setRuleOption(OWNER.ownerKey, keys.find((k) => k.endsWith('ro.a'))!, false)
    expect(libraryOf(ws.data).featureState[keys.find((k) => k.endsWith('ro.a'))!]).toBe(false)
    ws = (await lib.disable(OWNER.ownerKey, 'house')).workspace
    expect(Object.values(libraryOf(ws.data).features).every((f) => !f.enabled)).toBe(true)
    ws = (await lib.enable(OWNER.ownerKey, 'house')).workspace
    expect(libraryOf(ws.data).featureState[keys.find((k) => k.endsWith('ro.a'))!]).toBe(false)
  })

  it('新战役建立时，已启用包的功能定义也一并复制', async () => {
    await pack('house2', {}, makeEntries(1, 'spell', 'h-'), [opt('a', true)])
    const created = await h.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: ['house2'], name: '第二个' })
    expect(Object.keys(libraryOf(created.workspace.data).features)).toHaveLength(1)
  })
})

describe('修改版', () => {
  const variantEntry = (mode: string, data: Record<string, unknown> = { n: 99 }): Entry =>
    ({ id: 'v1', type: 'spell', name: '改版', keywords: [], unique: false, summary: '改过', data, override: { target: { packId: 'dnd5e2014-srd', entryId: 'e1' }, mode, note: '房规', baseVersion: '1.0.0' } }) as Entry

  it('启用带修改版的包：先固定原版，按默认应用；解析得到修改后的内容', async () => {
    await pack('rules-x', {}, [variantEntry('patch')], [])
    const preview = await lib.previewEnable(OWNER.ownerKey, 'rules-x')
    expect(preview.variants).toHaveLength(1)
    expect(preview.variants[0]).toMatchObject({ conflict: false, defaultUse: true })
    const ws = (await lib.enable(OWNER.ownerKey, 'rules-x')).workspace
    const key = entryKey('dnd5e2014-srd', 'e1')
    const lb = libraryOf(ws.data)
    expect(lb.pins[key].entry.data).toEqual({ n: 1 })
    const resolved = resolveVariant(lb.pins[key].entry, lb.variants[key])
    expect(resolved.entry?.data).toEqual({ n: 99 })
    expect(resolved.active).toContain('rules-x'.length ? 'pack:' : '')
  })

  it('不勾选：加入候选但仍用原版；之后可切换回来', async () => {
    await pack('rules-y', {}, [variantEntry('replace', { n: 7 })], [])
    const preview = await lib.previewEnable(OWNER.ownerKey, 'rules-y')
    let ws = (await lib.enable(OWNER.ownerKey, 'rules-y', { use: { [preview.variants[0].variant.key]: false } })).workspace
    const key = entryKey('dnd5e2014-srd', 'e1')
    expect(libraryOf(ws.data).variants[key].active).toBe(ORIGINAL)
    ws = await lib.switchVariant(OWNER.ownerKey, key, preview.variants[0].variant.key)
    expect(libraryOf(ws.data).variants[key]).toMatchObject({ active: preview.variants[0].variant.key, manual: true })
  })

  it('停用：正在使用的修改版撤下并回到原版；预览里先列出会改回的条目', async () => {
    await pack('rules-z', {}, [variantEntry('hide')], [])
    await lib.enable(OWNER.ownerKey, 'rules-z')
    const preview = await lib.previewDisable(OWNER.ownerKey, 'rules-z')
    expect(preview.reverted).toHaveLength(1)
    const { workspace } = await lib.disable(OWNER.ownerKey, 'rules-z')
    expect(libraryOf(workspace.data).variants[entryKey('dnd5e2014-srd', 'e1')]).toBeUndefined()
  })

  it('玩家亲自选过原版后，新加入的修改版标为冲突、默认保持现状', async () => {
    await pack('rules-a', {}, [variantEntry('replace')], [])
    await lib.enable(OWNER.ownerKey, 'rules-a')
    const key = entryKey('dnd5e2014-srd', 'e1')
    await lib.switchVariant(OWNER.ownerKey, key, ORIGINAL)
    const second = { ...variantEntry('replace', { n: 5 }), id: 'v2' }
    await pack('rules-b', {}, [second], [])
    const preview = await lib.previewEnable(OWNER.ownerKey, 'rules-b')
    expect(preview.variants[0]).toMatchObject({ conflict: true, defaultUse: false })
  })

  it('新战役：已启用的包带来的修改版按默认加入', async () => {
    await pack('rules-c', {}, [variantEntry('replace')], [])
    const created = await h.campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', packIds: ['rules-c'], name: '新' })
    expect(libraryOf(created.workspace.data).variants).toEqual({})
    const ws = await lib.applyDefaultVariants(OWNER.ownerKey)
    expect(libraryOf(ws.data).variants[entryKey('dnd5e2014-srd', 'e1')].active).toContain('pack:')
  })
})

describe('卸载与图片清理', () => {
  it('统计：启用、固定的存档数；说明行按数量拼接', async () => {
    await lib.enable(OWNER.ownerKey, 'storm-isle')
    await h.campaign.saveCurrent(OWNER.ownerKey)
    const impact = await uninstallImpact(db, rules, 'storm-isle')
    expect(impact.enabledIn).toBe(1)
    const lines = impactLines(impact)
    expect(lines[0]).toBe('1 个存档启用了它。')
    expect(lines.some((l) => l.includes('固定了'))).toBe(false)
    expect(lines.at(-1)).toContain('不受影响')
  })

  it('核心包不能卸载；卸载下载的包记入 userRemoved，内置的记入 builtinRemoved', async () => {
    const deps = { db, packs: h.packs, rules, now: h.clock }
    await expect(uninstallPack(deps, 'dnd5e2014-srd')).rejects.toMatchObject({ code: 'E_BUILTIN_PROTECTED' })
    await uninstallPack(deps, 'storm-isle')
    expect(await db.packs.get('storm-isle')).toBeUndefined()
    const extra = h.packs.recognize(makePack({ id: 'extra-b', name: '额外内置' }, makeEntries(1, 'spell', 'x-')))
    if (extra.type !== 'pack') throw new Error()
    await h.packs.install(extra, { source: 'builtin' })
    await uninstallPack(deps, 'extra-b')
    expect(await getBuiltinRemoved(db)).toContain('extra-b')
    await restoreBuiltin(deps, 'extra-b', async () => makePack({ id: 'extra-b', name: '额外内置' }, makeEntries(1, 'spell', 'x-')))
    expect(await db.packs.get('extra-b')).toBeDefined()
    expect(await getBuiltinRemoved(db)).not.toContain('extra-b')
  })

  it('卸载后存档引用的图片不会被删；没有任何引用且超过 24 小时才清理', async () => {
    const hash = sha256Hex(PNG)
    await install('img', {}, makeEntries(1, 'spell', 'i-'), { assets: new Map([['a.png', PNG]]) })
    expect(await db.blobs.get(hash)).toBeDefined()
    await h.campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, instances: [{ id: 'x', type: 't', name: 'n', data: { pic: { $asset: hash } } }] }))
    await h.campaign.saveCurrent(OWNER.ownerKey)
    await uninstallPack({ db, packs: h.packs, rules, now: () => h.clock() + 10 * 86_400_000 }, 'img')
    expect(await db.blobs.get(hash)).toBeDefined()
    await db.saves.clear()
    await db.workspaces.clear()
    expect(await cleanupBlobs(db, h.clock())).toBe(0)
    expect(await cleanupBlobs(db, h.clock() + 2 * 86_400_000)).toBe(1)
    expect(await db.blobs.get(hash)).toBeUndefined()
  })

  it('库回收站：30 天后清除', async () => {
    const p = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    await mine.remove(p.id)
    expect(await purgeExpiredTrash(db, h.clock() + 29 * 86_400_000)).toBe(0)
    expect(await purgeExpiredTrash(db, h.clock() + 31 * 86_400_000)).toBe(1)
  })
})

describe('我的库', () => {
  it('新建：id 以 u- 开头，版本 1.0.0，source 为 user；同名拒绝', async () => {
    const p = await mine.create({ ruleId: 'dnd5e2014', name: '我的资料' })
    expect(p).toMatchObject({ version: '1.0.0', source: 'user' })
    expect(p.id).toMatch(/^u-[a-z0-9]{10}$/)
    await expect(mine.create({ ruleId: 'dnd5e2014', name: ' 我的资料 ' })).rejects.toMatchObject({ code: 'E_BAD_NAME' })
  })

  it('每次保存条目版本号末位加 1；删除、移动、复制都同样；结构不合法的拒绝', async () => {
    const a = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    const b = await mine.create({ ruleId: 'dnd5e2014', name: '乙' })
    const entry: Entry = { id: 'rat', type: 'monster', name: '影鼠', keywords: [], unique: false, summary: '', data: { hp: 5 } }
    expect((await mine.saveEntry(a.id, entry)).version).toBe('1.0.1')
    expect((await mine.saveEntry(a.id, { ...entry, summary: '改' })).version).toBe('1.0.2')
    const copy = await mine.copyEntry(a.id, 'rat')
    expect(copy).toBe('rat-copy')
    await mine.moveEntry(a.id, b.id, 'rat')
    expect((await db.packs.get(a.id))?.entryCount).toBe(1)
    expect((await db.packs.get(b.id))?.entryCount).toBe(1)
    expect((await db.packs.get(b.id))?.version).toBe('1.0.1')
    expect((await mine.deleteEntry(b.id, 'rat')).entryCount).toBe(0)
    await expect(mine.saveEntry(a.id, { ...entry, id: 'BAD ID' } as Entry)).rejects.toMatchObject({ code: 'E_BAD_ENTRY' })
  })

  it('不是我的包不能直接编辑；复制为我的包后可以，且新 lineage、记下来源', async () => {
    await expect(mine.saveEntry('storm-isle', makeEntries(1)[0])).rejects.toMatchObject({ code: 'E_NOT_MINE' })
    const copy = await mine.duplicate('storm-isle')
    expect(copy.name).toBe('包-storm-isle'.length ? `${(await db.packs.get('storm-isle'))!.name}（我的）` : '')
    expect(copy.lineage).not.toBe((await db.packs.get('storm-isle'))!.lineage)
    expect((copy as unknown as { derivedFrom: { id: string } }).derivedFrom.id).toBe('storm-isle')
    expect(copy.entryCount).toBe(2)
    expect((await mine.saveEntry(copy.id, { ...makeEntries(1)[0], id: 'new' })).entryCount).toBe(3)
  })

  it('删除进库回收站（保留完整内容），恢复后条目都在；彻底删除后找不回', async () => {
    const p = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    await mine.saveEntry(p.id, makeEntries(1)[0])
    await mine.remove(p.id)
    expect(await db.packs.get(p.id)).toBeUndefined()
    expect(await mine.trash()).toHaveLength(1)
    const restored = await mine.restore(p.id)
    expect(restored.source).toBe('user')
    expect(restored.entryCount).toBe(1)
    expect(await mine.trash()).toHaveLength(0)
    await mine.remove(p.id)
    await mine.purge(p.id)
    await expect(mine.restore(p.id)).rejects.toMatchObject({ code: 'E_NOT_FOUND' })
  })

  it('导出得到普通扩展包：lineage 不变，别人装上是只读的', async () => {
    const p = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    await mine.saveEntry(p.id, makeEntries(1)[0])
    const rec = h.packs.recognize(await h.packs.exportPack(p.id))
    if (rec.type !== 'pack') throw new Error()
    expect(rec.manifest.lineage).toBe(p.lineage)
    expect(rec.manifest.version).toBe('1.0.1')
  })

  it('用到条目的存档数：删除前提示', async () => {
    const p = await mine.create({ ruleId: 'dnd5e2014', name: '甲' })
    expect(await mine.usage(p.id, 'rat')).toBe(0)
  })
})

describe('存档体检', () => {
  it('引用缺失 / 未固定 / 图片缺失 / 结构不合法 / id 重复 / 修改版无法显示，逐项给出修复', async () => {
    const data = {
      instances: [
        { id: 'a', type: 't', name: '甲', data: { ref: { $ref: 'pack', packId: 'dnd5e2014-srd', entryId: 'e1', name: '法术一' }, gone: { $ref: 'pack', packId: 'ghost', entryId: 'x', name: '幽灵' }, pic: { $asset: 'f'.repeat(64) } } },
        { id: 'a', type: 't', name: '重复', data: {} },
        { bad: true },
      ],
    } as never
    const issues = await checkIntegrity(db, data)
    expect(issues.map((i) => i.kind).sort()).toEqual(['asset-missing', 'bad-item', 'duplicate-id', 'pack-missing', 'pack-unpinned'])
    expect(issues.find((i) => i.kind === 'pack-missing')?.fixes).toEqual(['install', 'text-only'])
    expect(new Set(issues.map((i) => i.id)).size).toBe(issues.length)
  })

  it('修复：固定、改为纯文字、移除图片、换新 id、移入回收站；修复后再检查没有问题', async () => {
    let data: WorkspaceData = {
      instances: [
        { id: 'a', type: 't', name: '甲', data: { ref: { $ref: 'pack', packId: 'dnd5e2014-srd', entryId: 'e1', name: '法术一' }, gone: { $ref: 'pack', packId: 'ghost', entryId: 'x', name: '幽灵' }, pic: { $asset: 'f'.repeat(64) } } },
        { id: 'a', type: 't', name: '重复', data: {} },
        { bad: true },
      ],
    } as unknown as WorkspaceData
    for (const kind of ['pack-unpinned', 'pack-missing', 'asset-missing', 'duplicate-id', 'bad-item'] as const) {
      const issue = (await checkIntegrity(db, data)).find((i) => i.kind === kind)!
      const fix = kind === 'pack-unpinned' ? 'pin' : kind === 'pack-missing' ? 'text-only' : kind === 'asset-missing' ? 'remove-image' : kind === 'duplicate-id' ? 'new-id' : 'trash'
      data = await repairIssue(db, data, issue, fix, 1)
    }
    expect(await checkIntegrity(db, data)).toEqual([])
    const out = data as unknown as { instances: Array<{ data: { gone?: unknown; pic?: unknown } }>; trash: unknown[]; pins: Record<string, unknown> }
    expect(out.instances[0].data.gone).toBe('幽灵')
    expect(out.instances[0].data.pic).toBeUndefined()
    expect(out.trash).toHaveLength(1)
    expect(Object.keys(out.pins)).toEqual(['dnd5e2014-srd/e1'])
  })

  it('没有问题时返回空；固定副本与功能定义内部不扫描', async () => {
    expect(await checkIntegrity(db, { instances: [], pins: { x: { entry: { a: { $ref: 'pack', packId: 'ghost', entryId: 'q' } } } } } as never)).toEqual([])
  })
})
