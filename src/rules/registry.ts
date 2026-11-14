export interface RuleBanner {
  wide: string
  narrow: string
  alt: string
}

/** 这个规则用哪个结算适配器、启动时给它什么设置。没有 = 结算还没接，不能建战役。 */
export interface RuleKernel {
  /** 结算适配器的登记名（kernel/adapters.ts）。 */
  adapter: string
  /** 交给适配器的规则设置（Foundry 适配器 = 世界设置，例：dnd5e.rulesVersion = legacy）。 */
  settings: Record<string, unknown>
}

/**
 * 规则的静态定义：全部写在数据里（library/scopes.json 的 rules，P5.6），加一个规则 = 加一段数据。
 * 一条登记 = 一个规则版本（如 D&D 5e 的 2014 / 2024）；同一体系的版本用 family 归在一起，共用同一个【库】（P5-5 §13）。
 */
export interface RuleDefinition {
  id: string
  name: string
  nameShort: string
  description: string
  /** 体系（游戏系统）编号，如 dnd5e；向导第①步按它分组。 */
  family: string
  /** 体系显示名，如「D&D 5e」。 */
  familyName: string
  /** 这个版本的短标签，和书架上的规则标签同一套写法（5e / 5.5e）。 */
  versionLabel: string
  /** 首页默认战役横幅；未提供时使用纹样底图。 */
  defaultBanner?: RuleBanner
  /** 结算接到哪个适配器；没有 = 只登记、不能建战役。 */
  kernel?: RuleKernel
}

export interface RuleRegistryOptions {
  /** 结算内核支不支持这个规则版本；不支持的只能看资料，不能建战役（status = coming）。不给 = 全部支持（测试用）。 */
  kernelReady?: (ruleId: string) => boolean
}

export class RuleRegistry {
  private readonly rules = new Map<string, RuleDefinition>()

  constructor(private readonly opts: RuleRegistryOptions = {}) {}

  register(rule: RuleDefinition): void {
    if (this.rules.has(rule.id)) throw new Error(`规则已注册：${rule.id}`)
    this.rules.set(rule.id, rule)
  }

  get(id: string): RuleDefinition | undefined {
    return this.rules.get(id)
  }

  has(id: string): boolean {
    return this.rules.has(id)
  }

  list(): RuleDefinition[] {
    return [...this.rules.values()]
  }

  /** 能不能用它建战役（结算内核接入了没有）。 */
  ready(id: string): boolean {
    return this.rules.has(id) && (this.opts.kernelReady?.(id) ?? true)
  }
}

export type RuleCardStatus = 'installed' | 'installable' | 'coming'

export interface RuleCard {
  id: string
  name: string
  nameShort: string
  description: string
  family: string
  familyName: string
  versionLabel: string
  /** installed = 能建战役；coming = 结算规则还没接入（资料照常能下载、能看）。 */
  status: RuleCardStatus
}

/** 规则卡（一个版本一张）：来自注册表，状态按结算内核支不支持算，不写死。 */
export function buildRuleCards(registry: RuleRegistry): RuleCard[] {
  return registry.list().map((r) => ({
    id: r.id,
    name: r.name,
    nameShort: r.nameShort,
    description: r.description,
    family: r.family,
    familyName: r.familyName,
    versionLabel: r.versionLabel,
    status: registry.ready(r.id) ? 'installed' : 'coming',
  }))
}

export interface RuleFamily {
  family: string
  name: string
  /** 这个体系下的版本，按登记顺序。 */
  versions: RuleCard[]
  /** 至少有一个版本能建战役。 */
  ready: boolean
}

/** 按体系分组（向导第①步选体系、第②步选版本）。 */
export function buildRuleFamilies(registry: RuleRegistry): RuleFamily[] {
  const out = new Map<string, RuleFamily>()
  for (const card of buildRuleCards(registry)) {
    const f = out.get(card.family) ?? { family: card.family, name: card.familyName, versions: [], ready: false }
    f.versions.push(card)
    f.ready ||= card.status === 'installed'
    out.set(card.family, f)
  }
  return [...out.values()]
}
