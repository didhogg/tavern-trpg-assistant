export interface RuleOptionConfig {
  id: string
  name: string
  source: string
  /** 在 5etools variantrules 中的中文名（用于取正文）。 */
  rawNames: string[]
  implemented: boolean
}

/** D1 §4.7 首批规则选项。 */
export const RULE_OPTIONS: RuleOptionConfig[] = [
  { id: 'encumbrance', name: '负重（变体）', source: 'PHB', rawNames: ['负重'], implemented: false },
  { id: 'side-initiative', name: '阵营先攻', source: 'DMG', rawNames: ['先攻变体'], implemented: false },
  { id: 'massive-damage', name: '大量伤害', source: 'DMG', rawNames: ['过量伤害'], implemented: false },
  { id: 'lingering-injuries', name: '重伤', source: 'DMG', rawNames: ['伤患'], implemented: false },
  { id: 'healers-kit-dependency', name: '依赖医疗包', source: 'DMG', rawNames: ['治疗'], implemented: false },
  { id: 'slow-natural-healing', name: '缓慢自然恢复', source: 'DMG', rawNames: ['治疗', '休息变体'], implemented: false },
  { id: 'gritty-realism', name: '写实休息', source: 'DMG', rawNames: ['休息变体'], implemented: false },
  { id: 'epic-heroism', name: '史诗英雄休息', source: 'DMG', rawNames: ['休息变体'], implemented: false },
  { id: 'feats', name: '使用专长', source: 'PHB', rawNames: ['专长'], implemented: false },
  { id: 'multiclassing', name: '允许兼职', source: 'PHB', rawNames: ['兼职'], implemented: false },
]
