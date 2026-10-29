export interface RuleOptionConfig {
  id: string
  name: string
  source: string
  rawNames: string[]
  engine?: string
  group?: string
}

/** D1 §4.7 首批规则选项。engine 为空表示只有说明；group 相同互斥。 */
export const RULE_OPTIONS: RuleOptionConfig[] = [
  { id: 'encumbrance', name: '负重（变体）', source: 'PHB', rawNames: ['负重'], engine: 'encumbrance.variant' },
  { id: 'side-initiative', name: '阵营先攻', source: 'DMG', rawNames: ['先攻变体'], engine: 'initiative.side' },
  { id: 'massive-damage', name: '大量伤害', source: 'DMG', rawNames: ['过量伤害'], engine: 'damage.massive' },
  { id: 'lingering-injuries', name: '重伤', source: 'DMG', rawNames: ['伤患'] },
  { id: 'healers-kit-dependency', name: '依赖医疗包', source: 'DMG', rawNames: ['治疗'] },
  { id: 'slow-natural-healing', name: '缓慢自然恢复', source: 'DMG', rawNames: ['治疗', '休息变体'] },
  { id: 'gritty-realism', name: '写实休息', source: 'DMG', rawNames: ['休息变体'], engine: 'rest.gritty', group: 'rest' },
  { id: 'epic-heroism', name: '史诗英雄休息', source: 'DMG', rawNames: ['休息变体'], engine: 'rest.epic', group: 'rest' },
  { id: 'feats', name: '使用专长', source: 'PHB', rawNames: ['专长'], engine: 'character.feats' },
  { id: 'multiclassing', name: '允许兼职', source: 'PHB', rawNames: ['兼职'], engine: 'character.multiclassing' },
]
