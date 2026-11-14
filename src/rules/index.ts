import registry from '../library/scopes.json'
import { RuleRegistry, type RuleDefinition } from './registry'
import { kernelSupports } from './kernel/adapters'

type RuleData = Omit<RuleDefinition, 'id'>

/** 规则定义全部来自数据（library/scopes.json 的 rules）；能不能建战役看规则有没有接到登记过的结算适配器（不写死）。 */
export function ruleDefinitions(): RuleDefinition[] {
  return Object.entries(registry.rules as Record<string, RuleData>).map(([id, r]) => ({
    id,
    name: r.name,
    nameShort: r.nameShort,
    description: r.description,
    family: r.family,
    familyName: r.familyName,
    versionLabel: r.versionLabel,
    ...(r.defaultBanner ? { defaultBanner: r.defaultBanner } : {}),
    ...(r.kernel ? { kernel: r.kernel } : {}),
  }))
}

/** 创建包含全部登记规则的注册表。 */
export function createRuleRegistry(): RuleRegistry {
  const registry = new RuleRegistry({ kernelReady: kernelSupports })
  for (const rule of ruleDefinitions()) registry.register(rule)
  return registry
}
