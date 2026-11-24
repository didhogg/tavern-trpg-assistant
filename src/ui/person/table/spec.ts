// 人物表格的登记（照搬 Tidy5e：列 = registry/features/columns.ts，哪页哪组显示哪些列、顺序、窄时先收谁 = registry/partitions/columns.ts，
// 每行按钮 = registry/partitions/row-actions.ts）。表格组件只按这里画，各页不再各自接列。列名是界面文字；每列读什么见 Cell.vue。
export type Domain = 'action' | 'inventory' | 'spell' | 'feature' | 'effect'
export type ColKey = 'charges' | 'uses' | 'roll' | 'formula' | 'range' | 'target' | 'time' | 'recovery' | 'featureSource' | 'price' | 'quantity' | 'weight'
  | 'capacity' | 'components' | 'school' | 'source' | 'duration'

/** 列：名字 · 宽度（rem，Tidy5e widthRems）。 */
export const COLUMNS: Record<ColKey, { label: string; rem: number }> = {
  charges: { label: '次数', rem: 4 }, uses: { label: '次数', rem: 4 }, roll: { label: '命中', rem: 3.5 }, formula: { label: '公式', rem: 5.5 },
  range: { label: '射程', rem: 5 }, target: { label: '目标', rem: 5 }, time: { label: '时间', rem: 4 }, recovery: { label: '恢复', rem: 6.25 },
  featureSource: { label: '来源', rem: 6.25 }, price: { label: '价格', rem: 5.5 }, quantity: { label: '数量', rem: 6 }, weight: { label: '重量', rem: 5 },
  capacity: { label: '容量', rem: 7 }, components: { label: '成分', rem: 5.625 }, school: { label: '学派', rem: 2.5 }, source: { label: '来源', rem: 8 },
  duration: { label: '持续', rem: 6 },
}

type Part = Partial<Record<ColKey, { order: number; priority: number }>>
/** 分区：domain → 组的物品类型（或 default）→ 列（order 排序；priority 小的先收）。 */
const P = (o: Record<string, [number, number]>): Part => Object.fromEntries(Object.entries(o).map(([k, [order, priority]]) => [k, { order, priority }]))
export const PARTITIONS: Record<Domain, Record<string, Part>> = {
  action: { default: P({ charges: [100, 500], roll: [200, 400], formula: [300, 600], range: [400, 300], target: [500, 200], time: [600, 250] }) },
  feature: { default: P({ uses: [100, 500], time: [200, 400], recovery: [400, 200], featureSource: [500, 100] }) },
  inventory: {
    consumable: P({ uses: [100, 300], time: [200, 500], price: [300, 200], quantity: [400, 400], weight: [500, 100] }),
    container: P({ capacity: [100, 200] }),
    loot: P({ price: [100, 200], quantity: [200, 300], weight: [300, 100] }),
    weapon: P({ charges: [100, 400], time: [200, 500], roll: [300, 700], formula: [400, 600], price: [500, 100], quantity: [600, 300], weight: [700, 200] }),
    default: P({ uses: [100, 400], time: [200, 500], price: [300, 100], quantity: [400, 300], weight: [500, 200] }),
  },
  spell: { default: P({ uses: [100, 200], components: [100, 300], school: [200, 100], time: [300, 500], target: [400, 400], range: [500, 600], roll: [600, 700] }) },
  effect: { default: P({ source: [100, 100], duration: [200, 200] }) },
}

/** 一组的列（按 order 排）+ 收列顺序（priority 从小到大）。 */
export function columnsFor(domain: Domain, groupType: string | null): { sorted: ColKey[]; dropOrder: ColKey[] } {
  const part = (groupType && PARTITIONS[domain][groupType]) || PARTITIONS[domain].default
  const keys = Object.keys(part) as ColKey[]
  return { sorted: [...keys].sort((a, b) => part[a]!.order - part[b]!.order), dropOrder: [...keys].sort((a, b) => part[a]!.priority - part[b]!.priority) }
}
/** 名字列至少留多宽（Tidy5e COLUMN_PRIMARY_MIN_WIDTH_REMS）；其余按宽度从低优先级开始收。 */
export const PRIMARY_MIN_REM = 15
export function hiddenColumns(widthPx: number, remPx: number, cols: { sorted: ColKey[]; dropOrder: ColKey[] }, reservedRem: number): Set<ColKey> {
  let need = cols.sorted.reduce((n, k) => n + COLUMNS[k].rem, 0) + PRIMARY_MIN_REM + reservedRem
  const avail = widthPx / remPx
  const hide = new Set<ColKey>()
  for (const k of cols.dropOrder) { if (need <= avail) break; hide.add(k); need -= COLUMNS[k].rem }
  return hide
}

/** 每行按钮（Tidy5e row-actions 分区里平时（锁定模式）就显示的那些：状态开关 + ⋯；编辑 / 删除在 Tidy5e 解锁时才出现，
 *  我们放在 ⋯ 菜单里随时可用——驾驶员 11-15 定不做锁定模式，插件窗口窄，省下的宽度留给列）。 */
export type RowAction = 'prepare' | 'attune' | 'equip' | 'menu'
export const ROW_ACTIONS: Record<Domain, RowAction[]> = {
  action: ['menu'],
  feature: ['menu'],
  inventory: ['attune', 'equip', 'menu'],
  spell: ['prepare', 'menu'],
  effect: ['menu'],
}
