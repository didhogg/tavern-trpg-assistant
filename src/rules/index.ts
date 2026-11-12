import { RuleRegistry } from './registry'
import { dnd5e2014 } from './dnd5e2014'
import { dnd5e2024 } from './dnd5e2024'
import { kernelSupports } from './kernel/input'

/** 创建包含全部内置规则的注册表。能不能建战役看结算内核支不支持（不写死）。 */
export function createRuleRegistry(): RuleRegistry {
  const registry = new RuleRegistry({ kernelReady: kernelSupports })
  registry.register(dnd5e2014)
  registry.register(dnd5e2024)
  return registry
}
