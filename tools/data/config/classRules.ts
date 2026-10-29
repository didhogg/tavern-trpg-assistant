/** 职业表中需要转成 scaleValue 的列；按「职业|来源」和原始列名匹配。 */
export interface ScaleColumn {
  id: string
  label: string
  type: 'number' | 'dice' | 'distance'
}

export const CLASS_SCALE_COLUMNS: Record<string, Record<string, ScaleColumn>> = {
  '野蛮人|PHB': {
    狂暴次数: { id: 'rage-uses', label: '狂暴次数', type: 'number' },
    狂暴伤害: { id: 'rage-damage', label: '狂暴伤害', type: 'number' },
  },
  '武僧|PHB': {
    武艺: { id: 'martial-arts', label: '武艺', type: 'dice' },
    气点: { id: 'ki-points', label: '气点', type: 'number' },
    无甲移动: { id: 'unarmored-movement', label: '无甲移动', type: 'distance' },
  },
  '游荡者|PHB': {
    偷袭: { id: 'sneak-attack', label: '偷袭', type: 'dice' },
  },
  '术士|PHB': {
    术法点: { id: 'sorcery-points', label: '术法点', type: 'number' },
  },
  '奇械师|TCE': {
    已知注法: { id: 'infusions-known', label: '已知注法', type: 'number' },
    注法数量: { id: 'infusions-active', label: '可激活注法', type: 'number' },
  },
  '魔契师|PHB': {
    已知祈唤: { id: 'invocations-known', label: '已知祈唤', type: 'number' },
  },
}

/** 职业表没有单独一列、但正文或已知规则给出的资源。 */
export const EXTRA_SCALES: Record<string, Array<{ id: string; label: string; type: 'number' | 'dice'; scale: Record<string, number | string> }>> = {
  '吟游诗人|PHB': [
    { id: 'bardic-inspiration', label: '吟游诗人激励', type: 'dice', scale: { '1': '1d6', '5': '1d8', '10': '1d10', '15': '1d12' } },
    { id: 'song-of-rest', label: '休憩之歌', type: 'dice', scale: { '2': '1d6', '9': '1d8', '13': '1d10', '17': '1d12' } },
  ],
  '牧师|PHB': [
    { id: 'channel-divinity', label: '引导神力', type: 'number', scale: { '2': 1, '6': 2, '18': 3 } },
  ],
  '圣武士|PHB': [
    { id: 'channel-divinity', label: '引导神力', type: 'number', scale: { '3': 1, '7': 2 } },
  ],
  '战士|PHB': [
    { id: 'action-surge', label: '动作如潮', type: 'number', scale: { '2': 1, '17': 2 } },
    { id: 'indomitable', label: '不屈', type: 'number', scale: { '9': 1, '13': 2, '17': 3 } },
    { id: 'second-wind', label: '回气', type: 'number', scale: { '1': 1 } },
  ],
  '战斗大师|PHB': [
    { id: 'superiority-dice', label: '卓越骰', type: 'dice', scale: { '3': '4d8', '7': '5d8', '10': '5d10', '15': '6d10', '18': '6d12' } },
  ],
}

export const CLASS_RITUAL: Record<string, 'book' | 'known' | 'prepared' | 'none'> = {
  '法师|PHB': 'book',
  '吟游诗人|PHB': 'known',
  '牧师|PHB': 'prepared',
  '德鲁伊|PHB': 'prepared',
  '奇械师|TCE': 'prepared',
}

export const CLASS_SPELLBOOK: Record<string, { start: number; perLevel: number }> = {
  '法师|PHB': { start: 6, perLevel: 2 },
}

/** 三分之一施法者（奥法骑士、奥法诡术师）的职业表，PHB 第 74/98 页。 */
export const THIRD_CASTER_SLOTS: number[][] = [
  [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0],
  [4, 2, 0, 0], [4, 2, 0, 0], [4, 2, 0, 0], [4, 3, 0, 0], [4, 3, 0, 0], [4, 3, 0, 0],
  [4, 3, 2, 0], [4, 3, 2, 0], [4, 3, 2, 0], [4, 3, 3, 0], [4, 3, 3, 0], [4, 3, 3, 0],
  [4, 3, 3, 1], [4, 3, 3, 1],
]
