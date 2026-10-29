/** 变体背景的命名修正；条目 id → 规范中文名。R14 应用。 */
export interface NameOverride {
  name: string
  source: string
  page: number
  basis: string
}

export const NAME_OVERRIDES: Record<string, NameOverride> = {
  'background.variant-noble-retainers.phb': {
    name: '变体贵族：家仆', source: 'PHB', page: 136,
    basis: 'PHB 第 136 页：Variant Noble (Retainers)，与「变体贵族：骑士」同组；原名「变体特性：家仆」是误译',
  },
  'background.variant-city-watch-investigator.scag': {
    name: '变体城市守卫：调查员', source: 'SCAG', page: 145,
    basis: 'SCAG 第 145 页：Variant City Watch (Investigator)；原名「变体：调查员」缺少主背景名',
  },
}
