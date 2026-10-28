import type { TrpgDatabase } from '../../src/core/db'
import { PackService } from '../../src/core/packs/installer'
import { CampaignService, type CampaignDeps } from '../../src/core/saves/campaign'
import { makeClock, makeEntries, makePack, makeRegistry } from './fixtures'
import type { Entry } from '../../src/schemas/pack'

export const OWNER = { ownerKey: 'char:COC跑团.png', ownerLabel: 'COC跑团' }
export const OTHER_OWNER = { ownerKey: 'char:龙金劫.png', ownerLabel: '龙金劫' }

export interface Harness {
  db: TrpgDatabase
  clock: () => number
  packs: PackService
  campaign: CampaignService
}

/** 搭好数据库、内置 SRD 包（3 条）、示例模组（依赖 SRD，含唯一与普通条目）。 */
export async function setup(db: TrpgDatabase, deps: Partial<CampaignDeps> = {}): Promise<Harness> {
  const clock = makeClock()
  const rules = makeRegistry()
  const packs = new PackService(db, { rules, now: clock, appVersion: '1.0.0' })
  await packs.installBuiltin(makePack({ id: 'dnd5e2014-srd', name: 'SRD 基础规则' }, makeEntries(3)))
  const moduleEntries: Entry[] = [
    { id: 'kobold', type: 'monster', name: '狗头人', keywords: [], unique: false, summary: '', data: { hp: 5, tags: ['a'] } },
    { id: 'tom', type: 'npc', name: '老渔夫托姆', keywords: ['托姆'], unique: true, summary: '', data: { hp: 9 } },
  ]
  const rec = packs.recognize(makePack({ id: 'storm-isle', category: 'adventure', name: '风暴岛', relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] } }, moduleEntries))
  if (rec.type !== 'pack') throw new Error('夹具应为内容包')
  await packs.install(rec, { source: 'import' })
  const campaign = new CampaignService(db, { rules, now: clock, ...deps })
  return { db, clock, packs, campaign }
}

export async function installExtra(h: Harness, id: string, extra: Record<string, unknown> = {}): Promise<void> {
  const rec = h.packs.recognize(makePack({ id, name: `扩展-${id}`, ...extra }, makeEntries(2, 'spell', `${id}-`)))
  if (rec.type !== 'pack') throw new Error('夹具应为内容包')
  await h.packs.install(rec, { source: 'import' })
}
