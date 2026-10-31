import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { PackService } from '../../src/core/packs/installer'
import type { Entry } from '../../src/schemas/pack'
import { makePack, makeRegistry } from '../helpers/fixtures'

const entry = (id: string, type: string, name: string, data: Record<string, unknown>): Entry => ({ id, type, name, keywords: [], unique: false, summary: '', data })
const deps = (id: string, extra: Record<string, unknown> = {}) => ({ id, ruleId: 'dnd5e2014', category: 'rules' as const, name: id, version: '1.0.0', relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] }, dataVersion: 3, ...extra })

/** 一个「官方基础包」：职业、子职业（带 3 级选择池）、一个职业特性。 */
const baseEntries = (): Entry[] => [
  entry('class.cleric.phb', 'class', '牧师', { advancement: [] }),
  entry('feature.cleric-spellcasting.phb', 'feature', '施法', { owner: { type: 'class', id: 'class.cleric.phb' }, level: 1 }),
  entry('subclass.cleric-life.phb', 'subclass', '生命领域', { classId: 'class.cleric.phb', advancement: [{ kind: 'itemChoice', level: 3, count: 1, pool: ['feature.cleric-spellcasting.phb'] }] }),
]

/** 自制包「示例」：声明依赖基础包，用 joins 给牧师 2 级加一个可选特性、给生命领域 3 级的选择池加一个选项。 */
const homebrew = (over: Record<string, unknown> = {}, joins: unknown[] = [{ to: 'class.cleric.phb', level: 2, as: 'optional', replaces: 'feature.cleric-spellcasting.phb' }]): Uint8Array => makePack(
  deps('homebrew', { relationships: { requires: [{ id: 'dnd5e2014-srd' }, { id: 'base' }], recommends: [], conflicts: [] }, ...over }),
  [entry('feature.home-blessing.hb', 'feature', '自制祝福', { owner: { type: 'class', id: 'class.cleric.phb' }, level: 2, optional: true, joins })],
)

async function withService(run: (svc: PackService, db: TrpgDatabase) => Promise<void>): Promise<void> {
  const db = new TrpgDatabase(`r-${uuid()}`)
  const svc = new PackService(db, { rules: makeRegistry(), now: () => 1, appVersion: '99.0.0' })
  try {
    const srd = svc.recognize(makePack({ ...deps('dnd5e2014-srd'), relationships: { requires: [], recommends: [], conflicts: [] } }, baseEntries()))
    if (srd.type !== 'pack') throw new Error('应为内容包')
    await svc.install(srd, { source: 'builtin' })
    await run(svc, db)
  } finally { db.close(); await db.delete() }
}
const install = async (svc: PackService, bytes: Uint8Array) => { const rec = svc.recognize(bytes); if (rec.type !== 'pack') throw new Error('应为内容包'); return svc.install(rec, { source: 'import' }) }

describe('官方包与自制包同一个校验', () => {
  it('自制示例包：依赖基础包，用 joins 给牧师加可选特性——能安装', async () => {
    await withService(async (svc) => {
      await install(svc, makePack(deps('base'), []))
      await expect(install(svc, homebrew())).resolves.toMatchObject({ id: 'homebrew' })
    })
  })

  it('joins 指向不存在的条目、不是职业 / 子职业、等级不对、替代的特性不属于目标：新格式的包被拒绝，提示说清是哪个条目', async () => {
    await withService(async (svc) => {
      await install(svc, makePack(deps('base'), []))
      await expect(install(svc, homebrew({}, [{ to: 'class.nope.phb', level: 2, as: 'optional' }]))).rejects.toMatchObject({ code: 'E_BAD_REFS', message: expect.stringContaining('feature.home-blessing.hb') })
      await expect(install(svc, homebrew({}, [{ to: 'feature.cleric-spellcasting.phb', level: 2, as: 'optional' }]))).rejects.toMatchObject({ code: 'E_BAD_REFS' })
      await expect(install(svc, homebrew({}, [{ to: 'class.cleric.phb', level: 40, as: 'optional' }]))).rejects.toMatchObject({ code: 'E_BAD_REFS' })
      await expect(install(svc, homebrew({}, [{ to: 'class.cleric.phb', level: 2, as: 'option' }]))).rejects.toMatchObject({ code: 'E_BAD_REFS' }) // 牧师 2 级没有选择池
      await expect(install(svc, homebrew({}, [{ to: 'subclass.cleric-life.phb', level: 3, as: 'optional', replaces: 'feature.home-blessing.hb' }]))).rejects.toMatchObject({ code: 'E_BAD_REFS' })
    })
  })

  it('选择池选项：加入生命领域 3 级的选择池——能安装', async () => {
    await withService(async (svc) => {
      await install(svc, makePack(deps('base'), []))
      await expect(install(svc, homebrew({}, [{ to: 'subclass.cleric-life.phb', level: 3, as: 'option' }]))).resolves.toMatchObject({ id: 'homebrew' })
    })
  })

  it('引用了没有声明为依赖的包里的条目：被拒绝（方向只能向下，依赖必须写明）', async () => {
    await withService(async (svc) => {
      await install(svc, makePack(deps('base'), []))
      await install(svc, makePack(deps('other'), [entry('feature.other.ot', 'feature', '别人的', {})]))
      const bytes = makePack(deps('hb2', { relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] } }), [entry('feature.x.hb', 'feature', 'X', { owner: { type: 'class', id: 'class.cleric.phb' }, level: 2, advancement: [{ kind: 'itemGrant', level: 2, items: ['feature.other.ot'], optional: false }] })])
      await expect(install(svc, bytes)).rejects.toMatchObject({ code: 'E_BAD_REFS', message: expect.stringContaining('没有声明为依赖') })
    })
  })

  it('旧格式（dataVersion < 3）的包引用不合规：只提示，照常安装（设备上已有的旧版书不能因此装不上）', async () => {
    await withService(async (svc) => {
      await install(svc, makePack(deps('base'), []))
      await expect(install(svc, homebrew({ dataVersion: 2 }, [{ to: 'class.nope.phb', level: 2, as: 'optional' }]))).resolves.toMatchObject({ id: 'homebrew' })
    })
  })
})
