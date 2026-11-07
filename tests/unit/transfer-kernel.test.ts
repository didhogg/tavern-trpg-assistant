import { describe, expect, it, vi } from 'vitest'
import { KernelSaveService, type KernelRefChecker } from '../../src/core/saves/kernel'
import { writeZip } from '../../src/core/files/zip'
import { estimateExport, exportSaves, type BackupLibraryAdapter } from '../../src/core/transfer/exporter'
import { importSaves } from '../../src/core/transfer/importer'
import { readSaveFile } from '../../src/core/transfer/saveFile'
import { kernelCampaignSchema } from '../../src/schemas/kernel'
import { defaultCampaignLibrary } from '../../src/library/scopes'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'

const NEW = { ...OWNER, ruleId: 'dnd5e2014', name: 'P3-4 文件' }
const REF = { set: 'cn-official', prop: 'spell', hash: 'fireball-phb' }

describe('P3-3 存档文件 / 完整备份', () => {
  it('.trpgsave 带 kernel、版本指纹、依赖清单；导入缺资料列出来', async () => {
    await withDb(async (db) => {
      const { campaign, clock } = await setup(db)
      const { save } = await campaign.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const kernel = new KernelSaveService({ db, campaign, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, kernelCampaignSchema.parse({
        rule: 'dnd5e2014', kernelVersion: 1, library: defaultCampaignLibrary('dnd5e2014', 'cn'),
        dataVersion: { official: 'official-1', brews: { 'cn-brew': 'brew-1' } },
        overrides: [{ target: { kind: 'entry', ...REF }, house: { kind: 'houserule', set: 'cn-brew', prop: 'spell', hash: 'house-1' }, digest: 'd1' }],
        actors: [{ id: 'hero', name: '测试角色', refs: [{ kind: 'spell', ...REF }], choices: {}, state: {}, adjustments: {}, dice: [] }],
      }))
      await campaign.saveCurrent(OWNER.ownerKey)
      const deps = { db, now: clock, appVersion: '1.0.0' }
      const { bytes } = await exportSaves(deps, { type: 'save', saveId: save.id })
      const rec = readSaveFile(bytes)
      expect(rec.saves[0].snapshot.kernel).toBeTruthy()
      expect(rec.manifest.dependencies).toContainEqual({ set: REF.set, prop: REF.prop, hash: REF.hash, rule: 'dnd5e2014' })
      expect(rec.manifest.kernelVersions).toMatchObject([{ saveId: save.id, rule: 'dnd5e2014', official: 'official-1', brews: { 'cn-brew': 'brew-1' } }])

      const result = await importSaves({ db, campaign, now: clock, hasRule: (id) => id === 'dnd5e2014',
        checkRefs: async (refs) => refs.map((ref) => ({ ok: ref.hash !== REF.hash, ref, reason: 'not-installed' })),
      }, rec, { owner: OWNER, selectedIds: [save.id] })
      expect(result).toMatchObject({ imported: 1, dependencies: 2, dependenciesUnchecked: false, library: null })
      expect(result.missing).toMatchObject([{ ref: { set: REF.set, prop: REF.prop, hash: REF.hash }, reason: 'not-installed' }])
    })
  })

  it('完整备份：带上自制/范围/房规；先恢复库再恢复存档；缺官方数据列出来；大小有数值', async () => {
    await withDb(async (db) => {
      const { campaign, clock } = await setup(db)
      const { save } = await campaign.startNewCampaign(NEW)
      await campaign.saveCurrent(OWNER.ownerKey)
      const fake: BackupLibraryAdapter = {
        exportFiles: vi.fn(async () => ({
          'brew/cn/test.json': JSON.stringify({ _meta: { sources: [{ json: 'TEST' }] } }),
          'scopes.json': JSON.stringify({ format: 'trpg-library-scopes', version: 1, scopes: [], assignments: {} }),
          'house-rules.json': JSON.stringify([]),
        })),
        importFiles: vi.fn(async () => ({ brews: 1, scopes: 0, houseRules: 0, errors: [] })),
      }
      const deps = { db, now: clock, appVersion: '1.0.0', library: fake }
      const estimate = await estimateExport(deps, { type: 'backup' })
      expect(estimate.libraryBytes).toBeGreaterThan(0)
      expect(estimate.totalBytes).toBeGreaterThanOrEqual(estimate.libraryBytes)
      const { bytes } = await exportSaves(deps, { type: 'backup' })
      const rec = readSaveFile(bytes)
      expect(rec.libraryFiles['brew/cn/test.json']).toContain('TEST')
      expect(rec.libraryFiles['scopes.json']).toBeTruthy()
      const result = await importSaves({
        db, campaign, now: clock, hasRule: (id) => id === 'dnd5e2014', library: fake,
        checkRefs: async (refs) => refs.map((ref) => ({ ok: true, ref })),
      }, rec, { owner: OWNER, selectedIds: [save.id], mode: 'merge' })
      expect(fake.importFiles).toHaveBeenCalledWith(rec.libraryFiles)
      expect(result.library).toEqual({ brews: 1, scopes: 0, houseRules: 0, errors: [] })
    })
  })

  it('旧格式 3 的 .trpgsave 仍可读，依赖清单默认为空', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const { save } = await campaign.startNewCampaign(NEW)
      const bytes = writeZip({
        'trpg-manifest.json': JSON.stringify({ format: 'trpg-save', formatVersion: 3, appVersion: '1.0', exportedAt: '2026-11-08T00:00:00.000Z', ruleIds: ['dnd5e2014'] }),
        [`saves/${save.id}.json`]: JSON.stringify(save),
      })
      const rec = readSaveFile(bytes)
      expect(rec.type).toBe('save')
      expect(rec.manifest.dependencies).toEqual([])
      expect(rec.manifest.kernelVersions).toEqual([])
    })
  })
})
