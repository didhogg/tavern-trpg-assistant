import type { WorkspaceData } from '../schemas/campaign'
import type { RuleDefinition } from '../rules/registry'

export interface LocationImageLink {
  name: string
  imageUrl?: string
}

/** 地图单元登记：返回从当前地点向上逐级的地点链（含参考图地址）。 */
export type LocationChainProvider = (data: WorkspaceData) => LocationImageLink[]

export interface Banner {
  src: string | null
  alt: string
  source: 'location' | 'parentLocation' | 'default' | 'pattern'
}

export const PATTERN_BANNER: Banner = { src: null, alt: '', source: 'pattern' }

/** 当前地点参考图 → 上级地点参考图 → 本规则默认横幅 → 纹样（U2 §2.4）。 */
export function getCampaignBanner(input: {
  rule: RuleDefinition | undefined
  data: WorkspaceData
  providers?: LocationChainProvider[]
  narrow?: boolean
}): Banner {
  const chain = (input.providers ?? []).flatMap((p) => p(input.data))
  for (let i = 0; i < chain.length; i++) {
    const link = chain[i]
    if (link.imageUrl) return { src: link.imageUrl, alt: link.name, source: i === 0 ? 'location' : 'parentLocation' }
  }
  const banner = input.rule?.defaultBanner
  if (banner) return { src: input.narrow ? banner.narrow : banner.wide, alt: banner.alt, source: 'default' }
  return PATTERN_BANNER
}
