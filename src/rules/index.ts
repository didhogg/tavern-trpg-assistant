import { RuleRegistry } from './registry'
import { dnd5e2014 } from './dnd5e2014'

/** 创建包含全部内置规则的注册表。 */
export function createRuleRegistry(): RuleRegistry {
  const registry = new RuleRegistry()
  registry.register(dnd5e2014)
  return registry
}
