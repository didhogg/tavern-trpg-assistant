/**
 * 资源池名 → 池特性编号（5etools `consumes.ENG_name` 用的名字）。
 * 键是 5etools 的池名；值按职业中文名（5etools 的 `className`）选，`*` 表示不分职业（可选特性没有职业）。
 * 新书带来新的池时在这里加一行；解析不到的会被数据测试拦下（见 tests/data/pools-consumes.test.ts）。
 */
export const POOL_FEATURES: Record<string, Record<string, string>> = {
  'Channel Divinity': { 牧师: 'feature.cleric-channel-divinity.phb', 圣武士: 'feature.paladin-channel-divinity.phb' },
  'Wild Shape': { '*': 'feature.druid-wild-shape.phb' },
  Ki: { '*': 'feature.monk-ki.phb' },
  'Psionic Energy Die': { 战士: 'feature.fighter-psi-warrior-psionic-power.tce', 游荡者: 'feature.rogue-soulknife-psionic-power.tce' },
  'Sorcery Point': { '*': 'feature.sorcerer-sorcery-points.phb' },
  'Superiority Die': { '*': 'feature.fighter-battle-master-combat-superiority.phb' },
  'Arcane Shot': { '*': 'feature.fighter-arcane-archer-arcane-shot.xge' },
}

/** 按池名与职业找池特性；找不到返回 undefined（调用方保留原名，数据测试会报出来）。 */
export function poolFeatureId(poolEn: string, className: string): string | undefined {
  const row = POOL_FEATURES[poolEn]
  return row ? row[className] ?? row['*'] : undefined
}
