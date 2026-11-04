import type { StoredEntry } from '../../schemas/pack'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'

/** 库里的一条规则（速查）：打开它用 openEntry(packId, id, name)。 */
export interface RuleRef { packId: string; id: string; name: string }

const cache = new Map<string, Promise<StoredEntry[]>>()

/** 当前战役已启用的包里，按英文名找一条规则条目（如 "Proficiency Bonus"）。没安装对应的书就返回 undefined——界面不显示入口，不手写说明。 */
export async function findRule(nameEn: string): Promise<RuleRef | undefined> {
  const campaign = useCampaignStore()
  const ruleId = campaign.workspace?.ruleId ?? 'dnd5e2014'
  const enabled = new Set(campaign.workspace?.enabledPacks.map((p) => p.id) ?? [])
  const key = `${ruleId}|${[...enabled].sort().join(',')}`
  if (!cache.has(key)) cache.set(key, useAppStore().svc().db.entries.where('[ruleId+type]').equals([ruleId, 'rule']).toArray().then((rows) => (rows as StoredEntry[]).filter((row) => !enabled.size || enabled.has(row.packId))))
  const want = nameEn.toLowerCase()
  const hit = (await cache.get(key)!).find((row) => (row.nameEn ?? '').toLowerCase() === want)
  return hit ? { packId: hit.packId, id: hit.entryId, name: hit.name } : undefined
}

/** 装了新包后调用（测试里也用）。 */
export function resetRuleLookup(): void { cache.clear() }
