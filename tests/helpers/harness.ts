import type { TrpgDatabase } from '../../src/core/db'
import { CampaignService, type CampaignDeps } from '../../src/core/saves/campaign'
import { makeClock, makeRegistry } from './fixtures'

export const OWNER = { ownerKey: 'char:COC跑团.png', ownerLabel: 'COC跑团' }
export const OTHER_OWNER = { ownerKey: 'char:龙金劫.png', ownerLabel: '龙金劫' }

export interface Harness {
  db: TrpgDatabase
  clock: () => number
  campaign: CampaignService
}

/** 搭好数据库和存档服务。 */
export async function setup(db: TrpgDatabase, deps: Partial<CampaignDeps> = {}): Promise<Harness> {
  const clock = makeClock()
  const campaign = new CampaignService(db, { rules: makeRegistry(), now: clock, ...deps })
  return { db, clock, campaign }
}
