// 库页类别登记表（P5-0 §4.5 登记草表的"中文显示名"列）：登记了的类别才在包弹窗的类别药丸里出现；没登记的（辅助数据、挂靠类）不单独列。
// 增加类别 = 加一行；顺序 = 药丸顺序。（列与摘要行字段在 U9 阶段按同一张表扩展。）
export interface CategoryDef {
  prop: string
  label: string
}

export const CATEGORIES: CategoryDef[] = [
  { prop: 'spell', label: '法术' }, { prop: 'monster', label: '怪物' }, { prop: 'object', label: '物件' }, { prop: 'vehicle', label: '载具' },
  { prop: 'vehicleUpgrade', label: '载具升级' }, { prop: 'item', label: '物品' }, { prop: 'itemProperty', label: '物品属性' }, { prop: 'itemMastery', label: '物品专精' },
  { prop: 'class', label: '职业' }, { prop: 'subclass', label: '子职' }, { prop: 'classFeature', label: '职业特性' }, { prop: 'subclassFeature', label: '子职特性' },
  { prop: 'optionalfeature', label: '可选特性' }, { prop: 'race', label: '种族' }, { prop: 'raceFeature', label: '种族特性' }, { prop: 'background', label: '背景' },
  { prop: 'feat', label: '专长' }, { prop: 'charoption', label: '角色创建选项' }, { prop: 'reward', label: '其他奖励' }, { prop: 'variantrule', label: '变体规则' },
  { prop: 'action', label: '动作' }, { prop: 'condition', label: '状态' }, { prop: 'disease', label: '疾病' }, { prop: 'status', label: '状态（其他）' },
  { prop: 'skill', label: '技能' }, { prop: 'sense', label: '视野' }, { prop: 'language', label: '语言' }, { prop: 'deity', label: '神祇' },
  { prop: 'cult', label: '异教' }, { prop: 'boon', label: '恩惠' }, { prop: 'facility', label: '据点' }, { prop: 'psionic', label: '灵能' },
  { prop: 'trap', label: '陷阱' }, { prop: 'hazard', label: '危险' }, { prop: 'deck', label: '牌组' }, { prop: 'card', label: '卡牌' },
  { prop: 'recipe', label: '食谱' }, { prop: 'crochetPattern', label: '手工艺品' }, { prop: 'table', label: '表格' }, { prop: 'tableGroup', label: '表组' },
  { prop: 'legendaryGroup', label: '传奇组' },
]

const BY_PROP = new Map(CATEGORIES.map((c, i) => [c.prop, { ...c, order: i }]))

/** 类别的中文名；没登记的返回 null（不列入药丸）。 */
export const categoryLabel = (prop: string): string | null => BY_PROP.get(prop)?.label ?? null
/** 只留登记过的类别，按登记顺序排。 */
export function registeredCategories<T extends { prop: string }>(rows: T[]): T[] {
  return rows.filter((r) => BY_PROP.has(r.prop)).sort((a, b) => (BY_PROP.get(a.prop)?.order ?? 0) - (BY_PROP.get(b.prop)?.order ?? 0))
}
