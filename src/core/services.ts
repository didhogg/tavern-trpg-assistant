import { TrpgDatabase, DEFAULT_DB_NAME } from './db'
import { LibraryService } from './library/service'
import { MyLibrary } from './library/mine'
import { PackService } from './packs/installer'
import { CampaignService, type CampaignDeps } from './saves/campaign'
import { WindowLock } from './windowLock'
import { createRuleRegistry } from '../rules'
import type { RuleRegistry } from '../rules/registry'

export const APP_VERSION: string = __APP_VERSION__

export interface Services {
  db: TrpgDatabase
  rules: RuleRegistry
  packs: PackService
  campaign: CampaignService
  library: LibraryService
  mine: MyLibrary
  lock: WindowLock
  now: () => number
}

/** 创建一套服务；界面与测试都经它取得数据库、安装器与存档服务。 */
export function createServices(opts: { dbName?: string; now?: () => number; rules?: RuleRegistry; campaign?: Partial<CampaignDeps>; appVersion?: string } = {}): Services {
  const now = opts.now ?? Date.now
  const rules = opts.rules ?? createRuleRegistry()
  const db = new TrpgDatabase(opts.dbName ?? DEFAULT_DB_NAME)
  const packs = new PackService(db, { rules, now, appVersion: opts.appVersion ?? APP_VERSION })
  const campaign = new CampaignService(db, { rules, now, ...opts.campaign })
  const library = new LibraryService(db, { rules, now, campaign })
  const mine = new MyLibrary({ db, packs, rules, now })
  return { db, rules, packs, campaign, library, mine, lock: new WindowLock(), now }
}
