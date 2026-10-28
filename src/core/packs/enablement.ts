import { TrpgError } from '../errors'
import type { EnabledPack } from '../../schemas/campaign'
import type { InstalledPack } from '../../schemas/pack'
import type { RuleDefinition } from '../../rules/registry'

export interface EnableResult {
  enabledPacks: EnabledPack[]
  /** 因依赖而自动一并启用的内容包 id。 */
  autoEnabled: string[]
}

/** 依赖 `packId` 的、已启用的内容包 id。 */
export function enabledDependents(packId: string, enabled: EnabledPack[], installed: Map<string, InstalledPack>): string[] {
  return enabled.filter((e) => installed.get(e.id)?.dependsOn.some((d) => d.id === packId)).map((e) => e.id)
}

export function enablePack(enabled: EnabledPack[], packId: string, installed: Map<string, InstalledPack>, rule: RuleDefinition): EnableResult {
  const next = [...enabled]
  const autoEnabled: string[] = []
  const visit = (id: string, viaDependency: boolean): void => {
    if (next.some((e) => e.id === id)) return
    const pack = installed.get(id)
    if (!pack) throw new TrpgError('E_DEP_MISSING', `需要先安装『${id}』`, { packId: id })
    if (pack.ruleId !== rule.id) throw new TrpgError('E_RULE_MISMATCH', `『${pack.name}』属于其他规则，不能在当前存档中启用`)
    for (const dep of pack.dependsOn) visit(dep.id, true)
    next.push({ id, version: pack.version })
    if (viaDependency) autoEnabled.push(id)
  }
  visit(packId, false)
  return { enabledPacks: next, autoEnabled }
}

export function disablePack(enabled: EnabledPack[], packId: string, installed: Map<string, InstalledPack>, rule: RuleDefinition): EnabledPack[] {
  if (rule.corePackIds.includes(packId)) throw new TrpgError('E_CORE_LOCKED', '核心规则始终启用，不能停用')
  const dependents = enabledDependents(packId, enabled, installed)
  if (dependents.length) {
    const names = dependents.map((id) => `『${installed.get(id)?.name ?? id}』`).join('、')
    throw new TrpgError('E_REQUIRED_BY', `${names}依赖它，不能停用`, { dependents })
  }
  return enabled.filter((e) => e.id !== packId)
}
