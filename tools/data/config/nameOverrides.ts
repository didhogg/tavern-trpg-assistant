/** 变体背景的命名修正；条目 id → 规范中文名。R14 应用。 */
export interface NameOverride {
  name: string
  source: string
  page: number
  basis: string
}

export const NAME_OVERRIDES: Record<string, NameOverride> = {
  'feature.monk-ki.phb': {
    name: '气', source: 'PHB', page: 76,
    basis: 'PHB 第 76 页武僧「气」：本条正文已写「一股名为气的神秘能量」；5etools 中文版与规格 §5.9 均约定武僧 Ki 的中文名为「气」',
  },
  'background.variant-noble-retainers.phb': {
    name: '变体贵族：家仆', source: 'PHB', page: 136,
    basis: 'PHB 第 136 页：Variant Noble (Retainers)，与「变体贵族：骑士」同组；原名「变体特性：家仆」是误译',
  },
  'background.variant-city-watch-investigator.scag': {
    name: '变体城市守卫：调查员', source: 'SCAG', page: 145,
    basis: 'SCAG 第 145 页：Variant City Watch (Investigator)；原名「变体：调查员」缺少主背景名',
  },
}
