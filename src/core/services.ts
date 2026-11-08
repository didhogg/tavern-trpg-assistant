import { createBackend, type Backend, type BackendOptions } from './backend'
import { TrpgDatabase, DEFAULT_DB_NAME } from './db'
import { CampaignService, type CampaignDeps } from './saves/campaign'
import { WindowLock } from './windowLock'
import { createRuleRegistry } from '../rules'
import type { RuleRegistry } from '../rules/registry'

export const APP_VERSION: string = __APP_VERSION__

export interface Services {
  db: TrpgDatabase
  rules: RuleRegistry
  campaign: CampaignService
  lock: WindowLock
  now: () => number
  /** 【库】、结算内核、内核存档：界面只从这里取。 */
  backend: Backend
}

/** 创建一套服务；界面与测试都经它取得数据库、存档服务与后端（【库】、结算内核、内核存档）。 */
export function createServices(opts: {
  dbName?: string
  now?: () => number
  rules?: RuleRegistry
  campaign?: Partial<CampaignDeps>
  backend?: Pick<BackendOptions, 'pluginRoot' | 'container' | 'libraryDbName'>
} = {}): Services {
  const now = opts.now ?? Date.now
  const rules = opts.rules ?? createRuleRegistry()
  const db = new TrpgDatabase(opts.dbName ?? DEFAULT_DB_NAME)
  const campaign = new CampaignService(db, { rules, now, ...opts.campaign })
  const backend = createBackend({ db, campaign, rules, now, ...opts.backend })
  return { db, rules, campaign, lock: new WindowLock(), now, backend }
}
