export interface RuleBanner {
  wide: string
  narrow: string
  alt: string
}

/** 规则的静态定义；规则引擎与界面配置由各规则自己的模块提供。 */
export interface RuleDefinition {
  id: string
  name: string
  nameShort: string
  description: string
  /** 核心包：始终启用且不可停用。 */
  corePackIds: string[]
  /** 首页默认战役横幅；未提供时使用纹样底图。 */
  defaultBanner?: RuleBanner
}

export class RuleRegistry {
  private readonly rules = new Map<string, RuleDefinition>()

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
}

export type RuleCardStatus = 'installed' | 'installable' | 'coming'

export interface RuleCard {
  id: string
  name: string
  nameShort: string
  description: string
  status: RuleCardStatus
}

/** 规则卡：已安装的规则来自注册表，其余来自数据仓库目录。 */
export function buildRuleCards(
  registry: RuleRegistry,
  catalogRules: Array<{ id: string; name: string; nameShort: string; description: string; status: 'installable' | 'coming' }> = [],
): RuleCard[] {
  const installed: RuleCard[] = registry.list().map((r) => ({
    id: r.id,
    name: r.name,
    nameShort: r.nameShort,
    description: r.description,
    status: 'installed',
  }))
  const others: RuleCard[] = catalogRules.filter((r) => !registry.has(r.id)).map((r) => ({ ...r }))
  return [...installed, ...others]
}
